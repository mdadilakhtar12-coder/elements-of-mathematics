@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.schedule

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.data.Attendance
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.ClassSession
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.DangerTextButton
import com.aspirescience.academy.ui.common.DateField
import com.aspirescience.academy.ui.common.EmptyState
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.InfoRow
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.MonthSwitcher
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.common.StatusToggle
import com.aspirescience.academy.ui.common.TimeField
import com.aspirescience.academy.ui.common.pickDate
import com.aspirescience.academy.ui.theme.Blue
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D
import com.aspirescience.academy.util.Messages
import com.aspirescience.academy.util.Messenger
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

fun statusColor(s: String): Color = when (s) {
    CS.APPROVED -> Green
    CS.TAKEN -> Orange
    CS.CANCELLED, CS.REJECTED -> Red
    else -> Blue
}

fun statusLabel(vm: AppViewModel, s: String): String =
    if (vm.role == Role.STUDENT && s == CS.TAKEN) "Completed" else CS.label(s)

@Composable
fun ClassCard(vm: AppViewModel, c: ClassSession, showDate: Boolean = false) {
    AppCard(onClick = { vm.go(Screen.ClassDetail(c.id)) }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(c.batchName, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                val whenText = (if (showDate) D.shortDate(c.date) + ", " else "") + D.range(c.start, c.end)
                Text(whenText, color = Grey, fontSize = 13.sp)
                if (vm.role != Role.TEACHER && c.teacherName.isNotBlank()) {
                    Text(c.teacherName, color = Grey, fontSize = 13.sp)
                }
            }
            Pill(statusLabel(vm, c.status), statusColor(c.status))
        }
        if (c.topic.isNotBlank()) Text("Topic: " + c.topic, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
    }
}

@Composable
fun WeekStrip(selected: String, marked: Set<String>, onSelect: (String) -> Unit) {
    val sel = D.parse(selected) ?: LocalDate.now()
    val start = sel.minusDays((sel.dayOfWeek.value % 7).toLong()) // week starts on Sunday
    val today = D.today()
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { onSelect(sel.minusDays(7).toString()) }, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Filled.ChevronLeft, "Previous week")
        }
        for (i in 0..6) {
            val d = start.plusDays(i.toLong())
            val iso = d.toString()
            val on = iso == selected
            Column(
                Modifier.weight(1f).clip(RoundedCornerShape(12.dp))
                    .background(if (on) Indigo else Color.Transparent)
                    .clickable { onSelect(iso) }.padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    d.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH).take(3), fontSize = 11.sp,
                    color = if (on) Color.White else Grey
                )
                Text(
                    d.dayOfMonth.toString(), fontWeight = FontWeight.Bold, fontSize = 16.sp,
                    color = if (on) Color.White else if (iso == today) Indigo else Color.Black
                )
                Box(
                    Modifier.padding(top = 3.dp).size(5.dp).background(
                        if (iso in marked) (if (on) Color.White else Indigo) else Color.Transparent, CircleShape
                    )
                )
            }
        }
        IconButton(onClick = { onSelect(sel.plusDays(7).toString()) }, modifier = Modifier.size(32.dp)) {
            Icon(Icons.Filled.ChevronRight, "Next week")
        }
    }
}

@Composable
fun ScheduleTab(vm: AppViewModel) {
    val ctx = LocalContext.current
    var selected by rememberSaveable { mutableStateOf(D.today()) }
    var batchFilter by rememberSaveable { mutableStateOf("") }
    val all = vm.visibleClasses().filter { batchFilter.isEmpty() || it.batchId == batchFilter }
    val marked = all.map { it.date }.toSet()
    val day = all.filter { it.date == selected }.sortedBy { it.start }
    Box(Modifier.fillMaxSize()) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 8.dp, 16.dp, 90.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        D.pretty(selected), fontWeight = FontWeight.Bold, fontSize = 16.sp,
                        modifier = Modifier.weight(1f)
                    )
                    TextButton(onClick = { selected = D.today() }) { Text("Today") }
                    IconButton(onClick = { pickDate(ctx, selected) { selected = it } }) {
                        Icon(Icons.Filled.CalendarMonth, "Pick date", tint = Indigo)
                    }
                }
            }
            item { WeekStrip(selected, marked) { selected = it } }
            if (vm.isStaff) {
                item {
                    PickerField(
                        "Batch", if (batchFilter.isEmpty()) "All batches" else vm.batch(batchFilter)?.name.orEmpty(),
                        listOf("" to "All batches") + vm.batches.map { it.id to it.name }, { batchFilter = it }
                    )
                }
            }
            if (day.isEmpty()) {
                item { Text("No classes on this day", color = Grey, modifier = Modifier.padding(24.dp).fillMaxWidth(), textAlign = TextAlign.Center) }
            } else {
                items(day) { ClassCard(vm, it) }
            }
        }
        if (vm.can(Perm.SCHEDULE)) {
            FloatingActionButton(
                onClick = { vm.go(Screen.ClassEdit(date = selected)) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
            ) { Icon(Icons.Filled.Add, "Add class") }
        }
    }
}

@Composable
fun ClassDetailScreen(vm: AppViewModel, classId: String) {
    val c = vm.cls(classId)
    val me = vm.me ?: return
    if (c == null) {
        Page("Class", vm::back) { EmptyState("Class not found") }
        return
    }
    val isOwn = me.role == Role.TEACHER && c.teacherId == me.id
    val canApprove = vm.can(Perm.ATTENDANCE)
    val canSchedule = vm.can(Perm.SCHEDULE)
    val students = vm.studentsOf(c.batchId)
    val att by remember(classId) { Repo.attendanceByClass(classId) }.collectAsState(initial = emptyList())
    val marks = remember(classId) { mutableStateMapOf<String, String>() }
    var topic by remember(classId) { mutableStateOf(c.topic) }
    var confirmCancel by remember { mutableStateOf(false) }
    LaunchedEffect(att) {
        att.forEach { a -> if (marks[a.studentId] == null) marks[a.studentId] = a.status }
    }
    val canTake = c.status != CS.CANCELLED &&
        (canApprove || (isOwn && c.status != CS.APPROVED)) &&
        (c.date <= D.today() || canApprove)
    val isStudent = me.role == Role.STUDENT
    val ctx = LocalContext.current

    Page(
        c.batchName, vm::back,
        actions = {
            if (canSchedule) {
                IconButton(onClick = { vm.go(Screen.ClassEdit(classId = c.id)) }) { Icon(Icons.Filled.Edit, "Edit") }
            }
        }
    ) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                AppCard {
                    InfoRow("Subject", c.subject)
                    InfoRow("Date", D.pretty(c.date))
                    InfoRow("Time", D.range(c.start, c.end))
                    InfoRow("Teacher", c.teacherName)
                    InfoRow("Status", statusLabel(vm, c.status))
                    InfoRow("Topic", c.topic)
                    InfoRow("Note", c.note)
                    if (!isStudent && c.takenBy.isNotBlank()) {
                        InfoRow("Marked by", c.takenBy + ", " + D.timestamp(c.takenAt))
                    }
                }
            }
            if (c.status == CS.TAKEN && canApprove) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = { vm.op("Sent back to teacher") { Repo.put("classes", c.copy(status = CS.REJECTED)) } },
                            modifier = Modifier.weight(1f).height(48.dp)
                        ) { Text("Reject", color = Red) }
                        Button(
                            onClick = { vm.op("Approved") { Repo.put("classes", c.copy(status = CS.APPROVED, approvedBy = me.name)) } },
                            modifier = Modifier.weight(1f).height(48.dp)
                        ) { Text("Approve") }
                    }
                }
            }
            if (canSchedule && c.status != CS.APPROVED && c.status != CS.TAKEN) {
                item {
                    if (c.status == CS.CANCELLED) {
                        OutlinedButton(
                            onClick = { vm.op("Class restored") { Repo.put("classes", c.copy(status = CS.SCHEDULED)) } },
                            modifier = Modifier.fillMaxWidth()
                        ) { Text("Restore class") }
                    } else {
                        OutlinedButton(onClick = { confirmCancel = true }, modifier = Modifier.fillMaxWidth()) {
                            Text("Cancel this class", color = Red)
                        }
                    }
                }
            }

            if (isStudent) {
                item {
                    val mine = att.firstOrNull { it.studentId == me.id }
                    AppCard {
                        Text("My attendance", fontWeight = FontWeight.Bold)
                        Text(
                            when (mine?.status) {
                                "P" -> "Present"
                                "A" -> "Absent"
                                "L" -> "Late"
                                else -> "Not marked yet"
                            },
                            color = when (mine?.status) {
                                "P" -> Green
                                "A" -> Red
                                "L" -> Orange
                                else -> Grey
                            },
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            } else if (canTake || att.isNotEmpty()) {
                item { SectionTitle("Attendance") }
                if (canTake) {
                    item {
                        Field("Topic taught (optional)", topic, { topic = it })
                    }
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            val p = students.count { (marks[it.id] ?: "P") != "A" }
                            Text("Present $p / ${students.size}", color = Grey, modifier = Modifier.weight(1f))
                            TextButton(onClick = { students.forEach { marks[it.id] = "P" } }) { Text("All present") }
                            TextButton(onClick = { students.forEach { marks[it.id] = "A" } }) { Text("All absent") }
                        }
                    }
                }
                if (students.isEmpty()) {
                    item { Text("No students in this batch yet.", color = Grey) }
                }
                items(students) { s ->
                    val st = marks[s.id] ?: if (canTake) "P" else ""
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(s.name, fontWeight = FontWeight.SemiBold)
                                if (s.rollNo.isNotBlank()) Text("Roll " + s.rollNo, color = Grey, fontSize = 12.sp)
                                if (st == "A") {
                                    TextButton(onClick = {
                                        Messenger.whatsapp(ctx, s.parentMobile.ifBlank { s.mobile }, Messages.absent(s.name, c.date, c.subject))
                                    }) { Text("Message parent", fontSize = 12.sp) }
                                }
                            }
                            if (canTake) {
                                StatusToggle(st) { marks[s.id] = it }
                            } else if (st.isNotEmpty()) {
                                Pill(
                                    when (st) { "P" -> "Present"; "A" -> "Absent"; else -> "Late" },
                                    when (st) { "P" -> Green; "A" -> Red; else -> Orange }
                                )
                            }
                        }
                    }
                }
                if (canTake && students.isNotEmpty()) {
                    item {
                        PrimaryButton(
                            if (canApprove) "Save attendance" else "Submit for approval",
                            onClick = {
                                vm.op("Attendance saved", { vm.back() }) {
                                    val items = students.map { s ->
                                        Attendance(
                                            id = c.id + "_" + s.id, classId = c.id, batchId = c.batchId,
                                            batchName = c.batchName, subject = c.subject, studentId = s.id,
                                            studentName = s.name, date = c.date, status = marks[s.id] ?: "P"
                                        )
                                    }
                                    Repo.putAll("attendance", items)
                                    Repo.put(
                                        "classes",
                                        c.copy(
                                            status = if (canApprove) CS.APPROVED else CS.TAKEN,
                                            topic = topic.trim(), takenBy = me.name,
                                            takenAt = System.currentTimeMillis(),
                                            approvedBy = if (canApprove) me.name else ""
                                        )
                                    )
                                }
                            },
                            busy = vm.busy
                        )
                    }
                }
            }
        }
    }
    if (confirmCancel) {
        ConfirmDialog(
            "Cancel class?", "Students will see this class as cancelled.", "Cancel class",
            { vm.op("Class cancelled") { Repo.put("classes", c.copy(status = CS.CANCELLED)) } },
            { confirmCancel = false }
        )
    }
}

@Composable
fun ClassEditScreen(vm: AppViewModel, s: Screen.ClassEdit) {
    val existing = vm.cls(s.classId)
    var batchId by remember { mutableStateOf(existing?.batchId ?: s.batchId) }
    var date by remember { mutableStateOf(existing?.date ?: s.date.ifBlank { D.today() }) }
    var start by remember { mutableStateOf(existing?.start ?: "16:00") }
    var end by remember { mutableStateOf(existing?.end ?: "17:00") }
    var teacherId by remember { mutableStateOf(existing?.teacherId ?: vm.batch(s.batchId)?.teacherId.orEmpty()) }
    var topic by remember { mutableStateOf(existing?.topic.orEmpty()) }
    var note by remember { mutableStateOf(existing?.note.orEmpty()) }
    var confirmDelete by remember { mutableStateOf(false) }

    Page(if (existing == null) "Add Class" else "Edit Class", vm::back) {
        FormColumn {
            PickerField(
                "Batch", vm.batch(batchId)?.name.orEmpty(), vm.batches.map { it.id to it.name },
                {
                    batchId = it
                    if (existing == null) teacherId = vm.batch(it)?.teacherId.orEmpty()
                },
                enabled = existing == null
            )
            DateField("Date", date, { date = it })
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                TimeField("Start", start, { start = it }, Modifier.weight(1f))
                TimeField("End", end, { end = it }, Modifier.weight(1f))
            }
            PickerField(
                "Teacher", vm.user(teacherId)?.name.orEmpty(),
                vm.teachers.filter { it.active }.map { it.id to it.name }, { teacherId = it }
            )
            Field("Topic (optional)", topic, { topic = it })
            Field("Note for students (optional)", note, { note = it }, singleLine = false)
            PrimaryButton("Save", onClick = {
                val b = vm.batch(batchId)
                if (b == null) {
                    vm.toast("Select a batch")
                } else if (start >= end) {
                    vm.toast("End time must be after start time")
                } else {
                    val c = (existing ?: ClassSession()).copy(
                        batchId = b.id, batchName = b.name, subject = b.subject, teacherId = teacherId,
                        teacherName = vm.user(teacherId)?.name.orEmpty(), date = date, start = start, end = end,
                        topic = topic.trim(), note = note.trim()
                    )
                    vm.op("Saved", { vm.back() }) { Repo.put("classes", c) }
                }
            }, busy = vm.busy)
            if (existing != null) DangerTextButton("Delete class") { confirmDelete = true }
        }
    }
    if (confirmDelete && existing != null) {
        ConfirmDialog(
            "Delete class?", "This removes the class from the timetable.", "Delete",
            {
                vm.op("Deleted", { vm.back(); vm.back() }) { Repo.delete("classes", existing.id) }
            },
            { confirmDelete = false }
        )
    }
}

@Composable
fun ApprovalsScreen(vm: AppViewModel) {
    val pending = vm.pendingApprovals.sortedByDescending { it.date }
    Page(
        "Approvals", vm::back,
        actions = {
            if (pending.isNotEmpty()) {
                TextButton(onClick = {
                    val me = vm.me
                    vm.op("All approved") {
                        Repo.putAll("classes", pending.map { it.copy(status = CS.APPROVED, approvedBy = me?.name.orEmpty()) })
                    }
                }) { Icon(Icons.Filled.Check, null); Text(" Approve all") }
            }
        }
    ) {
        ListColumn(pending, "No classes waiting for approval") { c ->
            AppCard(onClick = { vm.go(Screen.ClassDetail(c.id)) }) {
                Text(c.batchName, fontWeight = FontWeight.Bold)
                Text(D.pretty(c.date) + " · " + D.range(c.start, c.end), color = Grey, fontSize = 13.sp)
                Text("Teacher: " + c.teacherName, color = Grey, fontSize = 13.sp)
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { vm.op("Sent back") { Repo.put("classes", c.copy(status = CS.REJECTED)) } }) {
                        Text("Reject", color = Red)
                    }
                    Button(onClick = {
                        vm.op("Approved") { Repo.put("classes", c.copy(status = CS.APPROVED, approvedBy = vm.me?.name.orEmpty())) }
                    }) { Text("Approve") }
                }
            }
        }
    }
}

@Composable
fun TeacherReportScreen(vm: AppViewModel) {
    Page("Teacher Report", vm::back) { TeacherReportContent(vm, null) }
}

/** Monthly class count per teacher. [onlyId] limits it to a single teacher (used on the teacher's own profile). */
@Composable
fun TeacherReportContent(vm: AppViewModel, onlyId: String?) {
    var month by rememberSaveable { mutableStateOf(D.thisMonth()) }
    val list by remember(month) { Repo.classesBetween(D.monthStart(month), D.monthEnd(month)) }
        .collectAsState(initial = emptyList())
    val teachers = if (onlyId != null) listOfNotNull(vm.user(onlyId) ?: vm.me) else vm.teachers
    val today = D.today()
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp, 8.dp, 16.dp, 40.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item { MonthSwitcher(month) { month = it } }
        if (teachers.isEmpty()) item { Text("No teachers yet", color = Grey) }
        items(teachers) { t ->
            val mine = list.filter { it.teacherId == t.id }
            val done = mine.count { it.status == CS.APPROVED }
            val pending = mine.count { it.status == CS.TAKEN }
            val notTaken = mine.count { (it.status == CS.SCHEDULED || it.status == CS.REJECTED) && it.date < today }
            val cancelled = mine.count { it.status == CS.CANCELLED }
            AppCard {
                Text(t.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    CountCell("Completed", done, Green)
                    CountCell("Pending", pending, Orange)
                    CountCell("Not taken", notTaken, Red)
                    CountCell("Cancelled", cancelled, Grey)
                }
                if (t.classRate > 0) {
                    Text(
                        "Earned this month: " + D.rs(done * t.classRate) + "  (" + D.rs(t.classRate) + " per class)",
                        fontWeight = FontWeight.SemiBold, color = Green, fontSize = 13.sp, modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun CountCell(label: String, n: Int, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(n.toString(), fontSize = 22.sp, fontWeight = FontWeight.Bold, color = color)
        Text(label, fontSize = 11.sp, color = Grey)
    }
}
