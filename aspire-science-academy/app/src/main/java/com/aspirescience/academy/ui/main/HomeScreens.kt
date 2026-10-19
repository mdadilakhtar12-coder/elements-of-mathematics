@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.fees.FeeDueBanner
import androidx.compose.material3.OutlinedButton
import androidx.compose.ui.platform.LocalContext
import com.aspirescience.academy.util.Messages
import com.aspirescience.academy.util.Messenger
import com.aspirescience.academy.ui.common.InfoRow
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.common.StatTile
import com.aspirescience.academy.ui.notice.HomeworkItem
import com.aspirescience.academy.ui.notice.NoticeCard
import com.aspirescience.academy.ui.notice.visibleHomework
import com.aspirescience.academy.ui.notice.visibleNotices
import com.aspirescience.academy.ui.schedule.ClassCard
import com.aspirescience.academy.ui.schedule.TeacherReportContent
import com.aspirescience.academy.ui.theme.Blue
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D

private val PAD = PaddingValues(16.dp, 12.dp, 16.dp, 32.dp)

@Composable
private fun Greeting(name: String, sub: String) {
    Box(
        Modifier.fillMaxWidth().background(Indigo, RoundedCornerShape(18.dp)).padding(18.dp)
    ) {
        Column {
            Text("Hello, " + name.substringBefore(" "), color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text(sub, color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp)
        }
    }
}

private class Act(val title: String, val icon: ImageVector, val badge: Int = 0, val onClick: () -> Unit)

@Composable
private fun ActionGrid(acts: List<Act>) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        acts.chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { a ->
                    AppCard(Modifier.weight(1f), onClick = a.onClick) {
                        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                Modifier.size(44.dp).background(Indigo.copy(alpha = 0.12f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) { Icon(a.icon, null, tint = Indigo) }
                            Spacer(Modifier.size(6.dp))
                            Text(a.title, fontSize = 12.sp, textAlign = TextAlign.Center, fontWeight = FontWeight.Medium)
                            if (a.badge > 0) Pill(a.badge.toString(), Orange)
                        }
                    }
                }
                repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
fun AdminHome(vm: AppViewModel) {
    val me = vm.me ?: return
    val today = D.today()
    val todays = vm.classes.filter { it.date == today }.sortedBy { it.start }
    val pending = vm.pendingApprovals.size
    val acts = ArrayList<Act>()
    if (vm.can(Perm.USERS)) {
        acts.add(Act("Students", Icons.Filled.School) { vm.go(Screen.People(Role.STUDENT)) })
        acts.add(Act("Teachers", Icons.Filled.Person) { vm.go(Screen.People(Role.TEACHER)) })
    }
    if (me.role == Role.ADMIN) acts.add(Act("Sub-admins", Icons.Filled.AdminPanelSettings) { vm.go(Screen.People(Role.SUBADMIN)) })
    if (vm.can(Perm.ATTENDANCE)) {
        acts.add(Act("Approvals", Icons.Filled.FactCheck, pending) { vm.go(Screen.Approvals) })
        acts.add(Act("Teacher report", Icons.Filled.BarChart) { vm.go(Screen.TeacherReport) })
    }
    if (vm.can(Perm.NOTICES)) {
        acts.add(Act("Announcements", Icons.Filled.Campaign) { vm.go(Screen.Notices) })
        acts.add(Act("Homework", Icons.Filled.Description) { vm.go(Screen.HomeworkList) })
    }
    acts.add(Act("Leaderboard", Icons.Filled.EmojiEvents) { vm.go(Screen.Leaderboard) })
    if (me.role == Role.ADMIN) acts.add(Act("Backup", Icons.Filled.Download) { vm.backup() })
    acts.add(Act("Password", Icons.Filled.Lock) { vm.go(Screen.ChangePassword) })

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PAD, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Greeting(me.name, Role.label(me.role)) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Students", vm.students.count { it.active }.toString(), Indigo, Modifier.weight(1f))
                StatTile("Teachers", vm.teachers.count { it.active }.toString(), Blue, Modifier.weight(1f))
                StatTile("Batches", vm.batches.size.toString(), Green, Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Classes today", todays.size.toString(), Indigo, Modifier.weight(1f))
                StatTile(
                    "Waiting approval", pending.toString(), if (pending > 0) Orange else Grey, Modifier.weight(1f),
                    onClick = if (vm.can(Perm.ATTENDANCE)) ({ vm.go(Screen.Approvals) }) else null
                )
            }
        }
        if (vm.can(Perm.FEES)) item { FeeDuesCard(vm) }
        item { SectionTitle("Manage") }
        item { ActionGrid(acts) }
        item { SectionTitle("Today's classes") }
        if (todays.isEmpty()) item { Text("No classes today", color = Grey) } else items(todays) { ClassCard(vm, it) }
    }
}

@Composable
fun TeacherHome(vm: AppViewModel) {
    val me = vm.me ?: return
    val today = D.today()
    val month = D.thisMonth()
    val mine = vm.classes.filter { it.teacherId == me.id }
    val todays = mine.filter { it.date == today }.sortedBy { it.start }
    val upcoming = mine.filter { it.date > today && it.status == CS.SCHEDULED }.sortedWith(compareBy({ it.date }, { it.start })).take(5)
    val done = mine.count { it.date.startsWith(month) && it.status == CS.APPROVED }
    val pending = mine.count { it.status == CS.TAKEN }
    val needAttendance = mine.count { it.date <= today && (it.status == CS.SCHEDULED || it.status == CS.REJECTED) }
    val notices = visibleNotices(vm).take(3)

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PAD, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Greeting(me.name, "Teacher") }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Classes this month", done.toString(), Green, Modifier.weight(1f))
                StatTile("Waiting approval", pending.toString(), Orange, Modifier.weight(1f))
                StatTile("Attendance due", needAttendance.toString(), if (needAttendance > 0) Red else Grey, Modifier.weight(1f))
            }
        }
        item { SectionTitle("Today's classes") }
        if (todays.isEmpty()) item { Text("No classes today", color = Grey) } else items(todays) { ClassCard(vm, it) }
        if (upcoming.isNotEmpty()) {
            item { SectionTitle("Upcoming") }
            items(upcoming) { ClassCard(vm, it, showDate = true) }
        }
        item { OutlinedButton(onClick = { vm.go(Screen.Leaderboard) }, modifier = Modifier.fillMaxWidth()) { Text("Leaderboard") } }
        item { SectionTitle("My batches") }
        if (vm.myBatches.isEmpty()) item { Text("No batches assigned yet", color = Grey) }
        items(vm.myBatches) { b ->
            AppCard(onClick = { vm.go(Screen.BatchDetail(b.id)) }) {
                Text(b.name, fontWeight = FontWeight.Bold)
                Text(vm.studentsOf(b.id).size.toString() + " students", color = Grey, fontSize = 13.sp)
            }
        }
        if (notices.isNotEmpty()) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SectionTitle("Announcements", Modifier.weight(1f))
                    TextButton(onClick = { vm.go(Screen.Notices) }) { Text("See all") }
                }
            }
            items(notices) { n -> NoticeCard(n, false, {}) }
        }
    }
}

@Composable
fun TeacherProfile(vm: AppViewModel) {
    val me = vm.me ?: return
    Column(Modifier.fillMaxSize()) {
        AppCard(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                com.aspirescience.academy.ui.common.Avatar(me.name, 48)
                Column(Modifier.padding(start = 12.dp)) {
                    Text(me.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("Teacher", color = Grey)
                }
            }
            Spacer(Modifier.size(8.dp))
            InfoRow("Mobile", me.mobile.ifBlank { me.loginId })
            InfoRow("Subjects", me.subjects)
        }
        Box(Modifier.weight(1f)) { TeacherReportContent(vm, me.id) }
    }
}

@Composable
fun StudentHome(vm: AppViewModel) {
    val me = vm.me ?: return
    val today = D.today()
    val tomorrow = java.time.LocalDate.now().plusDays(1).toString()
    val mine = vm.visibleClasses().filter { it.date >= today && it.status != CS.CANCELLED }
        .sortedWith(compareBy({ it.date }, { it.start }))
    val nextWeek = java.time.LocalDate.now().plusDays(7).toString()
    val coming = mine.filter { it.date <= nextWeek }
    val homework = visibleHomework(vm).filter { it.dueDate.isBlank() || it.dueDate >= today }.take(4)
    val notices = visibleNotices(vm).take(3)
    val att by remember(me.id) { Repo.attendanceByStudent(me.id) }.collectAsState(initial = emptyList())
    val present = att.count { it.status != "A" }
    val pct = if (att.isEmpty()) 0 else present * 100 / att.size
    val fees by remember(me.id) { Repo.feesByStudent(me.id) }.collectAsState(initial = emptyList())

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PAD, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Greeting(me.name, vm.myBatches.joinToString(", ") { it.name }.ifBlank { "Student" }) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Attendance", if (att.isEmpty()) "-" else "$pct%", if (pct >= 75 || att.isEmpty()) Green else Red, Modifier.weight(1f))
                StatTile("Classes this week", coming.size.toString(), Indigo, Modifier.weight(1f))
            }
        }
        item { FeeDueBanner(me, fees) }
        item { OutlinedButton(onClick = { vm.go(Screen.Leaderboard) }, modifier = Modifier.fillMaxWidth()) { Text("Leaderboard") } }
        item { SectionTitle("Today & tomorrow") }
        val soon = mine.filter { it.date == today || it.date == tomorrow }
        if (soon.isEmpty()) item { Text("No classes today or tomorrow", color = Grey) }
        items(soon) { ClassCard(vm, it, showDate = true) }
        if (homework.isNotEmpty()) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SectionTitle("Homework", Modifier.weight(1f))
                    TextButton(onClick = { vm.go(Screen.HomeworkList) }) { Text("See all") }
                }
            }
            items(homework) { HomeworkItem(vm, it) }
        }
        if (notices.isNotEmpty()) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SectionTitle("Announcements", Modifier.weight(1f))
                    TextButton(onClick = { vm.go(Screen.Notices) }) { Text("See all") }
                }
            }
            items(notices) { n -> NoticeCard(n, false, {}) }
        }
    }
}

/** Admin home card: who still owes this month's fee, with a WhatsApp reminder per student. */
@Composable
private fun FeeDuesCard(vm: AppViewModel) {
    val ctx = LocalContext.current
    val month = D.thisMonth()
    val fees by remember { Repo.feesByMonth(month) }.collectAsState(initial = emptyList())
    val due = vm.students.filter { it.active && it.monthlyFee > 0 && (it.createdAt <= 0L || D.monthOfMillis(it.createdAt) <= month) }
        .map { s -> s to (s.monthlyFee - fees.filter { f -> f.studentId == s.id }.sumOf { f -> f.amount }) }
        .filter { it.second > 0 }
    if (due.isEmpty()) return
    AppCard {
        Text("Fees pending (" + due.size + ") - " + D.rs(due.sumOf { it.second }), fontWeight = FontWeight.Bold, color = Red)
        due.take(3).forEach { (s, amt) ->
            Row(Modifier.fillMaxWidth().padding(top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(s.name, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                    Text("Due " + D.rs(amt), color = Grey, fontSize = 12.sp)
                }
                TextButton(onClick = { Messenger.whatsapp(ctx, s.parentMobile.ifBlank { s.mobile }, Messages.feeDue(s.name, month, amt)) }) { Text("Remind") }
            }
        }
        if (due.size > 3) Text("See everyone in the Fees tab", color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
    }
}
