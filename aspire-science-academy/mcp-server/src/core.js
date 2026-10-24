import { all, where, getDoc, col, setMany } from "./db.js";
import {
  digits, last10, plansOf, examTotal, leaderboardEntries, shiftMonth, thisMonth, monthEnd,
  DEFAULT_TEMPLATES, fillTemplate, whatsappLink, ACADEMY, rs, monthLabel,
} from "./logic.js";
import { z } from "zod";

export const READONLY = ["1", "true", "yes"].includes(String(process.env.ASPIRE_READONLY || "").toLowerCase());
export const adminName = () => process.env.ASPIRE_ADMIN_NAME || "Admin (via Claude)";

// ---------- results ----------
export const ok = (data) => ({
  content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
});
export const fail = (msg) => ({ content: [{ type: "text", text: `Error: ${msg}` }], isError: true });

/** Registers a tool. Write tools are skipped when ASPIRE_READONLY=1. */
export function def(server, name, description, shape, handler, { write = false } = {}) {
  if (write && READONLY) return;
  server.registerTool(name, { description, inputSchema: shape }, async (args) => {
    try {
      return await handler(args ?? {});
    } catch (e) {
      return fail(e?.message || String(e));
    }
  });
}

export const confirmField = z
  .boolean()
  .describe("Must be true to really do this. Ask the user to confirm first.");
export function needConfirm(confirm, what) {
  if (confirm !== true) throw new Error(`This will ${what}. Ask the user to confirm, then call again with confirm=true.`);
}

// ---------- finding things ----------
function pick(list, ref, label, describe, exact, loose) {
  const q = String(ref).trim();
  let m = list.filter((x) => exact(x, q));
  if (m.length === 0) m = list.filter((x) => loose(x, q));
  if (m.length === 0) throw new Error(`No ${label} found for "${ref}".`);
  if (m.length > 1) {
    throw new Error(
      `${m.length} ${label}s match "${ref}": ${m.slice(0, 8).map(describe).join("; ")}. Use the mobile number or exact name.`
    );
  }
  return m[0];
}

export function findUser(users, ref, role) {
  const list = role ? users.filter((u) => u.role === role) : users;
  const label = role || "user";
  return pick(
    list, ref, label, (u) => `${u.name} (${u.mobile || u.loginId})`,
    (u, q) =>
      u.id === q || (u.loginId || "").toLowerCase() === q.toLowerCase() ||
      (digits(q).length >= 5 && last10(u.mobile) === last10(q)) || (u.name || "").toLowerCase() === q.toLowerCase(),
    (u, q) => (u.name || "").toLowerCase().includes(q.toLowerCase())
  );
}

export function findBatch(batches, ref) {
  return pick(
    batches, ref, "batch", (b) => b.name,
    (b, q) => b.id === q || (b.name || "").toLowerCase() === q.toLowerCase(),
    (b, q) => (b.name || "").toLowerCase().includes(q.toLowerCase())
  );
}

export const studentsOfBatch = (users, batchId) =>
  users.filter((u) => u.role === "student" && u.active !== false && (u.batchIds || []).includes(batchId))
    .sort((a, b) => (parseInt(a.rollNo) || 1e9) - (parseInt(b.rollNo) || 1e9) || a.name.localeCompare(b.name));

// ---------- exams ----------
export async function rebuildLeaderboard(batchId, batchName) {
  const marks = await where("marks", "batchId", "==", batchId);
  const entries = leaderboardEntries(marks);
  await col("leaderboards").doc(batchId).set({ id: batchId, batchName, entries, updatedAt: Date.now() });
  return entries;
}

/** Recomputes the average / highest / appeared of an exam from its saved marks, then the batch ranking. */
export async function recomputeExam(examId) {
  const exam = await getDoc("exams", examId);
  if (!exam) throw new Error("Exam not found");
  const marks = await where("marks", "examId", "==", examId);
  const byStudent = new Map();
  for (const m of marks) {
    if (!byStudent.has(m.studentId)) byStudent.set(m.studentId, []);
    byStudent.get(m.studentId).push(m);
  }
  const pcts = [];
  for (const ms of byStudent.values()) {
    const t = examTotal(ms);
    if (t.max > 0) pcts.push(t.pct);
  }
  const average = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
  const highest = pcts.length ? Math.max(...pcts) : 0;
  await col("exams").doc(examId).update({ average, highest, appeared: pcts.length });
  await rebuildLeaderboard(exam.batchId, exam.batchName);
  return { average, highest, appeared: pcts.length };
}

// ---------- fees and accounts ----------
const monthOf = (ms) => new Date(ms).toISOString().slice(0, 7);

export function dueFor(students, feesForMonth, month) {
  const out = [];
  for (const s of students) {
    if (s.active === false || !(s.monthlyFee > 0)) continue;
    if (s.createdAt > 0 && monthOf(s.createdAt) > month) continue;
    const paid = feesForMonth.filter((f) => f.studentId === s.id).reduce((a, f) => a + f.amount, 0);
    if (s.monthlyFee - paid > 0) out.push({ student: s, due: s.monthlyFee - paid, paid });
  }
  return out;
}

export async function accountsFor(month) {
  const start = `${month}-01`;
  const end = monthEnd(month);
  const [users, feesAll, ledger, classes, paid] = await Promise.all([
    all("users"),
    col("fees").where("date", ">=", start).where("date", "<=", end).get().then((s) => s.docs.map((d) => d.data())),
    col("ledger").where("date", ">=", start).where("date", "<=", end).get().then((s) => s.docs.map((d) => d.data())),
    col("classes").where("date", ">=", start).where("date", "<=", end).get().then((s) => s.docs.map((d) => d.data())),
    where("salaryPaid", "month", "==", month),
  ]);
  const forMonth = await where("fees", "month", "==", month);
  const students = users.filter((u) => u.role === "student");
  const feeIncome = feesAll.reduce((a, f) => a + f.amount, 0);
  const income = ledger.filter((e) => e.type === "income");
  const expense = ledger.filter((e) => e.type === "expense");
  const group = (list) => {
    const m = new Map();
    for (const e of list) m.set(e.category, (m.get(e.category) || 0) + e.amount);
    return [...m].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  };
  const approved = classes.filter((c) => c.status === "approved");
  const payLines = users
    .filter((u) => u.role === "teacher" && (u.active !== false || approved.some((c) => c.teacherId === u.id)))
    .map((t) => {
      const n = approved.filter((c) => c.teacherId === t.id).length;
      const amount = n * (t.classRate || 0) + (t.salary || 0);
      const rec = paid.find((p) => p.teacherId === t.id);
      return { teacher: t.name, teacherId: t.id, classes: n, rate: t.classRate || 0, salary: t.salary || 0, amount, paid: !!rec, paidOn: rec?.date || null };
    })
    .filter((p) => p.amount > 0);
  const teacherPay = payLines.reduce((a, p) => a + p.amount, 0);
  const otherIncome = income.reduce((a, e) => a + e.amount, 0);
  const manualExpense = expense.reduce((a, e) => a + e.amount, 0);
  const moneyIn = feeIncome + otherIncome;
  const moneyOut = manualExpense + teacherPay;
  const expected = students
    .filter((s) => s.active !== false && s.monthlyFee > 0 && !(s.createdAt > 0 && monthOf(s.createdAt) > month))
    .reduce((a, s) => a + s.monthlyFee, 0);
  const received = forMonth.reduce((a, f) => a + f.amount, 0);
  return {
    month, moneyIn, moneyOut, net: moneyIn - moneyOut, result: moneyIn - moneyOut >= 0 ? "PROFIT" : "LOSS",
    studentFees: { receivedThisMonthByDate: feeIncome, expectedForMonth: expected, receivedForMonth: received, stillToCollect: Math.max(0, expected - received) },
    otherIncome: group(income), otherIncomeTotal: otherIncome,
    expenses: group(expense), expensesTotal: manualExpense,
    teacherPay: { total: teacherPay, paidSoFar: payLines.filter((p) => p.paid).reduce((a, p) => a + p.amount, 0), lines: payLines },
    entries: [...ledger].sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}

// ---------- messages ----------
export async function templates() {
  const d = await getDoc("settings", "messages");
  const t = { ...DEFAULT_TEMPLATES };
  if (d) for (const k of Object.keys(DEFAULT_TEMPLATES)) if (typeof d[k] === "string" && d[k].trim()) t[k] = d[k];
  return t;
}

export { rs, monthLabel, thisMonth, shiftMonth, plansOf, setMany, fillTemplate, whatsappLink, ACADEMY };
