package app.phonecontrol

import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SafetyPolicyTest {

    @Test fun blocksPaymentAndBankApps() {
        assertTrue(SafetyPolicy.isBlockedPackage("com.phonepe.app"))
        assertTrue(SafetyPolicy.isBlockedPackage("com.google.android.apps.nbu.paisa.user"))
        assertTrue(SafetyPolicy.isBlockedPackage("com.x8bit.bitwarden"))
        assertTrue(SafetyPolicy.isBlockedPackage("com.someone.mobilebanking"))   // keyword match
        assertTrue(SafetyPolicy.isBlockedPackage("in.example.upiapp"))          // keyword match
    }

    @Test fun allowsShoppingApps() {
        assertFalse(SafetyPolicy.isBlockedPackage("com.flipkart.android"))
        assertFalse(SafetyPolicy.isBlockedPackage("com.jpl.jiomart"))
        assertFalse(SafetyPolicy.isBlockedPackage("in.amazon.mShop.android.shopping"))
        assertFalse(SafetyPolicy.isBlockedPackage("app.phonecontrol"))
    }

    @Test fun refusesSecrets() {
        assertNotNull(SafetyPolicy.secretTextReason("hunter2", "Password", false))
        assertNotNull(SafetyPolicy.secretTextReason("abc", "", true))
        assertNotNull(SafetyPolicy.secretTextReason("123456", "Enter OTP", false))
        assertNotNull(SafetyPolicy.secretTextReason("4111 1111 1111 1111", "", false)) // valid test card number
        assertNotNull(SafetyPolicy.secretTextReason("123", "CVV", false))
    }

    @Test fun allowsNormalText() {
        assertNull(SafetyPolicy.secretTextReason("boat earphones", "Search for products", false))
        assertNull(SafetyPolicy.secretTextReason("110001", "Enter pincode", false))
        assertNull(SafetyPolicy.secretTextReason("110001", "Enter PIN code", false))
    }

    @Test fun riskyButtons() {
        assertTrue(SafetyPolicy.isRiskyLabel("Place Order"))
        assertTrue(SafetyPolicy.isRiskyLabel("BUY NOW"))
        assertTrue(SafetyPolicy.isRiskyLabel("Pay ₹499"))
        assertTrue(SafetyPolicy.isRiskyLabel("Send"))
        assertFalse(SafetyPolicy.isRiskyLabel("Add to cart"))
        assertFalse(SafetyPolicy.isRiskyLabel("Search"))
        assertFalse(SafetyPolicy.isRiskyLabel("Payment options info")) // "Payment" is not the word "pay"
    }
}
