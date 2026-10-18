@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.notice

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.data.Homework
import com.aspirescience.academy.data.Notice
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DateField
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.theme.Blue
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.util.D

fun visibleNotices(vm: AppViewModel): List<Notice> {
    val me = vm.me ?: return emptyList()
    return when (me.role) {
        Role.STUDENT -> vm.notices.filter { it.batchId.isEmpty() || it.batchId in me.batchIds }
        Role.TEACHER -> {
            val mine = vm.myBatches.map { it.id }.toSet()
            vm.notices.filter { it.batchId.isEmpty() || it.batchId in mine || it.createdByName == me.name }
        }
        else -> vm.notices
    }
}

fun visibleHomework(vm: AppViewModel): List<Homework> {
    val me = vm.me ?: return emptyList()
    return when (me.role) {
        Role.STUDENT -> vm.homework.filter { it.batchId in me.batchIds }
        Role.TEACHER -> {
            val mine = vm.myBatches.map { it.id }.toSet()
            vm.homework.filter { it.batchId in mine || it.createdBy == me.id }
        }
        else -> vm.homework
    }
}

/** Batches the current user may post to. */
private fun postableBatches(vm: AppViewModel) = vm.myBatches

@Composable
fun NoticeCard(n: Notice, canDelete: Boolean, onDelete: () -> Unit) {
    var confirm by remember { mutableStateOf(false) }
    AppCard {
        Text(n.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(n.body, modifier = Modifier.padding(top = 4.dp))
        Text(
            (if (n.batchName.isBlank()) "Everyone" else n.batchName) + " · " + n.createdByName + " · " + D.timestamp(n.createdAt),
            color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp)
        )
        if (canDelete) TextButton(onClick = { confirm = true }) { Text("Delete", color = com.aspirescience.academy.ui.theme.Red) }
    }
    if (confirm) ConfirmDialog("Delete announcement?", "This cannot be undone.", "Delete", onDelete) { confirm = false }
}

@Composable
fun NoticesScreen(vm: AppViewModel) {
    val canPost = vm.can(Perm.NOTICES) || vm.role == Role.TEACHER
    Page(
        "Announcements", vm::back,
        fab = {
            if (canPost) FloatingActionButton(onClick = { vm.go(Screen.NoticeAdd) }) { Icon(Icons.Filled.Add, "New") }
        }
    ) {
        ListColumn(visibleNotices(vm), "No announcements yet") { n ->
            NoticeCard(n, canPost && (vm.isStaff || n.createdByName == vm.me?.name), {
                vm.op("Deleted") { Repo.delete("notices", n.id) }
            })
        }
    }
}

@Composable
fun NoticeAddScreen(vm: AppViewModel) {
    var title by remember { mutableStateOf("") }
    var body by remember { mutableStateOf("") }
    var batchId by remember { mutableStateOf("") }
    val options = (if (vm.isStaff) listOf("" to "Everyone") else emptyList()) + postableBatches(vm).map { it.id to it.name }
    Page("New Announcement", vm::back) {
        FormColumn {
            PickerField("Send to", if (batchId.isEmpty()) "Everyone" else vm.batch(batchId)?.name.orEmpty(), options, { batchId = it })
            Field("Title", title, { title = it })
            Field("Message", body, { body = it }, singleLine = false)
            PrimaryButton("Post", onClick = {
                if (title.isBlank() || body.isBlank()) {
                    vm.toast("Enter a title and message")
                } else if (!vm.isStaff && batchId.isEmpty()) {
                    vm.toast("Select a batch")
                } else {
                    val n = Notice(
                        title = title.trim(), body = body.trim(), batchId = batchId,
                        batchName = vm.batch(batchId)?.name.orEmpty(), createdByName = vm.me?.name.orEmpty(),
                        createdAt = System.currentTimeMillis()
                    )
                    vm.op("Posted", { vm.back() }) { Repo.put("notices", n) }
                }
            }, busy = vm.busy)
        }
    }
}

@Composable
fun HomeworkItem(vm: AppViewModel, h: Homework) {
    val ctx = LocalContext.current
    var confirm by remember { mutableStateOf(false) }
    val me = vm.me
    val canDelete = me != null && (vm.can(Perm.NOTICES) || h.createdBy == me.id)
    val overdue = h.dueDate.isNotBlank() && h.dueDate < D.today()
    AppCard {
        Text(h.title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(h.batchName, color = Indigo, fontSize = 13.sp)
        if (h.description.isNotBlank()) Text(h.description, modifier = Modifier.padding(top = 4.dp))
        if (h.dueDate.isNotBlank()) {
            Box(Modifier.padding(top = 6.dp)) { Pill("Due " + D.pretty(h.dueDate), if (overdue) Orange else Blue) }
        }
        Text(h.createdByName + " · " + D.timestamp(h.createdAt), color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
        if (h.link.isNotBlank()) {
            TextButton(onClick = {
                try {
                    val url = if (h.link.startsWith("http")) h.link else "https://" + h.link
                    ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (e: Exception) {
                    vm.toast("Could not open the link")
                }
            }) { Text("Open link") }
        }
        if (canDelete) TextButton(onClick = { confirm = true }) { Text("Delete", color = com.aspirescience.academy.ui.theme.Red) }
    }
    if (confirm) {
        ConfirmDialog("Delete homework?", "This cannot be undone.", "Delete", {
            vm.op("Deleted") { Repo.delete("homework", h.id) }
        }) { confirm = false }
    }
}

/** Homework list used as a tab (teacher) and as a screen. */
@Composable
fun HomeworkContent(vm: AppViewModel) {
    val canPost = vm.can(Perm.NOTICES) || vm.role == Role.TEACHER
    Box(Modifier.fillMaxSize()) {
        ListColumn(visibleHomework(vm), "No homework yet") { HomeworkItem(vm, it) }
        if (canPost) {
            FloatingActionButton(
                onClick = { vm.go(Screen.HomeworkAdd) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
            ) { Icon(Icons.Filled.Add, "New homework") }
        }
    }
}

@Composable
fun HomeworkListScreen(vm: AppViewModel) {
    Page("Homework", vm::back) { HomeworkContent(vm) }
}

@Composable
fun HomeworkAddScreen(vm: AppViewModel) {
    var batchId by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var due by remember { mutableStateOf("") }
    var link by remember { mutableStateOf("") }
    Page("New Homework", vm::back) {
        FormColumn {
            PickerField("Batch", vm.batch(batchId)?.name.orEmpty(), postableBatches(vm).map { it.id to it.name }, { batchId = it })
            Field("Title", title, { title = it })
            Field("Details", desc, { desc = it }, singleLine = false)
            DateField("Due date (optional)", due, { due = it })
            Field("Link (optional, Drive / YouTube / PDF)", link, { link = it })
            PrimaryButton("Send to students", onClick = {
                val b = vm.batch(batchId)
                if (b == null || title.isBlank()) {
                    vm.toast("Select a batch and enter a title")
                } else {
                    val h = Homework(
                        batchId = b.id, batchName = b.name, title = title.trim(), description = desc.trim(),
                        dueDate = due, link = link.trim(), createdBy = vm.me?.id.orEmpty(),
                        createdByName = vm.me?.name.orEmpty(), createdAt = System.currentTimeMillis()
                    )
                    vm.op("Homework sent", { vm.back() }) { Repo.put("homework", h) }
                }
            }, busy = vm.busy)
        }
    }
}
