'use strict';
/** One-time: sets batches/{id}.teacherIds for every existing batch (new batches get it automatically). Safe to re-run. */
const path = require('node:path');
const req = require('node:module').createRequire(path.join(__dirname, '../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
const { syncBatchTeachers } = require('../functions/src/integrity');

(async () => {
  initializeApp();
  const snap = await getFirestore().collectionGroup('batches').get();
  let changed = 0;
  for (const d of snap.docs) if (await syncBatchTeachers(d)) changed++;
  console.log(`Batches checked: ${snap.size}, updated: ${changed}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
