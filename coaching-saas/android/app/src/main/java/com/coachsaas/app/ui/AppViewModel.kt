package com.coachsaas.app.ui

import android.app.Application
import android.widget.Toast
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.coachsaas.app.data.Batch
import com.coachsaas.app.data.CS
import com.coachsaas.app.data.ClassSession
import com.coachsaas.app.data.Exam
import com.coachsaas.app.data.Homework
import com.coachsaas.app.data.Notice
import com.coachsaas.app.data.Repo
import com.coachsaas.app.data.Role
import com.coachsaas.app.data.Institute
import com.coachsaas.app.data.Feature
import com.coachsaas.app.data.UserProfile
import com.coachsaas.app.util.D
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.time.LocalDate

sealed class Screen {
    data object Main : Screen()
    data class People(val role: String) : Screen()
    data class UserEdit(val role: String, val userId: String = "", val batchId: String = "") : Screen()
    data class UserDetail(val userId: String) : Screen()
    data class BatchEdit(val batchId: String = "") : Screen()
    data class BatchDetail(val batchId: String) : Screen()
    data class ClassDetail(val classId: String) : Screen()
    data class ClassEdit(val classId: String = "", val batchId: String = "", val date: String = "") : Screen()
    data class ExamEdit(val examId: String = "") : Screen()
    data class ExamDetail(val examId: String, val studentId: String = "") : Screen()
    data class FeeAdd(val studentId: String = "", val month: String = "", val amount: Long = 0) : Screen()
    data object Approvals : Screen()
    data object TeacherReport : Screen()
    data object Notices : Screen()
    data object NoticeAdd : Screen()
    data object HomeworkList : Screen()
    data object HomeworkAdd : Screen()
    data object Leaderboard : Screen()
    data object MessageTexts : Screen()
    data object Materials : Screen()
    data object MaterialAdd : Screen()
    data object Doubts : Screen()
    data object DoubtAsk : Screen()
    data class DoubtDetail(val id: String) : Screen()
    data object Leaves : Screen()
    data object LeaveApply : Screen()
    data object LeaveRequests : Screen()
    data object SubjectsEdit : Screen()
    data object Accounts : Screen()
    data object LedgerAdd : Screen()
    data object ChangePassword : Screen()
}

class AppViewModel(app: Application) : AndroidViewModel(app) {

    var me by mutableStateOf<UserProfile?>(null)
    var booting by mutableStateOf(true)
    var busy by mutableStateOf(false)
    var loginError by mutableStateOf<String?>(null)
    var banner by mutableStateOf<String?>(null)
    var notice by mutableStateOf<String?>(null)
    var progress by mutableStateOf<String?>(null)
    var institute by mutableStateOf<Institute?>(null)
    /** Signed in with Google / e-mail link but no institute yet. */
    var needsRegistration by mutableStateOf(false)

    var users by mutableStateOf<List<UserProfile>>(emptyList())
    var batches by mutableStateOf<List<Batch>>(emptyList())
    var classes by mutableStateOf<List<ClassSession>>(emptyList())
    var exams by mutableStateOf<List<Exam>>(emptyList())
    var notices by mutableStateOf<List<Notice>>(emptyList())
    var homework by mutableStateOf<List<Homework>>(emptyList())
    var leaderboards by mutableStateOf<List<com.coachsaas.app.data.Leaderboard>>(emptyList())
    var leaves by mutableStateOf<List<com.coachsaas.app.data.LeaveRequest>>(emptyList())
    var subjects by mutableStateOf(com.coachsaas.app.AppConfig.SUBJECTS)
    var materials by mutableStateOf<List<com.coachsaas.app.data.StudyMaterial>>(emptyList())
    var doubts by mutableStateOf<List<com.coachsaas.app.data.Doubt>>(emptyList())

    val stack = mutableStateListOf<Screen>()
    var tab by mutableIntStateOf(0)

    private var listenScope: CoroutineScope? = null

    init {
        Repo.onError = { msg -> banner = msg }
        viewModelScope.launch {
            try {
                if (Repo.ready && Repo.auth.currentUser != null) applySession(Repo.openSession())
            } catch (e: Exception) {
                loginError = Repo.friendly(e)
            } finally {
                booting = false
            }
        }
    }

    // ---------- navigation ----------

    val current: Screen get() = stack.lastOrNull() ?: Screen.Main

    fun go(s: Screen) {
        stack.add(s)
    }

    fun back() {
        if (stack.size > 1) stack.removeAt(stack.lastIndex)
    }

    /** Opens a screen, replacing the current one (used after saving a new item). */
    fun replace(s: Screen) {
        if (stack.size > 1) stack.removeAt(stack.lastIndex)
        stack.add(s)
    }

    fun toast(msg: String) {
        Toast.makeText(getApplication(), msg, Toast.LENGTH_SHORT).show()
    }

    // ---------- session ----------

    private fun applySession(r: Repo.Session) {
        when (r) {
            is Repo.Session.Ready -> enter(r.me, r.institute)
            Repo.Session.NeedsRegistration -> {
                needsRegistration = true
                me = null
            }
            Repo.Session.SignedOut -> {
                needsRegistration = false
                me = null
            }
        }
    }

    private fun enter(p: UserProfile, inst: Institute) {
        needsRegistration = false
        institute = inst
        com.coachsaas.app.AppConfig.APP_NAME = inst.name
        me = p
        stack.clear()
        stack.add(Screen.Main)
        tab = 0
        startListening(p)
    }

    private fun startListening(p: UserProfile) {
        stopListening()
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
        listenScope = scope
        scope.launch {
            Repo.profile(p.id).collect { np ->
                if (np != null) {
                    if (!np.active) logout() else me = np
                }
            }
        }
        // Plan, usage and status changes made by the platform owner show up here live.
        scope.launch {
            Repo.institute().collect { ni ->
                if (ni != null) {
                    institute = ni
                    val problem = ni.blockedReason()
                    if (problem != null) {
                        logout()
                        loginError = problem
                    }
                }
            }
        }
        scope.launch { Repo.batches().collect { batches = it.sortedBy { b -> b.name.lowercase() } } }
        scope.launch { Repo.classes(D.daysAgo(75)).collect { classes = it } }
        scope.launch { Repo.notices().collect { notices = it } }
        scope.launch { Repo.homework().collect { homework = it } }
        scope.launch { Repo.subjectSettings().collect { if (it.isNotEmpty()) subjects = it } }
        scope.launch { Repo.messageTemplates().collect { com.coachsaas.app.util.Messages.overrides = it } }
        // Collections of plan features are only listened to while the plan includes them
        // (the rules would refuse them otherwise). Restarted whenever the feature set changes.
        scope.launch {
            snapshotFlow { institute?.features }.distinctUntilChanged().collectLatest { startGated(p) }
        }
        if (p.role != Role.STUDENT) {
            scope.launch { Repo.users().collect { users = it.sortedBy { u -> u.name.lowercase() } } }
        }
    }

    private var gatedScope: CoroutineScope? = null

    private fun startGated(p: UserProfile) {
        gatedScope?.cancel()
        exams = emptyList(); leaderboards = emptyList(); leaves = emptyList(); materials = emptyList(); doubts = emptyList()
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
        gatedScope = scope
        if (has(Feature.EXAMS)) {
            scope.launch { Repo.exams().collect { exams = it } }
            scope.launch { Repo.leaderboards().collect { leaderboards = it } }
        }
        if (has(Feature.LEAVES)) {
            if (p.role == Role.TEACHER) {
                scope.launch { Repo.leavesOfTeacher(p.id).collect { leaves = it } }
            } else if (p.role == Role.ADMIN || (p.role == Role.SUBADMIN && "attendance" in p.perms)) {
                scope.launch { Repo.leavesAll().collect { leaves = it } }
            }
        }
        if (has(Feature.STUDY)) scope.launch { Repo.materials().collect { materials = it } }
        if (has(Feature.DOUBTS)) {
            scope.launch {
                val flow = if (p.role == Role.STUDENT) Repo.doubtsOfStudent(p.id) else Repo.doubtsAll()
                flow.collect { doubts = it }
            }
        }
    }

    private fun stopListening() {
        gatedScope?.cancel()
        gatedScope = null
        listenScope?.cancel()
        listenScope = null
    }

    /** Staff / students: institute code + username + password. */
    fun login(code: String, username: String, password: String) {
        if (code.isBlank() || username.isBlank() || password.isBlank()) {
            loginError = "Enter institute code, username and password"
            return
        }
        authFlow { Repo.signInWithPassword(code, username, password) }
    }

    fun loginWithGoogle(idToken: String) = authFlow { Repo.signInWithGoogle(idToken) }

    fun loginWithEmailLink(email: String, link: String) = authFlow { Repo.signInWithEmailLink(email, link) }

    fun sendEmailLink(email: String, onSent: () -> Unit) {
        if (!email.contains("@")) {
            loginError = "Enter a valid e-mail"
            return
        }
        viewModelScope.launch {
            busy = true
            loginError = null
            try {
                Repo.sendEmailLink(email).await()
                onSent()
            } catch (e: Exception) {
                loginError = Repo.friendly(e)
            } finally {
                busy = false
            }
        }
    }

    fun registerInstitute(name: String, code: String) {
        if (name.isBlank() || code.isBlank()) {
            loginError = "Enter the institute name and a code"
            return
        }
        authFlow { Repo.registerInstitute(name, code) }
    }

    private fun authFlow(block: suspend () -> Repo.Session) {
        viewModelScope.launch {
            busy = true
            loginError = null
            try {
                applySession(block())
            } catch (e: Exception) {
                loginError = Repo.friendly(e)
            } finally {
                busy = false
            }
        }
    }

    fun logout() {
        stopListening()
        Repo.signOut()
        me = null
        institute = null
        needsRegistration = false
        users = emptyList()
        batches = emptyList()
        classes = emptyList()
        exams = emptyList()
        notices = emptyList()
        homework = emptyList()
        leaderboards = emptyList()
        leaves = emptyList()
        materials = emptyList()
        doubts = emptyList()
        banner = null
        stack.clear()
    }

    /** Runs a write operation with a busy flag; shows a toast on success or failure. */
    fun op(success: String? = null, onDone: () -> Unit = {}, block: suspend () -> Unit) {
        viewModelScope.launch {
            busy = true
            try {
                block()
                if (success != null) toast(success)
                onDone()
            } catch (e: Exception) {
                toast(Repo.friendly(e))
            } finally {
                busy = false
            }
        }
    }

    /** Subjects offered in every drop-down (edited by the admin). */
    val subjectList: List<String> get() = subjects

    fun saveSubjects(list: List<String>, onDone: () -> Unit) = op("Subjects saved", onDone) {
        Repo.saveSubjects(list)
        subjects = list
    }

    // ---------- permissions ----------

    val role: String get() = me?.role ?: Role.STUDENT
    val isStaff: Boolean get() = role == Role.ADMIN || role == Role.SUBADMIN

    /** Is this feature part of the institute's plan? (The server enforces it too; this only hides/locks the UI.) */
    fun has(feature: String): Boolean = institute?.has(feature) ?: false

    fun can(perm: String): Boolean {
        val u = me ?: return false
        return u.role == Role.ADMIN || (u.role == Role.SUBADMIN && perm in u.perms)
    }

    // ---------- lookups ----------

    val students: List<UserProfile> get() = users.filter { it.role == Role.STUDENT }
    val teachers: List<UserProfile> get() = users.filter { it.role == Role.TEACHER }
    val subAdmins: List<UserProfile> get() = users.filter { it.role == Role.SUBADMIN }

    fun user(id: String): UserProfile? = users.firstOrNull { it.id == id }
    fun batch(id: String): Batch? = batches.firstOrNull { it.id == id }
    fun cls(id: String): ClassSession? = classes.firstOrNull { it.id == id }
    fun exam(id: String): Exam? = exams.firstOrNull { it.id == id }

    fun studentsOf(batchId: String): List<UserProfile> =
        students.filter { it.active && batchId in it.batchIds }
            .sortedWith(compareBy({ it.rollNo.toIntOrNull() ?: Int.MAX_VALUE }, { it.name.lowercase() }))

    /** Batches the current user works with: all for staff, own for teachers/students. */
    val myBatches: List<Batch>
        get() {
            val u = me ?: return emptyList()
            return when (u.role) {
                Role.TEACHER -> batches.filter { it.hasTeacher(u.id) }
                Role.STUDENT -> batches.filter { it.id in u.batchIds }
                else -> batches
            }
        }

    /** Classes the current user should see on schedules. */
    fun visibleClasses(): List<ClassSession> {
        val u = me ?: return emptyList()
        return when (u.role) {
            Role.TEACHER -> classes.filter { it.teacherId == u.id }
            Role.STUDENT -> classes.filter { it.batchId in u.batchIds }
            else -> classes
        }
    }

    val pendingApprovals: List<ClassSession> get() = classes.filter { it.status == CS.TAKEN }

    // ---------- people ----------

    /**
     * New accounts are created by the server (login + limits check); existing ones are edited directly.
     * [password] is sent to the Cloud Function once and never stored by us.
     */
    fun saveUser(draft: UserProfile, password: String, isNew: Boolean, onDone: () -> Unit) =
        op(if (isNew) "Created" else "Saved", onDone) {
            if (isNew) {
                Repo.createUser(newAccountFields(draft, password))
            } else {
                Repo.put("users", draft)
            }
        }

    private fun newAccountFields(d: UserProfile, password: String): Map<String, Any?> = mapOf(
        "role" to d.role, "name" to d.name, "username" to d.loginId, "password" to password, "mobile" to d.mobile,
        "perms" to d.perms, "batchIds" to d.batchIds, "rollNo" to d.rollNo, "standard" to d.standard,
        "parentMobile" to d.parentMobile, "monthlyFee" to d.monthlyFee, "subjects" to d.subjects,
        "classRate" to d.classRate, "salary" to d.salary, "teacherType" to d.teacherType
    )

    fun setActive(u: UserProfile, active: Boolean) = op(if (active) "Activated" else "Deactivated") {
        Repo.setUserActive(u.id, active)
    }

    fun setBatches(u: UserProfile, ids: List<String>) = op("Saved") {
        Repo.update("users", u.id, mapOf("batchIds" to ids))
    }

    /** [newPassword] == null: the server generates one; it is passed to [onDone] (show it once, then forget it). */
    fun resetPassword(u: UserProfile, newPassword: String?, onDone: (String?) -> Unit = {}) {
        var shown: String? = null
        op("Password changed", { onDone(shown) }) { shown = Repo.resetPassword(u.id, newPassword) }
    }

    fun deleteUser(u: UserProfile, onDone: () -> Unit) = op("Deleted", onDone) {
        Repo.deleteUser(u.id)
    }

    fun changeOwnPassword(current: String, newPassword: String, onDone: () -> Unit) =
        op("Password changed", onDone) {
            Repo.changeOwnPassword(current, newPassword)
        }

    // ---------- bulk student import ----------

    /** Creates students from spreadsheet rows (Name, Mobile, Password, Roll No, Parent Mobile, Fee, Standard). */
    suspend fun importStudents(rows: List<List<String>>, batchId: String) {
        if (rows.isEmpty()) error("The file is empty")
        val header = rows[0].map { it.lowercase() }
        fun idx(vararg keys: String) = header.indexOfFirst { h -> keys.any { h.contains(it) } }
        var cName = idx("name")
        var cMobile = idx("mobile", "phone", "contact", "login")
        val cPass = idx("pass")
        val cRoll = idx("roll")
        val cParent = idx("parent")
        val cFee = idx("fee")
        val cStd = idx("standard", "class")
        val hasHeader = cName >= 0 || cMobile >= 0
        val data: List<List<String>>
        if (hasHeader) {
            data = rows.drop(1)
        } else {
            data = rows
            cName = 0
            cMobile = 1
        }
        val batch = batch(batchId)
        var linked = 0
        var skipped = 0
        val failed = ArrayList<String>()
        val seen = HashSet<String>()
        val toCreate = ArrayList<Map<String, Any?>>()
        val generated = LinkedHashMap<String, String>() // username -> password we made up (shown once to the admin)
        var n = if (hasHeader) 1 else 0
        for (r in data) {
            n++
            fun cell(i: Int) = if (i >= 0) r.getOrNull(i).orEmpty().trim() else ""
            val name = cell(cName)
            var mobile = cell(cMobile).removeSuffix(".0").filter { it.isDigit() }
            if (mobile.length > 10) mobile = mobile.takeLast(10)
            if (name.isEmpty() && mobile.isEmpty()) continue
            if (name.isEmpty() || mobile.length < 5) {
                failed.add("Row $n: name or mobile missing")
                continue
            }
            if (!seen.add(mobile)) {
                skipped++
                continue
            }
            val existing = users.firstOrNull { it.loginId.equals(mobile, ignoreCase = true) }
            if (existing != null) {
                if (existing.role != Role.STUDENT) {
                    failed.add("Row $n ($name): this username belongs to a " + Role.label(existing.role))
                } else if (batchId.isNotBlank() && batchId !in existing.batchIds) {
                    try {
                        Repo.update("users", existing.id, mapOf("batchIds" to existing.batchIds + batchId))
                        linked++
                    } catch (e: Exception) {
                        failed.add("Row $n ($name): " + Repo.friendly(e))
                    }
                } else {
                    skipped++
                }
                continue
            }
            var pw = cell(cPass)
            if (pw.isNotEmpty() && pw.length < 8) {
                failed.add("Row $n ($name): password needs at least 8 characters")
                continue
            }
            if (pw.isEmpty()) {
                pw = com.coachsaas.app.util.Passwords.random()
                generated[mobile] = pw
            }
            toCreate.add(
                mapOf(
                    "role" to Role.STUDENT, "name" to name, "username" to mobile, "password" to pw, "mobile" to mobile,
                    "rollNo" to cell(cRoll).removeSuffix(".0"),
                    "standard" to cell(cStd).ifBlank { batch?.standard.orEmpty() },
                    "parentMobile" to cell(cParent).removeSuffix(".0").filter { it.isDigit() },
                    "monthlyFee" to (cell(cFee).removeSuffix(".0").filter { it.isDigit() }.toLongOrNull() ?: 0L),
                    "batchIds" to (if (batchId.isBlank()) emptyList() else listOf(batchId))
                )
            )
        }
        var added = 0
        if (toCreate.isNotEmpty()) {
            try {
                for (row in Repo.createUsers(toCreate)) {
                    if (row.ok) added++ else {
                        failed.add(row.username + ": " + row.error)
                        generated.remove(row.username)
                    }
                }
            } catch (e: Exception) {
                failed.add(Repo.friendly(e))
                generated.clear()
            }
        }
        notice = "New students added: $added\n" +
            (if (linked > 0) "Existing students added to this batch: $linked\n" else "") +
            (if (skipped > 0) "Already present, skipped: $skipped\n" else "") +
            (if (failed.isNotEmpty()) "Failed: " + failed.size + "\n" + failed.take(6).joinToString("\n") + "\n" else "") +
            (if (generated.isNotEmpty()) "\nPasswords made for you (note them down, they are not shown again):\n" +
                generated.entries.joinToString("\n") { it.key + "  ->  " + it.value } else "")
    }

    fun deleteClasses(ids: List<String>) = op(ids.size.toString() + " classes deleted") {
        Repo.deleteAll("classes", ids)
    }

    fun saveMessageTexts(texts: Map<String, String>, onDone: () -> Unit) = op("Message texts saved", onDone) {
        Repo.saveTemplates(texts)
        com.coachsaas.app.util.Messages.overrides = texts
    }

    // ---------- exports ----------

    fun backup() = op("Backup ready") {
        val f = com.coachsaas.app.util.Backup.create(getApplication(), institute)
        com.coachsaas.app.util.Share.file(getApplication(), f, "application/zip", "Save backup")
    }

    fun reportCard(u: UserProfile) = op {
        val names = batches.filter { it.id in u.batchIds }.joinToString(", ") { it.name }
        val f = com.coachsaas.app.util.ReportCard.create(getApplication(), u, names)
        com.coachsaas.app.util.Share.file(getApplication(), f, "application/pdf", "Share report card")
    }

    // ---------- batches & timetable ----------

    fun deleteBatch(b: Batch, onDone: () -> Unit) = op("Batch deleted", onDone) {
        Repo.delete("batches", b.id)
    }

    /** Creates the classes of a batch's weekly timetable for a date range (existing ones are kept). */
    fun generateClasses(b: Batch, from: LocalDate, to: LocalDate, onDone: (Int) -> Unit) {
        var created = 0
        op(null, { toast("$created classes added"); onDone(created) }) {
            val existing = classes.map { it.id }.toSet()
            val list = ArrayList<ClassSession>()
            var d = from
            while (!d.isAfter(to)) {
                for (plan in b.plans()) {
                    for (s in plan.weekly) {
                        if (s.day != d.dayOfWeek.value) continue
                        val id = b.id + "_" + plan.subject.filter { it.isLetterOrDigit() } + "_" + d.toString() + "_" + s.start.replace(":", "")
                        if (id in existing) continue
                        list.add(
                            ClassSession(
                                id = id, batchId = b.id, batchName = b.name, subject = plan.subject,
                                teacherId = plan.teacherId, teacherName = plan.teacherName,
                                date = d.toString(), start = s.start, end = s.end
                            )
                        )
                    }
                }
                d = d.plusDays(1)
            }
            Repo.putAll("classes", list)
            created = list.size
        }
    }
}
