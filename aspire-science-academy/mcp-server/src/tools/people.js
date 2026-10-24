import { z } from "zod";
import { all, col, auth, getDoc, newId } from "../db.js";
import { def, ok, findUser, findBatch, confirmField, needConfirm } from "../core.js";
import { loginEmail, last10, digits } from "../logic.js";

/** Creates (or reuses) the Firebase login for a loginId. */
async function createLogin(loginId, password, name) {
  const email = loginEmail(loginId);
  try {
    return (await auth().createUser({ email, password, displayName: name })).uid;
  } catch (e) {
    if (e.code === "auth/email-already-exists") {
      const u = await auth().getUserByEmail(email);
      await auth().updateUser(u.uid, { password });
      return u.uid;
    }
    throw e;
  }
}

function profile(uid, p) {
  return {
    id: uid, role: p.role, name: p.name, loginId: p.loginId, mobile: p.mobile ?? p.loginId, active: true,
    perms: [], batchIds: p.batchIds || [], rollNo: p.rollNo || "", standard: p.standard || "",
    parentMobile: p.parentMobile || "", monthlyFee: p.monthlyFee || 0, subjects: p.subjects || "",
    classRate: p.classRate || 0, salary: p.salary || 0, demo: false, createdAt: Date.now(),
  };
}

async function makeUser(users, p, password) {
  const loginId = digits(p.mobile).length >= 5 ? last10(p.mobile) : String(p.mobile).trim();
  if (users.some((u) => (u.loginId || "").toLowerCase() === loginId.toLowerCase())) {
    const u = users.find((x) => (x.loginId || "").toLowerCase() === loginId.toLowerCase());
    throw new Error(`The ID ${loginId} is already used by ${u.name}.`);
  }
  const pw = password || loginId;
  if (pw.length < 6) throw new Error("Password must be at least 6 characters (the mobile number is used when none is given).");
  const uid = await createLogin(loginId, pw, p.name);
  const doc = profile(uid, { ...p, loginId, mobile: loginId });
  await col("users").doc(uid).set(doc);
  await col("credentials").doc(uid).set({ loginId, role: p.role, password: pw });
  users.push(doc);
  return { doc, password: pw };
}

export function register(server) {
  def(server, "create_student",
    "Add one student. The mobile number is the login ID. If no password is given the mobile number is used. Optionally put the student in a batch.",
    {
      name: z.string(), mobile: z.string(), password: z.string().optional(), batch: z.string().optional(),
      standard: z.string().optional(), rollNo: z.string().optional(), parentMobile: z.string().optional(), monthlyFee: z.number().optional(),
    },
    async (a) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const b = a.batch ? findBatch(batches, a.batch) : null;
      const { doc, password } = await makeUser(users, {
        role: "student", name: a.name, mobile: a.mobile, rollNo: a.rollNo, parentMobile: a.parentMobile,
        monthlyFee: a.monthlyFee, standard: a.standard || b?.standard, batchIds: b ? [b.id] : [],
      }, a.password);
      return ok({ created: doc.name, loginId: doc.loginId, password, batch: b?.name || null });
    }, { write: true });

  def(server, "create_teacher",
    "Add a teacher. Mobile number is the login ID. classRate = pay per completed class (Rs), salary = fixed monthly salary (Rs), both optional.",
    { name: z.string(), mobile: z.string(), password: z.string().optional(), subjects: z.string().optional(), classRate: z.number().optional(), salary: z.number().optional() },
    async (a) => {
      const users = await all("users");
      const { doc, password } = await makeUser(users, { role: "teacher", name: a.name, mobile: a.mobile, subjects: a.subjects, classRate: a.classRate, salary: a.salary }, a.password);
      return ok({ created: doc.name, loginId: doc.loginId, password });
    }, { write: true });

  def(server, "bulk_import_students",
    "Add many students at once (for example from an Excel sheet the user pasted). Students that already exist are not created again, they are only added to the batch.",
    {
      rows: z.array(z.object({
        name: z.string(), mobile: z.string(), password: z.string().optional(), rollNo: z.string().optional(),
        parentMobile: z.string().optional(), monthlyFee: z.number().optional(), standard: z.string().optional(),
      })),
      batch: z.string().optional(),
    },
    async ({ rows, batch }) => {
      const [users, batches] = await Promise.all([all("users"), all("batches")]);
      const b = batch ? findBatch(batches, batch) : null;
      const report = { added: 0, linkedExisting: 0, skipped: 0, failed: [] };
      for (const r of rows) {
        try {
          const id = digits(r.mobile).length >= 5 ? last10(r.mobile) : r.mobile;
          const ex = users.find((u) => (u.loginId || "").toLowerCase() === String(id).toLowerCase());
          if (ex) {
            if (ex.role !== "student") { report.failed.push(`${r.name}: ID belongs to a ${ex.role}`); continue; }
            if (b && !(ex.batchIds || []).includes(b.id)) {
              await col("users").doc(ex.id).update({ batchIds: [...(ex.batchIds || []), b.id] });
              ex.batchIds = [...(ex.batchIds || []), b.id]; report.linkedExisting++;
            } else report.skipped++;
            continue;
          }
          await makeUser(users, { role: "student", ...r, standard: r.standard || b?.standard, batchIds: b ? [b.id] : [] }, r.password);
          report.added++;
        } catch (e) { report.failed.push(`${r.name}: ${e.message}`); }
      }
      return ok(report);
    }, { write: true });

  def(server, "update_user",
    "Change details of a student or teacher: name, rollNo, standard, parentMobile, monthlyFee, subjects, classRate, salary, active (false blocks login).",
    {
      user: z.string().describe("Name or mobile"),
      name: z.string().optional(), rollNo: z.string().optional(), standard: z.string().optional(), parentMobile: z.string().optional(),
      monthlyFee: z.number().optional(), subjects: z.string().optional(), classRate: z.number().optional(), salary: z.number().optional(), active: z.boolean().optional(),
    },
    async ({ user, ...fields }) => {
      const u = findUser(await all("users"), user);
      const patch = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      if (!Object.keys(patch).length) throw new Error("Nothing to change.");
      await col("users").doc(u.id).update(patch);
      return ok({ updated: u.name, changes: patch });
    }, { write: true });

  def(server, "reset_password", "Set a new password for a student or teacher.", { user: z.string(), newPassword: z.string().min(6) }, async ({ user, newPassword }) => {
    const u = findUser(await all("users"), user);
    await auth().updateUser(u.id, { password: newPassword });
    await col("credentials").doc(u.id).set({ loginId: u.loginId, role: u.role, password: newPassword });
    return ok({ user: u.name, loginId: u.loginId, newPassword });
  }, { write: true });

  def(server, "delete_user", "Delete a student or teacher completely (login and profile). Past attendance and fee records stay.", { user: z.string(), confirm: confirmField }, async ({ user, confirm }) => {
    const u = findUser(await all("users"), user);
    if (u.role === "admin" || u.role === "subadmin") throw new Error("Admins can only be removed from the app.");
    needConfirm(confirm, `delete ${u.name} (${u.role})`);
    try { await auth().deleteUser(u.id); } catch (e) { if (e.code !== "auth/user-not-found") throw e; }
    await col("credentials").doc(u.id).delete();
    await col("users").doc(u.id).delete();
    return ok({ deleted: u.name });
  }, { write: true });

  def(server, "get_login_details", "Show the login ID and password of a student or teacher (so you can tell them).", { user: z.string() }, async ({ user }) => {
    const u = findUser(await all("users"), user);
    const c = await getDoc("credentials", u.id);
    return ok({ name: u.name, role: u.role, loginId: u.loginId, password: c?.password ?? "(not stored)" });
  });
}
