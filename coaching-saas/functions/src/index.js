'use strict';
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions, logger } = require('firebase-functions/v2');

const { AppError } = require('./errors');
const accounts = require('./accounts');
const sa = require('./sa');

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
