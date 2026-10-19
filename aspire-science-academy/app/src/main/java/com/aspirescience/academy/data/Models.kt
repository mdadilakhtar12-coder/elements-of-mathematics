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
        FEES -> "Fees"
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
    var createdAt: Long = 0
) : HasId

data class WeeklySlot(
    var day: Int = 1, // 1 = Monday ... 7 = Sunday
    var start: String = "16:00",
    var end: String = "17:00"
)

data class Batch(
    override var id: String = "",
    var name: String = "",
    var standard: String = "",
    var subject: String = "",
    var teacherId: String = "",
    var teacherName: String = "",
    var weekly: List<WeeklySlot> = emptyList()
) : HasId

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

data class Exam(
    override var id: String = "",
    var name: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "",
    var date: String = "",
    var maxMarks: Long = 100,
    var average: Double = 0.0,
    var highest: Double = 0.0,
    var appeared: Long = 0
) : HasId

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
