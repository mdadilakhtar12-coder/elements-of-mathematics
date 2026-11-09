# Architecture

One Android app, many institutes. Every institute's data is isolated by path **and** by rules.

## Roles
| Role | Who | How they get an account |
|---|---|---|
| `admin` (owner) | Institute owner | Google / email-link sign-in, then **Register institute** (`registerInstitute`) |
| `subadmin` | Helper with permissions (`users, batches, schedule, attendance, exams, fees, notices`) | Created by an admin (`createUser`) |
| `teacher` | Teaching staff | Created by an admin / sub-admin with `users` |
| `student` | Student | Created by an admin / sub-admin with `users` |
| super admin | Platform owner (you) | Custom claim `sa: true`, set with `scripts/make-superadmin.js` |

## Data layout (Firestore)
```
plans/{free|basic|pro}                  read-only copy of the plan catalogue (pricing screen)
institutes/{inst}                       name, plan, status, expiresAt, limits, usage, features, ownerUid
institutes/{inst}/users/{uid}           profile: role, name, loginId, active, perms, batchIds, ...
institutes/{inst}/batches|classes|attendance|notices|homework|settings        core
institutes/{inst}/exams|marks|leaderboards                                    feature "exams"
institutes/{inst}/fees                                                        feature "fees"
institutes/{inst}/ledger|bills|salaryPaid                                     feature "accounts"
institutes/{inst}/materials                                                   feature "study"
institutes/{inst}/doubts|doubtPhotos                                          feature "doubts"
institutes/{inst}/leaves                                                      feature "leaves"
```
`{inst}` is the **institute code** the owner picks (3-24 chars, `a-z 0-9 -`), so login needs no lookup table.

## Auth model
* Firebase Auth user per person. Staff/students have a synthetic e-mail `username@<code>.login.coachsaas.app` (never mailed) —
  this makes "institute code + username + password" unique across institutes with plain Firebase Auth.
* **Passwords are never stored by us.** Firebase Auth keeps a salted scrypt hash; the admin can only *reset* (set a new one),
  never read one. No `credentials` collection exists any more.
* Custom claims set only by Cloud Functions: `{ inst, role }` (+ `sa` for the super admin). Clients cannot forge them.
* Accounts are created / reset / disabled / deleted **only** through callable Cloud Functions (see `functions/src/accounts.js`).

## Where limits are enforced (server side only)
1. `createUser(s)` runs a Firestore **transaction** that reads `institutes/{inst}.limits` + `.usage`, refuses when the plan limit is
   reached, and increments `usage` atomically. Delete decrements. The app can't create `users/*` docs directly (rules `create: false`).
2. `firestore.rules` read `institutes/{inst}.status / expiresAt / features` on every request: a suspended or expired institute,
   or a feature that the plan does not include, is rejected by the database itself.
3. Plan / feature / suspend / expiry changes are Cloud Functions callable only by a super admin (`sa: true`).

## Request cost note
Each rules evaluation reads the institute doc and the caller's user doc (cached per request). That is 2 extra document reads per
operation; it is the price of instant suspension and feature gating without waiting for token refresh.

## Phases
1. **Foundation** — layout, data model, rules (+ emulator tests), plan catalogue ✅
2. **Login & accounts** — Cloud Functions, owner onboarding, institute-code login, password reset
3. **Features port A** — people, batches, timetable, attendance/approvals, notices/homework
4. **Features port B** — exams/marks/Excel, fees/accounts, study, doubts, leaves, backup
5. **Plans** — limits, feature gating in the UI, super-admin Cloud Functions, usage counters
6. *(next)* Super Admin web panel   7. *(next)* FCM push notifications
