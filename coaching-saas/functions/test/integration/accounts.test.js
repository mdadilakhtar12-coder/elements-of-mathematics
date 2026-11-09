'use strict';
// Needs the Auth + Firestore emulators:  npm run test:functions
const { test, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'demo-coachsaas';

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const A = require('../../src/accounts');
const SA = require('../../src/sa');
const { AppError } = require('../../src/errors');

initializeApp({ projectId: 'demo-coachsaas' });
const db = getFirestore();
const auth = getAuth();
let clock = Date.now();
const deps = { db, auth, Timestamp, now: () => clock };

const tokenFor = (uid, email = `${uid}@gmail.com`, extra = {}) => ({ uid, token: { email, email_verified: true, name: uid, firebase: { sign_in_provider: 'google.com' }, ...extra } });
const rejects = (p, code) => assert.rejects(p, (e) => e instanceof AppError && (!code || e.code === code), `expected AppError ${code}`);

async function wipe() {
  clock = Date.now();
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-coachsaas/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-coachsaas/accounts`, { method: 'DELETE' });
}

/** Registers an institute and returns a caller (admin) whose token carries the claims the real token would. */
async function setup(code = 'alpha', owner = 'owner1') {
  await auth.createUser({ uid: owner, email: `${owner}@gmail.com`, emailVerified: true });
  await A.registerInstitute(deps, tokenFor(owner), { name: 'Alpha Academy', code });
  return tokenFor(owner, undefined, { inst: code, role: 'admin' });
}
const asUser = (uid, inst, role) => tokenFor(uid, `${uid}@x`, { inst, role });
const student = (n, extra = {}) => ({ role: 'student', name: 'S' + n, username: 'stu' + n, password: 'password' + n, ...extra });

beforeEach(wipe);

test('registerInstitute: creates Free institute, owner profile and claims', async () => {
  await auth.createUser({ uid: 'o', email: 'o@gmail.com', emailVerified: true });
  const r = await A.registerInstitute(deps, tokenFor('o'), { name: ' Alpha ', code: 'Alpha-1' });
  assert.equal(r.instituteId, 'alpha-1');
  const i = (await db.doc('institutes/alpha-1').get()).data();
  assert.equal(i.plan, 'free'); assert.equal(i.status, 'active'); assert.equal(i.ownerUid, 'o');
  assert.deepEqual(i.limits, { admin: 1, subadmin: 1, teacher: 5, student: 30 });
  assert.equal(i.usage.admin, 1); assert.equal(i.features.fees, false); assert.equal(i.features.core, true);
  const u = (await db.doc('institutes/alpha-1/users/o').get()).data();
  assert.equal(u.role, 'admin'); assert.equal(u.active, true);
  assert.deepEqual((await auth.getUser('o')).customClaims, { inst: 'alpha-1', role: 'admin' });
});

test('registerInstitute: rejects duplicates, bad codes, unverified, repeat owners', async () => {
  await setup('alpha');
  await auth.createUser({ uid: 'o2', email: 'o2@gmail.com', emailVerified: true });
  await rejects(A.registerInstitute(deps, tokenFor('o2'), { name: 'Xylo Classes', code: 'alpha' }), 'already-exists');
  await rejects(A.registerInstitute(deps, tokenFor('o2'), { name: 'Good name', code: 'a b' }), 'invalid-argument');
  await rejects(A.registerInstitute(deps, tokenFor('o2'), { name: 'Good name', code: 'admin' }), 'invalid-argument');
  await rejects(A.registerInstitute(deps, tokenFor('o2', undefined, { email_verified: false }), { name: 'Good', code: 'beta' }), 'permission-denied');
  await rejects(A.registerInstitute(deps, { uid: undefined }, { name: 'Good', code: 'beta' }), 'unauthenticated');
  await rejects(A.registerInstitute(deps, tokenFor('owner1', undefined, { inst: 'alpha' }), { name: 'Good', code: 'beta' }), 'already-exists');
});

test('createUser: student can sign in material exists, password is hashed by Auth and never stored', async () => {
  const admin = await setup();
  const r = await A.createUser(deps, admin, student(1, { rollNo: '7', monthlyFee: 500 }));
  assert.equal(r.loginEmail, 'stu1@alpha.login.coachsaas.app');
  const u = (await db.doc(`institutes/alpha/users/${r.uid}`).get()).data();
  assert.equal(u.role, 'student'); assert.equal(u.loginId, 'stu1'); assert.equal(u.rollNo, '7');
  assert.equal(JSON.stringify(u).includes('password1'), false);
  const dump = JSON.stringify((await db.collection('institutes').doc('alpha').collection('users').get()).docs.map((d) => d.data()));
  assert.equal(dump.includes('password'), false);
  assert.deepEqual((await auth.getUser(r.uid)).customClaims, { inst: 'alpha', role: 'student' });
  assert.equal((await db.doc('institutes/alpha').get()).data().usage.student, 1);
});

test('createUser: same username allowed in different institutes, not twice in one', async () => {
  const a = await setup('alpha', 'oa');
  const b = await setup('beta', 'ob');
  await A.createUser(deps, a, student(1));
  await A.createUser(deps, b, student(1));
  await rejects(A.createUser(deps, a, student(1)), 'already-exists');
});

test('FREE plan limits are enforced on the server: 30 students, 5 teachers, 1 sub-admin, 1 admin', async () => {
  const admin = await setup();
  for (let i = 1; i <= 30; i++) await A.createUser(deps, admin, student(i));
  await rejects(A.createUser(deps, admin, student(31)), 'resource-exhausted');
  for (let i = 1; i <= 5; i++) await A.createUser(deps, admin, { role: 'teacher', name: 'T' + i, username: 'teach' + i, password: 'password123' });
  await rejects(A.createUser(deps, admin, { role: 'teacher', name: 'T6', username: 'teach6', password: 'password123' }), 'resource-exhausted');
  await A.createUser(deps, admin, { role: 'subadmin', name: 'Sub', username: 'sub1', password: 'password123', perms: ['users'] });
  await rejects(A.createUser(deps, admin, { role: 'subadmin', name: 'Sub2', username: 'sub2', password: 'password123' }), 'resource-exhausted');
  await rejects(A.createUser(deps, admin, { role: 'admin', name: 'Adm2', username: 'adm2', password: 'password123' }), 'resource-exhausted');
  const i = (await db.doc('institutes/alpha').get()).data();
  assert.deepEqual(i.usage, { admin: 1, subadmin: 1, teacher: 5, student: 30 });
  // a refused attempt leaves no orphan login behind
  await rejects(auth.getUserByEmail('stu31@alpha.login.coachsaas.app'), undefined).catch(() => {});
  await assert.rejects(auth.getUserByEmail('stu31@alpha.login.coachsaas.app'));
});

test('limits hold under concurrency (race-free transaction)', async () => {
  const admin = await setup();
  await SA_setLimit('alpha', { student: 3 });
  const res = await Promise.allSettled(Array.from({ length: 8 }, (_, i) => A.createUser(deps, admin, student(i + 1))));
  assert.equal(res.filter((r) => r.status === 'fulfilled').length, 3);
  assert.equal((await db.doc('institutes/alpha').get()).data().usage.student, 3);
  assert.equal((await auth.listUsers()).users.filter((u) => u.email.startsWith('stu')).length, 3, 'no orphan logins');
});
async function SA_setLimit(inst, limits) { await db.doc(`institutes/${inst}`).update(Object.fromEntries(Object.entries(limits).map(([k, v]) => [`limits.${k}`, v]))); }

test('permissions: sub-admin with "users" creates students/teachers only; teacher and student cannot create', async () => {
  const admin = await setup();
  const sub = await A.createUser(deps, admin, { role: 'subadmin', name: 'Sub', username: 'sub1', password: 'password123', perms: ['users'] });
  const noPerm = await A.createUser(deps, admin, { role: 'teacher', name: 'T', username: 'teach1', password: 'password123' });
  const subCaller = asUser(sub.uid, 'alpha', 'subadmin');
  await A.createUser(deps, subCaller, student(1));
  await rejects(A.createUser(deps, subCaller, { role: 'subadmin', name: 'x', username: 'subx', password: 'password123' }), 'permission-denied');
  await rejects(A.createUser(deps, asUser(noPerm.uid, 'alpha', 'teacher'), student(2)), 'permission-denied');
  await rejects(A.createUser(deps, { uid: 'ghost', token: { inst: 'alpha' } }, student(3)), 'permission-denied');
  await rejects(A.createUser(deps, { uid: undefined }, student(4)), 'unauthenticated');
});

test('a user of institute A cannot manage users of institute B', async () => {
  const a = await setup('alpha', 'oa');
  const b = await setup('beta', 'ob');
  const s = await A.createUser(deps, b, student(1));
  await rejects(A.resetPassword(deps, a, { uid: s.uid, password: 'newpassword1' }), 'not-found');
  await rejects(A.deleteUser(deps, a, { uid: s.uid }), 'not-found');
  await rejects(A.setUserActive(deps, a, { uid: s.uid, active: false }), 'not-found');
});

test('resetPassword: sets a new password (Auth only), generated one is returned once; owner is protected', async () => {
  const admin = await setup();
  const s = await A.createUser(deps, admin, student(1));
  const r1 = await A.resetPassword(deps, admin, { uid: s.uid });
  assert.match(r1.password, /^.{10}$/);
  const r2 = await A.resetPassword(deps, admin, { uid: s.uid, password: 'brandnewpass1' });
  assert.equal(r2.password, undefined);
  await rejects(A.resetPassword(deps, admin, { uid: s.uid, password: 'short' }), 'invalid-argument');
  const t = await A.createUser(deps, admin, { role: 'teacher', name: 'T', username: 'teach1', password: 'password123' });
  const sub = await A.createUser(deps, admin, { role: 'subadmin', name: 'Sub', username: 'sub1', password: 'password123', perms: ['users'] });
  await rejects(A.resetPassword(deps, asUser(sub.uid, 'alpha', 'subadmin'), { uid: 'owner1', password: 'password123' }), 'permission-denied');
  await rejects(A.resetPassword(deps, asUser(t.uid, 'alpha', 'teacher'), { uid: s.uid }), 'permission-denied');
  const all = JSON.stringify((await db.collection('institutes').doc('alpha').collection('users').get()).docs.map((d) => d.data()));
  assert.equal(all.includes(r1.password), false);
});

test('setUserActive disables the login; deleteUser frees the plan slot', async () => {
  const admin = await setup();
  const s = await A.createUser(deps, admin, student(1));
  await A.setUserActive(deps, admin, { uid: s.uid, active: false });
  assert.equal((await auth.getUser(s.uid)).disabled, true);
  assert.equal((await db.doc(`institutes/alpha/users/${s.uid}`).get()).data().active, false);
  await A.setUserActive(deps, admin, { uid: s.uid, active: true });
  assert.equal((await auth.getUser(s.uid)).disabled, false);
  await rejects(A.setUserActive(deps, admin, { uid: 'owner1', active: false }), 'failed-precondition');
  await rejects(A.deleteUser(deps, admin, { uid: 'owner1' }), 'failed-precondition');
  await A.deleteUser(deps, admin, { uid: s.uid });
  assert.equal((await db.doc('institutes/alpha').get()).data().usage.student, 0);
  assert.equal((await db.doc(`institutes/alpha/users/${s.uid}`).get()).exists, false);
  await assert.rejects(auth.getUser(s.uid));
});

test('suspended / expired institutes cannot create or manage accounts', async () => {
  const admin = await setup();
  const s = await A.createUser(deps, admin, student(1));
  await db.doc('institutes/alpha').update({ status: 'suspended' });
  await rejects(A.createUser(deps, admin, student(2)), 'failed-precondition');
  await rejects(A.resetPassword(deps, admin, { uid: s.uid }), 'failed-precondition');
  assert.deepEqual(await A.lookupInstitute(deps, null, { code: 'alpha' }), { exists: true, name: 'Alpha Academy', usable: false, status: 'suspended' });
  await db.doc('institutes/alpha').update({ status: 'active', expiresAt: Timestamp.fromMillis(clock - 1000) });
  await rejects(A.createUser(deps, admin, student(2)), 'failed-precondition');
  assert.equal((await A.lookupInstitute(deps, null, { code: 'alpha' })).status, 'expired');
  await db.doc('institutes/alpha').update({ expiresAt: Timestamp.fromMillis(clock + 100000) });
  await A.createUser(deps, admin, student(2));
  assert.deepEqual(await A.lookupInstitute(deps, null, { code: 'nope-x' }), { exists: false });
});

test('createUsers (bulk): per-row results, stops exactly at the plan limit', async () => {
  const admin = await setup();
  await SA_setLimit('alpha', { student: 3 });
  const rows = [student(1), student(2), { ...student(3), username: 'x' }, student(1), student(5), student(6)];
  const r = await A.createUsers(deps, admin, { users: rows });
  assert.equal(r.created, 3);
  assert.equal(r.results[2].code, 'invalid-argument');
  assert.equal(r.results[3].code, 'already-exists');
  assert.equal(r.results[5].code, 'resource-exhausted');
  await rejects(A.createUsers(deps, admin, { users: [] }), 'invalid-argument');
});

test('super admin: plan change, feature toggle, limits, suspend, expiry, recount, audit; others refused', async () => {
  const admin = await setup();
  const root = tokenFor('root', undefined, { sa: true });
  await rejects(SA.setPlan(deps, admin, { inst: 'alpha', plan: 'pro' }), 'permission-denied');
  await SA.setPlan(deps, root, { inst: 'alpha', plan: 'basic' });
  let i = (await db.doc('institutes/alpha').get()).data();
  assert.equal(i.plan, 'basic'); assert.equal(i.features.fees, true); assert.equal(i.limits.student, 200);
  await SA.setFeatures(deps, root, { inst: 'alpha', features: { fees: false, accounts: true, core: false } });
  i = (await db.doc('institutes/alpha').get()).data();
  assert.equal(i.features.fees, false); assert.equal(i.features.accounts, true); assert.equal(i.features.core, true);
  await rejects(SA.setFeatures(deps, root, { inst: 'alpha', features: { nope: true } }), 'invalid-argument');
  await SA.setLimits(deps, root, { inst: 'alpha', limits: { student: 2 } });
  await A.createUser(deps, admin, student(1)); await A.createUser(deps, admin, student(2));
  await rejects(A.createUser(deps, admin, student(3)), 'resource-exhausted');
  await rejects(SA.setLimits(deps, root, { inst: 'alpha', limits: { student: -1 } }), 'invalid-argument');
  await SA.setStatus(deps, root, { inst: 'alpha', status: 'suspended', reason: 'unpaid' });
  assert.equal((await db.doc('institutes/alpha').get()).data().statusReason, 'unpaid');
  await SA.setStatus(deps, root, { inst: 'alpha', status: 'active' });
  await SA.setExpiry(deps, root, { inst: 'alpha', expiresAt: clock + 5000 });
  assert.ok((await db.doc('institutes/alpha').get()).data().expiresAt instanceof Timestamp);
  await SA.setExpiry(deps, root, { inst: 'alpha', expiresAt: null });
  await db.doc('institutes/alpha').update({ usage: { admin: 9, subadmin: 9, teacher: 9, student: 9 } });
  assert.deepEqual((await SA.recountUsage(deps, root, { inst: 'alpha' })).usage, { admin: 1, subadmin: 0, teacher: 0, student: 2 });
  const list = await SA.listInstitutes(deps, root, {});
  assert.equal(list.institutes[0].id, 'alpha');
  assert.ok((await db.collection('audit').get()).size >= 6);
});
