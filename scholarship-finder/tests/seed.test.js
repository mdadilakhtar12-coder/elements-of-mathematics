import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateScholarship } from '../shared/validate.js';
import { checkEligibility, criteriaText } from '../shared/eligibility.js';

const seed = JSON.parse(readFileSync(new URL('../seed/scholarships.json', import.meta.url), 'utf8'));
const asForm = (s) => ({ ...s, documents: s.documents.join('\n'), apply_steps: s.apply_steps.join('\n') });

test('seed: ids are unique', () => {
  assert.equal(new Set(seed.map((s) => s.id)).size, seed.length);
});

test('seed: every entry passes validation as saved', () => {
  for (const s of seed) {
    const { errors } = validateScholarship(asForm(s));
    assert.deepEqual(errors, [], `${s.id}: ${errors.join('; ')}`);
  }
});

test('seed: every entry has an https official link and an https source', () => {
  for (const s of seed) {
    assert.match(s.official_link, /^https:\/\//, `${s.id} official_link`);
    assert.match(s.source_url, /^https:\/\//, `${s.id} source_url`);
  }
});

test('seed: documents and steps are filled for every entry', () => {
  for (const s of seed) {
    assert.ok(s.documents.length >= 3, `${s.id} documents`);
    assert.ok(s.apply_steps.length >= 3, `${s.id} apply_steps`);
  }
});

test('seed: only entries with a verification date may be published', () => {
  for (const s of seed.filter((x) => x.status === 'published')) {
    assert.ok(s.last_verified_on, `${s.id} is published without last_verified_on`);
    assert.deepEqual(validateScholarship(asForm(s)).errors, [], s.id);
  }
});

test('seed: new unverified entries stay drafts', () => {
  const drafts = seed.filter((s) => s.status === 'draft');
  assert.ok(drafts.length >= 20);
  for (const s of drafts) assert.equal(s.last_verified_on, null, s.id);
});

test('groups: minority scholarship needs the minority group', () => {
  const s = seed.find((x) => x.id === 'nsp-post-matric-minorities');
  const base = { level: 'class12', income: 100000, category: 'General', state: 'Odisha' };
  assert.equal(checkEligibility(s, { ...base, groups: [] }).eligible, false);
  assert.deepEqual(checkEligibility(s, { ...base, groups: [] }).failed, ['group']);
  assert.equal(checkEligibility(s, { ...base, groups: ['minority'] }).eligible, true);
  assert.equal(checkEligibility(s, base).eligible, true, 'unknown groups never exclude');
  assert.ok(criteriaText(s).some((t) => /minority/i.test(t)));
});

test('matching: an SC class 12 student in Odisha gets SC and Odisha schemes, not ST or girls-only', () => {
  const p = { level: 'class12', category: 'SC', gender: 'male', state: 'Odisha', income: 150000, disability: false, groups: [] };
  const ok = seed.filter((s) => checkEligibility(s, p).eligible).map((s) => s.id);
  assert.ok(ok.includes('nsp-post-matric-sc'));
  assert.ok(ok.includes('odisha-post-matric-sc'));
  assert.ok(!ok.includes('nsp-post-matric-st'));
  assert.ok(!ok.includes('aicte-pragati-girls'));
  assert.ok(!ok.includes('nsp-post-matric-minorities'));
  assert.ok(!ok.includes('odisha-gssy'), 'vulnerable-family scheme needs the group');
});

test('matching: a UG girl from another state does not see Odisha-only schemes', () => {
  const p = { level: 'ug', category: 'General', gender: 'female', state: 'Bihar', income: 100000, disability: false, groups: [] };
  const ok = seed.filter((s) => checkEligibility(s, p).eligible).map((s) => s.id);
  assert.ok(ok.includes('aicte-pragati-girls'));
  assert.ok(!ok.some((id) => id.startsWith('odisha-')));
});
