'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../../../admin-web/logic.js');
const { FEATURES } = require('../../src/plans');

const NOW = Date.UTC(2026, 10, 9);
const list = [
  { id: 'aspire', name: 'Aspire Science', plan: 'free', status: 'active', expiresAt: null, ownerEmail: 'a@x.com', usage: { student: 10 } },
  { id: 'bright', name: 'Bright Minds', plan: 'pro', status: 'active', expiresAt: NOW - 1, ownerEmail: 'b@x.com', usage: { student: 100 } },
  { id: 'cosmos', name: 'Cosmos', plan: 'basic', status: 'suspended', expiresAt: NOW + 1000, ownerEmail: 'c@x.com', usage: {} },
];

test('panel feature list matches the plan catalogue', () => assert.deepEqual(Object.keys(L.FEATURES), Object.keys(FEATURES)));

test('statusOf: suspended wins over expiry; expiry in the past is expired', () => {
  assert.deepEqual(list.map((i) => L.statusOf(i, NOW)), ['active', 'expired', 'suspended']);
  assert.equal(L.statusOf({ status: 'suspended', expiresAt: NOW - 5 }, NOW), 'suspended');
});

test('filter and summary', () => {
  assert.deepEqual(L.filterInstitutes(list, { q: 'BRIGHT' }, NOW).map((i) => i.id), ['bright']);
  assert.deepEqual(L.filterInstitutes(list, { q: 'c@x' }, NOW).map((i) => i.id), ['cosmos']);
  assert.deepEqual(L.filterInstitutes(list, { plan: 'free' }, NOW).map((i) => i.id), ['aspire']);
  assert.deepEqual(L.filterInstitutes(list, { status: 'expired' }, NOW).map((i) => i.id), ['bright']);
  assert.deepEqual(L.summarize(list, NOW), { total: 3, active: 1, suspended: 1, expired: 1, paid: 2, students: 110 });
});

test('percent, dates, expiry, limits', () => {
  assert.equal(L.percent(15, 30), 50); assert.equal(L.percent(40, 30), 100); assert.equal(L.percent(0, 0), 0); assert.equal(L.percent(1, 0), 100);
  assert.equal(L.fmtDate(null), 'Never');
  assert.equal(L.parseExpiry(''), null);
  assert.equal(new Date(L.parseExpiry('2026-12-31')).getHours(), 23);
  assert.throws(() => L.parseExpiry('nope'));
  assert.equal(L.extendExpiry(NOW + 86400000 * 10, NOW, 30), NOW + 86400000 * 40, 'extends from the later date');
  assert.equal(L.extendExpiry(NOW - 5, NOW, 30), NOW + 86400000 * 30);
  assert.equal(L.extendExpiry(null, NOW, 1), NOW + 86400000);
  assert.deepEqual(L.limitsFromForm({ admin: '1', subadmin: 2, teacher: '5', student: '30' }), { admin: 1, subadmin: 2, teacher: 5, student: 30 });
  assert.throws(() => L.limitsFromForm({ admin: '1', subadmin: '-2', teacher: '5', student: '30' }));
  assert.throws(() => L.limitsFromForm({ admin: '1.5', subadmin: '2', teacher: '5', student: '30' }));
});
