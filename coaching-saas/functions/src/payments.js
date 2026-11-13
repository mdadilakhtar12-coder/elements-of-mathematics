'use strict';
/**
 * Plan purchases with Cashfree (on the website, never inside the Android app).
 *
 *  1. The institute admin picks a plan + month/year on the website -> createPlanOrder()
 *     The price is computed HERE (never trusted from the browser); the gateway charge is added on top
 *     because the buyer pays it. A Cashfree order is created and its payment_session_id goes back.
 *  2. The browser opens Cashfree's checkout. When it comes back, verifyPlanOrder() asks Cashfree for the
 *     order; Cashfree also calls our webhook. Either path calls applyPaidOrder(), which is idempotent.
 *  3. The plan, limits and features are set and the expiry moves forward. When a paid plan runs out,
 *     downgradeExpired() (hourly) puts the institute back on Free; no data is deleted.
 *
 * Keys live in Firestore private/payments, which no app or browser can read (rules deny everything there).
 * The super admin sets them from the panel; they are never sent back to any client.
 */
const crypto = require('node:crypto');
const { AppError } = require('./errors');
const { PLANS, planLimits, planFeatures } = require('./plans');

const DAY = 86400000;
const PERIOD_DAYS = { month: 30, year: 365 };
const API_VERSION = '2023-08-01';
const DEFAULT_FEE_PERCENT = 2.0;

const configRef = (db) => db.collection('private').doc('payments');
const orderRef = (db, id) => db.collection('orders').doc(id);
const instRef = (db, id) => db.collection('institutes').doc(id);

const round2 = (n) => Math.round(n * 100) / 100;

/** Price of a paid plan for a month or a year, with the gateway charge the buyer pays. */
function quote(planId, period, feePercent = DEFAULT_FEE_PERCENT) {
  const plan = PLANS[planId];
  if (!plan || plan.pricePerMonth <= 0) throw new AppError('invalid-argument', 'Choose a paid plan.');
  if (!PERIOD_DAYS[period]) throw new AppError('invalid-argument', 'Choose monthly or yearly.');
  const base = period === 'year' ? plan.pricePerYear : plan.pricePerMonth;
  const fee = round2((base * feePercent) / 100);
  return { plan: planId, period, base, fee, total: round2(base + fee), days: PERIOD_DAYS[period] };
}

/** All plans with both prices, for the website (public information). */
function catalogue(feePercent = DEFAULT_FEE_PERCENT) {
  return Object.values(PLANS).map((p) => ({
    id: p.id, name: p.name, order: p.order, pricePerMonth: p.pricePerMonth, pricePerYear: p.pricePerYear,
    limits: p.limits, features: p.features, feePercent,
  }));
}

// ------------------------------------------------------------------ config (super admin)

async function getConfig(db) {
  const snap = await configRef(db).get();
  const c = snap.exists ? snap.data() : {};
  return {
    appId: c.appId || '', secretKey: c.secretKey || '', env: c.env === 'production' ? 'production' : 'sandbox',
    feePercent: Number.isFinite(c.feePercent) ? c.feePercent : DEFAULT_FEE_PERCENT,
    siteUrl: c.siteUrl || `https://${process.env.GCLOUD_PROJECT || 'attendance-app-1cdf6'}.web.app`,
  };
}

const hint = (s) => (s ? '...' + String(s).slice(-4) : '');

function requireSuper(caller) {
  if (!caller?.uid) throw new AppError('unauthenticated', 'Please sign in.');
  if (caller.token?.sa !== true) throw new AppError('permission-denied', 'Super admin only.');
}

/** Saves the Cashfree keys. Empty fields keep the saved value, so the secret never has to be shown again. */
async function setPaymentConfig(deps, caller, data) {
  requireSuper(caller);
  const cur = await getConfig(deps.db);
  const next = { ...cur };
  if (typeof data?.appId === 'string' && data.appId.trim()) next.appId = data.appId.trim();
  if (typeof data?.secretKey === 'string' && data.secretKey.trim()) next.secretKey = data.secretKey.trim();
  if (data?.env != null) {
    if (!['sandbox', 'production'].includes(data.env)) throw new AppError('invalid-argument', 'env must be sandbox or production.');
    next.env = data.env;
  }
  if (data?.feePercent != null) {
    const f = Number(data.feePercent);
    if (!Number.isFinite(f) || f < 0 || f > 10) throw new AppError('invalid-argument', 'Payment charge must be 0-10 %.');
    next.feePercent = f;
  }
  if (typeof data?.siteUrl === 'string' && data.siteUrl.trim()) {
    if (!/^https:\/\/[a-z0-9.-]+(\/)?$/i.test(data.siteUrl.trim())) throw new AppError('invalid-argument', 'Website must look like https://example.com');
    next.siteUrl = data.siteUrl.trim().replace(/\/$/, '');
  }
  await configRef(deps.db).set({ ...next, updatedAt: deps.Timestamp.now(), updatedBy: caller.uid });
  await deps.db.collection('audit').add({ by: caller.uid, action: 'setPaymentConfig', inst: null, detail: { env: next.env, feePercent: next.feePercent }, at: deps.Timestamp.now() });
  return paymentStatusOf(next);
}

function paymentStatusOf(c) {
  return { configured: !!(c.appId && c.secretKey), env: c.env, feePercent: c.feePercent, appIdHint: hint(c.appId), secretHint: hint(c.secretKey), siteUrl: c.siteUrl };
}

async function getPaymentStatus(deps, caller) {
  requireSuper(caller);
  return paymentStatusOf(await getConfig(deps.db));
}

// ------------------------------------------------------------------ Cashfree API

function apiBase(env) {
  return env === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

async function cashfree(deps, cfg, method, path, body) {
  const doFetch = deps.fetch || fetch;
  let res;
  try {
    res = await doFetch(apiBase(cfg.env) + path, {
      method,
      headers: {
        'content-type': 'application/json',
        'x-api-version': API_VERSION,
        'x-client-id': cfg.appId,
        'x-client-secret': cfg.secretKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new AppError('unavailable', 'Could not reach the payment gateway. Please try again.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // never echo keys; the gateway message is safe to show
    throw new AppError('unavailable', 'Payment gateway: ' + (json.message || 'request failed (' + res.status + ')'));
  }
  return json;
}

// ------------------------------------------------------------------ buying

/** The institute admin (owner) who is paying. Expired institutes may pay; suspended ones must contact support. */
async function loadBuyer(deps, caller) {
  if (!caller?.uid) throw new AppError('unauthenticated', 'Please sign in.');
  const inst = caller.token?.inst;
  if (!inst) throw new AppError('permission-denied', 'This account does not have an institute yet. Register it in the app first.');
  const [iSnap, uSnap] = await Promise.all([instRef(deps.db, inst).get(), instRef(deps.db, inst).collection('users').doc(caller.uid).get()]);
  if (!iSnap.exists || !uSnap.exists) throw new AppError('permission-denied', 'Account not found.');
  const me = uSnap.data();
  if (me.role !== 'admin' || me.active !== true) throw new AppError('permission-denied', 'Only the institute admin can buy a plan.');
  const institute = iSnap.data();
  if (institute.status === 'suspended') throw new AppError('failed-precondition', 'This institute is suspended. Please contact support.');
  return { inst, institute, me };
}

/** What the website shows after sign-in: the institute, its plan and the price list with the payment charge. */
async function myBilling(deps, caller) {
  const { inst, institute } = await loadBuyer(deps, caller);
  const cfg = await getConfig(deps.db);
  const exp = institute.expiresAt;
  return {
    inst, name: institute.name, plan: institute.plan,
    expiresAt: exp && typeof exp.toMillis === 'function' ? exp.toMillis() : null,
    usage: institute.usage || {}, plans: catalogue(cfg.feePercent), paymentsOn: !!(cfg.appId && cfg.secretKey), env: cfg.env,
  };
}

async function createPlanOrder(deps, caller, data) {
  const { inst, institute, me } = await loadBuyer(deps, caller);
  const cfg = await getConfig(deps.db);
  if (!cfg.appId || !cfg.secretKey) throw new AppError('failed-precondition', 'Online payments are not switched on yet. Please contact support.');
  const q = quote(String(data?.plan ?? ''), String(data?.period ?? ''), cfg.feePercent);
  const phone = String(data?.phone ?? '').replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) throw new AppError('invalid-argument', 'Enter a valid 10-digit mobile number.');

  const now = deps.now ? deps.now() : Date.now();
  const orderId = 'bp_' + inst + '_' + now.toString(36) + crypto.randomBytes(2).toString('hex');
  await orderRef(deps.db, orderId).set({
    inst, uid: caller.uid, plan: q.plan, period: q.period, base: q.base, fee: q.fee, amount: q.total, days: q.days,
    status: 'created', env: cfg.env, createdAt: deps.Timestamp.fromMillis(now), institute: institute.name || inst,
  });
  const cf = await cashfree(deps, cfg, 'POST', '/orders', {
    order_id: orderId,
    order_amount: q.total,
    order_currency: 'INR',
    customer_details: {
      customer_id: caller.uid.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 50) || 'customer',
      customer_phone: phone,
      customer_email: caller.token?.email || undefined,
      customer_name: (me.name || institute.name || 'Customer').slice(0, 100),
    },
    order_meta: {
      return_url: cfg.siteUrl + '/buy.html?order_id={order_id}',
      notify_url: cfg.siteUrl + '/api/cashfree-webhook',
    },
    order_note: `BatchPilot ${PLANS[q.plan].name} (${q.period}) - ${inst}`,
  });
  if (!cf.payment_session_id) throw new AppError('unavailable', 'The payment gateway did not start the payment. Please try again.');
  await orderRef(deps.db, orderId).update({ cfOrderId: cf.cf_order_id ?? null });
  return { orderId, paymentSessionId: cf.payment_session_id, env: cfg.env, ...q };
}

/**
 * Applies a paid order exactly once. The amount must match what we asked for.
 * Same plan bought again before it ends: the new days are added after the current end. A different plan starts now.
 */
async function applyPaidOrder(deps, orderId, cfOrder) {
  const now = deps.now ? deps.now() : Date.now();
  return deps.db.runTransaction(async (tx) => {
    const oRef = orderRef(deps.db, orderId);
    const oSnap = await tx.get(oRef);
    if (!oSnap.exists) return { applied: false, reason: 'unknown order' };
    const o = oSnap.data();
    if (o.status === 'paid') return { applied: false, reason: 'already applied', expiresAt: o.newExpiry };
    if (cfOrder?.order_status !== 'PAID') return { applied: false, reason: 'not paid', status: cfOrder?.order_status || 'UNKNOWN' };
    if (Math.abs(Number(cfOrder.order_amount) - o.amount) > 0.001) {
      tx.update(oRef, { status: 'mismatch', checkedAt: deps.Timestamp.fromMillis(now) });
      return { applied: false, reason: 'amount mismatch' };
    }
    const iRef = instRef(deps.db, o.inst);
    const i = (await tx.get(iRef)).data() || {};
    const curEnd = i.expiresAt && typeof i.expiresAt.toMillis === 'function' ? i.expiresAt.toMillis() : 0;
    const start = i.plan === o.plan && curEnd > now ? curEnd : now;
    const newExpiry = start + o.days * DAY;
    tx.update(iRef, {
      plan: o.plan, limits: planLimits(o.plan), features: planFeatures(o.plan),
      expiresAt: deps.Timestamp.fromMillis(newExpiry), lastPaymentAt: deps.Timestamp.fromMillis(now),
    });
    tx.update(oRef, { status: 'paid', paidAt: deps.Timestamp.fromMillis(now), newExpiry, cfPaid: Number(cfOrder.order_amount) });
    tx.set(deps.db.collection('audit').doc('pay_' + orderId), {
      by: o.uid, action: 'planPaid', inst: o.inst, detail: { orderId, plan: o.plan, period: o.period, amount: o.amount }, at: deps.Timestamp.fromMillis(now),
    });
    return { applied: true, plan: o.plan, expiresAt: newExpiry };
  });
}

/** Called by the website after Cashfree sends the buyer back. Asks Cashfree (never trusts the browser). */
async function verifyPlanOrder(deps, caller, data) {
  const { inst } = await loadBuyer(deps, caller);
  const orderId = String(data?.orderId ?? '');
  const snap = await orderRef(deps.db, orderId).get();
  if (!snap.exists || snap.data().inst !== inst) throw new AppError('not-found', 'Order not found.');
  const o = snap.data();
  if (o.status === 'paid') return { status: 'PAID', plan: o.plan, expiresAt: o.newExpiry };
  const cfg = await getConfig(deps.db);
  const cf = await cashfree(deps, cfg, 'GET', '/orders/' + encodeURIComponent(orderId));
  const r = await applyPaidOrder(deps, orderId, cf);
  return { status: cf.order_status || 'UNKNOWN', plan: o.plan, expiresAt: r.expiresAt ?? null };
}

// ------------------------------------------------------------------ webhook

/** Cashfree signs webhooks: base64(HMAC-SHA256(timestamp + rawBody, secretKey)). */
function verifySignature(rawBody, timestamp, signature, secret) {
  if (!rawBody || !timestamp || !signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(String(timestamp) + rawBody.toString('utf8')).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Returns an HTTP status. Bad signature -> 401. Anything else -> 200 (Cashfree retries otherwise). */
async function handleWebhook(deps, { rawBody, headers }) {
  const cfg = await getConfig(deps.db);
  const ok = verifySignature(rawBody, headers['x-webhook-timestamp'], headers['x-webhook-signature'], cfg.secretKey);
  if (!ok) return 401;
  let body;
  try {
    body = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return 200;
  }
  const orderId = body?.data?.order?.order_id;
  if (!orderId || !String(orderId).startsWith('bp_')) return 200;
  // The order itself is read back from Cashfree, so a replayed or edited event changes nothing.
  const cf = await cashfree(deps, cfg, 'GET', '/orders/' + encodeURIComponent(orderId));
  await applyPaidOrder(deps, orderId, cf);
  return 200;
}

// ------------------------------------------------------------------ expiry

/** Paid plans that ran out go back to Free (data is kept; adding beyond Free limits is blocked). */
async function downgradeExpired(deps) {
  const now = deps.now ? deps.now() : Date.now();
  const snap = await deps.db.collection('institutes').where('expiresAt', '<=', deps.Timestamp.fromMillis(now)).get();
  let n = 0;
  for (const d of snap.docs) {
    const i = d.data();
    if (!i.plan || i.plan === 'free') continue;
    await d.ref.update({
      plan: 'free', limits: planLimits('free'), features: planFeatures('free'), expiresAt: null,
      downgradedAt: deps.Timestamp.fromMillis(now), downgradedFrom: i.plan,
    });
    await deps.db.collection('audit').add({ by: 'system', action: 'downgradeExpired', inst: d.id, detail: { from: i.plan }, at: deps.Timestamp.fromMillis(now) });
    n++;
  }
  return n;
}

/** Super admin: recent orders. */
async function listOrders(deps, caller, data) {
  requireSuper(caller);
  const limit = Math.min(Math.max(parseInt(data?.limit, 10) || 100, 1), 300);
  const snap = await deps.db.collection('orders').orderBy('createdAt', 'desc').limit(limit).get();
  const ms = (t) => (t && typeof t.toMillis === 'function' ? t.toMillis() : t ?? null);
  return {
    orders: snap.docs.map((d) => {
      const o = d.data();
      return { id: d.id, inst: o.inst, institute: o.institute, plan: o.plan, period: o.period, amount: o.amount, status: o.status, env: o.env, createdAt: ms(o.createdAt), paidAt: ms(o.paidAt) };
    }),
  };
}

module.exports = {
  quote, catalogue, verifySignature, getConfig, setPaymentConfig, getPaymentStatus, myBilling,
  createPlanOrder, applyPaidOrder, verifyPlanOrder, handleWebhook, downgradeExpired, listOrders, apiBase,
};
