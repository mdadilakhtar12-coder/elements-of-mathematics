package com.elementsofmathematics.app.data

import java.nio.ByteBuffer
import java.util.Base64

/** Turns existing inline banner uploads into image-loader input without changing stored content. */
internal object BannerImageData {
    private const val MAX_BYTES = 500 * 1024

    fun decode(value: String): ByteBuffer? {
        if (!value.startsWith("data:image/", ignoreCase = true)) return null
        val comma = value.indexOf(',')
        require(comma > 0 && value.substring(0, comma).endsWith(";base64", ignoreCase = true)) {
            "Invalid banner image format"
        }
        val encoded = value.substring(comma + 1)
        require(encoded.length <= ((MAX_BYTES + 2) / 3) * 4) { "Banner image is too large" }
        val bytes = Base64.getDecoder().decode(encoded)
        require(bytes.isNotEmpty() && bytes.size <= MAX_BYTES) { "Invalid banner image size" }
        return ByteBuffer.wrap(bytes)
    }
}
