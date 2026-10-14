import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile, validateScholarship, normalizePhone, realDate } from '../shared/validate.js';
import * as auth from '../src/auth.js';
import { csvCell } from '../src/admin.js';

const student = {
  phone: '98765 43210',
  school_or_college: 'Ravenshaw University',
  level: 'ug',
  course: 'B.Sc',
  honours_subject: 'Mathematics',
  minor_subject: 'Physics',
};

test('phone numbers: accepts common forms, rejects bad ones', () => {
  assert.equal(normalizePhone('98765 43210'), '9876543210');
  assert.equal(normalizePhone('+91-9876543210'), '9876543210');
  assert.equal(normalizePhone('09876543210'), '9876543210');
  assert.equal(normalizePhone('5876543210'), null, 'must start with 6-9');
  assert.equal(normalizePhone('12345'), null);
});

test('student profile: B.Sc needs an Honours subject; minor must differ', () => {
  assert.deepEqual(validateProfile(student).errors, []);
  assert.match(validateProfile({ ...student, honours_subject: '' }).errors.join(' '), /Honours subject/);
  assert.match(validateProfile({ ...student, minor_subject: 'Mathematics' }).errors.join(' '), /different/);
});

test('student profile: stream only for Class 11/12, course only for UG', () => {
  const c12 = validateProfile({ ...student, level: 'class12', stream: 'Science' });
  assert.deepEqual(c12.errors, []);
  assert.equal(c12.value.course, null, 'course is dropped for school students');
  assert.match(validateProfile({ ...student, level: 'class12' }).errors.join(' '), /stream/);
  const c10 = validateProfile({ phone: '9876543210', school_or_college: 'Govt High School', level: 'class10' });
  assert.deepEqual(c10.errors, []);
});

test('student profile: email and marks checks', () => {
  assert.match(validateProfile({ ...student, email: 'not-an-email' }).errors.join(' '), /email/);
  assert.deepEqual(validateProfile({ ...student, email: 'Student@Example.in' }).value.email, 'student@example.in');
  assert.match(validateProfile({ ...student, percentage: 120 }).errors.join(' '), /Marks/);
});

const scholarship = {
  id: 'test-schol',
  name: 'Test scholarship',
  provider: 'Test provider',
  levels: ['ug'],
  categories: ['SC'],
  gender: 'any',
  state: 'All India',
  amount: '₹10,000 per year',
  start_date: '2026-06-01',
  last_date: '2026-10-31',
  documents: 'Aadhaar\nCaste certificate',
  apply_steps: 'Register\nApply',
  official_link: 'https://scholarships.gov.in',
  status: 'draft',
  last_verified_on: '',
};

test('scholarship: a draft can be saved with fewer details', () => {
  const { errors } = validateScholarship({ ...scholarship, amount: '', documents: '' });
  assert.deepEqual(errors, []);
});

test('scholarship: publishing needs verification date, link, steps and documents', () => {
  const { errors } = validateScholarship({ ...scholarship, status: 'published' });
  assert.match(errors.join(' '), /date you verified/);
  const ok = validateScholarship({ ...scholarship, status: 'published', last_verified_on: '2026-10-14' });
  assert.deepEqual(ok.errors, []);
  assert.deepEqual(ok.value.documents, ['Aadhaar', 'Caste certificate']);
});

test('scholarship: official link must be https; dates must be real and ordered', () => {
  assert.match(validateScholarship({ ...scholarship, official_link: 'http://x.gov.in' }).errors.join(' '), /https/);
  assert.match(validateScholarship({ ...scholarship, official_link: 'javascript:alert(1)' }).errors.join(' '), /https/);
  assert.match(validateScholarship({ ...scholarship, last_date: '2026-02-30' }).errors.join(' '), /real date/);
  assert.match(validateScholarship({ ...scholarship, last_date: '2026-01-01' }).errors.join(' '), /before the start/);
});

test('scholarship: id format and state list', () => {
  assert.match(validateScholarship({ ...scholarship, id: 'Bad ID!' }).errors.join(' '), /ID must/);
  assert.match(validateScholarship({ ...scholarship, state: 'Atlantis' }).errors.join(' '), /state/);
});

test('realDate rejects impossible dates', () => {
  assert.equal(realDate('2026-02-28'), true);
  assert.equal(realDate('2026-02-29'), false);
  assert.equal(realDate('14/10/2026'), false);
});

test('admin password: exact match only, and missing password never matches', () => {
  assert.equal(auth.passwordMatches('s3cret-value', 's3cret-value'), true);
  assert.equal(auth.passwordMatches('wrong', 's3cret-value'), false);
  assert.equal(auth.passwordMatches('', ''), false);
  assert.equal(auth.passwordMatches('anything', undefined), false);
});

test('admin session: valid, tampered and expired tokens', () => {
  const now = Date.now();
  const token = auth.makeSession(now);
  assert.equal(auth.isValidSession(token, now + 1000), true);
  assert.equal(auth.isValidSession(token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'), now + 1000), false);
  assert.equal(auth.isValidSession(token, now + 9 * 60 * 60 * 1000), false, 'expired after 8 hours');
  assert.equal(auth.isValidSession(undefined), false);
});

test('admin login: blocks after 5 failures for 15 minutes', () => {
  const ip = `test-${Math.random()}`;
  const now = Date.now();
  for (let i = 0; i < 5; i++) auth.recordFailure(ip, now);
  assert.equal(auth.canAttempt(ip, now + 1000), false);
  assert.equal(auth.canAttempt(ip, now + 16 * 60 * 1000), true);
});

test('CSV cells are quoted and formulas are neutralised', () => {
  assert.equal(csvCell('plain'), 'plain');
  assert.equal(csvCell('a, "b"'), '"a, ""b"""');
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell('+91 98765'), "'+91 98765");
});
