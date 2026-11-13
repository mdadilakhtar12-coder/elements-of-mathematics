'use strict';
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten, onDocumentWrittenWithAuthContext } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getMessaging } = require('firebase-admin/messaging');
const { setGlobalOptions, logger } = require('firebase-functions/v2');

const { AppError } = require('./errors');
const accounts = require('./accounts');
const sa = require('./sa');
const notify = require('./notify');
const integrity = require('./integrity');
const payments = require('./payments');
const { onRequest } = require('firebase-functions/v2/https');

initializeApp();
// Mumbai. The Android app must use FirebaseFunctions.getInstance("asia-south1").
setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

const deps = () => ({ db: getFirestore(), auth: getAuth(), Timestamp });

/** Wraps a plain function into a callable: verified caller in, AppError -> HttpsError out. */
function callable(fn, opts = {}) {
  return onCall(opts, async (req) => {
    try {
      return await fn(deps(), { uid: req.auth?.uid, token: req.auth?.token }, req.data || {});
    } catch (e) {
      if (e instanceof AppError) throw new HttpsError(e.code, e.message);
      logger.error('callable failed', { message: e?.message, stack: e?.stack });
      throw new HttpsError('internal', 'Something went wrong. Please try again.');
    }
  });
}

// ---- accounts (phase 2) ----
exports.registerInstitute = callable(accounts.registerInstitute);
// lookupInstitute is deliberately NOT exported: an open endpoint that confirms institute codes helps attackers and the app does not need it.
exports.createUser = callable(accounts.createUser);
exports.createUsers = callable(accounts.createUsers, { timeoutSeconds: 300 });
exports.resetPassword = callable(accounts.resetPassword);
exports.setUserActive = callable(accounts.setUserActive);
exports.deleteUser = callable(accounts.deleteUser);
exports.setTeacherAdmin = callable(accounts.setTeacherAdmin);
exports.deleteMyAccount = callable(accounts.deleteMyAccount);

// ---- super admin (phase 5) ----
exports.saListInstitutes = callable(sa.listInstitutes);
exports.saSetPlan = callable(sa.setPlan);
exports.saSetFeatures = callable(sa.setFeatures);
exports.saSetLimits = callable(sa.setLimits);
exports.saSetStatus = callable(sa.setStatus);
exports.saSetExpiry = callable(sa.setExpiry);
exports.saRecountUsage = callable(sa.recountUsage);

// ---- push notifications (phase 7) ----
const pdeps = () => ({ db: getFirestore(), messaging: getMessaging() });

/** A failed notification must never be retried forever or break the write that caused it: log and move on. */
async function safely(name, fn) {
  try {
    await fn();
  } catch (e) {
    logger.error('notification failed: ' + name, { message: e?.message });
  }
}
const created = (path, name, handler) =>
  onDocumentCreated(path, (e) => safely(name, () => handler(pdeps(), e.params.inst, e.data.data())));
const updated = (path, name, handler) =>
  onDocumentUpdated(path, (e) => safely(name, () => handler(pdeps(), e.params.inst, e.data.before.data(), e.data.after.data())));

exports.pushNotice = created('institutes/{inst}/notices/{id}', 'notice', notify.onNotice);
exports.pushHomework = created('institutes/{inst}/homework/{id}', 'homework', notify.onHomework);
exports.pushMaterial = created('institutes/{inst}/materials/{id}', 'material', notify.onMaterial);
exports.pushDoubt = created('institutes/{inst}/doubts/{id}', 'doubt', notify.onDoubtAsked);
exports.pushDoubtAnswer = updated('institutes/{inst}/doubts/{id}', 'doubtAnswer', notify.onDoubtAnswered);
exports.pushClass = onDocumentUpdated('institutes/{inst}/classes/{id}', (e) =>
  safely('class', () => notify.onClassChanged(pdeps(), e.params.inst, e.data.before.data(), e.data.after.data(), e.params.id)));
exports.pushFee = created('institutes/{inst}/fees/{id}', 'fee', notify.onFeeReceived);
exports.pushLeave = created('institutes/{inst}/leaves/{id}', 'leave', notify.onLeaveCreated);
exports.pushLeaveDecision = updated('institutes/{inst}/leaves/{id}', 'leaveDecision', notify.onLeaveDecided);

exports.remindTomorrowClasses = onSchedule({ schedule: '0 17 * * *', timeZone: 'Asia/Kolkata' },
  () => safely('tomorrowClasses', () => notify.tomorrowClasses(pdeps())));
exports.remindFees = onSchedule({ schedule: '0 10 * * *', timeZone: 'Asia/Kolkata' },
  () => safely('feeReminders', () => notify.feeReminders(pdeps())));

// ---- integrity (security hardening) ----
// Keeps batches/{id}.teacherIds correct on the server; firestore.rules use it to decide which batch a teacher may write to.
exports.syncBatchTeachers = onDocumentWritten('institutes/{inst}/batches/{id}', (e) =>
  safely('syncBatchTeachers', () => integrity.syncBatchTeachers(e.data.after)));

// Activity log: who created / changed / deleted money records. The admin reads it in the app; nobody can edit it.
const logged = (kind) => onDocumentWrittenWithAuthContext(`institutes/{inst}/${kind}/{id}`, (e) =>
  safely('activity:' + kind, () => integrity.logActivity({ db: getFirestore(), Timestamp }, {
    inst: e.params.inst, kind, docId: e.params.id, eventId: e.id,
    before: e.data.before.exists ? e.data.before.data() : null,
    after: e.data.after.exists ? e.data.after.data() : null,
    actorId: e.authId || '', actorType: e.authType || 'unknown',
  })));
// Receipt numbers: 1, 2, 3 ... per institute, given by the server so two phones can never get the same one.
exports.numberReceipt = onDocumentCreated('institutes/{inst}/fees/{id}', (e) =>
  safely('numberReceipt', () => integrity.assignReceiptNo({ db: getFirestore() }, e.params.inst, e.data.ref)));
exports.logFees = logged('fees');
exports.logLedger = logged('ledger');
exports.logSalaryPaid = logged('salaryPaid');

// ---- plan purchases (Cashfree, on the website) ----
exports.myBilling = callable(payments.myBilling);
exports.createPlanOrder = callable(payments.createPlanOrder);
exports.verifyPlanOrder = callable(payments.verifyPlanOrder);
exports.saSetPaymentConfig = callable(payments.setPaymentConfig);
exports.saPaymentStatus = callable(payments.getPaymentStatus);
exports.saListOrders = callable(payments.listOrders);
// Public price list for the website (no sign-in).
exports.planCatalogue = onRequest({ cors: true }, async (req, res) => {
  try {
    const cfg = await payments.getConfig(getFirestore());
    res.set('Cache-Control', 'public, max-age=300').json({ plans: payments.catalogue(cfg.feePercent) });
  } catch (e) {
    res.status(500).json({ error: 'unavailable' });
  }
});
// Cashfree payment notifications (reached through the website: /api/cashfree-webhook).
exports.cashfreeWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('POST only');
  try {
    const status = await payments.handleWebhook({ db: getFirestore(), Timestamp }, { rawBody: req.rawBody, headers: req.headers });
    res.status(status).send(status === 200 ? 'ok' : 'bad signature');
  } catch (e) {
    logger.error('webhook failed', { message: e?.message });
    res.status(500).send('error'); // Cashfree retries later
  }
});
exports.downgradeExpiredPlans = onSchedule({ schedule: 'every 60 minutes', timeZone: 'Asia/Kolkata' },
  () => safely('downgradeExpired', () => payments.downgradeExpired({ db: getFirestore(), Timestamp })));
