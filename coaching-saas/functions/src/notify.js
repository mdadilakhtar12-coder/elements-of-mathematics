'use strict';
/**
 * Push notifications (FCM), phase 7.
 *
 * The app registers one document per device in institutes/{inst}/devices/{fcmToken} = { uid, ... }.
 * Firestore triggers (index.js) call the handlers below; each one works out WHO should hear about it
 * (recipient uids), looks up their device tokens and sends. Nothing is sent unless the institute is
 * live (not suspended / expired) AND its plan has the "push" feature.
 *
 * All functions take `deps` ({ db, messaging, now? }) so they are testable with the emulator and a fake messaging object.
 */
const { isLive } = require('./accounts');

const CHANNEL = 'coach_updates';
const IST_OFFSET_MIN = 330;

// ---------------------------------------------------------------- helpers

/** Date parts in India time. offsetDays: 0 = today, 1 = tomorrow. */
function istParts(nowMs, offsetDays = 0) {
  const d = new Date(nowMs + IST_OFFSET_MIN * 60000 + offsetDays * 86400000);
  const iso = d.toISOString();
  return { date: iso.slice(0, 10), month: iso.slice(0, 7), day: d.getUTCDate(), hour: d.getUTCHours() };
}

const now = (deps) => (deps.now ? deps.now() : Date.now());
const col = (deps, inst, name) => deps.db.collection('institutes').doc(inst).collection(name);

/** The institute document if pushes may go out for it, else null. */
async function pushInstitute(deps, inst, extraFeature) {
  const snap = await deps.db.collection('institutes').doc(inst).get();
  if (!snap.exists) return null;
  const i = snap.data();
  if (!isLive(i, now(deps)) || i.features?.push !== true) return null;
  if (extraFeature && i.features?.[extraFeature] !== true) return null;
  return i;
}

async function activeUsers(deps, inst, where) {
  const q = where ? where(col(deps, inst, 'users')) : col(deps, inst, 'users');
  const snap = await q.get();
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() })).filter((u) => u.active === true);
}

/** Admins, plus sub-admins that hold `perm` (any sub-admin when perm is omitted). */
async function staffUids(deps, inst, perm) {
  const users = await activeUsers(deps, inst);
  return users
    .filter((u) => u.role === 'admin'
      || ((u.role === 'subadmin' || (u.role === 'teacher' && u.alsoSubadmin === true)) && (!perm || (u.perms || []).includes(perm))))
    .map((u) => u.uid);
}

async function everyoneUids(deps, inst) {
  return (await activeUsers(deps, inst)).map((u) => u.uid);
}

/** Students of a batch, the batch's teachers and (optionally) staff. */
async function batchAudience(deps, inst, batchId, { students = true, teachers = true, staff = false } = {}) {
  const out = new Set();
  if (students) {
    const users = await activeUsers(deps, inst, (c) => c.where('batchIds', 'array-contains', batchId));
    users.filter((u) => u.role === 'student').forEach((u) => out.add(u.uid));
  }
  if (teachers) {
    const b = await col(deps, inst, 'batches').doc(batchId).get();
    if (b.exists) teacherIdsOf(b.data()).forEach((t) => out.add(t));
  }
  if (staff) (await staffUids(deps, inst)).forEach((u) => out.add(u));
  return out;
}

function teacherIdsOf(batch) {
  const ids = (batch.subjects || []).map((s) => s.teacherId).filter(Boolean);
  if (batch.teacherId) ids.push(batch.teacherId);
  return [...new Set(ids)];
}

const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/** Sends to every device of the given users. Invalid tokens are deleted. Returns the number of devices tried. */
async function sendToUids(deps, inst, uids, { title, body, data = {} }) {
  const ids = [...new Set(uids)].filter(Boolean);
  if (ids.length === 0 || !title) return 0;
  const tokens = [];
  for (const part of chunk(ids, 30)) {
    const snap = await col(deps, inst, 'devices').where('uid', 'in', part).get();
    snap.docs.forEach((d) => tokens.push(d.id));
  }
  if (tokens.length === 0) return 0;
  for (const part of chunk(tokens, 500)) {
    const res = await deps.messaging.sendEachForMulticast({
      tokens: part,
      notification: { title: String(title).slice(0, 100), body: String(body || '').slice(0, 300) },
      data: { inst, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) },
      android: { priority: 'high', notification: { channelId: CHANNEL } },
    });
    const dead = [];
    res.responses.forEach((r, i) => {
      const code = r.error?.code;
      if (!r.success && (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')) dead.push(part[i]);
    });
    await Promise.all(dead.map((t) => col(deps, inst, 'devices').doc(t).delete().catch(() => {})));
  }
  return tokens.length;
}

async function notify(deps, inst, extraFeature, audienceFn, payload) {
  if (!(await pushInstitute(deps, inst, extraFeature))) return 0;
  const aud = await audienceFn();
  return sendToUids(deps, inst, [...aud], payload);
}

// ---------------------------------------------------------------- event handlers

async function onNotice(deps, inst, n) {
  return notify(deps, inst, null,
    async () => (n.batchId ? await batchAudience(deps, inst, n.batchId, { staff: true }) : new Set(await everyoneUids(deps, inst))),
    { title: 'Announcement: ' + n.title, body: n.body, data: { kind: 'notice' } });
}

async function onHomework(deps, inst, h) {
  return notify(deps, inst, null,
    async () => { const a = await batchAudience(deps, inst, h.batchId); a.delete(h.createdBy); return a; },
    { title: 'New homework: ' + h.title, body: h.batchName, data: { kind: 'homework' } });
}

async function onMaterial(deps, inst, m) {
  return notify(deps, inst, 'study',
    async () => { const a = await batchAudience(deps, inst, m.batchId); a.delete(m.createdBy); return a; },
    { title: 'New study material: ' + m.title, body: m.batchName, data: { kind: 'material' } });
}

async function onDoubtAsked(deps, inst, d) {
  return notify(deps, inst, 'doubts',
    async () => { const a = await batchAudience(deps, inst, d.batchId, { students: false, staff: true }); a.delete(d.studentId); return a; },
    { title: 'New doubt from ' + d.studentName, body: d.question, data: { kind: 'doubt' } });
}

async function onDoubtAnswered(deps, inst, before, after) {
  if (before.status === 'answered' || after.status !== 'answered') return 0;
  return notify(deps, inst, 'doubts', async () => new Set([after.studentId]),
    { title: 'Your doubt was answered', body: after.answer, data: { kind: 'doubt' } });
}

/** Once a class is approved, every student marked absent gets "You were marked absent". */
async function absentAlerts(deps, inst, classId, cls) {
  if (!classId || !(await pushInstitute(deps, inst))) return 0;
  const snap = await col(deps, inst, 'attendance').where('classId', '==', classId).get();
  const absent = snap.docs.map((d) => d.data()).filter((a) => a.status === 'A').map((a) => a.studentId);
  let sent = 0;
  for (const uid of absent) {
    sent += await sendToUids(deps, inst, [uid], {
      title: 'Marked absent',
      body: `${cls.batchName || ''}${cls.subject ? ' ' + cls.subject : ''} on ${cls.date || ''}. Contact the institute if this is wrong.`,
      data: { kind: 'attendance' },
    });
  }
  return sent;
}

async function onClassChanged(deps, inst, before, after, classId) {
  if (before.status === after.status) return 0;
  const label = (after.batchName || '') + (after.subject ? ' ' + after.subject : '') + ' ' + (after.date || '');
  switch (after.status) {
    case 'taken':
      return notify(deps, inst, null, async () => new Set(await staffUids(deps, inst, 'attendance')),
        { title: 'Class waiting for approval', body: (after.teacherName || 'A teacher') + ': ' + label, data: { kind: 'approval' } });
    case 'approved': {
      const n = await notify(deps, inst, null, async () => new Set([after.teacherId]),
        { title: 'Class approved', body: label, data: { kind: 'class' } });
      return n + await absentAlerts(deps, inst, classId, after);
    }
    case 'rejected':
      return notify(deps, inst, null, async () => new Set([after.teacherId]),
        { title: 'Class rejected', body: label, data: { kind: 'class' } });
    case 'cancelled':
      return notify(deps, inst, null, async () => { const a = await batchAudience(deps, inst, after.batchId); return a; },
        { title: 'Class cancelled', body: label, data: { kind: 'class' } });
    default:
      return 0;
  }
}

async function onFeeReceived(deps, inst, f) {
  return notify(deps, inst, 'fees', async () => new Set([f.studentId]),
    { title: 'Fee received', body: `Rs ${f.amount} received${f.month ? ' for ' + f.month : ''}. Thank you!`, data: { kind: 'fee' } });
}

async function onLeaveCreated(deps, inst, l) {
  return notify(deps, inst, 'leaves', async () => new Set(await staffUids(deps, inst, 'attendance')),
    { title: 'Leave request', body: `${l.teacherName}: ${l.from}${l.to && l.to !== l.from ? ' to ' + l.to : ''}`, data: { kind: 'leave' } });
}

async function onLeaveDecided(deps, inst, before, after) {
  if (before.status === after.status || after.status === 'pending') return 0;
  return notify(deps, inst, 'leaves', async () => new Set([after.teacherId]),
    { title: 'Leave ' + after.status, body: after.from + (after.to && after.to !== after.from ? ' to ' + after.to : ''), data: { kind: 'leave' } });
}

// ---------------------------------------------------------------- scheduled reminders

async function pushInstitutes(deps) {
  const snap = await deps.db.collection('institutes').where('status', '==', 'active').get();
  return snap.docs.filter((d) => isLive(d.data(), now(deps)) && d.data().features?.push === true).map((d) => d.id);
}

/** Evening reminder: tomorrow's classes, one message per student / teacher listing their classes. */
async function tomorrowClasses(deps) {
  const { date } = istParts(now(deps), 1);
  let sent = 0;
  for (const inst of await pushInstitutes(deps)) {
    const classes = (await col(deps, inst, 'classes').where('date', '==', date).get()).docs.map((d) => d.data()).filter((c) => c.status !== 'cancelled');
    if (classes.length === 0) continue;
    const lines = new Map(); // uid -> [text]
    const add = (uid, text) => { if (!lines.has(uid)) lines.set(uid, []); lines.get(uid).push(text); };
    const studentsByBatch = new Map();
    for (const c of classes) {
      const text = `${c.start || ''} ${c.batchName || ''}${c.subject ? ' - ' + c.subject : ''}`.trim();
      if (c.teacherId) add(c.teacherId, text);
      if (!studentsByBatch.has(c.batchId)) studentsByBatch.set(c.batchId, [...(await batchAudience(deps, inst, c.batchId, { teachers: false }))]);
      studentsByBatch.get(c.batchId).forEach((s) => add(s, text));
    }
    for (const [uid, l] of lines) sent += await sendToUids(deps, inst, [uid], { title: 'Classes tomorrow', body: l.sort().join('\n'), data: { kind: 'class' } });
  }
  return sent;
}

/** Fee reminder from the 7th to the 10th of the month: students whose payments this month are below their monthly fee. */
async function feeReminders(deps, { fromDay = 7, toDay = 10 } = {}) {
  const t = istParts(now(deps));
  if (t.day < fromDay || t.day > toDay) return 0;
  let sent = 0;
  for (const inst of await pushInstitutes(deps)) {
    const i = (await deps.db.collection('institutes').doc(inst).get()).data();
    if (i.features?.fees !== true) continue;
    const paid = new Map();
    (await col(deps, inst, 'fees').where('month', '==', t.month).get()).docs.forEach((d) => {
      const f = d.data();
      paid.set(f.studentId, (paid.get(f.studentId) || 0) + (f.amount || 0));
    });
    const students = (await activeUsers(deps, inst, (c) => c.where('role', '==', 'student'))).filter((s) => (s.monthlyFee || 0) > 0);
    for (const s of students) {
      const due = s.monthlyFee - (paid.get(s.uid) || 0);
      if (due > 0) sent += await sendToUids(deps, inst, [s.uid], { title: 'Fees due', body: `${t.month}: Rs ${due} pending`, data: { kind: 'fee' } });
    }
  }
  return sent;
}

module.exports = {
  CHANNEL, istParts, staffUids, everyoneUids, batchAudience, sendToUids, pushInstitute,
  onNotice, onHomework, onMaterial, onDoubtAsked, onDoubtAnswered, onClassChanged, onFeeReceived, onLeaveCreated, onLeaveDecided,
  tomorrowClasses, feeReminders,
};
