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

@Composable
fun ResultsContent(vm: AppViewModel, studentId: String) {
    val marks by remember(studentId) { Repo.marksByStudent(studentId) }.collectAsState(initial = emptyList())
    val sorted = marks.sortedByDescending { it.date }
    val scored = marks.filter { !it.absent && it.maxMarks > 0 }
    val overall = if (scored.isEmpty()) 0 else (scored.sumOf { it.marks * 100.0 / it.maxMarks } / scored.size).toInt()

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PAD, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Overall average", if (scored.isEmpty()) "-" else "$overall%", Indigo, Modifier.weight(1f))
                StatTile("Exams", marks.size.toString(), Green, Modifier.weight(1f))
            }
        }
        if (sorted.isEmpty()) item { Text("No results yet", color = Grey) }
        if (scored.size >= 2) {
            item {
                AppCard {
                    Text("Progress", fontWeight = FontWeight.Bold)
                    Text("Percentage in your last exams", color = Grey, fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
                    TrendChart(scored.sortedBy { it.date }.takeLast(8).map { D.shortDate(it.date) to it.marks * 100.0 / it.maxMarks })
                }
            }
        }
        if (scored.isNotEmpty()) {
            item {
                AppCard {
                    Text("Subject-wise average", fontWeight = FontWeight.Bold)
                    scored.groupBy { it.subject.ifBlank { "Other" } }.forEach { (subject, list) ->
                        val avg = list.sumOf { it.marks * 100.0 / it.maxMarks } / list.size
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
        items(sorted) { m ->
            val exam = vm.exam(m.examId)
            val pct = if (m.maxMarks > 0) (m.marks * 100.0 / m.maxMarks) else 0.0
            AppCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(m.examName, fontWeight = FontWeight.Bold)
                        Text(m.subject + " · " + D.shortDate(m.date), color = Grey, fontSize = 13.sp)
                    }
                    if (m.absent) {
                        Pill("Absent", Red)
                    } else {
                        Text(
                            fmtMarks(m.marks) + " / " + m.maxMarks, fontWeight = FontWeight.Bold, fontSize = 18.sp,
                            color = if (pct >= 40) Indigo else Red
                        )
                    }
                }
                if (!m.absent) {
                    LinearProgressIndicator(
                        progress = { (pct / 100.0).toFloat().coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(6.dp),
                        color = if (pct >= 40) Indigo else Red,
                        trackColor = Color(0xFFE5E7EB)
                    )
                    Text(
                        "%.0f%%".format(pct) +
                            (if (exam != null && exam.appeared > 0) "   ·   Class avg " + fmtMarks(Math.round(exam.average * 10) / 10.0) + "   ·   Highest " + fmtMarks(exam.highest) else ""),
                        color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
}
