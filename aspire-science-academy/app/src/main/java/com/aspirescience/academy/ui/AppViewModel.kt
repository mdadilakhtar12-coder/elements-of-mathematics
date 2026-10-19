package com.aspirescience.academy.ui

import android.app.Application
import android.widget.Toast
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aspirescience.academy.data.Batch
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.ClassSession
import com.aspirescience.academy.data.Exam
import com.aspirescience.academy.data.Homework
import com.aspirescience.academy.data.Notice
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.Updater
import com.aspirescience.academy.data.UserProfile
import com.aspirescience.academy.BuildConfig
import com.aspirescience.academy.util.D
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.time.LocalDate

sealed class Screen {
    data object Main : Screen()
    data class People(val role: String) : Screen()
    data class UserEdit(val role: String, val userId: String = "") : Screen()
    data class UserDetail(val userId: String) : Screen()
    data class BatchEdit(val batchId: String = "") : Screen()
    data class BatchDetail(val batchId: String) : Screen()
    data class ClassDetail(val classId: String) : Screen()
    data class ClassEdit(val classId: String = "", val batchId: String = "", val date: String = "") : Screen()
    data class ExamEdit(val examId: String = "") : Screen()
    data class ExamDetail(val examId: String) : Screen()
    data class FeeAdd(val studentId: String = "", val month: String = "", val amount: Long = 0) : Screen()
    data object Approvals : Screen()
    data object TeacherReport : Screen()
    data object Notices : Screen()
    data object NoticeAdd : Screen()
    data object HomeworkList : Screen()
    data object HomeworkAdd : Screen()
    data object Leaderboard : Screen()
    data object ChangePassword : Screen()
}

class AppViewModel(app: Application) : AndroidViewModel(app) {

    var me by mutableStateOf<UserProfile?>(null)
    var booting by mutableStateOf(true)
    var busy by mutableStateOf(false)
    var loginError by mutableStateOf<String?>(null)
    var banner by mutableStateOf<String?>(null)
    var update by mutableStateOf<Updater.Info?>(null)
    var updateProgress by mutableIntStateOf(-1)

    var users by mutableStateOf<List<UserProfile>>(emptyList())
    var batches by mutableStateOf<List<Batch>>(emptyList())
    var classes by mutableStateOf<List<ClassSession>>(emptyList())
    var exams by mutableStateOf<List<Exam>>(emptyList())
    var notices by mutableStateOf<List<Notice>>(emptyList())
    var homework by mutableStateOf<List<Homework>>(emptyList())
    var leaderboards by mutableStateOf<List<com.aspirescience.academy.data.Leaderboard>>(emptyList())

    val stack = mutableStateListOf<Screen>()
    var tab by mutableIntStateOf(0)

    private var listenScope: CoroutineScope? = null

    /** Looks for a newer APK. Quiet on start-up, gives feedback when the user asks. */
    fun checkUpdate(manual: Boolean) {
        viewModelScope.launch {
            val info = Updater.check()
            if (info != null && info.build > BuildConfig.VERSION_CODE) {
                update = info
            } else if (manual) {
                toast(if (info == null) "Could not check for updates" else "You have the latest version")
            }
        }
    }

    fun startUpdate() {
        val info = update ?: return
        val ctx = getApplication<Application>()
        if (!Updater.canInstall(ctx)) {
            toast("Allow installing from this app, then tap Update again")
            return
        }
        viewModelScope.launch {
            updateProgress = 0
            try {
                val apk = Updater.download(ctx, info.url) { updateProgress = it }
                updateProgress = -1
                update = null
                Updater.install(ctx, apk)
            } catch (e: Exception) {
                updateProgress = -1
                toast("Download failed. Check your internet and try again.")
            }
        }
    }

    init {
        Repo.onError = { msg -> banner = msg }
        checkUpdate(false)
        viewModelScope.launch {
            try {
                if (Repo.ready) {
                    val u = Repo.auth.currentUser
                    if (u != null) {
                        val p = Repo.loadProfile(u.uid)
                        if (p != null && p.active) enter(p) else Repo.signOut()
                    }
                }
            } catch (e: Exception) {
                // Show the login screen.
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

    private fun enter(p: UserProfile) {
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
        scope.launch { Repo.batches().collect { batches = it.sortedBy { b -> b.name.lowercase() } } }
        scope.launch { Repo.classes(D.daysAgo(75)).collect { classes = it } }
        scope.launch { Repo.notices().collect { notices = it } }
        scope.launch { Repo.homework().collect { homework = it } }
        scope.launch { Repo.exams().collect { exams = it } }
        scope.launch { Repo.leaderboards().collect { leaderboards = it } }
        if (p.role != Role.STUDENT) {
            scope.launch { Repo.users().collect { users = it.sortedBy { u -> u.name.lowercase() } } }
        }
    }

    private fun stopListening() {
        listenScope?.cancel()
        listenScope = null
    }

    fun login(id: String, password: String) {
        if (id.isBlank() || password.isBlank()) {
            loginError = "Enter your ID and password"
            return
        }
        viewModelScope.launch {
            busy = true
            loginError = null
            try {
                enter(Repo.signIn(id, password))
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
        users = emptyList()
        batches = emptyList()
        classes = emptyList()
        exams = emptyList()
        notices = emptyList()
        homework = emptyList()
        leaderboards = emptyList()
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

    // ---------- permissions ----------

    val role: String get() = me?.role ?: Role.STUDENT
    val isStaff: Boolean get() = role == Role.ADMIN || role == Role.SUBADMIN

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

    fun saveUser(draft: UserProfile, password: String, isNew: Boolean, onDone: () -> Unit) =
        op(if (isNew) "Created" else "Saved", onDone) {
            if (isNew) {
                if (users.any { it.loginId.equals(draft.loginId, ignoreCase = true) }) {
                    error("This ID is already used")
                }
                val uid = Repo.createAuthUser(draft.loginId, password)
                draft.id = uid
                draft.createdAt = System.currentTimeMillis()
                Repo.put("users", draft)
                Repo.setPassword(uid, draft.loginId, draft.role, password)
            } else {
                Repo.put("users", draft)
            }
        }

    fun setActive(u: UserProfile, active: Boolean) = op(if (active) "Activated" else "Deactivated") {
        Repo.update("users", u.id, mapOf("active" to active))
    }

    fun setBatches(u: UserProfile, ids: List<String>) = op("Saved") {
        Repo.update("users", u.id, mapOf("batchIds" to ids))
    }

    fun resetPassword(u: UserProfile, newPassword: String) = op("Password changed") {
        Repo.resetPassword(u, newPassword)
    }

    fun deleteUser(u: UserProfile, onDone: () -> Unit) = op("Deleted", onDone) {
        Repo.deleteUser(u)
    }

    fun changeOwnPassword(current: String, newPassword: String, onDone: () -> Unit) =
        op("Password changed", onDone) {
            Repo.changeOwnPassword(me ?: error("Not logged in"), current, newPassword)
        }

    // ---------- exports ----------

    fun backup() = op("Backup ready") {
        val f = com.aspirescience.academy.util.Backup.create(getApplication())
        com.aspirescience.academy.util.Share.file(getApplication(), f, "application/zip", "Save backup")
    }

    fun reportCard(u: UserProfile) = op {
        val names = batches.filter { it.id in u.batchIds }.joinToString(", ") { it.name }
        val f = com.aspirescience.academy.util.ReportCard.create(getApplication(), u, names)
        com.aspirescience.academy.util.Share.file(getApplication(), f, "application/pdf", "Share report card")
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
