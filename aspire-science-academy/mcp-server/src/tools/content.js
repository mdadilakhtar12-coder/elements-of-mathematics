import { z } from "zod";
import { all, col, newId, getDoc } from "../db.js";
import { def, ok, findBatch, adminName, confirmField, needConfirm, templates } from "../core.js";
import { DEFAULT_TEMPLATES, DEFAULT_SUBJECTS, isPermanent, leaveYear, daysBetween, LEAVE_QUOTA, LEAVE_YEAR_START_MONTH, today } from "../logic.js";
import { findUser } from "../core.js";
import { where } from "../db.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const KINDS = { notice: "notices", homework: "homework", material: "materials", doubt: "doubts" };
const BACKUP = ["leaves", "users", "batches", "classes", "attendance", "exams", "marks", "fees", "ledger", "salaryPaid", "homework", "notices", "materials", "doubts", "leaderboards", "settings"];

export function register(server) {
  def(server, "post_notice", "Post an announcement to everyone, or to one batch.", { title: z.string(), body: z.string(), batch: z.string().optional() }, async ({ title, body, batch }) => {
    const b = batch ? findBatch(await all("batches"), batch) : null;
    const id = newId("notices");
    await col("notices").doc(id).set({ id, title, body, batchId: b?.id || "", batchName: b?.name || "", createdByName: adminName(), createdAt: Date.now() });
    return ok({ posted: title, to: b?.name || "everyone" });
  }, { write: true });

  def(server, "post_homework", "Give homework to a batch.", { batch: z.string(), title: z.string(), description: z.string().optional(), due_date: date.optional(), link: z.string().optional() }, async (a) => {
    const b = findBatch(await all("batches"), a.batch);
    const id = newId("homework");
    await col("homework").doc(id).set({ id, batchId: b.id, batchName: b.name, title: a.title, description: a.description || "", dueDate: a.due_date || "", link: a.link || "", createdBy: "", createdByName: adminName(), createdAt: Date.now() });
    return ok({ posted: a.title, to: b.name });
  }, { write: true });

  def(server, "add_material", "Share study material (a link to Drive/YouTube/website) with a batch.",
    { batch: z.string(), title: z.string(), subject: z.string().optional(), type: z.enum(["Notes", "PDF", "Video", "Practice paper", "Other"]).optional(), link: z.string().optional(), description: z.string().optional() },
    async (a) => {
      const b = findBatch(await all("batches"), a.batch);
      const id = newId("materials");
      await col("materials").doc(id).set({ id, batchId: b.id, batchName: b.name, subject: a.subject || "", title: a.title, description: a.description || "", link: a.link || "", type: a.type || "Notes", createdBy: "", createdByName: adminName(), createdAt: Date.now() });
      return ok({ shared: a.title, with: b.name });
    }, { write: true });

  def(server, "answer_doubt", "Answer a student's doubt (get the id from list_content kind=doubts).", { doubt_id: z.string(), answer: z.string() }, async ({ doubt_id, answer }) => {
    const d = await getDoc("doubts", doubt_id);
    if (!d) throw new Error("Doubt not found.");
    await col("doubts").doc(doubt_id).update({ answer, answeredBy: adminName(), answeredAt: Date.now(), status: "answered" });
    return ok({ answered: d.question.slice(0, 60), student: d.studentName });
  }, { write: true });

  def(server, "delete_content", "Delete an announcement, homework, study material or doubt by id.",
    { kind: z.enum(["notice", "homework", "material", "doubt"]), id: z.string(), confirm: confirmField }, async ({ kind, id, confirm }) => {
      needConfirm(confirm, `delete this ${kind}`);
      await col(KINDS[kind]).doc(id).delete();
      return ok({ deleted: id });
    }, { write: true });

  def(server, "list_leaves", "Leave requests of permanent teachers. Filter by status (pending / approved / rejected) or teacher.", { status: z.string().optional(), teacher: z.string().optional() }, async ({ status, teacher }) => {
    let list = await all("leaves");
    if (teacher) { const t = findUser(await all("users"), teacher, "teacher"); list = list.filter((l) => l.teacherId === t.id); }
    if (status) list = list.filter((l) => l.status === status);
    return ok(list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map((l) => ({ id: l.id, teacher: l.teacherName, from: l.from, to: l.to, days: l.days, reason: l.reason, status: l.status, decidedBy: l.decidedBy || null })));
  });

  def(server, "decide_leave", "Approve or reject a teacher's leave request (get the id from list_leaves).", { leave_id: z.string(), action: z.enum(["approve", "reject"]) }, async ({ leave_id, action }) => {
    const l = await getDoc("leaves", leave_id);
    if (!l) throw new Error("Leave request not found.");
    const affected = (await where("classes", "teacherId", "==", l.teacherId)).filter((c) => c.date >= l.from && c.date <= l.to && c.status !== "cancelled");
    await col("leaves").doc(leave_id).update({ status: action === "approve" ? "approved" : "rejected", decidedBy: adminName(), decidedAt: Date.now() });
    return ok({ teacher: l.teacherName, leave: `${l.from} to ${l.to}`, decision: action === "approve" ? "approved" : "rejected", classesInThoseDays: affected.length, note: affected.length ? "These classes may need a substitute teacher (use update_class)." : undefined });
  }, { write: true });

  def(server, "add_leave", "Record a leave for a permanent teacher on their behalf (default: already approved).",
    { teacher: z.string(), from: date, to: date.optional(), reason: z.string().optional(), approved: z.boolean().optional() }, async ({ teacher, from, to, reason, approved }) => {
      const t = findUser(await all("users"), teacher, "teacher");
      if (!isPermanent(t)) throw new Error(`${t.name} is a guest teacher. Leave is only for permanent teachers.`);
      const end = to || from;
      const days = daysBetween(from, end);
      if (days < 1) throw new Error("'to' is before 'from'.");
      const id = newId("leaves");
      const ok2 = approved !== false;
      await col("leaves").doc(id).set({ id, teacherId: t.id, teacherName: t.name, from, to: end, days, reason: reason || "", status: ok2 ? "approved" : "pending", year: leaveYear(from, LEAVE_YEAR_START_MONTH), decidedBy: ok2 ? adminName() : "", decidedAt: ok2 ? Date.now() : 0, createdAt: Date.now() });
      return ok({ recorded: `${t.name}: ${from} to ${end} (${days} days)`, status: ok2 ? "approved" : "pending" });
    }, { write: true });

  def(server, "get_subjects", "The list of subjects used in the app (batches, exams, classes).", {}, async () => {
    const d = await getDoc("settings", "subjects");
    return ok({ subjects: d?.list?.length ? d.list : DEFAULT_SUBJECTS, note: "Biology is made of Botany + Zoology papers." });
  });

  def(server, "set_subjects", "Replace the subject list used in the app.", { subjects: z.array(z.string()).min(1) }, async ({ subjects }) => {
    const list = [...new Set(subjects.map((s) => s.trim()).filter(Boolean))];
    await col("settings").doc("subjects").set({ list });
    return ok({ subjects: list });
  }, { write: true });

  def(server, "get_message_templates", "Show the WhatsApp message texts used for parents (absent, feeDue, result, general).", {}, async () => ok(await templates()));

  def(server, "set_message_templates",
    "Change the WhatsApp message texts. Placeholders: absent {student} {subject} {date} {academy}; feeDue {student} {month} {amount} {academy}; result {student} {exam} {marks} {max} {academy}; general {student} {academy}. reset=true restores the defaults.",
    { absent: z.string().optional(), feeDue: z.string().optional(), result: z.string().optional(), general: z.string().optional(), reset: z.boolean().optional() },
    async ({ reset, ...t }) => {
      const next = reset ? { ...DEFAULT_TEMPLATES } : { ...(await templates()), ...Object.fromEntries(Object.entries(t).filter(([, v]) => v)) };
      await col("settings").doc("messages").set(next);
      return ok(next);
    }, { write: true });

  def(server, "export_backup", "Save all academy data as JSON files in a folder on this computer (default: ~/Aspire-backup/<date>).", { folder: z.string().optional() }, async ({ folder }) => {
    const dir = folder || path.join(os.homedir(), "Aspire-backup", new Date().toISOString().slice(0, 10));
    fs.mkdirSync(dir, { recursive: true });
    const counts = {};
    for (const name of BACKUP) {
      const rows = await all(name);
      counts[name] = rows.length;
      fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(rows, null, 2));
    }
    return ok({ savedIn: dir, counts, note: "Passwords are inside credentials, which is not exported." });
  });
}
