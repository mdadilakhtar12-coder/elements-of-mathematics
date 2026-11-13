'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'demo-coachsaas';
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const P = require('../../src/payments');
const A = require('../../src/accounts');
const { AppError } = require('../../src/errors');
if (!getApps().length) initializeApp({ projectId: 'demo-coachsaas' });
const db = getFirestore();
const auth = getAuth();
const DAY = 86400000;
let clock;
let calls;
let cfOrders; // what the fake Cashfree knows
const fakeFetch = async (url, opts) => {
  calls.push({ url, method: opts.method, headers: opts.headers, body: opts.body ? JSON.parse(opts.body) : null });
  if (opts.method === 'POST' && url.endsWith('/orders')) {
    const b = JSON.parse(opts.body);
    cfOrders[b.order_id] = { order_id: b.order_id, order_amount: b.order_amount, order_status: 'ACTIVE' };
    return { ok: true, status: 200, json: async () => ({ cf_order_id: 123, payment_session_id: 'sess_' + b.order_id }) };
  }
  const id = decodeURIComponent(url.split('/orders/')[1]);
  return { ok: true, status: 200, json: async () => cfOrders[id] || { order_status: 'NOT_FOUND' } };
};
const deps = () => ({ db, auth, Timestamp, fetch: fakeFetch, now: () => clock });
const rejects = (p, code) => assert.rejects(p, (e) => e instanceof AppError && e.code === code);
const owner = { uid: 'own1', token: { inst: 'alpha', role: 'admin', email: 'own@gmail.com' } };
const sa = { uid: 'root', token: { sa: true } };

beforeEach(async () => {
  clock = Date.UTC(2026, 10, 13);
  calls = []; cfOrders = {};
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-coachsaas/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-coachsaas/accounts`, { method: 'DELETE' });
  await db.doc('institutes/alpha').set({ name: 'Alpha', plan: 'free', status: 'active', expiresAt: null, ownerUid: 'own1', usage: { admin: 1, subadmin: 0, teacher: 1, student: 1 }, limits: {}, features: {} });
  await db.doc('institutes/alpha/users/own1').set({ role: 'admin', active: true, name: 'Owner' });
  await db.doc('institutes/alpha/users/t1').set({ role: 'teacher', active: true, name: 'T' });
});

const configure = () => P.setPaymentConfig(deps(), sa, { appId: 'APP123', secretKey: 'SECRET999', env: 'sandbox', feePercent: 2 });

test('config: super admin only, secret never returned, empty fields keep old values', async () => {
  await rejects(P.setPaymentConfig(deps(), owner, { appId: 'x' }), 'permission-denied');
  const st = await configure();
  assert.deepEqual(st, { configured: true, env: 'sandbox', feePercent: 2, appIdHint: '...P123', secretHint: '...T999', siteUrl: 'https://demo-coachsaas.web.app' });
  await P.setPaymentConfig(deps(), sa, { appId: '', secretKey: '', feePercent: 1.5 });
  assert.equal((await P.getConfig(db)).secretKey, 'SECRET999');
  await rejects(P.setPaymentConfig(deps(), sa, { env: 'live' }), 'invalid-argument');
  await rejects(P.setPaymentConfig(deps(), sa, { feePercent: 50 }), 'invalid-argument');
});

test('buying: price is computed on the server, order sent to Cashfree, plan applied once after PAID', async () => {
  await rejects(P.createPlanOrder(deps(), owner, { plan: 'basic', period: 'month', phone: '9876543210' }), 'failed-precondition'); // keys missing
  await configure();
  await rejects(P.createPlanOrder(deps(), { uid: 't1', token: { inst: 'alpha' } }, { plan: 'basic', period: 'month', phone: '9876543210' }), 'permission-denied');
  await rejects(P.createPlanOrder(deps(), owner, { plan: 'basic', period: 'month', phone: '123' }), 'invalid-argument');
  const r = await P.createPlanOrder(deps(), owner, { plan: 'basic', period: 'month', phone: '+91 98765 43210', amount: 1 });
  assert.equal(r.total, 202.98); assert.equal(r.paymentSessionId, 'sess_' + r.orderId);
  const sent = calls[0];
  assert.equal(sent.url, 'https://sandbox.cashfree.com/pg/orders');
  assert.equal(sent.headers['x-client-id'], 'APP123');
  assert.equal(sent.body.order_amount, 202.98);
  assert.equal(sent.body.customer_details.customer_phone, '9876543210');
  assert.match(sent.body.order_meta.notify_url, /\/api\/cashfree-webhook$/);
  // not paid yet
  assert.equal((await P.verifyPlanOrder(deps(), owner, { orderId: r.orderId })).status, 'ACTIVE');
  assert.equal((await db.doc('institutes/alpha').get()).data().plan, 'free');
  // paid
  cfOrders[r.orderId].order_status = 'PAID';
  const v = await P.verifyPlanOrder(deps(), owner, { orderId: r.orderId });
  assert.equal(v.status, 'PAID'); assert.equal(v.expiresAt, clock + 30 * DAY);
  const i = (await db.doc('institutes/alpha').get()).data();
  assert.equal(i.plan, 'basic'); assert.equal(i.limits.student, 150); assert.equal(i.features.exams, true);
  // second time (webhook + return page both arrive) changes nothing
  const again = await P.applyPaidOrder(deps(), r.orderId, cfOrders[r.orderId]);
  assert.equal(again.applied, false);
  assert.equal((await db.doc('institutes/alpha').get()).data().expiresAt.toMillis(), clock + 30 * DAY);
});

test('renewing the same plan adds time after the current end; another institute cannot see the order', async () => {
  await configure();
  const a = await P.createPlanOrder(deps(), owner, { plan: 'starter', period: 'month', phone: '9876543210' });
  cfOrders[a.orderId].order_status = 'PAID';
  await P.verifyPlanOrder(deps(), owner, { orderId: a.orderId });
  clock += 10 * DAY;
  const b = await P.createPlanOrder(deps(), owner, { plan: 'starter', period: 'year', phone: '9876543210' });
  cfOrders[b.orderId].order_status = 'PAID';
  const v = await P.verifyPlanOrder(deps(), owner, { orderId: b.orderId });
  assert.equal(v.expiresAt, Date.UTC(2026, 10, 13) + 30 * DAY + 365 * DAY);
  await db.doc('institutes/beta').set({ name: 'B', plan: 'free', status: 'active' });
  await db.doc('institutes/beta/users/own2').set({ role: 'admin', active: true });
  await rejects(P.verifyPlanOrder(deps(), { uid: 'own2', token: { inst: 'beta' } }, { orderId: a.orderId }), 'not-found');
});

test('a wrong amount from the gateway is not applied', async () => {
  await configure();
  const r = await P.createPlanOrder(deps(), owner, { plan: 'pro', period: 'month', phone: '9876543210' });
  Object.assign(cfOrders[r.orderId], { order_status: 'PAID', order_amount: 1 });
  const res = await P.applyPaidOrder(deps(), r.orderId, cfOrders[r.orderId]);
  assert.equal(res.applied, false);
  assert.equal((await db.doc('institutes/alpha').get()).data().plan, 'free');
  assert.equal((await db.doc('orders/' + r.orderId).get()).data().status, 'mismatch');
});

test('webhook: bad signature 401; good one applies the order read back from Cashfree', async () => {
  await configure();
  const r = await P.createPlanOrder(deps(), owner, { plan: 'growth', period: 'month', phone: '9876543210' });
  cfOrders[r.orderId].order_status = 'PAID';
  const raw = Buffer.from(JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: r.orderId } } }));
  const ts = '1731456000';
  const sig = crypto.createHmac('sha256', 'SECRET999').update(ts + raw.toString()).digest('base64');
  assert.equal(await P.handleWebhook(deps(), { rawBody: raw, headers: { 'x-webhook-timestamp': ts, 'x-webhook-signature': 'nope' } }), 401);
  assert.equal((await db.doc('institutes/alpha').get()).data().plan, 'free');
  assert.equal(await P.handleWebhook(deps(), { rawBody: raw, headers: { 'x-webhook-timestamp': ts, 'x-webhook-signature': sig } }), 200);
  assert.equal((await db.doc('institutes/alpha').get()).data().plan, 'growth');
});

test('suspended institutes cannot buy; expired ones can', async () => {
  await configure();
  await db.doc('institutes/alpha').update({ status: 'suspended' });
  await rejects(P.createPlanOrder(deps(), owner, { plan: 'basic', period: 'month', phone: '9876543210' }), 'failed-precondition');
  await db.doc('institutes/alpha').update({ status: 'active', plan: 'basic', expiresAt: Timestamp.fromMillis(clock - DAY) });
  const r = await P.createPlanOrder(deps(), owner, { plan: 'basic', period: 'month', phone: '9876543210' });
  cfOrders[r.orderId].order_status = 'PAID';
  assert.equal((await P.verifyPlanOrder(deps(), owner, { orderId: r.orderId })).expiresAt, clock + 30 * DAY, 'expired time is not counted');
});

test('expired paid plans go back to Free; Free and future ones stay', async () => {
  await db.doc('institutes/alpha').update({ plan: 'pro', expiresAt: Timestamp.fromMillis(clock - 1000) });
  await db.doc('institutes/beta').set({ name: 'B', plan: 'basic', status: 'active', expiresAt: Timestamp.fromMillis(clock + DAY) });
  await db.doc('institutes/gamma').set({ name: 'G', plan: 'free', status: 'active', expiresAt: Timestamp.fromMillis(clock - DAY) });
  assert.equal(await P.downgradeExpired(deps()), 1);
  const a = (await db.doc('institutes/alpha').get()).data();
  assert.equal(a.plan, 'free'); assert.equal(a.expiresAt, null); assert.equal(a.downgradedFrom, 'pro'); assert.equal(a.limits.student, 30);
  assert.equal((await db.doc('institutes/beta').get()).data().plan, 'basic');
  assert.equal((await db.doc('institutes/alpha/users/t1').get()).exists, true, 'no data is deleted');
});

test('listOrders is for the super admin only', async () => {
  await configure();
  await P.createPlanOrder(deps(), owner, { plan: 'basic', period: 'month', phone: '9876543210' });
  await rejects(P.listOrders(deps(), owner, {}), 'permission-denied');
  const l = await P.listOrders(deps(), sa, {});
  assert.equal(l.orders.length, 1); assert.equal(l.orders[0].status, 'created');
});

test('deleteMyAccount: a student deletes only themselves; the owner deletes the whole institute after typing the code', async () => {
  await auth.createUser({ uid: 'own1', email: 'own@gmail.com' });
  await auth.createUser({ uid: 's1', email: 's1@alpha.login.coachsaas.app', password: 'Kite48x1' });
  await auth.createUser({ uid: 's2', email: 's2@alpha.login.coachsaas.app', password: 'Kite48x1' });
  await auth.createUser({ uid: 'x1', email: 'x1@beta.login.coachsaas.app', password: 'Kite48x1' });
  await db.doc('institutes/alpha/users/s1').set({ role: 'student', active: true });
  await db.doc('institutes/alpha/users/s2').set({ role: 'student', active: true });
  await db.doc('institutes/alpha').update({ 'usage.student': 2 });
  await db.doc('institutes/alpha/devices/tokS1').set({ uid: 's1' });
  const d = { db, auth, Timestamp };
  assert.equal((await A.deleteMyAccount(d, { uid: 's1', token: { inst: 'alpha' } }, {})).deleted, 'account');
  assert.equal((await db.doc('institutes/alpha/users/s1').get()).exists, false);
  assert.equal((await db.doc('institutes/alpha/devices/tokS1').get()).exists, false);
  assert.equal((await db.doc('institutes/alpha').get()).data().usage.student, 1);
  await assert.rejects(auth.getUser('s1'));
  await rejects(A.deleteMyAccount(d, owner, { confirmCode: 'wrong' }), 'failed-precondition');
  assert.equal((await A.deleteMyAccount(d, owner, { confirmCode: 'ALPHA' })).deleted, 'institute');
  assert.equal((await db.doc('institutes/alpha').get()).exists, false);
  assert.equal((await db.doc('institutes/alpha/users/t1').get()).exists, false);
  await assert.rejects(auth.getUser('s2'));
  await assert.rejects(auth.getUser('own1'));
  assert.ok(await auth.getUser('x1'), 'other institutes untouched');
});
