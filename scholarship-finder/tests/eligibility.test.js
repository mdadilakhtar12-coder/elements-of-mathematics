import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysLeft, isOpen, checkEligibility, todayIST } from '../shared/eligibility.js';

const base = {
  id: 'x',
  status: 'published',
  official_link: 'https://example.gov.in',
  last_date: '2026-10-31',
  levels: ['class12'],
  categories: [],
  gender: 'any',
  state: 'All India',
  max_income: null,
  disability_only: false,
  min_percentage: null,
};

test('daysLeft counts whole days in India time', () => {
  assert.equal(daysLeft('2026-10-31', '2026-10-14'), 17);
  assert.equal(daysLeft('2026-10-14', '2026-10-14'), 0);
  assert.equal(daysLeft('2026-10-13', '2026-10-14'), -1);
});

test('todayIST gives a YYYY-MM-DD string in India time', () => {
  // 2026-10-13 20:00 UTC is 2026-10-14 01:30 in India
  assert.equal(todayIST(new Date('2026-10-13T20:00:00Z')), '2026-10-14');
});

test('isOpen hides drafts, expired and link-less items', () => {
  assert.equal(isOpen(base, '2026-10-14'), true);
  assert.equal(isOpen({ ...base, status: 'draft' }, '2026-10-14'), false);
  assert.equal(isOpen({ ...base, official_link: '' }, '2026-10-14'), false);
  assert.equal(isOpen(base, '2026-11-01'), false);
  assert.equal(isOpen({ ...base, last_date: '2026-10-14' }, '2026-10-14'), true, 'last day is still open');
});

test('category, gender, state, income and disability rules', () => {
  const s = { ...base, categories: ['SC'], gender: 'female', state: 'Odisha', max_income: 250000, disability_only: true };
  const ok = { level: 'class12', category: 'SC', gender: 'female', state: 'Odisha', income: 100000, disability: true };
  assert.deepEqual(checkEligibility(s, ok), { eligible: true, failed: [] });
  assert.deepEqual(checkEligibility(s, { ...ok, category: 'General' }).failed, ['category']);
  assert.deepEqual(checkEligibility(s, { ...ok, gender: 'male' }).failed, ['gender']);
  assert.deepEqual(checkEligibility(s, { ...ok, state: 'Bihar' }).failed, ['state']);
  assert.deepEqual(checkEligibility(s, { ...ok, income: 300000 }).failed, ['income']);
  assert.deepEqual(checkEligibility(s, { ...ok, disability: false }).failed, ['disability']);
});

test('level and marks rules', () => {
  const s = { ...base, min_percentage: 60 };
  assert.equal(checkEligibility(s, { level: 'class10', percentage: 90 }).eligible, false);
  assert.equal(checkEligibility(s, { level: 'class12', percentage: 55 }).eligible, false);
  assert.equal(checkEligibility(s, { level: 'class12', percentage: 60 }).eligible, true);
});

test('unknown profile values never exclude a scholarship', () => {
  const s = { ...base, categories: ['SC'], gender: 'female', state: 'Odisha', max_income: 1, min_percentage: 90 };
  assert.equal(checkEligibility(s, {}).eligible, true);
});
