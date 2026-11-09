'use strict';
/** Publishes the plan catalogue (functions/src/plans.js) to plans/{id} for the pricing screen. Re-run after editing plans. */
const path = require('node:path');
// Resolve packages as the functions folder would (works with package "exports"; needs `npm ci` in functions/).
const req = require('node:module').createRequire(path.join(__dirname, '../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
const { PLANS, FEATURES } = require('../functions/src/plans');

(async () => {
  initializeApp();
  const db = getFirestore();
  for (const p of Object.values(PLANS)) await db.collection('plans').doc(p.id).set({ ...p, featureLabels: FEATURES });
  console.log('Seeded plans:', Object.keys(PLANS).join(', '));
})().catch((e) => { console.error(e.message); process.exit(1); });
