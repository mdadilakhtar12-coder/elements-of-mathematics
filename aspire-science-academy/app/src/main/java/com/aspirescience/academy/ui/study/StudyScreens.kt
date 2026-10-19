@file:OptIn(ExperimentalMaterial3Api::class)

package com.aspirescience.academy.ui.study

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.Doubt
import com.aspirescience.academy.data.Perm
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.StudyMaterial
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.Screen
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.ConfirmDialog
import com.aspirescience.academy.ui.common.DropdownField
import com.aspirescience.academy.ui.common.EmptyState
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.ListColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PhotoPicker
import com.aspirescience.academy.ui.common.PhotoView
import com.aspirescience.academy.ui.common.PickerField
import com.aspirescience.academy.ui.common.Pill
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.common.Segmented
import com.aspirescience.academy.ui.theme.Blue
import com.aspirescience.academy.ui.theme.Green
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.ui.theme.Indigo
import com.aspirescience.academy.ui.theme.Orange
import com.aspirescience.academy.ui.theme.Red
import com.aspirescience.academy.util.D

val MATERIAL_TYPES = listOf("Notes", "PDF", "Video", "Practice paper", "Other")

fun visibleMaterials(vm: AppViewModel): List<StudyMaterial> {
    val me = vm.me ?: return emptyList()
    return when (me.role) {
        Role.STUDENT -> vm.materials.filter { it.batchId in me.batchIds }
        Role.TEACHER -> {
            val mine = vm.myBatches.map { it.id }.toSet()
            vm.materials.filter { it.batchId in mine || it.createdBy == me.id }
        }
        else -> vm.materials
    }
}

fun visibleDoubts(vm: AppViewModel): List<Doubt> {
    val me = vm.me ?: return emptyList()
    return when (me.role) {
        Role.STUDENT -> vm.doubts.filter { it.studentId == me.id }
        Role.TEACHER -> {
            val mine = vm.myBatches.map { it.id }.toSet()
            vm.doubts.filter { it.batchId in mine }
        }
        else -> vm.doubts
    }.sortedByDescending { it.createdAt }
}

// ---------------- study material ----------------

@Composable
fun MaterialsScreen(vm: AppViewModel) {
    val ctx = LocalContext.current
    val canPost = vm.can(Perm.NOTICES) || vm.role == Role.TEACHER
    val all = visibleMaterials(vm)
    var subject by remember { mutableStateOf("") }
    var toDelete by remember { mutableStateOf<StudyMaterial?>(null) }
    val subjects = all.map { it.subject }.filter { it.isNotBlank() }.distinct().sorted()
    val shown = all.filter { subject.isEmpty() || it.subject == subject }

    Page(
        "Study material", vm::back,
        fab = { if (canPost) FloatingActionButton(onClick = { vm.go(Screen.MaterialAdd) }) { Icon(Icons.Filled.Add, "Add") } }
    ) {
        Column(Modifier.fillMaxSize()) {
            if (subjects.isNotEmpty()) {
                Row(
                    Modifier.horizontalScroll(rememberScrollState()).padding(16.dp, 12.dp, 16.dp, 0.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    (listOf("") + subjects).forEach { s ->
                        Box(
                            Modifier.background(if (subject == s) Indigo else Color(0xFFE5E7EB), RoundedCornerShape(50))
                                .clickable { subject = s }.padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(s.ifEmpty { "All" }, color = if (subject == s) Color.White else Color(0xFF374151), fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }
                    }
                }
            }
            Box(Modifier.weight(1f)) {
                ListColumn(shown, "No study material yet") { m ->
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(m.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.weight(1f))
                            Pill(m.type, Blue)
                        }
                        Text(
                            (if (m.subject.isNotBlank()) m.subject + " - " else "") + m.batchName,
                            color = Indigo, fontSize = 13.sp
                        )
                        if (m.description.isNotBlank()) Text(m.description, modifier = Modifier.padding(top = 4.dp))
                        Text(m.createdByName + " - " + D.timestamp(m.createdAt), color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                        Row {
                            if (m.link.isNotBlank()) {
                                TextButton(onClick = {
                                    try {
                                        val url = if (m.link.startsWith("http")) m.link else "https://" + m.link
                                        ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                                    } catch (e: Exception) {
                                        vm.toast("Could not open the link")
                                    }
                                }) { Text("Open") }
                            }
                            if (canPost && (vm.isStaff || m.createdBy == vm.me?.id)) {
                                TextButton(onClick = { toDelete = m }) { Text("Delete", color = Red) }
                            }
                        }
                    }
                }
            }
        }
    }
    val del = toDelete
    if (del != null) {
        ConfirmDialog("Delete this material?", del.title, "Delete", { vm.op("Deleted") { Repo.delete("materials", del.id) } }, { toDelete = null })
    }
}

@Composable
fun MaterialAddScreen(vm: AppViewModel) {
    var batchId by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var link by remember { mutableStateOf("") }
    var type by remember { mutableStateOf(MATERIAL_TYPES[0]) }
    val subjectOptions = vm.batch(batchId)?.plans()?.map { it.subject }?.filter { it.isNotBlank() }?.takeIf { it.isNotEmpty() } ?: AppConfig.SUBJECTS

    Page("Add material", vm::back) {
        FormColumn {
            PickerField("Batch", vm.batch(batchId)?.name.orEmpty(), vm.myBatches.map { it.id to it.name }, { batchId = it; subject = "" })
            DropdownField("Subject (optional)", subject, subjectOptions, { subject = subjectOptions[it] })
            DropdownField("Type", type, MATERIAL_TYPES, { type = MATERIAL_TYPES[it] })
            Field("Title", title, { title = it })
            Field("Details (optional)", desc, { desc = it }, singleLine = false)
            Field("Link (Google Drive, YouTube, website)", link, { link = it }, placeholder = "https://...")
            Text(
                "Upload the file to Google Drive, set it to \"Anyone with the link\", and paste the link here.",
                color = Grey, fontSize = 12.sp
            )
            PrimaryButton("Share with students", onClick = {
                val b = vm.batch(batchId)
                if (b == null || title.isBlank()) {
                    vm.toast("Select a batch and enter a title")
                } else if (link.isBlank() && desc.isBlank()) {
                    vm.toast("Add a link or some details")
                } else {
                    val m = StudyMaterial(
                        batchId = b.id, batchName = b.name, subject = subject, title = title.trim(),
                        description = desc.trim(), link = link.trim(), type = type, createdBy = vm.me?.id.orEmpty(),
                        createdByName = vm.me?.name.orEmpty(), createdAt = System.currentTimeMillis()
                    )
                    vm.op("Shared", { vm.back() }) { Repo.put("materials", m) }
                }
            }, busy = vm.busy)
        }
    }
}

// ---------------- doubts ----------------

@Composable
fun DoubtsScreen(vm: AppViewModel) {
    val isStudent = vm.role == Role.STUDENT
    val all = visibleDoubts(vm)
    var seg by remember { mutableStateOf(0) }
    val open = all.filter { it.status != "answered" }
    val done = all.filter { it.status == "answered" }
    val list = if (seg == 0) open else done

    Page(
        if (isStudent) "My doubts" else "Student doubts", vm::back,
        fab = { if (isStudent) FloatingActionButton(onClick = { vm.go(Screen.DoubtAsk) }) { Icon(Icons.Filled.Add, "Ask a doubt") } }
    ) {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.padding(16.dp, 12.dp, 16.dp, 0.dp)) {
                Segmented(listOf("Open (" + open.size + ")", "Answered (" + done.size + ")"), seg, { seg = it })
            }
            Box(Modifier.weight(1f)) {
                ListColumn(list, if (seg == 0) (if (isStudent) "No open doubts. Tap + to ask one." else "No open doubts") else "Nothing answered yet") { d ->
                    AppCard(onClick = { vm.go(Screen.DoubtDetail(d.id)) }) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(d.question, maxLines = 2, fontWeight = FontWeight.SemiBold)
                                Text(
                                    (if (!isStudent) d.studentName + " - " else "") + (if (d.subject.isNotBlank()) d.subject + " - " else "") + d.batchName,
                                    color = Grey, fontSize = 12.sp
                                )
                            }
                            Pill(if (d.status == "answered") "Answered" else "Open", if (d.status == "answered") Green else Orange)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DoubtAskScreen(vm: AppViewModel) {
    val me = vm.me ?: return
    val myBatches = vm.myBatches
    var batchId by remember { mutableStateOf(myBatches.firstOrNull()?.id.orEmpty()) }
    var subject by remember { mutableStateOf("") }
    var question by remember { mutableStateOf("") }
    var photo by remember { mutableStateOf<String?>(null) }
    val subjectOptions = vm.batch(batchId)?.plans()?.map { it.subject }?.filter { it.isNotBlank() }?.takeIf { it.isNotEmpty() } ?: AppConfig.SUBJECTS

    Page("Ask a doubt", vm::back) {
        FormColumn {
            if (myBatches.size > 1) {
                PickerField("Batch", vm.batch(batchId)?.name.orEmpty(), myBatches.map { it.id to it.name }, { batchId = it; subject = "" })
            }
            DropdownField("Subject (optional)", subject, subjectOptions, { subject = subjectOptions[it] })
            Field("Your question", question, { question = it }, singleLine = false)
            Text("Photo of the question (optional)", fontWeight = FontWeight.SemiBold)
            PhotoPicker(photo) { photo = it }
            PrimaryButton("Send to teacher", onClick = {
                val b = vm.batch(batchId)
                if (question.isBlank() && photo == null) {
                    vm.toast("Write your question or add a photo")
                } else {
                    val d = Doubt(
                        studentId = me.id, studentName = me.name, batchId = b?.id.orEmpty(), batchName = b?.name.orEmpty(),
                        subject = subject, question = question.trim().ifBlank { "(see photo)" }, hasPhoto = photo != null,
                        createdAt = System.currentTimeMillis()
                    )
                    val pic = photo
                    vm.op("Sent to your teacher", { vm.back() }) {
                        val saved = Repo.put("doubts", d)
                        if (pic != null) Repo.putPhoto("doubtPhotos", saved.id, pic)
                    }
                }
            }, busy = vm.busy)
        }
    }
}

@Composable
fun DoubtDetailScreen(vm: AppViewModel, id: String) {
    val d = vm.doubts.firstOrNull { it.id == id }
    val me = vm.me ?: return
    if (d == null) {
        Page("Doubt", vm::back) { EmptyState("Doubt not found") }
        return
    }
    val canReply = me.role != Role.STUDENT && (vm.isStaff || vm.myBatches.any { it.id == d.batchId })
    var answer by remember(id) { mutableStateOf(d.answer) }
    var confirmDelete by remember { mutableStateOf(false) }
    val photo by produceState<String?>(null, d.id, d.hasPhoto) {
        value = if (d.hasPhoto) (try { Repo.getPhoto("doubtPhotos", d.id) } catch (e: Exception) { "" }) else ""
    }

    Page("Doubt", vm::back) {
        FormColumn {
            AppCard {
                Text(d.studentName, fontWeight = FontWeight.Bold)
                Text((if (d.subject.isNotBlank()) d.subject + " - " else "") + d.batchName + " - " + D.timestamp(d.createdAt), color = Grey, fontSize = 12.sp)
                Text(d.question, modifier = Modifier.padding(top = 8.dp))
                val ph = photo
                if (d.hasPhoto) {
                    Box(Modifier.padding(top = 8.dp)) {
                        if (ph == null) Text("Loading photo...", color = Grey)
                        else if (ph.isNotEmpty()) PhotoView(ph)
                    }
                }
            }
            if (d.status == "answered") {
                AppCard {
                    Text("Answer", fontWeight = FontWeight.Bold, color = Green)
                    Text(d.answer, modifier = Modifier.padding(top = 4.dp))
                    Text(d.answeredBy + " - " + D.timestamp(d.answeredAt), color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                }
            } else if (me.role == Role.STUDENT) {
                Text("Your teacher has not answered yet.", color = Grey)
            }
            if (canReply) {
                Field(if (d.status == "answered") "Edit the answer" else "Your answer", answer, { answer = it }, singleLine = false)
                PrimaryButton("Send answer", onClick = {
                    if (answer.isBlank()) {
                        vm.toast("Write the answer first")
                    } else {
                        vm.op("Answer sent", { vm.back() }) {
                            Repo.put("doubts", d.copy(answer = answer.trim(), answeredBy = me.name, answeredAt = System.currentTimeMillis(), status = "answered"))
                        }
                    }
                }, busy = vm.busy)
            }
            if (me.role == Role.STUDENT || vm.isStaff) {
                TextButton(onClick = { confirmDelete = true }) { Text("Delete this doubt", color = Red) }
            }
        }
    }
    if (confirmDelete) {
        ConfirmDialog("Delete this doubt?", "It will be removed for the teacher too.", "Delete", {
            vm.op("Deleted", { vm.back() }) {
                Repo.delete("doubts", d.id)
                if (d.hasPhoto) Repo.delete("doubtPhotos", d.id)
            }
        }, { confirmDelete = false })
    }
}
