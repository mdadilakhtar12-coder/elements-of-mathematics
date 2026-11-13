/* Price list shown on the website. Must match functions/src/plans.js (a unit test checks it). */
(function (root) {
  var PLANS = [
    { id: 'free', name: 'Free', month: 0, year: 0, students: 30, teachers: 5, subadmins: 1,
      features: ['Attendance & approvals', 'Batches & timetable (Excel / photo / PDF upload)', 'Homework & announcements', 'Excel upload of students & teachers'] },
    { id: 'starter', name: 'Starter', month: 99, year: 990, students: 75, teachers: 8, subadmins: 1,
      features: ['Everything in Free', 'Student login', 'Fees, PDF receipts, UPI QR', 'Push notifications', 'WhatsApp message texts'] },
    { id: 'basic', name: 'Basic', month: 199, year: 1990, students: 150, teachers: 15, subadmins: 2,
      features: ['Everything in Starter', 'Exams, results, ranking', 'Study material', 'Marks upload from Excel'] },
    { id: 'growth', name: 'Growth', month: 299, year: 2990, students: 300, teachers: 25, subadmins: 3,
      features: ['Everything in Basic', 'Accounts, salary, expenses', 'Teacher leaves', 'Student doubts', 'Data backup'] },
    { id: 'pro', name: 'Pro', month: 499, year: 4990, students: 600, teachers: 50, subadmins: 5,
      features: ['Everything in Growth', 'Most students and staff', '2 admins'] }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = PLANS; else root.BP_PLANS = PLANS;
})(typeof window !== 'undefined' ? window : this);
