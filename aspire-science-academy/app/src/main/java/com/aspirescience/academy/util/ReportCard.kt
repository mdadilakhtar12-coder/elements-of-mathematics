package com.aspirescience.academy.util

import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.UserProfile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/** Builds a one-student progress report as a PDF (attendance, exam marks, fees). */
object ReportCard {
    suspend fun create(ctx: Context, s: UserProfile, batchNames: String): File = withContext(Dispatchers.IO) {
        val att = Repo.attendanceOf(s.id)
        val marks = Repo.marksOf(s.id).sortedBy { it.date }
        val fees = Repo.feesOf(s.id)

        val w = 595
        val h = 842
        val doc = PdfDocument()
        var pageNo = 1
        var page = doc.startPage(PdfDocument.PageInfo.Builder(w, h, pageNo).create())
        var c = page.canvas
        var y = 0f

        val ink = Paint().apply { color = Color.parseColor("#1B1D2E"); textSize = 12f; isAntiAlias = true }
        val bold = Paint(ink).apply { typeface = Typeface.DEFAULT_BOLD }
        val grey = Paint(ink).apply { color = Color.parseColor("#6B7080"); textSize = 10.5f }
        val title = Paint(ink).apply { typeface = Typeface.DEFAULT_BOLD; textSize = 15f; color = Color.parseColor("#4338CA") }
        val band = Paint().apply { color = Color.parseColor("#4338CA") }
        val white = Paint(ink).apply { color = Color.WHITE; typeface = Typeface.DEFAULT_BOLD; textSize = 20f }
        val line = Paint().apply { color = Color.parseColor("#E3E5F0"); strokeWidth = 1f }

        fun newPage() {
            doc.finishPage(page)
            pageNo++
            page = doc.startPage(PdfDocument.PageInfo.Builder(w, h, pageNo).create())
            c = page.canvas
            y = 50f
        }

        fun need(space: Float) {
            if (y + space > h - 50f) newPage()
        }

        c.drawRect(0f, 0f, w.toFloat(), 90f, band)
        c.drawText(AppConfig.APP_NAME.uppercase(), 40f, 42f, white)
        c.drawText("Progress Report", 40f, 70f, Paint(white).apply { textSize = 13f; typeface = Typeface.DEFAULT })
        y = 125f

        c.drawText(s.name, 40f, y, Paint(bold).apply { textSize = 18f })
        y += 20f
        val sub = listOf(s.standard, batchNames).filter { it.isNotBlank() }.joinToString("  |  ")
        if (sub.isNotBlank()) { c.drawText(sub, 40f, y, grey); y += 14f }
        if (s.rollNo.isNotBlank()) { c.drawText("Roll no: " + s.rollNo, 40f, y, grey); y += 14f }
        c.drawText("Date: " + D.pretty(D.today()), 40f, y, grey)
        y += 30f

        // Attendance
        val present = att.count { it.status == "P" }
        val late = att.count { it.status == "L" }
        val absent = att.count { it.status == "A" }
        val pct = if (att.isEmpty()) 0 else (present + late) * 100 / att.size
        c.drawText("Attendance", 40f, y, title)
        y += 18f
        if (att.isEmpty()) {
            c.drawText("No attendance recorded yet.", 40f, y, ink)
        } else {
            c.drawText("$pct%   (Present $present, Late $late, Absent $absent, of ${att.size} classes)", 40f, y, ink)
        }
        y += 30f

        // Marks
        c.drawText("Exam results", 40f, y, title)
        y += 18f
        if (marks.isEmpty()) {
            c.drawText("No exam results yet.", 40f, y, ink)
            y += 18f
        } else {
            c.drawText("Exam", 40f, y, bold); c.drawText("Subject", 230f, y, bold)
            c.drawText("Date", 320f, y, bold); c.drawText("Marks", 400f, y, bold); c.drawText("%", 480f, y, bold)
            y += 6f
            c.drawLine(40f, y, w - 40f, y, line)
            y += 14f
            for (m in marks) {
                need(20f)
                val p = if (m.maxMarks > 0 && !m.absent) Math.round(m.marks * 100.0 / m.maxMarks).toString() + "%" else "-"
                c.drawText(m.examName.take(30), 40f, y, ink)
                c.drawText(m.subject.take(14), 230f, y, ink)
                c.drawText(D.shortDate(m.date), 320f, y, ink)
                c.drawText(if (m.absent) "Absent" else fmt(m.marks) + " / " + m.maxMarks, 400f, y, ink)
                c.drawText(p, 480f, y, ink)
                y += 18f
            }
            val scored = marks.filter { !it.absent && it.maxMarks > 0 }
            if (scored.isNotEmpty()) {
                val avg = scored.sumOf { it.marks * 100.0 / it.maxMarks } / scored.size
                y += 6f
                c.drawText("Overall average: " + Math.round(avg) + "%", 40f, y, bold)
                y += 18f
            }
        }
        y += 16f

        // Fees
        need(80f)
        c.drawText("Fees", 40f, y, title)
        y += 18f
        if (s.monthlyFee > 0) { c.drawText("Monthly fee: " + D.rs(s.monthlyFee), 40f, y, ink); y += 16f }
        c.drawText("Total paid: " + D.rs(fees.sumOf { it.amount }), 40f, y, ink)
        y += 40f

        c.drawText("Generated by " + AppConfig.APP_NAME + " app", 40f, h - 30f, grey)
        doc.finishPage(page)

        val dir = File(ctx.cacheDir, "reports")
        dir.mkdirs()
        val out = File(dir, "Report-" + s.name.replace(Regex("[^A-Za-z0-9]"), "_") + ".pdf")
        out.outputStream().use { doc.writeTo(it) }
        doc.close()
        out
    }

    private fun fmt(d: Double) = if (d % 1.0 == 0.0) d.toLong().toString() else d.toString()
}
