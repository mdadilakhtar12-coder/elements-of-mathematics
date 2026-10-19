package com.aspirescience.academy.notify

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.UserProfile
import com.aspirescience.academy.util.D
import java.time.LocalDate
import java.time.LocalTime

/**
 * Runs in the background about every 15-30 minutes and shows a notification for new announcements,
 * homework, tomorrow's classes, pending attendance, approvals and fee dues.
 */
class CheckWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {

    override suspend fun doWork(): Result {
        if (!Repo.ready) return Result.success()
        val uid = Repo.auth.currentUser?.uid ?: return Result.success()
        try {
            val me = Repo.loadProfile(uid)
            if (me != null && me.active) check(me)
        } catch (e: Exception) {
            // Try again at the next run.
        }
        return Result.success()
    }

    private suspend fun check(me: UserProfile) {
        val ctx = applicationContext
        val prefs = ctx.getSharedPreferences("aspire_notify", Context.MODE_PRIVATE)
        val now = System.currentTimeMillis()
        val last = prefs.getLong("last", 0L)
        val today = D.today()
        val hour = LocalTime.now().hour
        Notifier.ensureChannel(ctx)

        fun firstToday(key: String): Boolean {
            if (prefs.getString(key, "") == today) return false
            prefs.edit().putString(key, today).apply()
            return true
        }

        val myBatchIds: Set<String> = when (me.role) {
            Role.STUDENT -> me.batchIds.toSet()
            Role.TEACHER -> Repo.batchesOnce().filter { it.teacherId == me.id }.map { it.id }.toSet()
            else -> emptySet()
        }
        val staff = me.role == Role.ADMIN || me.role == Role.SUBADMIN

        // New announcements and homework since the last check
        if (last > 0L) {
            for (n in Repo.noticesSince(last)) {
                if (n.createdByName == me.name) continue
                if (staff || n.batchId.isEmpty() || n.batchId in myBatchIds) {
                    Notifier.show(ctx, n.id.hashCode(), "Announcement: " + n.title, n.body)
                }
            }
            if (me.role != Role.ADMIN && me.role != Role.SUBADMIN) {
                for (h in Repo.homeworkSince(last)) {
                    if (h.createdBy == me.id || h.batchId !in myBatchIds) continue
                    Notifier.show(ctx, h.id.hashCode(), "New homework: " + h.title, h.batchName)
                }
            }
        }
        prefs.edit().putLong("last", now).apply()

        val tomorrow = LocalDate.now().plusDays(1).toString()
        when (me.role) {
            Role.STUDENT, Role.TEACHER -> {
                if (hour >= 17 && firstToday("tomorrow")) {
                    val list = Repo.classesRange(tomorrow, tomorrow).filter {
                        it.status != CS.CANCELLED &&
                            (if (me.role == Role.STUDENT) it.batchId in myBatchIds else it.teacherId == me.id)
                    }.sortedBy { it.start }
                    if (list.isNotEmpty()) {
                        Notifier.show(
                            ctx, 1001, "Classes tomorrow",
                            list.joinToString("\n") { D.time12(it.start) + "  " + it.batchName }
                        )
                    }
                }
            }
            else -> {}
        }

        if (me.role == Role.STUDENT) {
            val day = LocalDate.now().dayOfMonth
            if (me.monthlyFee > 0 && day >= AppConfig.FEE_DUE_DAY - 3 && hour >= 10 && firstToday("fee")) {
                val month = D.thisMonth()
                val paid = Repo.feesOf(me.id).filter { it.month == month }.sumOf { it.amount }
                if (paid < me.monthlyFee) {
                    Notifier.show(ctx, 1002, "Fees due", D.monthLabel(month) + " fees: " + D.rs(me.monthlyFee - paid) + " pending")
                }
            }
        }

        if (me.role == Role.TEACHER && hour >= 19 && firstToday("attendance")) {
            val due = Repo.classesRange(D.daysAgo(7), today).filter {
                it.teacherId == me.id && (it.status == CS.SCHEDULED || it.status == CS.REJECTED)
            }
            if (due.isNotEmpty()) {
                Notifier.show(ctx, 1003, "Attendance pending", "You have " + due.size + " class(es) without attendance.")
            }
        }

        if (staff) {
            val pending = Repo.classesByStatus(CS.TAKEN).size
            if (pending > prefs.getInt("pending", 0)) {
                Notifier.show(ctx, 1004, "Classes waiting for approval", "$pending class(es) need your approval.")
            }
            prefs.edit().putInt("pending", pending).apply()
        }
    }
}
