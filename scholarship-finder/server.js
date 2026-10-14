import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, loadSeed, listPublished, getPublished, insertProfile } from './src/db.js';
import { handleAdmin } from './src/admin.js';
import { validateProfile } from './shared/validate.js';
import {
  LEVELS,
  CATEGORIES,
  todayIST,
  daysLeft,
  isOpen,
  checkEligibility,
  criteriaText,
  CLOSING_SOON_DAYS,
  NEW_DAYS,
} from './shared/eligibility.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || join(ROOT, 'data', 'scholarships.db');
const SEED_PATH = join(ROOT, 'seed', 'scholarships.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

await mkdir(dirname(DB_PATH), { recursive: true });
const db = openDb(DB_PATH);
if (db.prepare('SELECT COUNT(*) AS n FROM scholarships').get().n === 0) {
  loadSeed(db, SEED_PATH);
}

// Turns the free-form form values into a clean profile. Unknown values become null,
// which the matcher treats as "not given", so it never excludes on bad input.
export function cleanProfile(raw = {}) {
  const num = (v, min, max) => {
    const n = Number(v);
    return v !== '' && v != null && Number.isFinite(n) && n >= min && n <= max ? n : null;
  };
  const pick = (v, allowed) => (allowed.includes(v) ? v : null);
  const state = typeof raw.state === 'string' ? raw.state.trim().slice(0, 40) : '';
  return {
    name: typeof raw.name === 'string' ? raw.name.trim().slice(0, 60) : '',
    level: pick(raw.level, Object.keys(LEVELS)),
    percentage: num(raw.percentage, 0, 100),
    category: pick(raw.category, CATEGORIES),
    gender: pick(raw.gender, ['female', 'male', 'other']),
    state: state || null,
    income: num(raw.income, 0, 1e12),
    disability: typeof raw.disability === 'boolean' ? raw.disability : null,
    institution: pick(raw.institution, ['government', 'aided', 'private', 'other']),
  };
}

export function buildMatches(profile, now = new Date()) {
  const today = todayIST(now);
  const results = [];
  for (const s of listPublished(db)) {
    if (!isOpen(s, today)) continue;
    if (!checkEligibility(s, profile).eligible) continue;
    const left = daysLeft(s.last_date, today);
    results.push({
      id: s.id,
      name: s.name,
      provider: s.provider,
      amount: s.amount,
      last_date: s.last_date,
      days_left: left,
      closing_soon: left <= CLOSING_SOON_DAYS,
      newly_added: isNew(s.created_at, now),
      eligible: true,
      official_link: s.official_link,
      last_verified_on: s.last_verified_on,
    });
  }
  // Earliest deadline first. Open-ended schemes (no last date) go last.
  results.sort((a, b) => (a.last_date ?? '9999').localeCompare(b.last_date ?? '9999'));
  return { today, count: results.length, results };
}

function isNew(createdAt, now) {
  const t = Date.parse(createdAt);
  return Number.isFinite(t) && now.getTime() - t <= NEW_DAYS * 24 * 60 * 60 * 1000;
}

export function buildDetail(id, now = new Date()) {
  const row = getPublished(db, id);
  if (!row || !isOpen(row, todayIST(now))) return null;
  const today = todayIST(now);
  return {
    ...row,
    days_left: row.last_date ? daysLeft(row.last_date, today) : null,
    closing_soon: row.last_date ? daysLeft(row.last_date, today) <= CLOSING_SOON_DAYS : false,
    newly_added: isNew(row.created_at, now),
    criteria: criteriaText(row),
    today,
  };
}

function send(res, status, body, type = 'application/json; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache', ...headers });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readJson(req, limit = 10_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Body too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
}

async function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? '/index.html' : urlPath;
  const base = rel.startsWith('/shared/') ? ROOT : join(ROOT, 'public');
  const file = normalize(join(base, rel));
  if (!file.startsWith(base) || !existsSync(file)) return send(res, 404, 'Not found', 'text/plain');
  const body = await readFile(file);
  const cache = rel.endsWith('.html') || rel.endsWith('sw.js') ? 'no-cache' : 'public, max-age=3600';
  return send(res, 200, body, MIME[extname(file)] || 'application/octet-stream', { 'Cache-Control': cache });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    if (path === '/admin' || path.startsWith('/admin/')) {
      await handleAdmin(req, res, url, db);
      return;
    }

    if (req.method === 'POST' && path === '/api/match') {
      const profile = cleanProfile(await readJson(req));
      return send(res, 200, buildMatches(profile));
    }

    // Stores a student's details only when they ticked the consent box.
    if (req.method === 'POST' && path === '/api/profile') {
      const body = await readJson(req);
      if (body.consent !== true) return send(res, 400, { error: 'Consent is needed to save your details.' });
      const { value, errors } = validateProfile(body);
      if (errors.length) return send(res, 422, { error: errors[0], errors });
      insertProfile(db, value);
      return send(res, 201, { ok: true });
    }

    const detail = path.match(/^\/api\/scholarships\/([\w-]{1,80})$/);
    if (req.method === 'GET' && detail) {
      const item = buildDetail(detail[1]);
      return item ? send(res, 200, item) : send(res, 404, { error: 'Not found or closed' });
    }

    if (req.method === 'GET' && path === '/api/health') {
      return send(res, 200, { ok: true, today: todayIST() });
    }

    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(res, path);
    return send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    return send(res, status, { error: status === 500 ? 'Server error' : err.message });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`Scholarship Finder running on http://localhost:${PORT}`));
}

export { server, db };
