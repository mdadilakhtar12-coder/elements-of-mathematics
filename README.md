# Elements of Mathematics – Android App

Students ke liye study app: **Books (PDF), Solutions, Handwritten Notes, Revision Notes, Sample Papers, Educational Games aur Video Lectures**.
App ke andar sab kuch English mein hai. Saara content aap **app ke andar hi (hidden Admin Mode se)** upload karte ho, aur sabhi students ko turant dikh jaata hai.

## Features

**Students ke liye**
- Home screen: upar **auto-sliding banners** (left/right swipe bhi), neeche sections ka grid (3 columns)
- Section kholo → chapters ki list (rang-birange number bubbles). Tap → PDF download (progress + Cancel) → app ke andar khulta hai
- Download hone ke baad green ✔ dikhta hai, dobara offline khulta hai. Long-press → download hatao
- **PDF Reader**: highlighter (4 colors, undo, clear page), night mode, bookmark (Bookmark added/removed), bookmarks list, go to page, page number, pinch-zoom, double-tap zoom, tap se toolbar hide. Last padha hua page yaad rehta hai
- Side menu: Default PDF Mode (Normal / Highlighter), Feedback, Share, Rate Us, More Apps
- **Educational Games / Links**: aisa section jisme games, quizzes ya kisi bhi website ka link ho (tap → khul jaata hai)
- **Video Lectures**: YouTube thumbnail grid. Tap → video **app ke andar hi chalta hai** (fullscreen bhi). "Watch on YouTube" button se YouTube app mein bhi dekh sakte hain. Neeche "More videos" list

**Admin ke liye (hidden)**
- Top bar mein app ke naam par **5 baar jaldi-jaldi tap** karo → password dialog → Admin Mode
- Admin Mode mein app bilkul waisa hi dikhta hai, bas extra buttons aate hain:
  - **Sections**: add / edit (naam, icon, aur type: PDF / Video / Web link) / delete / aage-peeche move (⋮ button)
  - **Chapters/PDFs**: "+ Add PDF" → phone se PDF chuno (upload hota hai) *ya* Google Drive / direct PDF link paste karo
  - **Videos**: "+ Add Video" → bas YouTube link paste karo
  - **Links** (Educational Games jaise sections): "+ Add Link" → website/game ka link paste karo
  - **Banners**: jitne chahe add karo (phone se image ya image link), tap par khulne wala link (optional), order change, delete, aur **auto-slide time (0–15 sec)** set karo
  - **App Settings**: app title, feedback email, More Apps list
  - **Change Admin Password**, **Exit Admin Mode** (side menu mein)

## Setup (ek baar karna hai)

### 1. Firebase project banao
1. https://console.firebase.google.com → **Add project**
2. **Add app → Android**, package name: `com.elementsofmathematics.app`
3. `google-services.json` download karke `app/` folder mein rakho (ye file git mein commit nahi hoti)

### 2. Firebase services on karo
- **Firestore Database** → Create database
- **Authentication** → Sign-in method → **Email/Password** enable karo → **Users → Add user**: apna admin email + password (yahi password app mein dalna hai)
- **Storage** → Get started (phone se PDF/banner upload karne ke liye).
  Note: naye Firebase projects mein Storage ke liye **Blaze (pay-as-you-go) plan** zaroori hai, lekin free limit (5 GB) tak paisa nahi lagta. Agar Storage nahi chahiye to PDFs ke liye **Google Drive link** aur banners ke liye **image link** use karo – woh bina Storage ke chalte hain.

### 3. Admin email set karo (3 jagah same email)
- `app/src/main/java/com/elementsofmathematics/app/AppConfig.kt` → `ADMIN_EMAIL`
- `firebase/firestore.rules` → Firebase Console → Firestore → **Rules** mein paste karke Publish
- `firebase/storage.rules` → Firebase Console → Storage → **Rules** mein paste karke Publish

Rules ki wajah se students sirf padh sakte hain; upload/edit/delete sirf admin account kar sakta hai.

### 4. APK banao
**Android Studio se:** project kholo → Run ▶ (ya Build → Build APK).

**GitHub se (bina computer):** har push par GitHub Actions APK banata hai (Actions tab → latest run → *app-debug* artifact).
Firebase se connected APK ke liye: `google-services.json` ko base64 karke repo ke **Settings → Secrets → Actions** mein `GOOGLE_SERVICES_JSON` naam se daalo:
```
base64 -w0 app/google-services.json
```

### 5. Pehli baar content daalo
App kholo → title par 5 tap → password → Admin Mode → **"Add default sections"** button (NCERT Book, Solutions, Handwritten Notes, Revision Notes, Sample Papers, Educational Games, Video Lectures ban jaayenge) → har section mein PDFs/videos add karo → side menu → Manage Banners.

## Tips
- Banner images 2:1 ratio (jaise 1200×600) best dikhti hain
- Google Drive PDF: file ko "Anyone with the link" par share karo, phir link paste karo
- YouTube video ka "embedding allowed" hona chahiye, warna app mein nahi chalega (tab "Watch on YouTube" use hoga)

## Project structure
```
app/src/main/java/com/elementsofmathematics/app/
  AppConfig.kt          ← admin email, default title
  data/                 ← Firebase repository, PDF download cache, local bookmarks/highlights
  ui/home/              ← home screen, banner carousel, side menu
  ui/section/           ← chapter list & video grid
  ui/pdf/               ← PDF reader
  ui/video/             ← in-app YouTube player
  ui/admin/             ← admin dialogs (login, editors, banners, settings)
firebase/               ← security rules
```
