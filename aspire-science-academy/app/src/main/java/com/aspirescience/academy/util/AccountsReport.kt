package com.aspirescience.academy.util

import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import com.aspirescience.academy.AppConfig
import com.aspirescience.academy.data.LedgerEntry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/** Monthly accounts report as a PDF, to hand over to a CA or a partner. */
object AccountsReport {
    class PayRow(val name: String, val detail: String, val amount: Long, val paid: Boolean)

    class Data(
        val month: String,
        val income: Long,
        val feeIncome: Long,
        val otherIncome: List<Pair<String, Long>>,
        val expense: Long,
        val teacherPay: Long,
        val pay: List<PayRow>,
        val manual: List<Pair<String, Long>>,
        val expected: Long,
        val received: Long,
        val entries: List<LedgerEntry>,
        val trend: List<Triple<String, Long, Long>>
    )

    suspend fun create(ctx: Context, d: Data): File = withContext(Dispatchers.IO) {
        val w = 595
        val h = 842
        val doc = PdfDocument()
        var pageNo = 1
        var page = doc.startPage(PdfDocument.PageInfo.Builder(w, h, pageNo).create())
        var c = page.canvas
        var y = 0f

        val ink = Paint().apply { color = Color.parseColor("#1B1D2E"); textSize = 11.5f; isAntiAlias = true }
        val bold = Paint(ink).apply { typeface = Typeface.DEFAULT_BOLD }
        val grey = Paint(ink).apply { color = Color.parseColor("#6B7080"); textSize = 10f }
        val title = Paint(ink).apply { typeface = Typeface.DEFAULT_BOLD; textSize = 14f; color = Color.parseColor("#4338CA") }
        val right = Paint(ink).apply { textAlign = Paint.Align.RIGHT }
        val rightBold = Paint(bold).apply { textAlign = Paint.Align.RIGHT }
        val green = Paint(rightBold).apply { color = Color.parseColor("#16A34A") }
        val red = Paint(rightBold).apply { color = Color.parseColor("#DC2626") }
        val band = Paint().apply { color = Color.parseColor("#4338CA") }
        val white = Paint(ink).apply { color = Color.WHITE; typeface = Typeface.DEFAULT_BOLD; textSize = 19f }
        val line = Paint().apply { color = Color.parseColor("#E3E5F0"); strokeWidth = 1f }
        val rx = w - 40f

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

        fun heading(text: String) {
            need(40f)
            y += 14f
            c.drawText(text, 40f, y, title)
            y += 6f
            c.drawLine(40f, y, rx, y, line)
            y += 16f
        }

        fun row(label: String, amount: Long, p: Paint = right, sub: String = "") {
            need(if (sub.isEmpty()) 18f else 30f)
            c.drawText(label, 40f, y, ink)
            c.drawText(D.rs(amount), rx, y, p)
            y += 15f
            if (sub.isNotEmpty()) {
                c.drawText(sub, 52f, y - 1f, grey)
                y += 13f
            }
        }

        c.drawRect(0f, 0f, w.toFloat(), 80f, band)
        c.drawText(AppConfig.APP_NAME.uppercase(), 40f, 38f, white)
        c.drawText("Accounts report - " + D.monthLabel(d.month), 40f, 63f, Paint(white).apply { textSize = 13f; typeface = Typeface.DEFAULT })
        y = 100f

        val net = d.income - d.expense
        c.drawText(if (net >= 0) "Profit" else "Loss", 40f, y, bold)
        c.drawText(D.rs(Math.abs(net)), rx, y, if (net >= 0) green else red)
        y += 8f

        heading("Summary")
        row("Money in", d.income, green)
        row("Money out", d.expense, red)
        row(if (net >= 0) "Profit" else "Loss", Math.abs(net), if (net >= 0) green else red)

        heading("Student fees for the month")
        row("Expected", d.expected)
        row("Received", d.received)
        row("Still to collect", (d.expected - d.received).coerceAtLeast(0))

        heading("Money in")
        row("Student fees received", d.feeIncome)
        d.otherIncome.forEach { row(it.first, it.second) }
        row("Total money in", d.income, rightBold)

        heading("Money out")
        row("Teacher pay", d.teacherPay)
        d.pay.forEach { p -> row("   " + p.name + (if (p.paid) "  (paid)" else "  (not paid yet)"), p.amount, right, p.detail) }
        d.manual.forEach { row(it.first, it.second) }
        row("Total money out", d.expense, rightBold)

        if (d.entries.isNotEmpty()) {
            heading("All entries of the month")
            for (e in d.entries.sortedBy { it.date }) {
                need(18f)
                c.drawText(D.shortDate(e.date), 40f, y, grey)
                c.drawText((e.category + (if (e.note.isNotBlank()) " - " + e.note else "")).take(52), 100f, y, ink)
                c.drawText((if (e.type == "income") "+" else "-") + D.rs(e.amount), rx, y, if (e.type == "income") green else red)
                y += 15f
            }
        }

        heading("Last 6 months")
        for (t in d.trend) {
            need(18f)
            val n = t.second - t.third
            c.drawText(t.first, 40f, y, ink)
            c.drawText("in " + D.rs(t.second), 190f, y, ink)
            c.drawText("out " + D.rs(t.third), 330f, y, ink)
            c.drawText((if (n >= 0) "+" else "-") + D.rs(Math.abs(n)), rx, y, if (n >= 0) green else red)
            y += 15f
        }

        need(30f)
        c.drawText("Generated by " + AppConfig.APP_NAME + " app on " + D.pretty(D.today()), 40f, h - 28f, grey)
        doc.finishPage(page)

        val dir = File(ctx.cacheDir, "reports")
        dir.mkdirs()
        val out = File(dir, "Accounts-" + d.month + ".pdf")
        out.outputStream().use { doc.writeTo(it) }
        doc.close()
        out
    }
}
