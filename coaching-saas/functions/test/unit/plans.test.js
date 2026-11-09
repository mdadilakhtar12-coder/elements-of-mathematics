'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PLANS, planLimits, planFeatures, checkLimit, emptyUsage, FEATURE_KEYS } = require('../../src/plans');

test('Free plan matches the brief: 1 admin, 1 sub-admin, 5 teachers, 30 students', () => {
  assert.deepEqual(PLANS.free.limits, { admin: 1, subadmin: 1, teacher: 5, student: 30 });
});

test('every plan lists every feature, core is always on, plans are nested Free < Basic < Pro', () => {
  for (const p of Object.values(PLANS)) {
    assert.deepEqual(Object.keys(p.features).sort(), [...FEATURE_KEYS].sort());
    assert.equal(p.features.core, true);
  }
  for (const k of FEATURE_KEYS) {
    if (PLANS.free.features[k]) assert.ok(PLANS.basic.features[k], k);
    if (PLANS.basic.features[k]) assert.ok(PLANS.pro.features[k], k);
  }
  assert.equal(PLANS.free.features.fees, false);
  assert.equal(PLANS.pro.features.accounts, true);
});

test('planLimits / planFeatures return copies', () => {
  planLimits('free').student = 9999;
  planFeatures('free').fees = true;
  assert.equal(PLANS.free.limits.student, 30);
  assert.equal(PLANS.free.features.fees, false);
});

test('checkLimit', () => {
  const limits = PLANS.free.limits;
  assert.equal(checkLimit(limits, { ...emptyUsage(), student: 29 }, 'student').ok, true);
  assert.equal(checkLimit(limits, { ...emptyUsage(), student: 30 }, 'student').ok, false);
  assert.equal(checkLimit(limits, { ...emptyUsage(), student: 25 }, 'student', 6).ok, false);
  assert.equal(checkLimit(limits, emptyUsage(), 'admin').ok, true);
  assert.equal(checkLimit(limits, { admin: 1 }, 'admin').ok, false);
  assert.equal(checkLimit({}, emptyUsage(), 'teacher').ok, false, 'missing limit means zero');
  assert.throws(() => checkLimit(limits, emptyUsage(), 'owner'));
});
