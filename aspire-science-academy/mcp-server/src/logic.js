// Pure helpers. They copy the rules used inside the Android app so numbers match.

export const EMAIL_DOMAIN = "aspire.app";
export const ACADEMY = "Aspire Science Academy";
export const FEE_DUE_DAY = 10;

export const DEFAULT_TEMPLATES = {
  absent:
    "Hello, {student} was absent from the {subject} class on {date}. Please make sure {student} attends the next class. - {academy}",
  feeDue:
    "Hello, this is a reminder that the {month} fee of {amount} for {student} is pending. Please pay it at your earliest convenience. - {academy}",
  result: "Hello, {student} scored {marks} out of {max} in {exam}. - {academy}",
  general: "Hello, this is a message from {academy} about {student}.",
};

const pad = (n) => String(n).padStart(2, "0");

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function thisMonth() {
  return today().slice(0, 7);
}
export function addDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
export function shiftMonth(m, n) {
  const [y, mo] = m.split("-").map(Number);
  const t = new Date(Date.UTC(y, mo - 1 + n, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`;
}
export function monthEnd(m) {
  const [y, mo] = m.split("-").map(Number);
  return `${m}-${pad(new Date(Date.UTC(y, mo, 0)).getUTCDate())}`;
}
/** 1 = Monday ... 7 = Sunday (same as the app). */
export function isoDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return w === 0 ? 7 : w;
}
export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export function dayNumber(x) {
  if (typeof x === "number") return x;
  const i = DAY_NAMES.findIndex((n) => n.toLowerCase().startsWith(String(x).trim().toLowerCase().slice(0, 3)));
  if (i < 0) throw new Error(`Unknown day: ${x}`);
  return i + 1;
}
export function monthLabel(m) {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, mo] = m.split("-").map(Number);
  return `${names[mo - 1]} ${y}`;
}
export const rs = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
export const keyOf = (s) => String(s).replace(/[^A-Za-z0-9]/g, "");
export const digits = (s) => String(s ?? "").replace(/\D/g, "");
export const last10 = (s) => digits(s).slice(-10);

export function loginEmail(id) {
  const t = String(id).trim().toLowerCase();
  return t.includes("@") ? t : `${t}@${EMAIL_DOMAIN}`;
}

/** The subjects of a batch. Batches from the first app version have one subject in the old fields. */
export function plansOf(batch) {
  if (batch.subjects?.length) return batch.subjects;
  if (batch.subject || batch.weekly?.length) {
    return [{ subject: batch.subject || "", teacherId: batch.teacherId || "", teacherName: batch.teacherName || "", weekly: batch.weekly || [] }];
  }
  return [];
}

/** Classes of a batch's weekly timetable between two dates. Ids are the same as the app's, so nothing is duplicated. */
export function classesFromTimetable(batch, from, to, existingIds = new Set()) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    for (const plan of plansOf(batch)) {
      for (const slot of plan.weekly || []) {
        if (Number(slot.day) !== isoDay(d)) continue;
        const id = `${batch.id}_${keyOf(plan.subject)}_${d}_${slot.start.replace(":", "")}`;
        if (existingIds.has(id)) continue;
        out.push({
          id, batchId: batch.id, batchName: batch.name, subject: plan.subject || "",
          teacherId: plan.teacherId || "", teacherName: plan.teacherName || "",
          date: d, start: slot.start, end: slot.end, status: "scheduled",
          topic: "", note: "", takenBy: "", takenAt: 0, approvedBy: "",
        });
      }
    }
  }
  return out;
}

export function papersOf(exam) {
  if (exam.papers?.length) return exam.papers;
  return [{ subject: exam.subject || "", maxMarks: exam.maxMarks || 0 }];
}

/** Total of one student over papers that have a mark (absent papers are left out). */
export function examTotal(marks) {
  let obtained = 0;
  let max = 0;
  for (const m of marks) {
    if (m.absent || !(m.maxMarks > 0)) continue;
    obtained += m.marks;
    max += m.maxMarks;
  }
  return { obtained, max, pct: max > 0 ? (obtained * 100) / max : 0 };
}

/** Class ranking of a batch: the average of the total percentage of each exam. */
export function leaderboardEntries(marks) {
  const byStudent = new Map();
  for (const m of marks) {
    if (m.absent || !(m.maxMarks > 0)) continue;
    if (!byStudent.has(m.studentId)) byStudent.set(m.studentId, []);
    byStudent.get(m.studentId).push(m);
  }
  const entries = [];
  for (const [studentId, ms] of byStudent) {
    const perExam = new Map();
    for (const m of ms) {
      const a = perExam.get(m.examId) || { o: 0, x: 0 };
      a.o += m.marks;
      a.x += m.maxMarks;
      perExam.set(m.examId, a);
    }
    const pcts = [...perExam.values()].map((a) => (a.o * 100) / a.x);
    entries.push({
      studentId, name: ms[0].studentName,
      pct: pcts.reduce((a, b) => a + b, 0) / pcts.length, exams: pcts.length,
    });
  }
  return entries.sort((a, b) => b.pct - a.pct).slice(0, 100);
}

/** Teacher pay for a month: approved classes x rate + fixed salary. */
export function teacherPay(teacher, approvedClassCount) {
  const rate = teacher.classRate || 0;
  const salary = teacher.salary || 0;
  return { classes: approvedClassCount, rate, salary, amount: approvedClassCount * rate + salary };
}

export function fillTemplate(text, vars) {
  let out = text;
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}

export function whatsappLink(mobile, text) {
  const d = digits(mobile);
  if (d.length < 10) return null;
  const intl = d.length > 10 ? d : `91${d.slice(-10)}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

/** "16:00", "4:00 PM", "4pm" -> "16:00". */
export function parseTime(x) {
  const m = String(x).trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) throw new Error(`Time "${x}" not understood. Use 16:00 or 4:00 PM.`);
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  if (m[3] === "pm" && h < 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) throw new Error(`Time "${x}" is not valid.`);
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
