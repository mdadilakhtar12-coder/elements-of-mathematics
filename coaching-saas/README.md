# Coach Hub — multi-institute coaching app (SaaS)

Android (Kotlin + Jetpack Compose) + Firebase (Auth, Firestore, Cloud Functions). Ek hi app, kai institutes, har ka data alag.
Screens/logic purane Aspire Science Academy app se port kiye gaye hain.

```
coaching-saas/
  android/          Android app (package com.coachsaas.app)
  functions/        Cloud Functions (accounts, plan limits, super admin) + tests
  firestore.rules   tenant isolation + suspend/expiry + feature gating
  scripts/          make-superadmin.js, seed-plans.js
  docs/ARCHITECTURE.md
```

## Status

| Phase | Kya | Status |
|---|---|---|
| 1 Neev | data model, rules, plan catalogue, 15 rules tests (emulator) | done |
| 2 Login | institute code + username + password, owner Google / email link, register institute, reset/deactivate/delete (Cloud Functions) | done — backend tested, Android CI-compiled |
| 3-4 Features port | people, batches, timetable, attendance/approvals, exams+Excel, fees, accounts, study, doubts, leaves, backup, report cards | ported (not run on a device yet) |
| 5 Plans | Free/Basic/Pro, limits in a transaction, feature gating (rules + UI), super-admin functions | done — backend tested |
| 6 | Super Admin **web panel** | next |
| 7 | FCM push notifications (abhi purana polling worker hai) | next |

## Plans (functions/src/plans.js)
| | Free | Basic | Pro |
|---|---|---|---|
| Admin / Sub-admin / Teachers / Students | 1 / 1 / 5 / 30 | 1 / 3 / 20 / 200 | 2 / 10 / 100 / 1000 |
| Features | core only | + exams, fees, study, Excel import, message texts, push | everything |

Free ke numbers aapke diye hue hain; Basic/Pro ke numbers aur price **mere andaaze** hain — `plans.js` mein badal do.

## Setup (ek baar)
1. Firebase project banao (Blaze plan zaroori hai Cloud Functions ke liye). Authentication mein **Google** aur **Email/Password** aur **Email link** enable karo.
2. Android app add karo: package `com.coachsaas.app` (+ SHA-1 Google sign-in ke liye). `google-services.json` ko `android/app/` mein rakho
   (ya GitHub secret `GOOGLE_SERVICES_JSON` base64 mein).
3. `cp .firebaserc.example .firebaserc` aur project id daalo. Phir:
   ```
   cd functions && npm ci && cd ..
   npx firebase deploy --only firestore,functions
   GOOGLE_APPLICATION_CREDENTIALS=sa.json node scripts/seed-plans.js
   GOOGLE_APPLICATION_CREDENTIALS=sa.json node scripts/make-superadmin.js you@gmail.com
   ```
4. Email-link login ke liye `-PAUTH_LINK_DOMAIN=<project>.firebaseapp.com` (ya env var) do aur Console → Authentication → Settings mein wo domain authorize karo.
5. Tests: `cd functions && npm run test:all` (Java chahiye, emulator khud download hota hai).

## Security notes
* Passwords sirf Firebase Auth mein (hashed). Firestore mein `credentials` collection nahi hai; admin password dekh nahi sakta, sirf reset kar sakta hai (random password ek baar dikhta hai).
* `users/*` create/delete sirf Cloud Functions se, isliye plan limit app se bypass nahi hoti. Concurrency test bhi hai.
* Suspended / expired institute ya band feature ko rules khud reject karte hain.
* Har rules check par 2 extra document reads lagte hain (institute + user doc) — cost trade-off, ARCHITECTURE.md dekho.

## Abhi ke known gaps (imaandari se)
* Android app **device par chalaya nahi gaya** (yahan Android SDK nahi); sirf GitHub Actions se compile hota hai. Pehle run par chhoti bugs aa sakti hain.
* Email-link aur Google sign-in ka end-to-end test Firebase project ke bina possible nahi tha.
* Plan expire hone par institute lock ho jaata hai (auto-downgrade nahi) — chahein to Free par girane ka scheduled function jod sakte hain.
* Purana `CheckWorker` polling abhi bhi hai; phase 7 mein FCM se replace hoga.
