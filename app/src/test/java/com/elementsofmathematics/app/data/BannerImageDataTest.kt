package com.elementsofmathematics.app.data

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Test
import java.util.Base64

class BannerImageDataTest {
    @Test fun uploadedJpegIsDecodedForImageLoader() {
        val jpeg = byteArrayOf(0xff.toByte(), 0xd8.toByte(), 0xff.toByte(), 0xe0.toByte())
        val input = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(jpeg)
        assertArrayEquals(jpeg, BannerImageData.decode(input)!!.array())
    }

    @Test fun pngImageLinksAreAlsoSupported() {
        val png = Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=")
        val input = "data:image/png;base64," + Base64.getEncoder().encodeToString(png)
        assertArrayEquals(png, BannerImageData.decode(input)!!.array())
    }

    @Test fun existingWebAndPhoneImageModelsAreLeftToDefaultLoader() {
        assertNull(BannerImageData.decode("https://example.com/banner.jpg"))
        assertNull(BannerImageData.decode("content://media/images/1"))
    }

    @Test fun malformedOrOversizedInlineImagesAreRejected() {
        for (input in listOf("data:image/jpeg;base64", "data:image/jpeg;base64,", "data:image/jpeg;base64,%%", "data:image/jpeg,abc")) {
            assertThrows(IllegalArgumentException::class.java) { BannerImageData.decode(input) }
        }
        val oversized = Base64.getEncoder().encodeToString(ByteArray(500 * 1024 + 1))
        assertThrows(IllegalArgumentException::class.java) { BannerImageData.decode("data:image/jpeg;base64,$oversized") }
    }
}
