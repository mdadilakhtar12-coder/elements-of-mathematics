package com.aspirescience.academy.data

import android.content.Context
import android.net.Uri
import android.util.Xml
import org.xmlpull.v1.XmlPullParser
import java.io.ByteArrayInputStream
import java.util.zip.ZipInputStream

/** Reads the first sheet of an .xlsx file, or a .csv file, into rows of plain strings. */
object Tables {

    fun read(ctx: Context, uri: Uri): List<List<String>> {
        val bytes = ctx.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return emptyList()
        val isZip = bytes.size > 4 && bytes[0] == 'P'.code.toByte() && bytes[1] == 'K'.code.toByte()
        return if (isZip) readXlsx(bytes) else readCsv(String(bytes, Charsets.UTF_8))
    }

    private fun readCsv(raw: String): List<List<String>> {
        val text = raw.removePrefix("﻿")
        val first = text.lineSequence().firstOrNull().orEmpty()
        val commas = first.count { it == ',' }
        val sep = when {
            first.count { it == ';' } > commas -> ';'
            first.count { it == '\t' } > commas -> '\t'
            else -> ','
        }
        return text.lineSequence().filter { it.isNotBlank() }.map { parseLine(it, sep) }.toList()
    }

    private fun parseLine(line: String, sep: Char): List<String> {
        val out = ArrayList<String>()
        val sb = StringBuilder()
        var quoted = false
        var i = 0
        while (i < line.length) {
            val ch = line[i]
            if (quoted) {
                if (ch == '"') {
                    if (i + 1 < line.length && line[i + 1] == '"') {
                        sb.append('"')
                        i++
                    } else {
                        quoted = false
                    }
                } else {
                    sb.append(ch)
                }
            } else if (ch == '"') {
                quoted = true
            } else if (ch == sep) {
                out.add(sb.toString().trim())
                sb.setLength(0)
            } else {
                sb.append(ch)
            }
            i++
        }
        out.add(sb.toString().trim())
        return out
    }

    private fun readXlsx(bytes: ByteArray): List<List<String>> {
        val files = HashMap<String, ByteArray>()
        ZipInputStream(ByteArrayInputStream(bytes)).use { zis ->
            var e = zis.nextEntry
            while (e != null) {
                if (e.name == "xl/sharedStrings.xml" || e.name.startsWith("xl/worksheets/sheet")) {
                    files[e.name] = zis.readBytes()
                }
                e = zis.nextEntry
            }
        }
        val shared = files["xl/sharedStrings.xml"]?.let { parseShared(it) } ?: emptyList()
        val sheetName = files.keys.filter { it.startsWith("xl/worksheets/sheet") }.minOrNull() ?: return emptyList()
        val sheet = files[sheetName] ?: return emptyList()
        return parseSheet(sheet, shared)
    }

    private fun parseShared(b: ByteArray): List<String> {
        val p = Xml.newPullParser()
        p.setInput(ByteArrayInputStream(b), null)
        val out = ArrayList<String>()
        var sb: StringBuilder? = null
        var inT = false
        var ev = p.eventType
        while (ev != XmlPullParser.END_DOCUMENT) {
            if (ev == XmlPullParser.START_TAG) {
                if (p.name == "si") sb = StringBuilder()
                if (p.name == "t") inT = true
            } else if (ev == XmlPullParser.TEXT) {
                if (inT) sb?.append(p.text)
            } else if (ev == XmlPullParser.END_TAG) {
                if (p.name == "t") inT = false
                if (p.name == "si") {
                    out.add(sb?.toString() ?: "")
                    sb = null
                }
            }
            ev = p.next()
        }
        return out
    }

    private fun colIndex(ref: String?): Int {
        if (ref == null) return -1
        var n = 0
        for (ch in ref) {
            if (ch.isLetter()) n = n * 26 + (ch.uppercaseChar() - 'A' + 1) else break
        }
        return n - 1
    }

    private fun parseSheet(b: ByteArray, shared: List<String>): List<List<String>> {
        val p = Xml.newPullParser()
        p.setInput(ByteArrayInputStream(b), null)
        val rows = ArrayList<List<String>>()
        var cur = ArrayList<String>()
        var col = 0
        var type = ""
        var inV = false
        val txt = StringBuilder()
        var ev = p.eventType
        while (ev != XmlPullParser.END_DOCUMENT) {
            if (ev == XmlPullParser.START_TAG) {
                when (p.name) {
                    "row" -> cur = ArrayList()
                    "c" -> {
                        type = p.getAttributeValue(null, "t") ?: ""
                        val ci = colIndex(p.getAttributeValue(null, "r"))
                        col = if (ci >= 0) ci else cur.size
                        txt.setLength(0)
                    }
                    "v", "t" -> inV = true
                }
            } else if (ev == XmlPullParser.TEXT) {
                if (inV) txt.append(p.text)
            } else if (ev == XmlPullParser.END_TAG) {
                when (p.name) {
                    "v", "t" -> inV = false
                    "c" -> {
                        val raw = txt.toString()
                        val v = if (type == "s") shared.getOrNull(raw.trim().toIntOrNull() ?: -1) ?: "" else raw
                        while (cur.size < col) cur.add("")
                        if (cur.size == col) cur.add(v.trim()) else cur[col] = v.trim()
                    }
                    "row" -> rows.add(cur)
                }
            }
            ev = p.next()
        }
        return rows.filter { r -> r.any { it.isNotBlank() } }
    }
}
