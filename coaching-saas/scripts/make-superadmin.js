'use strict';
/**
 * Gives a Firebase Auth user the super-admin claim (sa: true). Run once for yourself:
 *   cd functions && GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json node ../scripts/make-superadmin.js you@gmail.com
 * The user must sign out and in again (or refresh the ID token) afterwards.
 */
const path = require('node:path');
// Resolve packages as the functions folder would (works with package "exports"; needs `npm ci` in functions/).
const req = require('node:module').createRequire(path.join(__dirname, '../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getAuth } = req('firebase-admin/auth');

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
})().catch((e) => {
  console.error(e.code === 'auth/user-not-found' ? 'Is e-mail ka user nahi mila: pehle isi Google account se admin panel (ya app) mein ek baar login karo, phir dobara chalao.' : e.message);
  process.exit(1);
});
