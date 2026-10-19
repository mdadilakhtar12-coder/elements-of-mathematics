@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.exam

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.Exam
import com.aspirescience.academy.data.Mark
import com.aspirescience.academy.data.Paper
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
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.common.Segmented
import com.aspirescience.academy.ui.common.StatTile
import com.aspirescience.academy.ui.student.fmtMarks
import com.aspirescience.academy.ui.theme.Blue
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D
import com.aspirescience.academy.util.Messages
import com.aspirescience.academy.util.Messenger
import com.aspirescience.academy.util.Share
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private fun canManageExams(vm: AppViewModel) = vm.can(Perm.EXAMS) || vm.role == Role.TEACHER

private fun key(studentId: String, subject: String) = studentId + "|" + subject

private class Tot(val obtained: Double, val max: Long) {
    val pct: Double get() = if (max > 0) obtained * 100.0 / max else 0.0
}

/** Total of one student over the papers that have a mark (absent papers are left out). */
private fun total(studentId: String, papers: List<Paper>, entries: Map<String, String>): Tot {
    var o = 0.0
    var m = 0L
    for (p in papers) {
        val t = entries[key(studentId, p.subject)].orEmpty().trim()
        val v = t.toDoubleOrNull() ?: continue
        o += v
        m += p.maxMarks
    }
    return Tot(o, m)
}

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
                                Text(D.pretty(e.date) + " - Total " + e.totalMax(), color = Grey, fontSize = 13.sp)
                                Text(e.paperList().joinToString(", ") { it.subject }, color = Grey, fontSize = 12.sp)
                            }
                            if (e.appeared > 0) Pill("Avg " + Math.round(e.avgPct()) + "%", Green)
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
    var date by remember { mutableStateOf(existing?.date ?: D.today()) }
    var papers by remember { mutableStateOf(existing?.paperList() ?: emptyList()) }
    var confirmDelete by remember { mutableStateOf(false) }

    fun update(i: Int, f: (Paper) -> Paper) {
        papers = papers.mapIndexed { j, p -> if (j == i) f(p) else p }
    }

    Page(if (existing == null) "Create Exam" else "Edit Exam", vm::back) {
        FormColumn {
            Field("Exam name (e.g. Unit Test 1, Half Yearly)", name, { name = it })
            PickerField(
                "Batch", vm.batch(batchId)?.name.orEmpty(), vm.myBatches.map { it.id to it.name },
                { batchId = it }, enabled = existing == null
            )
            DateField("Exam date", date, { date = it })
            SectionTitle("Papers and marks")
            Text(
                "Add a paper for every subject of this exam. Each paper has its own maximum marks. " +
                    "Biology can be split into Botany and Zoology.",
                color = Grey, fontSize = 13.sp
            )
            papers.forEachIndexed { i, p ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    DropdownField(
                        "Subject", p.subject, AppConfig.SUBJECTS,
                        { k -> update(i) { x -> x.copy(subject = AppConfig.SUBJECTS[k]) } },
                        Modifier.weight(1f)
                    )
                    Field(
                        "Marks", if (p.maxMarks > 0) p.maxMarks.toString() else "",
                        { t -> update(i) { x -> x.copy(maxMarks = t.filter { c -> c.isDigit() }.toLongOrNull() ?: 0L) } },
                        Modifier.width(92.dp), KeyboardType.Number
                    )
                    IconButton(onClick = { papers = papers.filterIndexed { j, _ -> j != i } }) { Icon(Icons.Filled.Close, "Remove paper") }
                }
            }
            val batchPlans = vm.batch(batchId)?.plans().orEmpty()
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = { papers = papers + Paper("", 50) }, modifier = Modifier.weight(1f)) { Text("Add paper") }
                if (batchPlans.isNotEmpty()) {
                    OutlinedButton(
                        onClick = {
                            val names = batchPlans.map { it.subject }.filter { it.isNotBlank() }.flatMap {
                                if (it == "Biology") listOf("Botany", "Zoology") else listOf(it)
                            }
                            papers = names.map { n -> Paper(n, papers.firstOrNull()?.maxMarks ?: 50L) }
                        },
                        modifier = Modifier.weight(1f)
                    ) { Text("All batch subjects") }
                }
            }
            if (papers.isNotEmpty()) {
                Text("Set the same marks for every paper:", color = Grey, fontSize = 12.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(30L, 50L, 100L).forEach { m ->
                        OutlinedButton(onClick = { papers = papers.map { it.copy(maxMarks = m) } }) { Text(m.toString()) }
                    }
                }
                Text("Total marks: " + papers.sumOf { it.maxMarks }, fontWeight = FontWeight.SemiBold)
            }
            PrimaryButton("Save", onClick = {
                val b = vm.batch(batchId)
                if (name.isBlank() || b == null) {
                    vm.toast("Enter the exam name and select a batch")
                } else if (papers.isEmpty() || papers.any { it.subject.isBlank() }) {
                    vm.toast("Add at least one paper and choose a subject for each")
                } else if (papers.map { it.subject }.toSet().size != papers.size) {
                    vm.toast("Each subject can be added only once")
                } else if (papers.any { it.maxMarks <= 0L }) {
                    vm.toast("Enter the maximum marks of every paper")
                } else {
                    val e = (existing ?: Exam()).copy(
                        name = name.trim(), batchId = b.id, batchName = b.name, date = date, papers = papers,
                        subject = papers.joinToString(", ") { it.subject }, maxMarks = papers.sumOf { it.maxMarks }
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
                Repo.rebuildLeaderboard(existing.batchId, existing.batchName)
            }
        }) { confirmDelete = false }
    }
}

private fun digits(s: String) = s.filter { it.isDigit() }

private fun normRoll(s: String): String = s.trim().removeSuffix(".0").trimStart('0').lowercase()

/**
 * Fills [entries] from spreadsheet rows. Columns named like the papers (Physics, Chemistry...) are read for all
 * papers; a single "Marks" column fills the paper that is open ([current]). Returns (rows matched, data rows).
 */
private fun importMarks(
    rows: List<List<String>>,
    students: List<UserProfile>,
    papers: List<Paper>,
    current: Paper?,
    entries: MutableMap<String, String>
): Pair<Int, Int> {
    if (rows.isEmpty()) return 0 to 0
    val header = rows[0].map { it.lowercase().trim() }
    fun idx(vararg keys: String) = header.indexOfFirst { h -> keys.any { h.contains(it) } }
    val cMobile = idx("mobile", "phone", "contact", "login")
    val cRoll = idx("roll")
    val cName = idx("name")
    val paperCols = papers.associateWith { p -> header.indexOfFirst { h -> h == p.subject.lowercase() || h.startsWith(p.subject.lowercase()) } }
        .filter { it.value >= 0 }
    val cMarks = idx("mark", "score", "obtained")
    val data = rows.drop(1)
    var matched = 0
    for (r in data) {
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
        val st = student ?: continue
        var any = false
        fun put(p: Paper, text: String) {
            val t = text.trim()
            if (t.isEmpty()) return
            val lower = t.lowercase()
            if (lower == "ab" || lower == "absent" || lower == "a") {
                entries[key(st.id, p.subject)] = "AB"
                any = true
            } else {
                val d = t.replace(",", ".").toDoubleOrNull()
                if (d != null) {
                    entries[key(st.id, p.subject)] = fmtMarks(d)
                    any = true
                }
            }
        }
        if (paperCols.isNotEmpty()) {
            for ((p, c) in paperCols) put(p, r.getOrNull(c).orEmpty())
        } else if (cMarks >= 0 && current != null) {
            put(current, r.getOrNull(cMarks).orEmpty())
        }
        if (any) matched++
    }
    return matched to data.size
}

@Composable
private fun MarksCell(value: String, onChange: (String) -> Unit, max: Long, modifier: Modifier = Modifier.width(96.dp)) {
    OutlinedTextField(
        value = value,
        onValueChange = { v -> onChange(v.filter { c -> c.isDigit() || c == '.' || c in "abAB" }.uppercase()) },
        singleLine = true, modifier = modifier,
        placeholder = { Text("/ $max", fontSize = 12.sp) },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii)
    )
}

@Composable
fun ExamDetailScreen(vm: AppViewModel, examId: String) {
    val exam = vm.exam(examId)
    val ctx = LocalContext.current
    if (exam == null) {
        Page("Exam", vm::back) { EmptyState("Exam not found") }
        return
    }
    val papers = exam.paperList()
    val canEdit = canManageExams(vm) && (vm.role != Role.TEACHER || vm.myBatches.any { it.id == exam.batchId })
    val students = vm.studentsOf(exam.batchId)
    val saved by remember(examId) { Repo.marksByExam(examId) }.collectAsState(initial = emptyList())
    val entries = remember(examId) { mutableStateMapOf<String, String>() }
    var view by remember { mutableStateOf(0) } // 0 = overview, i = paper i - 1
    var editStudent by remember { mutableStateOf<UserProfile?>(null) }
    LaunchedEffect(saved) {
        saved.forEach { m ->
            val k = key(m.studentId, m.subject)
            if (entries[k] == null) entries[k] = if (m.absent) "AB" else fmtMarks(m.marks)
        }
    }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) {
            vm.op {
                val rows = withContext(Dispatchers.IO) { Tables.read(ctx, uri) }
                val cur = if (view > 0) papers.getOrNull(view - 1) else null
                val (matched, total) = importMarks(rows, students, papers, cur, entries)
                if (matched == 0 && view == 0) {
                    vm.toast("No marks found. Name the columns like the subjects, for example Physics, Chemistry.")
                } else {
                    vm.toast("Matched $matched of $total rows. Check the marks and tap Save marks.")
                }
            }
        }
    }

    fun firstProblem(): String? {
        for (s in students) for (p in papers) {
            val t = entries[key(s.id, p.subject)].orEmpty().trim()
            if (t.isEmpty() || t.equals("AB", ignoreCase = true)) continue
            val d = t.toDoubleOrNull()
            if (d == null || d < 0 || d > p.maxMarks) return s.name + " - " + p.subject
        }
        return null
    }

    fun saveMarks(who: List<UserProfile>, done: () -> Unit) {
        val bad = firstProblem()
        if (bad != null) {
            vm.toast("Check the marks of $bad")
            return
        }
        vm.op("Marks saved", done) {
            val list = ArrayList<Mark>()
            for (s in who) for (p in papers) {
                val t = entries[key(s.id, p.subject)].orEmpty().trim()
                if (t.isEmpty()) continue
                val absent = t.equals("AB", ignoreCase = true)
                val oldId = saved.firstOrNull { it.studentId == s.id && it.subject == p.subject }?.id
                list.add(
                    Mark(
                        id = oldId ?: (exam.id + "_" + s.id + "_" + p.subject.filter { it.isLetterOrDigit() }),
                        examId = exam.id, examName = exam.name, subject = p.subject, date = exam.date,
                        maxMarks = p.maxMarks, batchId = exam.batchId, studentId = s.id, studentName = s.name,
                        marks = if (absent) 0.0 else (t.toDoubleOrNull() ?: 0.0), absent = absent
                    )
                )
            }
            Repo.putAll("marks", list)
            for (m in saved) {
                if (m.studentId in who.map { it.id } && entries[key(m.studentId, m.subject)].orEmpty().isBlank()) {
                    Repo.delete("marks", m.id)
                }
            }
            val pcts = students.map { total(it.id, papers, entries) }.filter { it.max > 0 }.map { it.pct }
            Repo.put(
                "exams",
                exam.copy(
                    average = if (pcts.isEmpty()) 0.0 else pcts.average(),
                    highest = pcts.maxOrNull() ?: 0.0,
                    appeared = pcts.size.toLong()
                )
            )
            Repo.rebuildLeaderboard(exam.batchId, exam.batchName)
        }
    }

    val rows = students.map { it to total(it.id, papers, entries) }
    val ranked = rows.filter { it.second.max > 0 }.sortedByDescending { it.second.pct }
    val rankOf = ranked.mapIndexed { i, r -> r.first.id to (i + 1) }.toMap()
    val ordered = ranked + rows.filter { it.second.max == 0L }

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
                    Text(D.pretty(exam.date) + " - Total " + exam.totalMax() + " marks", color = Grey, fontSize = 13.sp)
                }
            }
            item {
                Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (listOf("Overview") + papers.map { it.subject + " (" + it.maxMarks + ")" }).forEachIndexed { i, label ->
                        Box(
                            Modifier.background(if (view == i) Indigo else Color(0xFFE5E7EB), RoundedCornerShape(50))
                                .clickable { view = i }.padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(label, color = if (view == i) Color.White else Color(0xFF374151), fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }
                    }
                }
            }
            if (canEdit) {
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = {
                                picker.launch(
                                    arrayOf(
                                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        "text/csv", "text/comma-separated-values", "text/plain", "application/octet-stream"
                                    )
                                )
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Filled.UploadFile, null)
                            Text("  Upload Excel / CSV")
                        }
                        TextButton(onClick = {
                            val dir = java.io.File(ctx.cacheDir, "reports")
                            dir.mkdirs()
                            val f = java.io.File(dir, "marks-sample.csv")
                            val head = "Name,Mobile," + papers.joinToString(",") { it.subject }
                            val lines = students.take(3).joinToString("\n") { s ->
                                s.name + "," + s.mobile + "," + papers.joinToString(",") { "" }
                            }
                            f.writeText(head + "\n" + lines + "\n")
                            Share.file(ctx, f, "text/csv", "Sample file")
                        }) { Text("Sample file") }
                    }
                }
                item {
                    Text(
                        "File: first row has headings. Use Mobile (or Roll No or Name) and one column per subject, " +
                            "named like the papers. Write AB for absent.",
                        color = Grey, fontSize = 12.sp
                    )
                }
            }

            if (view == 0) {
                if (exam.appeared > 0) {
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            StatTile("Average", Math.round(exam.avgPct()).toString() + "%", Indigo, Modifier.weight(1f))
                            StatTile("Highest", Math.round(exam.highestPct()).toString() + "%", Green, Modifier.weight(1f))
                            StatTile("Appeared", exam.appeared.toString(), Blue, Modifier.weight(1f))
                        }
                    }
                }
                if (students.isEmpty()) item { Text("No students in this batch yet", color = Grey) }
                items(ordered) { (s, t) ->
                    val rank = rankOf[s.id] ?: 0
                    AppCard(onClick = if (canEdit) ({ editStudent = s }) else null) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text((if (rank > 0) "#$rank  " else "") + s.name, fontWeight = FontWeight.SemiBold)
                                Text(
                                    papers.joinToString("   ") { p ->
                                        val v = entries[key(s.id, p.subject)].orEmpty()
                                        p.subject.take(4) + " " + v.ifEmpty { "-" }
                                    },
                                    color = Grey, fontSize = 11.sp
                                )
                            }
                            if (t.max > 0) {
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(fmtMarks(t.obtained) + " / " + t.max, fontWeight = FontWeight.Bold, color = Indigo)
                                    Text(Math.round(t.pct).toString() + "%", color = if (t.pct >= 40) Green else Red, fontSize = 12.sp)
                                }
                            } else {
                                Text("No marks", color = Grey, fontSize = 12.sp)
                            }
                        }
                        if (t.max > 0 && canEdit) {
                            TextButton(onClick = {
                                Messenger.whatsapp(ctx, s.parentMobile.ifBlank { s.mobile }, Messages.result(s.name, exam.name, fmtMarks(t.obtained), t.max))
                            }) { Text("Send result to parent", fontSize = 12.sp) }
                        }
                    }
                }
                if (canEdit) item { Text("Tap a student to enter or change the marks of all papers.", color = Grey, fontSize = 12.sp) }
            } else {
                val paper = papers[view - 1]
                items(students) { s ->
                    val t = entries[key(s.id, paper.subject)].orEmpty()
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(s.name, fontWeight = FontWeight.SemiBold)
                                if (s.rollNo.isNotBlank()) Text("Roll " + s.rollNo, color = Grey, fontSize = 12.sp)
                            }
                            if (canEdit) {
                                val ab = t.equals("AB", ignoreCase = true)
                                Box(Modifier.clickable { entries[key(s.id, paper.subject)] = if (ab) "" else "AB" }.padding(8.dp)) {
                                    Pill("AB", if (ab) Red else Grey)
                                }
                                MarksCell(if (ab) "" else t, { v -> entries[key(s.id, paper.subject)] = v }, paper.maxMarks)
                            } else {
                                Text(t.ifEmpty { "-" }, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
            if (canEdit && students.isNotEmpty()) {
                item { PrimaryButton("Save marks", onClick = { saveMarks(students) {} }, busy = vm.busy) }
            }
        }
    }

    val es = editStudent
    if (es != null) {
        AlertDialog(
            onDismissRequest = { editStudent = null },
            title = { Text(es.name) },
            text = {
                Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    papers.forEach { p ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(p.subject, fontWeight = FontWeight.Medium)
                                Text("Max " + p.maxMarks, color = Grey, fontSize = 11.sp)
                            }
                            MarksCell(entries[key(es.id, p.subject)].orEmpty(), { v -> entries[key(es.id, p.subject)] = v }, p.maxMarks)
                        }
                    }
                    val t = total(es.id, papers, entries)
                    Text(
                        "Total " + fmtMarks(t.obtained) + " / " + t.max + "   (" + Math.round(t.pct) + "%)",
                        fontWeight = FontWeight.Bold, color = Indigo
                    )
                    Text("Write AB for absent.", color = Grey, fontSize = 11.sp)
                }
            },
            confirmButton = { TextButton(onClick = { saveMarks(listOf(es)) { editStudent = null } }) { Text("Save") } },
            dismissButton = { TextButton(onClick = { editStudent = null }) { Text("Cancel") } }
        )
    }
}
