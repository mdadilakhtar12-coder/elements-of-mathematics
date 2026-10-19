package com.aspirescience.academy.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import com.aspirescience.academy.AppConfig
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

/**
 * Texts of the WhatsApp messages. The admin can change them in the app (Message texts);
 * placeholders such as {student} are replaced when a message is created.
 */
object Messages {
    val KEYS = listOf("absent", "feeDue", "result", "general")

    val DEFAULTS = mapOf(
        "absent" to "Hello, {student} was absent from the {subject} class on {date}. " +
            "Please make sure {student} attends the next class. - {academy}",
        "feeDue" to "Hello, this is a reminder that the {month} fee of {amount} for {student} is pending. " +
            "Please pay it at your earliest convenience. - {academy}",
        "result" to "Hello, {student} scored {marks} out of {max} in {exam}. - {academy}",
        "general" to "Hello, this is a message from {academy} about {student}."
    )

    val LABELS = mapOf(
        "absent" to "When a student is absent",
        "feeDue" to "Fee reminder",
        "result" to "Exam result",
        "general" to "General message to parent"
    )

    val HELP = mapOf(
        "absent" to "{student}  {subject}  {date}  {academy}",
        "feeDue" to "{student}  {month}  {amount}  {academy}",
        "result" to "{student}  {exam}  {marks}  {max}  {academy}",
        "general" to "{student}  {academy}"
    )

    val SAMPLE = mapOf(
        "student" to "Aman Shaikh", "subject" to "Physics", "date" to "Mon, 19 Oct 2026", "month" to "Oct 2026",
        "amount" to "\u20B91,500", "exam" to "Monthly Test", "marks" to "42", "max" to "50", "academy" to AppConfig.APP_NAME
    )

    /** Texts changed by the admin; filled from Firestore by the app. */
    @Volatile
    var overrides: Map<String, String> = emptyMap()

    fun template(key: String): String = overrides[key]?.takeIf { it.isNotBlank() } ?: DEFAULTS[key].orEmpty()

    fun fill(text: String, vars: Map<String, String>): String {
        var out = text
        for ((k, v) in vars) out = out.replace("{" + k + "}", v)
        return out
    }

    fun absent(student: String, date: String, subject: String) = fill(
        template("absent"),
        mapOf("student" to student, "date" to D.pretty(date), "subject" to subject.ifBlank { "scheduled" }, "academy" to AppConfig.APP_NAME)
    )

    fun feeDue(student: String, month: String, due: Long) = fill(
        template("feeDue"),
        mapOf("student" to student, "month" to D.monthLabel(month), "amount" to D.rs(due), "academy" to AppConfig.APP_NAME)
    )

    fun result(student: String, exam: String, marks: String, max: Long) = fill(
        template("result"),
        mapOf("student" to student, "exam" to exam, "marks" to marks, "max" to max.toString(), "academy" to AppConfig.APP_NAME)
    )

    fun general(student: String) = fill(template("general"), mapOf("student" to student, "academy" to AppConfig.APP_NAME))
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
