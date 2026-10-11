package com.elementsofmathematics.app.data

import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import javax.crypto.KeyGenerator

class PdfEncryptionTest {
    @get:Rule val folder = TemporaryFolder()
    private fun key() = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()

    @Test fun roundTripKeepsPlaintextOutOfCache() {
        val plain = folder.newFile().apply { writeBytes("%PDF-1.7\nPrivate lesson".repeat(10000).toByteArray()) }
        val encrypted = folder.newFile()
        val restored = folder.newFile()
        val key = key()
        PdfEncryption.encrypt(plain, encrypted, key)
        assertFalse(encrypted.readBytes().contentEquals(plain.readBytes()))
        assertFalse(encrypted.readText(Charsets.ISO_8859_1).contains("Private lesson"))
        PdfEncryption.decrypt(encrypted, restored, key)
        assertArrayEquals(plain.readBytes(), restored.readBytes())
    }

    @Test fun tamperingIsRejectedAndPlaintextRemoved() {
        val source = folder.newFile().apply { writeText("%PDF-1.7\nPrivate lesson") }
        val encrypted = folder.newFile()
        val restored = folder.newFile()
        val key = key()
        PdfEncryption.encrypt(source, encrypted, key)
        val bytes = encrypted.readBytes()
        bytes[bytes.lastIndex] = (bytes.last().toInt() xor 1).toByte()
        encrypted.writeBytes(bytes)
        assertThrows(Exception::class.java) { PdfEncryption.decrypt(encrypted, restored, key) }
        assertFalse(restored.exists())
    }

    @Test fun anotherDeviceCannotDecrypt() {
        val source = folder.newFile().apply { writeText("%PDF-1.7\nPrivate lesson") }
        val encrypted = folder.newFile()
        val restored = folder.newFile()
        PdfEncryption.encrypt(source, encrypted, key())
        assertThrows(Exception::class.java) { PdfEncryption.decrypt(encrypted, restored, key()) }
        assertFalse(restored.exists())
    }
}
