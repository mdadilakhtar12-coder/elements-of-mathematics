package com.elementsofmathematics.app.data

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.Blob
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.io.ByteArrayOutputStream
import java.io.File
import java.security.MessageDigest
import java.util.UUID

/** A bounded library for Spark projects. Large libraries should use Cloud Storage instead. */
internal object FirestoreFiles {
    const val MAX_PDF_BYTES = 20L * 1024 * 1024
    private const val CHUNK_BYTES = 512 * 1024
    private val db get() = FirebaseFirestore.getInstance()
    private fun reference(path: String) = db.collection("protectedFiles").document(path.removePrefix("firestore-pdfs/"))

    suspend fun uploadPdf(context: Context, uri: Uri, onProgress: (Float) -> Unit): Pair<String, String> =
        withContext(Dispatchers.IO) {
            val size = context.contentResolver.query(uri, arrayOf(OpenableColumns.SIZE), null, null, null)?.use {
                if (it.moveToFirst() && !it.isNull(0)) it.getLong(0) else 0L
            } ?: 0L
            require(size <= MAX_PDF_BYTES) { "Free library supports PDFs up to 20 MB. Split this PDF into chapters." }
            val path = "firestore-pdfs/${UUID.randomUUID()}"
            val ref = reference(path)
            var chunks = 0
            var bytes = 0L
            val digest = MessageDigest.getInstance("SHA-256")
            try {
                ref.set(mapOf("state" to "uploading", "chunks" to 0, "size" to 0L)).await()
                context.contentResolver.openInputStream(uri)?.use { input ->
                    var batch = db.batch()
                    var pending = 0
                    while (true) {
                        ensureActive()
                        val buffer = ByteArray(CHUNK_BYTES)
                        var n = 0
                        while (n < buffer.size) {
                            val read = input.read(buffer, n, buffer.size - n)
                            if (read < 0) break
                            n += read
                        }
                        if (n == 0) break
                        if (chunks == 0) require(n >= 5 && String(buffer, 0, 5, Charsets.US_ASCII) == "%PDF-") { "Choose a valid PDF file" }
                        bytes += n
                        require(bytes <= MAX_PDF_BYTES) { "Free library supports PDFs up to 20 MB" }
                        val data = buffer.copyOf(n)
                        digest.update(data)
                        batch.set(ref.collection("chunks").document(chunks.toString()), mapOf("data" to Blob.fromBytes(data)))
                        chunks++
                        pending++
                        if (pending == 8) {
                            batch.update(ref, "chunks", chunks, "size", bytes)
                            batch.commit().await()
                            onProgress((bytes.toFloat() / if (size > 0) size else MAX_PDF_BYTES).coerceAtMost(0.98f))
                            batch = db.batch()
                            pending = 0
                        }
                    }
                    require(chunks > 0) { "The PDF file is empty" }
                    if (pending > 0) {
                        batch.update(ref, "chunks", chunks, "size", bytes)
                        batch.commit().await()
                    }
                } ?: error("Could not read the selected PDF")
                ref.update(mapOf("state" to "ready", "sha256" to digest.digest().joinToString("") { "%02x".format(it) })).await()
                onProgress(1f)
                "" to path
            } catch (e: Exception) {
                // Include pending chunks: deletes of nonexistent docs are harmless.
                withContext(NonCancellable) { withTimeoutOrNull(15_000) { runCatching { delete(path, chunks) } } }
                throw e
            }
        }

    suspend fun download(path: String, target: File, onProgress: (Float?) -> Unit) = withContext(Dispatchers.IO) {
        require(Regex("firestore-pdfs/[A-Za-z0-9-]+").matches(path)) { "Invalid PDF reference" }
        val auth = FirebaseAuth.getInstance()
        if (auth.currentUser == null) auth.signInAnonymously().await()
        val ref = reference(path)
        val metadata = ref.get(Source.SERVER).await()
        require(metadata.getString("state") == "ready") { "This PDF is not ready. Please try again later" }
        val count = (metadata.getLong("chunks") ?: 0L).toInt()
        val total = metadata.getLong("size") ?: 0L
        require(count in 1..40 && total in 5..MAX_PDF_BYTES) { "Invalid PDF metadata" }
        val digest = MessageDigest.getInstance("SHA-256")
        var written = 0L
        target.outputStream().use { output ->
            repeat(count) { index ->
                ensureActive()
                val bytes = ref.collection("chunks").document(index.toString()).get(Source.SERVER).await().getBlob("data")?.toBytes()
                    ?: error("Incomplete PDF upload")
                require(bytes.size <= CHUNK_BYTES && written + bytes.size <= total) { "Invalid PDF chunk" }
                output.write(bytes)
                digest.update(bytes)
                written += bytes.size
                onProgress(written.toFloat() / total)
            }
        }
        require(written == total && digest.digest().joinToString("") { "%02x".format(it) } == metadata.getString("sha256")) { "PDF verification failed. Please try again" }
    }

    suspend fun delete(path: String, knownChunks: Int? = null) {
        val ref = reference(path)
        val count = knownChunks ?: (ref.get(Source.SERVER).await().getLong("chunks") ?: 0L).toInt()
        require(count in 0..40) { "Invalid PDF metadata" }
        val batch = db.batch()
        repeat(count) { batch.delete(ref.collection("chunks").document(it.toString())) }
        batch.delete(ref)
        batch.commit().await()
    }

    /** Small inline JPEG banners avoid a paid storage bucket. */
    suspend fun bannerImage(context: Context, uri: Uri): String = withContext(Dispatchers.IO) {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
        require(bounds.outWidth > 0 && bounds.outHeight > 0) { "Choose a valid image" }
        val options = BitmapFactory.Options().apply {
            inSampleSize = 1
            while (bounds.outWidth / inSampleSize > 1600 || bounds.outHeight / inSampleSize > 1600) inSampleSize *= 2
        }
        val bitmap = context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, options) }
            ?: error("Could not open image")
        try {
            val output = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 75, output)
            val bytes = output.toByteArray()
            require(bytes.size <= 500 * 1024) { "Choose a smaller banner image" }
            "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
        } finally { bitmap.recycle() }
    }
}
