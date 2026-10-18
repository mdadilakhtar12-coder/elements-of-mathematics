@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.exam

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.clickable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.Exam
import com.aspirescience.academy.data.Mark
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.Tables
import com.aspirescience.academy.data.UserProfile
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
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.Segmented
import com.aspirescience.academy.ui.common.StatTile
import com.aspirescience.academy.ui.student.fmtMarks
import com.aspirescience.academy.ui.theme.Blue
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.util.D
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private fun canManageExams(vm: AppViewModel) = vm.can(Perm.EXAMS) || vm.role == Role.TEACHER

@Composable
fun ExamsTab(vm: AppViewModel) {
    var seg by rememberSaveable { mutableStateOf(0) }
    val mine = vm.myBatches.map { it.id }.toSet()
    val today = D.today()
    val all = if (vm.role == Role.TEACHER) vm.exams.filter { it.batchId in mine } else vm.exams
    val list = if (seg == 0) all.filter { it.date >= today }.sortedBy { it.date } else all.filter { it.date < today }.sortedByDescending { it.date }
    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.padding(16.dp, 12.dp, 16.dp, 0.dp)) { Segmented(listOf("Upcoming", "Completed"), seg, { seg = it }) }
            Box(Modifier.weight(1f)) {
                ListColumn(list, if (seg == 0) "No upcoming exams" else "No completed exams") { e ->
                    AppCard(onClick = { vm.go(Screen.ExamDetail(e.id)) }) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(e.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(e.batchName, color = Indigo, fontSize = 13.sp)
                                Text(D.pretty(e.date) + " · Max " + e.maxMarks, color = Grey, fontSize = 13.sp)
                            }
                            if (e.appeared > 0) Pill("Avg " + fmtMarks(Math.round(e.average * 10) / 10.0), Green)
                            else if (seg == 1) Pill("No marks", Orange)
                        }
                    }
                }
            }
        }
        if (canManageExams(vm)) {
            FloatingActionButton(
                onClick = { vm.go(Screen.ExamEdit()) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
            ) { Icon(Icons.Filled.Add, "Create exam") }
        }
    }
}

@Composable
fun ExamEditScreen(vm: AppViewModel, examId: String) {
    val existing = vm.exam(examId)
    var name by remember { mutableStateOf(existing?.name.orEmpty()) }
    var batchId by remember { mutableStateOf(existing?.batchId.orEmpty()) }
    var subject by remember { mutableStateOf(existing?.subject.orEmpty()) }
    var date by remember { mutableStateOf(existing?.date ?: D.today()) }
    var maxMarks by remember { mutableStateOf((existing?.maxMarks ?: 100L).toString()) }
    var confirmDelete by remember { mutableStateOf(false) }

    Page(if (existing == null) "Create Exam" else "Edit Exam", vm::back) {
        FormColumn {
            Field("Exam name (e.g. Monthly Test - Oct)", name, { name = it })
            PickerField(
                "Batch", vm.batch(batchId)?.name.orEmpty(), vm.myBatches.map { it.id to it.name },
                { batchId = it; if (subject.isBlank()) subject = vm.batch(it)?.subject.orEmpty() },
                enabled = existing == null
            )
            DropdownField("Subject", subject, AppConfig.SUBJECTS, { subject = AppConfig.SUBJECTS[it] })
            DateField("Exam date", date, { date = it })
            Field("Maximum marks", maxMarks, { maxMarks = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
            PrimaryButton("Save", onClick = {
                val b = vm.batch(batchId)
                val mm = maxMarks.toLongOrNull() ?: 0L
                if (name.isBlank() || b == null) {
                    vm.toast("Enter exam name and select a batch")
                } else if (mm <= 0L) {
                    vm.toast("Enter maximum marks")
                } else {
                    val e = (existing ?: Exam()).copy(
                        name = name.trim(), batchId = b.id, batchName = b.name,
                        subject = subject.ifBlank { b.subject }, date = date, maxMarks = mm
                    )
                    vm.op("Saved", { if (existing == null) vm.replace(Screen.ExamDetail(e.id)) else vm.back() }) {
                        Repo.put("exams", e)
                    }
                }
            }, busy = vm.busy)
            if (existing != null) DangerTextButton("Delete exam") { confirmDelete = true }
        }
    }
    if (confirmDelete && existing != null) {
        ConfirmDialog("Delete exam?", "The exam and all its marks will be removed.", "Delete", {
            vm.op("Deleted", { vm.back(); vm.back() }) {
                val marks = Repo.marksOnce(existing.id)
                marks.forEach { Repo.delete("marks", it) }
                Repo.delete("exams", existing.id)
            }
        }) { confirmDelete = false }
    }
}

private fun digits(s: String) = s.filter { it.isDigit() }

private fun normRoll(s: String): String {
    val t = s.trim().removeSuffix(".0")
    return t.trimStart('0').lowercase()
}

/** Fills [entries] from spreadsheet rows. Returns (matched, total data rows). */
private fun importMarks(rows: List<List<String>>, students: List<UserProfile>, entries: MutableMap<String, String>): Pair<Int, Int> {
    if (rows.isEmpty()) return 0 to 0
    val header = rows[0].map { it.lowercase() }
    fun idx(vararg keys: String) = header.indexOfFirst { h -> keys.any { h.contains(it) } }
    var cMobile = idx("mobile", "phone", "contact", "login")
    var cRoll = idx("roll")
    var cName = idx("name")
    var cMarks = idx("mark", "score", "obtained", "total")
    val hasHeader = cMarks >= 0 || cMobile >= 0 || cRoll >= 0 || cName >= 0
    val data: List<List<String>>
    if (hasHeader) {
        data = rows.drop(1)
        if (cMarks < 0) cMarks = header.lastIndex
    } else {
        data = rows
        cMobile = 0
        cMarks = 1
    }
    var matched = 0
    for (r in data) {
        val markText = r.getOrNull(cMarks).orEmpty().trim()
        if (markText.isEmpty()) continue
        var student: UserProfile? = null
        if (cMobile >= 0) {
            val m = digits(r.getOrNull(cMobile).orEmpty()).takeLast(10)
            if (m.length >= 5) student = students.firstOrNull { digits(it.mobile).takeLast(10) == m }
        }
        if (student == null && cRoll >= 0) {
            val roll = normRoll(r.getOrNull(cRoll).orEmpty())
            if (roll.isNotEmpty()) student = students.firstOrNull { normRoll(it.rollNo) == roll }
        }
        if (student == null && cName >= 0) {
            val nm = r.getOrNull(cName).orEmpty().trim()
            if (nm.isNotEmpty()) student = students.firstOrNull { it.name.equals(nm, ignoreCase = true) }
        }
        if (student == null) continue
        val lower = markText.lowercase()
        if (lower == "ab" || lower == "absent" || lower == "a") {
            entries[student.id] = "AB"
            matched++
        } else {
            val d = markText.replace(",", ".").toDoubleOrNull()
            if (d != null) {
                entries[student.id] = fmtMarks(d)
                matched++
            }
        }
    }
    return matched to data.size
}

@Composable
fun ExamDetailScreen(vm: AppViewModel, examId: String) {
    val exam = vm.exam(examId)
    val ctx = LocalContext.current
    if (exam == null) {
        Page("Exam", vm::back) { EmptyState("Exam not found") }
        return
    }
    val canEdit = canManageExams(vm) && (vm.role != Role.TEACHER || vm.myBatches.any { it.id == exam.batchId })
    val students = vm.studentsOf(exam.batchId)
    val saved by remember(examId) { Repo.marksByExam(examId) }.collectAsState(initial = emptyList())
    val entries = remember(examId) { mutableStateMapOf<String, String>() }
    LaunchedEffect(saved) {
        saved.forEach { m ->
            if (entries[m.studentId] == null) entries[m.studentId] = if (m.absent) "AB" else fmtMarks(m.marks)
        }
    }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            vm.op {
                val rows = withContext(Dispatchers.IO) { Tables.read(ctx, uri) }
                val (matched, total) = importMarks(rows, students, entries)
                vm.toast("Matched $matched of $total rows. Check the marks and tap Save.")
            }
        }
    }
    val ranked = saved.filter { !it.absent }.sortedByDescending { it.marks }

    Page(
        exam.name, vm::back,
        actions = {
            if (canEdit) IconButton(onClick = { vm.go(Screen.ExamEdit(exam.id)) }) { Icon(Icons.Filled.Edit, "Edit") }
        }
    ) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                AppCard {
                    Text(exam.batchName, fontWeight = FontWeight.Bold)
                    Text(exam.subject + " · " + D.pretty(exam.date) + " · Max " + exam.maxMarks, color = Grey, fontSize = 13.sp)
                }
            }
            if (exam.appeared > 0) {
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatTile("Average", fmtMarks(Math.round(exam.average * 10) / 10.0), Indigo, Modifier.weight(1f))
                        StatTile("Highest", fmtMarks(exam.highest), Green, Modifier.weight(1f))
                        StatTile("Appeared", exam.appeared.toString(), Blue, Modifier.weight(1f))
                    }
                }
            }
            if (canEdit) {
                item {
                    OutlinedButton(
                        onClick = {
                            picker.launch(
                                arrayOf(
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                    "text/csv", "text/comma-separated-values", "text/plain",
                                    "application/vnd.ms-excel", "application/octet-stream"
                                )
                            )
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Filled.UploadFile, null)
                        Text("  Upload Excel / CSV")
                    }
                }
                item {
                    Text(
                        "File columns: Mobile (or Roll No / Name) and Marks. Use AB for absent. Download your Excel as .xlsx or .csv.",
                        color = Grey, fontSize = 12.sp
                    )
                }
            }
            if (students.isEmpty()) item { Text("No students in this batch yet", color = Grey) }
            items(students) { s ->
                val t = entries[s.id].orEmpty()
                val rank = ranked.indexOfFirst { it.studentId == s.id } + 1
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(s.name, fontWeight = FontWeight.SemiBold)
                            Text(
                                (if (s.rollNo.isNotBlank()) "Roll " + s.rollNo else "") + (if (rank > 0) "  ·  Rank $rank" else ""),
                                color = Grey, fontSize = 12.sp
                            )
                        }
                        if (canEdit) {
                            val ab = t.equals("AB", ignoreCase = true)
                            Box(Modifier.clickable { entries[s.id] = if (ab) "" else "AB" }.padding(8.dp)) {
                                Pill("AB", if (ab) com.aspirescience.academy.ui.theme.Red else Grey)
                            }
                            OutlinedTextField(
                                value = if (ab) "" else t, onValueChange = { v -> entries[s.id] = v.filter { c -> c.isDigit() || c == '.' } },
                                enabled = !ab, singleLine = true, modifier = Modifier.width(96.dp),
                                placeholder = { Text("/ " + exam.maxMarks, fontSize = 12.sp) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                            )
                        } else {
                            Text(t.ifEmpty { "-" }, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
            if (canEdit && students.isNotEmpty()) {
                item {
                    PrimaryButton("Save marks", onClick = {
                        val maxM = exam.maxMarks.toDouble()
                        val bad = students.firstOrNull { s ->
                            val t = entries[s.id].orEmpty().trim()
                            if (t.isEmpty() || t.equals("AB", ignoreCase = true)) false
                            else {
                                val d = t.toDoubleOrNull()
                                d == null || d < 0 || d > maxM
                            }
                        }
                        if (bad != null) {
                            vm.toast("Check the marks of " + bad.name)
                        } else {
                            vm.op("Marks saved") {
                                val list = ArrayList<Mark>()
                                val scores = ArrayList<Double>()
                                for (s in students) {
                                    val t = entries[s.id].orEmpty().trim()
                                    if (t.isEmpty()) continue
                                    val absent = t.equals("AB", ignoreCase = true)
                                    val v = if (absent) 0.0 else (t.toDoubleOrNull() ?: 0.0)
                                    if (!absent) scores.add(v)
                                    list.add(
                                        Mark(
                                            id = exam.id + "_" + s.id, examId = exam.id, examName = exam.name,
                                            subject = exam.subject, date = exam.date, maxMarks = exam.maxMarks,
                                            batchId = exam.batchId, studentId = s.id, studentName = s.name,
                                            marks = v, absent = absent
                                        )
                                    )
                                }
                                Repo.putAll("marks", list)
                                for (m in saved) {
                                    if (entries[m.studentId].orEmpty().isBlank()) Repo.delete("marks", m.id)
                                }
                                Repo.put(
                                    "exams",
                                    exam.copy(
                                        average = if (scores.isEmpty()) 0.0 else scores.sum() / scores.size,
                                        highest = scores.maxOrNull() ?: 0.0,
                                        appeared = scores.size.toLong()
                                    )
                                )
                            }
                        }
                    }, busy = vm.busy)
                }
            }
        }
    }
}
