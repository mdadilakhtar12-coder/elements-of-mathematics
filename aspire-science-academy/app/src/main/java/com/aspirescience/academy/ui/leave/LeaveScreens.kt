@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.leave

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.LeaveRequest
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DateField
import com.aspirescience.academy.ui.common.EmptyState
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.Segmented
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D

private fun statusColor(s: String) = when (s) {
    "approved" -> Green
    "rejected" -> Red
    else -> Orange
}

private fun statusLabel(s: String) = when (s) {
    "approved" -> "Approved"
    "rejected" -> "Rejected"
    else -> "Waiting"
}

/** Leave days of one teacher in a leave year, by status. */
private fun used(leaves: List<LeaveRequest>, teacherId: String, year: String, status: String) =
    leaves.filter { it.teacherId == teacherId && it.year == year && it.status == status }.sumOf { it.days }

@Composable
fun LeavesScreen(vm: AppViewModel) {
    val me = vm.me ?: return
    val year = D.leaveYear(D.today(), AppConfig.LEAVE_YEAR_START_MONTH)
    val mine = vm.leaves.filter { it.teacherId == me.id }.sortedByDescending { it.createdAt }
    val taken = used(mine, me.id, year, "approved")
    val waiting = used(mine, me.id, year, "pending")
    var cancel by remember { mutableStateOf<LeaveRequest?>(null) }

    Page(
        "My leaves", vm::back,
        fab = {
            if (me.permanent()) FloatingActionButton(onClick = { vm.go(Screen.LeaveApply) }) { Icon(Icons.Filled.Add, "Apply for leave") }
        }
    ) {
        Column(Modifier.fillMaxSize()) {
            if (!me.permanent()) {
                EmptyState("Leave is for permanent teachers. Guest teachers are paid per class.")
            } else {
                AppCard(Modifier.padding(16.dp, 12.dp, 16.dp, 0.dp)) {
                    Text("Leave year " + year, color = Grey, fontSize = 12.sp)
                    Text(
                        (AppConfig.LEAVE_QUOTA - taken).coerceAtLeast(0).toString() + " of " + AppConfig.LEAVE_QUOTA + " days left",
                        fontSize = 26.sp, fontWeight = FontWeight.Bold, color = if (AppConfig.LEAVE_QUOTA - taken > 0) Green else Red
                    )
                    Text("Taken " + taken + " days" + (if (waiting > 0) "  -  " + waiting + " waiting for approval" else ""), color = Grey, fontSize = 13.sp)
                }
                Box(Modifier.weight(1f)) {
                    ListColumn(mine, "No leave requests yet. Tap + to apply.") { l ->
                        AppCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(D.shortDate(l.from) + (if (l.to != l.from) " to " + D.shortDate(l.to) else ""), fontWeight = FontWeight.Bold)
                                    Text(l.days.toString() + (if (l.days == 1) " day" else " days"), color = Grey, fontSize = 13.sp)
                                }
                                Pill(statusLabel(l.status), statusColor(l.status))
                            }
                            if (l.reason.isNotBlank()) Text(l.reason, modifier = Modifier.padding(top = 6.dp), fontSize = 14.sp)
                            if (l.status != "pending" && l.decidedBy.isNotBlank()) {
                                Text(statusLabel(l.status) + " by " + l.decidedBy, color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                            }
                            if (l.status == "pending") TextButton(onClick = { cancel = l }) { Text("Cancel request", color = Red) }
                        }
                    }
                }
            }
        }
    }
    val c = cancel
    if (c != null) {
        ConfirmDialog("Cancel this request?", D.shortDate(c.from) + " to " + D.shortDate(c.to), "Cancel request",
            { vm.op("Request cancelled") { Repo.delete("leaves", c.id) } }, { cancel = null })
    }
}

@Composable
fun LeaveApplyScreen(vm: AppViewModel) {
    val me = vm.me ?: return
    var from by remember { mutableStateOf(D.today()) }
    var to by remember { mutableStateOf(D.today()) }
    var reason by remember { mutableStateOf("") }
    val year = D.leaveYear(from, AppConfig.LEAVE_YEAR_START_MONTH)
    val days = D.daysBetween(from, to)
    val taken = used(vm.leaves, me.id, year, "approved") + used(vm.leaves, me.id, year, "pending")
    val left = AppConfig.LEAVE_QUOTA - taken

    Page("Apply for leave", vm::back) {
        FormColumn {
            DateField("From", from, { from = it; if (to < it) to = it })
            DateField("To", to, { to = it })
            Text("Total: " + (if (days > 0) days else 0) + (if (days == 1) " day" else " days"), fontWeight = FontWeight.SemiBold)
            Text("Leave left in " + year + ": " + left.coerceAtLeast(0) + " of " + AppConfig.LEAVE_QUOTA, color = Grey, fontSize = 13.sp)
            if (days > left) {
                Text("This is more than your leave left. The admin will decide.", color = Red, fontSize = 13.sp)
            }
            Field("Reason (optional)", reason, { reason = it }, singleLine = false)
            PrimaryButton("Send request", onClick = {
                if (days <= 0) {
                    vm.toast("The end date must be on or after the start date")
                } else {
                    val l = LeaveRequest(
                        teacherId = me.id, teacherName = me.name, from = from, to = to, days = days, reason = reason.trim(),
                        status = "pending", year = year, createdAt = System.currentTimeMillis()
                    )
                    vm.op("Leave request sent", { vm.back() }) { Repo.put("leaves", l) }
                }
            }, busy = vm.busy)
        }
    }
}

/** Admin and sub-admin: approve or reject the leave requests of teachers. */
@Composable
fun LeaveRequestsScreen(vm: AppViewModel) {
    var seg by remember { mutableStateOf(0) }
    val me = vm.me
    val all = vm.leaves.sortedByDescending { it.createdAt }
    val waiting = all.filter { it.status == "pending" }
    val done = all.filter { it.status != "pending" }
    val list = if (seg == 0) waiting else done

    Page("Leave requests", vm::back) {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.padding(16.dp, 12.dp, 16.dp, 0.dp)) {
                Segmented(listOf("Waiting (" + waiting.size + ")", "Decided (" + done.size + ")"), seg, { seg = it })
            }
            Box(Modifier.weight(1f)) {
                ListColumn(list, if (seg == 0) "No requests waiting" else "Nothing decided yet") { l ->
                    val teacher = vm.user(l.teacherId)
                    val taken = used(vm.leaves, l.teacherId, l.year, "approved")
                    val affected = vm.classes.filter { it.teacherId == l.teacherId && it.date >= l.from && it.date <= l.to && it.status != CS.CANCELLED }
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(l.teacherName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(
                                    D.shortDate(l.from) + (if (l.to != l.from) " to " + D.shortDate(l.to) else "") + "  -  " + l.days + (if (l.days == 1) " day" else " days"),
                                    color = Indigo, fontSize = 13.sp
                                )
                            }
                            Pill(statusLabel(l.status), statusColor(l.status))
                        }
                        if (l.reason.isNotBlank()) Text(l.reason, modifier = Modifier.padding(top = 6.dp), fontSize = 14.sp)
                        Text(
                            "Leave taken this year: " + taken + " of " + AppConfig.LEAVE_QUOTA + (if (teacher != null && !teacher.permanent()) "  (guest teacher)" else ""),
                            color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp)
                        )
                        if (affected.isNotEmpty()) {
                            Text(
                                affected.size.toString() + " classes fall in these days, a substitute may be needed",
                                color = Orange, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp)
                            )
                            affected.sortedBy { it.date + it.start }.take(4).forEach {
                                Text(D.shortDate(it.date) + " " + D.time12(it.start) + "  " + it.subject + " - " + it.batchName, color = Grey, fontSize = 11.sp)
                            }
                        }
                        if (l.status == "pending") {
                            Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(onClick = {
                                    vm.op("Rejected") { Repo.put("leaves", l.copy(status = "rejected", decidedBy = me?.name.orEmpty(), decidedAt = System.currentTimeMillis())) }
                                }) { Text("Reject", color = Red) }
                                Button(onClick = {
                                    vm.op("Approved") { Repo.put("leaves", l.copy(status = "approved", decidedBy = me?.name.orEmpty(), decidedAt = System.currentTimeMillis())) }
                                }) { Text("Approve") }
                            }
                        } else if (l.decidedBy.isNotBlank()) {
                            Text(statusLabel(l.status) + " by " + l.decidedBy, color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }
            }
        }
    }
}
