import { z } from "zod";
import { all, where, getDoc, col } from "../db.js";
import {
  def, ok, findUser, findBatch, studentsOfBatch, accountsFor, dueFor, templates,
} from "../core.js";
import {
  today, addDays, thisMonth, shiftMonth, plansOf, papersOf, examTotal, rs, monthLabel, last10,
  fillTemplate, whatsappLink, ACADEMY, DAY_NAMES,
} from "../logic.js";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const monthStr = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM");

const brief = (u, batches) => ({
  id: u.id, name: u.name, mobile: u.mobile || u.loginId, rollNo: u.rollNo || "", standard: u.standard || "",
  batches: (u.batchIds || []).map((id) => batches.find((b) => b.id === id)?.name).filter(Boolean),
  monthlyFee: u.monthlyFee || 0, parentMobile: u.parentMobile || "", active: u.active !== false,
});

export function register(server) {
  def(server, "academy_overview",
    "Quick picture of the academy today: number of students/teachers/batches, today's classes, classes waiting for approval, fees pending this month and this month's profit or loss.",
    {}, async () => {
      const [users, batches, classes, pending, doubts] = await Promise.all([
        all("users"), all("batches"), where("classes", "date", "==", today()),
        where("classes", "status", "==", "taken"), where("doubts", "status", "==", "open"),
      ]);
      const students = users.filter((u) => u.role === "student" && u.active !== false);
      const month = thisMonth();
      const feesForMonth = await where("fees", "month", "==", month);
      const due = dueFor(users.filter((u) => u.role === "student"), feesForMonth, month);
      const acc = await accountsFor(month);
      return ok({
        today: today(), students: students.length,
        teachers: users.filter((u) => u.role === "teacher" && u.active !== false).length,
        batches: batches.length,
        classesToday: classes.sort((a, b) => a.start.localeCompare(b.start)).map((c) => `${c.start} ${c.subject} - ${c.batchName} (${c.teacherName || "no teacher"}) [${c.status}]`),
        classesWaitingApproval: pending.length, openDoubts: doubts.length,
        feesPendingThisMonth: { students: due.length, amount: due.reduce((a, d) => a + d.due, 0) },
        thisMonthAccounts: { moneyIn: acc.moneyIn, moneyOut: acc.moneyOut, result: acc.result, amount: Math.abs(acc.net) },
      });
    });

  def(server, "list_students",
    "List students. Filter by batch (name) or search text (name / mobile / roll number).",
    { batch: z.string().optional(), search: z.string().optional(), include_inactive: z.boolean().optional(), limit: z.number().optional() },
    async ({ batch, search, include_inactive, limit }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      let list = users.filter((u) => u.role === "student");
      if (!include_inactive) list = list.filter((u) => u.active !== false);
      if (batch) { const b = findBatch(batches, batch); list = list.filter((u) => (u.batchIds || []).includes(b.id)); }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(q) || (u.mobile || "").includes(search) || u.rollNo === search);
      }
      list.sort((a, b) => a.name.localeCompare(b.name));
      return ok({ count: list.length, students: list.slice(0, limit || 100).map((u) => brief(u, batches)) });
    });

  def(server, "get_student",
    "Everything about one student: profile, batches, attendance %, exam results (per exam total), fee status of the last months and open doubts. Find by name or mobile.",
    { student: z.string() }, async ({ student }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const s = findUser(users, student, "student");
      const [att, marks, fees, doubts] = await Promise.all([
        where("attendance", "studentId", "==", s.id), where("marks", "studentId", "==", s.id),
        where("fees", "studentId", "==", s.id), where("doubts", "studentId", "==", s.id),
      ]);
      const present = att.filter((a) => a.status === "P").length, late = att.filter((a) => a.status === "L").length;
      const byExam = new Map();
      for (const m of marks) { if (!byExam.has(m.examId)) byExam.set(m.examId, []); byExam.get(m.examId).push(m); }
      const exams = [...byExam.values()].map((ms) => { const t = examTotal(ms); return { exam: ms[0].examName, date: ms[0].date, obtained: t.obtained, outOf: t.max, percent: Math.round(t.pct * 10) / 10, papers: ms.map((m) => `${m.subject}: ${m.absent ? "AB" : m.marks + "/" + m.maxMarks}`) }; }).sort((a, b) => (a.date < b.date ? 1 : -1));
      const months = [0, 1, 2, 3].map((i) => shiftMonth(thisMonth(), -i));
      return ok({
        profile: brief(s, batches),
        attendance: { classes: att.length, present, late, absent: att.filter((a) => a.status === "A").length, percent: att.length ? Math.round(((present + late) * 1000) / att.length) / 10 : null },
        examResults: exams,
        fees: months.map((m) => ({ month: m, due: s.monthlyFee || 0, paid: fees.filter((f) => f.month === m).reduce((a, f) => a + f.amount, 0) })),
        openDoubts: doubts.filter((d) => d.status !== "answered").map((d) => d.question),
      });
    });

  def(server, "list_teachers", "List teachers with their subjects, pay settings and batches they teach.", {}, async () => {
    const [users, batches] = await Promise.all([all("users"), all("batches")]);
    return ok(users.filter((u) => u.role === "teacher").sort((a, b) => a.name.localeCompare(b.name)).map((t) => ({
      id: t.id, name: t.name, mobile: t.mobile || t.loginId, subjects: t.subjects || "", active: t.active !== false,
      payPerClass: t.classRate || 0, fixedMonthlySalary: t.salary || 0,
      teaches: batches.flatMap((b) => plansOf(b).filter((p) => p.teacherId === t.id).map((p) => `${p.subject || "-"} (${b.name})`)),
    })));
  });

  def(server, "get_teacher",
    "One teacher's classes for a month (completed / waiting approval / not taken / cancelled), pay and whether it is paid.",
    { teacher: z.string(), month: monthStr.optional() }, async ({ teacher, month }) => {
      const users = await all("users");
      const t = findUser(users, teacher, "teacher");
      const m = month || thisMonth();
      const classes = (await where("classes", "teacherId", "==", t.id)).filter((c) => c.date.startsWith(m));
      const approved = classes.filter((c) => c.status === "approved").length;
      const rec = await getDoc("salaryPaid", `${m}_${t.id}`);
      return ok({
        teacher: t.name, month: m, completed: approved,
        waitingApproval: classes.filter((c) => c.status === "taken").length,
        notTaken: classes.filter((c) => ["scheduled", "rejected"].includes(c.status) && c.date < today()).length,
        cancelled: classes.filter((c) => c.status === "cancelled").length,
        pay: { amount: approved * (t.classRate || 0) + (t.salary || 0), perClass: t.classRate || 0, fixedSalary: t.salary || 0 },
        paid: rec ? { on: rec.date, amount: rec.amount, mode: rec.mode } : false,
      });
    });

  def(server, "list_batches", "All batches with subjects, teachers, timetable and student count.", {}, async () => {
    const [users, batches] = await Promise.all([all("users"), all("batches")]);
    return ok(batches.sort((a, b) => a.name.localeCompare(b.name)).map((b) => ({
      id: b.id, name: b.name, standard: b.standard,
      students: users.filter((u) => u.role === "student" && u.active !== false && (u.batchIds || []).includes(b.id)).length,
      subjects: plansOf(b).map((p) => ({ subject: p.subject, teacher: p.teacherName || null, days: (p.weekly || []).map((w) => `${DAY_NAMES[w.day - 1]} ${w.start}-${w.end}`) })),
    })));
  });

  def(server, "get_batch", "One batch: subjects, students and upcoming classes.", { batch: z.string() }, async ({ batch }) => {
    const [users, batches] = await Promise.all([all("users"), all("batches")]);
    const b = findBatch(batches, batch);
    const classes = (await where("classes", "batchId", "==", b.id)).filter((c) => c.date >= today()).sort((a, b2) => (a.date + a.start).localeCompare(b2.date + b2.start));
    return ok({
      id: b.id, name: b.name, standard: b.standard, subjects: plansOf(b),
      students: studentsOfBatch(users, b.id).map((u) => `${u.rollNo ? u.rollNo + ". " : ""}${u.name} (${u.mobile})`),
      upcomingClasses: classes.slice(0, 20).map((c) => ({ id: c.id, when: `${c.date} ${c.start}-${c.end}`, subject: c.subject, teacher: c.teacherName, status: c.status })),
    });
  });

  def(server, "list_classes",
    "Classes between two dates (default: last 7 days to next 14 days). Filter by batch, teacher or status (scheduled, taken, approved, rejected, cancelled). Returns class ids you can use in other tools.",
    { from: date.optional(), to: date.optional(), batch: z.string().optional(), teacher: z.string().optional(), status: z.string().optional(), limit: z.number().optional() },
    async ({ from, to, batch, teacher, status, limit }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const snap = await col("classes").where("date", ">=", from || addDays(today(), -7)).where("date", "<=", to || addDays(today(), 14)).get();
      let list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      if (batch) { const b = findBatch(batches, batch); list = list.filter((c) => c.batchId === b.id); }
      if (teacher) { const t = findUser(users, teacher, "teacher"); list = list.filter((c) => c.teacherId === t.id); }
      if (status) list = list.filter((c) => c.status === status);
      list.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
      return ok({ count: list.length, classes: list.slice(0, limit || 100).map((c) => ({ id: c.id, date: c.date, time: `${c.start}-${c.end}`, subject: c.subject, batch: c.batchName, teacher: c.teacherName, status: c.status, topic: c.topic })) });
    });

  def(server, "get_attendance_report",
    "Attendance percentages and absences. Filter by batch and/or student and a date range (default last 30 days).",
    { batch: z.string().optional(), student: z.string().optional(), from: date.optional(), to: date.optional() },
    async ({ batch, student, from, to }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const snap = await col("attendance").where("date", ">=", from || addDays(today(), -30)).where("date", "<=", to || today()).get();
      let list = snap.docs.map((d) => d.data());
      if (batch) { const b = findBatch(batches, batch); list = list.filter((a) => a.batchId === b.id); }
      if (student) { const s = findUser(users, student, "student"); list = list.filter((a) => a.studentId === s.id); }
      const per = new Map();
      for (const a of list) {
        const r = per.get(a.studentId) || { name: a.studentName, classes: 0, present: 0, late: 0, absent: 0, absentOn: [] };
        r.classes++;
        if (a.status === "P") r.present++; else if (a.status === "L") r.late++; else { r.absent++; r.absentOn.push(`${a.date} ${a.subject || ""}`.trim()); }
        per.set(a.studentId, r);
      }
      const rows = [...per.values()].map((r) => ({ ...r, percent: Math.round(((r.present + r.late) * 1000) / r.classes) / 10 })).sort((a, b) => a.percent - b.percent);
      return ok({ students: rows.length, lowestFirst: rows });
    });

  async function findExam(ref, batchRef) {
    const [exams, batches] = await Promise.all([all("exams"), all("batches")]);
    let list = exams;
    if (batchRef) { const b = findBatch(batches, batchRef); list = list.filter((e) => e.batchId === b.id); }
    const q = ref.toLowerCase();
    let m = list.filter((e) => e.id === ref || e.name.toLowerCase() === q);
    if (!m.length) m = list.filter((e) => e.name.toLowerCase().includes(q));
    if (!m.length) throw new Error(`No exam found for "${ref}".`);
    if (m.length > 1) throw new Error(`${m.length} exams match "${ref}": ${m.map((e) => `${e.name} (${e.batchName}, ${e.date})`).join("; ")}. Say which batch.`);
    return m[0];
  }

  def(server, "list_exams", "Exams, optionally of one batch. Shows papers, date and class average.", { batch: z.string().optional() }, async ({ batch }) => {
    const [exams, batches] = await Promise.all([all("exams"), all("batches")]);
    let list = exams;
    if (batch) { const b = findBatch(batches, batch); list = list.filter((e) => e.batchId === b.id); }
    return ok(list.sort((a, b) => (a.date < b.date ? 1 : -1)).map((e) => ({
      id: e.id, name: e.name, batch: e.batchName, date: e.date, papers: papersOf(e).map((p) => `${p.subject} ${p.maxMarks}`),
      totalMarks: papersOf(e).reduce((a, p) => a + p.maxMarks, 0), appeared: e.appeared || 0, averagePercent: e.appeared ? Math.round(e.average * 10) / 10 : null,
    })));
  });

  def(server, "get_exam_results",
    "Full result of an exam: every student's marks in each paper, total, percentage and rank.",
    { exam: z.string().describe("Exam name or id"), batch: z.string().optional().describe("Needed if several batches have an exam with the same name") },
    async ({ exam, batch }) => {
      const e = await findExam(exam, batch);
      const [users, marks] = await Promise.all([all("users"), where("marks", "examId", "==", e.id)]);
      const kids = studentsOfBatch(users, e.batchId);
      const rows = kids.map((s) => {
        const ms = marks.filter((m) => m.studentId === s.id);
        const t = examTotal(ms);
        return { student: s.name, roll: s.rollNo || "", ...Object.fromEntries(papersOf(e).map((p) => { const m = ms.find((x) => x.subject === p.subject); return [p.subject, m ? (m.absent ? "AB" : m.marks) : null]; })), total: ms.length ? `${t.obtained}/${t.max}` : null, percent: t.max ? Math.round(t.pct * 10) / 10 : null };
      });
      rows.sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1));
      rows.forEach((r, i) => { r.rank = r.percent == null ? null : i + 1; });
      return ok({ exam: e.name, batch: e.batchName, date: e.date, papers: papersOf(e), results: rows });
    });

  def(server, "get_leaderboard", "Top students of a batch (average percentage over all exams).", { batch: z.string(), top: z.number().optional() }, async ({ batch, top }) => {
    const b = findBatch(await all("batches"), batch);
    const lb = await getDoc("leaderboards", b.id);
    if (!lb) return ok("No leaderboard yet. It appears after exam marks are saved.");
    return ok({ batch: b.name, ranking: lb.entries.slice(0, top || 10).map((e, i) => ({ rank: i + 1, name: e.name, percent: Math.round(e.pct * 10) / 10, exams: e.exams })) });
  });

  def(server, "fees_overview",
    "Fees of a month (default this month): collected, who still owes how much, and all payments.",
    { month: monthStr.optional() }, async ({ month }) => {
      const m = month || thisMonth();
      const [users, forMonth] = await Promise.all([all("users"), where("fees", "month", "==", m)]);
      const due = dueFor(users.filter((u) => u.role === "student"), forMonth, m);
      return ok({
        month: m, collectedForThisMonth: forMonth.reduce((a, f) => a + f.amount, 0),
        pending: { students: due.length, amount: due.reduce((a, d) => a + d.due, 0), list: due.sort((a, b) => b.due - a.due).map((d) => ({ student: d.student.name, mobile: d.student.mobile, due: d.due, monthlyFee: d.student.monthlyFee })) },
        payments: forMonth.sort((a, b) => (a.date < b.date ? 1 : -1)).map((f) => ({ id: f.id, student: f.studentName, amount: f.amount, date: f.date, mode: f.mode })),
      });
    });

  def(server, "get_student_fees", "Payment history and month-wise status of one student.", { student: z.string() }, async ({ student }) => {
    const s = findUser(await all("users"), student, "student");
    const fees = await where("fees", "studentId", "==", s.id);
    return ok({
      student: s.name, monthlyFee: s.monthlyFee || 0, totalPaid: fees.reduce((a, f) => a + f.amount, 0),
      months: [0, 1, 2, 3, 4, 5].map((i) => { const m = shiftMonth(thisMonth(), -i); const paid = fees.filter((f) => f.month === m).reduce((a, f) => a + f.amount, 0); return { month: m, paid, status: !s.monthlyFee ? "-" : paid >= s.monthlyFee ? "Paid" : paid > 0 ? "Partial" : "Due" }; }),
      payments: fees.sort((a, b) => (a.date < b.date ? 1 : -1)).map((f) => ({ id: f.id, amount: f.amount, forMonth: f.month, date: f.date, mode: f.mode })),
    });
  });

  def(server, "accounts_summary",
    "Accounts of a month (default this month): money in (student fees + other income), money out (your expenses + teacher pay), profit or loss, fees still to collect, and teacher pay with paid / not paid.",
    { month: monthStr.optional() }, async ({ month }) => ok(await accountsFor(month || thisMonth())));

  def(server, "list_content",
    "List announcements, homework, study material or doubts. kind = notices | homework | materials | doubts. For doubts you can filter status = open | answered.",
    { kind: z.enum(["notices", "homework", "materials", "doubts"]), batch: z.string().optional(), status: z.string().optional(), limit: z.number().optional() },
    async ({ kind, batch, status, limit }) => {
      let list = await all(kind);
      if (batch) { const b = findBatch(await all("batches"), batch); list = list.filter((x) => x.batchId === b.id || (kind === "notices" && !x.batchId)); }
      if (status) list = list.filter((x) => x.status === status);
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return ok(list.slice(0, limit || 30).map(({ id, ...r }) => ({ id, ...r })));
    });

  def(server, "draft_parent_message",
    "Prepare a WhatsApp message for a parent (absent, fee reminder, exam result or general) using the academy's message texts. Returns the text and a wa.me link. Nothing is sent.",
    {
      student: z.string(), kind: z.enum(["absent", "fee", "result", "general"]),
      date: date.optional().describe("absent: date of the class"), subject: z.string().optional(),
      month: monthStr.optional().describe("fee: month"), exam: z.string().optional().describe("result: exam name"),
    },
    async ({ student, kind, date: d, subject, month, exam }) => {
      const users = await all("users");
      const s = findUser(users, student, "student");
      const t = await templates();
      const base = { student: s.name, academy: ACADEMY };
      let text;
      if (kind === "absent") text = fillTemplate(t.absent, { ...base, date: d || today(), subject: subject || "scheduled" });
      else if (kind === "fee") {
        const m = month || thisMonth();
        const paid = (await where("fees", "studentId", "==", s.id)).filter((f) => f.month === m).reduce((a, f) => a + f.amount, 0);
        text = fillTemplate(t.feeDue, { ...base, month: monthLabel(m), amount: rs(Math.max(0, (s.monthlyFee || 0) - paid)) });
      } else if (kind === "result") {
        if (!exam) throw new Error("Tell me which exam.");
        const e = await findExam(exam, (await all("batches")).find((b) => (s.batchIds || []).includes(b.id))?.name);
        const tt = examTotal((await where("marks", "examId", "==", e.id)).filter((m) => m.studentId === s.id));
        text = fillTemplate(t.result, { ...base, exam: e.name, marks: tt.obtained, max: tt.max });
      } else text = fillTemplate(t.general, base);
      const number = s.parentMobile || s.mobile;
      return ok({ to: `${s.name}'s parent (${number})`, message: text, whatsappLink: whatsappLink(number, text), note: "Open the link on a phone with WhatsApp and tap Send." });
    });
}
