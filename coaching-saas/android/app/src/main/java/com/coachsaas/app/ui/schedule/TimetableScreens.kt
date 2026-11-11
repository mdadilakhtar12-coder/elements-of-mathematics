package com.coachsaas.app.ui.schedule

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import com.coachsaas.app.data.ClassSession
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.Screen
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.Contact
import com.coachsaas.app.ui.common.DateField
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PickerField
import com.coachsaas.app.ui.common.Pill
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.common.SectionTitle
import com.coachsaas.app.ui.common.Segmented
import com.coachsaas.app.ui.common.TimeField
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Orange
import com.coachsaas.app.ui.theme.Red
import com.coachsaas.app.util.D
import com.coachsaas.app.util.Ocr
import com.coachsaas.app.util.Sheets
import com.coachsaas.app.util.TT
import com.coachsaas.app.util.TTEntry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.time.LocalDate

private val SHEET_TYPES = arrayOf(
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv", "text/comma-separated-values", "text/plain", "application/octet-stream"
)

/** Day-by-day timetable: add classes, copy a day, or upload an Excel / photo / PDF with many batches at once. */
@Composable
fun DailyTimetableScreen(vm: AppViewModel) {
    val ctx = LocalContext.current
    var date by rememberSaveable { mutableStateOf(LocalDate.now().plusDays(1).toString()) }
    var copyDialog by remember { mutableStateOf(false) }
    var cameraUri by remember { mutableStateOf<Uri?>(null) }

    val excel = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) vm.op {
            val rows = withContext(Dispatchers.IO) { com.coachsaas.app.data.Tables.read(ctx, uri) }
            vm.timetableFromTable(rows, date)
        }
    }
    val photos = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->
        if (uris.isNotEmpty()) vm.op {
            vm.timetableFromPictures(uris.mapNotNull { Ocr.loadBitmap(ctx, it) }, date)
        }
    }
    val pdf = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) vm.op { vm.timetableFromPictures(Ocr.pdfPages(ctx, uri), date) }
    }
    val camera = rememberLauncherForActivityResult(ActivityResultContracts.TakePicture()) { ok ->
        val u = cameraUri
        if (ok && u != null) vm.op { vm.timetableFromPictures(listOfNotNull(Ocr.loadBitmap(ctx, u)), date) }
    }

    val day = vm.classes.filter { it.date == date }.sortedBy { it.start }
    Page("Daily timetable", vm::back) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                DateField("Date", date, { date = it })
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 4.dp)) {
                    TextButton(onClick = { date = D.today() }) { Text("Today") }
                    TextButton(onClick = { date = LocalDate.now().plusDays(1).toString() }) { Text("Tomorrow") }
                }
            }
            item {
                AppCard {
                    Text("Upload a timetable", fontWeight = FontWeight.Bold)
                    Text(
                        "Many batches at once: an Excel file (most reliable), or a photo / PDF. The app reads it on your phone for free, " +
                            "matches batches and teachers, and shows everything for you to check before saving. " +
                            "Rows without a date use the date above.",
                        color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp)
                    )
                    Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { excel.launch(SHEET_TYPES) }, modifier = Modifier.weight(1f)) { Text("Excel") }
                        OutlinedButton(onClick = { pdf.launch(arrayOf("application/pdf")) }, modifier = Modifier.weight(1f)) { Text("PDF") }
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { photos.launch(arrayOf("image/*")) }, modifier = Modifier.weight(1f)) { Text("Photo") }
                        OutlinedButton(onClick = {
                            val dir = File(ctx.cacheDir, "photos")
                            dir.mkdirs()
                            val f = File(dir, "tt" + System.currentTimeMillis() + ".jpg")
                            val uri = FileProvider.getUriForFile(ctx, ctx.packageName + ".fileprovider", f)
                            cameraUri = uri
                            camera.launch(uri)
                        }, modifier = Modifier.weight(1f)) { Text("Camera") }
                    }
                    TextButton(onClick = {
                        val b = vm.batches.take(2).map { it.name }.ifEmpty { listOf("11th Science A", "12th Commerce") }
                        val t = vm.teachers.take(2).map { it.name }.ifEmpty { listOf("Rahul Verma", "Neha Singh") }
                        val s = vm.subjectList.take(2).ifEmpty { listOf("Physics", "Chemistry") }
                        Sheets.share(
                            ctx, "timetable-format.xlsx",
                            listOf(
                                listOf("Date", "Start", "End", "Batch", "Subject", "Teacher", "Room"),
                                listOf(date, "16:00", "17:00", b[0], s[0], t[0], "3"),
                                listOf(date, "17:00", "18:00", b[0], s.getOrElse(1) { s[0] }, t.getOrElse(1) { t[0] }, ""),
                                listOf(date, "16:00", "17:00", b.getOrElse(1) { b[0] }, s[0], t[0], "Lab A")
                            ),
                            "Timetable upload format"
                        )
                    }) { Text("Download Excel format") }
                    Text(
                        "For a photo: hold the phone straight above the page, good light, printed or clear large writing. " +
                            "Messy handwriting may need corrections.",
                        color = Grey, fontSize = 12.sp
                    )
                }
            }
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { copyDialog = true }, modifier = Modifier.weight(1f)) { Text("Copy from another day") }
                    OutlinedButton(onClick = { vm.go(Screen.ShareTimetable) }, modifier = Modifier.weight(1f)) { Text("Send on WhatsApp") }
                }
            }
            item { SectionTitle("Classes on " + D.pretty(date)) }
            vm.batches.forEach { b ->
                val list = day.filter { it.batchId == b.id }
                item(key = "b" + b.id) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(b.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        TextButton(onClick = { vm.go(Screen.ClassEdit(date = date, batchId = b.id)) }) { Text("+ Add class") }
                    }
                }
                if (list.isEmpty()) item(key = "n" + b.id) { Text("No class", color = Grey, fontSize = 12.sp) }
                items(list, key = { it.id }) { ClassCard(vm, it) }
            }
        }
    }
    if (copyDialog) {
        var from by remember { mutableStateOf(LocalDate.parse(date).minusDays(1).toString()) }
        AlertDialog(
            onDismissRequest = { copyDialog = false },
            title = { Text("Copy classes to " + D.pretty(date)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    DateField("Copy from", from, { from = it })
                    Text("Every class of that day is added here with the same batch, subject, teacher, time and room. Classes already here are kept.", color = Grey, fontSize = 12.sp)
                }
            },
            confirmButton = { TextButton(onClick = { copyDialog = false; vm.copyDay(from, date) {} }) { Text("Copy") } },
            dismissButton = { TextButton(onClick = { copyDialog = false }) { Text("Cancel") } }
        )
    }
}

/** Check what was read from the file / picture, fix mistakes, then save. Nothing is saved before this screen. */
@Composable
fun TimetableReviewScreen(vm: AppViewModel) {
    var editing by remember { mutableStateOf<Int?>(null) }
    val entries = vm.ttEntries
    val ok = entries.count { it.blocking.isEmpty() }
    val problems = entries.count { it.blocking.any { i -> i != TTEntry.EXISTS } }
    val existing = entries.count { TTEntry.EXISTS in it.issues }
    Page("Check timetable", vm::back) {
        Column(Modifier.fillMaxSize()) {
            LazyColumn(
                Modifier.weight(1f),
                contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    Text(
                        entries.size.toString() + " classes found. " + ok + " ready to save" +
                            (if (problems > 0) ", " + problems + " need your attention (red)" else "") +
                            (if (existing > 0) ", " + existing + " already in the timetable" else "") + ". Tap a class to correct it.",
                        fontSize = 13.sp
                    )
                }
                if (vm.ttWarnings.isNotEmpty()) {
                    item {
                        AppCard {
                            Text("Check these clashes (you can still save)", color = Orange, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            vm.ttWarnings.take(12).forEach { Text("- " + it, fontSize = 12.sp) }
                        }
                    }
                }
                itemsIndexed(entries) { i, e ->
                    AppCard(onClick = { editing = i }) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                (if (e.date.isBlank()) "No date" else D.shortDate(e.date)) + "  " +
                                    (if (e.start.isBlank() || e.end.isBlank()) "No time" else D.range(e.start, e.end)),
                                fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f)
                            )
                            if (TTEntry.EXISTS in e.issues) Pill("Already saved", Grey)
                            else if (e.blocking.isNotEmpty()) Pill("Fix", Red) else Pill("OK", Green)
                        }
                        Text(
                            listOf(
                                e.batchName.ifBlank { "Batch? (" + e.rawBatch.take(24) + ")" },
                                e.subject, e.teacherName.ifBlank { if (e.rawTeacher.isNotBlank()) "Teacher? (" + e.rawTeacher.take(20) + ")" else "" },
                                if (e.room.isNotBlank()) "Room " + e.room else ""
                            ).filter { it.isNotBlank() }.joinToString(" - "),
                            fontSize = 13.sp, color = if (e.blocking.any { it != TTEntry.EXISTS }) Red else Grey
                        )
                    }
                }
            }
            Column(Modifier.padding(16.dp)) {
                PrimaryButton(
                    if (ok == 0) "Nothing to save yet" else "Save $ok classes",
                    onClick = { vm.saveTimetable { vm.back() } }, enabled = ok > 0, busy = vm.busy
                )
                if (problems > 0) Text("Classes marked Fix are skipped until you correct them.", color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
            }
        }
    }
    editing?.let { i ->
        val e = entries.getOrNull(i)
        if (e == null) editing = null else EntryEditDialog(vm, e, { editing = null }, { updated ->
            vm.ttEntries = vm.ttEntries.mapIndexed { j, x -> if (j == i) updated else x }
            vm.recheckTimetable()
            editing = null
        }) {
            vm.ttEntries = vm.ttEntries.filterIndexed { j, _ -> j != i }
            vm.recheckTimetable()
            editing = null
        }
    }
}

@Composable
private fun EntryEditDialog(vm: AppViewModel, e: TTEntry, onDismiss: () -> Unit, onSave: (TTEntry) -> Unit, onDelete: () -> Unit) {
    var batchId by remember { mutableStateOf(e.batchId) }
    var date by remember { mutableStateOf(e.date.ifBlank { D.today() }) }
    var start by remember { mutableStateOf(e.start.ifBlank { "16:00" }) }
    var end by remember { mutableStateOf(e.end.ifBlank { "17:00" }) }
    var subject by remember { mutableStateOf(e.subject) }
    var teacherId by remember { mutableStateOf(e.teacherId) }
    var room by remember { mutableStateOf(e.room) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Correct this class") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                if (e.rawBatch.isNotBlank() && e.batchId.isBlank()) Text("Read as: " + e.rawBatch.take(60), color = Grey, fontSize = 12.sp)
                PickerField("Batch", vm.batch(batchId)?.name.orEmpty(), vm.batches.map { it.id to it.name }, { batchId = it })
                DateField("Date", date, { date = it })
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TimeField("Start", start, { start = it }, Modifier.weight(1f))
                    TimeField("End", end, { end = it }, Modifier.weight(1f))
                }
                PickerField("Subject", subject, (vm.subjectList + subject).filter { it.isNotBlank() }.distinct().map { it to it }, { subject = it })
                PickerField(
                    "Teacher", vm.user(teacherId)?.name.orEmpty(),
                    listOf("" to "No teacher") + vm.teachers.filter { it.active }.map { it.id to it.name }, { teacherId = it }
                )
                Field("Room (optional)", room, { room = it })
                TextButton(onClick = onDelete) { Text("Remove this class from the list", color = Red) }
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val b = vm.batch(batchId)
                onSave(
                    e.copy(
                        batchId = b?.id.orEmpty(), batchName = b?.name.orEmpty(), date = date, start = start, end = end,
                        subject = subject, teacherId = teacherId, teacherName = vm.user(teacherId)?.name.orEmpty(),
                        rawTeacher = "", room = room.trim(), issues = emptyList()
                    )
                )
            }) { Text("Done") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// Send the timetable on WhatsApp (opens WhatsApp with the text ready; the admin taps Send)

private fun copyText(ctx: Context, text: String) {
    val cm = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    cm.setPrimaryClip(ClipData.newPlainText("Timetable", text))
}

private fun shareText(ctx: Context, text: String) {
    val i = Intent(Intent.ACTION_SEND)
    i.type = "text/plain"
    i.putExtra(Intent.EXTRA_TEXT, text)
    ctx.startActivity(Intent.createChooser(i, "Send timetable").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
}

/** Teachers and batches with their classes for a day or a week; one tap opens WhatsApp with the message already typed. */
@Composable
fun ShareTimetableScreen(vm: AppViewModel) {
    val ctx = LocalContext.current
    var mode by rememberSaveable { mutableStateOf(1) } // 0 today, 1 tomorrow, 2 this week, 3 pick
    var picked by rememberSaveable { mutableStateOf(LocalDate.now().plusDays(1).toString()) }
    val today = LocalDate.now()
    val (from, to) = when (mode) {
        0 -> today.toString() to today.toString()
        1 -> today.plusDays(1).toString() to today.plusDays(1).toString()
        2 -> today.minusDays((today.dayOfWeek.value - 1).toLong()).let { it.toString() to it.plusDays(6).toString() }
        else -> picked to picked
    }
    val institute = vm.institute?.name ?: "our institute"
    val inRange = vm.classes.filter { it.date in from..to && it.status != "cancelled" }
    val byTeacher = inRange.filter { it.teacherId.isNotBlank() }.groupBy { it.teacherId }
    val byBatch = inRange.groupBy { it.batchId }

    Page("Send timetable", vm::back) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item { Segmented(listOf("Today", "Tomorrow", "This week", "Pick day"), mode, { mode = it }) }
            if (mode == 3) item { DateField("Day", picked, { picked = it }) }
            item {
                Text(
                    (if (from == to) D.pretty(from) else D.shortDate(from) + " to " + D.shortDate(to)) + ": " + inRange.size + " classes. " +
                        "Nothing is sent by the app: WhatsApp opens with the message ready and you tap Send.",
                    color = Grey, fontSize = 12.sp
                )
            }
            item { SectionTitle("Teachers") }
            if (byTeacher.isEmpty()) item { Text("No teacher has classes in this period", color = Grey) }
            items(byTeacher.entries.toList().sortedBy { vm.user(it.key)?.name.orEmpty() }, key = { "t" + it.key }) { (id, list) ->
                val t = vm.user(id)
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(t?.name ?: list.first().teacherName, fontWeight = FontWeight.SemiBold)
                            Text(list.size.toString() + " classes", color = Grey, fontSize = 12.sp)
                        }
                        IconButton(onClick = { Contact.whatsapp(ctx, t?.mobile.orEmpty().ifBlank { t?.loginId.orEmpty() }) }) {
                            Icon(Icons.Filled.Chat, "WhatsApp chat", tint = Green)
                        }
                        TextButton(onClick = {
                            Contact.whatsapp(ctx, t?.mobile.orEmpty().ifBlank { t?.loginId.orEmpty() }, TT.teacherMessage(t?.name ?: list.first().teacherName, list, institute))
                        }) { Text("Send timetable") }
                    }
                }
            }
            item { SectionTitle("Batches") }
            if (byBatch.isEmpty()) item { Text("No batch has classes in this period", color = Grey) }
            items(byBatch.entries.toList().sortedBy { vm.batch(it.key)?.name.orEmpty() }, key = { "b" + it.key }) { (id, list) ->
                val b = vm.batch(id)
                val name = b?.name ?: list.first().batchName
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(name, fontWeight = FontWeight.SemiBold)
                            Text(list.size.toString() + " classes", color = Grey, fontSize = 12.sp)
                        }
                    }
                    Row {
                        if (b != null && b.whatsappLink.isNotBlank()) {
                            TextButton(onClick = { openGroup(ctx, b.whatsappLink) }) { Text("Open group") }
                        }
                        TextButton(onClick = {
                            val text = TT.batchMessage(name, list, institute)
                            if (b != null && b.whatsappLink.isNotBlank()) {
                                // WhatsApp cannot type into a group by itself: the text is copied, the group opens, paste and send.
                                copyText(ctx, text)
                                Toast.makeText(ctx, "Timetable copied. Paste it in the group and send.", Toast.LENGTH_LONG).show()
                                openGroup(ctx, b.whatsappLink)
                            } else {
                                shareText(ctx, text)
                            }
                        }) { Text("Send timetable") }
                    }
                    if (b != null && b.whatsappLink.isBlank()) {
                        Text("Tip: add the group link in Edit batch to open the group directly.", color = Grey, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

private fun openGroup(ctx: Context, link: String) {
    try {
        ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(link)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (e: Exception) {
        Toast.makeText(ctx, "Could not open WhatsApp", Toast.LENGTH_SHORT).show()
    }
}
