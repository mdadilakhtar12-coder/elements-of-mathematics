import { z } from "zod";
import { all, col, newId, getDoc } from "../db.js";
import { def, ok, findBatch, adminName, confirmField, needConfirm, templates } from "../core.js";
import { DEFAULT_TEMPLATES } from "../logic.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const KINDS = { notice: "notices", homework: "homework", material: "materials", doubt: "doubts" };
const BACKUP = ["users", "batches", "classes", "attendance", "exams", "marks", "fees", "ledger", "salaryPaid", "homework", "notices", "materials", "doubts", "leaderboards", "settings"];

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
