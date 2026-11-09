@file:OptIn(ExperimentalMaterial3Api::class)

package com.coachsaas.app.ui.people

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
import com.coachsaas.app.AppConfig
import com.coachsaas.app.data.Perm
import com.coachsaas.app.data.Repo
import com.coachsaas.app.data.Role
import com.coachsaas.app.data.UserProfile
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.Screen
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.Avatar
import com.coachsaas.app.ui.common.ClickField
import com.coachsaas.app.ui.common.ConfirmDialog
import com.coachsaas.app.ui.common.DangerTextButton
import com.coachsaas.app.ui.common.DropdownField
import com.coachsaas.app.ui.common.EmptyState
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.FormColumn
import com.coachsaas.app.ui.common.InfoRow
import com.coachsaas.app.ui.common.ListColumn
import com.coachsaas.app.ui.common.MultiPickDialog
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PickerField
import com.coachsaas.app.ui.common.Pill
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.common.Segmented
import com.coachsaas.app.ui.common.SectionTitle
import com.coachsaas.app.ui.fees.StudentFeesContent
import com.coachsaas.app.ui.schedule.TeacherReportContent
import com.coachsaas.app.ui.student.AttendanceContent
import com.coachsaas.app.ui.student.ResultsContent
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Red
import com.coachsaas.app.util.D
import com.coachsaas.app.util.Messages
import com.coachsaas.app.util.Messenger

private fun roleTitle(role: String) = when (role) {
    Role.STUDENT -> "Students"
    Role.TEACHER -> "Teachers"
    else -> "Sub-admins"
}

@Composable
fun PeopleScreen(vm: AppViewModel, role: String) {
    var q by remember { mutableStateOf("") }
    var batchFilter by remember { mutableStateOf("") }
    var importDialog by remember { mutableStateOf(false) }
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
        actions = {
            if (role == Role.STUDENT && vm.has(com.coachsaas.app.data.Feature.IMPORT_EXCEL)) {
                TextButton(onClick = { importDialog = true }) { Text("Import") }
            }
        },
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
    if (importDialog) StudentImportDialog(vm, "") { importDialog = false }
}

@Composable
fun StudentImportDialog(vm: AppViewModel, batchId: String, onDismiss: () -> Unit) {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val picker = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            onDismiss()
            vm.op {
                val rows = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                    com.coachsaas.app.data.Tables.read(ctx, uri)
                }
                vm.importStudents(rows, batchId)
            }
        }
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Import students") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Choose an Excel (.xlsx) or CSV file. The first row must have headings:", fontSize = 13.sp)
                Text("Name, Mobile, Password (optional), Roll No, Parent Mobile, Monthly Fee, Standard", fontWeight = FontWeight.Medium, fontSize = 13.sp)
                Text(
                    "Name and Mobile are required. If Password is empty, the mobile number becomes the password. " +
                        "Students who already exist are not created again" +
                        (if (batchId.isNotBlank()) ", they are just added to this batch." else "."),
                    color = Grey, fontSize = 12.sp
                )
                TextButton(onClick = {
                    com.coachsaas.app.util.Sheets.share(
                        ctx, "students-format.xlsx",
                        listOf(
                            listOf("Name", "Mobile", "Password", "Roll No", "Parent Mobile", "Monthly Fee", "Standard"),
                            listOf("Aman Shaikh", "9876543210", "", "1", "9876500000", "1500", "11th Science"),
                            listOf("Riya Patel", "9123456780", "", "2", "9123400000", "1500", "11th Science")
                        )
                    )
                }) { Text("Download format (Excel)") }
            }
        },
        confirmButton = {
            TextButton(onClick = {
                picker.launch(
                    arrayOf(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "text/csv", "text/comma-separated-values", "text/plain", "application/octet-stream"
                    )
                )
            }) { Text("Choose file") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun UserEditScreen(vm: AppViewModel, s: Screen.UserEdit) {
    val existing = vm.user(s.userId)
    val role = s.role
    var name by remember { mutableStateOf(existing?.name.orEmpty()) }
    var loginId by remember { mutableStateOf(existing?.loginId.orEmpty()) }
    var password by remember { mutableStateOf("") }
    var showGenerated by remember { mutableStateOf(false) }
    var roll by remember { mutableStateOf(existing?.rollNo.orEmpty()) }
    var standard by remember { mutableStateOf(existing?.standard ?: vm.batch(s.batchId)?.standard.orEmpty()) }
    var fee by remember { mutableStateOf(if ((existing?.monthlyFee ?: 0L) > 0L) existing?.monthlyFee.toString() else "") }
    var parent by remember { mutableStateOf(existing?.parentMobile.orEmpty()) }
    var subjects by remember { mutableStateOf(existing?.subjects.orEmpty()) }
    var ttype by remember { mutableStateOf(existing?.takeIf { it.role == Role.TEACHER }?.let { if (it.permanent()) "permanent" else "guest" } ?: "permanent") }
    var salary by remember { mutableStateOf(if ((existing?.salary ?: 0L) > 0L) existing?.salary.toString() else "") }
    var rate by remember { mutableStateOf(if ((existing?.classRate ?: 0L) > 0L) existing?.classRate.toString() else "") }
    var batchIds by remember { mutableStateOf(existing?.batchIds ?: (if (s.batchId.isBlank()) emptyList() else listOf(s.batchId))) }
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
                Field("Password * (min 8 characters)", password, { password = it }, password = true)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = { password = com.coachsaas.app.util.Passwords.random(); showGenerated = true }) {
                        Text("Generate a password")
                    }
                    if (showGenerated && password.isNotEmpty()) Text(password, fontWeight = FontWeight.Bold)
                }
                Text(
                    "Share it with the person. It is stored only as a secure hash and can never be viewed again - you can only reset it.",
                    color = Grey, fontSize = 12.sp
                )
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
                Text("Teacher type", fontWeight = FontWeight.SemiBold)
                Segmented(listOf("Permanent", "Guest lecture"), if (ttype == "permanent") 0 else 1, { ttype = if (it == 0) "permanent" else "guest" })
                if (ttype == "permanent") {
                    Field("Monthly salary (Rs)", salary, { salary = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
                    Text("A permanent teacher gets this salary every month and can take casual leave (15 days a year).", color = Grey, fontSize = 12.sp)
                } else {
                    Field("Pay per class (Rs)", rate, { rate = it.filter { c -> c.isDigit() } }, keyboard = KeyboardType.Number)
                    Text("A guest teacher is paid for every class that the admin has approved.", color = Grey, fontSize = 12.sp)
                }
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
                } else if (isNew && password.length < 8) {
                    vm.toast("Password must be at least 8 characters")
                } else {
                    val draft = (existing ?: UserProfile()).copy(
                        role = role, name = name.trim(), loginId = loginId.trim(),
                        mobile = if (role == Role.SUBADMIN) "" else loginId.trim(),
                        rollNo = roll.trim(), standard = standard, parentMobile = parent.trim(),
                        monthlyFee = fee.toLongOrNull() ?: 0L, subjects = subjects.trim(),
                        teacherType = if (role == Role.TEACHER) ttype else "",
                        classRate = if (ttype == "guest") (rate.toLongOrNull() ?: 0L) else 0L,
                        salary = if (ttype == "permanent") (salary.toLongOrNull() ?: 0L) else 0L,
                        batchIds = batchIds, perms = perms
                    )
                    vm.saveUser(draft, password, isNew) { if (isNew && s.batchId.isBlank()) vm.replace(Screen.UserDetail(draft.id)) else vm.back() }
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
    var pickExam by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var resetDialog by remember { mutableStateOf(false) }
    var newPassword by remember { mutableStateOf<String?>(null) }
    val tabs = when (u.role) {
        Role.STUDENT -> listOf("Profile", "Attendance") +
            (if (vm.has(com.coachsaas.app.data.Feature.EXAMS)) listOf("Results") else emptyList()) +
            (if (vm.has(com.coachsaas.app.data.Feature.FEES)) listOf("Fees") else emptyList())
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
                                if (canManage) InfoRow("Password", "Hidden (reset to set a new one)")
                                if (u.role == Role.STUDENT) {
                                    InfoRow("Roll no", u.rollNo)
                                    InfoRow("Standard", u.standard)
                                    InfoRow("Parent mobile", u.parentMobile)
                                    if (u.monthlyFee > 0) InfoRow("Monthly fee", D.rs(u.monthlyFee))
                                    InfoRow("Batches", u.batchIds.mapNotNull { vm.batch(it)?.name }.joinToString(", "))
                                }
                                if (u.role == Role.TEACHER) {
                                    InfoRow("Type", if (u.permanent()) "Permanent" else "Guest lecture")
                                    InfoRow(if (u.permanent()) "Monthly salary" else "Pay per class", D.rs(if (u.permanent()) u.salary else u.classRate))
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
                                    if (u.role == Role.STUDENT && vm.can(Perm.EXAMS) && vm.has(com.coachsaas.app.data.Feature.EXAMS)) {
                                        OutlinedButton(onClick = { pickExam = true }, modifier = Modifier.fillMaxWidth()) { Text("Update marks") }
                                    }
                                    if (u.role == Role.STUDENT && vm.can(Perm.FEES) && vm.has(com.coachsaas.app.data.Feature.FEES)) {
                                        PrimaryButton("Collect fee", onClick = { vm.go(Screen.FeeAdd(u.id)) })
                                    }
                                    if (u.role == Role.STUDENT) {
                                        OutlinedButton(
                                            onClick = { Messenger.whatsapp(ctx, u.parentMobile.ifBlank { u.mobile }, Messages.general(u.name)) },
                                            modifier = Modifier.fillMaxWidth()
                                        ) { Text("Message parent on WhatsApp") }
                                        if (vm.has(com.coachsaas.app.data.Feature.EXAMS)) {
                                            OutlinedButton(onClick = { vm.reportCard(u) }, modifier = Modifier.fillMaxWidth()) {
                                                Text("Share report card (PDF)")
                                            }
                                        }
                                    }
                                    OutlinedButton(onClick = { resetDialog = true }, modifier = Modifier.fillMaxWidth()) { Text("Reset password") }
                                    if (!u.owner && u.id != me.id) {
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
    }
    if (pickExam) {
        val opts = vm.exams.filter { it.batchId in u.batchIds }.sortedByDescending { it.date }.map { it.id to (it.name + " - " + it.batchName + " (" + D.shortDate(it.date) + ")") }
        if (opts.isEmpty()) {
            pickExam = false
            vm.toast("No exams for this student's batches yet")
        } else {
            com.coachsaas.app.ui.common.PickDialog("Choose the exam", opts, { pickExam = false }) { id ->
                pickExam = false
                vm.go(Screen.ExamDetail(id, u.id))
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
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Field("New password (min 8)", pw, { pw = it }, password = true)
                    TextButton(onClick = {
                        resetDialog = false
                        vm.resetPassword(u, null) { newPassword = it }
                    }) { Text("Or generate a random password") }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (pw.length < 8) {
                        vm.toast("At least 8 characters")
                    } else {
                        resetDialog = false
                        vm.resetPassword(u, pw)
                    }
                }) { Text("Change") }
            },
            dismissButton = { TextButton(onClick = { resetDialog = false }) { Text("Cancel") } }
        )
    }
    newPassword?.let { generated ->
        AlertDialog(
            onDismissRequest = { newPassword = null },
            title = { Text("New password") },
            text = { Text("Give this password to " + u.name + ":\n\n" + generated + "\n\nIt is not stored anywhere and will not be shown again.") },
            confirmButton = { TextButton(onClick = { newPassword = null }) { Text("Done") } }
        )
    }
}
