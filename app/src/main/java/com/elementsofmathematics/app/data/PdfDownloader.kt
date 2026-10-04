package com.elementsofmathematics.app.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** Saves only complete, validated downloads; failures and cancellation remove temporary files. */
internal object PdfDownloader {
    suspend fun download(link: String, target: File, onProgress: (Float?) -> Unit): File =
        withContext(Dispatchers.IO) {
            val part = File.createTempFile("pdf-", ".part", target.parentFile)
            try {
                var url = URL(link)
                var redirects = 0
                while (true) {
                    ensureActive()
                    if (url.protocol !in listOf("http", "https")) throw IOException("Use an HTTP or HTTPS PDF link")
                    val conn = url.openConnection() as HttpURLConnection
                    try {
                        conn.connectTimeout = 20_000
                        conn.readTimeout = 30_000
                        conn.instanceFollowRedirects = false
                        val code = conn.responseCode
                        if (code in listOf(301, 302, 303, 307, 308)) {
                            if (redirects++ >= 8) throw IOException("Too many redirects")
                            val location = conn.getHeaderField("Location")
                                ?: throw IOException("Redirect is missing its destination")
                            url = URL(url, location)
                            continue
                        }
                        if (code != HttpURLConnection.HTTP_OK) throw IOException("Server returned $code")
                        val total = conn.contentLengthLong
                        var done = 0L
                        conn.inputStream.use { input ->
                            part.outputStream().use { output ->
                                val buffer = ByteArray(64 * 1024)
                                while (true) {
                                    ensureActive()
                                    val n = input.read(buffer)
                                    if (n < 0) break
                                    output.write(buffer, 0, n)
                                    done += n
                                    onProgress(if (total > 0) (done.toFloat() / total).coerceIn(0f, 1f) else null)
                                }
                            }
                        }
                        if (total >= 0 && done != total) throw IOException("Download was interrupted. Please try again")
                        break
                    } finally {
                        conn.disconnect()
                    }
                }
                ensureActive()
                val header = part.inputStream().use { input -> ByteArray(5).also { input.read(it) } }
                if (String(header, Charsets.US_ASCII) != "%PDF-") throw IOException("This link does not point to a PDF file")
                if (!part.renameTo(target)) throw IOException("Could not save the PDF. Check available storage")
                target
            } finally {
                part.delete()
            }
        }
}
