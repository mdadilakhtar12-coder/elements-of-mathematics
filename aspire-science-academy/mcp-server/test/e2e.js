// End-to-end test: starts the MCP server against the Firebase emulators and calls the tools like Claude would.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node", args: ["src/index.js"],
  env: { ...process.env, GCLOUD_PROJECT: "demo-aspire", ASPIRE_ADMIN_NAME: "Test Admin" },
  stderr: "inherit",
});
const client = new Client({ name: "test", version: "1" });
await client.connect(transport);

let failures = 0;
async function call(name, args = {}, expectError = false) {
  const r = await client.callTool({ name, arguments: args });
  const text = r.content?.[0]?.text ?? "";
  let data = text;
  try { data = JSON.parse(text); } catch {}
  if (!!r.isError !== expectError) { failures++; console.log(`FAIL ${name}:`, text.slice(0, 300)); }
  else console.log(`ok   ${name}${expectError ? " (expected error)" : ""}`);
  return data;
}
const check = (label, cond, extra = "") => { if (!cond) { failures++; console.log("FAIL check:", label, extra); } else console.log("ok   check:", label); };

const tools = (await client.listTools()).tools;
console.log("tools:", tools.length);

// setup
await call("create_teacher", { name: "Rakesh Sharma", mobile: "9000000001", subjects: "Physics", classRate: 400 });
await call("create_teacher", { name: "Neha Verma", mobile: "9000000002", subjects: "Chemistry", classRate: 300, salary: 5000 });
const b = await call("create_batch", {
  standard: "11th Science", name: "11th Science - Group A",
  subjects: [
    { subject: "Physics", teacher: "Rakesh Sharma", days: [{ day: "Monday", start: "4:00 PM", end: "5:00 PM" }, { day: "Thursday", start: "16:00", end: "17:00" }] },
    { subject: "Chemistry", teacher: "9000000002", days: [{ day: 2, start: "16:00", end: "17:00" }] },
    { subject: "Biology" },
  ],
});
check("batch created", b.created === "11th Science - Group A", JSON.stringify(b));
const imp = await call("bulk_import_students", {
  batch: "11th Science - Group A",
  rows: [
    { name: "Aman Shaikh", mobile: "9100000001", rollNo: "1", parentMobile: "9200000001", monthlyFee: 1500 },
    { name: "Riya Patel", mobile: "9100000002", rollNo: "2", parentMobile: "9200000002", monthlyFee: 1500 },
    { name: "Sana Khan", mobile: "9100000003", rollNo: "3", monthlyFee: 1500 },
  ],
});
check("3 students added", imp.added === 3, JSON.stringify(imp));
const dup = await call("create_student", { name: "Aman Again", mobile: "9100000001" }, true);
const s1 = await call("create_student", { name: "Dev Joshi", mobile: "9100000004", batch: "11th Science - Group A", monthlyFee: 2000 });
check("student has default password", s1.password === "9100000004", JSON.stringify(s1));

const from = new Date().toISOString().slice(0, 10);
const gen = await call("generate_classes", { batch: "11th Science - Group A", from, to: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) });
check("classes generated", gen.classesCreated >= 4, JSON.stringify(gen));
const gen2 = await call("generate_classes", { batch: "11th Science - Group A", from, to: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) });
check("generating twice creates nothing new", gen2.classesCreated === 0, JSON.stringify(gen2));

// a past class to take attendance on
const past = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
const added = await call("add_class", { batch: "11th Science - Group A", date: past, start: "16:00", end: "17:00", subject: "Physics" });
const att = await call("mark_attendance", { class_id: added.id, records: [{ student: "Riya Patel", status: "A" }, { student: "Sana Khan", status: "L" }] });
check("attendance counts", att.present === 2 && att.absent === 1 && att.late === 1, JSON.stringify(att));
const rep = await call("get_attendance_report", { batch: "11th Science - Group A" });
check("attendance report", rep.lowestFirst[0].name === "Riya Patel", JSON.stringify(rep).slice(0, 200));

// approvals and teacher pay
const upcoming = await call("list_classes", { batch: "11th Science - Group A", status: "scheduled" });
const ex = upcoming.classes[0];
await call("update_class", { class_id: ex.id, status: "cancelled" });
await call("update_class", { class_id: ex.id, status: "scheduled", topic: "Kinematics" });
await call("approve_classes", { all_pending: true });
const t = await call("get_teacher", { teacher: "Rakesh Sharma" });
check("teacher has 1 completed class", t.completed === 1 && t.pay.amount === 400, JSON.stringify(t));

// exams
const exam = await call("create_exam", { batch: "11th Science - Group A", name: "Unit Test 1", date: from, use_batch_subjects: true, max_marks: 30 });
check("biology split into botany + zoology", exam.papers.length === 4 && exam.totalMarks === 120, JSON.stringify(exam));
const rows = [];
for (const [stu, vals] of [["Aman Shaikh", [28, 27, 14, 13]], ["Riya Patel", [20, 18, 10, "AB"]], ["Sana Khan", [15, 15, 8, 7]]]) {
  ["Physics", "Chemistry", "Botany", "Zoology"].forEach((subject, i) => rows.push({ student: stu, subject, marks: vals[i] }));
}
const em = await call("enter_marks", { exam: "Unit Test 1", rows });
check("marks saved", em.saved === 12 && em.problems.length === 0, JSON.stringify(em));
await call("enter_marks", { exam: "Unit Test 1", rows: [{ student: "Aman Shaikh", subject: "Physics", marks: 99 }] }, false); // reported in problems
const res = await call("get_exam_results", { exam: "Unit Test 1" });
check("rank 1 is Aman", res.results[0].student === "Aman Shaikh" && res.results[0].rank === 1, JSON.stringify(res.results[0]));
const lb = await call("get_leaderboard", { batch: "11th Science - Group A" });
check("leaderboard has entries", lb.ranking?.length === 3, JSON.stringify(lb));

// fees and accounts
await call("record_fee", { student: "Aman Shaikh", amount: 1500, mode: "UPI" });
await call("record_fee", { student: "Riya Patel", amount: 700 });
const fo = await call("fees_overview", {});
check("fees pending", fo.pending.students === 3 && fo.collectedForThisMonth === 2200, JSON.stringify(fo.pending));
await call("add_ledger_entry", { type: "expense", category: "Room rent", amount: 25000 });
await call("add_ledger_entry", { type: "income", category: "Admission fee", amount: 3000 });
await call("mark_teacher_paid", { teacher: "Rakesh Sharma", amount: 400 });
const acc = await call("accounts_summary", {});
check("accounts add up", acc.moneyIn === 5200 && acc.expensesTotal === 25000 && acc.teacherPay.total >= 400, JSON.stringify({ in: acc.moneyIn, out: acc.moneyOut, tp: acc.teacherPay }));
check("teacher marked paid", acc.teacherPay.lines.find((l) => l.teacher === "Rakesh Sharma")?.paid === true);

// content and messages
await call("post_notice", { title: "Holiday", body: "No class on Sunday" });
await call("post_homework", { batch: "11th Science - Group A", title: "Numericals", due_date: from });
await call("add_material", { batch: "11th Science - Group A", title: "Notes", link: "https://example.com", subject: "Physics" });
const msg = await call("draft_parent_message", { student: "Riya Patel", kind: "absent", date: past, subject: "Physics" });
check("absent message", msg.message.includes("Riya Patel was absent from the Physics class"), msg.message);
await call("set_message_templates", { feeDue: "Dear parent, fee of {amount} for {student} ({month}) is due." });
const fm = await call("draft_parent_message", { student: "Sana Khan", kind: "fee" });
check("custom fee message", fm.message.startsWith("Dear parent, fee of"), fm.message);

// people
const pw = await call("reset_password", { user: "Sana Khan", newPassword: "newpass1" });
const login = await call("get_login_details", { user: "Sana Khan" });
check("password changed", login.password === "newpass1", JSON.stringify(login));
const gs = await call("get_student", { student: "Riya Patel" });
check("get_student attendance", gs.attendance.absent === 1, JSON.stringify(gs.attendance));
const ov = await call("academy_overview");
check("overview students", ov.students === 4, JSON.stringify(ov).slice(0, 200));

// deletes need confirmation
await call("delete_user", { user: "Dev Joshi", confirm: false }, true);
await call("delete_user", { user: "Dev Joshi", confirm: true });
await call("delete_classes", { batch: "11th Science - Group A", confirm: false }, true);
const del = await call("delete_classes", { batch: "11th Science - Group A", confirm: true });
check("upcoming classes deleted", del.deleted > 0, JSON.stringify(del));
await call("delete_exam", { exam: "Unit Test 1", confirm: true });
await call("get_student", { student: "Nobody Here" }, true);
const bk = await call("export_backup", { folder: "/tmp/aspire-backup-test" });
check("backup written", bk.counts?.users >= 4, JSON.stringify(bk).slice(0, 200));

await client.close();
console.log(failures ? `\n${failures} FAILURES` : "\nALL OK");
process.exit(failures ? 1 : 0);
