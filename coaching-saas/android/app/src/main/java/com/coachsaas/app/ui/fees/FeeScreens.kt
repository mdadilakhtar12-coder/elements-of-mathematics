@file:OptIn(ExperimentalMaterial3Api::class)

package com.coachsaas.app.ui.fees

import android.content.Context
import android.content.Intent
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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import com.coachsaas.app.AppConfig
import com.coachsaas.app.data.Fee
import com.coachsaas.app.data.Repo
import com.coachsaas.app.data.UserProfile
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.Screen
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.ClickField
import com.coachsaas.app.ui.common.ConfirmDialog
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.heightIn
import com.coachsaas.app.ui.common.DateField
import com.coachsaas.app.ui.common.DropdownField
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.FormColumn
import com.coachsaas.app.ui.common.ListColumn
import com.coachsaas.app.ui.common.MonthSwitcher
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PickerField
import com.coachsaas.app.ui.common.Pill
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.common.SectionTitle
import com.coachsaas.app.ui.common.Segmented
import com.coachsaas.app.ui.common.StatTile
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Indigo
import com.coachsaas.app.ui.theme.Orange
import com.coachsaas.app.ui.theme.Red
import com.coachsaas.app.util.D
import com.coachsaas.app.util.Messages
import com.coachsaas.app.util.Messenger
import androidx.compose.material3.TextButton

fun shareReceipt(ctx: Context, f: Fee) {
    val text = AppConfig.APP_NAME + "\nFee Receipt\n\n" +
        "Student: " + f.studentName + "\n" +
        "Amount: " + D.rs(f.amount) + "\n" +
        "For month: " + D.monthLabel(f.month) + "\n" +
        "Paid on: " + D.pretty(f.date) + "\n" +
        "Mode: " + f.mode + "\n" +
        (if (f.note.isNotBlank()) "Note: " + f.note + "\n" else "") +
        "Received by: " + f.receivedBy
    val i = Intent(Intent.ACTION_SEND)
    i.type = "text/plain"
    i.putExtra(Intent.EXTRA_TEXT, text)
    ctx.startActivity(Intent.createChooser(i, "Share receipt"))
}

@Composable
fun FeesTab(vm: AppViewModel) {
    val ctx = LocalContext.current
    var month by rememberSaveable { mutableStateOf(D.thisMonth()) }
    var seg by rememberSaveable { mutableStateOf(0) }
    var toDelete by remember { mutableStateOf<Fee?>(null) }
    val fees by remember(month) { Repo.feesByMonth(month) }.collectAsState(initial = emptyList())
    val total = fees.sumOf { it.amount }
    val due = vm.students.filter { it.active && it.monthlyFee > 0 && (it.createdAt <= 0L || D.monthOfMillis(it.createdAt) <= month) }
        .map { s -> s to (s.monthlyFee - fees.filter { f -> f.studentId == s.id }.sumOf { f -> f.amount }) }
        .filter { it.second > 0 }
    val dueTotal = due.sumOf { it.second }
    val payments = fees.sortedByDescending { it.createdAt }

    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            Column(Modifier.padding(16.dp, 4.dp, 16.dp, 0.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                MonthSwitcher(month) { month = it }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    StatTile("Collected", D.rs(total), Green, Modifier.weight(1f))
                    StatTile("Pending (" + due.size + ")", D.rs(dueTotal), if (dueTotal > 0) Red else Grey, Modifier.weight(1f))
                }
                Segmented(listOf("Payments (" + payments.size + ")", "Pending (" + due.size + ")"), seg, { seg = it })
                OutlinedButton(onClick = { vm.go(Screen.Accounts) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Accounts: profit, loss and expenses")
                }
            }
            Box(Modifier.weight(1f)) {
                if (seg == 0) {
                    ListColumn(payments, "No payments recorded for this month") { f ->
                        AppCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(f.studentName, fontWeight = FontWeight.SemiBold)
                                    Text(D.shortDate(f.date) + " · " + f.mode, color = Grey, fontSize = 13.sp)
                                }
                                Text(D.rs(f.amount), fontWeight = FontWeight.Bold, color = Green, fontSize = 16.sp)
                                IconButton(onClick = { shareReceipt(ctx, f) }) { Icon(Icons.Filled.Share, "Share receipt", tint = Indigo) }
                                // Only the admin can delete a payment; every change is kept in the activity log.
                                if (vm.role == com.coachsaas.app.data.Role.ADMIN) IconButton(onClick = { toDelete = f }) { Icon(Icons.Filled.Delete, "Delete", tint = Red) }
                            }
                        }
                    }
                } else {
                    ListColumn(due, "Nobody is pending. Set a monthly fee on the student profile to track dues.") { p ->
                        AppCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(p.first.name, fontWeight = FontWeight.SemiBold)
                                    Text("Due " + D.rs(p.second) + " of " + D.rs(p.first.monthlyFee), color = Red, fontSize = 13.sp)
                                }
                                TextButton(onClick = {
                                    Messenger.whatsapp(ctx, p.first.parentMobile.ifBlank { p.first.mobile }, Messages.feeDue(p.first.name, month, p.second))
                                }) { Text("Remind") }
                                OutlinedButton(onClick = { vm.go(Screen.FeeAdd(p.first.id, month, p.second)) }) { Text("Collect") }
                            }
                        }
                    }
                }
            }
        }
        FloatingActionButton(
            onClick = { vm.go(Screen.FeeAdd(month = month)) },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
        ) { Icon(Icons.Filled.Add, "Add payment") }
    }
    val del = toDelete
    if (del != null) {
        ConfirmDialog(
            "Delete payment?", D.rs(del.amount) + " from " + del.studentName, "Delete",
            { vm.op("Deleted") { Repo.delete("fees", del.id) } }, { toDelete = null }
        )
    }
}

@Composable
fun FeeAddScreen(vm: AppViewModel, s: Screen.FeeAdd) {
    var studentId by remember { mutableStateOf(s.studentId) }
    var month by remember { mutableStateOf(s.month.ifBlank { D.thisMonth() }) }
    var amount by remember { mutableStateOf(if (s.amount > 0) s.amount.toString() else vm.user(s.studentId)?.monthlyFee?.takeIf { it > 0 }?.toString().orEmpty()) }
    var mode by remember { mutableStateOf(AppConfig.PAY_MODES[0]) }
    var date by remember { mutableStateOf(D.today()) }
    var note by remember { mutableStateOf("") }
    var pickStudent by remember { mutableStateOf(false) }
    val months = (-8..2).map { D.shiftMonth(D.thisMonth(), it.toLong()) }

    Page("Collect Fee", vm::back) {
        FormColumn {
            ClickField(
                "Student", vm.user(studentId)?.name.orEmpty(), { pickStudent = true },
                placeholder = "Tap to choose (filter by class or search by name)"
            )
            DropdownField("Fee for month", D.monthLabel(month), months.map { D.monthLabel(it) }, { month = months[it] })
            Field("Amount (Rs)", amount, { amount = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
            DropdownField("Payment mode", mode, AppConfig.PAY_MODES, { mode = AppConfig.PAY_MODES[it] })
            DateField("Received on", date, { date = it })
            Field("Note (optional)", note, { note = it })
            PrimaryButton("Save payment", onClick = {
                val st = vm.user(studentId)
                val amt = amount.toLongOrNull() ?: 0L
                if (st == null) {
                    vm.toast("Select a student")
                } else if (amt <= 0L) {
                    vm.toast("Enter the amount")
                } else {
                    val f = Fee(
                        studentId = st.id, studentName = st.name, amount = amt, month = month, date = date,
                        mode = mode, note = note.trim(), receivedBy = vm.me?.name.orEmpty(), createdBy = vm.me?.id.orEmpty(),
                        createdAt = System.currentTimeMillis()
                    )
                    vm.op("Payment saved", { vm.back() }) { Repo.put("fees", f) }
                }
            }, busy = vm.busy)
        }
    }
    if (pickStudent) {
        StudentPickerDialog(vm, { pickStudent = false }) { id ->
            pickStudent = false
            studentId = id
            if (amount.isBlank()) amount = vm.user(id)?.monthlyFee?.takeIf { f -> f > 0 }?.toString().orEmpty()
        }
    }
}

/** Student chooser with a class filter, a batch filter and a name search. */
@Composable
fun StudentPickerDialog(vm: AppViewModel, onDismiss: () -> Unit, onPick: (String) -> Unit) {
    var q by remember { mutableStateOf("") }
    var std by remember { mutableStateOf("") }
    var batch by remember { mutableStateOf("") }
    val standards = (vm.students.map { it.standard } + vm.batches.map { it.standard }).filter { it.isNotBlank() }.distinct().sorted()
    val batchOptions = vm.batches.filter { std.isEmpty() || it.standard == std }
    val list = vm.students.filter { s ->
        s.active &&
            (q.isBlank() || s.name.contains(q, ignoreCase = true) || s.mobile.contains(q) || s.rollNo == q.trim()) &&
            (std.isEmpty() || s.standard == std || s.batchIds.any { id -> vm.batch(id)?.standard == std }) &&
            (batch.isEmpty() || batch in s.batchIds)
    }.sortedBy { it.name.lowercase() }

    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Choose student") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                androidx.compose.material3.OutlinedTextField(
                    q, { q = it }, placeholder = { Text("Search by name, mobile or roll no") }, singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                DropdownField(
                    "Class", std.ifEmpty { "All classes" }, listOf("All classes") + standards,
                    { i -> std = if (i == 0) "" else standards[i - 1]; batch = "" }
                )
                DropdownField(
                    "Batch", if (batch.isEmpty()) "All batches" else vm.batch(batch)?.name.orEmpty(),
                    listOf("All batches") + batchOptions.map { it.name },
                    { i -> batch = if (i == 0) "" else batchOptions[i - 1].id }
                )
                Text(list.size.toString() + " students", color = Grey, fontSize = 12.sp)
                androidx.compose.foundation.lazy.LazyColumn(Modifier.heightIn(max = 280.dp)) {
                    items(list.take(300)) { s ->
                        Column(Modifier.fillMaxWidth().clickable { onPick(s.id) }.padding(vertical = 10.dp)) {
                            Text(s.name, fontWeight = FontWeight.SemiBold)
                            Text(
                                (if (s.rollNo.isNotBlank()) "Roll " + s.rollNo + "  -  " else "") + s.standard +
                                    (if (s.batchIds.isNotEmpty()) "  -  " + s.batchIds.mapNotNull { vm.batch(it)?.name }.joinToString(", ") else ""),
                                color = Grey, fontSize = 12.sp
                            )
                        }
                        androidx.compose.material3.HorizontalDivider()
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun StudentFeesTab(vm: AppViewModel) {
    val me = vm.me ?: return
    StudentFeesContent(vm, me, false)
}

/** Month-by-month fee status and payment history of one student. */
@Composable
fun StudentFeesContent(vm: AppViewModel, student: UserProfile, adminView: Boolean) {
    val ctx = LocalContext.current
    val fees by remember(student.id) { Repo.feesByStudent(student.id) }.collectAsState(initial = emptyList())
    val now = D.thisMonth()
    val first = D.shiftMonth(now, -11)
    val joined = if (student.createdAt > 0) D.monthOfMillis(student.createdAt) else first
    val start = if (joined > first) joined else first
    val months = ArrayList<String>()
    var m = start
    while (m <= now) {
        months.add(m)
        m = D.shiftMonth(m, 1)
    }
    val totalPaid = fees.sumOf { it.amount }

    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 32.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item { FeeDueBanner(student, fees) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Monthly fee", if (student.monthlyFee > 0) D.rs(student.monthlyFee) else "-", Indigo, Modifier.weight(1f))
                StatTile("Total paid", D.rs(totalPaid), Green, Modifier.weight(1f))
            }
        }
        if (student.monthlyFee > 0) {
            item { SectionTitle("Month-wise status") }
            items(months.reversed()) { mo ->
                val paid = fees.filter { it.month == mo }.sumOf { it.amount }
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(D.monthLabel(mo), fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text(D.rs(paid), color = Grey, modifier = Modifier.padding(end = 10.dp))
                        when {
                            paid >= student.monthlyFee -> Pill("Paid", Green)
                            paid > 0 -> Pill("Partial", Orange)
                            else -> Pill("Due", Red)
                        }
                    }
                }
            }
        }
        item { SectionTitle("Payment history") }
        if (fees.isEmpty()) item { Text("No payments yet", color = Grey) }
        items(fees.sortedByDescending { it.date }) { f ->
            AppCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(D.rs(f.amount) + " for " + D.monthLabel(f.month), fontWeight = FontWeight.SemiBold)
                        Text(D.pretty(f.date) + " · " + f.mode, color = Grey, fontSize = 13.sp)
                    }
                    IconButton(onClick = { shareReceipt(ctx, f) }) { Icon(Icons.Filled.Share, "Share receipt", tint = Indigo) }
                }
            }
        }
    }
}

/** Red reminder card shown to the student when this month's fee is still unpaid close to the due day. */
@Composable
fun FeeDueBanner(student: UserProfile, fees: List<Fee>) {
    val month = D.thisMonth()
    val due = student.monthlyFee - fees.filter { it.month == month }.sumOf { it.amount }
    if (student.monthlyFee > 0 && due > 0 && java.time.LocalDate.now().dayOfMonth >= AppConfig.FEE_DUE_DAY - 3) {
        AppCard {
            Text("Fees due: " + D.rs(due), color = Red, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Text(D.monthLabel(month) + " fees should be paid by day " + AppConfig.FEE_DUE_DAY + " of the month.", color = Grey, fontSize = 13.sp)
        }
    }
}
