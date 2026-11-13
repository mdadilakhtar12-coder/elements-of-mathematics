package app.phonecontrol

/**
 * All the safety rules in one place. Plain Kotlin (no Android classes), so it is easy to read and unit-test.
 *
 * 1. Blocked apps: banking, UPI, payment and password-manager apps are never read or touched.
 * 2. Secret text: passwords, OTPs, PINs, CVVs and card numbers are never typed.
 * 3. Risky buttons: "Pay", "Place order", "Buy now", "Send"... need a tap on the phone first.
 */
object SafetyPolicy {

    /** Exact package names that are always blocked. Add your own bank's app here if it is missing. */
    val BLOCKED_PACKAGES: Set<String> = setOf(
        // UPI / wallets / payments
        "com.google.android.apps.nbu.paisa.user", // Google Pay
        "com.phonepe.app",                        // PhonePe
        "net.one97.paytm",                        // Paytm
        "in.org.npci.upiapp",                     // BHIM
        "com.dreamplug.androidapp",               // CRED
        "com.mobikwik_new",                       // MobiKwik
        "com.freecharge.android",                 // Freecharge
        "com.myairtelapp",                        // Airtel Thanks (has Airtel Payments Bank)
        "money.super.payments",                   // super.money
        "com.naviapp",                            // Navi (UPI)
        "com.bharatpe.app",                       // BharatPe
        "com.fampay.in",                          // FamPay
        "com.slice",                              // slice
        // Banks (India)
        "com.sbi.lotusintouch",                   // YONO SBI
        "com.sbi.SBIFreedomPlus",
        "com.sbi.upi",                            // BHIM SBI Pay
        "com.snapwork.hdfc",                      // HDFC Bank
        "com.hdfcbank.payzapp",                   // PayZapp
        "com.csam.icici.bank.imobile",            // iMobile Pay (ICICI)
        "com.axis.mobile",                        // Axis Mobile
        "com.msf.kbank.mobile",                   // Kotak
        "com.kotak811mobilebankingapp.instantsavingsupiscanandpayrecharge",
        "com.bankofbaroda.mconnect",              // bob World
        "com.pnb.pnbone",                         // PNB ONE
        "com.infrasoft.uboi",                     // Union Bank Vyom
        "com.canarabank.mobility",                // Canara ai1
        "com.idbibank.abhay_card",
        "com.yesbank",
        "com.indusind.indus",                     // IndusInd INDIE
        "com.idfcfirstbank.optimus",              // IDFC FIRST
        "com.federalbank.fedmobile",
        "com.aubank.aubankapp",
        "com.rblbank.mobank",
        // Password managers / authenticators
        "com.x8bit.bitwarden",                    // Bitwarden
        "com.onepassword.android",                // 1Password
        "com.lastpass.lpandroid",                 // LastPass
        "com.dashlane",                           // Dashlane
        "keepass2android.keepass2android",
        "com.kunzisoft.keepass.free",             // KeePassDX
        "com.kunzisoft.keepass.libre",
        "com.nordpass.android.app",
        "com.google.android.apps.authenticator2", // Google Authenticator
        "com.azure.authenticator",                // Microsoft Authenticator
        "com.authy.authy",
        "proton.android.pass",
    )

    /** If a package name contains one of these words it is treated as a bank/payment/password app too. */
    private val BLOCKED_PACKAGE_WORDS = listOf(
        "bank", "upi", "wallet", "password", "passwd", "keepass", "authenticator", "vault", "paytm", "phonepe",
        "bhim", "netbanking", "mbanking", "mobilebanking", "payzapp", "securepay", "otp",
    )

    /** Some apps we always need, even if a word above matches by accident. */
    private val ALWAYS_ALLOWED = setOf(
        "app.phonecontrol", // this app itself
    )

    /** Extra packages the user added to the blocklist on the phone (comma separated in Settings). */
    @Volatile var userBlocked: Set<String> = emptySet()

    fun isBlockedPackage(pkg: String?): Boolean {
        if (pkg.isNullOrBlank()) return false
        if (pkg in ALWAYS_ALLOWED) return false
        if (pkg in BLOCKED_PACKAGES || pkg in userBlocked) return true
        val p = pkg.lowercase()
        return BLOCKED_PACKAGE_WORDS.any { p.contains(it) }
    }

    // ---------------------------------------------------------------- secret text

    /** Words in a field's hint / id / label that mean "this field wants a secret". */
    private val SECRET_FIELD = Regex(
        "(password|passcode|passwd|\\bpin\\b|m-?pin|upi ?pin|\\botp\\b|one[- ]time|verification code|security code|" +
            "\\bcvv\\b|\\bcvc\\b|card ?number|card ?no|expiry|valid thru|aadhaar|\\bpan\\b)",
        RegexOption.IGNORE_CASE,
    )

    /**
     * Returns a reason string if typing [text] into a field described by [fieldInfo] is not allowed, else null.
     * [isPasswordField] comes from Android itself (the field hides what you type).
     */
    fun secretTextReason(text: String, fieldInfo: String, isPasswordField: Boolean): String? {
        if (isPasswordField) return "This is a password field. I never type passwords."
        if (SECRET_FIELD.containsMatchIn(fieldInfo) && !fieldInfo.contains("pincode", ignoreCase = true) &&
            !fieldInfo.contains("pin code", ignoreCase = true)
        ) {
            return "This field looks like it wants a password / PIN / OTP / card detail ($fieldInfo). I never type those."
        }
        val digits = text.filter { it.isDigit() }
        val onlyDigitsAndSpaces = text.all { it.isDigit() || it == ' ' || it == '-' }
        if (onlyDigitsAndSpaces && digits.length in 13..19 && luhnValid(digits)) {
            return "This looks like a card number. I never type card details."
        }
        return null
    }

    /** Standard card-number checksum. */
    fun luhnValid(digits: String): Boolean {
        var sum = 0
        var double = false
        for (i in digits.indices.reversed()) {
            var d = digits[i] - '0'
            if (double) { d *= 2; if (d > 9) d -= 9 }
            sum += d
            double = !double
        }
        return sum % 10 == 0
    }

    // ---------------------------------------------------------------- risky buttons

    /** Button labels that need the user's tap on the phone before we press them. */
    private val RISKY_LABEL = Regex(
        "\\b(pay|pay now|proceed to pay|make payment|place order|confirm order|buy now|buy|send|send money|" +
            "checkout|check out|transfer|subscribe|confirm purchase|complete purchase|order now|book now|" +
            "submit order|delete|uninstall)\\b",
        RegexOption.IGNORE_CASE,
    )

    /** Returns true when a tap on an element with this label should be confirmed on the phone. */
    fun isRiskyLabel(label: String?): Boolean {
        if (label.isNullOrBlank()) return false
        // Very long labels are usually whole cards/rows, not buttons: only check the start.
        val l = label.take(60)
        return RISKY_LABEL.containsMatchIn(l)
    }
}
