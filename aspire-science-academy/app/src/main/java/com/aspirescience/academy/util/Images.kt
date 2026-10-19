package com.aspirescience.academy.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import android.util.Base64
import java.io.ByteArrayOutputStream

/** Shrinks a photo so it fits comfortably in a database document, as Base64 text. */
object Images {
    fun encode(ctx: Context, uri: Uri, maxSide: Int = 1280, maxBytes: Int = 450_000): String? {
        try {
            val bounds = BitmapFactory.Options()
            bounds.inJustDecodeBounds = true
            ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
            var sample = 1
            while (maxOf(bounds.outWidth, bounds.outHeight) / sample > maxSide * 2) sample *= 2
            val opts = BitmapFactory.Options()
            opts.inSampleSize = sample
            var bmp = ctx.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) } ?: return null

            var degrees = 0
            ctx.contentResolver.openInputStream(uri)?.use { s ->
                val o = ExifInterface(s).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
                degrees = when (o) {
                    ExifInterface.ORIENTATION_ROTATE_90 -> 90
                    ExifInterface.ORIENTATION_ROTATE_180 -> 180
                    ExifInterface.ORIENTATION_ROTATE_270 -> 270
                    else -> 0
                }
            }
            val scale = maxSide.toFloat() / maxOf(bmp.width, bmp.height)
            if (scale < 1f || degrees != 0) {
                val m = Matrix()
                if (scale < 1f) m.postScale(scale, scale)
                if (degrees != 0) m.postRotate(degrees.toFloat())
                bmp = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true)
            }
            var quality = 75
            while (true) {
                val out = ByteArrayOutputStream()
                bmp.compress(Bitmap.CompressFormat.JPEG, quality, out)
                if (out.size() <= maxBytes || quality <= 35) {
                    return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
                }
                quality -= 10
            }
        } catch (e: Exception) {
            return null
        }
    }

    fun decode(data: String): Bitmap? = try {
        val b = Base64.decode(data, Base64.NO_WRAP)
        BitmapFactory.decodeByteArray(b, 0, b.size)
    } catch (e: Exception) {
        null
    }
}
