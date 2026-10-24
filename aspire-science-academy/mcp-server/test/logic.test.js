import assert from "node:assert/strict";
import { isoDay, addDays, shiftMonth, monthEnd, parseTime, dayNumber, classesFromTimetable, examTotal, leaderboardEntries } from "../src/logic.js";
assert.equal(isoDay("2026-10-19"), 1); // Monday
assert.equal(isoDay("2026-10-18"), 7); // Sunday
assert.equal(addDays("2026-10-30", 3), "2026-11-02");
assert.equal(shiftMonth("2026-01", -1), "2025-12");
assert.equal(monthEnd("2026-02"), "2026-02-28");
assert.equal(parseTime("4:00 PM"), "16:00");
assert.equal(parseTime("12am"), "00:00");
assert.equal(dayNumber("thu"), 4);
const b = { id: "b1", name: "B", subjects: [{ subject: "Physics", teacherId: "t", teacherName: "T", weekly: [{ day: 1, start: "16:00", end: "17:00" }] }] };
assert.equal(classesFromTimetable(b, "2026-10-19", "2026-11-01").length, 2);
assert.equal(examTotal([{ marks: 20, maxMarks: 30 }, { marks: 0, maxMarks: 30, absent: true }]).pct, (20 * 100) / 30);
assert.equal(leaderboardEntries([{ studentId: "s", studentName: "S", examId: "e", marks: 10, maxMarks: 20 }])[0].pct, 50);
console.log("logic tests ok");
