package com.elementsofmathematics.app

/**
 * One-time settings you edit before building the app.
 */
object AppConfig {
    /**
     * Email of the admin account you created in Firebase Console → Authentication.
     * In the app, tap the title 5 times and enter that account's password to open Admin Mode.
     * Use the same email in firebase/firestore.rules and firebase/storage.rules.
     */
    const val ADMIN_EMAIL = "mdadilakhtar12@gmail.com"

    /** Title shown until you set your own from Admin Mode → App Settings. */
    const val DEFAULT_TITLE = "Elements of Mathematics"

    /** Used by the "Feedback" option until you set one from App Settings. */
    const val DEFAULT_FEEDBACK_EMAIL = ""
}
