package com.coachsaas.app.util

import com.coachsaas.app.data.ClassSession
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class TimetableCoreTest {
    private val today = LocalDate.of(2026, 11, 10)
    private val ctx = TTContext(
        batches = listOf(Ref("b1", "11th Science A"), Ref("b2", "11th Science B"), Ref("b3", "12th Commerce"), Ref("b4", "Computer Class")),
        teachers = listOf(Ref("t1", "Rahul Verma"), Ref("t2", "Neha Singh"), Ref("t3", "Amit Kumar"), Ref("t4", "Amit Shah")),
        subjects = listOf("Physics", "Chemistry", "Mathematics", "Accounts", "English"),
        plans = mapOf("b1" to mapOf("Physics" to "t1")),
        defaultDate = "2026-11-12", today = today
    )

    @Test fun dates() {
        assertEquals("2026-11-12", TT.parseDate("2026-11-12", today))
        assertEquals("2026-11-12", TT.parseDate("12/11/2026", today))
        assertEquals("2026-11-12", TT.parseDate("12-11-26", today))
        assertEquals("2026-11-12", TT.parseDate("12.11.2026", today))
        assertEquals("2026-11-12", TT.parseDate("12 Nov 2026", today))
        assertEquals("2026-11-12", TT.parseDate("12th November", today))
        assertEquals("2026-11-12", TT.parseDate("Nov 12", today))
        assertEquals("2026-11-12", TT.parseDate("46338", today)) // Excel serial
        assertNull(TT.parseDate("31/02/2026", today))
        assertNull(TT.parseDate("hello", today))
        assertEquals("2026-11-12", TT.findDate("Wed 12 Nov 2026 timetable", today))
    }

    @Test fun times() {
        assertEquals("16:00", TT.parseTime("16:00"))
        assertEquals("16:00", TT.parseTime("4:00 PM"))
        assertEquals("16:30", TT.parseTime("4.30pm"))
        assertEquals("16:00", TT.parseTime("4"))      // afternoon by default
        assertEquals("09:00", TT.parseTime("9"))
        assertEquals("09:00", TT.parseTime("9 am"))
        assertEquals("12:00", TT.parseTime("12"))
        assertEquals("00:30", TT.parseTime("12:30 am"))
        assertEquals("16:00", TT.parseTime("1600"))
        assertEquals("16:00", TT.parseTime("0.666667")) // Excel fraction
        assertNull(TT.parseTime("25:00"))
        assertNull(TT.parseTime("abc"))
    }

    @Test fun ranges() {
        assertEquals("16:00" to "17:00", TT.findRange("Physics 4-5 PM")!!.let { it.first to it.second })
        assertEquals("16:00" to "17:30", TT.findRange("4:00 PM - 5:30 PM")!!.let { it.first to it.second })
        assertEquals("16:00" to "17:00", TT.findRange("16:00-17:00 Room 3")!!.let { it.first to it.second })
        assertEquals("09:00" to "10:00", TT.findRange("9 to 10 am")!!.let { it.first to it.second })
        assertNull(TT.findRange("Rahul Sir Physics"))
    }

    @Test fun batchMatching() {
        assertEquals("b1", TT.matchBatch(ctx, "11th Science A")?.id)
        assertEquals("b1", TT.matchBatch(ctx, "11 sci A")?.id)
        assertEquals("b2", TT.matchBatch(ctx, "Class 11 Science B Physics")?.id)
        assertEquals("b3", TT.matchBatch(ctx, "12th commerce")?.id)
        assertEquals("b4", TT.matchBatch(ctx, "computer")?.id)
        assertNull(TT.matchBatch(ctx, "11th Science"), "two batches equally good -> admin must choose")
        assertNull(TT.matchBatch(ctx, "Biology"))
    }

    private fun assertNull(msg: String, v: Any?) = assertEquals(msg, null, v)

    @Test fun teacherMatching() {
        assertEquals("t1", TT.matchTeacher(ctx, "Rahul Sir")?.id)
        assertEquals("t2", TT.matchTeacher(ctx, "Neha Madam")?.id)
        assertEquals("t3", TT.matchTeacher(ctx, "Amit Kumar")?.id)
        assertNull(TT.matchTeacher(ctx, "Amit Sir")) // two Amits
        assertNull(TT.matchTeacher(ctx, "Xavier"))
    }

    @Test fun excelRows() {
        val rows = listOf(
            listOf("Date", "Start", "End", "Batch", "Subject", "Teacher", "Room"),
            listOf("2026-11-12", "16:00", "17:00", "11th Science A", "Physics", "Rahul Sir", "3"),
            listOf("12/11/2026", "5:00 PM", "6:00 PM", "11th Science A", "Chemistry", "Neha", ""),
            listOf("46338", "0.666667", "0.708333", "12th Commerce", "Accounts", "", "Lab A"),
            listOf("2026-11-12", "16:00", "17:00", "Mystery batch", "Physics", "Nobody", "")
        )
        val e = TT.fromTable(rows, ctx)
        assertEquals(4, e.size)
        assertEquals("b1", e[0].batchId); assertEquals("t1", e[0].teacherId); assertEquals("3", e[0].room)
        assertTrue(e[0].issues.isEmpty())
        assertEquals("17:00", e[1].start); assertEquals("t2", e[1].teacherId)
        assertEquals("2026-11-12", e[2].date); assertEquals("16:00", e[2].start); assertEquals("17:00", e[2].end)
        assertTrue(e[3].issues.containsAll(listOf(TTEntry.NO_BATCH, TTEntry.UNKNOWN_TEACHER)))
    }

    @Test fun excelWithoutHeaderAndPlanTeacher() {
        val e = TT.fromTable(listOf(listOf("2026-11-12", "16:00", "17:00", "11th Science A", "Physics", "", "")), ctx)
        assertEquals("t1", e[0].teacherId) // taken from the batch plan
        assertTrue(e[0].issues.isEmpty())
    }

    @Test fun badTimeIsFlagged() {
        val e = TT.fromTable(listOf(listOf("Date", "Start", "End", "Batch"), listOf("2026-11-12", "17:00", "16:00", "11th Science A")), ctx)
        assertTrue(e[0].issues.contains(TTEntry.NO_TIME))
    }

    @Test fun photoLines() {
        val lines = listOf(
            "Wednesday 12 Nov 2026",
            "11th Science A",
            "4-5 PM  Physics  Rahul Sir  Room 3",
            "5-6 PM  Chemistry  Neha Madam",
            "12th Commerce",
            "4:00 PM - 5:00 PM Accounts R-12",
            "some noise without time"
        )
        val e = TT.fromLines(lines, ctx)
        assertEquals(3, e.size)
        assertEquals("2026-11-12", e[0].date); assertEquals("b1", e[0].batchId); assertEquals("t1", e[0].teacherId)
        assertEquals("Physics", e[0].subject); assertEquals("3", e[0].room); assertEquals("16:00", e[0].start)
        assertEquals("b1", e[1].batchId); assertEquals("t2", e[1].teacherId); assertEquals("17:00", e[1].start)
        assertEquals("b3", e[2].batchId); assertEquals("Accounts", e[2].subject); assertEquals("12", e[2].room)
        assertTrue(e.all { it.issues.isEmpty() })
    }

    @Test fun photoLineWithoutBatchIsFlaggedAndUsesDefaultDate() {
        val e = TT.fromLines(listOf("4-5 PM Physics Rahul"), ctx)
        assertEquals(1, e.size)
        assertEquals("2026-11-12", e[0].date)
        assertTrue(e[0].issues.contains(TTEntry.NO_BATCH))
    }

    @Test fun groupingRecognisedPiecesIntoRows() {
        val l = listOf(
            OcrLine("Physics", 200, 100, 300, 130), OcrLine("4-5 PM", 20, 102, 120, 132), OcrLine("Rahul Sir", 330, 99, 450, 131),
            OcrLine("5-6 PM", 20, 160, 120, 190), OcrLine("Chemistry", 200, 162, 320, 192)
        )
        assertEquals(listOf("4-5 PM  Physics  Rahul Sir", "5-6 PM  Chemistry"), TT.groupRows(l))
    }

    private fun cls(id: String, batch: String, bn: String, date: String, s: String, e: String, t: String, tn: String, sub: String = "Physics", status: String = "scheduled", room: String = "") =
        ClassSession(id = id, batchId = batch, batchName = bn, subject = sub, teacherId = t, teacherName = tn, date = date, start = s, end = e, status = status, room = room)

    @Test fun clashesAndExisting() {
        val existing = listOf(
            cls("b1_Physics_2026-11-12_1600", "b1", "11th Science A", "2026-11-12", "16:00", "17:00", "t1", "Rahul Verma"),
            cls("x", "b3", "12th Commerce", "2026-11-12", "18:00", "19:00", "t2", "Neha Singh", "Accounts", "cancelled")
        )
        val e = TT.fromTable(listOf(
            listOf("Date", "Start", "End", "Batch", "Subject", "Teacher"),
            listOf("2026-11-12", "16:00", "17:00", "11th Science A", "Physics", "Rahul"),     // exists
            listOf("2026-11-12", "16:30", "17:30", "12th Commerce", "Accounts", "Rahul"),     // teacher busy with existing
            listOf("2026-11-12", "18:00", "19:00", "12th Commerce", "Accounts", "Neha"),      // existing one is cancelled: fine
            listOf("2026-11-12", "18:30", "19:30", "12th Commerce", "Accounts", "Amit Kumar") // batch clash with previous new row
        ), ctx)
        val warnings = TT.check(e, existing)
        assertTrue(e[0].issues.contains(TTEntry.EXISTS))
        assertTrue(warnings.any { it.contains("Rahul Verma is already teaching") })
        assertTrue(warnings.any { it.contains("12th Commerce has two classes") })
        assertTrue(warnings.none { it.contains("Neha") })
    }

    @Test fun messages() {
        val list = listOf(
            cls("1", "b1", "11th Science A", "2026-11-12", "16:00", "17:00", "t1", "Rahul Verma", room = "3"),
            cls("2", "b2", "11th Science B", "2026-11-12", "17:00", "18:00", "t1", "Rahul Verma", "Chemistry"),
            cls("3", "b1", "11th Science A", "2026-11-13", "09:30", "10:30", "t1", "Rahul Verma"),
            cls("4", "b1", "11th Science A", "2026-11-13", "11:00", "12:00", "t1", "Rahul Verma", status = "cancelled")
        )
        val t = TT.teacherMessage("Rahul Verma", list, "Aspire")
        assertTrue(t.startsWith("Hello Rahul Verma, your timetable at Aspire:"))
        assertTrue(t.contains("Thu, 12 Nov 2026"))
        assertTrue(t.contains("4:00 PM - 5:00 PM - 11th Science A - Physics - Room 3"))
        assertTrue(t.contains("5:00 PM - 6:00 PM - 11th Science B - Chemistry"))
        assertTrue(!t.contains("Room ") || t.indexOf("Room 3") >= 0)
        assertTrue(t.contains("9:30 AM - 10:30 AM"))
        assertTrue(!t.contains("11:00 AM"), "cancelled classes are not sent")
        val b = TT.batchMessage("11th Science A", list.filter { it.batchId == "b1" }, "Aspire")
        assertTrue(b.contains("4:00 PM - 5:00 PM - Physics - Rahul Verma - Room 3"))
        assertTrue(!b.contains("11th Science A -"))
    }

    private fun assertTrue(msg: String, v: Boolean) = org.junit.Assert.assertTrue(msg, v)
}
