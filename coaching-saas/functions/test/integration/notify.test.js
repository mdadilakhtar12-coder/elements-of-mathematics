'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'demo-coachsaas';
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const N = require('../../src/notify');

initializeApp({ projectId: 'demo-coachsaas' });
const db = getFirestore();
let sent;
let failTokens = new Set();
let clock = Date.UTC(2026, 10, 9, 12, 0); // 9 Nov 2026 17:30 IST
const messaging = {
  async sendEachForMulticast(m) {
    sent.push(m);
    return { responses: m.tokens.map((t) => failTokens.has(t) ? { success: false, error: { code: 'messaging/registration-token-not-registered' } } : { success: true }) };
  },
};
const deps = { db, messaging, now: () => clock };

const I = 'institutes/a';
async function seed(features = { core: true, push: true, study: true, doubts: true, fees: true, leaves: true }, extra = {}) {
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-coachsaas/databases/(default)/documents`, { method: 'DELETE' });
  sent = []; failTokens = new Set(); clock = Date.UTC(2026, 10, 9, 12, 0);
  await db.doc(I).set({ name: 'A', status: 'active', features, expiresAt: null, ...extra });
  const u = (id, role, o = {}) => db.doc(`${I}/users/${id}`).set({ role, active: true, name: id, ...o });
  await u('admin', 'admin'); await u('subOK', 'subadmin', { perms: ['attendance'] }); await u('subNo', 'subadmin', { perms: ['fees'] });
  await u('t1', 'teacher'); await u('t2', 'teacher');
  await u('s1', 'student', { batchIds: ['b1'], monthlyFee: 1000 }); await u('s2', 'student', { batchIds: ['b1', 'b2'], monthlyFee: 500 });
  await u('s3', 'student', { batchIds: ['b2'] }); await u('off', 'student', { batchIds: ['b1'], active: false });
  await db.doc(`${I}/batches/b1`).set({ name: 'B1', subjects: [{ subject: 'Phy', teacherId: 't1' }] });
  await db.doc(`${I}/batches/b2`).set({ name: 'B2', teacherId: 't2' });
  for (const uid of ['admin', 'subOK', 'subNo', 't1', 't2', 's1', 's2', 's3', 'off']) await db.doc(`${I}/devices/tok-${uid}`).set({ uid, role: 'x' });
  await db.doc(`${I}/devices/tok-s1b`).set({ uid: 's1' }); // second phone
}
const tokens = () => sent.flatMap((m) => m.tokens).sort();
beforeEach(() => seed());

test('notice for a batch reaches its active students, teachers and staff only', async () => {
  await N.onNotice(deps, 'a', { title: 'Holiday', body: 'Tomorrow off', batchId: 'b1' });
  assert.deepEqual(tokens(), ['tok-admin', 'tok-s1', 'tok-s1b', 'tok-s2', 'tok-subNo', 'tok-subOK', 'tok-t1'].sort());
  assert.equal(sent[0].notification.title, 'Announcement: Holiday');
  assert.equal(sent[0].data.inst, 'a');
});

test('notice for everyone reaches all active users (not deactivated ones)', async () => {
  await N.onNotice(deps, 'a', { title: 'Hi', body: 'x', batchId: '' });
  assert.ok(!tokens().includes('tok-off'));
  assert.equal(tokens().length, 9);
});

test('nothing is sent when push is not in the plan, or the institute is suspended / expired', async () => {
  await seed({ core: true, push: false });
  assert.equal(await N.onNotice(deps, 'a', { title: 't', body: 'b', batchId: '' }), 0);
  await seed(undefined, { status: 'suspended' });
  assert.equal(await N.onNotice(deps, 'a', { title: 't', body: 'b', batchId: '' }), 0);
  await seed(undefined, { expiresAt: Timestamp.fromMillis(clock - 1000) });
  assert.equal(await N.onNotice(deps, 'a', { title: 't', body: 'b', batchId: '' }), 0);
  assert.equal(sent.length, 0);
});

test('feature-specific pushes need that feature too', async () => {
  await seed({ core: true, push: true, study: false });
  assert.equal(await N.onMaterial(deps, 'a', { title: 'Notes', batchId: 'b1', batchName: 'B1', createdBy: 't1' }), 0);
});

test('homework: creator is not notified', async () => {
  await N.onHomework(deps, 'a', { title: 'HW', batchId: 'b1', batchName: 'B1', createdBy: 't1' });
  assert.ok(!tokens().includes('tok-t1'));
  assert.ok(tokens().includes('tok-s1'));
});

test('class workflow: taken -> approvers with attendance perm; approved -> teacher; cancelled -> batch', async () => {
  const base = { batchId: 'b1', batchName: 'B1', teacherId: 't1', teacherName: 'T One', date: '2026-11-10' };
  await N.onClassChanged(deps, 'a', { ...base, status: 'scheduled' }, { ...base, status: 'taken' });
  assert.deepEqual(tokens(), ['tok-admin', 'tok-subOK']); sent = [];
  await N.onClassChanged(deps, 'a', { ...base, status: 'taken' }, { ...base, status: 'approved' });
  assert.deepEqual(tokens(), ['tok-t1']); sent = [];
  await N.onClassChanged(deps, 'a', { ...base, status: 'scheduled' }, { ...base, status: 'cancelled' });
  assert.ok(tokens().includes('tok-s1') && tokens().includes('tok-t1') && !tokens().includes('tok-s3')); sent = [];
  assert.equal(await N.onClassChanged(deps, 'a', { ...base, status: 'scheduled' }, { ...base, status: 'scheduled' }), 0);
});

test('doubts, fees, leaves go to the right person', async () => {
  await N.onDoubtAsked(deps, 'a', { studentId: 's1', studentName: 'S1', batchId: 'b1', question: 'why?' });
  assert.deepEqual(tokens(), ['tok-admin', 'tok-subNo', 'tok-subOK', 'tok-t1']); sent = [];
  await N.onDoubtAnswered(deps, 'a', { status: 'open', studentId: 's2' }, { status: 'answered', studentId: 's2', answer: 'because' });
  assert.deepEqual(tokens(), ['tok-s2']); sent = [];
  assert.equal(await N.onDoubtAnswered(deps, 'a', { status: 'answered' }, { status: 'answered', studentId: 's2' }), 0);
  await N.onFeeReceived(deps, 'a', { studentId: 's3', amount: 500, month: '2026-11' });
  assert.deepEqual(tokens(), ['tok-s3']); sent = [];
  await N.onLeaveCreated(deps, 'a', { teacherName: 'T', from: '2026-11-12', to: '2026-11-13' });
  assert.deepEqual(tokens(), ['tok-admin', 'tok-subOK']); sent = [];
  await N.onLeaveDecided(deps, 'a', { status: 'pending', teacherId: 't1' }, { status: 'approved', teacherId: 't1', from: '2026-11-12', to: '2026-11-12' });
  assert.deepEqual(tokens(), ['tok-t1']);
});

test('dead tokens are removed after a failed send', async () => {
  failTokens.add('tok-s1b');
  await N.onFeeReceived(deps, 'a', { studentId: 's1', amount: 1 });
  assert.equal((await db.doc(`${I}/devices/tok-s1b`).get()).exists, false);
  assert.equal((await db.doc(`${I}/devices/tok-s1`).get()).exists, true);
});

test('tomorrow reminder: one message per person listing their classes, skips cancelled', async () => {
  await db.doc(`${I}/classes/c1`).set({ date: '2026-11-10', start: '16:00', batchId: 'b1', batchName: 'B1', subject: 'Phy', teacherId: 't1', status: 'scheduled' });
  await db.doc(`${I}/classes/c2`).set({ date: '2026-11-10', start: '18:00', batchId: 'b2', batchName: 'B2', teacherId: 't2', status: 'cancelled' });
  await db.doc(`${I}/classes/c3`).set({ date: '2026-11-11', start: '18:00', batchId: 'b2', batchName: 'B2', teacherId: 't2', status: 'scheduled' });
  await N.tomorrowClasses(deps);
  assert.deepEqual(tokens(), ['tok-s1', 'tok-s1b', 'tok-s2', 'tok-t1']);
  assert.match(sent[0].notification.body, /B1/);
});

test('fee reminder only on days 7-10 and only for students who still owe', async () => {
  await db.doc(`${I}/fees/f1`).set({ studentId: 's1', amount: 1000, month: '2026-11' });
  await db.doc(`${I}/fees/f2`).set({ studentId: 's2', amount: 200, month: '2026-11' });
  clock = Date.UTC(2026, 10, 9, 5, 0); // 9th
  await N.feeReminders(deps);
  assert.deepEqual(tokens(), ['tok-s2']); assert.match(sent[0].notification.body, /Rs 300/); sent = [];
  clock = Date.UTC(2026, 10, 20, 5, 0);
  assert.equal(await N.feeReminders(deps), 0);
});

test('istParts uses India time', () => {
  assert.deepEqual(N.istParts(Date.UTC(2026, 10, 9, 20, 0), 1), { date: '2026-11-11', month: '2026-11', day: 11, hour: 1 });
});
