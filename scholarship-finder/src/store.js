// Chooses where data lives. With SUPABASE_URL and SUPABASE_SERVICE_KEY set, data is kept in Supabase
// (durable, works on free hosting). Otherwise a local SQLite file is used (development and tests).
//
// The Supabase store talks to the PostgREST API with plain fetch, so it needs no extra package.
// The service key bypasses row-level security. Keep it on the server only; never in the browser or the repo.
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SCHOLARSHIP_JSON = ['levels', 'categories', 'documents', 'apply_steps', 'required_groups'];
const SCHOLARSHIP_COLUMNS = [
  'id', 'name', 'provider', 'levels', 'min_percentage', 'categories', 'gender', 'state', 'max_income',
  'disability_only', 'required_groups', 'amount', 'start_date', 'last_date', 'documents', 'apply_steps',
  'official_link', 'source_url', 'criteria_note', 'status', 'last_verified_on', 'verification_note', 'created_at',
];
const PROFILE_COLUMNS = [
  'name', 'phone', 'email', 'school_or_college', 'institution', 'level', 'stream', 'course',
  'honours_subject', 'minor_subject', 'percentage', 'category', 'gender', 'state', 'income', 'disability', 'groups',
];

// API-shaped scholarship -> the row sent to Supabase (arrays stay arrays; the columns are jsonb).
export function toSupabaseRow(r) {
  const row = {};
  for (const c of SCHOLARSHIP_COLUMNS) row[c] = r[c] ?? null;
  for (const c of SCHOLARSHIP_JSON) row[c] = r[c] ?? [];
  row.gender = r.gender ?? 'any';
  row.state = r.state ?? 'All India';
  row.disability_only = Boolean(r.disability_only);
  row.status = r.status ?? 'draft';
  row.created_at = r.created_at ?? new Date().toISOString();
  return row;
}

// A row coming back from Supabase is already in API shape. Make sure the list fields are arrays.
export function fromSupabaseRow(row) {
  const out = { ...row };
  for (const c of SCHOLARSHIP_JSON) out[c] = Array.isArray(row[c]) ? row[c] : [];
  out.disability_only = Boolean(row.disability_only);
  return out;
}

export function createSupabaseStore({ url, key, fetchImpl = fetch, timeoutMs = 15000 }) {
  const base = `${url.replace(/\/+$/, '')}/rest/v1`;
  // Supabase has two key styles. The legacy service_role key is a JWT and goes in both headers.
  // The newer secret keys (sb_secret_...) are not JWTs and go in the apikey header only.
  const authHeaders = key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };

  async function call(method, path, { body, prefer } = {}) {
    const res = await fetchImpl(`${base}${path}`, {
      method,
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Supabase ${method} ${path.split('?')[0]} failed (${res.status}): ${text.slice(0, 300)}`);
    }
    return text ? JSON.parse(text) : null;
  }

  const eq = (v) => `eq.${encodeURIComponent(v)}`;

  return {
    kind: 'supabase',

    async ping() {
      await call('GET', '/scholarships?select=id&limit=1');
    },

    async listPublished() {
      const rows = await call('GET', '/scholarships?select=*&status=eq.published&limit=1000');
      return rows.map(fromSupabaseRow).filter((s) => s.official_link);
    },

    async getPublished(id) {
      const rows = await call('GET', `/scholarships?select=*&id=${eq(id)}&status=eq.published&limit=1`);
      const s = rows[0] ? fromSupabaseRow(rows[0]) : null;
      return s && s.official_link ? s : null;
    },

    async listAll() {
      const rows = await call('GET', '/scholarships?select=*&order=status.asc,last_date.asc.nullslast,name.asc&limit=2000');
      return rows.map(fromSupabaseRow);
    },

    async get(id) {
      const rows = await call('GET', `/scholarships?select=*&id=${eq(id)}&limit=1`);
      return rows[0] ? fromSupabaseRow(rows[0]) : null;
    },

    // Insert or update by id. created_at is kept on update because the caller passes the stored value.
    async save(s) {
      await call('POST', '/scholarships?on_conflict=id', {
        body: toSupabaseRow(s),
        prefer: 'resolution=merge-duplicates,return=minimal',
      });
    },

    async deleteScholarship(id) {
      const rows = await call('DELETE', `/scholarships?id=${eq(id)}`, { prefer: 'return=representation' });
      return rows.length;
    },

    async setStatus(id, status) {
      const rows = await call('PATCH', `/scholarships?id=${eq(id)}`, { body: { status }, prefer: 'return=representation' });
      return rows.length;
    },

    // Adds rows that are not there yet. With update: true, existing rows are overwritten.
    async seed(rows, { update = false, replace = false } = {}) {
      if (replace) throw new Error('--replace is not supported on Supabase. Delete rows in the Supabase dashboard instead.');
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50).map(toSupabaseRow);
        await call('POST', '/scholarships?on_conflict=id', {
          body: chunk,
          prefer: `resolution=${update ? 'merge' : 'ignore'}-duplicates,return=minimal`,
        });
      }
      return rows.length;
    },

    async insertProfile(p) {
      const row = {};
      for (const c of PROFILE_COLUMNS) row[c] = p[c] ?? null;
      row.groups = Array.isArray(p.groups) ? p.groups : [];
      await call('POST', '/student_profiles', { body: row, prefer: 'return=minimal' });
    },

    async listProfiles(limit = 2000) {
      return call('GET', `/student_profiles?select=*&order=id.desc&limit=${Number(limit) || 2000}`);
    },

    async countProfiles() {
      const res = await fetchImpl(`${base}/student_profiles?select=id`, {
        method: 'HEAD',
        headers: { ...authHeaders, Prefer: 'count=exact' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`Supabase count failed (${res.status})`);
      // Content-Range looks like "0-24/25" or "*/0"
      const total = (res.headers.get('content-range') || '').split('/')[1];
      return Number(total) || 0;
    },

    async deleteProfile(id) {
      const rows = await call('DELETE', `/student_profiles?id=${eq(id)}`, { prefer: 'return=representation' });
      return rows.length;
    },

    async deleteProfilesBefore(iso) {
      const rows = await call('DELETE', `/student_profiles?created_at=lt.${encodeURIComponent(iso)}`, { prefer: 'return=representation' });
      return rows.length;
    },

    async addSuggestion(s) {
      await call('POST', '/suggestions', {
        body: {
          scholarship_id: s.scholarship_id,
          field: s.field,
          old_value: s.old_value ?? null,
          new_value: s.new_value,
          source_url: s.source_url ?? null,
          note: s.note ?? null,
        },
        prefer: 'return=minimal',
      });
    },

    async listSuggestions(status = 'open') {
      return call('GET', `/suggestions?select=*&status=${eq(status)}&order=id.asc&limit=500`);
    },

    async getSuggestion(id) {
      const rows = await call('GET', `/suggestions?select=*&id=${eq(id)}&limit=1`);
      return rows[0] ?? null;
    },

    // Only an open suggestion can be resolved, so a double click cannot apply it twice.
    async resolveSuggestion(id, status) {
      const rows = await call('PATCH', `/suggestions?id=${eq(id)}&status=eq.open`, { body: { status }, prefer: 'return=representation' });
      return rows.length;
    },

    close() {},
  };
}

// Picks the store from the environment.
export async function openStore(env = process.env) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    return createSupabaseStore({ url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_KEY });
  }
  if (env.NODE_ENV === 'production') {
    console.warn(
      'WARNING: SUPABASE_URL / SUPABASE_SERVICE_KEY are not set, so data is kept in a local file. ' +
        'On most free hosts that file is erased on every deploy.',
    );
  }
  const dbPath = env.DB_PATH || join(ROOT, 'data', 'scholarships.db');
  mkdirSync(dirname(dbPath), { recursive: true });
  const { createSqliteStore } = await import('./store-sqlite.js');
  return createSqliteStore(dbPath);
}
