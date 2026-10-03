package com.elementsofmathematics.app.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

object Links {
    private val driveFile = Regex("""drive\.google\.com/file/d/([A-Za-z0-9_-]+)""")
    private val driveOpen = Regex("""drive\.google\.com/(?:open|uc)\?(?:.*&)?id=([A-Za-z0-9_-]+)""")

    /** Turns Google Drive "share" links into direct download links. Other links are returned as-is. */
    fun directPdfUrl(url: String): String {
        val id = driveFile.find(url)?.groupValues?.get(1) ?: driveOpen.find(url)?.groupValues?.get(1)
        return if (id != null) "https://drive.google.com/uc?export=download&confirm=t&id=$id" else url.trim()
    }

    fun open(context: Context, url: String) {
        if (url.isBlank()) return
        val fixed = if (url.startsWith("http") || url.contains("://")) url else "https://$url"
        try {
            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fixed)))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "No app found to open this link", Toast.LENGTH_SHORT).show()
        }
    }

    fun sendFeedback(context: Context, email: String, appTitle: String) {
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:")).apply {
            putExtra(Intent.EXTRA_EMAIL, arrayOf(email))
            putExtra(Intent.EXTRA_SUBJECT, "Feedback: $appTitle")
        }
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "No email app found", Toast.LENGTH_SHORT).show()
        }
    }

    fun shareApp(context: Context, appTitle: String) {
        val link = "https://play.google.com/store/apps/details?id=${context.packageName}"
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, "Study smarter with $appTitle – books, notes and video lectures in one app.\n$link")
        }
        context.startActivity(Intent.createChooser(intent, "Share via"))
    }

    fun rateApp(context: Context) {
        try {
            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=${context.packageName}")))
        } catch (e: ActivityNotFoundException) {
            open(context, "https://play.google.com/store/apps/details?id=${context.packageName}")
        }
    }
}
