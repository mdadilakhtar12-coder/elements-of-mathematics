'use strict';
/**
 * Account lifecycle: register an institute, create / reset / disable / delete staff and students.
 *
 * All functions take `deps` ({ db, auth, Timestamp }) so they can be tested against the emulators
 * without HTTP. `caller` is { uid, token } from the verified Firebase ID token.
 *
 * Passwords: only Firebase Auth ever holds one (salted scrypt hash). We never write a password,
 * plain or encoded, to Firestore, logs or error messages.
 */
const { AppError } = require('./errors');
const { checkLimit, planLimits, planFeatures, emptyUsage, DEFAULT_PLAN, getPlan } = require('./plans');
const V = require('./validate');

const MAX_BULK = 200;
/** Platform-wide cap on new institutes per day (India time): stops scripted sign-up floods and code squatting sprees. */
const MAX_REGISTRATIONS_PER_DAY = Number(process.env.MAX_REGISTRATIONS_PER_DAY) || 40;

const instRef = (db, inst) => db.collection('institutes').doc(inst);
const userRef = (db, inst, uid) => instRef(db, inst).collection('users').doc(uid);

/** True when the institute may be used right now (not suspended, not expired). */
function isLive(inst, nowMs) {
  if (!inst || inst.status !== 'active') return false;
  const exp = inst.expiresAt;
  if (exp == null) return true;
  const ms = typeof exp.toMillis === 'function' ? exp.toMillis() : Number(exp);
  return ms > nowMs;
}

function notLiveMessage(inst, nowMs) {
  if (inst.status === 'suspended') return 'This institute is suspended. Please contact support.';
  if (!isLive(inst, nowMs)) return 'This institute\'s plan has expired. Please renew to continue.';
  return 'Institute is not active.';
}

/** Loads the caller's institute + profile and checks both are usable. */
async function loadCaller(deps, caller) {
  if (!caller?.uid) throw new AppError('unauthenticated', 'Please sign in.');
  const inst = caller.token?.inst;
  if (!inst) throw new AppError('permission-denied', 'This account does not belong to an institute.');
  const [iSnap, uSnap] = await Promise.all([instRef(deps.db, inst).get(), userRef(deps.db, inst, caller.uid).get()]);
  if (!iSnap.exists || !uSnap.exists) throw new AppError('permission-denied', 'Account not found.');
  const institute = iSnap.data();
  const me = uSnap.data();
  if (me.active !== true) throw new AppError('permission-denied', 'This account has been deactivated.');
  const now = deps.now ? deps.now() : Date.now();
  if (!isLive(institute, now)) throw new AppError('failed-precondition', notLiveMessage(institute, now));
  return { inst, institute, me, uid: caller.uid };
}

// ---------------------------------------------------------------- register

/** Owner (signed in with Google / e-mail link) creates a new institute on the Free plan. */
async function registerInstitute(deps, caller, data) {
  if (!caller?.uid) throw new AppError('unauthenticated', 'Please sign in first.');
  const token = caller.token || {};
  if (token.inst) throw new AppError('already-exists', 'This account already belongs to an institute.');
  if (token.firebase?.sign_in_provider === 'anonymous' || !token.email) {
    throw new AppError('permission-denied', 'Sign in with Google or an e-mail link to register an institute.');
  }
  if (token.email_verified !== true) throw new AppError('permission-denied', 'Please verify your e-mail first.');

  const name = String(data?.name ?? '').trim();
  if (name.length < 2 || name.length > 100) throw new AppError('invalid-argument', 'Institute name must be 2-100 characters.');
  const code = V.normCode(data?.code);
  const codeErr = V.validateCode(code);
  if (codeErr) throw new AppError('invalid-argument', codeErr);

  const { db, auth, Timestamp } = deps;
  const dup = await db.collection('institutes').where('ownerUid', '==', caller.uid).limit(1).get();
  if (!dup.empty) throw new AppError('already-exists', 'You already own an institute.');

  const plan = DEFAULT_PLAN;
  const nowMs = deps.now ? deps.now() : Date.now();
  const day = new Date(nowMs + 330 * 60000).toISOString().slice(0, 10);
  const statRef = db.collection('stats').doc('registrations-' + day);
  await db.runTransaction(async (tx) => {
    const ref = instRef(db, code);
    const [existing, stat] = await Promise.all([tx.get(ref), tx.get(statRef)]);
    if (existing.exists) throw new AppError('already-exists', 'This institute code is taken. Please choose another.');
    const count = stat.exists ? stat.data().count || 0 : 0;
    if (count >= MAX_REGISTRATIONS_PER_DAY) {
      throw new AppError('resource-exhausted', 'Too many new registrations today. Please try again tomorrow or contact support.');
    }
    tx.set(statRef, { count: count + 1, day }, { merge: true });
    tx.set(ref, {
      name, code, plan, status: 'active', expiresAt: null,
      limits: planLimits(plan), features: planFeatures(plan),
      usage: { ...emptyUsage(), admin: 1 },
      ownerUid: caller.uid, ownerEmail: token.email,
      createdAt: Timestamp.fromMillis(nowMs),
    });
    tx.set(userRef(db, code, caller.uid), {
      role: 'admin', name: token.name || token.email, loginId: token.email, mobile: '',
      active: true, perms: [], createdAt: nowMs, owner: true,
    });
  });
  try {
    await auth.setCustomUserClaims(caller.uid, { inst: code, role: 'admin' });
  } catch (e) {
    await db.recursiveDelete(instRef(db, code)).catch(() => {});
    throw new AppError('internal', 'Could not finish registration. Please try again.');
  }
  return { instituteId: code, plan };
}

// ---------------------------------------------------------------- public lookup (login screen)

/** Used by the login screen: does this institute code exist, and may people log in? Reveals only the name. */
async function lookupInstitute(deps, _caller, data) {
  const code = V.normCode(data?.code);
  if (V.validateCode(code) && code.length < 3) return { exists: false };
  const snap = await instRef(deps.db, code).get();
  if (!snap.exists) return { exists: false };
  const i = snap.data();
  const now = deps.now ? deps.now() : Date.now();
  return { exists: true, name: i.name, usable: isLive(i, now), status: i.status === 'suspended' ? 'suspended' : isLive(i, now) ? 'active' : 'expired' };
}

// ---------------------------------------------------------------- create

function describeLimit(plan, role, limit) {
  const label = { admin: 'admins', subadmin: 'sub-admins', teacher: 'teachers', student: 'students' }[role];
  const planName = (() => { try { return getPlan(plan).name; } catch { return plan; } })();
  return `Your ${planName} plan allows ${limit} ${label}. Upgrade the plan to add more.`;
}

async function createOne(deps, ctx, input) {
  const { db, auth } = deps;
  const role = String(input?.role ?? '');
  if (!['admin', 'subadmin', 'teacher', 'student'].includes(role)) throw new AppError('invalid-argument', 'Unknown role.');
  if (!V.canManageRole(ctx.me, role)) throw new AppError('permission-denied', 'You are not allowed to create this kind of account.');
  const name = String(input.name ?? '').trim();
  if (name.length < 1 || name.length > 100) throw new AppError('invalid-argument', 'Please enter a name.');
  const username = V.normUsername(input.username);
  const uErr = V.validateUsername(username);
  if (uErr) throw new AppError('invalid-argument', uErr);
  const pErr = V.validatePassword(input.password, { username, mobile: input.mobile });
  if (pErr) throw new AppError('invalid-argument', pErr);

  // Cheap early check (the transaction below is the real, race-free one).
  const early = checkLimit(ctx.institute.limits, ctx.institute.usage, role);
  if (!early.ok) throw new AppError('resource-exhausted', describeLimit(ctx.institute.plan, role, early.limit));

  const email = V.loginEmail(ctx.inst, username);
  let created;
  try {
    created = await auth.createUser({ email, password: input.password, displayName: name, emailVerified: true, disabled: false });
  } catch (e) {
    if (e.code === 'auth/email-already-exists') throw new AppError('already-exists', `The username "${username}" is already taken in this institute.`);
    throw new AppError('internal', 'Could not create the login. Please try again.');
  }
  const uid = created.uid;
  const profile = { ...V.pickProfile(input, role), role, name, loginId: username, active: true, createdAt: deps.now ? deps.now() : Date.now(), createdBy: ctx.uid };

  try {
    await db.runTransaction(async (tx) => {
      const iRef = instRef(db, ctx.inst);
      const i = (await tx.get(iRef)).data();
      const now = deps.now ? deps.now() : Date.now();
      if (!isLive(i, now)) throw new AppError('failed-precondition', notLiveMessage(i, now));
      const lim = checkLimit(i.limits, i.usage, role);
      if (!lim.ok) throw new AppError('resource-exhausted', describeLimit(i.plan, role, lim.limit));
      tx.update(iRef, { [`usage.${role}`]: (i.usage?.[role] || 0) + 1 });
      tx.set(userRef(db, ctx.inst, uid), profile);
    });
    await auth.setCustomUserClaims(uid, { inst: ctx.inst, role });
  } catch (e) {
    await auth.deleteUser(uid).catch(() => {});
    await userRef(db, ctx.inst, uid).delete().catch(() => {});
    if (e instanceof AppError) throw e;
    throw new AppError('internal', 'Could not create the account. Please try again.');
  }
  return { uid, username, loginEmail: email };
}

async function createUser(deps, caller, data) {
  const ctx = await loadCaller(deps, caller);
  return createOne(deps, ctx, data);
}

/** Bulk create (e.g. Excel import). Returns one result per input row; a failing row never stops the others. */
async function createUsers(deps, caller, data) {
  const ctx = await loadCaller(deps, caller);
  const rows = Array.isArray(data?.users) ? data.users : [];
  if (rows.length === 0) throw new AppError('invalid-argument', 'No users to create.');
  if (rows.length > MAX_BULK) throw new AppError('invalid-argument', `At most ${MAX_BULK} users per call.`);
  const results = [];
  for (const row of rows) {
    try {
      const fresh = await loadCaller(deps, caller); // limits/usage move while we loop
      results.push({ username: V.normUsername(row?.username), ok: true, ...(await createOne(deps, fresh, row)) });
    } catch (e) {
      const err = e instanceof AppError ? e : new AppError('internal', 'Failed.');
      results.push({ username: V.normUsername(row?.username), ok: false, code: err.code, error: err.message });
    }
  }
  return { results, created: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length };
}

// ---------------------------------------------------------------- manage

async function loadTarget(deps, ctx, uid) {
  if (typeof uid !== 'string' || !uid) throw new AppError('invalid-argument', 'Missing user.');
  const snap = await userRef(deps.db, ctx.inst, uid).get();
  if (!snap.exists) throw new AppError('not-found', 'User not found.');
  const target = snap.data();
  if (!V.canManageRole(ctx.me, target.role)) throw new AppError('permission-denied', 'You are not allowed to manage this account.');
  if (uid === ctx.institute.ownerUid && uid !== ctx.uid) throw new AppError('permission-denied', 'The owner account cannot be managed by others.');
  return target;
}

/** Sets a new password. Without `password` a random one is generated and returned once. It is never stored. */
async function resetPassword(deps, caller, data) {
  const ctx = await loadCaller(deps, caller);
  const uid = data?.uid;
  const target = await loadTarget(deps, ctx, uid);
  const generated = data?.password == null;
  const password = generated ? V.randomPassword() : data.password;
  const pErr = V.validatePassword(password, { username: target.loginId, mobile: target.mobile });
  if (pErr) throw new AppError('invalid-argument', pErr);
  await deps.auth.updateUser(uid, { password });
  await deps.auth.revokeRefreshTokens(uid);
  return generated ? { uid, password } : { uid };
}

async function setUserActive(deps, caller, data) {
  const ctx = await loadCaller(deps, caller);
  const uid = data?.uid;
  const active = data?.active === true;
  await loadTarget(deps, ctx, uid);
  if (uid === ctx.uid) throw new AppError('failed-precondition', 'You cannot deactivate your own account.');
  if (uid === ctx.institute.ownerUid) throw new AppError('failed-precondition', 'The owner account cannot be deactivated.');
  await userRef(deps.db, ctx.inst, uid).update({ active });
  await deps.auth.updateUser(uid, { disabled: !active });
  if (!active) await deps.auth.revokeRefreshTokens(uid);
  return { uid, active };
}

async function deleteUser(deps, caller, data) {
  const ctx = await loadCaller(deps, caller);
  const uid = data?.uid;
  const target = await loadTarget(deps, ctx, uid);
  if (uid === ctx.uid) throw new AppError('failed-precondition', 'You cannot delete your own account.');
  if (uid === ctx.institute.ownerUid) throw new AppError('failed-precondition', 'The owner account cannot be deleted.');
  const { db } = deps;
  await db.runTransaction(async (tx) => {
    const iRef = instRef(db, ctx.inst);
    const i = (await tx.get(iRef)).data();
    tx.delete(userRef(db, ctx.inst, uid));
    const upd = { [`usage.${target.role}`]: Math.max(0, (i.usage?.[target.role] || 0) - 1) };
    // a teacher who was also a sub-admin held a sub-admin slot too
    if (target.role === 'teacher' && target.alsoSubadmin === true) upd['usage.subadmin'] = Math.max(0, (i.usage?.subadmin || 0) - 1);
    tx.update(iRef, upd);
  });
  try {
    await deps.auth.deleteUser(uid);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw new AppError('internal', 'The profile was removed but the login could not be deleted. Contact support.');
  }
  return { uid };
}

/**
 * Admin only: gives a teacher sub-admin rights as well (they stay a teacher), changes those rights, or takes them away.
 * data: { uid, enable: boolean, perms: string[] }. A teacher with sub-admin rights uses one sub-admin slot of the plan.
 */
async function setTeacherAdmin(deps, caller, data) {
  const ctx = await loadCaller(deps, caller);
  if (ctx.me.role !== 'admin') throw new AppError('permission-denied', 'Only the admin can do this.');
  const uid = data?.uid;
  if (typeof uid !== 'string' || !uid) throw new AppError('invalid-argument', 'Missing user.');
  const enable = data?.enable === true;
  const perms = Array.isArray(data?.perms) ? [...new Set(data.perms.filter((p) => V.SUBADMIN_PERMS.includes(p)))] : [];
  if (enable && perms.length === 0) throw new AppError('invalid-argument', 'Choose at least one permission.');
  const { db } = deps;
  await db.runTransaction(async (tx) => {
    const iRef = instRef(db, ctx.inst);
    const uRef = userRef(db, ctx.inst, uid);
    const [iSnap, uSnap] = await Promise.all([tx.get(iRef), tx.get(uRef)]);
    if (!uSnap.exists) throw new AppError('not-found', 'User not found.');
    const u = uSnap.data();
    const i = iSnap.data();
    if (u.role !== 'teacher') throw new AppError('failed-precondition', 'Only a teacher can be made a sub-admin this way.');
    const was = u.alsoSubadmin === true;
    const used = i.usage?.subadmin || 0;
    if (enable && !was) {
      const lim = checkLimit(i.limits, i.usage, 'subadmin');
      if (!lim.ok) throw new AppError('resource-exhausted', describeLimit(i.plan, 'subadmin', lim.limit));
      tx.update(iRef, { 'usage.subadmin': used + 1 });
    } else if (!enable && was) {
      tx.update(iRef, { 'usage.subadmin': Math.max(0, used - 1) });
    }
    tx.update(uRef, { alsoSubadmin: enable, perms: enable ? perms : [] });
  });
  return { uid, alsoSubadmin: enable, perms: enable ? perms : [] };
}

module.exports = { setTeacherAdmin, MAX_REGISTRATIONS_PER_DAY, registerInstitute, lookupInstitute, createUser, createUsers, resetPassword, setUserActive, deleteUser, isLive, loadCaller, MAX_BULK };
