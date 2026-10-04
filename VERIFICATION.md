# Verification and remaining setup

## Automated verification

GitHub Actions runs `testDebugUnitTest lintDebug assembleDebug`. The download
tests use a local HTTP server: valid PDF, relative redirect, HTML response,
redirect loop, missing Location, HTTP failure, truncated response, unsupported
scheme, and cancellation. Reports are uploaded as `verification-reports`.

## Firebase setup

The repository still uses `admin@example.com`; replace this before live use.
The Android package is `com.elementsofmathematics.app`.

With your downloaded Firebase Android config, run from the project root:

```powershell
./scripts/configure-firebase.ps1 -ProjectId YOUR_PROJECT_ID -AdminEmail YOUR_EMAIL -GoogleServicesFile PATH_TO_GOOGLE_SERVICES_JSON
```

The script validates the project and package, updates all three admin email
references, copies the ignored Android config, and writes the local Firebase
project selection. It does not create cloud services or deploy changes.

Enable Firestore and Email/Password Authentication, create your admin user,
and publish the rules from the firebase directory. Enable Storage if phone
uploads are required. Direct PDF and image URLs can be used without Storage.
Use the existing README instructions for the GitHub Actions Firebase secret.
Never commit passwords, service account keys, or Android config files.

## Device checks still required

- Confirm student content loads from the selected Firebase project.
- Enter Admin Mode using five title taps, log in, add default sections,
  add/edit/reorder/delete PDF, video, link and banner content, then log out.
- Confirm student writes are denied by both Firebase rules.
- Download a PDF, cancel and retry a download, and reopen it offline.
- Check last page, bookmarks, highlight colors, undo, clear page, zoom,
  toolbar visibility and night mode; restart the app to check persistence.
- Verify YouTube playback, fullscreen/back navigation, and external fallback.
- Check banner swipes and automatic sliding, including auto-slide off.
- Set feedback email and test sharing, feedback, More Apps and Rate Us.

A successful build does not confirm Firebase setup or device behavior.
