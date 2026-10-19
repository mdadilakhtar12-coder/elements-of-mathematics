@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.fees

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.LedgerEntry
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DateField
import com.aspirescience.academy.ui.common.DropdownField
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.MoneyBars
import com.aspirescience.academy.ui.common.MonthSwitcher
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.common.Segmented
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D

private class PayLine(val name: String, val classes: Int, val rate: Long, val salary: Long) {
    val amount: Long get() = classes * rate + salary
}

private class Month(
    val feeIncome: Long,
    val otherIncome: Long,
    val manualExpense: Long,
    val pay: List<PayLine>
) {
    val teacherPay: Long get() = pay.sumOf { it.amount }
    val income: Long get() = feeIncome + otherIncome
    val expense: Long get() = manualExpense + teacherPay
    val net: Long get() = income - expense
}

@Composable
fun AccountsScreen(vm: AppViewModel) {
    var month by rememberSaveable { mutableStateOf(D.thisMonth()) }
    var toDelete by remember { mutableStateOf<LedgerEntry?>(null) }
    var showPay by remember { mutableStateOf(false) }
    val from = D.monthStart(D.shiftMonth(month, -5))
    val to = D.monthEnd(month)
    val fees by remember(month) { Repo.feesByDate(from, to) }.collectAsState(initial = emptyList())
    val ledger by remember(month) { Repo.ledgerRange(from, to) }.collectAsState(initial = emptyList())
    val classes by remember(month) { Repo.classesBetween(from, to) }.collectAsState(initial = emptyList())
    val forMonth by remember(month) { Repo.feesByMonth(month) }.collectAsState(initial = emptyList())

    fun calc(m: String): Month {
        val feeIncome = fees.filter { it.date.startsWith(m) }.sumOf { it.amount }
        val entries = ledger.filter { it.date.startsWith(m) }
        val done = classes.filter { it.date.startsWith(m) && it.status == CS.APPROVED }
        val pay = vm.teachers.filter { it.active || done.any { c -> c.teacherId == it.id } }.map { t ->
            PayLine(t.name, done.count { it.teacherId == t.id }, t.classRate, t.salary)
        }.filter { it.amount > 0 }
        return Month(
            feeIncome, entries.filter { it.type == "income" }.sumOf { it.amount },
            entries.filter { it.type == "expense" }.sumOf { it.amount }, pay
        )
    }

    val cur = calc(month)
    val months = (-5..0).map { D.shiftMonth(month, it.toLong()) }
    val trend = months.map { m -> val c = calc(m); Triple(D.monthLabel(m).take(3), c.income, c.expense) }
    val sixMonthNet = months.sumOf { calc(it).net }
    val expected = vm.students.filter { it.active && it.monthlyFee > 0 && (it.createdAt <= 0L || D.monthOfMillis(it.createdAt) <= month) }
        .sumOf { it.monthlyFee }
    val received = forMonth.sumOf { it.amount }
    val shortage = (expected - received).coerceAtLeast(0)
    val monthEntries = ledger.filter { it.date.startsWith(month) }.sortedByDescending { it.date }
    val expenseGroups = monthEntries.filter { it.type == "expense" }.groupBy { it.category }
        .map { it.key to it.value.sumOf { e -> e.amount } }.sortedByDescending { it.second }
    val incomeGroups = monthEntries.filter { it.type == "income" }.groupBy { it.category }
        .map { it.key to it.value.sumOf { e -> e.amount } }.sortedByDescending { it.second }

    Page(
        "Accounts", vm::back,
        fab = { FloatingActionButton(onClick = { vm.go(Screen.LedgerAdd) }) { Icon(Icons.Filled.Add, "Add entry") } }
    ) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 8.dp, 16.dp, 100.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item { MonthSwitcher(month) { month = it } }
            item {
                val profit = cur.net >= 0
                val c = if (profit) Green else Red
                AppCard {
                    Text(if (profit) "Profit this month" else "Loss this month", color = Grey, fontSize = 13.sp)
                    Text(D.rs(Math.abs(cur.net)), color = c, fontSize = 30.sp, fontWeight = FontWeight.Bold)
                    Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Money in", color = Grey, fontSize = 12.sp)
                            Text(D.rs(cur.income), color = Green, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Money out", color = Grey, fontSize = 12.sp)
                            Text(D.rs(cur.expense), color = Red, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        }
                    }
                }
            }
            item {
                AppCard {
                    Text("Student fees for " + D.monthLabel(month), fontWeight = FontWeight.Bold)
                    Row(Modifier.fillMaxWidth().padding(top = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Expected", color = Grey, fontSize = 12.sp)
                            Text(D.rs(expected), fontWeight = FontWeight.SemiBold)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Received", color = Grey, fontSize = 12.sp)
                            Text(D.rs(received), color = Green, fontWeight = FontWeight.SemiBold)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Still to collect", color = Grey, fontSize = 12.sp)
                            Text(D.rs(shortage), color = if (shortage > 0) Red else Grey, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
            item { SectionTitle("Money in") }
            item {
                AppCard {
                    Row(Modifier.fillMaxWidth()) {
                        Text("Student fees received", modifier = Modifier.weight(1f))
                        Text(D.rs(cur.feeIncome), fontWeight = FontWeight.SemiBold, color = Green)
                    }
                    incomeGroups.forEach { (cat, amt) ->
                        Row(Modifier.fillMaxWidth().padding(top = 8.dp)) {
                            Text(cat, modifier = Modifier.weight(1f))
                            Text(D.rs(amt), fontWeight = FontWeight.SemiBold, color = Green)
                        }
                    }
                }
            }
            item { SectionTitle("Money out") }
            item {
                AppCard(onClick = { showPay = !showPay }) {
                    Row(Modifier.fillMaxWidth()) {
                        Column(Modifier.weight(1f)) {
                            Text("Teacher pay (automatic)")
                            Text("Approved classes x rate + fixed salary. Tap for details.", color = Grey, fontSize = 11.sp)
                        }
                        Text(D.rs(cur.teacherPay), fontWeight = FontWeight.SemiBold, color = Red)
                    }
                    if (showPay) {
                        if (cur.pay.isEmpty()) {
                            Text("No teacher pay yet. Set a pay per class or a fixed salary on the teacher's profile.", color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
                        }
                        cur.pay.forEach { p ->
                            Row(Modifier.fillMaxWidth().padding(top = 8.dp)) {
                                Column(Modifier.weight(1f)) {
                                    Text(p.name, fontSize = 14.sp)
                                    Text(
                                        p.classes.toString() + " classes x " + D.rs(p.rate) + (if (p.salary > 0) " + " + D.rs(p.salary) + " salary" else ""),
                                        color = Grey, fontSize = 11.sp
                                    )
                                }
                                Text(D.rs(p.amount), fontSize = 14.sp)
                            }
                        }
                    }
                }
            }
            val maxExp = (expenseGroups.maxOfOrNull { it.second } ?: 1L).coerceAtLeast(1L)
            items(expenseGroups) { (cat, amt) ->
                AppCard {
                    Row(Modifier.fillMaxWidth()) {
                        Text(cat, modifier = Modifier.weight(1f))
                        Text(D.rs(amt), fontWeight = FontWeight.SemiBold, color = Red)
                    }
                    Box(Modifier.fillMaxWidth().padding(top = 6.dp).height(5.dp).background(Color(0xFFE5E7EB), RoundedCornerShape(9.dp))) {
                        Box(Modifier.fillMaxWidth(amt.toFloat() / maxExp).height(5.dp).background(Red, RoundedCornerShape(9.dp)))
                    }
                }
            }
            if (expenseGroups.isEmpty()) item { Text("No expenses added for this month. Tap + to add rent, advertisement, stationery and so on.", color = Grey, fontSize = 13.sp) }

            item { SectionTitle("Last 6 months") }
            item {
                AppCard {
                    MoneyBars(trend)
                    Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        Text("Green: money in", color = Green, fontSize = 11.sp)
                        Text("Red: money out", color = Red, fontSize = 11.sp)
                    }
                    Text(
                        "Total over these 6 months: " + (if (sixMonthNet >= 0) "profit " else "loss ") + D.rs(Math.abs(sixMonthNet)),
                        fontWeight = FontWeight.SemiBold, color = if (sixMonthNet >= 0) Green else Red,
                        fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            if (monthEntries.isNotEmpty()) {
                item { SectionTitle("Entries of this month") }
                items(monthEntries) { e ->
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(e.category, fontWeight = FontWeight.SemiBold)
                                Text(D.shortDate(e.date) + (if (e.note.isNotBlank()) " - " + e.note else ""), color = Grey, fontSize = 12.sp)
                            }
                            Text(
                                (if (e.type == "income") "+" else "-") + D.rs(e.amount),
                                fontWeight = FontWeight.Bold, color = if (e.type == "income") Green else Red
                            )
                            IconButton(onClick = { toDelete = e }) { Icon(Icons.Filled.Delete, "Delete", tint = Grey) }
                        }
                    }
                }
            }
        }
    }
    val del = toDelete
    if (del != null) {
        ConfirmDialog(
            "Delete entry?", del.category + " " + D.rs(del.amount), "Delete",
            { vm.op("Deleted") { Repo.delete("ledger", del.id) } }, { toDelete = null }
        )
    }
}

@Composable
fun LedgerAddScreen(vm: AppViewModel) {
    var seg by remember { mutableStateOf(1) } // 0 = money in, 1 = money out
    val type = if (seg == 0) "income" else "expense"
    var category by remember { mutableStateOf("") }
    var newCategory by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(D.today()) }
    var note by remember { mutableStateOf("") }
    val used by remember { Repo.ledgerRange(D.daysAgo(400), D.today()) }.collectAsState(initial = emptyList())
    val base = if (seg == 0) AppConfig.INCOME_CATEGORIES else AppConfig.EXPENSE_CATEGORIES
    val options = (base + used.filter { it.type == type }.map { it.category }).distinct()
    val addNew = "+ Add a new heading"

    Page("Add Entry", vm::back) {
        FormColumn {
            Segmented(listOf("Money in", "Money out"), seg, { seg = it; category = "" })
            DropdownField("Heading", category.ifBlank { "" }, options + addNew, {
                val all = options + addNew
                category = if (all[it] == addNew) addNew else all[it]
            }, placeholder = "Choose a heading")
            if (category == addNew) {
                Field("New heading (e.g. Room rent, Advertisement)", newCategory, { newCategory = it })
            }
            Field("Amount (Rs)", amount, { amount = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
            DateField("Date", date, { date = it })
            Field("Note (optional)", note, { note = it })
            PrimaryButton("Save", onClick = {
                val cat = if (category == addNew) newCategory.trim() else category
                val amt = amount.toLongOrNull() ?: 0L
                if (cat.isBlank()) {
                    vm.toast("Choose or add a heading")
                } else if (amt <= 0L) {
                    vm.toast("Enter the amount")
                } else {
                    val e = LedgerEntry(
                        type = type, date = date, month = date.take(7), category = cat, note = note.trim(),
                        amount = amt, createdBy = vm.me?.name.orEmpty(), createdAt = System.currentTimeMillis()
                    )
                    vm.op("Saved", { vm.back() }) { Repo.put("ledger", e) }
                }
            }, busy = vm.busy)
        }
    }
}
