'use strict';
/** Server-side integrity helpers: batch -> teacher list for the rules, and the tamper-proof activity log. */

/** Every teacher of a batch (new multi-subject shape and the old single-teacher fields). */
function teacherIdsOf(batch) {
  const ids = (batch?.subjects || []).map((s) => s && s.teacherId).filter(Boolean);
  if (batch?.teacherId) ids.push(batch.teacherId);
  return [...new Set(ids)].sort();
}

/** Sets batches/{id}.teacherIds when it differs from what the subjects say. No-op (and no loop) when already right. */
async function syncBatchTeachers(afterSnap) {
  if (!afterSnap || !afterSnap.exists) return false;
  const data = afterSnap.data();
  const want = teacherIdsOf(data);
  const have = Array.isArray(data.teacherIds) ? [...data.teacherIds].sort() : null;
  if (have && have.length === want.length && have.every((v, i) => v === want[i])) return false;
  await afterSnap.ref.update({ teacherIds: want });
  return true;
}

const KEEP = ['studentId', 'studentName', 'teacherId', 'teacherName', 'amount', 'month', 'date', 'mode', 'note', 'type', 'category', 'receivedBy', 'createdBy'];
const pick = (d) => (d ? Object.fromEntries(KEEP.filter((k) => d[k] !== undefined).map((k) => [k, d[k]])) : null);

/**
 * Writes one activity entry for a create / update / delete of a money record.
 * The entry id is the event id, so a retried event never logs twice.
 */
async function logActivity(deps, { inst, kind, docId, eventId, before, after, actorId, actorType }) {
  const action = !before ? 'created' : !after ? 'deleted' : 'updated';
  const b = pick(before), a = pick(after);
  if (action === 'updated' && JSON.stringify(b) === JSON.stringify(a)) return null; // nothing that matters changed
  const cur = after || before;
  const entry = {
    kind, action, docId,
    by: actorId || '', byType: actorType || 'unknown',
    at: deps.Timestamp.now(),
    who: cur.studentName || cur.teacherName || cur.category || '',
    amount: Number(cur.amount) || 0,
    before: action === 'created' ? null : b,
    after: action === 'deleted' ? null : a,
  };
  await deps.db.collection('institutes').doc(inst).collection('activity').doc(eventId).set(entry);
  return entry;
}

/**
 * Gives a new fee payment the next receipt number of its institute (1, 2, 3 ...), exactly once.
 * The counter lives in institutes/{inst}/counters/receipts, which no app can read or write.
 */
async function assignReceiptNo(deps, inst, feeRef) {
  const counterRef = deps.db.collection('institutes').doc(inst).collection('counters').doc('receipts');
  return deps.db.runTransaction(async (tx) => {
    const [fee, counter] = await Promise.all([tx.get(feeRef), tx.get(counterRef)]);
    if (!fee.exists) return null;
    if (fee.data().receiptNo) return fee.data().receiptNo; // retried event
    const next = (counter.exists ? counter.data().last || 0 : 0) + 1;
    tx.set(counterRef, { last: next }, { merge: true });
    tx.update(feeRef, { receiptNo: next });
    return next;
  });
}

module.exports = { teacherIdsOf, syncBatchTeachers, logActivity, assignReceiptNo };
