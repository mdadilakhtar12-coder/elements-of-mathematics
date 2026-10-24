import { z } from "zod";
import { all, where, col, setMany, deleteMany, getDoc, newId } from "../db.js";
import { def, ok, findUser, findBatch, studentsOfBatch, recomputeExam, rebuildLeaderboard, confirmField, needConfirm } from "../core.js";
import { plansOf, papersOf, keyOf } from "../logic.js";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const paper = z.object({ subject: z.string(), max_marks: z.number().positive() });

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

export function register(server) {
  def(server, "create_exam",
    "Create an exam with several papers, each with its own maximum marks. Either list the papers, or set use_batch_subjects with max_marks to make one paper per subject of the batch (Biology becomes Botany + Zoology).",
    {
      batch: z.string(), name: z.string(), date, papers: z.array(paper).optional(),
      use_batch_subjects: z.boolean().optional(), max_marks: z.number().optional().describe("marks per paper when use_batch_subjects"),
      split_biology: z.boolean().optional().describe("default true"),
    },
    async (a) => {
      const b = findBatch(await all("batches"), a.batch);
      let papers = (a.papers || []).map((p) => ({ subject: p.subject, maxMarks: p.max_marks }));
      if (!papers.length && a.use_batch_subjects) {
        const names = plansOf(b).map((p) => p.subject).filter(Boolean).flatMap((s) => (s === "Biology" && a.split_biology !== false ? ["Botany", "Zoology"] : [s]));
        if (!names.length) throw new Error("This batch has no subjects. List the papers instead.");
        const each = a.max_marks || 50;
        papers = names.map((subject) => ({ subject, maxMarks: each }));
      }
      if (!papers.length) throw new Error("Give the papers, or use_batch_subjects with max_marks.");
      if (new Set(papers.map((p) => p.subject)).size !== papers.length) throw new Error("Each subject can be added only once.");
      const id = newId("exams");
      const doc = {
        id, name: a.name.trim(), batchId: b.id, batchName: b.name, subject: papers.map((p) => p.subject).join(", "), date: a.date,
        maxMarks: papers.reduce((s, p) => s + p.maxMarks, 0), average: 0, highest: 0, appeared: 0, papers,
      };
      await col("exams").doc(id).set(doc);
      return ok({ created: doc.name, batch: b.name, papers: papers.map((p) => `${p.subject} ${p.maxMarks}`), totalMarks: doc.maxMarks });
    }, { write: true });

  def(server, "update_exam", "Change an exam's name, date or replace its papers (existing marks stay).",
    { exam: z.string(), batch: z.string().optional(), name: z.string().optional(), date: date.optional(), papers: z.array(paper).optional() },
    async ({ exam, batch, name, date: d, papers }) => {
      const e = await findExam(exam, batch);
      const patch = {};
      if (name) patch.name = name; if (d) patch.date = d;
      if (papers) {
        const p = papers.map((x) => ({ subject: x.subject, maxMarks: x.max_marks }));
        Object.assign(patch, { papers: p, subject: p.map((x) => x.subject).join(", "), maxMarks: p.reduce((s, x) => s + x.maxMarks, 0) });
      }
      await col("exams").doc(e.id).update(patch);
      await recomputeExam(e.id);
      return ok({ updated: patch.name || e.name });
    }, { write: true });

  def(server, "enter_marks",
    "Enter or change marks. rows: one entry per student per paper. marks = a number, or 'AB' for absent. 'subject' can be left out if the exam has only one paper. Totals, class average and leaderboard are recalculated.",
    {
      exam: z.string(), batch: z.string().optional(),
      rows: z.array(z.object({ student: z.string(), subject: z.string().optional(), marks: z.union([z.number(), z.string()]) })),
    },
    async ({ exam, batch, rows }) => {
      const e = await findExam(exam, batch);
      const [users, existing] = await Promise.all([all("users"), where("marks", "examId", "==", e.id)]);
      const kids = studentsOfBatch(users, e.batchId);
      const papers = papersOf(e);
      const docs = [];
      const problems = [];
      for (const r of rows) {
        try {
          const s = findUser(kids, r.student, "student");
          const p = r.subject ? papers.find((x) => x.subject.toLowerCase() === r.subject.toLowerCase()) : papers.length === 1 ? papers[0] : null;
          if (!p) throw new Error(r.subject ? `No paper "${r.subject}" in this exam (${papers.map((x) => x.subject).join(", ")})` : "Say which subject");
          const absent = typeof r.marks === "string" && /^(ab|absent|a)$/i.test(r.marks.trim());
          const v = absent ? 0 : Number(r.marks);
          if (!absent && (!Number.isFinite(v) || v < 0 || v > p.maxMarks)) throw new Error(`marks must be 0 to ${p.maxMarks}`);
          const old = existing.find((m) => m.studentId === s.id && m.subject === p.subject);
          docs.push({
            id: old?.id || `${e.id}_${s.id}_${keyOf(p.subject)}`, examId: e.id, examName: e.name, subject: p.subject, date: e.date,
            maxMarks: p.maxMarks, batchId: e.batchId, studentId: s.id, studentName: s.name, marks: v, absent,
          });
        } catch (err) { problems.push(`${r.student}${r.subject ? " / " + r.subject : ""}: ${err.message}`); }
      }
      await setMany("marks", docs);
      const stats = await recomputeExam(e.id);
      return ok({ exam: e.name, saved: docs.length, problems, classAveragePercent: Math.round(stats.average * 10) / 10, appeared: stats.appeared });
    }, { write: true });

  def(server, "delete_exam", "Delete an exam and all its marks.", { exam: z.string(), batch: z.string().optional(), confirm: confirmField }, async ({ exam, batch, confirm }) => {
    const e = await findExam(exam, batch);
    needConfirm(confirm, `delete the exam ${e.name} (${e.batchName}) and all its marks`);
    const marks = await where("marks", "examId", "==", e.id);
    await deleteMany("marks", marks.map((m) => m.id));
    await col("exams").doc(e.id).delete();
    await rebuildLeaderboard(e.batchId, e.batchName);
    return ok({ deleted: e.name, marksRemoved: marks.length });
  }, { write: true });
}
