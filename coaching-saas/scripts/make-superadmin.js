'use strict';
/**
 * Gives a Firebase Auth user the super-admin claim (sa: true). Run once for yourself:
 *   cd functions && GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json node ../scripts/make-superadmin.js you@gmail.com
 * The user must sign out and in again (or refresh the ID token) afterwards.
 */
const path = require('node:path');
const { initializeApp } = require(path.join(__dirname, '../functions/node_modules/firebase-admin/app'));
const { getAuth } = require(path.join(__dirname, '../functions/node_modules/firebase-admin/auth'));

(async () => {
  const email = process.argv[2];
  if (!email) { console.error('usage: make-superadmin.js <email> [--remove]'); process.exit(1); }
  initializeApp();
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  const claims = { ...(user.customClaims || {}) };
  if (process.argv.includes('--remove')) delete claims.sa; else claims.sa = true;
  await auth.setCustomUserClaims(user.uid, claims);
  console.log(`${email}: sa=${claims.sa === true}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
