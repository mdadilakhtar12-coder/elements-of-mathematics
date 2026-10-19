package com.aspirescience.academy

object AppConfig {
    const val APP_NAME = "Aspire Science Academy"

    /** Owner/admin login. Create this exact user in Firebase Console -> Authentication (see README). */
    const val ADMIN_EMAIL = "admin@aspire.app"

    /** Teachers/students log in with just a mobile number or ID; it is turned into "<id>@aspire.app". */
    const val EMAIL_DOMAIN = "aspire.app"

    /** GitHub repo whose "aspire-latest" release holds the newest APK (must be a public repo). */
    const val UPDATE_REPO = "mdadilakhtar12-coder/elements-of-mathematics"

    /** Day of the month by which monthly fees are expected (reminders start 3 days before). */
    const val FEE_DUE_DAY = 10

    val STANDARDS = listOf(
        "4th", "5th", "6th", "7th", "8th", "9th", "10th",
        "11th Science", "11th Commerce", "12th Science", "12th Commerce"
    )
    val SUBJECTS = listOf(
        "Maths", "Physics", "Chemistry", "Biology", "Science", "English", "Hindi",
        "Gujarati", "Sanskrit", "Social Science", "Computer", "Accountancy", "Economics"
    )
    val PAY_MODES = listOf("Cash", "UPI", "Bank Transfer", "Cheque", "Other")
}
