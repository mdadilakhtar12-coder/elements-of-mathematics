package com.elementsofmathematics.app.ui.pdf

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.util.LruCache
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File

/** Wraps Android's PdfRenderer. It is not thread-safe, so every access goes through a mutex. */
class PdfDocument private constructor(
    private val fd: ParcelFileDescriptor,
    private val renderer: PdfRenderer,
    /** Width / height of each page. */
    val pageRatios: List<Float>,
) {
    private val mutex = Mutex()
    private var closed = false

    private val cache = object : LruCache<String, Bitmap>((Runtime.getRuntime().maxMemory() / 5).toInt()) {
        override fun sizeOf(key: String, value: Bitmap) = value.byteCount
    }

    val pageCount get() = pageRatios.size

    fun cached(page: Int, width: Int): Bitmap? = cache.get("$page@$width")

    suspend fun render(page: Int, width: Int): Bitmap? = withContext(Dispatchers.IO) {
        cached(page, width)?.let { return@withContext it }
        mutex.withLock {
            if (closed) return@withLock null
            val p = renderer.openPage(page)
            try {
                val height = (width * p.height.toFloat() / p.width).toInt().coerceAtLeast(1)
                val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                bmp.eraseColor(Color.WHITE)
                p.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                cache.put("$page@$width", bmp)
                bmp
            } finally {
                p.close()
            }
        }
    }

    fun close() {
        CoroutineScope(Dispatchers.IO).launch {
            mutex.withLock {
                if (closed) return@withLock
                closed = true
                renderer.close()
                fd.close()
                cache.evictAll()
            }
        }
    }

    companion object {
        suspend fun open(file: File): PdfDocument = withContext(Dispatchers.IO) {
            val fd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
            val renderer = try {
                PdfRenderer(fd)
            } catch (e: Exception) {
                fd.close()
                throw e
            }
            try {
                require(renderer.pageCount > 0) { "This PDF has no pages" }
                val ratios = List(renderer.pageCount) { i ->
                    renderer.openPage(i).use { it.width.toFloat() / it.height }
                }
                PdfDocument(fd, renderer, ratios)
            } catch (e: Exception) {
                renderer.close()
                fd.close()
                throw e
            }
        }
    }
}
