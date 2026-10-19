package com.aspirescience.academy.ui.main

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aspirescience.academy.ui.AppViewModel
import com.aspirescience.academy.ui.common.AppCard
import com.aspirescience.academy.ui.common.Field
import com.aspirescience.academy.ui.common.FormColumn
import com.aspirescience.academy.ui.common.Page
import com.aspirescience.academy.ui.common.PrimaryButton
import com.aspirescience.academy.ui.theme.Grey
import com.aspirescience.academy.util.Messages

/** Admin screen to edit the WhatsApp message texts. */
@Composable
fun MessageTextsScreen(vm: AppViewModel) {
    val texts = remember { mutableStateMapOf<String, String>().also { m -> Messages.KEYS.forEach { m[it] = Messages.template(it) } } }
    Page("Message texts", vm::back) {
        FormColumn {
            Text(
                "These messages are filled in when you tap Message parent, Remind or Send result. " +
                    "Edit the wording as you like. Words in { } are replaced automatically.",
                color = Grey, fontSize = 13.sp
            )
            Messages.KEYS.forEach { key ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(Messages.LABELS[key].orEmpty(), fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                        TextButton(onClick = { texts[key] = Messages.DEFAULTS[key].orEmpty() }) { Text("Reset") }
                    }
                    Field(
                        "Message", texts[key].orEmpty(), { texts[key] = it },
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp), singleLine = false
                    )
                    Text("You can use: " + Messages.HELP[key].orEmpty(), color = Grey, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                    Text("Preview", fontWeight = FontWeight.SemiBold, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
                    Text(Messages.fill(texts[key].orEmpty(), Messages.SAMPLE), fontSize = 13.sp)
                }
            }
            PrimaryButton("Save", onClick = {
                if (Messages.KEYS.any { texts[it].orEmpty().isBlank() }) {
                    vm.toast("A message cannot be empty. Use Reset to restore the default.")
                } else {
                    vm.saveMessageTexts(texts.toMap()) { vm.back() }
                }
            }, busy = vm.busy)
        }
    }
}
