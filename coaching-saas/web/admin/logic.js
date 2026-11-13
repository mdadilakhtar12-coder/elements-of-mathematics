/* Pure helpers for the super-admin panel (no DOM, no Firebase) - unit tested in functions/test/unit/panel.test.js */
(function (root) {
  'use strict';

  // Keep in sync with functions/src/plans.js (a unit test checks this).
  var FEATURES = {
    core: 'People, batches, timetable, attendance, announcements & homework',
    exams: 'Exams, marks, results and class ranking',
    fees: 'Student fees and receipts',
    accounts: 'Income / expense ledger, teacher salary, bills',
    study: 'Study material links',
    doubts: 'Student doubts and teacher answers',
    leaves: 'Teacher leave requests',
    import_excel: 'Excel / CSV import of exam marks (students, teachers and timetable import are in every plan)',
    messaging: 'WhatsApp / SMS message templates',
    backup: 'Data backup export',
    push: 'Push notifications',
    student_login: 'Students can log in to the app'
  };
  var ROLES = [['admin', 'Admins'], ['subadmin', 'Sub-admins'], ['teacher', 'Teachers'], ['student', 'Students']];
  var PLANS = ['free', 'starter', 'basic', 'growth', 'pro'];
  var DAY = 86400000;

  /** active | suspended | expired */
  function statusOf(inst, now) {
    if (inst.status === 'suspended') return 'suspended';
    if (inst.expiresAt != null && inst.expiresAt <= now) return 'expired';
    return 'active';
  }

  function filterInstitutes(list, f, now) {
    var q = (f.q || '').trim().toLowerCase();
    return list.filter(function (i) {
      if (f.plan && i.plan !== f.plan) return false;
      if (f.status && statusOf(i, now) !== f.status) return false;
      if (!q) return true;
      return [i.id, i.name, i.ownerEmail].some(function (v) { return String(v || '').toLowerCase().indexOf(q) >= 0; });
    });
  }

  function summarize(list, now) {
    var s = { total: list.length, active: 0, suspended: 0, expired: 0, paid: 0, students: 0 };
    list.forEach(function (i) {
      s[statusOf(i, now)]++;
      if (i.plan !== 'free') s.paid++;
      s.students += (i.usage && i.usage.student) || 0;
    });
    return s;
  }

  /** 0-100 for a progress bar; limit 0 with usage counts as full. */
  function percent(used, limit) {
    if (!limit) return used > 0 ? 100 : 0;
    return Math.min(100, Math.round((used * 100) / limit));
  }

  function fmtDate(ms) {
    if (ms == null) return 'Never';
    var d = new Date(ms);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Expiry = end of the chosen day, local time. '' -> null (never). */
  function parseExpiry(text) {
    if (!text) return null;
    var p = text.split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) throw new Error('Pick a valid date');
    return new Date(p[0], p[1] - 1, p[2], 23, 59, 59).getTime();
  }

  /** Extends from the later of now and the current expiry (so renewing early never loses days). */
  function extendExpiry(current, now, days) {
    return Math.max(current || 0, now) + days * DAY;
  }

  function limitsFromForm(values) {
    var out = {};
    ROLES.forEach(function (r) {
      var n = Number(values[r[0]]);
      if (!Number.isInteger(n) || n < 0 || n > 100000) throw new Error(r[1] + ': enter a whole number 0-100000');
      out[r[0]] = n;
    });
    return out;
  }

  var api = { FEATURES: FEATURES, ROLES: ROLES, PLANS: PLANS, statusOf: statusOf, filterInstitutes: filterInstitutes, summarize: summarize, percent: percent, fmtDate: fmtDate, parseExpiry: parseExpiry, extendExpiry: extendExpiry, limitsFromForm: limitsFromForm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PanelLogic = api;
})(typeof window !== 'undefined' ? window : this);
