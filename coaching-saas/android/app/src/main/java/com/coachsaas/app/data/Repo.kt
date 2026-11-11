package com.coachsaas.app.data

import com.coachsaas.app.AppConfig
import com.google.firebase.FirebaseNetworkException
import com.google.firebase.auth.ActionCodeSettings
import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.auth.FirebaseAuthUserCollisionException
import com.google.firebase.auth.FirebaseAuthWeakPasswordException
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.functions.FirebaseFunctionsException
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.Source
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/** All Firebase access lives here. */
object Repo {
    @Volatile
    var ready = false

    /** Called when a live listener fails (most often: Firestore rules not published yet). */
    var onError: (String) -> Unit = {}

    private val db: FirebaseFirestore get() = FirebaseFirestore.getInstance()
    val auth: FirebaseAuth get() = FirebaseAuth.getInstance()

    /** The institute whose data this session reads. Set when the session opens (from the signed-in user's claims). */
    @Volatile
    var instituteId: String = ""

    /** Everything an institute owns lives under institutes/{id}/<name>. Rules reject any other institute. */
    private fun coll(name: String) = db.collection("institutes").document(instituteId).collection(name)

    private val functions: FirebaseFunctions get() = FirebaseFunctions.getInstance(AppConfig.FUNCTIONS_REGION)

    /** The hidden e-mail behind "institute code + username" (see functions/src/validate.js). */
    fun loginEmail(code: String, username: String): String =
        username.trim().lowercase().replace(Regex("\\s+"), "") + "@" + code.trim().lowercase() + "." + AppConfig.LOGIN_DOMAIN

    fun friendly(e: Throwable): String = when (e) {
        is FirebaseAuthInvalidCredentialsException, is FirebaseAuthInvalidUserException ->
            "Wrong institute code, username or password"
        is FirebaseAuthUserCollisionException -> "This account already exists"
        is FirebaseAuthWeakPasswordException -> "Password must be at least 8 characters"
        is FirebaseNetworkException -> "No internet connection"
        // Messages written by our Cloud Functions are meant for the user (e.g. plan limit reached).
        is FirebaseFunctionsException ->
            if (e.code == FirebaseFunctionsException.Code.UNAVAILABLE) "No internet connection"
            else e.message ?: "Something went wrong"
        is FirebaseFirestoreException ->
            if (e.code == FirebaseFirestoreException.Code.PERMISSION_DENIED)
                "Not allowed. Your plan may not include this feature, or the institute is suspended."
            else e.message ?: "Something went wrong"
        else -> e.message ?: "Something went wrong"
    }

    // ---------- live queries ----------

    private inline fun <reified T : HasId> Query.models(): Flow<List<T>> = callbackFlow {
        val reg = addSnapshotListener { snap, err ->
            if (err != null) {
                // PERMISSION_DENIED here means the plan/feature was switched off or the institute was suspended;
                // the institute listener handles those states, so do not pop a scary dialog.
                val denied = err is FirebaseFirestoreException && err.code == FirebaseFirestoreException.Code.PERMISSION_DENIED
                if (!denied) onError(friendly(err))
                return@addSnapshotListener
            }
            if (snap != null) {
                trySend(snap.documents.mapNotNull { d -> d.toObject(T::class.java)?.also { m -> m.id = d.id } })
            }
        }
        awaitClose { reg.remove() }
    }

    // ---------- scoped queries (students / teachers may only read what is theirs; see firestore.rules) ----------

    /** Like models(), but emits an empty list on an error, so several of these can be merged without one stalling the rest. */
    private inline fun <reified T : HasId> Query.modelsOrEmpty(): Flow<List<T>> = callbackFlow {
        val reg = addSnapshotListener { snap, err ->
            if (err != null) {
                val denied = err is FirebaseFirestoreException && err.code == FirebaseFirestoreException.Code.PERMISSION_DENIED
                if (!denied) onError(friendly(err))
                trySend(emptyList())
                return@addSnapshotListener
            }
            if (snap != null) {
                trySend(snap.documents.mapNotNull { d -> d.toObject(T::class.java)?.also { m -> m.id = d.id } })
            }
        }
        awaitClose { reg.remove() }
    }

    /** One document as a 0-or-1 element list (missing or not readable = empty). */
    private inline fun <reified T : HasId> docFlow(col: String, id: String): Flow<List<T>> = callbackFlow {
        val reg = coll(col).document(id).addSnapshotListener { s, e ->
            if (e != null || s == null || !s.exists()) trySend(emptyList())
            else trySend(listOfNotNull(s.toObject(T::class.java)?.also { m -> m.id = s.id }))
        }
        awaitClose { reg.remove() }
    }

    /** All lists joined into one; emits once every part has answered. */
    private fun <T> merged(flows: List<Flow<List<T>>>): Flow<List<T>> {
        if (flows.isEmpty()) return flowOf(emptyList())
        return channelFlow {
            val latest = MutableList<List<T>?>(flows.size) { null }
            flows.forEachIndexed { i, f ->
                launch {
                    f.collect { part ->
                        latest[i] = part
                        if (latest.all { it != null }) send(latest.flatMap { it.orEmpty() })
                    }
                }
            }
        }
    }

    private fun clean(ids: List<String>) = ids.filter { it.isNotBlank() }.distinct().take(20)

    fun batchesByIds(ids: List<String>): Flow<List<Batch>> = merged(clean(ids).map { docFlow<Batch>("batches", it) })

    fun leaderboardsByIds(ids: List<String>): Flow<List<Leaderboard>> =
        merged(clean(ids).map { docFlow<Leaderboard>("leaderboards", it) })

    fun classesOfBatches(ids: List<String>, fromDate: String): Flow<List<ClassSession>> = merged(
        clean(ids).map { coll("classes").whereEqualTo("batchId", it).whereGreaterThanOrEqualTo("date", fromDate).modelsOrEmpty<ClassSession>() }
    )

    /** Notices for everyone ("" batch) plus those of the given batches, newest first. */
    fun noticesFor(ids: List<String>): Flow<List<Notice>> = merged(
        (listOf("") + clean(ids)).map {
            coll("notices").whereEqualTo("batchId", it).orderBy("createdAt", Query.Direction.DESCENDING).limit(50).modelsOrEmpty<Notice>()
        }
    ).map { l -> l.sortedByDescending { it.createdAt } }

    fun homeworkOfBatches(ids: List<String>): Flow<List<Homework>> = merged(
        clean(ids).map {
            coll("homework").whereEqualTo("batchId", it).orderBy("createdAt", Query.Direction.DESCENDING).limit(100).modelsOrEmpty<Homework>()
        }
    ).map { l -> l.sortedByDescending { it.createdAt } }

    fun materialsOfBatches(ids: List<String>): Flow<List<StudyMaterial>> = merged(
        clean(ids).map {
            coll("materials").whereEqualTo("batchId", it).orderBy("createdAt", Query.Direction.DESCENDING).limit(100).modelsOrEmpty<StudyMaterial>()
        }
    ).map { l -> l.sortedByDescending { it.createdAt } }

    fun examsOfBatches(ids: List<String>): Flow<List<Exam>> = merged(
        clean(ids).map {
            coll("exams").whereEqualTo("batchId", it).orderBy("date", Query.Direction.DESCENDING).limit(100).modelsOrEmpty<Exam>()
        }
    ).map { l -> l.sortedByDescending { it.date } }

    /** Teachers may read student profiles only. */
    fun students(): Flow<List<UserProfile>> = coll("users").whereEqualTo("role", Role.STUDENT).models()

    /** Who created / changed / deleted money records (admin only; written by Cloud Functions). */
    fun activity(): Flow<List<ActivityEntry>> =
        coll("activity").orderBy("at", Query.Direction.DESCENDING).limit(200).models()

    fun profile(uid: String): Flow<UserProfile?> = callbackFlow {
        val reg = coll("users").document(uid).addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null && s.exists()) {
                trySend(s.toObject(UserProfile::class.java)?.also { it.id = s.id })
            }
        }
        awaitClose { reg.remove() }
    }

    fun users(): Flow<List<UserProfile>> = coll("users").models()
    fun batches(): Flow<List<Batch>> = coll("batches").models()
    fun classes(fromDate: String): Flow<List<ClassSession>> =
        coll("classes").whereGreaterThanOrEqualTo("date", fromDate).models()

    fun classesBetween(from: String, to: String): Flow<List<ClassSession>> =
        coll("classes").whereGreaterThanOrEqualTo("date", from)
            .whereLessThanOrEqualTo("date", to).models()

    fun exams(): Flow<List<Exam>> =
        coll("exams").orderBy("date", Query.Direction.DESCENDING).limit(300).models()

    fun notices(): Flow<List<Notice>> =
        coll("notices").orderBy("createdAt", Query.Direction.DESCENDING).limit(100).models()

    fun homework(): Flow<List<Homework>> =
        coll("homework").orderBy("createdAt", Query.Direction.DESCENDING).limit(200).models()

    fun attendanceByClass(classId: String): Flow<List<Attendance>> =
        coll("attendance").whereEqualTo("classId", classId).models()

    fun attendanceByStudent(studentId: String): Flow<List<Attendance>> =
        coll("attendance").whereEqualTo("studentId", studentId).models()

    fun marksByExam(examId: String): Flow<List<Mark>> =
        coll("marks").whereEqualTo("examId", examId).models()

    fun marksByStudent(studentId: String): Flow<List<Mark>> =
        coll("marks").whereEqualTo("studentId", studentId).models()

    fun feesByMonth(month: String): Flow<List<Fee>> =
        coll("fees").whereEqualTo("month", month).models()

    fun feesByStudent(studentId: String): Flow<List<Fee>> =
        coll("fees").whereEqualTo("studentId", studentId).models()

    /** Admin-edited message texts (settings/messages). Errors are ignored: the built-in texts are used instead. */
    fun messageTemplates(): Flow<Map<String, String>> = callbackFlow {
        val reg = coll("settings").document("messages").addSnapshotListener { s, e ->
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
        coll("settings").document("messages").set(m).await()
    }

    fun ledgerRange(from: String, to: String): Flow<List<LedgerEntry>> =
        coll("ledger").whereGreaterThanOrEqualTo("date", from).whereLessThanOrEqualTo("date", to).models()

    fun feesByDate(from: String, to: String): Flow<List<Fee>> =
        coll("fees").whereGreaterThanOrEqualTo("date", from).whereLessThanOrEqualTo("date", to).models()

    fun salaryPaidByMonth(month: String): Flow<List<SalaryPaid>> =
        coll("salaryPaid").whereEqualTo("month", month).models()

    fun salaryPaidByTeacher(uid: String): Flow<List<SalaryPaid>> =
        coll("salaryPaid").whereEqualTo("teacherId", uid).models()

    fun materials(): Flow<List<StudyMaterial>> =
        coll("materials").orderBy("createdAt", Query.Direction.DESCENDING).limit(300).models()

    fun doubtsAll(): Flow<List<Doubt>> =
        coll("doubts").orderBy("createdAt", Query.Direction.DESCENDING).limit(300).models()

    fun doubtsOfStudent(uid: String): Flow<List<Doubt>> =
        coll("doubts").whereEqualTo("studentId", uid).models()

    fun leavesOfTeacher(uid: String): Flow<List<LeaveRequest>> =
        coll("leaves").whereEqualTo("teacherId", uid).models()

    fun leavesAll(): Flow<List<LeaveRequest>> =
        coll("leaves").orderBy("createdAt", Query.Direction.DESCENDING).limit(300).models()

    /** Subject list edited by the admin (settings/subjects). Empty when never edited. */
    fun subjectSettings(): Flow<List<String>> = callbackFlow {
        val reg = coll("settings").document("subjects").addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null && s.exists()) {
                @Suppress("UNCHECKED_CAST")
                val l = (s.get("list") as? List<Any?>)?.mapNotNull { it as? String }.orEmpty()
                trySend(l)
            }
        }
        awaitClose { reg.remove() }
    }

    suspend fun saveSubjects(list: List<String>) {
        coll("settings").document("subjects").set(mapOf("list" to list)).await()
    }

    fun leaderboards(): Flow<List<Leaderboard>> = coll("leaderboards").models()

    // ---------- one-time reads ----------

    private suspend inline fun <reified T : HasId> Query.once(): List<T> =
        get().await().documents.mapNotNull { d -> d.toObject(T::class.java)?.also { m -> m.id = d.id } }

    suspend fun leavesOnceOf(uid: String): List<LeaveRequest> = coll("leaves").whereEqualTo("teacherId", uid).once()
    suspend fun leavesPending(): List<LeaveRequest> = coll("leaves").whereEqualTo("status", "pending").once()
    suspend fun materialsSince(ms: Long): List<StudyMaterial> = coll("materials").whereGreaterThan("createdAt", ms).once()
    suspend fun doubtsSince(ms: Long): List<Doubt> = coll("doubts").whereGreaterThan("createdAt", ms).once()
    suspend fun doubtsOnceOf(studentId: String): List<Doubt> = coll("doubts").whereEqualTo("studentId", studentId).once()

    /** Small photos (bills, doubts) are kept as compressed text in their own documents. */
    suspend fun getPhoto(col: String, id: String): String? = coll(col).document(id).get().await().getString("data")

    suspend fun putPhoto(col: String, id: String, data: String) {
        coll(col).document(id).set(mapOf("data" to data)).await()
    }

    suspend fun batchesOnce(): List<Batch> = coll("batches").once()
    suspend fun noticesSince(ms: Long): List<Notice> = coll("notices").whereGreaterThan("createdAt", ms).once()
    suspend fun homeworkSince(ms: Long): List<Homework> = coll("homework").whereGreaterThan("createdAt", ms).once()
    suspend fun classesRange(from: String, to: String): List<ClassSession> =
        coll("classes").whereGreaterThanOrEqualTo("date", from).whereLessThanOrEqualTo("date", to).once()

    suspend fun classesByStatus(status: String): List<ClassSession> =
        coll("classes").whereEqualTo("status", status).once()

    suspend fun attendanceOf(studentId: String): List<Attendance> =
        coll("attendance").whereEqualTo("studentId", studentId).once()

    suspend fun marksOf(studentId: String): List<Mark> = coll("marks").whereEqualTo("studentId", studentId).once()
    suspend fun marksOfBatch(batchId: String): List<Mark> = coll("marks").whereEqualTo("batchId", batchId).once()
    suspend fun feesOf(studentId: String): List<Fee> = coll("fees").whereEqualTo("studentId", studentId).once()

    /** Every document of a collection as plain maps (used by the backup). */
    suspend fun dump(col: String): List<Map<String, Any?>> =
        coll(col).get().await().documents.map { d -> (d.data ?: emptyMap()) + ("id" to d.id) }

    /** Recomputes the ranking of a batch from all saved exam marks. */
    suspend fun rebuildLeaderboard(batchId: String, batchName: String) {
        val marks = marksOfBatch(batchId).filter { !it.absent && it.maxMarks > 0 }
        val entries = marks.groupBy { it.studentId }.map { (sid, ms) ->
            // one percentage per exam (all its papers together), then the average over exams
            val perExam = ms.groupBy { it.examId }.values.map { g ->
                g.sumOf { it.marks } * 100.0 / g.sumOf { it.maxMarks.toDouble() }
            }
            LbEntry(sid, ms.first().studentName, perExam.average(), perExam.size)
        }.sortedByDescending { it.pct }.take(100)
        put("leaderboards", Leaderboard(batchId, batchName, entries, System.currentTimeMillis()))
    }

    // ---------- writes ----------

    suspend fun <T : HasId> put(col: String, item: T): T {
        if (item.id.isBlank()) item.id = coll(col).document().id
        coll(col).document(item.id).set(item).await()
        return item
    }

    suspend fun putAll(col: String, items: List<HasId>) {
        for (chunk in items.chunked(400)) {
            val wb = db.batch()
            for (item in chunk) wb.set(coll(col).document(item.id), item)
            wb.commit().await()
        }
    }

    suspend fun update(col: String, id: String, fields: Map<String, Any?>) {
        coll(col).document(id).update(fields).await()
    }

    /** Ids of all mark documents of an exam (used when an exam is deleted). */
    suspend fun marksOnce(examId: String): List<String> =
        coll("marks").whereEqualTo("examId", examId).get().await().documents.map { it.id }

    /** Ids of documents whose id starts with [prefix]. */
    suspend fun idsWithPrefix(col: String, prefix: String): List<String> =
        coll(col)
            .whereGreaterThanOrEqualTo(com.google.firebase.firestore.FieldPath.documentId(), prefix)
            .whereLessThan(com.google.firebase.firestore.FieldPath.documentId(), prefix + "\uf8ff")
            .get().await().documents.map { it.id }

    suspend fun deleteAll(col: String, ids: List<String>) {
        for (chunk in ids.chunked(400)) {
            val wb = db.batch()
            for (id in chunk) wb.delete(coll(col).document(id))
            wb.commit().await()
        }
    }

    suspend fun delete(col: String, id: String) {
        coll(col).document(id).delete().await()
    }

    // ---------- institute ----------

    fun institute(): Flow<Institute?> = callbackFlow {
        val reg = db.collection("institutes").document(instituteId).addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null && s.exists()) trySend(s.toObject(Institute::class.java)?.also { it.id = s.id })
        }
        awaitClose { reg.remove() }
    }

    // ---------- accounts & sessions ----------

    sealed class Session {
        data class Ready(val me: UserProfile, val institute: Institute) : Session()
        /** Signed in with Google / e-mail link but no institute yet: show "Register your institute". */
        data object NeedsRegistration : Session()
        data object SignedOut : Session()
    }

    /** Calls a Cloud Function and returns its result map. Errors carry a user-readable message. */
    suspend fun call(name: String, data: Map<String, Any?> = emptyMap()): Map<String, Any?> {
        val res = functions.getHttpsCallable(name).call(data).await().getData()
        @Suppress("UNCHECKED_CAST")
        return (res as? Map<String, Any?>) ?: emptyMap()
    }

    /** Staff / students: institute code + username + password. The password goes only to Firebase Auth. */
    suspend fun signInWithPassword(code: String, username: String, password: String): Session {
        auth.signInWithEmailAndPassword(loginEmail(code, username), password).await()
        return openSession()
    }

    suspend fun signInWithGoogle(idToken: String): Session {
        auth.signInWithCredential(GoogleAuthProvider.getCredential(idToken, null)).await()
        return openSession()
    }

    fun sendEmailLink(email: String) = run {
        val settings = ActionCodeSettings.newBuilder()
            .setUrl("https://" + AppConfig.AUTH_LINK_DOMAIN + "/finishSignIn")
            .setHandleCodeInApp(true)
            .setAndroidPackageName(auth.app.applicationContext.packageName, true, null)
            .build()
        auth.sendSignInLinkToEmail(email.trim(), settings)
    }

    fun isEmailLink(link: String) = auth.isSignInWithEmailLink(link)

    suspend fun signInWithEmailLink(email: String, link: String): Session {
        auth.signInWithEmailLink(email.trim(), link).await()
        return openSession()
    }

    /** Loads claims + institute + profile for the signed-in user and checks that they may enter. */
    suspend fun openSession(): Session {
        val user = auth.currentUser ?: return Session.SignedOut
        // Force-refresh so claims set by a Cloud Function (register / plan changes) are current.
        val claims = user.getIdToken(true).await().claims
        val inst = claims["inst"] as? String
        if (inst.isNullOrEmpty()) {
            // A staff/student login always has an institute claim; only Google / e-mail-link owners reach this.
            if (user.email?.endsWith("." + AppConfig.LOGIN_DOMAIN) == true) {
                auth.signOut()
                error("This account is not set up. Please contact your institute.")
            }
            return Session.NeedsRegistration
        }
        instituteId = inst
        val institute = db.collection("institutes").document(inst).get().await()
            .toObject(Institute::class.java)?.also { it.id = inst }
            ?: run { auth.signOut(); error("Institute not found") }
        val problem = institute.blockedReason()
        if (problem != null) {
            auth.signOut()
            error(problem)
        }
        val me = loadProfile(user.uid)
        if (me == null) {
            auth.signOut()
            error("This account is not set up. Please contact your institute.")
        }
        if (!me.active) {
            auth.signOut()
            error("This account has been deactivated.")
        }
        if (me.role == Role.STUDENT && !institute.has(Feature.STUDENT_LOGIN)) {
            auth.signOut()
            error(STUDENT_LOGIN_OFF)
        }
        return Session.Ready(me, institute)
    }

    suspend fun loadProfile(uid: String): UserProfile? {
        val ref = coll("users").document(uid)
        val snap = try {
            ref.get().await()
        } catch (e: Exception) {
            ref.get(Source.CACHE).await()
        }
        return snap.toObject(UserProfile::class.java)?.also { it.id = uid }
    }

    suspend fun registerInstitute(name: String, code: String): Session {
        call("registerInstitute", mapOf("name" to name.trim(), "code" to code.trim().lowercase()))
        return openSession()
    }

    const val STUDENT_LOGIN_OFF = "Student login is not part of your institute's plan. Please contact your institute."

    /** Admin: give a teacher sub-admin rights as well (enable + perms), change them, or take them away. */
    suspend fun setTeacherAdmin(uid: String, enable: Boolean, perms: List<String>) {
        call("setTeacherAdmin", mapOf("uid" to uid, "enable" to enable, "perms" to perms))
    }

    // ---------- classes / groups / sections ----------

    fun structure(): Flow<Structure> = callbackFlow {
        val reg = coll("settings").document("structure").addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null) trySend(if (s.exists()) s.toObject(Structure::class.java) ?: Structure() else Structure())
        }
        awaitClose { reg.remove() }
    }

    suspend fun saveStructure(st: Structure) {
        coll("settings").document("structure").set(st.copy(customized = true)).await()
    }

    /** Renames a class / group / section everywhere it is used (students and batches). field = standard | group | section. */
    suspend fun renameValue(field: String, old: String, new: String) {
        for (col in listOf("users", "batches")) {
            val ids = coll(col).whereEqualTo(field, old).get().await().documents.map { it.id }
            for (chunk in ids.chunked(400)) {
                val wb = db.batch()
                for (id in chunk) wb.update(coll(col).document(id), field, new)
                wb.commit().await()
            }
        }
    }

    // ---------- fee settings ----------

    fun feeSettings(): Flow<FeeSettings> = callbackFlow {
        val reg = coll("settings").document("fees").addSnapshotListener { s, e ->
            if (e != null) return@addSnapshotListener
            if (s != null) trySend(if (s.exists()) s.toObject(FeeSettings::class.java) ?: FeeSettings() else FeeSettings())
        }
        awaitClose { reg.remove() }
    }

    suspend fun saveFeeSettings(f: FeeSettings) {
        coll("settings").document("fees").set(f).await()
    }

    // ---------- push (FCM) ----------

    /** Saves this phone's FCM token under institutes/{id}/devices so Cloud Functions can notify this user. */
    suspend fun registerDevice(token: String? = null) {
        val user = auth.currentUser ?: return
        if (instituteId.isEmpty()) return
        val t = token ?: FirebaseMessaging.getInstance().token.await()
        val role = loadProfile(user.uid)?.role.orEmpty()
        coll("devices").document(t).set(
            mapOf("uid" to user.uid, "role" to role, "platform" to "android", "updatedAt" to System.currentTimeMillis())
        ).await()
    }

    /** Stops pushes for this user on this phone (called on log out, before signing out). */
    suspend fun unregisterDevice() {
        if (auth.currentUser == null || instituteId.isEmpty()) return
        try {
            // Offline writes never complete, so do not wait forever before signing out.
            kotlinx.coroutines.withTimeoutOrNull(3000) {
                val t = FirebaseMessaging.getInstance().token.await()
                coll("devices").document(t).delete().await()
            }
        } catch (e: Exception) {
            // Offline: the token stays until the next user registers or FCM reports it dead.
        }
    }

    /** True when the signed-in user has an e-mail/password login (staff, students) rather than Google / e-mail link. */
    fun hasPassword(): Boolean = auth.currentUser?.providerData?.any { it.providerId == EmailAuthProvider.PROVIDER_ID } == true

    fun signOut() {
        auth.signOut()
        instituteId = ""
    }

    // ---------- account management (Cloud Functions; passwords never reach Firestore) ----------

    suspend fun createUser(fields: Map<String, Any?>): String =
        call("createUser", fields)["uid"] as? String ?: error("Could not create the account")

    /** Result of a bulk create: per-row outcome in input order. */
    data class BulkRow(val username: String, val ok: Boolean, val error: String)

    suspend fun createUsers(rows: List<Map<String, Any?>>): List<BulkRow> {
        val out = ArrayList<BulkRow>()
        for (chunk in rows.chunked(100)) {
            val r = call("createUsers", mapOf("users" to chunk))
            @Suppress("UNCHECKED_CAST")
            val results = (r["results"] as? List<Map<String, Any?>>).orEmpty()
            for (x in results) {
                out.add(BulkRow(x["username"] as? String ?: "", x["ok"] == true, x["error"] as? String ?: ""))
            }
        }
        return out
    }

    /** Sets a new password. With [password] == null the server makes a random one and returns it (shown once, never stored). */
    suspend fun resetPassword(uid: String, password: String?): String? {
        val data = HashMap<String, Any?>()
        data["uid"] = uid
        if (password != null) data["password"] = password
        return call("resetPassword", data)["password"] as? String
    }

    suspend fun setUserActive(uid: String, active: Boolean) {
        call("setUserActive", mapOf("uid" to uid, "active" to active))
    }

    suspend fun deleteUser(uid: String) {
        call("deleteUser", mapOf("uid" to uid))
    }

    /** Own password (staff / students). Re-authenticates first, then Firebase Auth stores the new hash. */
    suspend fun changeOwnPassword(current: String, newPassword: String) {
        val u = auth.currentUser ?: error("Not logged in")
        val email = u.email ?: error("Not logged in")
        u.reauthenticate(EmailAuthProvider.getCredential(email, current)).await()
        u.updatePassword(newPassword).await()
    }
}
