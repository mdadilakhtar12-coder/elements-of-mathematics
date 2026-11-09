package com.coachsaas.app.util

import java.security.SecureRandom

object Passwords {
    private const val CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
    private val rng = SecureRandom()

    /** Random password without look-alike characters (O/0, l/1). Shown once to the admin, never stored. */
    fun random(length: Int = 10): String = buildString { repeat(length) { append(CHARS[rng.nextInt(CHARS.length)]) } }
}
