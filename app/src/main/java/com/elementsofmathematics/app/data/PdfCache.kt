package com.elementsofmathematics.app.data

import android.content.Context
import com.elementsofmathematics.app.util.Links
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.security.MessageDigest
import kotlin.math.abs

/** Downloads PDFs once and keeps them on the phone so they open offline next time. */
object PdfCache {
    private fun dir(context: Context) = File(context.filesDir, "pdfs").apply { mkdirs() }

    /** A URL change invalidates the download; SHA-256 avoids Java hash collisions. */
    fun fileFor(context: Context, item: ContentItem): File {
        val hash = MessageDigest.getInstance("SHA-256").digest(item.url.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
        val target = File(dir(context), "${item.id}_$hash.pdf")
        val legacy = File(dir(context), "${item.id}_${abs(item.url.hashCode())}.pdf")
        if (!target.exists() && legacy.isFile && legacy.length() > 0) {
            // Retain downloads made by version 1 so they remain available offline.
            if (!legacy.renameTo(target)) return legacy
        }
        return target
    }

    fun isDownloaded(context: Context, item: ContentItem) = fileFor(context, item).let { it.isFile && it.length() > 0 }

    fun delete(context: Context, item: ContentItem) { fileFor(context, item).delete() }

    suspend fun download(context: Context, item: ContentItem, onProgress: (Float?) -> Unit): File =
        withContext(Dispatchers.IO) {
            val target = fileFor(context, item)
            val result = PdfDownloader.download(Links.directPdfUrl(item.url), target, onProgress)
            // Preserve the previous valid download until its replacement has been saved.
            dir(context).listFiles()?.filter { it.name.startsWith("${item.id}_") && it != target }
                ?.forEach { it.delete() }
            result
        }
}
