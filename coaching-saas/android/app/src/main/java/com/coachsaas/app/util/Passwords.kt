package com.coachsaas.app.util

import java.security.SecureRandom

object Passwords {
    private const val CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
    private val rng = SecureRandom()

    private val COMMON = setOf(
        "password", "password1", "password12", "password123", "passw0rd", "qwerty123", "qwertyuiop", "abcd1234", "abc12345",
        "a1b2c3d4", "india123", "india1234", "welcome1", "welcome123", "admin123", "admin1234", "student1", "student123",
        "teacher123", "iloveyou1", "test1234", "pass1234", "asdf1234", "aaaa1111", "qwer1234"
    )

    /** Why this password is not allowed, or null when it is fine. Same rules as the server (functions/src/validate.js). */
    fun problem(p: String, username: String = "", mobile: String = ""): String? {
        if (p.length < 8) return "Password must be at least 8 characters"
        if (p.all { it.isDigit() }) return "Password cannot be only numbers. Add some letters."
        if (p.toSet().size < 4) return "Password is too simple"
        val low = p.lowercase()
        if (low in COMMON) return "This password is too common. Choose another."
        for (part in listOf(username, mobile)) {
            val x = part.trim().lowercase()
            if (x.length >= 4 && low.contains(x)) return "Password cannot contain the username or mobile number"
        }
        return null
    }

    /** Random password without look-alike characters (O/0, l/1). Shown once to the admin, never stored. */
    fun random(length: Int = 10): String = buildString { repeat(length) { append(CHARS[rng.nextInt(CHARS.length)]) } }
}
