package com.elementsofmathematics.app.data

import android.content.Context
import android.net.Uri
import com.elementsofmathematics.app.AppConfig
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.storage.StorageMetadata
import kotlinx.coroutines.CancellationException
import java.io.File
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.MetadataChanges
import com.google.firebase.firestore.Source
import com.google.firebase.storage.StorageException
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.util.UUID

/**
 * All shared content lives in Firebase:
 *  config/app                     → AppSettings
 *  banners/{id}                   → Banner
 *  sections/{id}                  → Section
 *  sections/{id}/items/{itemId}   → ContentItem
 * Students only read; writes are allowed only for the admin account (see the rules files in the firebase folder).
 */
object Repository {
    private val db get() = FirebaseFirestore.getInstance()
    private val storage get() = FirebaseStorage.getInstance()
    private val auth get() = FirebaseAuth.getInstance()

    fun isFirebaseConfigured(context: Context) = FirebaseApp.getApps(context).isNotEmpty()

    // ---------- Reading ----------

    fun settingsFlow(): Flow<AppSettings> = callbackFlow {
        var cached = LocalStore.catalog("settings", AppSettings::class.java)
        cached?.let { trySend(it) }
        val reg = db.collection("config").document("app").addSnapshotListener(MetadataChanges.INCLUDE) { snap, error ->
            if (error != null) { if (cached == null) close(error); return@addSnapshotListener }
            if (snap?.metadata?.isFromCache == true && (cached != null || !snap.exists())) return@addSnapshotListener
            val value = snap?.toSettings() ?: AppSettings()
            LocalStore.saveCatalog("settings", value)
            cached = value
            trySend(value)
        }
        awaitClose { reg.remove() }
    }

    fun bannersFlow(): Flow<List<Banner>> = callbackFlow {
        var cached = LocalStore.catalog("banners", Array<Banner>::class.java)?.toList()
        cached?.let { trySend(it) }
        val reg = db.collection("banners").orderBy("order").addSnapshotListener(MetadataChanges.INCLUDE) { snap, error ->
            if (error != null) { if (cached == null) close(error); return@addSnapshotListener }
            if (snap?.metadata?.isFromCache == true && (cached != null || snap.isEmpty)) return@addSnapshotListener
            val value = snap?.documents?.map { it.toBanner() } ?: emptyList()
            LocalStore.saveCatalog("banners", value.toTypedArray())
            cached = value
            trySend(value)
        }
        awaitClose { reg.remove() }
    }

    fun sectionsFlow(): Flow<List<Section>> = callbackFlow {
        var cached = LocalStore.catalog("sections", Array<Section>::class.java)?.toList()
        cached?.let { trySend(it) }
        val reg = db.collection("sections").orderBy("order").addSnapshotListener(MetadataChanges.INCLUDE) { snap, error ->
            if (error != null) { if (cached == null) close(error); return@addSnapshotListener }
            if (snap?.metadata?.isFromCache == true && (cached != null || snap.isEmpty)) return@addSnapshotListener
            val value = snap?.documents?.map { it.toSection() } ?: emptyList()
            LocalStore.saveCatalog("sections", value.toTypedArray())
            cached = value
            trySend(value)
        }
        awaitClose { reg.remove() }
    }

    fun itemsFlow(sectionId: String): Flow<List<ContentItem>> = callbackFlow {
        val cacheKey = "items_$sectionId"
        var cached = LocalStore.catalog(cacheKey, Array<ContentItem>::class.java)?.toList()
        cached?.let { trySend(it) }
        val reg = items(sectionId).orderBy("order").addSnapshotListener(MetadataChanges.INCLUDE) { snap, error ->
            if (error != null) { if (cached == null) close(error); return@addSnapshotListener }
            if (snap?.metadata?.isFromCache == true && (cached != null || snap.isEmpty)) return@addSnapshotListener
            val value = snap?.documents?.map { it.toItem() } ?: emptyList()
            LocalStore.saveCatalog(cacheKey, value.toTypedArray())
            cached = value
            trySend(value)
        }
        awaitClose { reg.remove() }
    }

    // ---------- Admin auth ----------

    fun isAdminFlow(): Flow<Boolean> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener {
            trySend(it.currentUser?.email.equals(AppConfig.ADMIN_EMAIL, ignoreCase = true))
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun adminLogin(password: String) {
        auth.signInWithEmailAndPassword(AppConfig.ADMIN_EMAIL, password).await()
    }

    fun adminLogout() = auth.signOut()

    suspend fun changeAdminPassword(currentPassword: String, newPassword: String) {
        val user = auth.currentUser ?: error("Not logged in")
        user.reauthenticate(EmailAuthProvider.getCredential(AppConfig.ADMIN_EMAIL, currentPassword)).await()
        user.updatePassword(newPassword).await()
    }

    suspend fun downloadPdf(path: String, target: File, onProgress: (Float?) -> Unit) {
        if (path.startsWith("firestore-pdfs/")) { FirestoreFiles.download(path, target, onProgress); return }
        require(path.startsWith("pdfs/") && !path.contains("..")) { "Invalid PDF storage path" }
        if (auth.currentUser == null) auth.signInAnonymously().await()
        val ref = storage.reference.child(path)
        require(ref.metadata.await().sizeBytes <= PdfDownloader.MAX_BYTES) { "PDF exceeds the 100 MB limit" }
        val task = ref.getFile(target).addOnProgressListener { snapshot ->
            onProgress(if (snapshot.totalByteCount > 0) snapshot.bytesTransferred.toFloat() / snapshot.totalByteCount else null)
        }
        try { task.await() } catch (e: CancellationException) { task.cancel(); throw e }
    }

    // ---------- Admin writes ----------

    /** A server read prevents stale metadata from reporting an offline device as up to date. */
    suspend fun latestRelease(): AppRelease? {
        val doc = db.collection("config").document("update").get(Source.SERVER).await()
        if (!doc.exists()) return null
        return AppRelease(doc.getLong("versionCode") ?: 0, doc.getString("versionName").orEmpty(),
            doc.getString("apkUrl").orEmpty(), doc.getString("sha256").orEmpty(), doc.getString("notes").orEmpty())
            .also { it.validate() }
    }

    suspend fun publishRelease(release: AppRelease) {
        release.validate()
        db.collection("config").document("update").set(mapOf(
            "versionCode" to release.versionCode, "versionName" to release.versionName,
            "apkUrl" to release.apkUrl, "sha256" to release.sha256.lowercase(), "notes" to release.notes,
        )).await()
    }

    suspend fun saveSettings(settings: AppSettings) {
        val data = mapOf(
            "appTitle" to settings.appTitle,
            "bannerIntervalSec" to settings.bannerIntervalSec,
            "feedbackEmail" to settings.feedbackEmail,
            "moreApps" to settings.moreApps.map { mapOf("title" to it.title, "url" to it.url) },
        )
        db.collection("config").document("app").set(data, SetOptions.merge()).await()
    }

    suspend fun saveSection(section: Section, nextOrder: Long) {
        val data = mapOf(
            "title" to section.title,
            "icon" to section.icon,
            "type" to section.type.key,
            "order" to if (section.id.isEmpty()) nextOrder else section.order,
        )
        val col = db.collection("sections")
        if (section.id.isEmpty()) col.add(data).await() else col.document(section.id).set(data).await()
    }

    suspend fun addDefaultSections() {
        if (!db.collection("sections").limit(1).get().await().isEmpty) return
        val batch = db.batch()
        DEFAULT_SECTIONS.forEachIndexed { i, s ->
            batch.set(
                db.collection("sections").document("default-$i"),
                mapOf("title" to s.title, "icon" to s.icon, "type" to s.type.key, "order" to i.toLong()),
            )
        }
        batch.commit().await()
    }

    suspend fun deleteSection(section: Section) {
        val docs = items(section.id).get().await().documents
        // Firestore accepts at most 500 writes per batch.
        docs.chunked(400).forEach { chunk ->
            chunk.forEach { deleteStorageFile(it.getString("storagePath")) }
            val batch = db.batch()
            chunk.forEach { batch.delete(it.reference) }
            batch.commit().await()
        }
        db.collection("sections").document(section.id).delete().await()
    }

    suspend fun saveItem(sectionId: String, item: ContentItem, nextOrder: Long) {
        val catalog = items(sectionId).get(Source.SERVER).await().documents.map { it.toItem() }
        FolderTree.validate(catalog, item)
        if (item.id.isNotEmpty()) {
            require(catalog.any { it.id == item.id && it.isFolder == item.isFolder }) { "Content no longer exists" }
        }
        val data = mapOf(
            "title" to item.title,
            "url" to item.url,
            "storagePath" to item.storagePath,
            "order" to if (item.id.isEmpty()) nextOrder else item.order,
            "isFolder" to item.isFolder,
            "parentId" to item.parentId.orEmpty(),
        )
        if (item.id.isEmpty()) items(sectionId).add(data).await()
        else items(sectionId).document(item.id).set(data).await()
    }

    suspend fun deleteItem(sectionId: String, item: ContentItem) {
        if (item.isFolder) {
            require(items(sectionId).whereEqualTo("parentId", item.id).limit(1).get(Source.SERVER).await().isEmpty) {
                "Move or delete this folder's contents first"
            }
        }
        deleteStorageFile(item.storagePath)
        items(sectionId).document(item.id).delete().await()
    }

    /** Swaps the order of two neighbouring sections / items / banners. */
    suspend fun swapOrder(pathA: String, orderA: Long, pathB: String, orderB: Long) {
        val batch = db.batch()
        batch.update(db.document(pathA), "order", orderB)
        batch.update(db.document(pathB), "order", orderA)
        batch.commit().await()
    }

    fun sectionPath(id: String) = "sections/$id"
    fun itemPath(sectionId: String, id: String) = "sections/$sectionId/items/$id"
    fun bannerPath(id: String) = "banners/$id"

    suspend fun saveBanner(banner: Banner, nextOrder: Long) {
        val data = mapOf(
            "imageUrl" to banner.imageUrl,
            "storagePath" to banner.storagePath,
            "linkUrl" to banner.linkUrl,
            "order" to if (banner.id.isEmpty()) nextOrder else banner.order,
        )
        val col = db.collection("banners")
        if (banner.id.isEmpty()) col.add(data).await() else col.document(banner.id).set(data).await()
    }

    suspend fun deleteBanner(banner: Banner) {
        deleteStorageFile(banner.storagePath)
        db.collection("banners").document(banner.id).delete().await()
    }

    /**
     * Uploads a file picked on the phone to Firebase Storage.
     * Returns the public download URL and the storage path.
     */
    suspend fun uploadFile(
        context: Context,
        uri: Uri,
        folder: String,
        extension: String,
        onProgress: (Float) -> Unit,
    ): Pair<String, String> {
        if (folder == "pdfs") return FirestoreFiles.uploadPdf(context, uri, onProgress)
        if (folder == "banners") return FirestoreFiles.bannerImage(context, uri) to ""
        val path = "$folder/${UUID.randomUUID()}.$extension"
        val ref = storage.reference.child(path)
        val metadata = StorageMetadata.Builder().setContentType(if (extension == "pdf") "application/pdf" else "image/jpeg").build()
        val task = ref.putFile(uri, metadata)
            .addOnProgressListener { s ->
                if (s.totalByteCount > 0) onProgress(s.bytesTransferred.toFloat() / s.totalByteCount)
            }
        try { task.await() } catch (e: CancellationException) { task.cancel(); throw e }
        // PDFs use authenticated SDK access. Never store their public token URLs.
        return (if (folder == "pdfs") "" else ref.downloadUrl.await().toString()) to path
    }

    suspend fun deleteStorageFile(path: String?) {
        if (path.isNullOrBlank()) return
        if (path.startsWith("firestore-pdfs/")) FirestoreFiles.delete(path)
        else try { storage.reference.child(path).delete().await() } catch (e: StorageException) {
            if (e.errorCode != StorageException.ERROR_OBJECT_NOT_FOUND) throw e
        }
    }

    // ---------- Mapping ----------

    private fun items(sectionId: String) =
        db.collection("sections").document(sectionId).collection("items")

    private fun DocumentSnapshot.toSettings(): AppSettings {
        val defaults = AppSettings()
        @Suppress("UNCHECKED_CAST")
        val apps = (get("moreApps") as? List<Map<String, Any?>>).orEmpty().mapNotNull {
            val title = it["title"] as? String ?: return@mapNotNull null
            MoreApp(title, it["url"] as? String ?: "")
        }
        return AppSettings(
            appTitle = getString("appTitle")?.takeIf { it.isNotBlank() } ?: defaults.appTitle,
            bannerIntervalSec = getLong("bannerIntervalSec")?.coerceIn(0L, 15L)?.toInt() ?: defaults.bannerIntervalSec,
            feedbackEmail = getString("feedbackEmail") ?: defaults.feedbackEmail,
            moreApps = apps,
        )
    }

    private fun DocumentSnapshot.toBanner() = Banner(
        id = id,
        imageUrl = getString("imageUrl") ?: "",
        storagePath = getString("storagePath") ?: "",
        linkUrl = getString("linkUrl") ?: "",
        order = getLong("order") ?: 0,
    )

    private fun DocumentSnapshot.toSection() = Section(
        id = id,
        title = getString("title") ?: "",
        icon = getString("icon") ?: "📚",
        type = SectionType.from(getString("type")),
        order = getLong("order") ?: 0,
    )

    private fun DocumentSnapshot.toItem() = ContentItem(
        id = id,
        title = getString("title") ?: "",
        url = getString("url") ?: "",
        storagePath = getString("storagePath") ?: "",
        order = getLong("order") ?: 0,
        isFolder = getBoolean("isFolder") ?: false,
        parentId = getString("parentId"),
    )

}
