import { z } from "zod";
import { all, where, col, setMany, deleteMany, getDoc, newId } from "../db.js";
import { def, ok, findUser, findBatch, studentsOfBatch, adminName, confirmField, needConfirm } from "../core.js";
import { today, addDays, plansOf, classesFromTimetable, dayNumber, parseTime, keyOf } from "../logic.js";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const slot = z.object({
  day: z.union([z.string(), z.number()]).describe("Monday..Sunday or 1..7"),
  start: z.string().describe("e.g. 16:00 or 4:00 PM"), end: z.string(),
});
const subjectInput = z.object({
  subject: z.string().optional(), teacher: z.string().optional().describe("Teacher name or mobile"), days: z.array(slot).optional(),
});

async function buildPlans(list) {
  const users = (await all("users")).filter((u) => u.role === "teacher");
  return (list || []).map((p) => {
    const t = p.teacher ? findUser(users, p.teacher, "teacher") : null;
    const weekly = (p.days || []).map((d) => ({ day: dayNumber(d.day), start: parseTime(d.start), end: parseTime(d.end) }));
    for (const w of weekly) if (w.start >= w.end) throw new Error("End time must be after start time.");
    return { subject: p.subject || "", teacherId: t?.id || "", teacherName: t?.name || "", weekly };
  });
}

export function register(server) {
  def(server, "create_batch",
    "Create a batch. Only the standard is needed (for example '11th Science'). Subjects with teachers and weekly days are optional.",
    { standard: z.string(), name: z.string().optional().describe("e.g. '11th Science - Group A'. Defaults to the standard."), subjects: z.array(subjectInput).optional() },
    async ({ standard, name, subjects }) => {
      const id = newId("batches");
      const doc = { id, name: (name || standard).trim(), standard, subjects: await buildPlans(subjects), subject: "", teacherId: "", teacherName: "", weekly: [] };
      await col("batches").doc(id).set(doc);
      return ok({ created: doc.name, id, subjects: doc.subjects.length, next: "Use generate_classes to create the classes from the timetable." });
    }, { write: true });

  def(server, "update_batch", "Change a batch's name, standard or replace its whole subjects/teachers/timetable list.",
    { batch: z.string(), name: z.string().optional(), standard: z.string().optional(), subjects: z.array(subjectInput).optional() },
    async ({ batch, name, standard, subjects }) => {
      const b = findBatch(await all("batches"), batch);
      const patch = {};
      if (name) patch.name = name; if (standard) patch.standard = standard;
      if (subjects) Object.assign(patch, { subjects: await buildPlans(subjects), subject: "", teacherId: "", teacherName: "", weekly: [] });
      await col("batches").doc(b.id).update(patch);
      return ok({ updated: patch.name || b.name });
    }, { write: true });

  def(server, "delete_batch", "Delete a batch (students stay).", { batch: z.string(), confirm: confirmField }, async ({ batch, confirm }) => {
    const b = findBatch(await all("batches"), batch);
    needConfirm(confirm, `delete the batch ${b.name}`);
    await col("batches").doc(b.id).delete();
    return ok({ deleted: b.name });
  }, { write: true });

  def(server, "set_batch_students", "Add and/or remove students of a batch (give names or mobiles).",
    { batch: z.string(), add: z.array(z.string()).optional(), remove: z.array(z.string()).optional() }, async ({ batch, add, remove }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const b = findBatch(batches, batch);
      const out = { added: [], removed: [] };
      for (const r of add || []) { const s = findUser(users, r, "student"); if (!(s.batchIds || []).includes(b.id)) { await col("users").doc(s.id).update({ batchIds: [...(s.batchIds || []), b.id] }); out.added.push(s.name); } }
      for (const r of remove || []) { const s = findUser(users, r, "student"); await col("users").doc(s.id).update({ batchIds: (s.batchIds || []).filter((x) => x !== b.id) }); out.removed.push(s.name); }
      return ok({ batch: b.name, ...out });
    }, { write: true });

  def(server, "generate_classes",
    "Create the classes of a batch's weekly timetable between two dates (max 3 months). Classes that already exist are kept.",
    { batch: z.string(), from: date.optional(), to: date.optional() }, async ({ batch, from, to }) => {
      const b = findBatch(await all("batches"), batch);
      const f = from || today(), t = to || addDays(f, 30);
      if (t < f) throw new Error("'to' is before 'from'.");
      if (t > addDays(f, 92)) throw new Error("Please choose at most 3 months at a time.");
      if (!plansOf(b).some((p) => p.weekly?.length)) throw new Error("This batch has no weekly timetable. Use update_batch to add subjects and days.");
      const snap = await col("classes").where("batchId", "==", b.id).get();
      const existing = new Set(snap.docs.map((d) => d.id));
      const list = classesFromTimetable(b, f, t, existing);
      await setMany("classes", list);
      return ok({ batch: b.name, from: f, to: t, classesCreated: list.length });
    }, { write: true });

  def(server, "add_class", "Add a single class (custom class or extra class).",
    { batch: z.string(), date, start: z.string(), end: z.string(), subject: z.string().optional(), teacher: z.string().optional(), topic: z.string().optional(), note: z.string().optional() },
    async (a) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const b = findBatch(batches, a.batch);
      const plan = plansOf(b).find((p) => p.subject === a.subject);
      const t = a.teacher ? findUser(users, a.teacher, "teacher") : null;
      const id = newId("classes");
      const doc = {
        id, batchId: b.id, batchName: b.name, subject: a.subject || "", teacherId: t?.id || plan?.teacherId || "", teacherName: t?.name || plan?.teacherName || "",
        date: a.date, start: parseTime(a.start), end: parseTime(a.end), status: "scheduled", topic: a.topic || "", note: a.note || "", takenBy: "", takenAt: 0, approvedBy: "",
      };
      if (doc.start >= doc.end) throw new Error("End time must be after start time.");
      await col("classes").doc(id).set(doc);
      return ok({ added: `${doc.date} ${doc.start} ${doc.subject} - ${b.name}`, id });
    }, { write: true });

  def(server, "update_class", "Change one class: reschedule (date/start/end), change the teacher (substitute), set topic/note, or cancel / restore it.",
    {
      class_id: z.string(), date: date.optional(), start: z.string().optional(), end: z.string().optional(), teacher: z.string().optional(),
      subject: z.string().optional(), topic: z.string().optional(), note: z.string().optional(), status: z.enum(["cancelled", "scheduled"]).optional(),
    },
    async ({ class_id, teacher, start, end, ...rest }) => {
      const c = await getDoc("classes", class_id);
      if (!c) throw new Error("Class not found. Use list_classes to get the id.");
      const patch = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
      if (start) patch.start = parseTime(start);
      if (end) patch.end = parseTime(end);
      if ((patch.start || c.start) >= (patch.end || c.end)) throw new Error("End time must be after start time.");
      if (teacher) { const t = findUser(await all("users"), teacher, "teacher"); patch.teacherId = t.id; patch.teacherName = t.name; }
      await col("classes").doc(class_id).update(patch);
      return ok({ updated: class_id, changes: patch });
    }, { write: true });

  def(server, "delete_classes",
    "Delete classes: either a list of class ids, or all upcoming classes of a batch (from today).",
    { class_ids: z.array(z.string()).optional(), batch: z.string().optional(), confirm: confirmField }, async ({ class_ids, batch, confirm }) => {
      let ids = class_ids || [];
      if (!ids.length && batch) {
        const b = findBatch(await all("batches"), batch);
        ids = (await where("classes", "batchId", "==", b.id)).filter((c) => c.date >= today()).map((c) => c.id);
      }
      if (!ids.length) throw new Error("Give class_ids or a batch.");
      needConfirm(confirm, `delete ${ids.length} classes`);
      await deleteMany("classes", ids);
      return ok({ deleted: ids.length });
    }, { write: true });

  def(server, "mark_attendance",
    "Take attendance of a class (as admin: saved as approved). Give class_id, OR batch + date (+ subject if the batch has several classes that day). Students not listed get default_status (P present by default).",
    {
      class_id: z.string().optional(), batch: z.string().optional(), date: date.optional(), subject: z.string().optional(),
      records: z.array(z.object({ student: z.string(), status: z.enum(["P", "A", "L"]) })).optional(),
      default_status: z.enum(["P", "A", "L"]).optional(), approve: z.boolean().optional().describe("false = leave it waiting for approval"), topic: z.string().optional(),
    },
    async ({ class_id, batch, date: d, subject, records, default_status, approve, topic }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      let c;
      if (class_id) c = await getDoc("classes", class_id);
      else {
        if (!batch || !d) throw new Error("Give class_id, or batch and date.");
        const b = findBatch(batches, batch);
        let list = (await where("classes", "batchId", "==", b.id)).filter((x) => x.date === d && x.status !== "cancelled");
        if (subject) list = list.filter((x) => x.subject.toLowerCase() === subject.toLowerCase());
        if (list.length !== 1) throw new Error(list.length ? `${list.length} classes match: ${list.map((x) => x.subject + " " + x.start).join(", ")}. Say the subject.` : "No class found. Use list_classes.");
        c = list[0];
      }
      if (!c) throw new Error("Class not found.");
      if (c.status === "cancelled") throw new Error("This class is cancelled.");
      const kids = studentsOfBatch(users, c.batchId);
      const set = new Map();
      for (const r of records || []) set.set(findUser(kids, r.student, "student").id, r.status);
      const docs = kids.map((s) => ({
        id: `${c.id}_${s.id}`, classId: c.id, batchId: c.batchId, batchName: c.batchName, subject: c.subject,
        studentId: s.id, studentName: s.name, date: c.date, status: set.get(s.id) || default_status || "P",
      }));
      await setMany("attendance", docs);
      const approved = approve !== false;
      await col("classes").doc(c.id).update({
        status: approved ? "approved" : "taken", topic: topic ?? c.topic ?? "", takenBy: adminName(), takenAt: Date.now(), approvedBy: approved ? adminName() : "",
      });
      const count = (s) => docs.filter((x) => x.status === s).length;
      return ok({ class: `${c.date} ${c.subject} - ${c.batchName}`, present: count("P"), late: count("L"), absent: count("A"), absentNames: docs.filter((x) => x.status === "A").map((x) => x.studentName), status: approved ? "approved" : "waiting for approval" });
    }, { write: true });

  def(server, "approve_classes", "Approve or reject classes whose attendance a teacher submitted. Give class_ids, or all_pending=true.",
    { class_ids: z.array(z.string()).optional(), all_pending: z.boolean().optional(), action: z.enum(["approve", "reject"]).optional() }, async ({ class_ids, all_pending, action }) => {
      let list = [];
      if (all_pending) list = await where("classes", "status", "==", "taken");
      else for (const id of class_ids || []) { const c = await getDoc("classes", id); if (c) list.push(c); }
      if (!list.length) return ok("Nothing to approve.");
      const approve = action !== "reject";
      for (const c of list) await col("classes").doc(c.id).update({ status: approve ? "approved" : "rejected", approvedBy: approve ? adminName() : "" });
      return ok({ [approve ? "approved" : "rejected"]: list.map((c) => `${c.date} ${c.subject} - ${c.batchName} (${c.teacherName})`) });
    }, { write: true });
}
