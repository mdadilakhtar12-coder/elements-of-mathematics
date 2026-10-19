package com.aspirescience.academy.data

import com.aspirescience.academy.AppConfig
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseNetworkException
import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.Source
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/** All Firebase access lives here. */
object Repo {
    @Volatile
    var ready = false

    /** Called when a live listener fails (most often: Firestore rules not published yet). */
    var onError: (String) -> Unit = {}

    private val db: FirebaseFirestore get() = FirebaseFirestore.getInstance()
    val auth: FirebaseAuth get() = FirebaseAuth.getInstance()

    fun loginEmail(id: String): String {
        val t = id.trim().lowercase()
        return if (t.contains("@")) t else t + "@" + AppConfig.EMAIL_DOMAIN
    }

    fun friendly(e: Throwable): String = when (e) {
        is FirebaseAuthInvalidCredentialsException, is FirebaseAuthInvalidUserException ->
            "Wrong ID or password"
        is FirebaseAuthUserCollisionException -> "This ID is already registered"
        is FirebaseAuthWeakPasswordException -> "Password must be at least 6 characters"
        is FirebaseNetworkException -> "No internet connection"
        is FirebaseFirestoreException ->
            if (e.code == FirebaseFirestoreException.Code.PERMISSION_DENIED)
                "Permission denied. Publish the Firestore rules from the README."
            else e.message ?: "Something went wrong"
        else -> e.message ?: "Something went wrong"
    }

    // ---------- live queries ----------

    private inline fun <reified T : HasId> Query.models(): Flow<List<T>> = callbackFlow {
        val reg = addSnapshotListener { snap, err ->
            if (err != null) {
                onError(friendly(err))
                return@addSnapshotListener
            }
            if (snap != null) {
                trySend(snap.documents.mapNotNull { d -> d.toObject(T::class.java)?.also { m -> m.id = d.id } })
            }
        }
        awaitClose { reg.remove() }
    }

    fun profile(uid: String): Flow<UserProfile?> = callbackFlow {
        val reg = db.collection("users").document(uid).addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null && s.exists()) {
                trySend(s.toObject(UserProfile::class.java)?.also { it.id = s.id })
            }
        }
        awaitClose { reg.remove() }
    }

    fun users(): Flow<List<UserProfile>> = db.collection("users").models()
    fun batches(): Flow<List<Batch>> = db.collection("batches").models()
    fun classes(fromDate: String): Flow<List<ClassSession>> =
        db.collection("classes").whereGreaterThanOrEqualTo("date", fromDate).models()

    fun classesBetween(from: String, to: String): Flow<List<ClassSession>> =
        db.collection("classes").whereGreaterThanOrEqualTo("date", from)
            .whereLessThanOrEqualTo("date", to).models()

    fun exams(): Flow<List<Exam>> =
        db.collection("exams").orderBy("date", Query.Direction.DESCENDING).limit(300).models()

    fun notices(): Flow<List<Notice>> =
        db.collection("notices").orderBy("createdAt", Query.Direction.DESCENDING).limit(100).models()

    fun homework(): Flow<List<Homework>> =
        db.collection("homework").orderBy("createdAt", Query.Direction.DESCENDING).limit(200).models()

    fun attendanceByClass(classId: String): Flow<List<Attendance>> =
        db.collection("attendance").whereEqualTo("classId", classId).models()

    fun attendanceByStudent(studentId: String): Flow<List<Attendance>> =
        db.collection("attendance").whereEqualTo("studentId", studentId).models()

    fun marksByExam(examId: String): Flow<List<Mark>> =
        db.collection("marks").whereEqualTo("examId", examId).models()

    fun marksByStudent(studentId: String): Flow<List<Mark>> =
        db.collection("marks").whereEqualTo("studentId", studentId).models()

    fun feesByMonth(month: String): Flow<List<Fee>> =
        db.collection("fees").whereEqualTo("month", month).models()

    fun feesByStudent(studentId: String): Flow<List<Fee>> =
        db.collection("fees").whereEqualTo("studentId", studentId).models()

    /** Admin-edited message texts (settings/messages). Errors are ignored: the built-in texts are used instead. */
    fun messageTemplates(): Flow<Map<String, String>> = callbackFlow {
        val reg = db.collection("settings").document("messages").addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null && s.exists()) {
                val m = HashMap<String, String>()
                s.data?.forEach { (k, v) -> if (v is String) m[k] = v }
                trySend(m)
            }
        }
        awaitClose { reg.remove() }
    }

    suspend fun saveTemplates(m: Map<String, String>) {
        db.collection("settings").document("messages").set(m).await()
    }

    fun leaderboards(): Flow<List<Leaderboard>> = db.collection("leaderboards").models()

    // ---------- one-time reads ----------

    private suspend inline fun <reified T : HasId> Query.once(): List<T> =
        get().await().documents.mapNotNull { d -> d.toObject(T::class.java)?.also { m -> m.id = d.id } }

    suspend fun batchesOnce(): List<Batch> = db.collection("batches").once()
    suspend fun noticesSince(ms: Long): List<Notice> = db.collection("notices").whereGreaterThan("createdAt", ms).once()
    suspend fun homeworkSince(ms: Long): List<Homework> = db.collection("homework").whereGreaterThan("createdAt", ms).once()
    suspend fun classesRange(from: String, to: String): List<ClassSession> =
        db.collection("classes").whereGreaterThanOrEqualTo("date", from).whereLessThanOrEqualTo("date", to).once()

    suspend fun classesByStatus(status: String): List<ClassSession> =
        db.collection("classes").whereEqualTo("status", status).once()

    suspend fun attendanceOf(studentId: String): List<Attendance> =
        db.collection("attendance").whereEqualTo("studentId", studentId).once()

    suspend fun marksOf(studentId: String): List<Mark> = db.collection("marks").whereEqualTo("studentId", studentId).once()
    suspend fun marksOfBatch(batchId: String): List<Mark> = db.collection("marks").whereEqualTo("batchId", batchId).once()
    suspend fun feesOf(studentId: String): List<Fee> = db.collection("fees").whereEqualTo("studentId", studentId).once()

    /** Every document of a collection as plain maps (used by the backup). */
    suspend fun dump(col: String): List<Map<String, Any?>> =
        db.collection(col).get().await().documents.map { d -> (d.data ?: emptyMap()) + ("id" to d.id) }

    /** Recomputes the ranking of a batch from all saved exam marks. */
    suspend fun rebuildLeaderboard(batchId: String, batchName: String) {
        val marks = marksOfBatch(batchId).filter { !it.absent && it.maxMarks > 0 }
        val entries = marks.groupBy { it.studentId }.map { (sid, ms) ->
            LbEntry(sid, ms.first().studentName, ms.sumOf { it.marks * 100.0 / it.maxMarks } / ms.size, ms.size)
        }.sortedByDescending { it.pct }.take(100)
        put("leaderboards", Leaderboard(batchId, batchName, entries, System.currentTimeMillis()))
    }

    // ---------- writes ----------

    suspend fun <T : HasId> put(col: String, item: T): T {
        if (item.id.isBlank()) item.id = db.collection(col).document().id
        db.collection(col).document(item.id).set(item).await()
        return item
    }

    suspend fun putAll(col: String, items: List<HasId>) {
        for (chunk in items.chunked(400)) {
            val wb = db.batch()
            for (item in chunk) wb.set(db.collection(col).document(item.id), item)
            wb.commit().await()
        }
    }

    suspend fun update(col: String, id: String, fields: Map<String, Any?>) {
        db.collection(col).document(id).update(fields).await()
    }

    /** Ids of all mark documents of an exam (used when an exam is deleted). */
    suspend fun marksOnce(examId: String): List<String> =
        db.collection("marks").whereEqualTo("examId", examId).get().await().documents.map { it.id }

    /** Ids of documents whose id starts with [prefix]. */
    suspend fun idsWithPrefix(col: String, prefix: String): List<String> =
        db.collection(col)
            .whereGreaterThanOrEqualTo(com.google.firebase.firestore.FieldPath.documentId(), prefix)
            .whereLessThan(com.google.firebase.firestore.FieldPath.documentId(), prefix + "\uf8ff")
            .get().await().documents.map { it.id }

    suspend fun deleteAll(col: String, ids: List<String>) {
        for (chunk in ids.chunked(400)) {
            val wb = db.batch()
            for (id in chunk) wb.delete(db.collection(col).document(id))
            wb.commit().await()
        }
    }

    suspend fun delete(col: String, id: String) {
        db.collection(col).document(id).delete().await()
    }

    // ---------- accounts ----------

    /** Signs in and returns the user's profile. The owner admin profile is created on first login. */
    suspend fun signIn(id: String, password: String): UserProfile {
        val email = loginEmail(id)
        val res = auth.signInWithEmailAndPassword(email, password).await()
        val user = res.user ?: error("Login failed")
        var p = loadProfile(user.uid)
        if (p == null && email == AppConfig.ADMIN_EMAIL) {
            p = UserProfile(
                id = user.uid, role = Role.ADMIN, name = "Admin", loginId = id.trim(),
                createdAt = System.currentTimeMillis()
            )
            put("users", p)
            setPassword(user.uid, p.loginId, p.role, password)
        }
        if (p == null) {
            auth.signOut()
            error("This account is not set up. Please contact the admin.")
        }
        if (!p.active) {
            auth.signOut()
            error("This account has been deactivated.")
        }
        return p
    }

    suspend fun loadProfile(uid: String): UserProfile? {
        val ref = db.collection("users").document(uid)
        val snap = try {
            ref.get().await()
        } catch (e: Exception) {
            ref.get(Source.CACHE).await()
        }
        return snap.toObject(UserProfile::class.java)?.also { it.id = uid }
    }

    fun signOut() = auth.signOut()

    private fun secondaryAuth(): FirebaseAuth {
        val main = FirebaseApp.getInstance()
        val app = try {
            FirebaseApp.getInstance("secondary")
        } catch (e: IllegalStateException) {
            FirebaseApp.initializeApp(main.applicationContext, main.options, "secondary")
        }
        return FirebaseAuth.getInstance(app)
    }

    /** Creates the login without signing the admin out (uses a second Firebase app instance). */
    suspend fun createAuthUser(loginId: String, password: String): String {
        val a = secondaryAuth()
        val email = loginEmail(loginId)
        return try {
            val uid = a.createUserWithEmailAndPassword(email, password).await().user?.uid ?: error("Could not create user")
            a.signOut()
            uid
        } catch (e: FirebaseAuthUserCollisionException) {
            // A previous attempt may have created the login but not the profile; reuse it.
            val uid = try {
                a.signInWithEmailAndPassword(email, password).await().user?.uid
            } catch (e2: Exception) {
                null
            }
            a.signOut()
            uid ?: throw e
        }
    }

    private suspend fun <T> withUser(loginId: String, password: String, block: suspend (FirebaseUser) -> T): T {
        val a = secondaryAuth()
        val user = a.signInWithEmailAndPassword(loginEmail(loginId), password).await().user
            ?: error("Could not open the account")
        try {
            return block(user)
        } finally {
            a.signOut()
        }
    }

    suspend fun setPassword(uid: String, loginId: String, role: String, password: String) {
        db.collection("credentials").document(uid)
            .set(mapOf("loginId" to loginId, "role" to role, "password" to password)).await()
    }

    suspend fun getPassword(uid: String): String =
        db.collection("credentials").document(uid).get().await().getString("password").orEmpty()

    suspend fun resetPassword(user: UserProfile, newPassword: String) {
        val old = getPassword(user.id)
        if (old.isEmpty()) error("Old password is not available for this user")
        withUser(user.loginId, old) { it.updatePassword(newPassword).await() }
        setPassword(user.id, user.loginId, user.role, newPassword)
    }

    suspend fun changeOwnPassword(me: UserProfile, current: String, newPassword: String) {
        val u = auth.currentUser ?: error("Not logged in")
        val email = u.email ?: error("Not logged in")
        u.reauthenticate(EmailAuthProvider.getCredential(email, current)).await()
        u.updatePassword(newPassword).await()
        setPassword(me.id, me.loginId, me.role, newPassword)
    }

    suspend fun deleteUser(user: UserProfile) {
        try {
            val old = getPassword(user.id)
            if (old.isNotEmpty()) withUser(user.loginId, old) { it.delete().await() }
        } catch (e: Exception) {
            // The login could not be removed; the profile is deleted anyway so the user cannot enter.
        }
        delete("credentials", user.id)
        delete("users", user.id)
    }
}
