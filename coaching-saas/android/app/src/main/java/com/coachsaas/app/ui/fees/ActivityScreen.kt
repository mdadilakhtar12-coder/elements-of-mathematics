package com.coachsaas.app.ui.fees

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.coachsaas.app.data.ActivityEntry
import com.coachsaas.app.data.Repo
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.EmptyState
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Orange
import com.coachsaas.app.ui.theme.Red
import com.coachsaas.app.util.D
import java.text.SimpleDateFormat
import java.util.Locale

/**
 * Admin only: who recorded, changed or deleted a payment / account entry.
 * The list is written by Cloud Functions and cannot be edited from any app.
 */
@Composable
fun ActivityScreen(vm: AppViewModel) {
    val list by remember { Repo.activity() }.collectAsState(initial = emptyList())
    val fmt = remember { SimpleDateFormat("d MMM yyyy, h:mm a", Locale.getDefault()) }
    Page("Activity log", vm::back) {
        if (list.isEmpty()) {
            EmptyState("Nothing yet. Every payment that is added, changed or deleted will be listed here.")
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(list, key = { it.id }) { e -> ActivityCard(vm, e, fmt) }
            }
        }
    }
}

private fun amountOf(m: Map<String, Any?>?): Long = (m?.get("amount") as? Number)?.toLong() ?: 0L

@Composable
private fun ActivityCard(vm: AppViewModel, e: ActivityEntry, fmt: SimpleDateFormat) {
    val what = when (e.kind) {
        "fees" -> "Fee payment"
        "ledger" -> "Account entry"
        "salaryPaid" -> "Salary payment"
        else -> e.kind
    }
    val color = when (e.action) {
        "deleted" -> Red
        "updated" -> Orange
        else -> Green
    }
    val by = vm.user(e.by)?.name ?: (if (e.by == vm.me?.id) vm.me?.name else null)
        ?: (if (e.byType == "app_user" || e.by.isNotEmpty()) "A removed user" else "System")
    AppCard {
        Text("$what ${e.action}", fontWeight = FontWeight.Bold, color = color)
        val detail = if (e.action == "updated" && amountOf(e.before) != amountOf(e.after)) {
            e.who + ": " + D.rs(amountOf(e.before)) + " -> " + D.rs(amountOf(e.after))
        } else {
            e.who + ": " + D.rs(e.amount.toLong())
        }
        Text(detail, fontSize = 14.sp)
        Text("By " + by + (e.at?.let { "  -  " + fmt.format(it.toDate()) } ?: ""), color = Grey, fontSize = 12.sp)
    }
}
