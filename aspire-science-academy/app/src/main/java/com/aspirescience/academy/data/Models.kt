package com.aspirescience.academy.data

/** Every Firestore model keeps its document id here (filled in by Repo when reading). */
interface HasId {
    var id: String
}

object Role {
    const val ADMIN = "admin"
    const val SUBADMIN = "subadmin"
    const val TEACHER = "teacher"
    const val STUDENT = "student"

    fun label(r: String) = when (r) {
        ADMIN -> "Admin"
        SUBADMIN -> "Sub-admin"
        TEACHER -> "Teacher"
        else -> "Student"
    }
}

/** Permissions that can be given to a sub-admin. */
object Perm {
    const val USERS = "users"
    const val BATCHES = "batches"
    const val SCHEDULE = "schedule"
    const val ATTENDANCE = "attendance"
    const val EXAMS = "exams"
    const val FEES = "fees"
    const val NOTICES = "notices"

    val all = listOf(USERS, BATCHES, SCHEDULE, ATTENDANCE, EXAMS, FEES, NOTICES)

    fun label(p: String) = when (p) {
        USERS -> "Students & Teachers"
        BATCHES -> "Batches"
        SCHEDULE -> "Timetable"
        ATTENDANCE -> "Attendance & Approvals"
        EXAMS -> "Exams & Marks"
        FEES -> "Fees & Accounts"
        NOTICES -> "Announcements & Homework"
        else -> p
    }
}

/** Class status values. */
object CS {
    const val SCHEDULED = "scheduled"
    const val TAKEN = "taken" // teacher marked attendance, waiting for approval
    const val APPROVED = "approved"
    const val REJECTED = "rejected"
    const val CANCELLED = "cancelled"

    fun label(s: String) = when (s) {
        TAKEN -> "Waiting approval"
        APPROVED -> "Completed"
        REJECTED -> "Rejected"
        CANCELLED -> "Cancelled"
        else -> "Scheduled"
    }
}

data class UserProfile(
    override var id: String = "",
    var role: String = Role.STUDENT,
    var name: String = "",
    var loginId: String = "",
    var mobile: String = "",
    var active: Boolean = true,
    var perms: List<String> = emptyList(),
    var batchIds: List<String> = emptyList(),
    var rollNo: String = "",
    var standard: String = "",
    var parentMobile: String = "",
    var monthlyFee: Long = 0,
    var subjects: String = "",
    var classRate: Long = 0, // teacher pay per completed class (Rs)
    var salary: Long = 0, // teacher fixed monthly salary (Rs), added to the per-class pay
    var demo: Boolean = false, // created by "Demo data"
    var createdAt: Long = 0
) : HasId

data class WeeklySlot(
    var day: Int = 1, // 1 = Monday ... 7 = Sunday
    var start: String = "16:00",
    var end: String = "17:00"
)

/** One subject of a batch: who teaches it and on which weekdays. */
data class SubjectPlan(
    var subject: String = "",
    var teacherId: String = "",
    var teacherName: String = "",
    var weekly: List<WeeklySlot> = emptyList()
)

data class Batch(
    override var id: String = "",
    var name: String = "",
    var standard: String = "",
    var subjects: List<SubjectPlan> = emptyList(),
    // Old single-subject fields, only read for batches saved by the first version of the app.
    var subject: String = "",
    var teacherId: String = "",
    var teacherName: String = "",
    var weekly: List<WeeklySlot> = emptyList()
) : HasId {
    fun plans(): List<SubjectPlan> = when {
        subjects.isNotEmpty() -> subjects
        subject.isNotBlank() || weekly.isNotEmpty() -> listOf(SubjectPlan(subject, teacherId, teacherName, weekly))
        else -> emptyList()
    }

    fun hasTeacher(uid: String): Boolean = plans().any { it.teacherId == uid }
}

data class ClassSession(
    override var id: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "",
    var teacherId: String = "",
    var teacherName: String = "",
    var date: String = "",
    var start: String = "",
    var end: String = "",
    var status: String = CS.SCHEDULED,
    var topic: String = "",
    var note: String = "",
    var takenBy: String = "",
    var takenAt: Long = 0,
    var approvedBy: String = ""
) : HasId

data class Attendance(
    override var id: String = "",
    var classId: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "",
    var studentId: String = "",
    var studentName: String = "",
    var date: String = "",
    var status: String = "P" // P = present, A = absent, L = late
) : HasId

/** One paper (subject) of an exam with its own maximum marks. */
data class Paper(
    var subject: String = "",
    var maxMarks: Long = 50
)

data class Exam(
    override var id: String = "",
    var name: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "", // all paper names, for lists
    var date: String = "",
    var maxMarks: Long = 100, // total of all papers
    var average: Double = 0.0, // average total percentage of the batch
    var highest: Double = 0.0, // highest total percentage
    var appeared: Long = 0,
    var papers: List<Paper> = emptyList()
) : HasId {
    /** Papers of this exam. Exams saved by the first version have a single paper. */
    fun paperList(): List<Paper> = if (papers.isNotEmpty()) papers else listOf(Paper(subject, maxMarks))

    fun totalMax(): Long = paperList().sumOf { it.maxMarks }

    fun avgPct(): Double = if (papers.isEmpty() && maxMarks > 0) average * 100.0 / maxMarks else average
    fun highestPct(): Double = if (papers.isEmpty() && maxMarks > 0) highest * 100.0 / maxMarks else highest
}

data class Mark(
    override var id: String = "",
    var examId: String = "",
    var examName: String = "",
    var subject: String = "",
    var date: String = "",
    var maxMarks: Long = 100,
    var batchId: String = "",
    var studentId: String = "",
    var studentName: String = "",
    var marks: Double = 0.0,
    var absent: Boolean = false
) : HasId

data class Fee(
    override var id: String = "",
    var studentId: String = "",
    var studentName: String = "",
    var amount: Long = 0,
    var month: String = "", // yyyy-MM the fee is for
    var date: String = "", // yyyy-MM-dd it was received
    var mode: String = "Cash",
    var note: String = "",
    var receivedBy: String = "",
    var createdAt: Long = 0
) : HasId

data class Homework(
    override var id: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var title: String = "",
    var description: String = "",
    var dueDate: String = "",
    var link: String = "",
    var createdBy: String = "",
    var createdByName: String = "",
    var createdAt: Long = 0
) : HasId

data class Notice(
    override var id: String = "",
    var title: String = "",
    var body: String = "",
    var batchId: String = "", // empty = for everyone
    var batchName: String = "",
    var createdByName: String = "",
    var createdAt: Long = 0
) : HasId

data class LbEntry(
    var studentId: String = "",
    var name: String = "",
    var pct: Double = 0.0,
    var exams: Int = 0
)

data class Leaderboard(
    override var id: String = "", // batch id
    var batchName: String = "",
    var entries: List<LbEntry> = emptyList(),
    var updatedAt: Long = 0
) : HasId

/** One income or expense entry of the institute (student fees are counted automatically). */
data class LedgerEntry(
    override var id: String = "",
    var type: String = "expense", // "income" or "expense"
    var date: String = "",
    var month: String = "",
    var category: String = "",
    var note: String = "",
    var amount: Long = 0,
    var hasBill: Boolean = false,
    var createdBy: String = "",
    var createdAt: Long = 0
) : HasId

/** Marks that a teacher's pay for a month has been paid (id = month_teacherId). */
data class SalaryPaid(
    override var id: String = "",
    var teacherId: String = "",
    var teacherName: String = "",
    var month: String = "",
    var amount: Long = 0,
    var date: String = "",
    var mode: String = "Cash",
    var note: String = "",
    var paidBy: String = "",
    var createdAt: Long = 0
) : HasId

data class StudyMaterial(
    override var id: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "",
    var title: String = "",
    var description: String = "",
    var link: String = "",
    var type: String = "Notes",
    var createdBy: String = "",
    var createdByName: String = "",
    var createdAt: Long = 0
) : HasId

data class Doubt(
    override var id: String = "",
    var studentId: String = "",
    var studentName: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "",
    var question: String = "",
    var hasPhoto: Boolean = false,
    var answer: String = "",
    var answeredBy: String = "",
    var answeredAt: Long = 0,
    var status: String = "open", // "open" or "answered"
    var createdAt: Long = 0
) : HasId
