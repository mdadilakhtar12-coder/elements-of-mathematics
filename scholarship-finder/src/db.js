import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const JSON_FIELDS = ['levels', 'categories', 'documents', 'apply_steps'];

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS scholarships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  levels TEXT NOT NULL DEFAULT '[]',
  min_percentage REAL,
  categories TEXT NOT NULL DEFAULT '[]',
  gender TEXT NOT NULL DEFAULT 'any',
  state TEXT NOT NULL DEFAULT 'All India',
  max_income INTEGER,
  disability_only INTEGER NOT NULL DEFAULT 0,
  amount TEXT,
  start_date TEXT,
  last_date TEXT,
  documents TEXT NOT NULL DEFAULT '[]',
  apply_steps TEXT NOT NULL DEFAULT '[]',
  official_link TEXT,
  source_url TEXT,
  criteria_note TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'expired')),
  last_verified_on TEXT,
  verification_note TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_scholarships_status_last_date ON scholarships (status, last_date);
`;

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  return db;
}

// Turns a DB row into the API shape: JSON columns parsed, booleans fixed.
export function fromRow(row) {
  const out = { ...row, disability_only: Boolean(row.disability_only) };
  for (const f of JSON_FIELDS) out[f] = JSON.parse(row[f] || '[]');
  return out;
}

export function loadSeed(db, path, { replace = false } = {}) {
  const rows = JSON.parse(readFileSync(path, 'utf8'));
  const stmt = db.prepare(`
    INSERT INTO scholarships (
      id, name, provider, levels, min_percentage, categories, gender, state, max_income,
      disability_only, amount, start_date, last_date, documents, apply_steps,
      official_link, source_url, criteria_note, status, last_verified_on, verification_note, created_at
    ) VALUES (
      :id, :name, :provider, :levels, :min_percentage, :categories, :gender, :state, :max_income,
      :disability_only, :amount, :start_date, :last_date, :documents, :apply_steps,
      :official_link, :source_url, :criteria_note, :status, :last_verified_on, :verification_note, :created_at
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, provider = excluded.provider, levels = excluded.levels,
      min_percentage = excluded.min_percentage, categories = excluded.categories,
      gender = excluded.gender, state = excluded.state, max_income = excluded.max_income,
      disability_only = excluded.disability_only, amount = excluded.amount,
      start_date = excluded.start_date, last_date = excluded.last_date,
      documents = excluded.documents, apply_steps = excluded.apply_steps,
      official_link = excluded.official_link, source_url = excluded.source_url,
      criteria_note = excluded.criteria_note, status = excluded.status,
      last_verified_on = excluded.last_verified_on, verification_note = excluded.verification_note
  `);
  db.exec('BEGIN');
  try {
    if (replace) db.exec('DELETE FROM scholarships');
    for (const r of rows) {
      stmt.run({
        id: r.id,
        name: r.name,
        provider: r.provider,
        levels: JSON.stringify(r.levels ?? []),
        min_percentage: r.min_percentage ?? null,
        categories: JSON.stringify(r.categories ?? []),
        gender: r.gender ?? 'any',
        state: r.state ?? 'All India',
        max_income: r.max_income ?? null,
        disability_only: r.disability_only ? 1 : 0,
        amount: r.amount ?? null,
        start_date: r.start_date ?? null,
        last_date: r.last_date ?? null,
        documents: JSON.stringify(r.documents ?? []),
        apply_steps: JSON.stringify(r.apply_steps ?? []),
        official_link: r.official_link ?? null,
        source_url: r.source_url ?? null,
        criteria_note: r.criteria_note ?? null,
        status: r.status ?? 'draft',
        last_verified_on: r.last_verified_on ?? null,
        verification_note: r.verification_note ?? null,
        created_at: r.created_at ?? new Date().toISOString(),
      });
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return rows.length;
}

// Only published, open scholarships with an official link. Expiry is checked
// against today's date in the caller, so nothing stale is ever shown.
export function listPublished(db) {
  return db
    .prepare(`SELECT * FROM scholarships WHERE status = 'published' AND official_link IS NOT NULL AND official_link <> ''`)
    .all()
    .map(fromRow);
}

export function getPublished(db, id) {
  const row = db
    .prepare(`SELECT * FROM scholarships WHERE id = ? AND status = 'published' AND official_link IS NOT NULL AND official_link <> ''`)
    .get(id);
  return row ? fromRow(row) : null;
}
