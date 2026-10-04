package com.elementsofmathematics.app.data

import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import okhttp3.mockwebserver.SocketPolicy
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.File
import java.io.IOException
import java.nio.file.Files

class PdfDownloaderTest {
    private lateinit var server: MockWebServer
    private lateinit var directory: File
    private lateinit var target: File
    private val pdf = "%PDF-1.4\nexample".toByteArray()
    private val base get() = server.url("/").toString().trimEnd('/')

    @Before fun setup() {
        directory = Files.createTempDirectory("pdf-test").toFile()
        target = File(directory, "download.pdf")
        server = MockWebServer()
        server.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse = when (request.path) {
                "/pdf" -> MockResponse().setBody(String(pdf, Charsets.UTF_8))
                "/redirect" -> MockResponse().setResponseCode(302).addHeader("Location", "/pdf")
                "/loop" -> MockResponse().setResponseCode(302).addHeader("Location", "/loop")
                "/missing-location" -> MockResponse().setResponseCode(302)
                "/html" -> MockResponse().setBody("<html>Permission required</html>")
                "/truncated" -> MockResponse().setBody(String(pdf, Charsets.UTF_8))
                    .setHeader("Content-Length", pdf.size + 100)
                    .setSocketPolicy(SocketPolicy.DISCONNECT_AT_END)
                else -> MockResponse().setResponseCode(404)
            }
        }
        server.start()
    }

    @After fun cleanup() { server.shutdown(); directory.deleteRecursively() }

    @Test fun savesCompletePdfAndReportsProgress() = runBlocking {
        val progress = mutableListOf<Float?>()
        assertEquals(target, PdfDownloader.download("$base/pdf", target) { progress.add(it) })
        assertArrayEquals(pdf, target.readBytes())
        assertEquals(1f, progress.last())
        assertEquals(listOf(target), directory.listFiles()!!.toList())
    }

    @Test fun followsRelativeRedirect() = runBlocking {
        PdfDownloader.download("$base/redirect", target) {}
        assertArrayEquals(pdf, target.readBytes())
    }

    @Test fun rejectsHtmlAndPreservesPreviousPdf() {
        target.writeBytes(pdf)
        expectFailure("$base/html")
        assertArrayEquals(pdf, target.readBytes())
        assertEquals(listOf(target), directory.listFiles()!!.toList())
    }

    @Test fun rejectsRedirectLoop() { expectFailure("$base/loop") }
    @Test fun rejectsMissingRedirectDestination() { expectFailure("$base/missing-location") }
    @Test fun rejectsHttpError() { expectFailure("$base/not-found") }
    @Test fun rejectsTruncatedDownload() { expectFailure("$base/truncated"); assertFalse(target.exists()) }
    @Test fun rejectsUnsupportedScheme() { expectFailure("file:///tmp/document.pdf") }

    @Test fun cancellationRemovesTemporaryFile() {
        try {
            runBlocking { PdfDownloader.download("$base/pdf", target) { throw CancellationException("cancel") } }
            fail("Expected cancellation")
        } catch (_: CancellationException) {}
        assertFalse(target.exists())
        assertTrue(directory.listFiles()!!.isEmpty())
    }

    private fun expectFailure(url: String) {
        try {
            runBlocking { PdfDownloader.download(url, target) {} }
            fail("Expected IOException for $url")
        } catch (_: IOException) {}
        assertTrue(directory.listFiles()!!.none { it.extension == "part" })
    }
}
