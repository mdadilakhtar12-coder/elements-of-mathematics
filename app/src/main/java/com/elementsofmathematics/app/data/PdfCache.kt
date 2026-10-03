package com.elementsofmathematics.app.data

import android.content.Context
import com.elementsofmathematics.app.util.Links
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.abs

/** Downloads PDFs once and keeps them on the phone so they open offline next time. */
object PdfCache {
    private fun dir(context: Context) = File(context.filesDir, "pdfs").apply { mkdirs() }

    /** File name includes the link's hash, so a replaced PDF is downloaded again. */
    fun fileFor(context: Context, item: ContentItem) =
        File(dir(context), "${item.id}_${abs(item.url.hashCode())}.pdf")

    fun isDownloaded(context: Context, item: ContentItem) = fileFor(context, item).exists()

    fun delete(context: Context, item: ContentItem) {
        fileFor(context, item).delete()
    }

    suspend fun download(context: Context, item: ContentItem, onProgress: (Float?) -> Unit): File =
        withContext(Dispatchers.IO) {
            val target = fileFor(context, item)
            val part = File(target.path + ".part")
            dir(context).listFiles()?.filter { it.name.startsWith("${item.id}_") && it != target }
                ?.forEach { it.delete() }

            var url = URL(Links.directPdfUrl(item.url))
            var conn: HttpURLConnection
            var redirects = 0
            while (true) {
                conn = (url.openConnection() as HttpURLConnection).apply {
                    connectTimeout = 20_000
                    readTimeout = 30_000
                    instanceFollowRedirects = false
                }
                val code = conn.responseCode
                if (code in 300..399 && redirects < 8) {
                    val location = conn.getHeaderField("Location") ?: break
                    url = URL(url, location)
                    conn.disconnect()
                    redirects++
                    continue
                }
                if (code !in 200..299) throw IOException("Server returned $code")
                break
            }
            try {
                val total = conn.contentLengthLong
                conn.inputStream.use { input ->
                    part.outputStream().use { output ->
                        val buf = ByteArray(64 * 1024)
                        var done = 0L
                        while (true) {
                            ensureActive()
                            val n = input.read(buf)
                            if (n < 0) break
                            output.write(buf, 0, n)
                            done += n
                            onProgress(if (total > 0) done.toFloat() / total else null)
                        }
                    }
                }
            } catch (e: Exception) {
                part.delete()
                throw e
            } finally {
                conn.disconnect()
            }
            val header = part.inputStream().use { s -> ByteArray(5).also { s.read(it) } }
            if (!String(header).startsWith("%PDF")) {
                part.delete()
                throw IOException("This link does not point to a PDF file")
            }
            part.renameTo(target)
            target
        }
}
