import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSqliteStore } from '../src/store-sqlite.js';
import { createSupabaseStore, toSupabaseRow } from '../src/store.js';

// A tiny in-memory imitation of the Supabase REST API (PostgREST): just the calls our store makes.
function fakeSupabase() {
  const tables = { scholarships: [], student_profiles: [], suggestions: [] };
  const seq = { student_profiles: 0, suggestions: 0 };
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url);
    const table = u.pathname.replace('/rest/v1/', '');
    const rows = tables[table];
    const method = init.method || 'GET';
    const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    calls.push({ method, table, url, headers });
    if (!rows) return new Response('{"message":"unknown table"}', { status: 404 });
    const prefer = headers.prefer || '';
    const filters = [...u.searchParams].filter(([k]) => !['select', 'order', 'limit', 'on_conflict'].includes(k));
    const match = (r) => filters.every(([k, v]) => {
      const [op, ...rest] = v.split('.');
      const val = rest.join('.');
      return op === 'eq' ? String(r[k]) === val : op === 'lt' ? String(r[k]) < val : false;
    });
    const json = (status, body, extra = {}) => new Response(body === null ? null : JSON.stringify(body), { status, headers: extra });

    if (method === 'GET' || method === 'HEAD') {
      let out = rows.filter(match).map((r) => ({ ...r }));
      if (u.searchParams.get('order') === 'id.desc') out.sort((a, b) => b.id - a.id);
      if (u.searchParams.get('order') === 'id.asc') out.sort((a, b) => a.id - b.id);
      const limit = Number(u.searchParams.get('limit'));
      if (limit) out = out.slice(0, limit);
      if (method === 'HEAD') return json(200, null, { 'content-range': `0-${Math.max(out.length - 1, 0)}/${out.length}` });
      return json(200, out);
    }
    if (method === 'POST') {
      const body = JSON.parse(init.body);
      for (const item of Array.isArray(body) ? body : [body]) {
        const key = u.searchParams.get('on_conflict');
        const existing = key ? rows.find((r) => r[key] === item[key]) : null;
        if (existing) {
          if (prefer.includes('merge-duplicates')) Object.assign(existing, item);
          continue; // ignore-duplicates keeps the old row
        }
        const row = { ...item };
        if (table in seq) row.id = ++seq[table];
        if (table === 'suggestions') row.status ??= 'open';
        row.created_at ??= new Date().toISOString();
        rows.push(row);
      }
      return new Response(null, { status: 201 });
    }
    if (method === 'PATCH') {
      const patch = JSON.parse(init.body);
      const hit = rows.filter(match);
      hit.forEach((r) => Object.assign(r, patch));
      return json(200, hit);
    }
    if (method === 'DELETE') {
      const hit = rows.filter(match);
      for (const r of hit) rows.splice(rows.indexOf(r), 1);
      return json(200, hit);
    }
    return new Response('bad method', { status: 405 });
  };
  return { fetchImpl, tables, calls };
}

const sch = (over = {}) => ({
  id: 'test-one', name: 'Test one', provider: 'P', levels: ['ug', 'class12'], categories: ['SC'], gender: 'any', state: 'Odisha',
  max_income: 250000, min_percentage: 55, disability_only: true, required_groups: ['minority'], amount: '₹1', start_date: '2026-06-01',
  last_date: '2026-12-31', documents: ['a', 'b'], apply_steps: ['x'], official_link: 'https://example.gov.in', source_url: 'https://example.org',
  status: 'draft', created_at: '2026-10-01T00:00:00Z', ...over,
});

const backends = {
  sqlite: () => createSqliteStore(join(mkdtempSync(join(tmpdir(), 'sf-')), 'test.db')),
  supabase: () => createSupabaseStore({ url: 'https://example.supabase.co', key: 'secret-key', fetchImpl: fakeSupabase().fetchImpl }),
};

for (const [name, make] of Object.entries(backends)) {
  test(`${name}: scholarships round-trip and visibility`, async () => {
    const store = make();
    await store.save(sch());
    const back = await store.get('test-one');
    assert.deepEqual(back.levels, ['ug', 'class12']);
    assert.deepEqual(back.required_groups, ['minority']);
    assert.equal(back.disability_only, true);
    assert.equal(back.max_income, 250000);
    assert.equal((await store.listPublished()).length, 0, 'a draft is not public');
    assert.equal(await store.getPublished('test-one'), null);
    assert.equal(await store.setStatus('test-one', 'published'), 1);
    assert.equal(await store.setStatus('nope', 'published'), 0);
    assert.equal((await store.listPublished()).length, 1);
    assert.equal((await store.getPublished('test-one')).name, 'Test one');
    await store.save(sch({ id: 'no-link', official_link: null, status: 'published' }));
    assert.equal((await store.listPublished()).length, 1, 'a published item without an official link is never public');
    assert.equal((await store.listAll()).length, 2);
    assert.equal(await store.get('missing-id'), null);
  });

  test(`${name}: seeding keeps existing rows unless update is asked for`, async () => {
    const store = make();
    await store.save(sch({ name: 'Edited by admin', status: 'published' }));
    await store.seed([sch({ name: 'From seed' }), sch({ id: 'test-two', name: 'Second' })]);
    assert.equal((await store.get('test-one')).name, 'Edited by admin');
    assert.equal((await store.get('test-one')).status, 'published');
    assert.equal((await store.get('test-two')).name, 'Second');
    await store.seed([sch({ name: 'From seed' })], { update: true });
    assert.equal((await store.get('test-one')).name, 'From seed');
  });

  test(`${name}: student profiles can be stored, counted and deleted`, async () => {
    const store = make();
    const p = (n) => ({ phone: '9876543210', school_or_college: `School ${n}`, level: 'ug', course: 'B.Sc', honours_subject: 'Physics', groups: ['minority'], disability: false, income: 1000 });
    await store.insertProfile(p(1));
    await store.insertProfile(p(2));
    assert.equal(await store.countProfiles(), 2);
    const list = await store.listProfiles();
    assert.equal(list.length, 2);
    assert.equal(list[0].school_or_college, 'School 2', 'newest first');
    assert.equal(await store.deleteProfile(list[0].id), 1);
    assert.equal(await store.countProfiles(), 1);
    assert.equal(await store.deleteProfilesBefore('2999-01-01T00:00:00Z'), 1);
    assert.equal(await store.countProfiles(), 0);
  });

  test(`${name}: a suggestion can be resolved only once`, async () => {
    const store = make();
    await store.addSuggestion({ scholarship_id: 'test-one', field: 'last_date', old_value: '2026-10-31', new_value: '2026-11-15', source_url: 'https://x.org', note: 'n' });
    const [g] = await store.listSuggestions('open');
    assert.equal(g.new_value, '2026-11-15');
    assert.equal((await store.getSuggestion(g.id)).scholarship_id, 'test-one');
    assert.equal(await store.resolveSuggestion(g.id, 'applied'), 1);
    assert.equal(await store.resolveSuggestion(g.id, 'applied'), 0, 'a second click does nothing');
    assert.equal((await store.listSuggestions('open')).length, 0);
    assert.equal((await store.listSuggestions('applied')).length, 1);
  });
}

test('supabase: requests carry the key in headers only, and never put data in the URL', async () => {
  const fake = fakeSupabase();
  const store = createSupabaseStore({ url: 'https://example.supabase.co/', key: 'secret-key', fetchImpl: fake.fetchImpl });
  await store.save(sch({ name: 'Name with spaces & symbols?' }));
  await store.get("x'; drop table scholarships; --");
  for (const c of fake.calls) {
    assert.equal(c.headers.apikey, 'secret-key');
    assert.equal(c.headers.authorization, 'Bearer secret-key');
    assert.ok(!c.url.includes('secret-key'));
    assert.ok(!c.url.includes('Name with spaces'));
    assert.ok(c.url.startsWith('https://example.supabase.co/rest/v1/'));
  }
});

test('supabase: a failed request surfaces a clear error', async () => {
  const store = createSupabaseStore({ url: 'https://example.supabase.co', key: 'k', fetchImpl: async () => new Response('{"message":"bad key"}', { status: 401 }) });
  await assert.rejects(() => store.ping(), /Supabase GET \/scholarships failed \(401\)/);
});

test('supabase: row shape sent to the database keeps arrays and booleans', () => {
  const row = toSupabaseRow(sch());
  assert.deepEqual(row.levels, ['ug', 'class12']);
  assert.equal(row.disability_only, true);
  assert.equal(row.status, 'draft');
});
