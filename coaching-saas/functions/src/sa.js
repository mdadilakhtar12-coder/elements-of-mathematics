'use strict';
/**
 * Super-admin operations (platform owner only: custom claim `sa: true`).
 * Plan, feature, limit, status and expiry changes happen here and nowhere else;
 * firestore.rules refuses every client write to institute documents.
 */
const { AppError } = require('./errors');
const { PLANS, FEATURE_KEYS, ROLES, planLimits, planFeatures, emptyUsage } = require('./plans');
const { normCode } = require('./validate');

function requireSuper(caller) {
  if (!caller?.uid) throw new AppError('unauthenticated', 'Please sign in.');
  if (caller.token?.sa !== true) throw new AppError('permission-denied', 'Super admin only.');
}

async function loadInst(deps, data) {
  const id = normCode(data?.inst);
  if (!id) throw new AppError('invalid-argument', 'Missing institute.');
  const ref = deps.db.collection('institutes').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new AppError('not-found', 'Institute not found.');
  return { id, ref, data: snap.data() };
}

async function audit(deps, caller, action, inst, detail) {
  await deps.db.collection('audit').add({ by: caller.uid, action, inst, detail: detail ?? null, at: deps.Timestamp.now() });
}

const toMs = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : t ?? null);

function summary(id, d) {
  return {
    id, name: d.name, plan: d.plan, status: d.status, statusReason: d.statusReason ?? '',
    expiresAt: toMs(d.expiresAt), createdAt: toMs(d.createdAt), ownerEmail: d.ownerEmail ?? '',
    usage: d.usage ?? emptyUsage(), limits: d.limits ?? {}, features: d.features ?? {},
  };
}

async function listInstitutes(deps, caller, data) {
  requireSuper(caller);
  const limit = Math.min(Math.max(parseInt(data?.limit, 10) || 200, 1), 500);
  const snap = await deps.db.collection('institutes').orderBy('createdAt', 'desc').limit(limit).get();
  return { institutes: snap.docs.map((d) => summary(d.id, d.data())) };
}

/** Switching plan resets limits and features to that plan's defaults (drops per-institute overrides). */
async function setPlan(deps, caller, data) {
  requireSuper(caller);
  const plan = String(data?.plan ?? '');
  if (!PLANS[plan]) throw new AppError('invalid-argument', 'Unknown plan.');
  const i = await loadInst(deps, data);
  await i.ref.update({ plan, limits: planLimits(plan), features: planFeatures(plan) });
  await audit(deps, caller, 'setPlan', i.id, { from: i.data.plan, to: plan });
  return { inst: i.id, plan };
}

async function setFeatures(deps, caller, data) {
  requireSuper(caller);
  const f = data?.features;
  if (!f || typeof f !== 'object') throw new AppError('invalid-argument', 'Missing features.');
  const update = {};
  for (const [k, v] of Object.entries(f)) {
    if (!FEATURE_KEYS.includes(k)) throw new AppError('invalid-argument', `Unknown feature: ${k}`);
    if (k === 'core') continue; // core can never be switched off
    update[`features.${k}`] = v === true;
  }
  const i = await loadInst(deps, data);
  await i.ref.update(update);
  await audit(deps, caller, 'setFeatures', i.id, f);
  return { inst: i.id };
}

async function setLimits(deps, caller, data) {
  requireSuper(caller);
  const l = data?.limits;
  if (!l || typeof l !== 'object') throw new AppError('invalid-argument', 'Missing limits.');
  const update = {};
  for (const [role, n] of Object.entries(l)) {
    if (!ROLES.includes(role)) throw new AppError('invalid-argument', `Unknown role: ${role}`);
    if (!Number.isInteger(n) || n < 0 || n > 100000) throw new AppError('invalid-argument', 'Limits must be whole numbers 0-100000.');
    update[`limits.${role}`] = n;
  }
  const i = await loadInst(deps, data);
  await i.ref.update(update);
  await audit(deps, caller, 'setLimits', i.id, l);
  return { inst: i.id };
}

async function setStatus(deps, caller, data) {
  requireSuper(caller);
  const status = data?.status;
  if (!['active', 'suspended'].includes(status)) throw new AppError('invalid-argument', 'Status must be active or suspended.');
  const i = await loadInst(deps, data);
  await i.ref.update({ status, statusReason: status === 'suspended' ? String(data?.reason ?? '').slice(0, 300) : '' });
  await audit(deps, caller, 'setStatus', i.id, { status, reason: data?.reason ?? '' });
  return { inst: i.id, status };
}

/** expiresAt: milliseconds since epoch, or null for "never expires". */
async function setExpiry(deps, caller, data) {
  requireSuper(caller);
  const v = data?.expiresAt;
  if (v !== null && !(Number.isFinite(v) && v > 0)) throw new AppError('invalid-argument', 'expiresAt must be milliseconds or null.');
  const i = await loadInst(deps, data);
  await i.ref.update({ expiresAt: v === null ? null : deps.Timestamp.fromMillis(v) });
  await audit(deps, caller, 'setExpiry', i.id, { expiresAt: v });
  return { inst: i.id, expiresAt: v };
}

/** Recomputes usage counters from the real user documents (fixes any drift). */
async function recountUsage(deps, caller, data) {
  requireSuper(caller);
  const i = await loadInst(deps, data);
  const users = await i.ref.collection('users').select('role').get();
  const usage = emptyUsage();
  users.forEach((d) => { const r = d.get('role'); if (r in usage) usage[r]++; });
  await i.ref.update({ usage });
  await audit(deps, caller, 'recountUsage', i.id, usage);
  return { inst: i.id, usage };
}

module.exports = { listInstitutes, setPlan, setFeatures, setLimits, setStatus, setExpiry, recountUsage };
