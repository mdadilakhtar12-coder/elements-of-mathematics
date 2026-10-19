package com.aspirescience.academy.util

import com.aspirescience.academy.data.Attendance
import com.aspirescience.academy.data.Batch
import com.aspirescience.academy.data.CS
import com.aspirescience.academy.data.ClassSession
import com.aspirescience.academy.data.Exam
import com.aspirescience.academy.data.Fee
import com.aspirescience.academy.data.Doubt
import com.aspirescience.academy.data.Homework
import com.aspirescience.academy.data.StudyMaterial
import com.aspirescience.academy.data.LedgerEntry
import com.aspirescience.academy.data.Paper
import com.aspirescience.academy.data.Mark
import com.aspirescience.academy.data.Notice
import com.aspirescience.academy.data.Repo
import com.aspirescience.academy.data.Role
import com.aspirescience.academy.data.SubjectPlan
import com.aspirescience.academy.data.UserProfile
import com.aspirescience.academy.data.WeeklySlot
import kotlinx.coroutines.delay
import java.time.LocalDate
import java.time.ZoneId
import java.util.Random

/** Fills the app with sample teachers, students, batches, classes, attendance, exams, fees and notices. */
object Demo {
    const val PASSWORD = "demo123"
    private const val PREFIX = "demo_"

    private val FIRST = listOf(
        "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan", "Kabir", "Ananya", "Diya",
        "Aisha", "Meera", "Riya", "Sana", "Zoya", "Kavya", "Isha", "Priya", "Nisha", "Tara", "Neel", "Yash"
    )
    private val LAST = listOf("Patel", "Shah", "Mehta", "Joshi", "Desai", "Khan", "Shaikh", "Ansari", "Sharma", "Verma", "Trivedi", "Parmar")

    private class Sub(val subject: String, val teacher: Int, val days: List<Int>, val hourOffset: Int = 0)
    private class BDef(val id: String, val name: String, val std: String, val hour: Int, val size: Int, val fee: Long, val subs: List<Sub>)

    private val BATCHES = listOf(
        BDef(
            "demo_b1", "11th Science - Group A", "11th Science", 16, 18, 1800,
            listOf(Sub("Physics", 0, listOf(1, 4)), Sub("Chemistry", 1, listOf(2, 5)), Sub("Maths", 2, listOf(3, 6)), Sub("Biology", 3, listOf(1, 4), 1))
        ),
        BDef(
            "demo_b2", "11th Science - Group B", "11th Science", 17, 17, 1800,
            listOf(Sub("Physics", 0, listOf(1, 4)), Sub("Chemistry", 1, listOf(2, 5)), Sub("Maths", 2, listOf(3, 6)), Sub("English", 4, listOf(1, 4), 1))
        ),
        BDef(
            "demo_b3", "12th Science - Group A", "12th Science", 18, 16, 2200,
            listOf(Sub("Physics", 0, listOf(1, 4)), Sub("Chemistry", 1, listOf(2, 5)), Sub("Maths", 2, listOf(3, 6)), Sub("Biology", 3, listOf(1, 4), 1))
        ),
        BDef(
            "demo_b4", "12th Science - Group B", "12th Science", 19, 18, 2200,
            listOf(Sub("Physics", 0, listOf(1, 4)), Sub("Chemistry", 1, listOf(2, 5)), Sub("Maths", 2, listOf(3, 6)), Sub("English", 4, listOf(1, 4), 1))
        ),
        BDef(
            "demo_b5", "10th - Foundation", "10th", 15, 15, 1200,
            listOf(Sub("Maths", 2, listOf(3, 6)), Sub("Science", 3, listOf(1, 4)), Sub("English", 4, listOf(2, 5)))
        )
    )

    private fun hh(h: Int) = h.toString().padStart(2, '0') + ":00"

    private suspend fun createUser(login: String): String {
        var last: Exception? = null
        repeat(3) {
            try {
                val uid = Repo.createAuthUser(login, PASSWORD)
                delay(120)
                return uid
            } catch (e: Exception) {
                last = e
                delay(2000)
            }
        }
        throw last ?: IllegalStateException("Could not create a demo user")
    }

    suspend fun load(progress: (String) -> Unit): String {
        val rnd = Random(7)
        val now = System.currentTimeMillis()
        val today = LocalDate.now()

        // ---- teachers
        val tdefs = listOf(
            "Rakesh Sharma" to "Physics", "Neha Verma" to "Chemistry", "Imran Qureshi" to "Maths",
            "Pooja Desai" to "Biology", "Vikas Joshi" to "English"
        )
        val teachers = ArrayList<UserProfile>()
        tdefs.forEachIndexed { i, def ->
            progress("Creating teachers " + (i + 1) + " / " + tdefs.size)
            val login = "900000000" + (i + 1)
            val uid = createUser(login)
            val p = UserProfile(
                id = uid, role = Role.TEACHER, name = def.first, loginId = login, mobile = login,
                subjects = def.second, classRate = 400, demo = true, createdAt = now
            )
            Repo.put("users", p)
            Repo.setPassword(uid, login, Role.TEACHER, PASSWORD)
            teachers.add(p)
        }

        // ---- batches
        val batches = BATCHES.map { d ->
            Batch(
                id = d.id, name = d.name, standard = d.std,
                subjects = d.subs.map { s ->
                    val t = teachers[s.teacher]
                    SubjectPlan(
                        s.subject, t.id, t.name,
                        s.days.map { day -> WeeklySlot(day, hh(d.hour + s.hourOffset), hh(d.hour + s.hourOffset + 1)) }
                    )
                }
            )
        }
        batches.forEach { Repo.put("batches", it) }

        // ---- students
        val total = BATCHES.sumOf { it.size }
        val students = ArrayList<UserProfile>()
        var gi = 0
        for (d in BATCHES) {
            for (k in 0 until d.size) {
                progress("Creating students " + (gi + 1) + " / " + total)
                val login = "9100000" + (gi + 1).toString().padStart(3, '0')
                val uid = createUser(login)
                val p = UserProfile(
                    id = uid, role = Role.STUDENT, name = FIRST[gi % 24] + " " + LAST[(gi / 24 + gi * 5) % 12],
                    loginId = login, mobile = login, rollNo = (k + 1).toString(), standard = d.std,
                    parentMobile = "9200000" + (gi + 1).toString().padStart(3, '0'), monthlyFee = d.fee,
                    batchIds = listOf(d.id), demo = true, createdAt = now - 70L * 24 * 3600 * 1000
                )
                Repo.put("users", p)
                Repo.setPassword(uid, login, Role.STUDENT, PASSWORD)
                students.add(p)
                gi++
            }
        }
        val bias = students.associate { it.id to (0.72 + rnd.nextDouble() * 0.26) }
        val ability = students.associate { it.id to (0.40 + rnd.nextDouble() * 0.55) }

        // ---- classes and attendance (last 14 days and next 14 days)
        progress("Creating classes and attendance")
        val classes = ArrayList<ClassSession>()
        val attendance = ArrayList<Attendance>()
        for (b in batches) {
            val kids = students.filter { b.id in it.batchIds }
            for (plan in b.plans()) {
                for (slot in plan.weekly) {
                    for (off in -14..14) {
                        val date = today.plusDays(off.toLong())
                        if (date.dayOfWeek.value != slot.day) continue
                        val id = b.id + "_" + plan.subject.filter { it.isLetterOrDigit() } + "_" + date + "_" + slot.start.replace(":", "")
                        var status = when {
                            off <= -2 -> CS.APPROVED
                            off == -1 -> CS.TAKEN
                            else -> CS.SCHEDULED
                        }
                        if (off != 0 && rnd.nextInt(25) == 0) status = CS.CANCELLED
                        val takenAt = date.atTime(20, 0).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
                        val held = status == CS.APPROVED || status == CS.TAKEN
                        classes.add(
                            ClassSession(
                                id = id, batchId = b.id, batchName = b.name, subject = plan.subject,
                                teacherId = plan.teacherId, teacherName = plan.teacherName,
                                date = date.toString(), start = slot.start, end = slot.end, status = status,
                                takenBy = if (held) plan.teacherName else "", takenAt = if (held) takenAt else 0L,
                                approvedBy = if (status == CS.APPROVED) "Admin" else ""
                            )
                        )
                        if (held) {
                            for (s in kids) {
                                val r = rnd.nextDouble()
                                val pr = bias[s.id] ?: 0.85
                                val st = if (r < pr) "P" else if (r < pr + (1 - pr) * 0.3) "L" else "A"
                                attendance.add(
                                    Attendance(
                                        id = id + "_" + s.id, classId = id, batchId = b.id, batchName = b.name,
                                        subject = plan.subject, studentId = s.id, studentName = s.name,
                                        date = date.toString(), status = st
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }
        Repo.putAll("classes", classes)
        Repo.putAll("attendance", attendance)

        // ---- exams (several papers each), marks, leaderboards
        var examNo = 0
        for (b in batches) {
            val kids = students.filter { b.id in it.batchIds }
            val plans = b.plans()
            val defs = listOf(Triple("Unit Test 1", -25, 30L), Triple("Monthly Test", -6, 50L), Triple("Unit Test 3", 5, 50L))
            defs.forEach { def ->
                examNo++
                progress("Creating exams and marks " + examNo + " / " + (batches.size * defs.size))
                val papers = ArrayList<Paper>()
                for (p in plans) {
                    if (p.subject == "Biology") {
                        papers.add(Paper("Botany", def.third / 2))
                        papers.add(Paper("Zoology", def.third / 2))
                    } else {
                        papers.add(Paper(p.subject, def.third))
                    }
                }
                val ex = Exam(
                    id = PREFIX + "e" + examNo, name = def.first, batchId = b.id, batchName = b.name,
                    subject = papers.joinToString(", ") { it.subject }, date = today.plusDays(def.second.toLong()).toString(),
                    maxMarks = papers.sumOf { it.maxMarks }, papers = papers
                )
                if (def.second < 0) {
                    val marks = ArrayList<Mark>()
                    val pcts = ArrayList<Double>()
                    for (s in kids) {
                        var obtained = 0.0
                        var maxSum = 0L
                        for (p in papers) {
                            val absent = rnd.nextInt(60) == 0
                            val raw = p.maxMarks * ((ability[s.id] ?: 0.6) + (rnd.nextDouble() - 0.5) * 0.18)
                            val v = Math.round(raw.coerceIn(0.0, p.maxMarks.toDouble()) * 2) / 2.0
                            if (!absent) {
                                obtained += v
                                maxSum += p.maxMarks
                            }
                            marks.add(
                                Mark(
                                    id = ex.id + "_" + s.id + "_" + p.subject, examId = ex.id, examName = ex.name,
                                    subject = p.subject, date = ex.date, maxMarks = p.maxMarks, batchId = b.id,
                                    studentId = s.id, studentName = s.name, marks = if (absent) 0.0 else v, absent = absent
                                )
                            )
                        }
                        if (maxSum > 0) pcts.add(obtained * 100.0 / maxSum)
                    }
                    ex.average = if (pcts.isEmpty()) 0.0 else pcts.average()
                    ex.highest = pcts.maxOrNull() ?: 0.0
                    ex.appeared = pcts.size.toLong()
                    Repo.put("exams", ex)
                    Repo.putAll("marks", marks)
                } else {
                    Repo.put("exams", ex)
                }
            }
            Repo.rebuildLeaderboard(b.id, b.name)
        }

        // ---- accounts: other income and expenses of the last 3 months
        progress("Creating accounts entries")
        val ledger = ArrayList<LedgerEntry>()
        var ln = 0
        fun entry(type: String, month: String, day: Int, cat: String, note: String, amt: Long) {
            ln++
            val date = month + "-" + day.toString().padStart(2, '0')
            ledger.add(LedgerEntry(PREFIX + "l" + ln, type, date, month, cat, note, amt, "Admin", now - ln * 1000L))
        }
        val lm0 = D.thisMonth()
        for (m in listOf(D.shiftMonth(lm0, -2), D.shiftMonth(lm0, -1), lm0)) {
            val cap = if (m == lm0) minOf(today.dayOfMonth, 28) else 28
            entry("expense", m, 1, "Room rent", "Monthly rent", 25000)
            entry("expense", m, minOf(5, cap), "Electricity", "", 3500L + rnd.nextInt(1500))
            entry("expense", m, minOf(5, cap), "Internet", "Broadband", 1200)
            entry("expense", m, minOf(8, cap), "Advertisement", "Pamphlets and banners", 6000L + rnd.nextInt(3000))
            entry("expense", m, minOf(10, cap), "Stationery (pen, pencil, chalk)", "", 1800L + rnd.nextInt(1200))
            entry("expense", m, minOf(12, cap), "Marketing", "Social media promotion", 4000L + rnd.nextInt(3000))
        }
        entry("income", D.shiftMonth(lm0, -1), 6, "Admission fee", "New admissions", 12000)
        entry("income", lm0, 4, "Books and material", "Study material sale", 4500)
        Repo.putAll("ledger", ledger)

        // ---- fees
        progress("Creating fee payments")
        val m0 = D.thisMonth()
        val m1 = D.shiftMonth(m0, -1)
        val m2 = D.shiftMonth(m0, -2)
        val modes = listOf("Cash", "UPI", "UPI", "Bank Transfer")
        val fees = ArrayList<Fee>()
        var fn = 0
        for (s in students) {
            val plan = listOf(Triple(m2, 0.97, 1.0), Triple(m1, 0.90, 1.0), Triple(m0, 0.55, if (rnd.nextInt(4) == 0) 0.5 else 1.0))
            for (p in plan) {
                if (rnd.nextDouble() > p.second) continue
                fn++
                val day = if (p.first == m0) today.toString() else p.first + "-0" + (3 + rnd.nextInt(6))
                fees.add(
                    Fee(
                        id = PREFIX + "f" + fn, studentId = s.id, studentName = s.name,
                        amount = (s.monthlyFee * p.third).toLong(), month = p.first, date = day,
                        mode = modes[rnd.nextInt(modes.size)], receivedBy = "Admin", createdAt = now - fn * 1000L
                    )
                )
            }
        }
        Repo.putAll("fees", fees)

        // ---- study material and doubts
        progress("Creating study material and doubts")
        val b0 = batches[0]
        val mats = listOf(
            StudyMaterial("demo_m1", b0.id, b0.name, "Physics", "Kinematics notes", "Short notes of the chapter with solved examples.", "https://www.khanacademy.org/science/physics", "Notes", teachers[0].id, teachers[0].name, now - 9 * 3600_000L),
            StudyMaterial("demo_m2", b0.id, b0.name, "Chemistry", "Periodic table video", "Watch before the next class.", "https://www.youtube.com/results?search_query=periodic+table+class+11", "Video", teachers[1].id, teachers[1].name, now - 8 * 3600_000L),
            StudyMaterial("demo_m3", b0.id, b0.name, "Maths", "Practice paper 1", "Solve in 90 minutes.", "https://www.ncert.nic.in", "Practice paper", teachers[2].id, teachers[2].name, now - 7 * 3600_000L),
            StudyMaterial("demo_m4", batches[2].id, batches[2].name, "Biology", "Cell division diagrams", "Diagrams for revision.", "https://www.khanacademy.org/science/biology", "Notes", teachers[3].id, teachers[3].name, now - 6 * 3600_000L),
            StudyMaterial("demo_m5", batches[4].id, batches[4].name, "English", "Letter writing formats", "Formal and informal letter formats.", "https://www.ncert.nic.in", "PDF", teachers[4].id, teachers[4].name, now - 5 * 3600_000L)
        )
        Repo.putAll("materials", mats)
        val kids0 = students.filter { b0.id in it.batchIds }
        val doubts = listOf(
            Doubt("demo_d1", kids0[0].id, kids0[0].name, b0.id, b0.name, "Physics", "Sir, how do we find the displacement when the acceleration is not constant?", false, "Use integration of the velocity function. We will also do an example in the next class.", teachers[0].name, now - 20 * 3600_000L, "answered", now - 30 * 3600_000L),
            Doubt("demo_d2", kids0[1].id, kids0[1].name, b0.id, b0.name, "Chemistry", "What is the difference between electron affinity and electronegativity?", false, "", "", 0, "open", now - 4 * 3600_000L),
            Doubt("demo_d3", kids0[2].id, kids0[2].name, b0.id, b0.name, "Maths", "Please explain question 7 of exercise 4.2 again.", false, "", "", 0, "open", now - 2 * 3600_000L)
        )
        Repo.putAll("doubts", doubts)

        // ---- announcements and homework
        progress("Creating announcements and homework")
        val notices = listOf(
            Notice("demo_n1", "Welcome to Aspire Science Academy", "Classes run as per the timetable in the app. Please check it daily.", "", "", "Admin", now - 5 * 3600_000L),
            Notice("demo_n2", "Sunday holiday", "There will be no classes this Sunday. Regular classes resume on Monday.", "", "", "Admin", now - 3 * 3600_000L),
            Notice("demo_n3", "Unit test next week", "Unit Test 3 is on " + D.pretty(today.plusDays(5).toString()) + ". Syllabus: chapters 1 to 4.", batches[0].id, batches[0].name, "Admin", now - 3600_000L)
        )
        Repo.putAll("notices", notices)
        val hw = listOf(
            Homework("demo_h1", batches[0].id, batches[0].name, "Physics numericals", "Solve Q1 to Q12 from the practice sheet.", today.plusDays(2).toString(), "", teachers[0].id, teachers[0].name, now - 4 * 3600_000L),
            Homework("demo_h2", batches[0].id, batches[0].name, "Chemistry notes", "Write the notes of Chapter 3 neatly.", today.plusDays(3).toString(), "", teachers[1].id, teachers[1].name, now - 6 * 3600_000L),
            Homework("demo_h3", batches[1].id, batches[1].name, "Maths exercise 4.2", "All questions of exercise 4.2.", today.plusDays(1).toString(), "", teachers[2].id, teachers[2].name, now - 2 * 3600_000L),
            Homework("demo_h4", batches[2].id, batches[2].name, "Biology diagrams", "Draw and label the diagrams from Chapter 5.", today.plusDays(4).toString(), "", teachers[3].id, teachers[3].name, now - 8 * 3600_000L),
            Homework("demo_h5", batches[4].id, batches[4].name, "English letter writing", "Write a formal letter to your principal.", today.plusDays(2).toString(), "", teachers[4].id, teachers[4].name, now - 7 * 3600_000L)
        )
        Repo.putAll("homework", hw)

        return "Demo data is ready.\n\n" +
            "Teachers: " + teachers.size + "\nStudents: " + students.size + "\nBatches: " + batches.size + "\n" +
            "Classes: " + classes.size + "\nAttendance records: " + attendance.size + "\nFee payments: " + fees.size + "\n\n" +
            "Logins (password " + PASSWORD + "):\nTeachers 9000000001 to 9000000005\nStudents 9100000001 to 91000000" + students.size
    }

    suspend fun remove(users: List<UserProfile>, progress: (String) -> Unit): String {
        for (col in listOf("attendance", "marks", "fees", "ledger", "doubts", "materials", "classes", "exams", "homework", "notices", "leaderboards", "batches")) {
            progress("Removing demo $col")
            Repo.deleteAll(col, Repo.idsWithPrefix(col, PREFIX))
        }
        val demoUsers = users.filter { it.demo }
        demoUsers.forEachIndexed { i, u ->
            progress("Removing demo users " + (i + 1) + " / " + demoUsers.size)
            Repo.deleteUser(u)
        }
        return "Demo data removed. Your own data was not touched."
    }
}
