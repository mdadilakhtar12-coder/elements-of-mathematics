# Aspire Science Academy – Android App

Coaching institute ke liye app: **Admin**, **Sub-admin**, **Teacher** aur **Student** – sabke liye alag screens, ek hi app mein.

## Kaun kya kar sakta hai

**Admin** (aap)
- Students, Teachers aur Sub-admins banao (ID + password khud set karo, password baad mein reset bhi kar sakte ho)
- Batches banao (Standard + Subject + Teacher + weekly timetable), students ko batch mein daalo
- Timetable: weekly timetable se classes ek saath bana do (1–3 mahine), kisi ek class ko badlo / cancel / teacher change (substitute) karo, custom class add karo
- Teacher ki attendance wali class **Approve / Reject** karo (approve hone par hi teacher ki class count hoti hai)
- Teacher Report: har teacher ne month mein kitni class li (completed / pending / not taken / cancelled)
- Exams banao, marks daalo – ek-ek karke ya **Excel (.xlsx) / CSV upload** se (mobile / roll no / name se student match hota hai)
- Fees: payment add karo, month-wise **Pending** list, receipt WhatsApp/SMS par share karo
- Announcements aur Homework batch-wise ya sabko bhejo

**Sub-admin** – Admin jitne kaam allow kare utne hi (Students/Teachers, Batches, Timetable, Attendance+Approvals, Exams, Fees, Announcements ke checkbox).

**Teacher** – apni classes dekhe, attendance lagaye (P / A / Late) → approval ke liye jaati hai, homework bheje, exam marks daale, apni month-wise class count dekhe.

**Student** – apna timetable (aaj/kal ki class), attendance %, exam results (class average, highest), fees ka month-wise status + payment history, homework, announcements.

## Login
- Admin: ID `admin` + jo password aapne Firebase mein banaya
- Teacher / Student: **mobile number** (ya jo ID admin ne di) + password

## Setup (ek baar karna hai)

### 1. Firebase project
1. https://console.firebase.google.com → **Add project** (naam: Aspire Science Academy)
2. **Add app → Android**, package name: `com.aspirescience.academy`
3. `google-services.json` download karo aur is repo ke `app/` folder mein daal do (GitHub par: `aspire-science-academy/app` folder kholo → **Add file → Upload files**)

### 2. Firebase services
- **Authentication** → Sign-in method → **Email/Password** enable → **Users → Add user**:
  email `admin@aspire.app`, password = aapka admin password
- **Firestore Database** → Create database (Production mode, region: `asia-south1` Mumbai)
- Firestore → **Rules** → `firebase/firestore.rules` ka poora text paste karke **Publish**

(Admin ka email badalna ho to 2 jagah same email likho: `AppConfig.kt` ka `ADMIN_EMAIL` aur `firestore.rules` mein `isOwner()`.)

### 3. APK
Har push par GitHub Actions APK banata hai: **Actions** tab → latest run → *Aspire-Science-Academy-apk*.
Release page par bhi hamesha latest APK milta hai (**Releases → aspire-latest**).

Pehli baar app kholo → `admin` + password → Admin Home.

### 4. Shuruaat ka sahi order
1. **Teachers** add karo → 2. **Batches** banao (teacher + weekly timetable) → 3. **Students** add karo (batch chuno) →
4. Batch kholo → **Create classes from timetable** → 5. Roz ki attendance teacher lagayega, aap **Approvals** mein approve karoge.

## Important notes
- Teacher/student ka password admin set karta hai. Admin ko profile mein password dikhta hai (Show button) taaki bhool jaye to bata sake; reset bhi kar sakta hai. Password kam se kam 6 characters.
- App internet se chalta hai (Firebase) lekin pehle dekha hua data offline bhi dikhta hai.
- Excel marks file: pehli row mein heading — `Mobile` (ya `Roll No` / `Name`) aur `Marks`. Absent ke liye `AB`.
- Firebase free (Spark) plan chhote institute ke liye kaafi hai.

## Project structure
```
app/src/main/java/com/aspirescience/academy/
  AppConfig.kt        ← admin email, standards, subjects
  data/               ← models, Firebase repository, Excel/CSV reader
  ui/main/            ← tabs + Admin / Teacher / Student home
  ui/people/          ← students, teachers, sub-admins
  ui/batch/           ← batches & timetable
  ui/schedule/        ← schedule, class detail, attendance, approvals, teacher report
  ui/exam/            ← exams, marks, Excel upload
  ui/fees/            ← fees & receipts
  ui/notice/          ← announcements, homework
  ui/student/         ← attendance & results views
firebase/firestore.rules
```
