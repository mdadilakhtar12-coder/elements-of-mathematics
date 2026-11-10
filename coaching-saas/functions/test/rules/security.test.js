'use strict';
// Security hardening: students/teachers see and change only what is theirs. Run with: npm run test:rules
const { test, before, after, beforeEach } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, orderBy, limit, writeBatch } = require('firebase/firestore');

let env;
const ALL = { core: true, exams: true, fees: true, accounts: true, study: true, doubts: true, leaves: true };
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-coachsaas-sec',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '../../../firestore.rules'), 'utf8') },
  });
});
after(async () => env.cleanup());

const I = 'institutes/a';
const cls = (o = {}) => ({ batchId: 'b1', batchName: 'B1', subject: 'Phy', teacherId: 't1', teacherName: 'T1', date: '2026-11-10', start: '16:00', end: '17:00', status: 'scheduled', topic: '', note: '', takenBy: '', takenAt: 0, approvedBy: '', ...o });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, I), { name: 'A', status: 'active', features: ALL });
    const u = (id, role, o = {}) => setDoc(doc(db, `${I}/users/${id}`), { role, active: true, name: id, loginId: id, perms: [], ...o });
    await u('admin', 'admin'); await u('sub', 'subadmin', { perms: ['fees', 'users', 'attendance'] });
    await u('t1', 'teacher', { salary: 20000 }); await u('t2', 'teacher', { salary: 30000 });
    await u('s1', 'student', { batchIds: ['b1'], monthlyFee: 1000 }); await u('s2', 'student', { batchIds: ['b2'] });
    await setDoc(doc(db, `${I}/batches/b1`), { name: 'B1', teacherIds: ['t1'] });
    await setDoc(doc(db, `${I}/batches/b2`), { name: 'B2', teacherIds: ['t2'] });
    await setDoc(doc(db, `${I}/classes/c1`), cls());
    await setDoc(doc(db, `${I}/classes/c2`), cls({ batchId: 'b2', teacherId: 't2' }));
    await setDoc(doc(db, `${I}/classes/cApproved`), cls({ status: 'approved', approvedBy: 'Admin' }));
    await setDoc(doc(db, `${I}/attendance/c1_s1`), { classId: 'c1', batchId: 'b1', studentId: 's1', status: 'P' });
    await setDoc(doc(db, `${I}/attendance/c2_s2`), { classId: 'c2', batchId: 'b2', studentId: 's2', status: 'A' });
    await setDoc(doc(db, `${I}/attendance/cApproved_s1`), { classId: 'cApproved', batchId: 'b1', studentId: 's1', status: 'P' });
    await setDoc(doc(db, `${I}/notices/nAll`), { title: 'all', batchId: '', createdAt: 3 });
    await setDoc(doc(db, `${I}/notices/n1`), { title: 'b1', batchId: 'b1', createdAt: 2 });
    await setDoc(doc(db, `${I}/notices/n2`), { title: 'b2', batchId: 'b2', createdAt: 1 });
    await setDoc(doc(db, `${I}/homework/h1`), { title: 'h', batchId: 'b1', createdAt: 1 });
    await setDoc(doc(db, `${I}/homework/h2`), { title: 'h', batchId: 'b2', createdAt: 1 });
    await setDoc(doc(db, `${I}/exams/e1`), { name: 'e', batchId: 'b1', date: '2026-11-01' });
    await setDoc(doc(db, `${I}/exams/e2`), { name: 'e', batchId: 'b2', date: '2026-11-01' });
    await setDoc(doc(db, `${I}/marks/m2`), { examId: 'e2', batchId: 'b2', studentId: 's2', marks: 5 });
    await setDoc(doc(db, `${I}/leaderboards/b1`), { entries: [] });
    await setDoc(doc(db, `${I}/leaderboards/b2`), { entries: [] });
    await setDoc(doc(db, `${I}/fees/f1`), { studentId: 's1', amount: 500, createdBy: 'sub' });
    await setDoc(doc(db, `${I}/doubts/d1`), { studentId: 's1', question: 'q' });
    await setDoc(doc(db, `${I}/doubtPhotos/d1`), { data: 'x' });
  });
});
const as = (uid) => env.authenticatedContext(uid, { inst: 'a' }).firestore();
const c = (db, name) => collection(db, `${I}/${name}`);

// ---------------------------------------------------------------- #1 class approval
test('#1 a teacher can hand in their own class but can never approve it', async () => {
  const t = as('t1');
  await assertSucceeds(setDoc(doc(t, `${I}/classes/c1`), cls({ status: 'taken', topic: 'Motion', takenBy: 'T1', takenAt: 5 })));
  await assertFails(setDoc(doc(t, `${I}/classes/c1`), cls({ status: 'approved', approvedBy: 'T1' })));
  await assertFails(updateDoc(doc(t, `${I}/classes/c1`), { status: 'approved' }));
  await assertFails(updateDoc(doc(t, `${I}/classes/c1`), { approvedBy: 'T1' }));
  await assertFails(updateDoc(doc(t, `${I}/classes/c1`), { status: 'cancelled' }));
});
test('#1 a teacher cannot change date / batch / teacher, touch an approved class, another teacher\'s class, or create / delete classes', async () => {
  const t = as('t1');
  await assertFails(updateDoc(doc(t, `${I}/classes/c1`), { status: 'taken', date: '2026-11-11' }));
  await assertFails(updateDoc(doc(t, `${I}/classes/c1`), { status: 'taken', teacherId: 't2' }));
  await assertFails(updateDoc(doc(t, `${I}/classes/cApproved`), { status: 'taken' }));
  await assertFails(updateDoc(doc(t, `${I}/classes/c2`), { status: 'taken' }));
  await assertFails(setDoc(doc(t, `${I}/classes/new`), cls()));
  await assertFails(deleteDoc(doc(t, `${I}/classes/c1`)));
});
test('#1 staff with the attendance permission still approve', async () => {
  await assertSucceeds(updateDoc(doc(as('sub'), `${I}/classes/c1`), { status: 'approved', approvedBy: 'Sub' }));
  await assertSucceeds(updateDoc(doc(as('admin'), `${I}/classes/c1`), { status: 'rejected' }));
});

// ---------------------------------------------------------------- #2 students
test('#2 a student reads only their own attendance', async () => {
  const s = as('s1');
  await assertSucceeds(getDoc(doc(s, `${I}/attendance/c1_s1`)));
  await assertFails(getDoc(doc(s, `${I}/attendance/c2_s2`)));
  await assertSucceeds(getDocs(query(c(s, 'attendance'), where('studentId', '==', 's1'))));
  await assertFails(getDocs(query(c(s, 'attendance'), where('studentId', '==', 's2'))));
  await assertFails(getDocs(c(s, 'attendance')));
});
test('#2 a student reads only their own batches, classes, homework, exams, leaderboard', async () => {
  const s = as('s1');
  await assertSucceeds(getDoc(doc(s, `${I}/batches/b1`)));
  await assertFails(getDoc(doc(s, `${I}/batches/b2`)));
  await assertFails(getDocs(c(s, 'batches')));
  await assertSucceeds(getDocs(query(c(s, 'classes'), where('batchId', '==', 'b1'), where('date', '>=', '2026-01-01'))));
  await assertFails(getDocs(query(c(s, 'classes'), where('batchId', '==', 'b2'), where('date', '>=', '2026-01-01'))));
  await assertFails(getDocs(query(c(s, 'classes'), where('date', '>=', '2026-01-01'))));
  await assertSucceeds(getDocs(query(c(s, 'homework'), where('batchId', '==', 'b1'), orderBy('createdAt', 'desc'), limit(100))));
  await assertFails(getDocs(query(c(s, 'homework'), where('batchId', '==', 'b2'))));
  await assertSucceeds(getDocs(query(c(s, 'exams'), where('batchId', '==', 'b1'), orderBy('date', 'desc'), limit(100))));
  await assertFails(getDoc(doc(s, `${I}/exams/e2`)));
  await assertSucceeds(getDoc(doc(s, `${I}/leaderboards/b1`)));
  await assertFails(getDoc(doc(s, `${I}/leaderboards/b2`)));
});
test('#2 notices: a student gets "everyone" and own-batch ones, not other batches', async () => {
  const s = as('s1');
  await assertSucceeds(getDocs(query(c(s, 'notices'), where('batchId', '==', ''), orderBy('createdAt', 'desc'), limit(50))));
  await assertSucceeds(getDocs(query(c(s, 'notices'), where('batchId', '==', 'b1'), orderBy('createdAt', 'desc'), limit(50))));
  await assertFails(getDocs(query(c(s, 'notices'), where('batchId', '==', 'b2'))));
  await assertFails(getDocs(query(c(s, 'notices'), orderBy('createdAt', 'desc'), limit(100))));
});
test('#2 a student cannot read other profiles or other students\' doubt photos', async () => {
  const s2 = as('s2');
  await assertSucceeds(getDoc(doc(s2, `${I}/users/s2`)));
  await assertFails(getDoc(doc(s2, `${I}/users/s1`)));
  await assertFails(getDoc(doc(s2, `${I}/users/t1`)));
  await assertFails(getDocs(c(s2, 'users')));
  await assertFails(getDoc(doc(s2, `${I}/doubtPhotos/d1`)));
  await assertFails(deleteDoc(doc(s2, `${I}/doubtPhotos/d1`)));
  await assertSucceeds(getDoc(doc(as('s1'), `${I}/doubtPhotos/d1`)));
  await assertSucceeds(getDoc(doc(as('t1'), `${I}/doubtPhotos/d1`)));
});
test('#2 a student can attach a photo only to their own doubt', async () => {
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `${I}/doubts/d2`), { studentId: 's2', question: 'q' }));
  await assertSucceeds(setDoc(doc(as('s2'), `${I}/doubtPhotos/d2`), { data: 'x' }));
  await assertFails(setDoc(doc(as('s1'), `${I}/doubtPhotos/d2`), { data: 'x' }));
});

// ---------------------------------------------------------------- #3 teacher profile access
test('#3 a teacher reads students but not other teachers / staff (their pay stays private)', async () => {
  const t = as('t1');
  await assertSucceeds(getDoc(doc(t, `${I}/users/t1`)));
  await assertSucceeds(getDoc(doc(t, `${I}/users/s1`)));
  await assertSucceeds(getDocs(query(c(t, 'users'), where('role', '==', 'student'))));
  await assertFails(getDoc(doc(t, `${I}/users/t2`)));
  await assertFails(getDoc(doc(t, `${I}/users/admin`)));
  await assertFails(getDocs(c(t, 'users')));
  await assertFails(getDocs(query(c(t, 'users'), where('role', '==', 'teacher'))));
  await assertSucceeds(getDocs(c(as('sub'), 'users')));
  await assertSucceeds(getDocs(c(as('admin'), 'users')));
});
test('#3 only the admin hands out permissions', async () => {
  await assertFails(updateDoc(doc(as('sub'), `${I}/users/t1`), { perms: ['fees'] }));
  await assertSucceeds(updateDoc(doc(as('sub'), `${I}/users/t1`), { name: 'New' }));
  await assertSucceeds(updateDoc(doc(as('admin'), `${I}/users/sub`), { perms: ['fees'] }));
});

// ---------------------------------------------------------------- #4 teacher writes
test('#4 attendance: a teacher writes only for their own, not-yet-approved class', async () => {
  const t = as('t1');
  await assertSucceeds(setDoc(doc(t, `${I}/attendance/c1_s1`), { classId: 'c1', batchId: 'b1', studentId: 's1', status: 'A' }));
  await assertFails(setDoc(doc(t, `${I}/attendance/c2_s2`), { classId: 'c2', batchId: 'b2', studentId: 's2', status: 'P' }));
  await assertFails(setDoc(doc(t, `${I}/attendance/cApproved_s1`), { classId: 'cApproved', batchId: 'b1', studentId: 's1', status: 'A' }));
  await assertFails(deleteDoc(doc(t, `${I}/attendance/cApproved_s1`)));
  await assertFails(updateDoc(doc(t, `${I}/attendance/c1_s1`), { classId: 'c2' }));
  await assertSucceeds(setDoc(doc(as('sub'), `${I}/attendance/cApproved_s1`), { classId: 'cApproved', batchId: 'b1', studentId: 's1', status: 'A' }));
});
test('#4 the app\'s real flow works: batch of attendance, then the class goes to "taken"', async () => {
  const t = as('t1');
  const wb = writeBatch(t);
  for (let i = 0; i < 40; i++) wb.set(doc(t, `${I}/attendance/c1_x${i}`), { classId: 'c1', batchId: 'b1', studentId: 'x' + i, status: 'P' });
  await assertSucceeds(wb.commit());
  await assertSucceeds(setDoc(doc(t, `${I}/classes/c1`), cls({ status: 'taken', topic: 'x', takenBy: 'T1', takenAt: 9 })));
  // still editable until approved
  await assertSucceeds(setDoc(doc(t, `${I}/attendance/c1_x1`), { classId: 'c1', batchId: 'b1', studentId: 'x1', status: 'A' }));
});
test('#4 homework / notices / exams / marks / leaderboard: only for a batch the teacher teaches', async () => {
  const t = as('t1');
  await assertSucceeds(setDoc(doc(t, `${I}/homework/new1`), { title: 'x', batchId: 'b1' }));
  await assertFails(setDoc(doc(t, `${I}/homework/new2`), { title: 'x', batchId: 'b2' }));
  await assertFails(deleteDoc(doc(t, `${I}/homework/h2`)));
  await assertFails(updateDoc(doc(t, `${I}/homework/h1`), { batchId: 'b2' }));
  await assertSucceeds(setDoc(doc(t, `${I}/notices/new1`), { title: 'x', batchId: 'b1' }));
  await assertFails(setDoc(doc(t, `${I}/notices/new2`), { title: 'x', batchId: '' }), 'a teacher cannot message everyone');
  await assertFails(deleteDoc(doc(t, `${I}/notices/nAll`)));
  await assertSucceeds(setDoc(doc(t, `${I}/exams/new1`), { name: 'x', batchId: 'b1' }));
  await assertFails(setDoc(doc(t, `${I}/exams/e2`), { name: 'hack', batchId: 'b2' }));
  await assertSucceeds(setDoc(doc(t, `${I}/marks/new1`), { examId: 'e1', batchId: 'b1', studentId: 's1', marks: 9 }));
  await assertFails(setDoc(doc(t, `${I}/marks/m2`), { examId: 'e2', batchId: 'b2', studentId: 's2', marks: 99 }));
  await assertFails(deleteDoc(doc(t, `${I}/marks/m2`)));
  await assertSucceeds(setDoc(doc(t, `${I}/leaderboards/b1`), { entries: [] }));
  await assertFails(setDoc(doc(t, `${I}/leaderboards/b2`), { entries: [] }));
  await assertSucceeds(setDoc(doc(as('admin'), `${I}/notices/new3`), { title: 'x', batchId: '' }));
});
test('#4 a big marks upload by the batch teacher fits in one batched write', async () => {
  const t = as('t1');
  const wb = writeBatch(t);
  for (let i = 0; i < 100; i++) wb.set(doc(t, `${I}/marks/e1_s${i}`), { examId: 'e1', batchId: 'b1', studentId: 's' + i, marks: i });
  await assertSucceeds(wb.commit());
});

// ---------------------------------------------------------------- #9 fees
test('#9 fees: staff record under their own id; only the admin changes or deletes; activity log is admin-only and read-only', async () => {
  const sub = as('sub');
  await assertSucceeds(setDoc(doc(sub, `${I}/fees/new1`), { studentId: 's1', amount: 100, createdBy: 'sub' }));
  await assertFails(setDoc(doc(sub, `${I}/fees/new2`), { studentId: 's1', amount: 100, createdBy: 'admin' }));
  await assertFails(setDoc(doc(sub, `${I}/fees/new3`), { studentId: 's1', amount: 100 }));
  await assertFails(deleteDoc(doc(sub, `${I}/fees/f1`)));
  await assertFails(updateDoc(doc(sub, `${I}/fees/f1`), { amount: 1 }));
  await assertSucceeds(updateDoc(doc(as('admin'), `${I}/fees/f1`), { note: 'fixed' }));
  await assertSucceeds(deleteDoc(doc(as('admin'), `${I}/fees/f1`)));
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `${I}/activity/a1`), { kind: 'fees' }));
  await assertSucceeds(getDocs(c(as('admin'), 'activity')));
  await assertFails(getDocs(c(sub, 'activity')));
  await assertFails(setDoc(doc(as('admin'), `${I}/activity/a2`), { kind: 'fees' }));
  await assertFails(deleteDoc(doc(as('admin'), `${I}/activity/a1`)));
});
