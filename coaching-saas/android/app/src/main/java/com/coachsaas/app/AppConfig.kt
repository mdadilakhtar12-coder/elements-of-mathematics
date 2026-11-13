package com.coachsaas.app

object AppConfig {
    /** Shown in reports and WhatsApp texts. Replaced by the institute's own name once a session opens. */
    @Volatile
    var APP_NAME = "BatchPilot"

    /** Region of the Cloud Functions (see functions/src/index.js). */
    const val FUNCTIONS_REGION = "asia-south1"

    /** Hidden e-mail domain behind "institute code + username". Must equal LOGIN_DOMAIN in functions/src/validate.js. */
    const val LOGIN_DOMAIN = "login.coachsaas.app"

    /** Firebase Hosting domain used for the owner's e-mail sign-in link (set in build.gradle.kts / gradle.properties). */
    val AUTH_LINK_DOMAIN: String get() = BuildConfig.AUTH_LINK_DOMAIN

    /** Day of the month by which monthly fees are expected (reminders start 3 days before). */
    const val FEE_DUE_DAY = 10

    val STANDARDS = listOf(
        "4th", "5th", "6th", "7th", "8th", "9th", "10th",
        "11th Science", "11th Commerce", "12th Science", "12th Commerce"
    )
    /** Default subject list. The admin can change it in the app (Subjects). */
    val SUBJECTS = listOf("MIL", "English", "Physics", "Chemistry", "Mathematics", "Biology", "Botany", "Zoology", "IT")

    /** Subjects an exam gets by default: Biology is replaced by its two papers, Botany and Zoology. */
    fun defaultPapers(subjects: List<String>): List<String> = subjects.filter { it != "Biology" }

    /** Casual leave of a permanent teacher: days per leave year (all kinds of leave together). */
    const val LEAVE_QUOTA = 15

    /** First month of the leave year (1 = January, 4 = April). */
    const val LEAVE_YEAR_START_MONTH = 1
    /** Papers that add up to one subject in results (Botany + Zoology = Biology). */
    private val SUBJECT_GROUPS = mapOf("Botany" to "Biology", "Zoology" to "Biology")
    fun groupOf(subject: String): String = SUBJECT_GROUPS[subject] ?: subject

    val EXPENSE_CATEGORIES = listOf(
        "Room rent", "Electricity", "Internet", "Advertisement", "Marketing", "Stationery (pen, pencil, chalk)",
        "Infrastructure", "Furniture", "Maintenance", "Other staff pay", "Other"
    )
    val INCOME_CATEGORIES = listOf("Admission fee", "Books and material", "Test series fee", "Other income")

    val PAY_MODES = listOf("Cash", "UPI", "Bank Transfer", "Cheque", "Other")
}
