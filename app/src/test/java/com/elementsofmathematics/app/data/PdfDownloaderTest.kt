package com.elementsofmathematics.app.data

import com.sun.net.httpserver.HttpServer
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.io.File
import java.io.IOException
import java.net.InetSocketAddress
import java.nio.file.Files

class PdfDownloaderTest {
    private lateinit var server: HttpServer
    private lateinit var directory: File
    private lateinit var target: File
    private val pdf = "%PDF-1.4\nexample".toByteArray()
    private val base get() = "http://127.0.0.1:${server.address.port}"

    @Before fun setup() {
        directory = Files.createTempDirectory("pdf-test").toFile()
        target = File(directory, "download.pdf")
        server = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        server.createContext("/pdf") { exchange ->
            exchange.sendResponseHeaders(200, pdf.size.toLong())
            exchange.responseBody.use { it.write(pdf) }
        }
        server.createContext("/redirect") { exchange ->
            exchange.responseHeaders.add("Location", "/pdf")
            exchange.sendResponseHeaders(302, -1)
            exchange.close()
        }
        server.createContext("/loop") { exchange ->
            exchange.responseHeaders.add("Location", "/loop")
            exchange.sendResponseHeaders(302, -1)
            exchange.close()
        }
        server.createContext("/missing-location") { exchange ->
            exchange.sendResponseHeaders(302, -1)
            exchange.close()
        }
        server.createContext("/html") { exchange ->
            val bytes = "<html>Permission required</html>".toByteArray()
            exchange.sendResponseHeaders(200, bytes.size.toLong())
            exchange.responseBody.use { it.write(bytes) }
        }
        server.start()
    }

    @After fun cleanup() { server.stop(0); directory.deleteRecursively() }

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
