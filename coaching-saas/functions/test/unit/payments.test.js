'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const P = require('../../src/payments');

test('quote: monthly / yearly price plus the payment charge the buyer pays', () => {
  assert.deepEqual(P.quote('starter', 'month', 2), { plan: 'starter', period: 'month', base: 99, fee: 1.98, total: 100.98, days: 30 });
  assert.deepEqual(P.quote('pro', 'year', 2), { plan: 'pro', period: 'year', base: 4990, fee: 99.8, total: 5089.8, days: 365 });
  assert.equal(P.quote('basic', 'month', 0).total, 199);
  assert.throws(() => P.quote('free', 'month'));
  assert.throws(() => P.quote('gold', 'month'));
  assert.throws(() => P.quote('basic', 'week'));
});

test('catalogue lists all five plans in order', () => {
  assert.deepEqual(P.catalogue().map((p) => p.id), ['free', 'starter', 'basic', 'growth', 'pro']);
});

test('webhook signature: only the right secret, body and timestamp pass', () => {
  const body = Buffer.from('{"data":{"order":{"order_id":"bp_x_1"}}}');
  const ts = '1700000000';
  const sig = crypto.createHmac('sha256', 'sec').update(ts + body.toString()).digest('base64');
  assert.equal(P.verifySignature(body, ts, sig, 'sec'), true);
  assert.equal(P.verifySignature(body, ts, sig, 'other'), false);
  assert.equal(P.verifySignature(Buffer.from(body.toString().replace('x', 'y')), ts, sig, 'sec'), false);
  assert.equal(P.verifySignature(body, '1700000001', sig, 'sec'), false);
  assert.equal(P.verifySignature(body, ts, '', 'sec'), false);
});

test('sandbox and production API addresses', () => {
  assert.equal(P.apiBase('sandbox'), 'https://sandbox.cashfree.com/pg');
  assert.equal(P.apiBase('production'), 'https://api.cashfree.com/pg');
});
