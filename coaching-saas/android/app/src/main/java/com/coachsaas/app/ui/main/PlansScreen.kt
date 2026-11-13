package com.coachsaas.app.ui.main

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.coachsaas.app.data.Feature
import com.coachsaas.app.data.Plan
import com.coachsaas.app.data.Repo
import com.coachsaas.app.data.Role
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.Pill
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Indigo
import com.coachsaas.app.ui.theme.Red
import com.coachsaas.app.util.D

/**
 * Admin: the current plan, its usage, and the plans that exist. Information only: plans are not sold inside the app
 * (Google Play rules for digital subscriptions). The owner changes the plan with BatchPilot support.
 */
@Composable
fun PlansScreen(vm: AppViewModel) {
    val inst = vm.institute
    val plans by remember { Repo.plans() }.collectAsState(initial = emptyList())
    Page("Plans", vm::back) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (inst != null) {
                item {
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Your plan", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            Pill(Plan.label(inst.plan), Indigo)
                        }
                        inst.expiresAt?.let {
                            val day = java.time.Instant.ofEpochMilli(it.toDate().time).atZone(java.time.ZoneId.systemDefault()).toLocalDate().toString()
                            Text("Valid until " + D.pretty(day) + ". After that the institute moves to the Free plan; no data is lost.", color = Grey, fontSize = 13.sp)
                        }
                        listOf(Role.STUDENT, Role.TEACHER, Role.SUBADMIN).forEach { r ->
                            val used = inst.used(r)
                            val max = inst.limit(r)
                            Text(Role.label(r) + "s: " + used + " / " + max, fontSize = 13.sp, color = if (used >= max) Red else Grey)
                        }
                    }
                }
            }
            item {
                Text(
                    "To change your plan, contact BatchPilot support.",
                    color = Grey, fontSize = 13.sp
                )
            }
            items(plans, key = { it.id }) { p ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(p.name, fontWeight = FontWeight.Bold, fontSize = 17.sp, modifier = Modifier.weight(1f))
                        if (inst?.plan == p.id) Pill("Current", Green)
                    }
                    Text(
                        if (p.pricePerMonth == 0L) "Free" else "Rs " + p.pricePerMonth + " / month  or  Rs " + p.pricePerYear + " / year",
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        (p.limits["student"] ?: 0).toString() + " students, " + (p.limits["teacher"] ?: 0) + " teachers, " +
                            (p.limits["subadmin"] ?: 0) + " sub-admins",
                        color = Grey, fontSize = 13.sp
                    )
                    val on = listOf(
                        Feature.STUDENT_LOGIN, Feature.FEES, Feature.PUSH, Feature.EXAMS, Feature.STUDY,
                        Feature.ACCOUNTS, Feature.LEAVES, Feature.DOUBTS, Feature.BACKUP
                    ).filter { p.features[it] == true }
                    if (on.isNotEmpty()) {
                        Text(on.joinToString(", ") { Feature.label(it) }, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}
