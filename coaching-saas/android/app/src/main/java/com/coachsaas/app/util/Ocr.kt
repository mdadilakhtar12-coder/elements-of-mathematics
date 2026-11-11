package com.coachsaas.app.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.media.ExifInterface
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

/**
 * Reads text from a photo or a PDF with Google's free on-device text reader (ML Kit).
 * It runs inside the phone: no server, no account, no cost. It reads printed and clearly written text well;
 * messy handwriting is read badly, which is why every result is checked by the admin before it is saved.
 */
object Ocr {
    private const val MAX_SIDE = 2600
    private const val MAX_PDF_PAGES = 8

    /** A picture from the gallery / camera as a bitmap that is not too big, turned upright using its EXIF data. */
    suspend fun loadBitmap(ctx: Context, uri: Uri): Bitmap? = withContext(Dispatchers.IO) {
        try {
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
            var sample = 1
            while (maxOf(bounds.outWidth, bounds.outHeight) / sample > MAX_SIDE * 2) sample *= 2
            val opts = BitmapFactory.Options().apply { inSampleSize = sample }
            var bmp = ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) } ?: return@withContext null
            var degrees = 0
            ctx.contentResolver.openInputStream(uri)?.use { s ->
                degrees = when (ExifInterface(s).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
                    ExifInterface.ORIENTATION_ROTATE_90 -> 90
                    ExifInterface.ORIENTATION_ROTATE_180 -> 180
                    ExifInterface.ORIENTATION_ROTATE_270 -> 270
                    else -> 0
                }
            }
            val scale = MAX_SIDE.toFloat() / maxOf(bmp.width, bmp.height)
            if (scale < 1f || degrees != 0) {
                val m = Matrix()
                if (scale < 1f) m.postScale(scale, scale)
                if (degrees != 0) m.postRotate(degrees.toFloat())
                bmp = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true)
            }
            bmp
        } catch (e: Exception) {
            null
        }
    }

    /** The pages of a PDF as pictures (white background), up to [MAX_PDF_PAGES]. */
    suspend fun pdfPages(ctx: Context, uri: Uri): List<Bitmap> = withContext(Dispatchers.IO) {
        val out = ArrayList<Bitmap>()
        try {
            ctx.contentResolver.openFileDescriptor(uri, "r")?.use { fd ->
                PdfRenderer(fd).use { r ->
                    for (i in 0 until minOf(r.pageCount, MAX_PDF_PAGES)) {
                        r.openPage(i).use { page ->
                            val w = 1800
                            val h = (w.toFloat() * page.height / page.width).toInt().coerceAtLeast(1)
                            val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
                            Canvas(bmp).drawColor(Color.WHITE)
                            page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                            out.add(bmp)
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // an unreadable PDF just gives no pages
        }
        out
    }

    /** Every line of text in the picture with its position. */
    suspend fun read(bitmap: Bitmap): List<OcrLine> {
        val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        try {
            val text = recognizer.process(InputImage.fromBitmap(bitmap, 0)).await()
            return text.textBlocks.flatMap { it.lines }.mapNotNull { l ->
                l.boundingBox?.let { OcrLine(l.text, it.left, it.top, it.right, it.bottom) }
            }
        } finally {
            recognizer.close()
        }
    }

    /** Text rows of all the given pictures, top to bottom (page after page). */
    suspend fun rows(bitmaps: List<Bitmap>): List<String> {
        val all = ArrayList<String>()
        for (b in bitmaps) all.addAll(TT.groupRows(read(b)))
        return all
    }
}
