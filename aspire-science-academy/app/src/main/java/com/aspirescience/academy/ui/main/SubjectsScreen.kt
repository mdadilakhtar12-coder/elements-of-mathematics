package com.aspirescience.academy.ui.main

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.theme.Grey

/** Admin: the list of subjects offered when making batches, exams and classes. */
@Composable
fun SubjectsScreen(vm: AppViewModel) {
    var list by remember { mutableStateOf(vm.subjectList) }
    var newName by remember { mutableStateOf("") }

    Page("Subjects", vm::back) {
        FormColumn {
            Text(
                "These subjects appear everywhere in the app. Biology is made of Botany and Zoology, " +
                    "so exams show those two papers and add them up as Biology.",
                color = Grey, fontSize = 13.sp
            )
            list.forEachIndexed { i, s ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(s, modifier = Modifier.weight(1f))
                        IconButton(onClick = { list = list.filterIndexed { j, _ -> j != i } }) { Icon(Icons.Filled.Close, "Remove") }
                    }
                }
            }
            Field("New subject", newName, { newName = it })
            OutlinedButton(onClick = {
                val n = newName.trim()
                if (n.isEmpty()) vm.toast("Type the subject name")
                else if (list.any { it.equals(n, ignoreCase = true) }) vm.toast("This subject is already in the list")
                else { list = list + n; newName = "" }
            }, modifier = Modifier.fillMaxWidth()) { Text("Add subject") }
            OutlinedButton(onClick = { list = AppConfig.SUBJECTS }, modifier = Modifier.fillMaxWidth()) { Text("Restore the default list") }
            PrimaryButton("Save", onClick = {
                if (list.isEmpty()) vm.toast("Keep at least one subject") else vm.saveSubjects(list) { vm.back() }
            }, busy = vm.busy)
        }
    }
}
