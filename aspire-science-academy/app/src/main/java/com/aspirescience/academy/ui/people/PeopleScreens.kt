@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.people

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.AlertDialog
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.UserProfile
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.Avatar
import com.aspirescience.academy.ui.common.ClickField
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DangerTextButton
import com.aspirescience.academy.ui.common.DropdownField
import com.aspirescience.academy.ui.common.EmptyState
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.InfoRow
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.MultiPickDialog
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.Segmented
import com.aspirescience.academy.ui.common.SectionTitle
import com.aspirescience.academy.ui.fees.StudentFeesContent
import com.aspirescience.academy.ui.schedule.TeacherReportContent
import com.aspirescience.academy.ui.student.AttendanceContent
import com.aspirescience.academy.ui.student.ResultsContent
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D
import com.aspirescience.academy.util.Messages
import com.aspirescience.academy.util.Messenger

private fun roleTitle(role: String) = when (role) {
    Role.STUDENT -> "Students"
    Role.TEACHER -> "Teachers"
    else -> "Sub-admins"
}

@Composable
fun PeopleScreen(vm: AppViewModel, role: String) {
    var q by remember { mutableStateOf("") }
    var batchFilter by remember { mutableStateOf("") }
    val base = when (role) {
        Role.STUDENT -> vm.students
        Role.TEACHER -> vm.teachers
        else -> vm.subAdmins
    }
    val list = base.filter { u ->
        (q.isBlank() || u.name.contains(q, true) || u.mobile.contains(q) || u.loginId.contains(q, true) || u.rollNo == q.trim()) &&
            (batchFilter.isEmpty() || batchFilter in u.batchIds)
    }
    Page(
        roleTitle(role) + " (" + base.size + ")", vm::back,
        fab = { FloatingActionButton(onClick = { vm.go(Screen.UserEdit(role)) }) { Icon(Icons.Filled.Add, "Add") } }
    ) {
        Column(Modifier.fillMaxSize()) {
            Column(Modifier.padding(16.dp, 12.dp, 16.dp, 0.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Field("Search name / mobile / roll no", q, { q = it })
                if (role == Role.STUDENT) {
                    PickerField(
                        "Batch", if (batchFilter.isEmpty()) "All batches" else vm.batch(batchFilter)?.name.orEmpty(),
                        listOf("" to "All batches") + vm.batches.map { it.id to it.name }, { batchFilter = it }
                    )
                }
            }
            Box(Modifier.weight(1f)) {
                ListColumn(list, "No " + roleTitle(role).lowercase() + " found") { u ->
                    AppCard(onClick = { vm.go(Screen.UserDetail(u.id)) }) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Avatar(u.name)
                            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                                Text(u.name, fontWeight = FontWeight.SemiBold)
                                val sub = when (role) {
                                    Role.STUDENT -> u.standard.ifBlank { u.mobile }
                                    Role.TEACHER -> u.subjects.ifBlank { u.mobile }
                                    else -> u.loginId
                                }
                                Text(sub, color = Grey, fontSize = 13.sp)
                            }
                            if (!u.active) Pill("Inactive", Red)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun UserEditScreen(vm: AppViewModel, s: Screen.UserEdit) {
    val existing = vm.user(s.userId)
    val role = s.role
    var name by remember { mutableStateOf(existing?.name.orEmpty()) }
    var loginId by remember { mutableStateOf(existing?.loginId.orEmpty()) }
    var password by remember { mutableStateOf("") }
    var roll by remember { mutableStateOf(existing?.rollNo.orEmpty()) }
    var standard by remember { mutableStateOf(existing?.standard.orEmpty()) }
    var fee by remember { mutableStateOf(if ((existing?.monthlyFee ?: 0L) > 0L) existing?.monthlyFee.toString() else "") }
    var parent by remember { mutableStateOf(existing?.parentMobile.orEmpty()) }
    var subjects by remember { mutableStateOf(existing?.subjects.orEmpty()) }
    var rate by remember { mutableStateOf(if ((existing?.classRate ?: 0L) > 0L) existing?.classRate.toString() else "") }
    var batchIds by remember { mutableStateOf(existing?.batchIds ?: emptyList()) }
    var perms by remember { mutableStateOf(existing?.perms ?: emptyList()) }
    var pickBatches by remember { mutableStateOf(false) }
    val isNew = existing == null
    val idLabel = if (role == Role.SUBADMIN) "Login ID" else "Mobile number (login ID)"

    Page((if (isNew) "Add " else "Edit ") + Role.label(role), vm::back) {
        FormColumn {
            Field("Full name *", name, { name = it })
            Field(
                idLabel + " *", loginId, { loginId = it.replace(" ", "") }, enabled = isNew,
                keyboard = if (role == Role.SUBADMIN) KeyboardType.Text else KeyboardType.Phone
            )
            if (isNew) {
                Field("Password * (min 6 characters)", password, { password = it }, password = true)
                if (loginId.length >= 6) {
                    TextButton(onClick = { password = loginId }) { Text("Use the mobile number / ID as password") }
                }
            }
            if (role == Role.STUDENT) {
                Field("Roll number", roll, { roll = it })
                DropdownField("Standard", standard, AppConfig.STANDARDS, { standard = AppConfig.STANDARDS[it] })
                Field("Monthly fee (Rs)", fee, { fee = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
                Field("Parent mobile", parent, { parent = it }, keyboard = KeyboardType.Phone)
                val names = batchIds.mapNotNull { vm.batch(it)?.name }
                ClickField("Batches", names.joinToString(", "), { pickBatches = true }, placeholder = "Select batches")
            }
            if (role == Role.TEACHER) {
                Field("Subjects taught", subjects, { subjects = it })
                Field("Pay per class (Rs, optional)", rate, { rate = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
            }
            if (role == Role.SUBADMIN) {
                SectionTitle("What can this sub-admin do?")
                Perm.all.forEach { p ->
                    Row(
                        Modifier.fillMaxWidth().clickable { perms = if (p in perms) perms - p else perms + p },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(checked = p in perms, onCheckedChange = null)
                        Text(Perm.label(p), modifier = Modifier.padding(start = 10.dp, top = 8.dp, bottom = 8.dp))
                    }
                }
            }
            PrimaryButton("Save", onClick = {
                if (name.isBlank() || loginId.isBlank()) {
                    vm.toast("Enter name and " + idLabel.substringBefore(" (").lowercase())
                } else if (isNew && password.length < 6) {
                    vm.toast("Password must be at least 6 characters")
                } else {
                    val draft = (existing ?: UserProfile()).copy(
                        role = role, name = name.trim(), loginId = loginId.trim(),
                        mobile = if (role == Role.SUBADMIN) "" else loginId.trim(),
                        rollNo = roll.trim(), standard = standard, parentMobile = parent.trim(),
                        monthlyFee = fee.toLongOrNull() ?: 0L, subjects = subjects.trim(),
                        classRate = rate.toLongOrNull() ?: 0L,
                        batchIds = batchIds, perms = perms
                    )
                    vm.saveUser(draft, password, isNew) { if (isNew) vm.replace(Screen.UserDetail(draft.id)) else vm.back() }
                }
            }, busy = vm.busy)
        }
    }
    if (pickBatches) {
        MultiPickDialog(
            "Batches", vm.batches.map { it.id to it.name }, batchIds.toSet(),
            { pickBatches = false }, { batchIds = it.toList(); pickBatches = false }
        )
    }
}

@Composable
fun UserDetailScreen(vm: AppViewModel, userId: String) {
    val u = vm.user(userId)
    val me = vm.me ?: return
    if (u == null) {
        Page("Profile", vm::back) { EmptyState("User not found") }
        return
    }
    val canManage = u.role != Role.SUBADMIN && vm.can(Perm.USERS) || (u.role == Role.SUBADMIN && me.role == Role.ADMIN)
    val ctx = androidx.compose.ui.platform.LocalContext.current
    var seg by remember { mutableStateOf(0) }
    var confirmDelete by remember { mutableStateOf(false) }
    var resetDialog by remember { mutableStateOf(false) }
    var showPw by remember { mutableStateOf(false) }
    var storedPw by remember { mutableStateOf("") }
    LaunchedEffect(showPw, userId) {
        if (showPw && storedPw.isEmpty()) {
            storedPw = try { Repo.getPassword(userId) } catch (e: Exception) { "" }
        }
    }
    val tabs = when (u.role) {
        Role.STUDENT -> listOf("Profile", "Attendance", "Results", "Fees")
        Role.TEACHER -> listOf("Profile", "Classes")
        else -> emptyList()
    }

    Page(
        u.name, vm::back,
        actions = {
            if (canManage) IconButton(onClick = { vm.go(Screen.UserEdit(u.role, u.id)) }) { Icon(Icons.Filled.Edit, "Edit") }
        }
    ) {
        Column(Modifier.fillMaxSize()) {
            if (tabs.isNotEmpty()) {
                Box(Modifier.padding(16.dp, 8.dp, 16.dp, 0.dp)) { Segmented(tabs, seg, { seg = it }) }
            }
            Box(Modifier.weight(1f)) {
                when (if (tabs.isEmpty()) "Profile" else tabs[seg]) {
                    "Attendance" -> AttendanceContent(vm, u.id)
                    "Results" -> ResultsContent(vm, u.id)
                    "Fees" -> StudentFeesContent(vm, u, true)
                    "Classes" -> TeacherReportContent(vm, u.id)
                    else -> LazyColumn(
                        Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        item {
                            AppCard {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Avatar(u.name, 52)
                                    Column(Modifier.weight(1f).padding(start = 12.dp)) {
                                        Text(u.name, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                                        Text(Role.label(u.role), color = Grey)
                                    }
                                    Pill(if (u.active) "Active" else "Inactive", if (u.active) Green else Red)
                                }
                            }
                        }
                        item {
                            AppCard {
                                InfoRow(if (u.role == Role.SUBADMIN) "Login ID" else "Mobile", u.loginId)
                                if (canManage) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text("Password", color = Grey, modifier = Modifier.weight(1f), fontSize = 14.sp)
                                        Text(
                                            if (showPw) storedPw.ifEmpty { "..." } else "••••••",
                                            fontWeight = FontWeight.Medium, fontSize = 14.sp
                                        )
                                        TextButton(onClick = { showPw = !showPw }) { Text(if (showPw) "Hide" else "Show") }
                                    }
                                }
                                if (u.role == Role.STUDENT) {
                                    InfoRow("Roll no", u.rollNo)
                                    InfoRow("Standard", u.standard)
                                    InfoRow("Parent mobile", u.parentMobile)
                                    if (u.monthlyFee > 0) InfoRow("Monthly fee", D.rs(u.monthlyFee))
                                    InfoRow("Batches", u.batchIds.mapNotNull { vm.batch(it)?.name }.joinToString(", "))
                                }
                                if (u.role == Role.TEACHER) {
                                    InfoRow("Subjects", u.subjects)
                                    InfoRow("Batches", vm.batches.filter { it.hasTeacher(u.id) }.joinToString(", ") { it.name })
                                }
                                if (u.role == Role.SUBADMIN) {
                                    InfoRow("Can manage", u.perms.joinToString(", ") { Perm.label(it) })
                                }
                            }
                        }
                        if (canManage) {
                            item {
                                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    if (u.role == Role.STUDENT && vm.can(Perm.FEES)) {
                                        PrimaryButton("Collect fee", onClick = { vm.go(Screen.FeeAdd(u.id)) })
                                    }
                                    if (u.role == Role.STUDENT) {
                                        OutlinedButton(
                                            onClick = { Messenger.whatsapp(ctx, u.parentMobile.ifBlank { u.mobile }, Messages.general(u.name)) },
                                            modifier = Modifier.fillMaxWidth()
                                        ) { Text("Message parent on WhatsApp") }
                                        OutlinedButton(onClick = { vm.reportCard(u) }, modifier = Modifier.fillMaxWidth()) {
                                            Text("Share report card (PDF)")
                                        }
                                    }
                                    OutlinedButton(onClick = { resetDialog = true }, modifier = Modifier.fillMaxWidth()) { Text("Reset password") }
                                    OutlinedButton(
                                        onClick = { vm.setActive(u, !u.active) },
                                        modifier = Modifier.fillMaxWidth()
                                    ) { Text(if (u.active) "Deactivate (block login)" else "Activate") }
                                    DangerTextButton("Delete this user") { confirmDelete = true }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (confirmDelete) {
        ConfirmDialog(
            "Delete " + u.name + "?", "The login and profile are removed. Past attendance and fee records stay.", "Delete",
            { vm.deleteUser(u) { vm.back() } }, { confirmDelete = false }
        )
    }
    if (resetDialog) {
        var pw by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { resetDialog = false },
            title = { Text("New password") },
            text = { Field("New password (min 6)", pw, { pw = it }, password = true) },
            confirmButton = {
                TextButton(onClick = {
                    if (pw.length < 6) {
                        vm.toast("At least 6 characters")
                    } else {
                        resetDialog = false
                        storedPw = ""
                        showPw = false
                        vm.resetPassword(u, pw)
                    }
                }) { Text("Change") }
            },
            dismissButton = { TextButton(onClick = { resetDialog = false }) { Text("Cancel") } }
        )
    }
}
