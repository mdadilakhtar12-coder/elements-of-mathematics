import { z } from "zod";
import { all, where, col, newId } from "../db.js";
import { def, ok, findUser, adminName, accountsFor, confirmField, needConfirm } from "../core.js";
import { today, thisMonth, rs } from "../logic.js";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const monthStr = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM");
const MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"];

export function register(server) {
  def(server, "record_fee", "Record a fee payment received from a student.",
    { student: z.string(), amount: z.number().positive(), month: monthStr.optional().describe("Month the fee is for (default this month)"), mode: z.enum(MODES).optional(), date: date.optional(), note: z.string().optional() },
    async (a) => {
      const s = findUser(await all("users"), a.student, "student");
      const id = newId("fees");
      const doc = { id, studentId: s.id, studentName: s.name, amount: Math.round(a.amount), month: a.month || thisMonth(), date: a.date || today(), mode: a.mode || "Cash", note: a.note || "", receivedBy: adminName(), createdAt: Date.now() };
      await col("fees").doc(id).set(doc);
      const paid = (await where("fees", "studentId", "==", s.id)).filter((f) => f.month === doc.month).reduce((x, f) => x + f.amount, 0);
      return ok({ saved: `${rs(doc.amount)} from ${s.name} for ${doc.month}`, id, paidForMonth: paid, monthlyFee: s.monthlyFee || 0, stillDue: Math.max(0, (s.monthlyFee || 0) - paid) });
    }, { write: true });

  def(server, "delete_fee", "Delete a wrongly entered fee payment (get the id from get_student_fees or fees_overview).", { fee_id: z.string(), confirm: confirmField }, async ({ fee_id, confirm }) => {
    needConfirm(confirm, "delete this payment");
    await col("fees").doc(fee_id).delete();
    return ok({ deleted: fee_id });
  }, { write: true });

  def(server, "add_ledger_entry",
    "Add money in or money out of the institute (not student fees, those are counted automatically). Examples: expense 'Room rent' 25000; income 'Admission fee' 12000. You can use any heading (category).",
    { type: z.enum(["income", "expense"]), category: z.string(), amount: z.number().positive(), date: date.optional(), note: z.string().optional() },
    async (a) => {
      const id = newId("ledger");
      const d = a.date || today();
      await col("ledger").doc(id).set({ id, type: a.type, date: d, month: d.slice(0, 7), category: a.category.trim(), note: a.note || "", amount: Math.round(a.amount), hasBill: false, createdBy: adminName(), createdAt: Date.now() });
      return ok({ saved: `${a.type} ${a.category} ${rs(a.amount)} on ${d}`, id });
    }, { write: true });

  def(server, "delete_ledger_entry", "Delete an income/expense entry (get the id from accounts_summary).", { id: z.string(), confirm: confirmField }, async ({ id, confirm }) => {
    needConfirm(confirm, "delete this entry");
    await col("ledger").doc(id).delete();
    await col("bills").doc(id).delete();
    return ok({ deleted: id });
  }, { write: true });

  def(server, "mark_teacher_paid", "Mark a teacher's pay for a month as paid (or undo with paid=false). Amount defaults to the calculated pay.",
    { teacher: z.string(), month: monthStr.optional(), paid: z.boolean().optional(), amount: z.number().optional(), date: date.optional(), mode: z.enum(MODES).optional(), note: z.string().optional() },
    async ({ teacher, month, paid, amount, date: d, mode, note }) => {
      const t = findUser(await all("users"), teacher, "teacher");
      const m = month || thisMonth();
      const id = `${m}_${t.id}`;
      if (paid === false) { await col("salaryPaid").doc(id).delete(); return ok({ undone: `${t.name} ${m} marked as not paid` }); }
      const acc = await accountsFor(m);
      const due = acc.teacherPay.lines.find((l) => l.teacherId === t.id)?.amount ?? 0;
      const amt = Math.round(amount ?? due);
      if (!(amt > 0)) throw new Error("There is no pay to mark for this month. Give an amount.");
      await col("salaryPaid").doc(id).set({ id, teacherId: t.id, teacherName: t.name, month: m, amount: amt, date: d || today(), mode: mode || "Cash", note: note || "", paidBy: adminName(), createdAt: Date.now() });
      return ok({ paid: `${t.name} ${m}: ${rs(amt)}` });
    }, { write: true });
}
