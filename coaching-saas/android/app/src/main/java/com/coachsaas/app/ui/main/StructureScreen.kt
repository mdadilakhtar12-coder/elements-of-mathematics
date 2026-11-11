package com.coachsaas.app.ui.main

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.coachsaas.app.AppConfig
import com.coachsaas.app.data.Structure
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.Field
import com.coachsaas.app.ui.common.FormColumn
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.SectionTitle
import com.coachsaas.app.ui.theme.Grey

/** What is being removed, and how many warnings the admin has already seen (0, 1 or 2). */
private data class Removal(val kind: String, val value: String, val students: Int, val batches: Int, val step: Int)

private fun fieldOf(kind: String) = when (kind) { "classes" -> "standard"; "groups" -> "group"; else -> "section" }

/** Admin: the institute's own classes, groups (streams) and sections. Everybody else just picks from these lists. */
@Composable
fun StructureScreen(vm: AppViewModel) {
    val st = vm.structure
    // Until the admin makes their own list, the built-in classes are shown (and become theirs on the first change).
    val current = Structure(
        classes = if (st.customized) st.classes else AppConfig.STANDARDS,
        groups = st.groups, sections = st.sections, customized = true
    )
    var removal by remember { mutableStateOf<Removal?>(null) }
    var rename by remember { mutableStateOf<Pair<String, String>?>(null) } // kind to old value

    fun withList(kind: String, list: List<String>) = when (kind) {
        "classes" -> current.copy(classes = list)
        "groups" -> current.copy(groups = list)
        else -> current.copy(sections = list)
    }
    fun itemsOf(kind: String) = when (kind) { "classes" -> current.classes; "groups" -> current.groups; else -> current.sections }

    Page("Classes, groups & sections", vm::back) {
        FormColumn {
            Text(
                "Make the lists your institute uses. Example: classes Class 11, Class 12, Computer Class, B.Sc Mathematics; " +
                    "groups Science, Arts, Commerce; sections A, B, C. Batches and students pick from these lists. " +
                    "Existing records keep the name they already have.",
                color = Grey, fontSize = 13.sp
            )
            for ((kind, title, hint) in listOf(
                Triple("classes", "Classes", "New class (e.g. Class 13)"),
                Triple("groups", "Groups", "New group (e.g. Science)"),
                Triple("sections", "Sections", "New section (e.g. A)")
            )) {
                SectionTitle(title)
                val items = itemsOf(kind)
                if (items.isEmpty()) Text("Nothing added yet", color = Grey, fontSize = 13.sp)
                items.forEach { v ->
                    AppCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(v, modifier = Modifier.weight(1f))
                            val (s, b) = vm.usage(fieldOf(kind), v)
                            if (s + b > 0) Text("$s students, $b batches", color = Grey, fontSize = 12.sp)
                            IconButton(onClick = { rename = kind to v }) { Icon(Icons.Filled.Edit, "Rename") }
                            IconButton(onClick = {
                                val (ss, bb) = vm.usage(fieldOf(kind), v)
                                // Nothing uses it: remove straight away. Otherwise warn first.
                                if (ss + bb == 0) vm.saveStructure(withList(kind, items - v))
                                else removal = Removal(kind, v, ss, bb, 0)
                            }) { Icon(Icons.Filled.Close, "Remove") }
                        }
                    }
                }
                var text by remember(kind) { mutableStateOf("") }
                Field(hint, text, { text = it })
                OutlinedButton(onClick = {
                    val n = text.trim()
                    if (n.isEmpty()) vm.toast("Type a name")
                    else if (items.any { it.equals(n, ignoreCase = true) }) vm.toast("Already in the list")
                    else { vm.saveStructure(withList(kind, items + n)); text = "" }
                }, modifier = Modifier.fillMaxWidth()) { Text("Add") }
            }
        }
    }

    removal?.let { r ->
        val what = r.value + " is used by " + r.students + " students and " + r.batches + " batches."
        AlertDialog(
            onDismissRequest = { removal = null },
            title = { Text(if (r.step == 0) "Remove " + r.value + "?" else "Are you sure?") },
            text = {
                Text(
                    if (r.step == 0) what + "\n\nThey will keep showing \"" + r.value + "\", but it will not be offered for new ones."
                    else what + "\n\nThis is the last warning. Tap Remove to take it out of your list."
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    if (r.step == 0) removal = r.copy(step = 1)
                    else { vm.saveStructure(withList(r.kind, itemsOf(r.kind) - r.value)); removal = null }
                }) { Text(if (r.step == 0) "Continue" else "Remove") }
            },
            dismissButton = { TextButton(onClick = { removal = null }) { Text("Cancel") } }
        )
    }
    rename?.let { (kind, old) ->
        var name by remember(old) { mutableStateOf(old) }
        AlertDialog(
            onDismissRequest = { rename = null },
            title = { Text("Rename " + old) },
            text = {
                androidx.compose.foundation.layout.Column {
                    Field("New name", name, { name = it })
                    Text("Students and batches using \"" + old + "\" are changed to the new name.", color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp))
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    val n = name.trim()
                    when {
                        n.isEmpty() || n == old -> rename = null
                        itemsOf(kind).any { it.equals(n, ignoreCase = true) } -> vm.toast("Already in the list")
                        else -> { vm.renameStructureValue(kind, old, n, withList(kind, itemsOf(kind).map { if (it == old) n else it })); rename = null }
                    }
                }) { Text("Rename") }
            },
            dismissButton = { TextButton(onClick = { rename = null }) { Text("Cancel") } }
        )
    }
}
