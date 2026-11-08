package com.aspirescience.academy.util

import android.content.Context
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/** Writes a plain Excel (.xlsx) file, used for the ready-made upload formats. */
object Sheets {
    private const val NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    private const val HEAD = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n"

    private fun esc(s: String) = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

    private fun col(i: Int): String {
        var n = i
        val sb = StringBuilder()
        do {
            sb.insert(0, ('A' + n % 26))
            n = n / 26 - 1
        } while (n >= 0)
        return sb.toString()
    }

    fun xlsx(rows: List<List<String>>): ByteArray {
        val sheet = StringBuilder(HEAD)
        sheet.append("<worksheet xmlns=\"$NS\"><sheetData>")
        rows.forEachIndexed { r, row ->
            sheet.append("<row r=\"${r + 1}\">")
            row.forEachIndexed { c, v ->
                if (v.isNotEmpty()) {
                    sheet.append("<c r=\"${col(c)}${r + 1}\" t=\"inlineStr\"><is><t>${esc(v)}</t></is></c>")
                }
            }
            sheet.append("</row>")
        }
        sheet.append("</sheetData></worksheet>")

        val out = ByteArrayOutputStream()
        ZipOutputStream(out).use { z ->
            fun put(name: String, text: String) {
                z.putNextEntry(ZipEntry(name))
                z.write(text.toByteArray(Charsets.UTF_8))
                z.closeEntry()
            }
            put(
                "[Content_Types].xml",
                HEAD + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
                    "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
                    "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
                    "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>" +
                    "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>" +
                    "</Types>"
            )
            put(
                "_rels/.rels",
                HEAD + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
                    "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>" +
                    "</Relationships>"
            )
            put(
                "xl/workbook.xml",
                HEAD + "<workbook xmlns=\"$NS\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">" +
                    "<sheets><sheet name=\"Sheet1\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>"
            )
            put(
                "xl/_rels/workbook.xml.rels",
                HEAD + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
                    "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/>" +
                    "</Relationships>"
            )
            put("xl/worksheets/sheet1.xml", sheet.toString())
        }
        return out.toByteArray()
    }

    /** Saves the table as an Excel file and opens the share sheet, so it can be saved or sent. */
    fun share(ctx: Context, fileName: String, rows: List<List<String>>) {
        val dir = File(ctx.cacheDir, "reports")
        dir.mkdirs()
        val f = File(dir, fileName)
        f.writeBytes(xlsx(rows))
        Share.file(ctx, f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Upload format")
    }
}
