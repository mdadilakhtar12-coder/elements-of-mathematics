package com.coachsaas.app.util

import android.content.Context
import com.coachsaas.app.data.Feature
import com.coachsaas.app.data.Institute
import com.coachsaas.app.data.Repo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/** Exports every collection as a CSV (opens in Excel) inside one zip file. */
object Backup {
    /** collection -> plan feature it belongs to (null = core, always included). */
    private val COLLECTIONS = listOf(
        "users" to null, "batches" to null, "classes" to null, "attendance" to null, "homework" to null, "notices" to null,
        "exams" to Feature.EXAMS, "marks" to Feature.EXAMS, "leaderboards" to Feature.EXAMS,
        "fees" to Feature.FEES, "ledger" to Feature.ACCOUNTS, "salaryPaid" to Feature.ACCOUNTS,
        "materials" to Feature.STUDY, "leaves" to Feature.LEAVES
    )

    suspend fun create(ctx: Context, institute: Institute?): File = withContext(Dispatchers.IO) {
        val dir = File(ctx.cacheDir, "reports")
        dir.mkdirs()
        val out = File(dir, "Backup-" + (institute?.id ?: "institute") + "-" + D.today() + ".zip")
        ZipOutputStream(out.outputStream()).use { z ->
            for ((col, feature) in COLLECTIONS) {
                if (feature != null && institute?.has(feature) != true) continue
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
