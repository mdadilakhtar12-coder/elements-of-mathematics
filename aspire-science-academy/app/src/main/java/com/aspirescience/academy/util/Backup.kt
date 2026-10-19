package com.aspirescience.academy.util

import android.content.Context
import com.aspirescience.academy.data.Repo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/** Exports every collection as a CSV (opens in Excel) inside one zip file. */
object Backup {
    private val COLLECTIONS = listOf(
        "users", "batches", "classes", "attendance", "exams", "marks", "fees", "homework", "notices", "leaderboards"
    )

    suspend fun create(ctx: Context): File = withContext(Dispatchers.IO) {
        val dir = File(ctx.cacheDir, "reports")
        dir.mkdirs()
        val out = File(dir, "Aspire-backup-" + D.today() + ".zip")
        ZipOutputStream(out.outputStream()).use { z ->
            for (col in COLLECTIONS) {
                val rows = Repo.dump(col)
                z.putNextEntry(ZipEntry("$col.csv"))
                z.write(csv(rows).toByteArray(Charsets.UTF_8))
                z.closeEntry()
            }
        }
        out
    }

    private fun cell(v: Any?): String {
        val t = when (v) {
            null -> ""
            is List<*> -> v.joinToString("; ") { it.toString() }
            else -> v.toString()
        }
        return if (t.contains(',') || t.contains('"') || t.contains('\n')) "\"" + t.replace("\"", "\"\"") + "\"" else t
    }

    private fun csv(rows: List<Map<String, Any?>>): String {
        val keys = (listOf("id") + rows.flatMap { it.keys }.distinct().filter { it != "id" }.sorted())
        val sb = StringBuilder("﻿")
        sb.append(keys.joinToString(",")).append("\n")
        for (r in rows) sb.append(keys.joinToString(",") { cell(r[it]) }).append("\n")
        return sb.toString()
    }
}
