import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractJson, planChanges, buildPrompt, MAX_NEW_PER_RUN } from '../src/update-core.js';
import { runUpdate, askClaude } from '../src/update-run.js';
import { createSqliteStore } from '../src/store-sqlite.js';

const today = '2026-10-14';
const existing = [
  { id: 'nsp-post-matric-sc', name: 'Post Matric Scholarship for SC Students', provider: 'MoSJE', status: 'published', last_date: '2026-10-31' },
  { id: 'odisha-emedhabruti-ug', name: 'e-Medhabruti UG Merit Scholarship (Odisha)', provider: 'HED', status: 'draft', last_date: null },
];

const goodItem = (over = {}) => ({
  id: 'new-merit-award', name: 'New Merit Award', provider: 'Some Foundation', levels: ['ug'], min_percentage: 60, categories: [], gender: 'any',
  state: 'All India', max_income: 300000, disability_only: false, required_groups: [], amount: '₹20,000', start_date: '2026-10-01',
  last_date: '2026-12-15', documents: ['Marksheet', 'Income proof'], apply_steps: ['Open the site', 'Fill the form'],
  official_link: 'https://foundation.org/apply', source_url: 'https://foundation.org/award', criteria_note: null, notes: 'Income limit unclear.', ...over,
});

test('extractJson: fenced block, bare object, and failure', () => {
  assert.deepEqual(extractJson('Here you go:\n```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('notes {"x":"first"}\n```json\n{"x":"last"}\n```'), { x: 'last' });
  assert.deepEqual(extractJson('prefix {"b":2} suffix'), { b: 2 });
  assert.throws(() => extractJson('no json here'), /JSON/);
  assert.throws(() => extractJson('```json\n{broken\n```'), /JSON/);
});

test('prompt lists existing scholarships and asks for dates in YYYY-MM-DD', () => {
  const p = buildPrompt({ today, existing });
  assert.match(p, /Today is 2026-10-14/);
  assert.match(p, /nsp-post-matric-sc \| Post Matric Scholarship for SC Students/);
  assert.match(p, /YYYY-MM-DD/);
});

test('plan: a new scholarship becomes a draft, never published or verified, even if the model says otherwise', () => {
  const { newDrafts, skipped } = planChanges({
    result: { new_scholarships: [goodItem({ status: 'published', last_verified_on: '2026-10-14' })] }, existing, today, model: 'test-model',
  });
  assert.equal(skipped.length, 0, JSON.stringify(skipped));
  assert.equal(newDrafts.length, 1);
  const d = newDrafts[0];
  assert.equal(d.status, 'draft');
  assert.equal(d.last_verified_on, null);
  assert.match(d.verification_note, /Not checked on the official site/);
  assert.match(d.verification_note, /test-model/);
  assert.deepEqual(d.documents, ['Marksheet', 'Income proof']);
});

test('plan: duplicates, missing links and bad data are skipped with a reason', () => {
  const result = {
    new_scholarships: [
      goodItem({ id: 'nsp-post-matric-sc' }),
      goodItem({ id: 'other-id', name: 'Post Matric Scholarship for SC Students' }),
      goodItem({ id: 'no-link', name: 'No Link Award', official_link: '' }),
      goodItem({ id: 'http-link', name: 'Http Link Award', official_link: 'http://x.org' }),
      goodItem({ id: 'no-source', name: 'No Source Award', source_url: null }),
      goodItem({ id: 'bad-date', name: 'Bad Date Award', last_date: '15/12/2026' }),
      goodItem({ id: 'no-level', name: 'No Level Award', levels: [] }),
      goodItem({ id: 'bad-state', name: 'Bad State Award', state: 'Atlantis' }),
      goodItem({ id: 'fine-award', name: 'Fine Award' }),
      goodItem({ id: 'fine-award', name: 'Fine Award Again' }),
    ],
  };
  const { newDrafts, skipped } = planChanges({ result, existing, today });
  assert.deepEqual(newDrafts.map((d) => d.id), ['fine-award']);
  const whys = skipped.map((s) => s.why).join(' | ');
  assert.match(whys, /already in the list/);
  assert.match(whys, /no https official link/);
  assert.match(whys, /no https source link/);
  assert.match(whys, /real date/);
  assert.match(whys, /no class or course level/);
  assert.match(whys, /state/);
});

test('plan: no more than the cap of new drafts per run', () => {
  const many = Array.from({ length: MAX_NEW_PER_RUN + 4 }, (_, i) => goodItem({ id: `award-number-${i}`, name: `Unique Award Number ${i}` }));
  const { newDrafts, skipped } = planChanges({ result: { new_scholarships: many }, existing, today });
  assert.equal(newDrafts.length, MAX_NEW_PER_RUN);
  assert.equal(skipped.length, 4);
});

test('plan: date changes become suggestions only when valid, new, sourced and not already open', () => {
  const change = (o = {}) => ({ scholarship_id: 'nsp-post-matric-sc', field: 'last_date', new_value: '2026-11-15', source_url: 'https://scholarships.gov.in/x', evidence: 'Extended to 15 Nov', ...o });
  const result = {
    date_changes: [
      change(),
      change({ scholarship_id: 'unknown-id' }),
      change({ field: 'amount' }),
      change({ new_value: '2026-02-30' }),
      change({ new_value: '2026-10-31' }),
      change({ source_url: 'http://x' }),
      change({ new_value: '2026-11-20' }),
    ],
  };
  const open = [{ scholarship_id: 'nsp-post-matric-sc', field: 'last_date', new_value: '2026-11-20' }];
  const { suggestions, skipped } = planChanges({ result, existing, openSuggestions: open, today });
  assert.equal(suggestions.length, 1);
  assert.deepEqual(suggestions[0], {
    scholarship_id: 'nsp-post-matric-sc', field: 'last_date', old_value: '2026-10-31', new_value: '2026-11-15',
    source_url: 'https://scholarships.gov.in/x', note: 'Extended to 15 Nov',
  });
  assert.equal(skipped.length, 6);
});

// ---- Running the update with a fake Claude client ----

const text = (obj) => ({ type: 'text', text: 'Done.\n```json\n' + JSON.stringify(obj) + '\n```' });
const usage = { input_tokens: 100, output_tokens: 50, server_tool_use: { web_search_requests: 3 } };
function fakeClient(responses) {
  const calls = [];
  return {
    calls,
    messages: { stream: (params) => { calls.push(params); return { finalMessage: async () => responses.shift() }; } },
  };
}
const freshStore = () => createSqliteStore(join(mkdtempSync(join(tmpdir(), 'sf-up-')), 'u.db'));
const seedRow = (o = {}) => ({
  id: 'nsp-post-matric-sc', name: 'Post Matric Scholarship for SC Students', provider: 'MoSJE', levels: ['ug'], categories: ['SC'], gender: 'any',
  state: 'All India', official_link: 'https://scholarships.gov.in', status: 'published', last_date: '2026-10-31', last_verified_on: '2026-10-14',
  documents: ['a'], apply_steps: ['b'], required_groups: [], amount: 'x', ...o,
});

test('run: continues after pause_turn, saves a draft and a suggestion, and leaves existing rows untouched', async () => {
  const store = freshStore();
  await store.save(seedRow());
  const before = await store.get('nsp-post-matric-sc');
  const paused = { stop_reason: 'pause_turn', usage, content: [{ type: 'server_tool_use', id: 's1', name: 'web_search', input: { query: 'q' } }] };
  const done = {
    stop_reason: 'end_turn', usage,
    content: [text({ new_scholarships: [goodItem()], date_changes: [{ scholarship_id: 'nsp-post-matric-sc', field: 'last_date', new_value: '2026-11-15', source_url: 'https://scholarships.gov.in/n', evidence: 'extended' }], summary: 'ok' })],
  };
  const client = fakeClient([paused, done]);
  const logs = [];
  const out = await runUpdate({ store, client, model: 'test-model', today, log: (m) => logs.push(m) });

  assert.equal(client.calls.length, 2);
  assert.equal(client.calls[0].messages.length, 1);
  assert.equal(client.calls[1].messages.length, 2, 'the paused turn is sent back');
  assert.equal(client.calls[1].messages[1].role, 'assistant');
  assert.equal(client.calls[0].tools[0].type, 'web_search_20260209');
  assert.equal(out.usage.web_searches, 6);

  const draft = await store.get('new-merit-award');
  assert.equal(draft.status, 'draft');
  assert.equal(draft.last_verified_on, null);
  assert.equal((await store.listPublished()).some((s) => s.id === 'new-merit-award'), false, 'a new item is never public');
  assert.deepEqual(await store.get('nsp-post-matric-sc'), before, 'the existing row is unchanged');
  const [g] = await store.listSuggestions('open');
  assert.equal(g.new_value, '2026-11-15');
  assert.ok(logs.some((l) => /1 new draft/.test(l)));
});

test('run: dry run saves nothing', async () => {
  const store = freshStore();
  await store.save(seedRow());
  const client = fakeClient([{ stop_reason: 'end_turn', usage, content: [text({ new_scholarships: [goodItem()], date_changes: [] })] }]);
  const out = await runUpdate({ store, client, model: 'm', today, dryRun: true, log: () => {} });
  assert.equal(out.plan.newDrafts.length, 1);
  assert.equal(await store.get('new-merit-award'), null);
  assert.equal((await store.listSuggestions('open')).length, 0);
});

test('run: refusal, truncation and endless pausing are reported as errors', async () => {
  const base = { usage, content: [] };
  await assert.rejects(() => askClaude({ client: fakeClient([{ ...base, stop_reason: 'refusal' }]), model: 'm', prompt: 'p' }), /declined/);
  await assert.rejects(() => askClaude({ client: fakeClient([{ ...base, stop_reason: 'max_tokens' }]), model: 'm', prompt: 'p' }), /cut off/);
  const endless = Array.from({ length: 10 }, () => ({ ...base, stop_reason: 'pause_turn' }));
  await assert.rejects(() => askClaude({ client: fakeClient(endless), model: 'm', prompt: 'p' }), /did not finish/);
});

test('run: a reply that is not JSON fails without saving anything', async () => {
  const store = freshStore();
  const client = fakeClient([{ stop_reason: 'end_turn', usage, content: [{ type: 'text', text: 'Sorry, I could not find anything.' }] }]);
  await assert.rejects(() => runUpdate({ store, client, model: 'm', today, log: () => {} }), /JSON/);
  assert.equal((await store.listAll()).length, 0);
});
