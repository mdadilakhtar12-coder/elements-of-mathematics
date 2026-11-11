package com.coachsaas.app.ui.people

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.coachsaas.app.data.Cred
import com.coachsaas.app.data.Role
import com.coachsaas.app.ui.AppViewModel
import com.coachsaas.app.ui.common.AppCard
import com.coachsaas.app.ui.common.Contact
import com.coachsaas.app.ui.common.Page
import com.coachsaas.app.ui.common.PrimaryButton
import com.coachsaas.app.ui.theme.Grey
import com.coachsaas.app.ui.theme.Orange
import com.coachsaas.app.util.Sheets

/** The message that goes to one person: institute code, username and password. */
fun loginMessage(vm: AppViewModel, c: Cred): String =
    "Hello " + c.name + ", your login for " + (vm.institute?.name ?: "our institute") + ":\n" +
        "Institute code: " + (vm.institute?.id ?: "") + "\n" +
        "Username: " + c.username + "\n" +
        "Password: " + c.password + "\n" +
        "Please change your password after your first login."

/**
 * Logins that were just created. Passwords exist only here, in memory: the app and the server keep only a secure hash,
 * so this list (and the buttons on it) cannot be brought back later. Download or share it now.
 */
@Composable
fun CredentialsScreen(vm: AppViewModel) {
    val ctx = LocalContext.current
    val list = vm.credentials
    Page("Login details", { vm.credentials = emptyList(); vm.back() }) {
        LazyColumn(
            Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp, 12.dp, 16.dp, 40.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Text(
                    "Share these with the people now. Passwords are not saved anywhere, so you cannot see them again " +
                        "(you can only reset a password later). The file has real passwords: send it only to the people it is for.",
                    color = Orange, fontSize = 13.sp
                )
            }
            if (list.isNotEmpty()) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        PrimaryButton("Download Excel", onClick = {
                            val rows = listOf(listOf("Name", "Role", "Mobile", "Institute code", "Username", "Password")) +
                                list.map { listOf(it.name, Role.label(it.role), it.mobile, vm.institute?.id.orEmpty(), it.username, it.password) }
                            Sheets.share(ctx, "logins-" + (vm.institute?.id ?: "institute") + ".xlsx", rows)
                        }, modifier = Modifier.weight(1f))
                        OutlinedButton(onClick = { shareText(ctx, list.joinToString("\n\n") { loginMessage(vm, it) }) }, modifier = Modifier.weight(1f)) {
                            Text("Share as text")
                        }
                    }
                }
            }
            if (list.isEmpty()) item { Text("Nothing to show.", color = Grey) }
            items(list, key = { it.username }) { c ->
                AppCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(c.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text(Role.label(c.role), color = Grey, fontSize = 12.sp)
                    }
                    Text("Username: " + c.username, fontSize = 14.sp, modifier = Modifier.padding(top = 4.dp))
                    Text("Password: " + c.password, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Row {
                        TextButton(onClick = { Contact.whatsapp(ctx, c.mobile, loginMessage(vm, c)) }) { Text("Send on WhatsApp") }
                        TextButton(onClick = { shareText(ctx, loginMessage(vm, c)) }) { Text("Share") }
                    }
                }
            }
        }
    }
}

private fun shareText(ctx: Context, text: String) {
    val i = Intent(Intent.ACTION_SEND)
    i.type = "text/plain"
    i.putExtra(Intent.EXTRA_TEXT, text)
    ctx.startActivity(Intent.createChooser(i, "Share login details").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
}
