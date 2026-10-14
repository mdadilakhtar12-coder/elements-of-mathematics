// Validation rules used by the server. The browser also runs the student checks for quick feedback,
// but the server is the one that decides.
import { LEVELS, CATEGORIES } from './eligibility.js';
import { STATES, STREAMS, UG_COURSES, SCIENCE_SUBJECTS, INSTITUTIONS, GENDERS, GROUP_KEYS } from './options.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{2,79}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function realDate(v) {
  if (!DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function optionalDate(v, label, errors) {
  const s = str(v);
  if (!s) return null;
  if (!realDate(s)) errors.push(`${label} must be a real date (YYYY-MM-DD).`);
  return s || null;
}

// Accepts digits with optional +91 / 0 prefix and spaces or dashes. Returns 10 digits or null.
export function normalizePhone(v) {
  let s = str(v).replace(/[\s-]/g, '');
  if (s.startsWith('+91')) s = s.slice(3);
  else if (s.startsWith('91') && s.length === 12) s = s.slice(2);
  else if (s.startsWith('0') && s.length === 11) s = s.slice(1);
  return /^[6-9]\d{9}$/.test(s) ? s : null;
}

// Student profile: contact details plus class/course details.
export function validateProfile(raw = {}) {
  const errors = [];
  const pick = (v, allowed) => (allowed.includes(v) ? v : null);
  const num = (v, min, max) => {
    if (v === '' || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? n : NaN;
  };

  const level = pick(raw.level, Object.keys(LEVELS));
  if (!level) errors.push('Please choose your class or course.');

  const phone = normalizePhone(raw.phone);
  if (!phone) errors.push('Enter a valid 10-digit mobile number.');

  const email = str(raw.email).toLowerCase();
  if (email && (email.length > 120 || !EMAIL_RE.test(email))) errors.push('Enter a valid email address.');

  const school = str(raw.school_or_college);
  if (school.length < 2 || school.length > 120) errors.push('Enter your school or college name.');

  const value = {
    name: str(raw.name).slice(0, 60) || null,
    phone,
    email: email || null,
    school_or_college: school.slice(0, 120) || null,
    institution: pick(raw.institution, INSTITUTIONS.map(([v]) => v)),
    level,
    stream: null,
    course: null,
    honours_subject: null,
    minor_subject: null,
    percentage: num(raw.percentage, 0, 100),
    category: pick(raw.category, CATEGORIES),
    gender: pick(raw.gender, GENDERS.map(([v]) => v)),
    state: pick(str(raw.state), STATES),
    income: num(raw.income, 0, 1e9),
    disability: typeof raw.disability === 'boolean' ? raw.disability : null,
    groups: (Array.isArray(raw.groups) ? raw.groups : []).filter((g) => GROUP_KEYS.includes(g)),
  };
  if (Number.isNaN(value.percentage)) errors.push('Marks must be between 0 and 100.');
  if (Number.isNaN(value.income)) errors.push('Income must be a number of rupees.');

  if (level === 'class11' || level === 'class12') {
    value.stream = pick(raw.stream, STREAMS);
    if (!value.stream) errors.push('Please choose your stream.');
  }

  if (level === 'ug') {
    value.course = pick(raw.course, UG_COURSES);
    if (!value.course) errors.push('Please choose your degree course.');
    if (value.course === 'B.Sc') {
      value.honours_subject = pick(raw.honours_subject, SCIENCE_SUBJECTS);
      if (!value.honours_subject) errors.push('Please choose your B.Sc Honours subject.');
      value.minor_subject = pick(raw.minor_subject, SCIENCE_SUBJECTS);
      if (value.minor_subject && value.minor_subject === value.honours_subject) {
        errors.push('Minor subject must be different from the Honours subject.');
      }
    }
  }

  return { value, errors };
}

const lines = (v) =>
  str(v)
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

const isHttps = (v) => {
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
};

// Scholarship from the admin form. Publishing has stricter rules than saving a draft.
export function validateScholarship(raw = {}) {
  const errors = [];
  const id = str(raw.id).toLowerCase();
  if (!ID_RE.test(id)) errors.push('ID must be 3-80 characters: lowercase letters, numbers and dashes.');

  const name = str(raw.name);
  const provider = str(raw.provider);
  if (!name || name.length > 200) errors.push('Name is required (max 200 characters).');
  if (!provider || provider.length > 200) errors.push('Provider is required (max 200 characters).');

  const levels = (Array.isArray(raw.levels) ? raw.levels : [raw.levels]).filter((x) => Object.keys(LEVELS).includes(x));
  const categories = (Array.isArray(raw.categories) ? raw.categories : [raw.categories]).filter((x) => CATEGORIES.includes(x));

  const gender = GENDERS.some(([v]) => v === raw.gender) || raw.gender === 'any' ? raw.gender : 'any';
  const state = str(raw.state) || 'All India';
  if (state !== 'All India' && !STATES.includes(state)) errors.push('Choose a valid state or All India.');

  const minPct = str(raw.min_percentage);
  const min_percentage = minPct === '' ? null : Number(minPct);
  if (min_percentage !== null && !(min_percentage >= 0 && min_percentage <= 100)) errors.push('Minimum marks must be 0-100.');

  const inc = str(raw.max_income).replace(/[,\s]/g, '');
  const max_income = inc === '' ? null : Number(inc);
  if (max_income !== null && !(Number.isInteger(max_income) && max_income >= 0)) errors.push('Max income must be a whole number of rupees.');

  const start_date = optionalDate(raw.start_date, 'Start date', errors);
  const last_date = optionalDate(raw.last_date, 'Last date', errors);
  const last_verified_on = optionalDate(raw.last_verified_on, 'Last verified date', errors);
  if (start_date && last_date && last_date < start_date) errors.push('Last date cannot be before the start date.');

  const official_link = str(raw.official_link);
  if (official_link && !isHttps(official_link)) errors.push('Official link must be a full https:// address.');
  const source_url = str(raw.source_url);
  if (source_url && !isHttps(source_url)) errors.push('Source link must be a full https:// address.');

  const status = ['draft', 'published', 'expired'].includes(raw.status) ? raw.status : 'draft';
  const value = {
    id,
    name,
    provider,
    levels,
    min_percentage,
    categories,
    gender,
    state,
    max_income,
    disability_only: raw.disability_only === true || raw.disability_only === 'on',
    required_groups: (Array.isArray(raw.required_groups) ? raw.required_groups : [raw.required_groups]).filter((g) => GROUP_KEYS.includes(g)),
    amount: str(raw.amount).slice(0, 300) || null,
    start_date,
    last_date,
    documents: lines(raw.documents).slice(0, 30),
    apply_steps: lines(raw.apply_steps).slice(0, 30),
    official_link: official_link || null,
    source_url: source_url || null,
    criteria_note: str(raw.criteria_note).slice(0, 500) || null,
    status,
    last_verified_on,
    verification_note: str(raw.verification_note).slice(0, 500) || null,
  };

  if (status === 'published') {
    if (!value.official_link) errors.push('A published scholarship needs an official link.');
    if (!value.last_date) errors.push('A published scholarship needs a last date.');
    if (!value.last_verified_on) errors.push('A published scholarship needs the date you verified it.');
    if (!value.levels.length) errors.push('Choose at least one class or course level.');
    if (!value.apply_steps.length) errors.push('Add at least one apply step.');
    if (!value.documents.length) errors.push('List the documents required.');
    if (!value.amount) errors.push('Add the amount or benefit.');
  }
  return { value, errors };
}
