package com.coachsaas.app.ui.common

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.coachsaas.app.ui.theme.Green
import com.coachsaas.app.ui.theme.Indigo
import com.coachsaas.app.ui.theme.Orange

/** Opens the phone's dialer, WhatsApp or the e-mail app. Nothing is sent by the app itself. */
object Contact {
    private fun digits(raw: String) = raw.filter { it.isDigit() }
    fun validPhone(raw: String) = digits(raw).length >= 10
    fun validEmail(raw: String) = raw.contains("@") && raw.trim().length >= 5

    private fun intl(raw: String): String {
        val d = digits(raw)
        return if (d.length > 10) d else "91" + d.takeLast(10)
    }

    private fun start(ctx: Context, i: Intent, fail: String) {
        try {
            ctx.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (e: Exception) {
            Toast.makeText(ctx, fail, Toast.LENGTH_SHORT).show()
        }
    }

    fun call(ctx: Context, mobile: String) {
        if (!validPhone(mobile)) return Toast.makeText(ctx, "No valid mobile number saved", Toast.LENGTH_SHORT).show()
        start(ctx, Intent(Intent.ACTION_DIAL, Uri.parse("tel:+" + intl(mobile))), "Could not open the phone")
    }

    /** WhatsApp chat with that number, with [text] already typed (empty = just open the chat). */
    fun whatsapp(ctx: Context, mobile: String, text: String = "") {
        if (!validPhone(mobile)) return Toast.makeText(ctx, "No valid mobile number saved", Toast.LENGTH_SHORT).show()
        val url = "https://wa.me/" + intl(mobile) + (if (text.isNotBlank()) "?text=" + Uri.encode(text) else "")
        start(ctx, Intent(Intent.ACTION_VIEW, Uri.parse(url)), "Could not open WhatsApp")
    }

    fun email(ctx: Context, address: String, subject: String = "", body: String = "") {
        if (!validEmail(address)) return Toast.makeText(ctx, "No valid e-mail saved", Toast.LENGTH_SHORT).show()
        val uri = Uri.parse("mailto:" + Uri.encode(address.trim()) + "?subject=" + Uri.encode(subject) + "&body=" + Uri.encode(body))
        start(ctx, Intent(Intent.ACTION_SENDTO, uri), "No e-mail app found")
    }
}

/** Call / WhatsApp / E-mail buttons. A button is shown only when that number or address is filled in. */
@Composable
fun ContactButtons(mobile: String, email: String = "", modifier: Modifier = Modifier) {
    val ctx = LocalContext.current
    Row(modifier) {
        if (Contact.validPhone(mobile)) {
            IconButton(onClick = { Contact.call(ctx, mobile) }, modifier = Modifier.size(40.dp)) {
                Icon(Icons.Filled.Call, "Call", tint = Indigo)
            }
            IconButton(onClick = { Contact.whatsapp(ctx, mobile) }, modifier = Modifier.size(40.dp)) {
                Icon(Icons.Filled.Chat, "WhatsApp", tint = Green)
            }
        }
        if (Contact.validEmail(email)) {
            IconButton(onClick = { Contact.email(ctx, email) }, modifier = Modifier.size(40.dp)) {
                Icon(Icons.Filled.Email, "E-mail", tint = Orange)
            }
        }
    }
}
