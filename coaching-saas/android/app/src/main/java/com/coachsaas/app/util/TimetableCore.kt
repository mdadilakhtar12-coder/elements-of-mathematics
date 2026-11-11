package com.coachsaas.app.util

import com.coachsaas.app.data.ClassSession
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

/** Something the timetable text can refer to: a batch or a teacher. [extra] = more words that identify it (e.g. subjects). */
data class Ref(val id: String, val name: String)

/** One class read from an Excel row or from a photo / PDF. Starts "raw"; the resolver fills ids and [issues]. */
data class TTEntry(
    var date: String = "",
    var start: String = "",
    var end: String = "",
    var batchId: String = "",
    var batchName: String = "",
    var subject: String = "",
    var teacherId: String = "",
    var teacherName: String = "",
    var room: String = "",
    var rawBatch: String = "",
    var rawTeacher: String = "",
    var issues: List<String> = emptyList(),
    var source: String = ""
) {
    /** Problems the admin must fix before this class can be saved. */
    val blocking: List<String> get() = issues.filter { it in BLOCKING }

    companion object {
        const val NO_DATE = "date"
        const val NO_TIME = "time"
        const val NO_BATCH = "batch"
        const val UNKNOWN_TEACHER = "teacher"
        const val EXISTS = "exists"
        val BLOCKING = setOf(NO_DATE, NO_TIME, NO_BATCH, UNKNOWN_TEACHER, EXISTS)
    }
}

/** One recognised line of text with its position in the picture (from the on-device text reader). */
data class OcrLine(val text: String, val left: Int, val top: Int, val right: Int, val bottom: Int)

/** Everything the parser needs to know about the institute. */
data class TTContext(
    val batches: List<Ref>,
    val teachers: List<Ref>,
    val subjects: List<String>,
    /** batchId -> subject -> teacherId, from the batch's own plan (used when the sheet leaves the teacher empty). */
    val plans: Map<String, Map<String, String>> = emptyMap(),
    val defaultDate: String = "",
    val today: LocalDate = LocalDate.now()
)

object TT {

    // ------------------------------------------------------------------ dates and times

    private val MONTH_NAMES = listOf(
        "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"
    )

    /** Month number for a full month name or its 3-letter / "sept" short form. Other words ("Marketing") are not months. */
    private fun monthOf(word: String): Int? {
        val w = word.lowercase().trimEnd('.')
        for ((i, full) in MONTH_NAMES.withIndex()) {
            if (w == full || w == full.take(3) || (w == "sept" && i == 8)) return i + 1
        }
        return null
    }

    private fun mk(y: Int, m: Int, d: Int): String? = try {
        LocalDate.of(if (y < 100) 2000 + y else y, m, d).toString()
    } catch (e: Exception) {
        null
    }

    /** yyyy-MM-dd from 2026-11-12, 12/11/2026, 12-11-26, 12.11.2026, "12 Nov 2026", "Nov 12", an Excel date number, ... */
    fun parseDate(raw: String, today: LocalDate = LocalDate.now()): String? {
        val s = raw.trim().replace(",", " ").replace(Regex("\\s+"), " ")
        if (s.isEmpty()) return null
        // Excel stores dates as a day count (46338 = 12 Nov 2026)
        Regex("^(\\d{5})(\\.0+)?$").find(s)?.let { m ->
            val n = m.groupValues[1].toLong()
            if (n in 30000..80000) return LocalDate.of(1899, 12, 30).plusDays(n).toString()
        }
        Regex("^(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})$").find(s)?.let { return mk(it.groupValues[1].toInt(), it.groupValues[2].toInt(), it.groupValues[3].toInt()) }
        Regex("^(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})$").find(s)?.let { return mk(it.groupValues[3].toInt(), it.groupValues[2].toInt(), it.groupValues[1].toInt()) }
        Regex("(\\d{1,2})(?:st|nd|rd|th)?[ -]([A-Za-z]{3,9})\\.?(?:[ -](\\d{4}|\\d{2}))?").find(s)?.let { m ->
            val mo = monthOf(m.groupValues[2]) ?: return@let
            val y = m.groupValues[3].ifEmpty { today.year.toString() }.toInt()
            return mk(y, mo, m.groupValues[1].toInt())
        }
        Regex("([A-Za-z]{3,9})\\.? (\\d{1,2})(?:st|nd|rd|th)?(?: (\\d{4}))?").find(s)?.let { m ->
            val mo = monthOf(m.groupValues[1]) ?: return@let
            val y = m.groupValues[3].ifEmpty { today.year.toString() }.toInt()
            return mk(y, mo, m.groupValues[2].toInt())
        }
        return null
    }

    private val DATE_PATTERNS = listOf(
        Regex("\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}"),
        Regex("\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}"),
        Regex("\\d{1,2}(?:st|nd|rd|th)?[ -][A-Za-z]{3,9}\\.?(?:[ -]\\d{4})?"),
        Regex("[A-Za-z]{3,9}\\.? \\d{1,2}(?:st|nd|rd|th)?(?:,? \\d{4})?")
    )

    /** The line with every real date cut out (so "12-11-2026" is not mistaken for a time range). */
    fun stripDates(line: String, today: LocalDate = LocalDate.now()): String {
        var out = line
        for (p in DATE_PATTERNS) out = p.replace(out) { m -> if (parseDate(m.value, today) != null) "  " else m.value }
        return out
    }

    /** Finds a date written anywhere in a line of text. */
    fun findDate(line: String, today: LocalDate = LocalDate.now()): String? {
        val patterns = DATE_PATTERNS
        for (p in patterns) {
            for (m in p.findAll(line)) parseDate(m.value, today)?.let { return it }
        }
        return null
    }

    /**
     * HH:mm from 16:00, 4:00 PM, 4pm, 4.30 pm, 1600 or an Excel time fraction (0.6667).
     * Without am/pm, 1 to 6 is taken as afternoon (classes do not start at 4 in the night).
     */
    fun parseTime(raw: String): String? {
        val s = raw.trim().lowercase().replace(" ", "")
        if (s.isEmpty()) return null
        Regex("^0?\\.\\d+$").find(s)?.let {
            val frac = s.toDouble()
            val mins = Math.round(frac * 24 * 60).toInt() % (24 * 60)
            return "%02d:%02d".format(mins / 60, mins % 60)
        }
        val m = Regex("^(\\d{1,2})(?:[:.](\\d{2}))?(?::\\d{2})?(am|pm|a\\.m\\.|p\\.m\\.)?$").find(s)
            ?: Regex("^(\\d{2})(\\d{2})()$").find(s) ?: return null
        var h = m.groupValues[1].toInt()
        val min = m.groupValues[2].ifEmpty { "0" }.toInt()
        val ap = m.groupValues[3].replace(".", "")
        if (h > 24 || min > 59) return null
        when (ap) {
            "pm" -> if (h < 12) h += 12
            "am" -> if (h == 12) h = 0
            else -> if (h in 1..6) h += 12
        }
        if (h == 24) h = 0
        return "%02d:%02d".format(h, min)
    }

    private val RANGE = Regex(
        "(?<![\\d/.:-])(\\d{1,2}(?:[:.]\\d{2})?\\s*(?:a\\.?m\\.?|p\\.?m\\.?)?)\\s*(?:-|–|—|to|till|until)\\s*(\\d{1,2}(?:[:.]\\d{2})?\\s*(?:a\\.?m\\.?|p\\.?m\\.?)?)(?![\\d/:])(?!\\.\\d)(?!-\\d)",
        RegexOption.IGNORE_CASE
    )

    /** (start, end) from "4-5 PM", "4:00 PM - 5:30 PM", "16:00-17:00", "4 to 5". Also returns the text span it came from. */
    fun findRange(line: String): Triple<String, String, IntRange>? {
        for (m in RANGE.findAll(line)) {
            var a = m.groupValues[1].trim()
            var b = m.groupValues[2].trim()
            val sa = Regex("(?i)[ap]\\.?m").containsMatchIn(a)
            val sb = Regex("(?i)[ap]\\.?m").containsMatchIn(b)
            // "4-5 PM": the suffix belongs to both
            if (!sa && sb) a += " " + Regex("(?i)([ap])\\.?m").find(b)!!.groupValues[1] + "m"
            // a lone 24-hour clash such as "12-2" is read as 12:00 - 14:00
            val s = parseTime(a) ?: continue
            val e = parseTime(b) ?: continue
            if (s >= e) continue // "12-11" is a date or a score, not a class time
            return Triple(s, e, m.range)
        }
        return null
    }

    // ------------------------------------------------------------------ names

    private val NOISE = setOf("class", "std", "standard", "batch", "the", "of", "and", "sir", "madam", "mam", "maam", "ma'am", "mr", "mrs", "ms", "miss", "dr", "prof", "ji", "teacher")

    fun tokens(s: String): List<String> =
        s.lowercase()
            .replace(Regex("(\\d)(st|nd|rd|th)\\b"), "$1")
            .replace(Regex("[^a-z0-9\\u0900-\\u097F]+"), " ")
            .split(" ")
            .filter { it.isNotEmpty() && it !in NOISE }

    /** How much of [name] shows up in [text]: 0.0 to 1.0. A word counts when it matches or is a prefix of one (sci ~ science). */
    fun score(name: String, text: String): Double {
        val nt = tokens(name)
        if (nt.isEmpty()) return 0.0
        val tt = tokens(text)
        val hit = nt.count { n ->
            tt.any { t -> t == n || (t.length >= 3 && n.startsWith(t)) || (n.length >= 3 && t.startsWith(n) && t.length - n.length <= 2) }
        }
        return hit.toDouble() / nt.size
    }

    /** The single best match above [min], or null when nothing matches or two are equally good. */
    fun best(refs: List<Ref>, text: String, min: Double): Ref? {
        if (text.isBlank()) return null
        val scored = refs.map { it to score(it.name, text) }.filter { it.second >= min }
        if (scored.isEmpty()) return null
        val top = scored.maxOf { it.second }
        val tops = scored.filter { it.second == top }
        if (tops.size == 1) return tops[0].first
        // same score: prefer the one that names more words (11th Science A over 11th)
        val longest = tops.maxOf { tokens(it.first.name).size }
        val l = tops.filter { tokens(it.first.name).size == longest }
        return if (l.size == 1) l[0].first else null
    }

    fun matchBatch(ctx: TTContext, text: String): Ref? = best(ctx.batches, text, 0.75)
    fun matchTeacher(ctx: TTContext, text: String): Ref? = best(ctx.teachers, text, 0.5)

    /** A subject of the institute named in the text ("Maths" ~ "Mathematics"). */
    fun matchSubject(ctx: TTContext, text: String): String {
        val tt = tokens(text)
        if (tt.isEmpty()) return ""
        val hits = ctx.subjects.filter { sub ->
            val st = tokens(sub)
            st.isNotEmpty() && st.all { s -> tt.any { t -> t == s || (t.length >= 4 && (s.startsWith(t) || t.startsWith(s))) } }
        }
        return hits.maxByOrNull { it.length } ?: ""
    }

    private val ROOM = Regex("(?i)\\b(?:room|rm)\\.?[ :.-]*(?:no\\.?)?[ :.-]*([A-Za-z0-9-]{1,8})\\b|\\bR[ .-]?(\\d{1,3}[A-Za-z]?)\\b")

    /** "Room 3", "Rm 12", "Room Lab A" (first word only) or "R-12" -> the room part. Empty when none is written. */
    fun findRoom(line: String): String {
        val m = ROOM.find(line) ?: return ""
        return m.groupValues[1].ifEmpty { m.groupValues[2] }
    }

    // ------------------------------------------------------------------ finishing an entry

    /** Re-checks one entry (after the admin edits it): fills what can be filled and lists what is still wrong. */
    fun revalidate(e: TTEntry, ctx: TTContext): TTEntry {
        val issues = ArrayList<String>()
        if (e.date.isBlank()) issues.add(TTEntry.NO_DATE)
        if (e.start.isBlank() || e.end.isBlank() || e.start >= e.end) issues.add(TTEntry.NO_TIME)
        if (e.batchId.isBlank()) issues.add(TTEntry.NO_BATCH)
        // teacher left empty: take the one planned for this subject in the batch
        if (e.teacherId.isBlank() && e.rawTeacher.isBlank() && e.batchId.isNotBlank() && e.subject.isNotBlank()) {
            ctx.plans[e.batchId]?.get(e.subject)?.takeIf { it.isNotBlank() }?.let { id ->
                e.teacherId = id
                e.teacherName = ctx.teachers.firstOrNull { it.id == id }?.name.orEmpty()
            }
        }
        if (e.teacherId.isBlank() && e.rawTeacher.isNotBlank()) issues.add(TTEntry.UNKNOWN_TEACHER)
        e.issues = issues
        return e
    }

    // ------------------------------------------------------------------ Excel / CSV

    private fun colIndex(header: List<String>, vararg keys: String): Int =
        header.indexOfFirst { h -> keys.any { k -> h == k || h.startsWith(k) } }

    /** Reads a sheet: one class per row. Headings: Date, Start, End (or Time), Batch, Subject, Teacher, Room. */
    fun fromTable(rows: List<List<String>>, ctx: TTContext): List<TTEntry> {
        if (rows.isEmpty()) return emptyList()
        val head = rows[0].map { it.trim().lowercase() }
        var cDate = colIndex(head, "date", "day")
        var cStart = colIndex(head, "start", "from")
        var cEnd = colIndex(head, "end", "to")
        val cTime = colIndex(head, "time")
        var cBatch = colIndex(head, "batch", "class", "group")
        var cSubject = colIndex(head, "subject")
        var cTeacher = colIndex(head, "teacher", "faculty")
        var cRoom = colIndex(head, "room", "place", "venue")
        val hasHeader = cDate >= 0 || cBatch >= 0 || cSubject >= 0 || cTeacher >= 0
        val data: List<List<String>>
        if (hasHeader) {
            data = rows.drop(1)
        } else {
            data = rows
            cDate = 0; cStart = 1; cEnd = 2; cBatch = 3; cSubject = 4; cTeacher = 5; cRoom = 6
        }
        val out = ArrayList<TTEntry>()
        for (r in data) {
            if (r.all { it.isBlank() }) continue
            fun cell(i: Int) = if (i >= 0) r.getOrNull(i).orEmpty().trim() else ""
            val e = TTEntry(source = "excel")
            e.date = parseDate(cell(cDate), ctx.today) ?: ""
            if (cTime >= 0 && cStart < 0) {
                findRange(cell(cTime))?.let { e.start = it.first; e.end = it.second }
            } else {
                e.start = parseTime(cell(cStart)) ?: ""
                e.end = parseTime(cell(cEnd)) ?: ""
            }
            e.rawBatch = cell(cBatch)
            matchBatch(ctx, e.rawBatch)?.let { e.batchId = it.id; e.batchName = it.name }
            e.subject = cell(cSubject).let { s -> matchSubject(ctx, s).ifEmpty { s } }
            e.rawTeacher = cell(cTeacher)
            matchTeacher(ctx, e.rawTeacher)?.let { e.teacherId = it.id; e.teacherName = it.name }
            e.room = cell(cRoom)
            out.add(revalidate(e, ctx))
        }
        return out
    }

    // ------------------------------------------------------------------ photo / PDF text

    /** Joins the recognised pieces of text into table rows: pieces at about the same height form one row, left to right. */
    fun groupRows(lines: List<OcrLine>): List<String> {
        if (lines.isEmpty()) return emptyList()
        val heights = lines.map { (it.bottom - it.top).coerceAtLeast(1) }.sorted()
        val median = heights[heights.size / 2]
        val tolerance = median * 0.6
        val sorted = lines.sortedBy { (it.top + it.bottom) / 2 }
        val rows = ArrayList<MutableList<OcrLine>>()
        for (l in sorted) {
            val cy = (l.top + l.bottom) / 2.0
            val row = rows.lastOrNull()
            if (row != null && Math.abs(cy - row.map { (it.top + it.bottom) / 2.0 }.average()) <= tolerance) row.add(l) else rows.add(mutableListOf(l))
        }
        return rows.map { r -> r.sortedBy { it.left }.joinToString("  ") { it.text.trim() }.trim() }.filter { it.isNotBlank() }
    }

    /**
     * Reads rows of text from a photo or PDF. A row with a time is a class. A row with only a batch name, or only a date,
     * sets the batch / date for the rows below it (timetables are often written that way). Everything is checked
     * by the admin before it is saved.
     */
    fun fromLines(lines: List<String>, ctx: TTContext): List<TTEntry> {
        val out = ArrayList<TTEntry>()
        var curDate = ctx.defaultDate
        var curBatch: Ref? = null
        for (raw in lines) {
            val line = raw.replace('|', ' ').trim()
            if (line.isEmpty()) continue
            val date = findDate(line, ctx.today)
            val noDate = stripDates(line, ctx.today)
            val range = findRange(noDate)
            val batch = matchBatch(ctx, line)
            if (range == null) {
                // a heading line
                if (date != null) curDate = date
                if (batch != null) curBatch = batch
                continue
            }
            val e = TTEntry(source = "photo")
            e.start = range.first
            e.end = range.second
            // do not let the time or date digits confuse the name matching
            val rest = noDate.removeRange(range.third)
            e.date = date ?: curDate
            if (date != null) curDate = date
            val b = batch ?: curBatch
            if (b != null) { e.batchId = b.id; e.batchName = b.name }
            if (batch != null) curBatch = batch
            e.rawBatch = if (b == null) rest else b.name
            val t = matchTeacher(ctx, rest)
            if (t != null) { e.teacherId = t.id; e.teacherName = t.name }
            e.subject = matchSubject(ctx, rest)
            e.room = findRoom(rest)
            e.rawTeacher = ""
            out.add(revalidate(e, ctx))
        }
        return out
    }

    // ------------------------------------------------------------------ checks against the existing timetable

    private fun overlaps(aS: String, aE: String, bS: String, bE: String) = aS < bE && bS < aE

    fun classId(batchId: String, subject: String, date: String, start: String) =
        batchId + "_" + subject.filter { it.isLetterOrDigit() } + "_" + date + "_" + start.replace(":", "")

    /**
     * Marks entries that already exist and returns one warning per clash:
     * the same teacher or the same batch in two classes at the same time (inside the new list or against what is saved).
     */
    fun check(entries: List<TTEntry>, existing: List<ClassSession>): List<String> {
        val warnings = ArrayList<String>()
        val live = existing.filter { it.status != "cancelled" }
        val ids = existing.map { it.id }.toSet()
        for (e in entries) {
            if (e.blocking.isNotEmpty() && e.issues.none { it == TTEntry.EXISTS }) { /* still checked below */ }
            if (e.batchId.isNotBlank() && e.date.isNotBlank() && e.start.isNotBlank() &&
                classId(e.batchId, e.subject, e.date, e.start) in ids
            ) {
                e.issues = e.issues + TTEntry.EXISTS
            }
        }
        val usable = entries.filter { TTEntry.NO_DATE !in it.issues && TTEntry.NO_TIME !in it.issues && TTEntry.EXISTS !in it.issues }
        for ((i, a) in usable.withIndex()) {
            for (b in usable.drop(i + 1)) {
                if (a.date != b.date || !overlaps(a.start, a.end, b.start, b.end)) continue
                if (a.teacherId.isNotBlank() && a.teacherId == b.teacherId) warnings.add(a.teacherName + " has two classes on " + a.date + " at " + a.start + " and " + b.start)
                if (a.batchId.isNotBlank() && a.batchId == b.batchId) warnings.add(a.batchName + " has two classes on " + a.date + " at " + a.start + " and " + b.start)
            }
            for (c in live) {
                if (c.date != a.date || !overlaps(a.start, a.end, c.start, c.end)) continue
                if (a.teacherId.isNotBlank() && a.teacherId == c.teacherId) warnings.add(a.teacherName + " is already teaching " + c.batchName + " on " + a.date + " at " + c.start)
                if (a.batchId.isNotBlank() && a.batchId == c.batchId) warnings.add(a.batchName + " already has a class on " + a.date + " at " + c.start)
            }
        }
        return warnings.distinct()
    }

    // ------------------------------------------------------------------ WhatsApp texts

    private fun dayLabel(date: String): String = try {
        val d = LocalDate.parse(date)
        d.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + ", " + d.dayOfMonth + " " +
            d.month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.year
    } catch (e: Exception) {
        date
    }

    private fun time12(t: String): String = try {
        val h = t.substringBefore(":").toInt()
        val m = t.substringAfter(":")
        (if (h % 12 == 0) 12 else h % 12).toString() + ":" + m + (if (h < 12) " AM" else " PM")
    } catch (e: Exception) {
        t
    }

    private fun classLine(c: ClassSession, showBatch: Boolean, showTeacher: Boolean): String =
        listOf(
            time12(c.start) + " - " + time12(c.end),
            if (showBatch) c.batchName else "",
            c.subject,
            if (showTeacher) c.teacherName else "",
            if (c.room.isNotBlank()) "Room " + c.room else ""
        ).filter { it.isNotBlank() }.joinToString(" - ")

    private fun body(classes: List<ClassSession>, showBatch: Boolean, showTeacher: Boolean): String =
        classes.filter { it.status != "cancelled" }.sortedWith(compareBy({ it.date }, { it.start })).groupBy { it.date }.entries
            .joinToString("\n\n") { (d, list) -> dayLabel(d) + "\n" + list.joinToString("\n") { classLine(it, showBatch, showTeacher) } }

    /** What one teacher is sent: their classes, with batch, subject and room. */
    fun teacherMessage(teacherName: String, classes: List<ClassSession>, institute: String): String =
        "Hello " + teacherName + ", your timetable at " + institute + ":\n\n" + body(classes, true, false)

    /** What a batch's students are sent: the classes of that batch, with subject, teacher and room. */
    fun batchMessage(batchName: String, classes: List<ClassSession>, institute: String): String =
        "Timetable for " + batchName + " (" + institute + "):\n\n" + body(classes, false, true)
}
