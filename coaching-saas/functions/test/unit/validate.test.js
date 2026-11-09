'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const v = require('../../src/validate');

test('institute code', () => {
  assert.equal(v.validateCode('Aspire-Science'), null);
  assert.ok(v.validateCode('ab'));
  assert.ok(v.validateCode('has space'));
  assert.ok(v.validateCode('-start'));
  assert.ok(v.validateCode('admin'), 'reserved');
});

test('username & password', () => {
  assert.equal(v.validateUsername('9876543210'), null);
  assert.equal(v.validateUsername('Rahul.K'), null);
  assert.ok(v.validateUsername('a'));
  assert.ok(v.validateUsername('x/y'));
  assert.ok(v.validatePassword('short'));
  assert.equal(v.validatePassword('longenough1'), null);
});

test('login email is unique per (institute, username) and case-insensitive', () => {
  assert.equal(v.loginEmail('Aspire', ' Rahul '), 'rahul@aspire.login.coachsaas.app');
  assert.notEqual(v.loginEmail('a1x', 'rahul'), v.loginEmail('b1x', 'rahul'));
});

test('random passwords are valid and different', () => {
  const a = v.randomPassword(), b = v.randomPassword();
  assert.equal(v.validatePassword(a), null);
  assert.notEqual(a, b);
  assert.match(a, /^[a-zA-Z2-9]+$/);
});

test('who can manage which role', () => {
  assert.equal(v.canManageRole({ role: 'admin' }, 'subadmin'), true);
  assert.equal(v.canManageRole({ role: 'subadmin', perms: ['users'] }, 'student'), true);
  assert.equal(v.canManageRole({ role: 'subadmin', perms: ['users'] }, 'subadmin'), false);
  assert.equal(v.canManageRole({ role: 'subadmin', perms: ['users'] }, 'admin'), false);
  assert.equal(v.canManageRole({ role: 'subadmin', perms: [] }, 'student'), false);
  assert.equal(v.canManageRole({ role: 'teacher' }, 'student'), false);
  assert.equal(v.canManageRole(null, 'student'), false);
});

test('pickProfile keeps only allowed fields and cleans values', () => {
  const p = v.pickProfile({ name: ' A ', role: 'admin', active: false, perms: ['users', 'hack'], monthlyFee: '500', rollNo: 7 }, 'student');
  assert.deepEqual(Object.keys(p).sort(), ['batchIds', 'monthlyFee', 'mobile', 'name', 'parentMobile', 'rollNo', 'standard'].sort());
  assert.equal(p.name, 'A');
  assert.equal(p.monthlyFee, 500);
  assert.deepEqual(v.pickProfile({ perms: ['users', 'hack'] }, 'subadmin').perms, ['users']);
});
