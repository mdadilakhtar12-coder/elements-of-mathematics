package com.aspirescience.academy.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File

/** Opens WhatsApp with a ready message (the sender taps Send). A WhatsApp API can replace this later. */
object Messenger {
    private fun intl(raw: String): String {
        val d = raw.filter { it.isDigit() }
        return if (d.length > 10) d else "91" + d.takeLast(10)
    }

    fun whatsapp(ctx: Context, mobile: String, text: String) {
        if (mobile.filter { it.isDigit() }.length < 10) {
            Toast.makeText(ctx, "No valid mobile number saved", Toast.LENGTH_SHORT).show()
            return
        }
        val uri = Uri.parse("https://wa.me/" + intl(mobile) + "?text=" + Uri.encode(text))
        try {
            ctx.startActivity(Intent(Intent.ACTION_VIEW, uri))
        } catch (e: Exception) {
            Toast.makeText(ctx, "Could not open WhatsApp", Toast.LENGTH_SHORT).show()
        }
    }
}

/** Message texts used across the app. */
object Messages {
    private const val SIGN = "\n- Aspire Science Academy"

    fun absent(student: String, date: String, subject: String) =
        "Namaste, $student " + D.pretty(date) + " ko " + subject + " ki class mein absent tha/thi. Kripya dhyan dein." + SIGN

    fun feeDue(student: String, month: String, due: Long) =
        "Namaste, $student ki " + D.monthLabel(month) + " ki fees " + D.rs(due) + " baaki hai. Kripya jald jama karein." + SIGN

    fun result(student: String, exam: String, marks: String, max: Long) =
        "Namaste, $student ne $exam mein $marks / $max marks prapt kiye hain." + SIGN

    fun general(student: String) = "Namaste, $student ke baare mein:" + SIGN
}

object Share {
    fun file(ctx: Context, f: File, mime: String, title: String) {
        val uri = FileProvider.getUriForFile(ctx, ctx.packageName + ".fileprovider", f)
        val send = Intent(Intent.ACTION_SEND)
        send.type = mime
        send.putExtra(Intent.EXTRA_STREAM, uri)
        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        val chooser = Intent.createChooser(send, title)
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(chooser)
    }
}
