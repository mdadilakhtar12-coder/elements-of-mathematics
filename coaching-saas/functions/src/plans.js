'use strict';
/**
 * Plan catalogue: the single source of truth for limits and features.
 *
 * - `limits`   : how many accounts of each role an institute may have (enforced in Cloud Functions,
 *                inside a Firestore transaction, so the app cannot go around it).
 * - `features` : which parts of the app are switched on. Copied into `institutes/{id}.features`
 *                and checked by firestore.rules on every read/write of that feature's collections.
 *
 * The super admin can override both per institute (see sa.js); `plans/{id}` in Firestore is
 * a read-only copy used by the apps to show the pricing table.
 *
 * Numbers for Free come from the product brief. Basic / Pro numbers are proposals: edit freely.
 */

const ROLES = ['admin', 'subadmin', 'teacher', 'student'];

/** Every switchable feature. `core` ones are on in every plan. */
const FEATURES = {
  core: 'People, batches, timetable, attendance, announcements & homework',
  exams: 'Exams, marks, results and class ranking',
  fees: 'Student fees and receipts',
  accounts: 'Income / expense ledger, teacher salary, bills',
  study: 'Study material links',
  doubts: 'Student doubts and teacher answers',
  leaves: 'Teacher leave requests',
  import_excel: 'Excel / CSV import of students and marks',
  messaging: 'WhatsApp / SMS message templates',
  backup: 'Data backup export',
  push: 'Push notifications',
};

const FEATURE_KEYS = Object.keys(FEATURES);

function featureMap(enabled) {
  const m = {};
  for (const k of FEATURE_KEYS) m[k] = k === 'core' || enabled.includes(k);
  return m;
}

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    pricePerMonth: 0,
    limits: { admin: 1, subadmin: 1, teacher: 5, student: 30 },
    features: featureMap([]),
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    pricePerMonth: 499,
    limits: { admin: 1, subadmin: 3, teacher: 20, student: 200 },
    features: featureMap(['exams', 'fees', 'study', 'import_excel', 'messaging', 'push']),
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    pricePerMonth: 999,
    limits: { admin: 2, subadmin: 10, teacher: 100, student: 1000 },
    features: featureMap(FEATURE_KEYS),
  },
};

const DEFAULT_PLAN = 'free';

function getPlan(id) {
  const p = PLANS[id];
  if (!p) throw new Error('Unknown plan: ' + id);
  return p;
}

/** Fresh copies, so callers can store them without sharing references. */
function planLimits(id) {
  return { ...getPlan(id).limits };
}
function planFeatures(id) {
  return { ...getPlan(id).features };
}

function emptyUsage() {
  return { admin: 0, subadmin: 0, teacher: 0, student: 0 };
}

/**
 * Would adding `n` accounts of `role` break the limit?
 * @returns {{ok: boolean, limit: number, used: number}}
 */
function checkLimit(limits, usage, role, n = 1) {
  if (!ROLES.includes(role)) throw new Error('Unknown role: ' + role);
  const limit = Number.isFinite(limits?.[role]) ? limits[role] : 0;
  const used = usage?.[role] || 0;
  return { ok: used + n <= limit, limit, used };
}

module.exports = {
  ROLES, FEATURES, FEATURE_KEYS, PLANS, DEFAULT_PLAN,
  getPlan, planLimits, planFeatures, emptyUsage, checkLimit, featureMap,
};
