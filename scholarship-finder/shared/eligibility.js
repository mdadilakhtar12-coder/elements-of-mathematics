// Pure matching and date logic. Used by the server (Node) and the browser (served as /shared/eligibility.js).
// No DOM, no Node-only APIs.
import { GROUPS } from './options.js';

export const LEVELS = {
  class10: 'Class 10',
  class11: 'Class 11',
  class12: 'Class 12',
  ug: 'UG / Degree course',
};

export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

const DAY_MS = 24 * 60 * 60 * 1000;

// Today's date as YYYY-MM-DD in India time. All deadlines are India dates.
export function todayIST(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// Whole days from `today` to `lastDate`. Negative means expired. Computed live, never stored.
export function daysLeft(lastDate, today = todayIST()) {
  const end = Date.parse(`${lastDate}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  return Math.round((end - now) / DAY_MS);
}

export const CLOSING_SOON_DAYS = 7;
export const NEW_DAYS = 7;

// A scholarship is hidden when it is not published, has no official link, or its last date has passed.
export function isOpen(s, today = todayIST()) {
  return s.status === 'published' && Boolean(s.official_link) && daysLeft(s.last_date, today) >= 0;
}

// Returns which rules fail. A rule is skipped when either side is unknown, so
// a missing profile field never hides a scholarship the student might qualify for.
export function checkEligibility(s, p) {
  const failed = [];
  if (s.levels?.length && p.level && !s.levels.includes(p.level)) failed.push('level');
  if (s.min_percentage != null && p.percentage != null && p.percentage < s.min_percentage) failed.push('percentage');
  if (s.categories?.length && p.category && !s.categories.includes(p.category)) failed.push('category');
  if (s.gender && s.gender !== 'any' && p.gender && s.gender !== p.gender) failed.push('gender');
  if (s.state && s.state !== 'All India' && p.state && s.state !== p.state) failed.push('state');
  if (s.max_income != null && p.income != null && p.income > s.max_income) failed.push('income');
  if (s.disability_only && p.disability === false) failed.push('disability');
  // Group rule: the student must belong to at least one of the required groups.
  // If the profile has no group list at all, the rule is skipped (unknown).
  if (s.required_groups?.length && Array.isArray(p.groups) && !s.required_groups.some((g) => p.groups.includes(g))) failed.push('group');
  return { eligible: failed.length === 0, failed };
}

// Human-readable criteria list for the detail page.
export function criteriaText(s) {
  const out = [];
  if (s.levels?.length) out.push(`Studying in: ${s.levels.map((l) => LEVELS[l] ?? l).join(', ')}`);
  if (s.min_percentage != null) out.push(`Minimum marks: ${s.min_percentage}% in the last exam`);
  if (s.categories?.length) out.push(`Category: ${s.categories.join(', ')}`);
  else out.push('Category: all categories');
  if (s.gender && s.gender !== 'any') out.push(`Gender: ${s.gender === 'female' ? 'Girls only' : s.gender}`);
  out.push(s.state && s.state !== 'All India' ? `Domicile: ${s.state}` : 'Domicile: All India');
  if (s.max_income != null) out.push(`Annual family income: up to ₹${s.max_income.toLocaleString('en-IN')}`);
  if (s.disability_only) out.push('Only for students with a disability');
  if (s.required_groups?.length) {
    out.push(`For: ${s.required_groups.map((k) => GROUPS.find((g) => g.key === k)?.short ?? k).join(' or ')}`);
  }
  if (s.criteria_note) out.push(s.criteria_note);
  return out;
}
