import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const JSON_FIELDS = ['levels', 'categories', 'documents', 'apply_steps', 'required_groups'];

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
  required_groups TEXT NOT NULL DEFAULT '[]',
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

// Students who agreed to be contacted/stored. Personal data: admin-only access.
export const PROFILE_SCHEMA = `
CREATE TABLE IF NOT EXISTS student_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  school_or_college TEXT NOT NULL,
  institution TEXT,
  level TEXT NOT NULL,
  stream TEXT,
  course TEXT,
  honours_subject TEXT,
  minor_subject TEXT,
  percentage REAL,
  category TEXT,
  gender TEXT,
  state TEXT,
  income INTEGER,
  disability INTEGER,
  groups TEXT
);
`;

export const PROFILE_COLUMNS = [
  'name', 'phone', 'email', 'school_or_college', 'institution', 'level', 'stream', 'course',
  'honours_subject', 'minor_subject', 'percentage', 'category', 'gender', 'state', 'income', 'disability', 'groups',
];

const COLUMNS = [
  'id', 'name', 'provider', 'levels', 'min_percentage', 'categories', 'gender', 'state', 'max_income',
  'disability_only', 'required_groups', 'amount', 'start_date', 'last_date', 'documents', 'apply_steps', 'official_link',
  'source_url', 'criteria_note', 'status', 'last_verified_on', 'verification_note', 'created_at',
];

const UPSERT = `
INSERT INTO scholarships (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map((c) => `:${c}`).join(', ')})
ON CONFLICT(id) DO UPDATE SET ${COLUMNS.filter((c) => c !== 'id' && c !== 'created_at')
  .map((c) => `${c} = excluded.${c}`)
  .join(', ')}`;

const INSERT_IF_NEW = `INSERT INTO scholarships (${COLUMNS.join(', ')}) VALUES (${COLUMNS.map((c) => `:${c}`).join(', ')}) ON CONFLICT(id) DO NOTHING`;

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  db.exec(PROFILE_SCHEMA);
  addMissingColumns(db);
  return db;
}

// Databases created by an older version lack newer columns. Add them in place.
function addMissingColumns(db) {
  const has = (table, col) => db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
  if (!has('scholarships', 'required_groups')) {
    db.exec(`ALTER TABLE scholarships ADD COLUMN required_groups TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!has('student_profiles', 'groups')) db.exec('ALTER TABLE student_profiles ADD COLUMN groups TEXT');
}

// DB row -> API shape: JSON columns parsed, booleans fixed.
export function fromRow(row) {
  const out = { ...row, disability_only: Boolean(row.disability_only) };
  for (const f of JSON_FIELDS) out[f] = JSON.parse(row[f] || '[]');
  return out;
}

// API shape -> DB parameters. Used by the seed loader and the admin panel.
export function toRow(r) {
  return {
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
    required_groups: JSON.stringify(r.required_groups ?? []),
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
  };
}

export function saveScholarship(db, r) {
  db.prepare(UPSERT).run(toRow(r));
}

// Adds scholarships from the seed file. Rows that already exist are left alone, so edits and
// publishing done in the admin panel survive a restart. Pass update: true to overwrite them.
export function loadSeed(db, path, { replace = false, update = false } = {}) {
  const rows = JSON.parse(readFileSync(path, 'utf8'));
  const stmt = db.prepare(update ? UPSERT : INSERT_IF_NEW);
  db.exec('BEGIN');
  try {
    if (replace) db.exec('DELETE FROM scholarships');
    for (const r of rows) stmt.run(toRow(r));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return rows.length;
}

// Public reads: only published items with an official link. Expiry is checked by the caller.
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

// Admin reads and writes.
export function listAllScholarships(db) {
  return db.prepare('SELECT * FROM scholarships ORDER BY status, last_date IS NULL, last_date, name').all().map(fromRow);
}

export function getScholarship(db, id) {
  const row = db.prepare('SELECT * FROM scholarships WHERE id = ?').get(id);
  return row ? fromRow(row) : null;
}

export function setStatus(db, id, status) {
  return db.prepare('UPDATE scholarships SET status = ? WHERE id = ?').run(status, id).changes;
}

export function insertProfile(db, p) {
  const cols = PROFILE_COLUMNS;
  // node:sqlite does not bind JS booleans, so store disability as 1/0.
  const params = Object.fromEntries(
    cols.map((c) => [c, typeof p[c] === 'boolean' ? (p[c] ? 1 : 0) : Array.isArray(p[c]) ? JSON.stringify(p[c]) : p[c] ?? null]),
  );
  db.prepare(`INSERT INTO student_profiles (${cols.join(', ')}) VALUES (${cols.map((c) => `:${c}`).join(', ')})`).run(params);
}

export function listProfiles(db, limit = 2000) {
  return db.prepare('SELECT * FROM student_profiles ORDER BY id DESC LIMIT ?').all(limit);
}
