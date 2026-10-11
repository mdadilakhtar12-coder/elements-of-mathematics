# Verification — 2026-10-04

## Passed locally

- testDebugUnitTest, lintDebug and assembleDebug: successful; 12 JVM tests, zero failures and zero lint errors.
- PDF download tests cover valid PDF, redirects, invalid responses, truncation, HTTP errors and cancellation.
- AES-GCM tests cover round-trip, tampering and wrong-key rejection; failed decryption removes partial output.
- Firestore emulator: three security tests passed, covering public catalog/student write denial, protected PDF access/pending uploads/admin cleanup, and unknown collection denial. The CLI reports an unrelated environment/update-check error after the successful test process and emulator shutdown.
- Firebase Console: Email/Password and Anonymous providers enabled in elements-of-mathematics-78f50. Spark billing remains unchanged.

## Live Firebase setup completed

The correct app/google-services.json was validated against project elements-of-mathematics-78f50 and package com.elementsofmathematics.app, installed locally and included in the successful APK rebuild. The config remains ignored by Git.

Restricted firebase/firestore.rules were published to the existing database on 2026-10-05. Index exclusions for chunks.data and banners.imageUrl were saved and verified in Firebase Console, matching firebase/firestore.indexes.json. Cloud Storage rules apply only to legacy Storage files; new uploads use the bounded Firestore starter library.

The installable Firebase-configured debug APK is delivery/Elements-of-Mathematics-1.1.0-debug.apk (SHA-256: 1AF1BE6D4CD4F9D41031019E5488B892A5545D83DD76D9526F7ECA63827128CD). It is intended for phone testing, not Play Store release. No Android device was connected when checked.

Admin login uses the existing Firebase user's password; no default password exists in source. Never commit passwords, service account keys or Android config files.

## Device verification still required

- Real Firebase catalog loading, hidden five-tap admin login, content creation/edit/reorder/delete and sign-out.
- Upload/download a PDF, cancel and retry, reopen offline, check cache deletion and persistent bookmarks/highlights/last page.
- Screenshot and recording blocking on the target phone, plus absence of exported PDFs in shared storage.
- YouTube playback, fullscreen/back navigation and external fallback.
- Banner image upload, swipes, timer changes and timer disabled.
- Reader zoom, night mode, toolbar and page navigation; app restart and network interruption.

Passing builds and emulator tests do not establish device behavior or deployed cloud rules. Release signing and a Play Store AAB require a separate signing key and publication setup.

## PDF reader fix — 1.1.1

The Loading effect's disposal previously read the updated Compose state and closed the newly opened PDF. This explains a valid page count and toolbar with an endless page spinner. Cleanup now captures the document owned by its own effect and closes it only when that document leaves the screen. Rendering failures show an English error and Retry; bitmap state is keyed by the document as well as the page.

Existing uploaded content and encrypted downloads remain compatible. Install 1.1.1 as an update to retain downloads, bookmarks and highlights. Target-phone verification is still required; no Android device was connected during this fix.

The 1.1.1 rebuild passed testDebugUnitTest (12 tests), lintDebug (zero errors) and assembleDebug. The APK package/version and signing certificate were verified; its signer matches 1.1.0, so it can be installed as an update. Artifact: delivery/Elements-of-Mathematics-1.1.1-debug.apk. These build checks do not replace a target-device reader test.

## Banner image fix — 1.1.2

Coil 2.7 has no data-URI fetcher, while Spark banner uploads are stored as base64 image data URIs. The application image loader now maps these existing uploads into supported byte buffers, covering the home carousel and admin preview without re-uploading content. Ordinary HTTPS links and phone image URIs continue through the default loader. Four regression tests cover JPEG/PNG bytes, normal URL models and malformed/oversized data.

Recommended banner ratio is 2:1 (1200 × 600 pixels). Uploaded images are sampled and JPEG-compressed; the stored image limit is 500 KB after compression. The admin screen now explains this limit. Target-phone display verification remains required.

The 1.1.2 rebuild passed all 16 JVM tests, lintDebug and assembleDebug. Artifact: delivery/Elements-of-Mathematics-1.1.2-debug.apk.
