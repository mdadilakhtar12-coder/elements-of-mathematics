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
  const order = ['free', 'starter', 'basic', 'growth', 'pro'];
  for (let i = 1; i < order.length; i++) {
    const lo = PLANS[order[i - 1]], hi = PLANS[order[i]];
    for (const k of FEATURE_KEYS) if (lo.features[k]) assert.ok(hi.features[k], `${hi.id} must keep ${k}`);
    for (const r of ['subadmin', 'teacher', 'student']) assert.ok(hi.limits[r] >= lo.limits[r], `${hi.id} ${r}`);
    assert.ok(hi.pricePerMonth > lo.pricePerMonth);
    assert.equal(hi.pricePerYear, hi.pricePerMonth * 10, 'a year costs 10 months');
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

test('agreed prices and limits', () => {
  assert.deepEqual(Object.values(PLANS).map((p) => [p.id, p.pricePerMonth]), [['free', 0], ['starter', 99], ['basic', 199], ['growth', 299], ['pro', 499]]);
  assert.deepEqual(Object.values(PLANS).map((p) => p.limits.student), [30, 75, 150, 300, 600]);
  assert.deepEqual(Object.values(PLANS).map((p) => p.limits.teacher), [5, 8, 15, 25, 50]);
  assert.equal(PLANS.free.features.student_login, false);
  assert.equal(PLANS.starter.features.student_login, true); assert.equal(PLANS.starter.features.fees, true); assert.equal(PLANS.starter.features.exams, false);
  assert.equal(PLANS.basic.features.exams, true); assert.equal(PLANS.basic.features.accounts, false);
  assert.equal(PLANS.growth.features.accounts, true); assert.equal(PLANS.growth.features.doubts, true);
});
