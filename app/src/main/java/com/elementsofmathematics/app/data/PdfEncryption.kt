package com.elementsofmathematics.app.data

import java.io.File
import java.io.IOException
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** Authenticated encryption: a changed or incomplete cache is never opened as a PDF. */
internal object PdfEncryption {
    private val magic = byteArrayOf(0x53, 0x4E, 0x50, 0x01)

    fun encrypt(source: File, destination: File, key: SecretKey) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key)
        destination.outputStream().use { output ->
            output.write(magic)
            output.write(cipher.iv)
            source.inputStream().use { input ->
                val buffer = ByteArray(64 * 1024)
                while (true) {
                    val n = input.read(buffer)
                    if (n < 0) break
                    cipher.update(buffer, 0, n)?.let { output.write(it) }
                }
            }
            output.write(cipher.doFinal())
        }
    }

    fun decrypt(source: File, destination: File, key: SecretKey) {
        try {
            source.inputStream().use { input ->
                val header = ByteArray(16)
                var offset = 0
                while (offset < header.size) {
                    val n = input.read(header, offset, header.size - offset)
                    if (n < 0) throw IOException("Incomplete protected PDF")
                    offset += n
                }
                require(header.copyOfRange(0, 4).contentEquals(magic)) { "Invalid protected PDF" }
                val cipher = Cipher.getInstance("AES/GCM/NoPadding")
                cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, header.copyOfRange(4, 16)))
                destination.outputStream().use { output ->
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        val n = input.read(buffer)
                        if (n < 0) break
                        cipher.update(buffer, 0, n)?.let { output.write(it) }
                    }
                    output.write(cipher.doFinal())
                }
            }
        } catch (e: Exception) {
            destination.delete()
            throw e
        }
    }
}
