@file:OptIn(ExperimentalMaterial3Api::class)

package com.coachsaas.app.ui.batch

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
import com.coachsaas.app.AppConfig
import com.coachsaas.app.data.Batch
import com.coachsaas.app.data.CS
import com.coachsaas.app.data.Perm
import com.coachsaas.app.data.Repo
import com.coachsaas.app.data.Role
import com.coachsaas.app.data.SubjectPlan
import com.coachsaas.app.data.WeeklySlot
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.Screen
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.ConfirmDialog
import com.coachsaas.app.ui.common.DangerTextButton
import com.coachsaas.app.ui.common.DateField
import com.coachsaas.app.ui.common.DropdownField
import com.coachsaas.app.ui.common.EmptyState
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.FormColumn
import com.coachsaas.app.ui.common.InfoRow
import com.coachsaas.app.ui.common.ListColumn
import com.coachsaas.app.ui.common.MultiPickDialog
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PickerField
import com.coachsaas.app.ui.common.Pill
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.common.SectionTitle
import com.coachsaas.app.ui.common.TimeField
import com.coachsaas.app.ui.schedule.ClassCard
import com.coachsaas.app.ui.people.StudentImportDialog
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Indigo
import com.coachsaas.app.util.D
import java.time.LocalDate

/** "Class 11 Science A" from the pieces the admin picked. */
fun batchLabel(standard: String, group: String, section: String): String =
    listOf(standard, group, section).filter { it.isNotBlank() }.joinToString(" ")

@Composable
fun BatchesTab(vm: AppViewModel) {
    Box(Modifier.fillMaxSize()) {
        ListColumn(vm.batches, "No batches yet. Tap + to create one.") { b ->
            AppCard(onClick = { vm.go(Screen.BatchDetail(b.id)) }) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(b.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.weight(1f))
                    if (b.plans().all { it.weekly.isEmpty() }) Pill("No timetable", com.coachsaas.app.ui.theme.Orange)
                }
                Text(vm.studentsOf(b.id).size.toString() + " students", color = Grey, fontSize = 13.sp)
                b.plans().forEach {
                    Text(
                        it.subject + " - " + it.teacherName.ifBlank { "no teacher" },
                        color = Indigo, fontSize = 13.sp
                    )
                }
                if (b.plans().isEmpty()) Text("No subjects added yet", color = Grey, fontSize = 13.sp)
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
    var group by remember { mutableStateOf(existing?.group.orEmpty()) }
    var section by remember { mutableStateOf(existing?.section.orEmpty()) }
    var waLink by remember { mutableStateOf(existing?.whatsappLink.orEmpty()) }
    var name by remember { mutableStateOf(existing?.name.orEmpty()) }
    var nameTouched by remember { mutableStateOf(existing != null) }
    var plans by remember { mutableStateOf(existing?.plans() ?: emptyList()) }
    var batchFee by remember { mutableStateOf(existing?.monthlyFee?.takeIf { it > 0 }?.toString().orEmpty()) }

    fun update(i: Int, f: (SubjectPlan) -> SubjectPlan) {
        plans = plans.mapIndexed { j, p -> if (j == i) f(p) else p }
    }

    Page(if (existing == null) "Create Batch" else "Edit Batch", vm::back) {
        FormColumn {
            val classes = vm.classOptions(standard)
            DropdownField("Class", standard, classes, {
                standard = classes[it]
                if (!nameTouched) name = batchLabel(standard, group, section)
            })
            Text("Add or remove classes, groups and sections in Home > Classes & groups.", color = Grey, fontSize = 12.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                val groups = vm.groupOptions(group)
                DropdownField("Group (optional)", group.ifEmpty { "None" }, listOf("None") + groups, {
                    group = if (it == 0) "" else groups[it - 1]
                    if (!nameTouched) name = batchLabel(standard, group, section)
                }, Modifier.weight(1f))
                val sections = vm.sectionOptions(section)
                DropdownField("Section (optional)", section.ifEmpty { "None" }, listOf("None") + sections, {
                    section = if (it == 0) "" else sections[it - 1]
                    if (!nameTouched) name = batchLabel(standard, group, section)
                }, Modifier.weight(1f))
            }
            Field("Batch name (e.g. 11th Science - Group A)", name, { name = it; nameTouched = true }, placeholder = "Leave empty to use class + group + section")
            Field(
                "WhatsApp group link (optional)", waLink, { waLink = it.trim() },
                placeholder = "https://chat.whatsapp.com/..."
            )
            Text("Paste the group's invite link to open that group from the timetable buttons.", color = Grey, fontSize = 12.sp)
            SectionTitle("Subjects and teachers (optional)")
            Text(
                "You can skip this and save with just the standard. Add subjects only if you want a timetable; the subject and teacher of every entry are optional.",
                color = Grey, fontSize = 13.sp
            )
            plans.forEachIndexed { i, plan ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        DropdownField(
                            "Subject (optional)", plan.subject, vm.subjectList,
                            { k -> update(i) { p -> p.copy(subject = vm.subjectList[k]) } },
                            Modifier.weight(1f)
                        )
                        IconButton(onClick = { plans = plans.filterIndexed { j, _ -> j != i } }) {
                            Icon(Icons.Filled.Close, "Remove subject")
                        }
                    }
                    Box(Modifier.padding(top = 8.dp)) {
                        PickerField(
                            "Teacher (optional)", vm.user(plan.teacherId)?.name.orEmpty(),
                            listOf("" to "No teacher") + vm.teachers.filter { it.active }.map { it.id to it.name },
                            { id -> update(i) { p -> p.copy(teacherId = id, teacherName = vm.user(id)?.name.orEmpty()) } }
                        )
                    }
                    Text("Weekly class days", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, modifier = Modifier.padding(top = 12.dp))
                    plan.weekly.forEachIndexed { k, sl ->
                        Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            DropdownField(
                                "Day", D.dayName(sl.day), D.DAYS,
                                { d -> update(i) { p -> p.copy(weekly = p.weekly.mapIndexed { m, x -> if (m == k) x.copy(day = d + 1) else x }) } },
                                Modifier.weight(1f)
                            )
                            IconButton(onClick = { update(i) { p -> p.copy(weekly = p.weekly.filterIndexed { m, _ -> m != k }) } }) {
                                Icon(Icons.Filled.Close, "Remove day")
                            }
                        }
                        Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            TimeField(
                                "Start", sl.start,
                                { t -> update(i) { p -> p.copy(weekly = p.weekly.mapIndexed { m, x -> if (m == k) x.copy(start = t) else x }) } },
                                Modifier.weight(1f)
                            )
                            TimeField(
                                "End", sl.end,
                                { t -> update(i) { p -> p.copy(weekly = p.weekly.mapIndexed { m, x -> if (m == k) x.copy(end = t) else x }) } },
                                Modifier.weight(1f)
                            )
                        }
                    }
                    plan.weekly.firstOrNull()?.let {
                        Field(
                            "Room (optional, for all days of this subject)", it.room,
                            { r -> update(i) { p -> p.copy(weekly = p.weekly.map { x -> x.copy(room = r) }) } },
                            placeholder = "e.g. 12 or Lab A"
                        )
                    }
                    OutlinedButton(
                        onClick = { update(i) { p -> p.copy(weekly = p.weekly + WeeklySlot(room = p.weekly.firstOrNull()?.room.orEmpty())) } },
                        modifier = Modifier.fillMaxWidth().padding(top = 10.dp)
                    ) {
                        Icon(Icons.Filled.Add, null)
                        Text(" Add class day")
                    }
                }
            }
            Field(
                "Monthly fee of this batch (Rs, optional)", batchFee, { batchFee = it.filter { c -> c.isDigit() } },
                keyboard = androidx.compose.ui.text.input.KeyboardType.Number
            )
            Text("New students added to this batch get this fee automatically. You can still change it per student.", color = Grey, fontSize = 12.sp)
            OutlinedButton(onClick = { plans = plans + SubjectPlan() }, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Filled.Add, null)
                Text(if (plans.isEmpty()) " Add a subject with teacher and timetable" else " Add another subject")
            }
            PrimaryButton("Save", onClick = {
                if (waLink.isNotBlank() && !waLink.startsWith("https://chat.whatsapp.com/")) {
                    vm.toast("The group link should start with https://chat.whatsapp.com/")
                } else if (standard.isBlank()) {
                    vm.toast("Select the class")
                } else if (plans.any { p -> p.weekly.any { it.start >= it.end } }) {
                    vm.toast("End time must be after start time")
                } else {
                    val b = (existing ?: Batch()).copy(
                        name = name.trim().ifBlank { batchLabel(standard, group, section) }, standard = standard,
                        group = group, section = section, whatsappLink = waLink,
                        subjects = plans
                            .filter { it.subject.isNotBlank() || it.teacherId.isNotBlank() || it.weekly.isNotEmpty() }
                            .map { p -> p.copy(teacherName = vm.user(p.teacherId)?.name.orEmpty()) },
                        subject = "", teacherId = "", teacherName = "", weekly = emptyList(),
                        monthlyFee = batchFee.toLongOrNull() ?: 0L
                    )
                    b.teacherIds = b.plans().map { it.teacherId }.filter { it.isNotBlank() }.distinct()
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
    val allUpcoming = vm.classes.filter { it.batchId == b.id && it.date >= D.today() }
        .sortedWith(compareBy({ it.date }, { it.start }))
    val upcoming = allUpcoming.take(30)
    var confirmClear by remember { mutableStateOf(false) }
    var importDialog by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var addStudents by remember { mutableStateOf(false) }
    var generate by remember { mutableStateOf(false) }
    var removeTarget by remember { mutableStateOf<String?>(null) }
    var promote by remember { mutableStateOf(false) }
    var promoteTo by remember { mutableStateOf<String?>(null) }

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
                    InfoRow("Class", b.standard)
                    if (b.group.isNotBlank()) InfoRow("Group", b.group)
                    if (b.section.isNotBlank()) InfoRow("Section", b.section)
                    if (b.plans().isEmpty()) Text("No subjects added yet. Tap the pencil to add.", color = Grey, fontSize = 13.sp)
                }
            }
            items(b.plans()) { p ->
                AppCard {
                    Text(p.subject, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text(p.teacherName.ifBlank { "No teacher assigned" }, color = Indigo, fontSize = 13.sp)
                    if (p.weekly.isEmpty()) {
                        Text("No class days set", color = Grey, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    } else {
                        p.weekly.sortedBy { it.day }.forEach { InfoRow(D.dayName(it.day), D.range(it.start, it.end)) }
                    }
                }
            }
            if (canSchedule) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = { vm.go(Screen.ClassEdit(batchId = b.id)) }, modifier = Modifier.weight(1f)
                        ) { Text("Add a class") }
                        if (b.plans().any { it.weekly.isNotEmpty() }) {
                            OutlinedButton(onClick = { generate = true }, modifier = Modifier.weight(1f)) { Text("From timetable") }
                        }
                    }
                }
            }
            if (upcoming.isNotEmpty()) {
                item {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        SectionTitle("Upcoming classes (" + allUpcoming.size + ")", Modifier.weight(1f))
                        if (canSchedule) TextButton(onClick = { confirmClear = true }) { Text("Clear all", color = com.coachsaas.app.ui.theme.Red) }
                    }
                }
                item { Text("Tap a class to edit, change the teacher or time, or cancel it.", color = Grey, fontSize = 12.sp) }
                items(upcoming) { ClassCard(vm, it, showDate = true) }
            }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SectionTitle("Students (" + students.size + ")", Modifier.weight(1f))
                    if (canUsers) TextButton(onClick = { addStudents = true }) { Text("Add / remove") }
                }
            }
            if (vm.can(Perm.USERS)) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = { vm.go(Screen.UserEdit(Role.STUDENT, batchId = b.id)) }, modifier = Modifier.weight(1f)
                        ) { Text("New student") }
                        OutlinedButton(onClick = { importDialog = true }, modifier = Modifier.weight(1f)) { Text("Import Excel / CSV") }
                    }
                }
            }
            if (canUsers && students.isNotEmpty() && vm.batches.size > 1) {
                item {
                    OutlinedButton(onClick = { promote = true }, modifier = Modifier.fillMaxWidth()) {
                        Text("Promote: move all students to another batch")
                    }
                }
            }
            if (students.isEmpty()) item { Text("No students in this batch yet", color = Grey) }
            items(students) { s ->
                AppCard(onClick = if (vm.role == Role.TEACHER) null else ({ vm.go(Screen.UserDetail(s.id)) })) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(s.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        if (s.rollNo.isNotBlank()) Text("Roll " + s.rollNo, color = Grey, fontSize = 13.sp)
                        if (vm.role != Role.STUDENT) com.coachsaas.app.ui.common.ContactButtons(s.mobile.ifBlank { s.loginId }, s.email)
                    }
                }
            }
            if (canEdit) item { DangerTextButton("Delete this batch") { confirmDelete = true } }
        }
    }
    if (promote) {
        com.coachsaas.app.ui.common.PickDialog(
            "Move " + students.size + " students to", vm.batches.filter { it.id != b.id }.map { it.id to it.name },
            { promote = false }
        ) { id -> promote = false; promoteTo = id }
    }
    promoteTo?.let { id ->
        val target = vm.batch(id)
        if (target == null) promoteTo = null else ConfirmDialog(
            "Move to " + target.name + "?",
            students.size.toString() + " students leave " + b.name + " and join " + target.name +
                (if (target.standard.isNotBlank()) " (standard " + target.standard + ")" else "") +
                ". Old attendance, marks and fee records stay as they are.",
            "Move", { promoteTo = null; vm.moveStudents(students, b.id, target) {} }, { promoteTo = null }
        )
    }
    if (confirmDelete) {
        ConfirmDialog(
            "Delete batch?", "Students stay, but this batch and its link to them is removed.", "Delete",
            { vm.deleteBatch(b) { vm.back() } }, { confirmDelete = false }
        )
    }
    if (confirmClear) {
        ConfirmDialog(
            "Remove upcoming classes?",
            "All " + allUpcoming.size + " upcoming classes of this batch will be deleted, including edited ones. Past classes stay.",
            "Delete",
            { vm.deleteClasses(allUpcoming.map { it.id }) }, { confirmClear = false }
        )
    }
    if (importDialog) StudentImportDialog(vm, b.id) { importDialog = false }
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
