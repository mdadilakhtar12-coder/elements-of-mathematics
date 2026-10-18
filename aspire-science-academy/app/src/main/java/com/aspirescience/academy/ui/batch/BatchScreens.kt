@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.batch

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.aspirescience.academy.data.Batch
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.WeeklySlot
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DangerTextButton
import com.aspirescience.academy.ui.common.DateField
import com.aspirescience.academy.ui.common.DropdownField
import com.aspirescience.academy.ui.common.EmptyState
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.InfoRow
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.MultiPickDialog
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.common.TimeField
import com.aspirescience.academy.ui.schedule.ClassCard
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.util.D
import java.time.LocalDate

@Composable
fun BatchesTab(vm: AppViewModel) {
    Box(Modifier.fillMaxSize()) {
        ListColumn(vm.batches, "No batches yet. Tap + to create one.") { b ->
            AppCard(onClick = { vm.go(Screen.BatchDetail(b.id)) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(b.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.weight(1f))
                    if (b.weekly.isEmpty()) Pill("No timetable", com.aspirescience.academy.ui.theme.Orange)
                }
                Text(vm.studentsOf(b.id).size.toString() + " students", color = Grey, fontSize = 13.sp)
                Text(b.teacherName.ifBlank { "No teacher assigned" }, color = Indigo, fontSize = 13.sp)
            }
        }
        FloatingActionButton(
            onClick = { vm.go(Screen.BatchEdit()) },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        ) { Icon(Icons.Filled.Add, "Create batch") }
    }
}

@Composable
fun BatchEditScreen(vm: AppViewModel, batchId: String) {
    val existing = vm.batch(batchId)
    var standard by remember { mutableStateOf(existing?.standard.orEmpty()) }
    var subject by remember { mutableStateOf(existing?.subject.orEmpty()) }
    var name by remember { mutableStateOf(existing?.name.orEmpty()) }
    var nameTouched by remember { mutableStateOf(existing != null) }
    var teacherId by remember { mutableStateOf(existing?.teacherId.orEmpty()) }
    var slots by remember { mutableStateOf(existing?.weekly ?: emptyList()) }

    fun suggest(st: String, su: String) {
        if (!nameTouched && st.isNotBlank() && su.isNotBlank()) name = su + " - " + st
    }

    Page(if (existing == null) "Create Batch" else "Edit Batch", vm::back) {
        FormColumn {
            DropdownField("Standard", standard, AppConfig.STANDARDS, { standard = AppConfig.STANDARDS[it]; suggest(standard, subject) })
            DropdownField("Subject", subject, AppConfig.SUBJECTS, { subject = AppConfig.SUBJECTS[it]; suggest(standard, subject) })
            Field("Batch name", name, { name = it; nameTouched = true })
            PickerField(
                "Teacher", vm.user(teacherId)?.name.orEmpty(),
                vm.teachers.filter { it.active }.map { it.id to it.name }, { teacherId = it }
            )
            SectionTitle("Weekly timetable")
            Text("Class days and times that repeat every week. You can generate the actual classes after saving.", color = Grey, fontSize = 13.sp)
            slots.forEachIndexed { i, sl ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        DropdownField(
                            "Day", D.dayName(sl.day), D.DAYS,
                            { d -> slots = slots.mapIndexed { j, x -> if (j == i) x.copy(day = d + 1) else x } },
                            Modifier.weight(1f)
                        )
                        IconButton(onClick = { slots = slots.filterIndexed { j, _ -> j != i } }) { Icon(Icons.Filled.Close, "Remove") }
                    }
                    Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        TimeField("Start", sl.start, { t -> slots = slots.mapIndexed { j, x -> if (j == i) x.copy(start = t) else x } }, Modifier.weight(1f))
                        TimeField("End", sl.end, { t -> slots = slots.mapIndexed { j, x -> if (j == i) x.copy(end = t) else x } }, Modifier.weight(1f))
                    }
                }
            }
            OutlinedButton(onClick = { slots = slots + WeeklySlot() }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Filled.Add, null)
                Text(" Add class day")
            }
            PrimaryButton("Save", onClick = {
                if (standard.isBlank() || subject.isBlank() || name.isBlank()) {
                    vm.toast("Select standard, subject and a batch name")
                } else if (slots.any { it.start >= it.end }) {
                    vm.toast("End time must be after start time")
                } else {
                    val b = (existing ?: Batch()).copy(
                        name = name.trim(), standard = standard, subject = subject, teacherId = teacherId,
                        teacherName = vm.user(teacherId)?.name.orEmpty(), weekly = slots
                    )
                    vm.op("Saved", { if (existing == null) vm.replace(Screen.BatchDetail(b.id)) else vm.back() }) {
                        Repo.put("batches", b)
                    }
                }
            }, busy = vm.busy)
        }
    }
}

@Composable
fun BatchDetailScreen(vm: AppViewModel, batchId: String) {
    val b = vm.batch(batchId)
    if (b == null) {
        Page("Batch", vm::back) { EmptyState("Batch not found") }
        return
    }
    val canEdit = vm.can(Perm.BATCHES)
    val canSchedule = vm.can(Perm.SCHEDULE)
    val canUsers = vm.can(Perm.USERS) || vm.can(Perm.BATCHES)
    val students = vm.studentsOf(b.id)
    val upcoming = vm.classes.filter { it.batchId == b.id && it.date >= D.today() }
        .sortedWith(compareBy({ it.date }, { it.start })).take(6)
    var confirmDelete by remember { mutableStateOf(false) }
    var addStudents by remember { mutableStateOf(false) }
    var generate by remember { mutableStateOf(false) }
    var removeTarget by remember { mutableStateOf<String?>(null) }

    Page(
        b.name, vm::back,
        actions = {
            if (canEdit) IconButton(onClick = { vm.go(Screen.BatchEdit(b.id)) }) { Icon(Icons.Filled.Edit, "Edit") }
        }
    ) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                AppCard {
                    InfoRow("Standard", b.standard)
                    InfoRow("Subject", b.subject)
                    InfoRow("Teacher", b.teacherName.ifBlank { "Not assigned" })
                    if (b.weekly.isEmpty()) {
                        InfoRow("Timetable", "Not set")
                    } else {
                        b.weekly.sortedBy { it.day }.forEach { InfoRow(D.dayName(it.day), D.range(it.start, it.end)) }
                    }
                }
            }
            if (canSchedule && b.weekly.isNotEmpty()) {
                item { OutlinedButton(onClick = { generate = true }, modifier = Modifier.fillMaxWidth()) { Text("Create classes from timetable") } }
            }
            if (upcoming.isNotEmpty()) {
                item { SectionTitle("Upcoming classes") }
                items(upcoming) { ClassCard(vm, it, showDate = true) }
            }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SectionTitle("Students (" + students.size + ")", Modifier.weight(1f))
                    if (canUsers) TextButton(onClick = { addStudents = true }) { Text("Add / remove") }
                }
            }
            if (students.isEmpty()) item { Text("No students in this batch yet", color = Grey) }
            items(students) { s ->
                AppCard(onClick = if (vm.role == Role.TEACHER) null else ({ vm.go(Screen.UserDetail(s.id)) })) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(s.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        if (s.rollNo.isNotBlank()) Text("Roll " + s.rollNo, color = Grey, fontSize = 13.sp)
                    }
                }
            }
            if (canEdit) item { DangerTextButton("Delete this batch") { confirmDelete = true } }
        }
    }
    if (confirmDelete) {
        ConfirmDialog(
            "Delete batch?", "Students stay, but this batch and its link to them is removed.", "Delete",
            { vm.deleteBatch(b) { vm.back() } }, { confirmDelete = false }
        )
    }
    if (addStudents) {
        MultiPickDialog(
            "Students in " + b.name,
            vm.students.filter { it.active || b.id in it.batchIds }.map { it.id to (it.name + if (it.standard.isBlank()) "" else " (" + it.standard + ")") },
            students.map { it.id }.toSet(),
            { addStudents = false },
            { chosen ->
                addStudents = false
                val changed = vm.students.filter { (it.id in chosen) != (b.id in it.batchIds) }
                vm.op("Saved") {
                    for (u in changed) {
                        val ids = if (u.id in chosen) u.batchIds + b.id else u.batchIds - b.id
                        Repo.update("users", u.id, mapOf("batchIds" to ids))
                    }
                }
            }
        )
    }
    if (generate) {
        var from by remember { mutableStateOf(D.today()) }
        var to by remember { mutableStateOf(LocalDate.now().plusDays(30).toString()) }
        AlertDialog(
            onDismissRequest = { generate = false },
            title = { Text("Create classes") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Classes are created for every timetable day in this range. Existing classes are not changed.", fontSize = 13.sp, color = Grey)
                    DateField("From", from, { from = it })
                    DateField("To", to, { to = it })
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    val f = D.parse(from)
                    val t = D.parse(to)
                    if (f == null || t == null || t.isBefore(f)) {
                        vm.toast("Choose a valid date range")
                    } else if (t.isAfter(f.plusDays(92))) {
                        vm.toast("Please choose at most 3 months at a time")
                    } else {
                        generate = false
                        vm.generateClasses(b, f, t) {}
                    }
                }) { Text("Create") }
            },
            dismissButton = { TextButton(onClick = { generate = false }) { Text("Cancel") } }
        )
    }
}
