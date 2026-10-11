package com.elementsofmathematics.app.data

import android.content.Context
import android.os.ParcelFileDescriptor
import com.elementsofmathematics.app.util.Links
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.ensureActive
import java.io.File
import java.security.MessageDigest

/** Encrypted, app-private downloads for offline reading. */
object PdfCache {
    private fun dir(context: Context) = File(context.filesDir, "pdfs").apply { mkdirs() }
    private fun staging(context: Context) = File(context.cacheDir, "protected-pdf").apply { mkdirs() }

    fun clearStaging(context: Context) { staging(context).listFiles()?.forEach { it.delete() } }

    /** A URL change invalidates the download; SHA-256 avoids Java hash collisions. */
    fun fileFor(context: Context, item: ContentItem): File {
        val identity = item.storagePath.ifBlank { item.url }
        val hash = MessageDigest.getInstance("SHA-256").digest(identity.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
        return File(dir(context), "${item.id}_$hash.epdf")
    }

    fun isDownloaded(context: Context, item: ContentItem) = fileFor(context, item).let { it.isFile && it.length() > 32 }

    fun delete(context: Context, item: ContentItem) { fileFor(context, item).delete() }

    private fun entry(item: ContentItem, file: File): DownloadEntry {
        val section = LocalStore.catalog("sections", Array<Section>::class.java)?.firstOrNull { section ->
            LocalStore.catalog("items_${section.id}", Array<ContentItem>::class.java)?.any { it.id == item.id } == true
        }
        return DownloadEntry(file.name, item.title, item.id, section?.title ?: "PDF")
    }

    /** Local index keeps offline PDFs usable even after their catalog entry changes or is removed. */
    fun downloads(context: Context): List<DownloadEntry> {
        val indexed = LocalStore.catalog("downloads", Array<DownloadEntry>::class.java)?.toList().orEmpty()
        val previous = LocalStore.catalog("sections", Array<Section>::class.java).orEmpty()
            .filter { it.type == SectionType.PDF }.flatMap { section ->
                LocalStore.catalog("items_${section.id}", Array<ContentItem>::class.java).orEmpty()
                    .filter { isDownloaded(context, it) }.map { entry(it, fileFor(context, it)) }
            }
        val result = (previous + indexed).distinctBy { it.fileName }.filter {
            runCatching { downloadFile(context, it).let { f -> f.isFile && f.length() > 32 } }.getOrDefault(false)
        }.sortedBy { it.title.lowercase() }
        LocalStore.saveCatalog("downloads", result.toTypedArray())
        return result
    }

    fun downloadFile(context: Context, entry: DownloadEntry): File {
        require(entry.fileName.endsWith(".epdf") && !entry.fileName.contains('/') && !entry.fileName.contains('\\')) { "Invalid download" }
        return File(dir(context), entry.fileName).also {
            require(it.canonicalFile.parentFile == dir(context).canonicalFile) { "Invalid download" }
        }
    }

    fun removeDownload(context: Context, entry: DownloadEntry) {
        val file = downloadFile(context, entry)
        check(!file.exists() || file.delete()) { "Could not remove this download" }
        LocalStore.saveCatalog("downloads", downloads(context).filter { it.fileName != entry.fileName }.toTypedArray())
    }

    /** Unlink plaintext immediately after opening its seekable descriptor. */
    internal fun openDescriptor(context: Context, file: File): ParcelFileDescriptor {
        require(file.canonicalFile.parentFile == dir(context).canonicalFile) { "Invalid PDF location" }
        val temporary = File.createTempFile("view-", ".pdf", staging(context))
        try {
            PdfEncryption.decrypt(file, temporary, PdfKey.get())
            val fd = ParcelFileDescriptor.open(temporary, ParcelFileDescriptor.MODE_READ_ONLY)
            if (!temporary.delete()) { fd.close(); error("Could not protect temporary PDF") }
            return fd
        } finally { temporary.delete() }
    }

    suspend fun download(context: Context, item: ContentItem, onProgress: (Float?) -> Unit): File =
        withContext(Dispatchers.IO) {
            val target = fileFor(context, item)
            val plain = File.createTempFile("download-", ".pdf", staging(context))
            val encrypted = File.createTempFile("encrypted-", ".part", dir(context))
            try {
                if (item.storagePath.isNotBlank()) {
                    Repository.downloadPdf(item.storagePath, plain, onProgress)
                    val header = plain.inputStream().use { input -> ByteArray(5).also { input.read(it) } }
                    require(String(header, Charsets.US_ASCII) == "%PDF-") { "The uploaded file is not a PDF" }
                } else {
                    PdfDownloader.download(Links.directPdfUrl(item.url), plain, onProgress)
                }
                ensureActive()
                PdfEncryption.encrypt(plain, encrypted, PdfKey.get())
                ensureActive()
                check(encrypted.renameTo(target)) { "Could not save PDF. Check available storage" }
                dir(context).listFiles()?.filter { it.name.startsWith("${item.id}_") && it != target }
                    ?.forEach { it.delete() }
                val saved = entry(item, target)
                LocalStore.saveCatalog("downloads", (downloads(context).filter { it.fileName != saved.fileName } + saved).toTypedArray())
                target
            } finally { plain.delete(); encrypted.delete() }
        }
}
