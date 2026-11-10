'use strict';
/**
 * After a new feature is added to functions/src/plans.js: gives every existing institute the missing feature keys,
 * using its plan's default. Keys an institute already has (including super-admin overrides) are left untouched.
 */
const path = require('node:path');
const req = require('node:module').createRequire(path.join(__dirname, '../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
const { PLANS, planFeatures } = require('../functions/src/plans');

(async () => {
  initializeApp();
  const db = getFirestore();
  const snap = await db.collection('institutes').get();
  let changed = 0;
  for (const d of snap.docs) {
    const i = d.data();
    const defaults = planFeatures(PLANS[i.plan] ? i.plan : 'free');
    const update = {};
    for (const [k, v] of Object.entries(defaults)) if (!(k in (i.features || {}))) update[`features.${k}`] = v;
    if (Object.keys(update).length) { await d.ref.update(update); changed++; console.log(d.id, '+', Object.keys(update).join(', ')); }
  }
  console.log(`Institutes checked: ${snap.size}, updated: ${changed}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
