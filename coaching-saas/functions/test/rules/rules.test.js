'use strict';
// Run with: npm run test:rules  (starts the Firestore emulator)
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, Timestamp } = require('firebase/firestore');

let env;
const FREE = { core: true, student_login: true, exams: false, fees: false, accounts: false, study: false, doubts: false, leaves: false };
const PRO = { core: true, student_login: true, exams: true, fees: true, accounts: true, study: true, doubts: true, leaves: true };

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-coachsaas',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '../../../firestore.rules'), 'utf8') },
  });
});
after(async () => env.cleanup());

const past = () => Timestamp.fromMillis(Date.now() - 86400000);
const future = () => Timestamp.fromMillis(Date.now() + 86400000);

async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'institutes/a'), { name: 'A', status: 'active', features: PRO, plan: 'pro' });
    await setDoc(doc(db, 'institutes/b'), { name: 'B', status: 'active', features: FREE, plan: 'free' });
    await setDoc(doc(db, 'institutes/sus'), { name: 'S', status: 'suspended', features: PRO });
    await setDoc(doc(db, 'institutes/exp'), { name: 'E', status: 'active', features: PRO, expiresAt: past() });
    await setDoc(doc(db, 'institutes/ok'), { name: 'OK', status: 'active', features: PRO, expiresAt: future() });
    const mk = (inst, uid, role, extra = {}) =>
      setDoc(doc(db, `institutes/${inst}/users/${uid}`), { role, active: true, name: uid, loginId: uid, ...extra });
    await mk('a', 'adminA', 'admin');
    await mk('a', 'subA', 'subadmin', { perms: ['batches'] });
    await mk('a', 'teachA', 'teacher');
    await mk('a', 'stuA', 'student', { batchIds: ['b1'] });
    await mk('a', 'stuA2', 'student');
    await mk('a', 'offA', 'student', { active: false });
    await mk('b', 'adminB', 'admin');
    await mk('b', 'stuB', 'student');
    await mk('sus', 'adminS', 'admin');
    await mk('exp', 'adminE', 'admin');
    await mk('ok', 'adminOK', 'admin');
    await setDoc(doc(db, 'institutes/a/batches/b1'), { name: 'Batch 1' });
    await setDoc(doc(db, 'institutes/b/batches/b1'), { name: 'Secret B batch' });
    await setDoc(doc(db, 'institutes/a/fees/f1'), { studentId: 'stuA', amount: 100 });
    await setDoc(doc(db, 'institutes/a/fees/f2'), { studentId: 'stuA2', amount: 200 });
    await setDoc(doc(db, 'institutes/b/exams/e1'), { name: 'x' });
  });
}
beforeEach(seed);

const as = (inst, uid) => env.authenticatedContext(uid, { inst }).firestore();

test('tenant isolation: users cannot read or write another institute', async () => {
  await assertSucceeds(getDoc(doc(as('a', 'adminA'), 'institutes/a/batches/b1')));
  await assertFails(getDoc(doc(as('a', 'adminA'), 'institutes/b/batches/b1')));
  await assertFails(setDoc(doc(as('a', 'adminA'), 'institutes/b/batches/new'), { name: 'hack' }));
  await assertFails(getDocs(collection(as('a', 'adminA'), 'institutes/b/batches')));
  await assertFails(getDoc(doc(as('a', 'adminA'), 'institutes/b/users/adminB')));
});

test('a token with a forged institute but no matching user doc gets nothing', async () => {
  // claims say inst=b but the uid has no profile there
  await assertFails(getDoc(doc(as('b', 'adminA'), 'institutes/b/batches/b1')));
});

test('signed-out users get nothing', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'institutes/a/batches/b1')));
  await assertFails(getDoc(doc(db, 'institutes/a')));
  await assertFails(getDoc(doc(db, 'plans/free')));
});

test('institute document and plan data cannot be changed from the app', async () => {
  const db = as('a', 'adminA');
  await assertSucceeds(getDoc(doc(db, 'institutes/a')));
  await assertFails(updateDoc(doc(db, 'institutes/a'), { plan: 'pro' }));
  await assertFails(updateDoc(doc(db, 'institutes/a'), { 'features.exams': true }));
  await assertFails(updateDoc(doc(db, 'institutes/a'), { status: 'active' }));
  await assertFails(setDoc(doc(db, 'plans/free'), { limits: { student: 99999 } }));
});

test('accounts cannot be created or deleted from the app (limits live in Cloud Functions)', async () => {
  const db = as('a', 'adminA');
  await assertFails(setDoc(doc(db, 'institutes/a/users/newStudent'), { role: 'student', active: true, name: 'x' }));
  await assertFails(deleteDoc(doc(db, 'institutes/a/users/stuA')));
});

test('protected profile fields cannot change; allowed ones can', async () => {
  const db = as('a', 'adminA');
  await assertSucceeds(updateDoc(doc(db, 'institutes/a/users/stuA'), { name: 'New Name', monthlyFee: 500 }));
  await assertFails(updateDoc(doc(db, 'institutes/a/users/stuA'), { role: 'admin' }));
  await assertFails(updateDoc(doc(db, 'institutes/a/users/stuA'), { active: false }));
  await assertFails(updateDoc(doc(db, 'institutes/a/users/stuA'), { loginId: 'other' }));
});

test('students cannot edit profiles; sub-admin without "users" cannot either, but can set batchIds', async () => {
  await assertFails(updateDoc(doc(as('a', 'stuA'), 'institutes/a/users/stuA'), { name: 'x' }));
  const sub = as('a', 'subA');
  await assertFails(updateDoc(doc(sub, 'institutes/a/users/teachA'), { name: 'x' }));
  await assertSucceeds(updateDoc(doc(sub, 'institutes/a/users/stuA'), { batchIds: ['b1'] }));
  await assertFails(updateDoc(doc(sub, 'institutes/a/users/stuA'), { name: 'x' }));
});

test('roles: batches are admin / permitted sub-admin only; teacher and student read only', async () => {
  await assertSucceeds(setDoc(doc(as('a', 'adminA'), 'institutes/a/batches/n1'), { name: 'n' }));
  await assertSucceeds(setDoc(doc(as('a', 'subA'), 'institutes/a/batches/n2'), { name: 'n' }));
  await assertFails(setDoc(doc(as('a', 'teachA'), 'institutes/a/batches/n3'), { name: 'n' }));
  await assertFails(setDoc(doc(as('a', 'stuA'), 'institutes/a/batches/n4'), { name: 'n' }));
  await assertSucceeds(getDoc(doc(as('a', 'stuA'), 'institutes/a/batches/b1')));
});

test('deactivated users are locked out', async () => {
  await assertFails(getDoc(doc(as('a', 'offA'), 'institutes/a/batches/b1')));
});

test('suspended institute: members blocked, can still read the institute doc to see why', async () => {
  const db = as('sus', 'adminS');
  await assertSucceeds(getDoc(doc(db, 'institutes/sus')));
  await assertFails(getDoc(doc(db, 'institutes/sus/batches/b1')));
  await assertFails(setDoc(doc(db, 'institutes/sus/batches/b1'), { name: 'x' }));
});

test('expired institute is blocked; not-yet-expired works', async () => {
  await assertFails(setDoc(doc(as('exp', 'adminE'), 'institutes/exp/batches/b1'), { name: 'x' }));
  await assertSucceeds(setDoc(doc(as('ok', 'adminOK'), 'institutes/ok/batches/b1'), { name: 'x' }));
});

test('feature gating: Free plan cannot touch fees / exams even as admin; Pro can', async () => {
  await assertFails(setDoc(doc(as('b', 'adminB'), 'institutes/b/exams/e2'), { name: 'x' }));
  await assertFails(getDoc(doc(as('b', 'adminB'), 'institutes/b/exams/e1')));
  await assertFails(setDoc(doc(as('b', 'adminB'), 'institutes/b/fees/f9'), { studentId: 'stuB' }));
  await assertSucceeds(setDoc(doc(as('a', 'adminA'), 'institutes/a/exams/e2'), { name: 'x' }));
  await assertSucceeds(setDoc(doc(as('a', 'adminA'), 'institutes/a/fees/f9'), { studentId: 'stuA', createdBy: 'adminA' }));
});

test('fees: a student sees only their own', async () => {
  const stu = as('a', 'stuA');
  await assertSucceeds(getDoc(doc(stu, 'institutes/a/fees/f1')));
  await assertFails(getDoc(doc(stu, 'institutes/a/fees/f2')));
  await assertFails(setDoc(doc(stu, 'institutes/a/fees/f3'), { studentId: 'stuA', amount: 0 }));
});

test('super admin can read institutes but not tenant data', async () => {
  const sa = env.authenticatedContext('root', { sa: true }).firestore();
  await assertSucceeds(getDoc(doc(sa, 'institutes/a')));
  await assertFails(updateDoc(doc(sa, 'institutes/a'), { plan: 'free' }));
  await assertFails(getDoc(doc(sa, 'institutes/a/batches/b1')));
});

test('students can post their own doubt only', async () => {
  const stu = as('a', 'stuA');
  await assertSucceeds(setDoc(doc(stu, 'institutes/a/doubts/d1'), { studentId: 'stuA', question: 'q' }));
  await assertFails(setDoc(doc(stu, 'institutes/a/doubts/d2'), { studentId: 'stuA2', question: 'q' }));
});

test('push devices: a user registers only their own device and cannot read others', async () => {
  const stu = as('a', 'stuA');
  await assertSucceeds(setDoc(doc(stu, 'institutes/a/devices/tokA'), { uid: 'stuA', role: 'student', platform: 'android', updatedAt: 1 }));
  await assertFails(setDoc(doc(stu, 'institutes/a/devices/tokB'), { uid: 'stuA2', role: 'student' }));
  await assertFails(setDoc(doc(stu, 'institutes/a/devices/tokC'), { uid: 'stuA', secret: 'x' }));
  await assertSucceeds(getDoc(doc(stu, 'institutes/a/devices/tokA')));
  await assertFails(getDoc(doc(as('a', 'teachA'), 'institutes/a/devices/tokA')));
  await assertSucceeds(deleteDoc(doc(stu, 'institutes/a/devices/tokA')));
});
