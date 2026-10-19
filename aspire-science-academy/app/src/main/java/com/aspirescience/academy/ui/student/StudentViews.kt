@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.student

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.common.StatTile
import com.aspirescience.academy.ui.common.TrendChart
import com.aspirescience.academy.ui.common.BarChart
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D

private val PAD = PaddingValues(16.dp, 12.dp, 16.dp, 32.dp)

fun fmtMarks(d: Double): String = if (d % 1.0 == 0.0) d.toLong().toString() else d.toString()

@Composable
fun AttendanceContent(vm: AppViewModel, studentId: String) {
    val att by remember(studentId) { Repo.attendanceByStudent(studentId) }.collectAsState(initial = emptyList())
    val present = att.count { it.status == "P" }
    val late = att.count { it.status == "L" }
    val absent = att.count { it.status == "A" }
    val pct = if (att.isEmpty()) 0 else (present + late) * 100 / att.size
    val groups = att.sortedByDescending { it.date }.groupBy { it.date.take(7) }

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PAD, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Attendance", if (att.isEmpty()) "-" else "$pct%", if (pct >= 75 || att.isEmpty()) Green else Red, Modifier.weight(1f))
                StatTile("Present", present.toString(), Green, Modifier.weight(1f))
                StatTile("Late", late.toString(), Orange, Modifier.weight(1f))
                StatTile("Absent", absent.toString(), Red, Modifier.weight(1f))
            }
        }
        if (att.isEmpty()) item { Text("No attendance recorded yet", color = Grey) }
        if (groups.size >= 2) {
            item {
                AppCard {
                    Text("Month-wise attendance", fontWeight = FontWeight.Bold)
                    Column(Modifier.padding(top = 8.dp)) {
                        BarChart(
                            groups.entries.toList().reversed().takeLast(6).map { (m, l) ->
                                D.monthLabel(m).take(3) to (l.count { it.status != "A" } * 100 / l.size)
                            }
                        ) { if (it >= 75) Green else if (it >= 50) Orange else Red }
                    }
                }
            }
        }
        groups.forEach { (month, list) ->
            item { SectionTitle(D.monthLabel(month)) }
            items(list) { a ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(D.pretty(a.date), fontWeight = FontWeight.SemiBold)
                            Text(a.subject.ifBlank { a.batchName }, color = Grey, fontSize = 13.sp)
                        }
                        Pill(
                            when (a.status) { "P" -> "Present"; "A" -> "Absent"; else -> "Late" },
                            when (a.status) { "P" -> Green; "A" -> Red; else -> Orange }
                        )
                    }
                }
            }
        }
    }
}

private fun pctOf(ms: List<com.aspirescience.academy.data.Mark>): Double? {
    val ok = ms.filter { !it.absent && it.maxMarks > 0 }
    val mx = ok.sumOf { it.maxMarks }
    return if (mx > 0) ok.sumOf { it.marks } * 100.0 / mx else null
}

@Composable
fun ResultsContent(vm: AppViewModel, studentId: String) {
    val marks by remember(studentId) { Repo.marksByStudent(studentId) }.collectAsState(initial = emptyList())
    val exams = marks.groupBy { it.examId }.values.sortedByDescending { it.first().date }
    val pcts = exams.mapNotNull { pctOf(it) }
    val overall = if (pcts.isEmpty()) 0 else pcts.average().toInt()
    val scored = marks.filter { !it.absent && it.maxMarks > 0 }

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PAD, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Overall average", if (pcts.isEmpty()) "-" else "$overall%", Indigo, Modifier.weight(1f))
                StatTile("Exams", exams.size.toString(), Green, Modifier.weight(1f))
            }
        }
        if (exams.isEmpty()) item { Text("No results yet", color = Grey) }
        if (pcts.size >= 2) {
            item {
                AppCard {
                    Text("Progress", fontWeight = FontWeight.Bold)
                    Text("Total percentage in your last exams", color = Grey, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
                    TrendChart(exams.reversed().takeLast(8).mapNotNull { g -> pctOf(g)?.let { D.shortDate(g.first().date) to it } })
                }
            }
        }
        if (scored.isNotEmpty()) {
            item {
                AppCard {
                    Text("Subject-wise average", fontWeight = FontWeight.Bold)
                    scored.groupBy { AppConfig.groupOf(it.subject.ifBlank { "Other" }) }.forEach { (subject, list) ->
                        val avg = list.sumOf { it.marks } * 100.0 / list.sumOf { it.maxMarks }
                        Row(Modifier.fillMaxWidth().padding(top = 10.dp)) {
                            Text(subject, modifier = Modifier.weight(1f), fontSize = 13.sp)
                            Text(Math.round(avg).toString() + "%", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }
                        LinearProgressIndicator(
                            progress = { (avg / 100.0).toFloat().coerceIn(0f, 1f) },
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp).height(6.dp),
                            color = if (avg >= 60) Indigo else if (avg >= 40) Orange else Red,
                            trackColor = Color(0xFFE5E7EB)
                        )
                    }
                }
            }
        }
        val profile = vm.me?.takeIf { it.id == studentId } ?: vm.user(studentId)
        if (profile != null) {
            item {
                androidx.compose.material3.OutlinedButton(onClick = { vm.reportCard(profile) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Share report card (PDF)")
                }
            }
        }
        items(exams) { g ->
            val first = g.first()
            val exam = vm.exam(first.examId)
            val ok = g.filter { !it.absent && it.maxMarks > 0 }
            val obtained = ok.sumOf { it.marks }
            val max = ok.sumOf { it.maxMarks }
            val pct = pctOf(g)
            AppCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(first.examName, fontWeight = FontWeight.Bold)
                        Text(D.shortDate(first.date) + (if (g.size > 1) " - " + g.size + " papers" else ""), color = Grey, fontSize = 13.sp)
                    }
                    if (pct == null) {
                        Pill("Absent", Red)
                    } else {
                        Text(fmtMarks(obtained) + " / " + max, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = if (pct >= 40) Indigo else Red)
                    }
                }
                if (pct != null) {
                    LinearProgressIndicator(
                        progress = { (pct / 100.0).toFloat().coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(6.dp),
                        color = if (pct >= 40) Indigo else Red,
                        trackColor = Color(0xFFE5E7EB)
                    )
                    Text(
                        Math.round(pct).toString() + "%" +
                            (if (exam != null && exam.appeared > 0) "   -   Class avg " + Math.round(exam.avgPct()) + "%   -   Highest " + Math.round(exam.highestPct()) + "%" else ""),
                        color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp)
                    )
                }
                // subject lines, Botany + Zoology shown together as Biology
                g.sortedBy { it.subject }.groupBy { AppConfig.groupOf(it.subject) }.forEach { (group, list) ->
                    if (list.size > 1) {
                        val o = list.filter { !it.absent }.sumOf { it.marks }
                        val m = list.filter { !it.absent }.sumOf { it.maxMarks }
                        Row(Modifier.fillMaxWidth().padding(top = 8.dp)) {
                            Text(group, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, modifier = Modifier.weight(1f))
                            Text(fmtMarks(o) + " / " + m, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }
                    }
                    list.forEach { mk ->
                        Row(Modifier.fillMaxWidth().padding(top = if (list.size > 1) 2.dp else 8.dp, start = if (list.size > 1) 14.dp else 0.dp)) {
                            Text(mk.subject, color = if (list.size > 1) Grey else Color.Unspecified, fontSize = 13.sp, modifier = Modifier.weight(1f))
                            Text(
                                if (mk.absent) "Absent" else fmtMarks(mk.marks) + " / " + mk.maxMarks,
                                color = if (list.size > 1) Grey else Color.Unspecified, fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
