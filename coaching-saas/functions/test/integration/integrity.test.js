'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'demo-coachsaas';
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const G = require('../../src/integrity');
if (!getApps().length) initializeApp({ projectId: 'demo-coachsaas' });
const db = getFirestore();
const deps = { db, Timestamp };
beforeEach(() => fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-coachsaas/databases/(default)/documents`, { method: 'DELETE' }));

test('syncBatchTeachers: fills teacherIds from subjects + old field, then is a no-op (no trigger loop)', async () => {
  const ref = db.doc('institutes/a/batches/b1');
  await ref.set({ name: 'B', subjects: [{ subject: 'Phy', teacherId: 't2' }, { subject: 'Chem', teacherId: 't1' }, { subject: 'Bio', teacherId: '' }], teacherId: 't3' });
  assert.equal(await G.syncBatchTeachers(await ref.get()), true);
  assert.deepEqual((await ref.get()).data().teacherIds, ['t1', 't2', 't3']);
  assert.equal(await G.syncBatchTeachers(await ref.get()), false);
  await ref.update({ teacherIds: ['t1', 'intruder'] }); // someone tampers
  assert.equal(await G.syncBatchTeachers(await ref.get()), true);
  assert.deepEqual((await ref.get()).data().teacherIds, ['t1', 't2', 't3']);
  await ref.delete();
  assert.equal(await G.syncBatchTeachers(await ref.get()), false);
});

test('activity log: create, update, delete are recorded with the actor; retries do not duplicate', async () => {
  const fee = { studentId: 's1', studentName: 'Asha', amount: 1000, month: '2026-11', createdBy: 'sub', secretInternal: 'x' };
  const base = { inst: 'a', kind: 'fees', docId: 'f1', actorType: 'app_user' };
  await G.logActivity(deps, { ...base, eventId: 'e1', before: null, after: fee, actorId: 'sub' });
  await G.logActivity(deps, { ...base, eventId: 'e1', before: null, after: fee, actorId: 'sub' }); // retry
  await G.logActivity(deps, { ...base, eventId: 'e2', before: fee, after: { ...fee, amount: 100 }, actorId: 'admin' });
  await G.logActivity(deps, { ...base, eventId: 'e3', before: { ...fee, amount: 100 }, after: null, actorId: 'admin' });
  const none = await G.logActivity(deps, { ...base, eventId: 'e4', before: fee, after: { ...fee, secretInternal: 'y' }, actorId: 'admin' });
  assert.equal(none, null, 'irrelevant field changes are not logged');
  const all = (await db.collection('institutes/a/activity').get()).docs.map((d) => d.data()).sort((x, y) => x.action.localeCompare(y.action));
  assert.deepEqual(all.map((x) => [x.action, x.by, x.amount]), [['created', 'sub', 1000], ['deleted', 'admin', 100], ['updated', 'admin', 100]]);
  const upd = all.find((x) => x.action === 'updated');
  assert.equal(upd.before.amount, 1000); assert.equal(upd.after.amount, 100); assert.equal(upd.who, 'Asha');
  assert.equal(upd.before.secretInternal, undefined);
});

test('receipt numbers: 1, 2, 3 per institute, never duplicated even when payments arrive together', async () => {
  const d = { db };
  const refs = [];
  for (let i = 0; i < 6; i++) { const r = db.doc(`institutes/a/fees/f${i}`); await r.set({ amount: 100 }); refs.push(r); }
  const other = db.doc('institutes/b/fees/x'); await other.set({ amount: 1 });
  const nums = await Promise.all(refs.map((r) => G.assignReceiptNo(d, 'a', r)));
  assert.deepEqual([...nums].sort((x, y) => x - y), [1, 2, 3, 4, 5, 6]);
  assert.equal(await G.assignReceiptNo(d, 'a', refs[0]), nums[0], 'a retried event keeps its number');
  assert.equal(await G.assignReceiptNo(d, 'b', other), 1, 'each institute has its own series');
  assert.equal((await refs[3].get()).data().receiptNo, nums[3]);
  assert.equal(await G.assignReceiptNo(d, 'a', db.doc('institutes/a/fees/gone')), null);
});
