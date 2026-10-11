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
- **Search**: home ke search icon ya drawer se chapter/PDF/video titles aur section names search karo.
- **Downloads**: drawer mein protected offline PDFs ki list, file size, open aur phone wali copy remove karne ka option. Uploaded original aur bookmarks delete nahi hote.
- **App updates**: app kholne par naya published version check hota hai. Student/admin dono ke drawer mein **Check for updates**. Update → download progress → APK verification → Android installation confirmation.
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
- **Authentication → Anonymous** bhi enable karo; students ke PDF access ke liye app automatically guest sign-in karta hai.
- **Free starter library:** phone se uploaded PDFs Firestore mein protected chunks ke roop mein store hote hain (har PDF maximum 20 MB). Banners compressed inline images hain. Is mode mein Storage bucket ya Blaze plan ki zaroorat nahi. Firestore ki free storage/read/write/network quotas apply hoti hain; badi library ya zyada students ke liye paid storage evaluate karna hoga.
- Existing Cloud Storage PDFs supported hain; Cloud Storage ko use karne ke liye Blaze billing required ho sakti hai. App billing automatically enable nahi karta.

### 3. Admin email set karo (3 jagah same email)
- `app/src/main/java/com/elementsofmathematics/app/AppConfig.kt` → `ADMIN_EMAIL`
- `firebase/firestore.rules` → Firebase Console → Firestore → **Rules** mein paste karke Publish
- `firebase/firestore.indexes.json` → field index exclusions deploy karo, taaki binary chunks aur banner images index na hon
- `firebase/storage.rules` → sirf existing Cloud Storage files use karte ho to Storage Rules publish karo

Rules ki wajah se students sirf padh sakte hain; upload/edit/delete sirf admin account kar sakta hai.

Firebase CLI se configured project par: `firebase deploy --only firestore:rules,firestore:indexes`.
Current project: `elements-of-mathematics-78f50`; admin email: `mdadilakhtar12@gmail.com`.
Admin password Firebase user ka password hai; app mein koi default password embedded nahi hai.

## PDF protection

Downloaded PDFs app ke private storage mein AES-GCM encrypted hain; encryption key Android Keystore mein rehti hai. Reader private temporary file ko open karke turant unlink karta hai. Shared Downloads mein export nahi hota; backups aur device transfer disabled hain. App window screenshot/screen recording protection use karti hai.

Public PDF links original hosting site par accessible rehte hain; protection ke liye app se PDF upload karo. Rooted devices, modified clients aur doosre camera se copying ko completely prevent nahi kiya ja sakta. Encryption upgrade ke baad purane downloads ko dobara download karna pad sakta hai.

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

## App update publish karna

PDFs, videos, banners aur settings Firebase se live aate hain; in changes ke liye APK update nahi chahiye.
Code changes ke liye nayi APK build aur publish karni hoti hai. Pehli baar 1.2.0 manually install karo; uske baad updater available hoga.

1. Version code increment karo, version name update karo, aur same package/signing key se APK build karo.
2. APK ko public HTTPS host par upload karo. Is public repository ke GitHub Releases mein binary attach kar sakte ho; Firebase billing enable karne ki zaroorat nahi.
3. APK ka SHA-256 checksum aur version details package script se milenge: `powershell -File scripts/package-apk.ps1`.
4. App mein Admin Mode → drawer → **Publish app update**. Version code/name, direct APK download URL, checksum aur What's new enter karo.
5. **Verify & publish** hosted APK download karke checksum/package/version/signing certificate verify karta hai. Verification successful hone par hi `config/update` save hota hai.
6. Purane version par students/admin ko app kholne par update popup milega. **Check for updates** manually bhi available hai. Offline check latest installed hone ka galat claim nahi karta.

Android user se install confirmation aur, agar zaroori ho, **Allow from this source** permission lega. Silent installation nahi hoti. App-private FileProvider sirf updates cache share karta hai; encrypted PDF storage share nahi hota.

**Signing:** existing installed APK local debug certificate se signed hai. Is PC ki signing key ko preserve karo; uninstall mat karo. Fresh GitHub Actions runner ka default debug key alag hota hai, isliye us APK ko current installs ke update ke roop mein publish mat karo. Future builds ko same preserved key se sign karna zaroori hai. Signing keys/passwords public repository mein kabhi commit mat karo.

Release document shape:

```json
{
  "versionCode": 6,
  "versionName": "1.2.1",
  "apkUrl": "https://your-public-host/app.apk",
  "sha256": "64-character APK checksum",
  "notes": "What's new"
}
```
- Google Drive PDF: file ko "Anyone with the link" par share karo, phir link paste karo
- YouTube video ka "embedding allowed" hona chahiye, warna app mein nahi chalega (tab "Watch on YouTube" use hoga)

## Optional folders and MCP (1.3.0)

Admin Mode mein section kholo → **Add → Add Folder**. Folder optional hai; root mein pehle se maujood files waise hi dikhengi. Folder ke andar files ya aur folders add kar sakte ho. Edit dialog ka **Location** existing PDF/video/folder ko move karta hai. Non-empty folder delete nahi hota; pehle content move/remove karo. Students folders browse aur content read kar sakte hain.

Independent hosted MCP connector ka code aur deployment instructions [connector/README.md](connector/README.md) mein hain. Hosting account/domain configure hone ke baad hi live MCP URL milega. Connector remote chat attachments ko automatically receive nahi karta; private upload page se real PDF select karke assistant usse requested folder mein publish karta hai.

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
