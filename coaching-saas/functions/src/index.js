'use strict';
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getMessaging } = require('firebase-admin/messaging');
const { setGlobalOptions, logger } = require('firebase-functions/v2');

const { AppError } = require('./errors');
const accounts = require('./accounts');
const sa = require('./sa');
const notify = require('./notify');

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
exports.lookupInstitute = callable(accounts.lookupInstitute);
exports.createUser = callable(accounts.createUser);
exports.createUsers = callable(accounts.createUsers, { timeoutSeconds: 300 });
exports.resetPassword = callable(accounts.resetPassword);
exports.setUserActive = callable(accounts.setUserActive);
exports.deleteUser = callable(accounts.deleteUser);

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
exports.pushClass = updated('institutes/{inst}/classes/{id}', 'class', notify.onClassChanged);
exports.pushFee = created('institutes/{inst}/fees/{id}', 'fee', notify.onFeeReceived);
exports.pushLeave = created('institutes/{inst}/leaves/{id}', 'leave', notify.onLeaveCreated);
exports.pushLeaveDecision = updated('institutes/{inst}/leaves/{id}', 'leaveDecision', notify.onLeaveDecided);

exports.remindTomorrowClasses = onSchedule({ schedule: '0 17 * * *', timeZone: 'Asia/Kolkata' },
  () => safely('tomorrowClasses', () => notify.tomorrowClasses(pdeps())));
exports.remindFees = onSchedule({ schedule: '0 10 * * *', timeZone: 'Asia/Kolkata' },
  () => safely('feeReminders', () => notify.feeReminders(pdeps())));
