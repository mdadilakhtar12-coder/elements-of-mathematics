package com.elementsofmathematics.app.data

import android.content.Context
import android.net.Uri
import com.elementsofmathematics.app.AppConfig
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
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
 * Students only read; writes are allowed only for the admin account (see firebase/*.rules).
 */
object Repository {
    private val db get() = FirebaseFirestore.getInstance()
    private val storage get() = FirebaseStorage.getInstance()
    private val auth get() = FirebaseAuth.getInstance()

    fun isFirebaseConfigured(context: Context) = FirebaseApp.getApps(context).isNotEmpty()

    // ---------- Reading ----------

    fun settingsFlow(): Flow<AppSettings> = callbackFlow {
        val reg = db.collection("config").document("app").addSnapshotListener { snap, _ ->
            trySend(snap?.toSettings() ?: AppSettings())
        }
        awaitClose { reg.remove() }
    }

    fun bannersFlow(): Flow<List<Banner>> = callbackFlow {
        val reg = db.collection("banners").orderBy("order").addSnapshotListener { snap, _ ->
            trySend(snap?.documents?.map { it.toBanner() } ?: emptyList())
        }
        awaitClose { reg.remove() }
    }

    fun sectionsFlow(): Flow<List<Section>> = callbackFlow {
        val reg = db.collection("sections").orderBy("order").addSnapshotListener { snap, _ ->
            trySend(snap?.documents?.map { it.toSection() } ?: emptyList())
        }
        awaitClose { reg.remove() }
    }

    fun itemsFlow(sectionId: String): Flow<List<ContentItem>> = callbackFlow {
        val reg = items(sectionId).orderBy("order").addSnapshotListener { snap, _ ->
            trySend(snap?.documents?.map { it.toItem() } ?: emptyList())
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

    suspend fun changeAdminPassword(newPassword: String) {
        val user = auth.currentUser ?: error("Not logged in")
        user.updatePassword(newPassword).await()
    }

    // ---------- Admin writes ----------

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
        val batch = db.batch()
        DEFAULT_SECTIONS.forEachIndexed { i, s ->
            batch.set(
                db.collection("sections").document(),
                mapOf("title" to s.title, "icon" to s.icon, "type" to s.type.key, "order" to i.toLong()),
            )
        }
        batch.commit().await()
    }

    suspend fun deleteSection(section: Section) {
        val docs = items(section.id).get().await().documents
        docs.forEach { deleteStorageFile(it.getString("storagePath")) }
        val batch = db.batch()
        docs.forEach { batch.delete(it.reference) }
        batch.delete(db.collection("sections").document(section.id))
        batch.commit().await()
    }

    suspend fun saveItem(sectionId: String, item: ContentItem, nextOrder: Long) {
        val data = mapOf(
            "title" to item.title,
            "url" to item.url,
            "storagePath" to item.storagePath,
            "order" to if (item.id.isEmpty()) nextOrder else item.order,
        )
        if (item.id.isEmpty()) items(sectionId).add(data).await()
        else items(sectionId).document(item.id).set(data).await()
    }

    suspend fun deleteItem(sectionId: String, item: ContentItem) {
        items(sectionId).document(item.id).delete().await()
        deleteStorageFile(item.storagePath)
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
        db.collection("banners").document(banner.id).delete().await()
        deleteStorageFile(banner.storagePath)
    }

    /**
     * Uploads a file picked on the phone to Firebase Storage.
     * Returns the public download URL and the storage path.
     */
    suspend fun uploadFile(
        uri: Uri,
        folder: String,
        extension: String,
        onProgress: (Float) -> Unit,
    ): Pair<String, String> {
        val path = "$folder/${UUID.randomUUID()}.$extension"
        val ref = storage.reference.child(path)
        ref.putFile(uri)
            .addOnProgressListener { s ->
                if (s.totalByteCount > 0) onProgress(s.bytesTransferred.toFloat() / s.totalByteCount)
            }
            .await()
        return ref.downloadUrl.await().toString() to path
    }

    suspend fun deleteStorageFile(path: String?) {
        if (path.isNullOrBlank()) return
        runCatching { storage.reference.child(path).delete().await() }
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
            bannerIntervalSec = getLong("bannerIntervalSec")?.toInt() ?: defaults.bannerIntervalSec,
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
    )

}
