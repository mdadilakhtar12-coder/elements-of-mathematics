package com.elementsofmathematics.app.data

import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.nio.file.Files

class AppUpdateTest {
    private val bytes = "PK-test-apk".toByteArray()
    private val release get() = AppRelease(6, "1.2.1", "https://updates.example/app.apk", UpdatePolicy.digest(bytes))
    private lateinit var directory: File
    private lateinit var target: File
    @Before fun setup() { directory = Files.createTempDirectory("update-test").toFile(); target = File(directory, "update.apk") }
    @After fun cleanup() { directory.deleteRecursively() }

    private class Response(url: URL, val body: ByteArray, val status: Int = 200,
                           val size: Long = body.size.toLong(), val location: String? = null) : HttpURLConnection(url) {
        override fun connect() {}
        override fun disconnect() {}
        override fun usingProxy() = false
        override fun getResponseCode() = status
        override fun getContentLengthLong() = size
        override fun getInputStream() = body.inputStream()
        override fun getHeaderField(name: String?) = if (name == "Location") location else null
    }

    private fun failure(block: suspend () -> Unit) {
        try { runBlocking { block() }; fail("Expected validation failure") } catch (_: IllegalArgumentException) {
        } catch (_: IllegalStateException) {}
        assertFalse(directory.listFiles()!!.any { it.extension == "part" })
    }

    @Test fun validDownloadReportsProgressAndReplacesAtomically() = runBlocking {
        target.writeText("old")
        val progress = mutableListOf<Float?>()
        ApkDownloader.download(release, target, { progress.add(it) }) { Response(it, bytes) }
        assertArrayEquals(bytes, target.readBytes())
        assertEquals(1f, progress.last())
        assertEquals(listOf(target), directory.listFiles()!!.toList())
    }

    @Test fun incorrectChecksumPreservesPreviousDownload() {
        target.writeText("old")
        failure { ApkDownloader.download(release.copy(sha256 = "0".repeat(64)), target, {}) { Response(it, bytes) } }
        assertEquals("old", target.readText())
    }
    @Test fun rejectsInsecureInitialLink() {
        failure { ApkDownloader.download(release.copy(apkUrl = "http://updates.example/app.apk"), target, {}) { error("Must not connect") } }
        assertFalse(target.exists())
    }
    @Test fun rejectsHttpsToHttpRedirect() {
        var connections = 0
        failure { ApkDownloader.download(release, target, {}) {
            connections++; Response(it, bytes, 302, location = "http://unsafe.example/app.apk")
        } }
        assertEquals(1, connections)
    }
    @Test fun followsRelativeHttpsRedirect() = runBlocking {
        val urls = mutableListOf<String>()
        ApkDownloader.download(release, target, {}) {
            urls += it.toString()
            if (urls.size == 1) Response(it, bytes, 302, location = "/signed.apk") else Response(it, bytes)
        }
        assertEquals("https://updates.example/signed.apk", urls.last())
        assertArrayEquals(bytes, target.readBytes())
    }
    @Test fun rejectsTruncatedDownload() {
        failure { ApkDownloader.download(release, target, {}) { Response(it, bytes, size = bytes.size + 20L) } }
        assertFalse(target.exists())
    }
    @Test fun rejectsOversizedResponseBeforeReading() {
        failure { ApkDownloader.download(release, target, {}) { Response(it, bytes, size = ApkDownloader.MAX_BYTES + 1) } }
    }
    @Test fun rejectsUnboundedRedirects() {
        failure { ApkDownloader.download(release, target, {}) { Response(it, bytes, 302, location = "/loop") } }
    }
    @Test fun rejectsServerError() {
        failure { ApkDownloader.download(release, target, {}) { Response(it, bytes, 403) } }
    }
    @Test fun cancellationRemovesTemporaryDownload() {
        try {
            runBlocking { ApkDownloader.download(release, target, { throw CancellationException("Cancelled") }) { Response(it, bytes) } }
            fail("Cancellation must propagate")
        } catch (_: CancellationException) {}
        assertFalse(target.exists())
        assertTrue(directory.listFiles()!!.isEmpty())
    }
    @Test fun rejectsDifferentPackageOrSignerOrVersionAndDowngrade() {
        failure { UpdatePolicy.requireCompatible(release, 5, "ours", "other", 6, setOf("ours"), setOf("ours")) }
        failure { UpdatePolicy.requireCompatible(release, 5, "ours", "ours", 6, setOf("ours"), setOf("other")) }
        failure { UpdatePolicy.requireCompatible(release, 5, "ours", "ours", 7, setOf("ours"), setOf("ours")) }
        failure { UpdatePolicy.requireCompatible(release, 6, "ours", "ours", 6, setOf("ours"), setOf("ours")) }
        failure { UpdatePolicy.requireCompatible(release, 5, "ours", "ours", 6, emptySet(), emptySet()) }
        UpdatePolicy.requireCompatible(release, 5, "ours", "ours", 6, setOf("ours"), setOf("ours"))
    }
}
