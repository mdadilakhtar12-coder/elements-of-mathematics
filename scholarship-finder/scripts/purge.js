// Deletes student profiles older than RETENTION_MONTHS (default 12), as promised in the privacy notice.
// Safe to run every day.
import { openStore } from '../src/store.js';
import { retentionMonths } from '../src/privacy.js';

const store = await openStore();
const cutoff = new Date();
cutoff.setMonth(cutoff.getMonth() - retentionMonths());
const n = await store.deleteProfilesBefore(cutoff.toISOString());
console.log(`Deleted ${n} student profile(s) older than ${retentionMonths()} months (before ${cutoff.toISOString().slice(0, 10)}).`);
store.close();
