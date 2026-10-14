// Admin panel: server-rendered pages under /admin. Nothing here runs in the browser except plain forms.
import {
  listAllScholarships,
  getScholarship,
  saveScholarship,
  setStatus,
  listProfiles,
  PROFILE_COLUMNS,
} from './db.js';
import * as auth from './auth.js';
import { validateScholarship } from '../shared/validate.js';
import { LEVELS, CATEGORIES } from '../shared/eligibility.js';
import { STATES, GENDERS, GROUPS } from '../shared/options.js';

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self'; script-src 'none'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, ...SECURITY_HEADERS, ...extra });
  res.end(body);
}

function redirect(res, to, extra = {}) {
  res.writeHead(303, { Location: to, ...SECURITY_HEADERS, ...extra });
  res.end();
}

async function readForm(req, limit = 60_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Form too large'), { status: 413 });
    chunks.push(chunk);
  }
  const params = new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
  const out = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

// Blocks cross-site form posts. SameSite=Strict on the cookie is the first defence; this is the second.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

const clientIp = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();

function layout(title, body, { nav = true } = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} · Admin · Scholarship Finder</title>
<link rel="stylesheet" href="/styles.css"></head>
<body><header class="top"><a class="brand" href="/admin">Scholarship Finder · Admin</a>
${nav ? `<form method="post" action="/admin/logout" class="inline-form"><button class="ghost" type="submit">Log out</button></form>` : ''}
</header>
<main class="wrap admin">${body}</main></body></html>`;
}

const flash = (msg) => (msg ? `<p class="notice" role="status">${esc(msg)}</p>` : '');
const errorList = (errors) =>
  errors.length ? `<div class="error-box" role="alert"><strong>Please fix:</strong><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>` : '';

function loginPage(msg = '') {
  return layout(
    'Log in',
    `<section class="card narrow"><h1>Admin log in</h1>${flash(msg)}
    <form method="post" action="/admin/login" class="stack">
      <label>Password <input type="password" name="password" autocomplete="current-password" required></label>
      <button class="primary" type="submit">Log in</button>
    </form></section>`,
    { nav: false },
  );
}

const statusBadge = (s) => `<span class="pill ${esc(s)}">${esc(s)}</span>`;

function scholarshipRows(items) {
  if (!items.length) return `<tr><td colspan="6" class="muted">Nothing here yet.</td></tr>`;
  return items
    .map(
      (s) => `<tr>
      <td><a href="/admin/scholarships/${esc(s.id)}">${esc(s.name)}</a><div class="muted small">${esc(s.provider)}</div></td>
      <td>${statusBadge(s.status)}</td>
      <td>${esc(s.last_date || 'open-ended')}</td>
      <td>${esc(s.last_verified_on || 'never')}</td>
      <td class="small">${s.official_link ? 'yes' : '<span class="error">missing</span>'}</td>
      <td class="actions-cell"><a href="/admin/scholarships/${esc(s.id)}">Edit</a>
        ${s.status === 'draft' ? `<form method="post" action="/admin/scholarships/${esc(s.id)}/status" class="inline-form">
          <input type="hidden" name="status" value="published"><button class="small-btn" type="submit">Publish</button></form>` : ''}</td></tr>`,
    )
    .join('');
}

function dashboardPage(db, { msg = '' } = {}) {
  const all = listAllScholarships(db);
  const drafts = all.filter((s) => s.status === 'draft');
  const count = (st) => all.filter((s) => s.status === st).length;
  const table = (items) => `<div class="table-wrap"><table>
    <thead><tr><th>Scholarship</th><th>Status</th><th>Last date</th><th>Verified</th><th>Official link</th><th></th></tr></thead>
    <tbody>${scholarshipRows(items)}</tbody></table></div>`;
  return layout(
    'Dashboard',
    `${flash(msg)}
    <section class="stats">
      <div class="stat"><strong>${count('published')}</strong><span>Published</span></div>
      <div class="stat"><strong>${count('draft')}</strong><span>Drafts</span></div>
      <div class="stat"><strong>${count('expired')}</strong><span>Expired</span></div>
      <div class="stat"><strong>${listProfiles(db, 100000).length}</strong><span>Student profiles</span></div>
    </section>
    <p class="actions"><a class="primary-link" href="/admin/scholarships/new">+ Add scholarship</a>
      <a class="secondary-link" href="/admin/students">Student profiles</a></p>
    <h2>Review queue (drafts)</h2>
    <p class="muted small">Drafts are hidden from students. Check each one on the official site, then publish.</p>
    ${table(drafts)}
    <h2>All scholarships</h2>
    ${table(all)}`,
  );
}

function scholarshipForm(values, errors, { isNew }) {
  const v = values;
  const has = (arr, x) => (Array.isArray(arr) ? arr : [arr]).includes(x);
  const checks = (name, options, selected) =>
    options
      .map(
        ([val, label]) =>
          `<label class="inline"><input type="checkbox" name="${name}" value="${esc(val)}" ${has(selected, val) ? 'checked' : ''}> ${esc(label)}</label>`,
      )
      .join('');
  const text = (name, label, opts = {}) =>
    `<label>${esc(label)}${opts.hint ? ` <span class="muted small">${esc(opts.hint)}</span>` : ''}
      <input name="${name}" value="${esc(v[name] ?? '')}" ${opts.type ? `type="${opts.type}"` : ''} ${opts.required ? 'required' : ''} ${opts.readonly ? 'readonly' : ''} ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}></label>`;
  const area = (name, label, hint) =>
    `<label>${esc(label)} <span class="muted small">${esc(hint)}</span><textarea name="${name}" rows="5">${esc(v[name] ?? '')}</textarea></label>`;
  const select = (name, label, options, selected) =>
    `<label>${esc(label)}<select name="${name}">${options
      .map(([val, lab]) => `<option value="${esc(val)}" ${val === selected ? 'selected' : ''}>${esc(lab)}</option>`)
      .join('')}</select></label>`;

  return `<p><a href="/admin">← Back to dashboard</a></p>
  <h1>${isNew ? 'Add scholarship' : 'Edit scholarship'}</h1>
  ${errorList(errors)}
  <form method="post" action="/admin/scholarships" class="stack card">
    <input type="hidden" name="is_new" value="${isNew ? '1' : '0'}">
    ${isNew ? text('id', 'ID (lowercase, dashes, used in the link)', { required: true, placeholder: 'e.g. nsp-post-matric-obc' }) : `<input type="hidden" name="id" value="${esc(v.id)}"><p><strong>ID:</strong> ${esc(v.id)}</p>`}
    ${text('name', 'Scholarship name', { required: true })}
    ${text('provider', 'Provider (who runs it)', { required: true })}
    <fieldset><legend>Class / course</legend><div class="row">${checks('levels', Object.entries(LEVELS), v.levels)}</div></fieldset>
    <fieldset><legend>Categories (leave all unticked for all)</legend><div class="row">${checks('categories', CATEGORIES.map((c) => [c, c]), v.categories)}</div></fieldset>
    ${select('gender', 'Gender', [['any', 'Any'], ...GENDERS.map(([val, lab]) => [val, lab === 'Female' ? 'Girls only' : lab])], v.gender || 'any')}
    ${select('state', 'Domicile', [['All India', 'All India'], ...STATES.map((s) => [s, s])], v.state || 'All India')}
    ${text('min_percentage', 'Minimum marks (%)', { type: 'number', hint: 'blank = no rule' })}
    ${text('max_income', 'Max annual family income (₹)', { type: 'number', hint: 'blank = no limit' })}
    <label class="inline"><input type="checkbox" name="disability_only" ${v.disability_only ? 'checked' : ''}> Only for students with a disability</label>
    <fieldset><legend>Only for these groups (leave unticked if open to all)</legend><div class="stack-checks">${checks('required_groups', GROUPS.map((g) => [g.key, g.short]), v.required_groups)}</div></fieldset>
    ${text('amount', 'Amount / benefit', { placeholder: 'e.g. ₹5,000 per year (as per the official notice)' })}
    ${text('start_date', 'Start date', { type: 'date' })}
    ${text('last_date', 'Last date', { type: 'date' })}
    ${area('documents', 'Documents required', 'one per line')}
    ${area('apply_steps', 'How to apply', 'one step per line, in order')}
    ${text('official_link', 'Official apply link (https://)', { type: 'url', required: true })}
    ${text('source_url', 'Source page where you found the details (https://)', { type: 'url' })}
    ${area('criteria_note', 'Extra eligibility note', 'shown to students (optional)')}
    ${select('status', 'Status', [['draft', 'Draft (hidden)'], ['published', 'Published (visible)'], ['expired', 'Expired (hidden)']], v.status || 'draft')}
    ${text('last_verified_on', 'Date you checked it on the official site', { type: 'date', hint: 'required to publish' })}
    ${area('verification_note', 'Verification note (internal)', 'what you checked and where')}
    <button class="primary" type="submit">Save</button>
  </form>`;
}

function scholarshipFormPage(values, errors, opts) {
  return layout(opts.isNew ? 'Add scholarship' : 'Edit scholarship', flash(opts.msg) + scholarshipForm(values, errors, opts));
}

// Turns a stored scholarship back into form values.
function asFormValues(s) {
  return {
    ...s,
    levels: s.levels,
    categories: s.categories,
    min_percentage: s.min_percentage ?? '',
    max_income: s.max_income ?? '',
    documents: s.documents.join('\n'),
    apply_steps: s.apply_steps.join('\n'),
  };
}

function studentsPage(db) {
  const rows = listProfiles(db);
  const body = rows.length
    ? `<div class="table-wrap"><table class="students"><thead><tr>
        <th>When</th><th>Name</th><th>Mobile</th><th>Email</th><th>School / college</th><th>Class / course</th><th>Marks</th><th>Category</th><th>State</th><th>Income</th><th>Groups</th></tr></thead><tbody>
        ${rows
          .map(
            (r) => `<tr><td>${esc(r.created_at.slice(0, 10))}</td><td>${esc(r.name || '')}</td><td>${esc(r.phone)}</td><td>${esc(r.email || '')}</td>
            <td>${esc(r.school_or_college)}${r.institution ? `<div class="muted small">${esc(r.institution)}</div>` : ''}</td>
            <td>${esc(classLabel(r))}</td><td>${esc(r.percentage ?? '')}</td><td>${esc(r.category || '')}</td><td>${esc(r.state || '')}</td>
            <td>${r.income == null ? '' : `₹${Number(r.income).toLocaleString('en-IN')}`}</td><td class="small">${esc(parseGroups(r.groups).join(', '))}</td></tr>`,
          )
          .join('')}</tbody></table></div>
        <p><a class="secondary-link" href="/admin/students.csv">Download CSV</a></p>`
    : `<p class="muted">No student profiles yet.</p>`;
  return layout('Students', `<p><a href="/admin">← Back to dashboard</a></p><h1>Student profiles</h1>
    <p class="muted small">Only students who ticked the consent box appear here. Handle these details with care.</p>${body}`);
}

function parseGroups(v) {
  try {
    const a = JSON.parse(v || '[]');
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

function classLabel(r) {
  const base = LEVELS[r.level] || r.level;
  if (r.course === 'B.Sc') return `${base} · B.Sc · Honours: ${r.honours_subject || '-'}${r.minor_subject ? `, Minor: ${r.minor_subject}` : ''}`;
  if (r.course) return `${base} · ${r.course}`;
  if (r.stream) return `${base} · ${r.stream}`;
  return base;
}

// CSV cell: quoted, and formula-like cells are prefixed so spreadsheets do not run them.
export function csvCell(v) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function studentsCsv(db) {
  const cols = ['created_at', ...PROFILE_COLUMNS];
  const lines = [cols.join(',')];
  for (const r of listProfiles(db, 100000)) {
    lines.push(cols.map((c) => csvCell(c === 'groups' ? parseGroups(r.groups).join(';') : r[c])).join(','));
  }
  return lines.join('\n') + '\n';
}

// ---- Router ----

export async function handleAdmin(req, res, url, db) {
  const path = url.pathname.replace(/\/+$/, '') || '/admin';
  const method = req.method;

  if (!process.env.ADMIN_PASSWORD) {
    send(res, 503, layout('Disabled', `<section class="card narrow"><h1>Admin is off</h1><p>Set the ADMIN_PASSWORD environment variable on the server, then restart.</p></section>`, { nav: false }));
    return true;
  }

  if (path === '/admin/login' && method === 'GET') {
    send(res, 200, loginPage(url.searchParams.get('msg') || ''));
    return true;
  }

  if (path === '/admin/login' && method === 'POST') {
    if (!sameOrigin(req)) {
      send(res, 403, loginPage('Request blocked.'));
      return true;
    }
    const ip = clientIp(req);
    if (!auth.canAttempt(ip)) {
      send(res, 429, loginPage('Too many wrong attempts. Wait 15 minutes and try again.'));
      return true;
    }
    const form = await readForm(req, 4000);
    if (!auth.passwordMatches(form.password, process.env.ADMIN_PASSWORD)) {
      auth.recordFailure(ip);
      send(res, 401, loginPage('Wrong password.'));
      return true;
    }
    auth.clearFailures(ip);
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    redirect(res, '/admin', {
      'Set-Cookie': `${auth.SESSION_COOKIE}=${auth.makeSession()}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=${auth.SESSION_SECONDS}${secure}`,
    });
    return true;
  }

  if (path === '/admin/logout' && method === 'POST') {
    redirect(res, '/admin/login?msg=Logged%20out', {
      'Set-Cookie': `${auth.SESSION_COOKIE}=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0`,
    });
    return true;
  }

  // Everything below needs a valid session.
  const cookie = auth.readCookie(req.headers.cookie, auth.SESSION_COOKIE);
  if (!auth.isValidSession(cookie)) {
    redirect(res, '/admin/login');
    return true;
  }
  if (method === 'POST' && !sameOrigin(req)) {
    send(res, 403, layout('Blocked', '<p>Request blocked.</p>'));
    return true;
  }

  if (path === '/admin' && method === 'GET') {
    send(res, 200, dashboardPage(db, { msg: url.searchParams.get('msg') || '' }));
    return true;
  }

  if (path === '/admin/students' && method === 'GET') {
    send(res, 200, studentsPage(db));
    return true;
  }

  if (path === '/admin/students.csv' && method === 'GET') {
    send(res, 200, studentsCsv(db), 'text/csv; charset=utf-8', {
      'Content-Disposition': 'attachment; filename="student-profiles.csv"',
    });
    return true;
  }

  if (path === '/admin/scholarships/new' && method === 'GET') {
    send(res, 200, scholarshipFormPage({ status: 'draft', gender: 'any', state: 'All India', levels: [] }, [], { isNew: true }));
    return true;
  }

  const edit = path.match(/^\/admin\/scholarships\/([a-z0-9-]{3,80})$/);
  if (edit && method === 'GET') {
    const s = getScholarship(db, edit[1]);
    if (!s) {
      send(res, 404, layout('Not found', '<p>No such scholarship.</p>'));
      return true;
    }
    send(res, 200, scholarshipFormPage(asFormValues(s), [], { isNew: false, msg: url.searchParams.get('msg') || '' }));
    return true;
  }

  if (path === '/admin/scholarships' && method === 'POST') {
    const form = await readForm(req);
    const isNew = form.is_new === '1';
    const { value, errors } = validateScholarship(form);
    if (!isNew) value.id = String(form.id || '');
    if (isNew && getScholarship(db, value.id)) errors.push(`A scholarship with ID "${value.id}" already exists.`);
    if (errors.length) {
      send(res, 422, scholarshipFormPage({ ...form, ...value, levels: value.levels, categories: value.categories }, errors, { isNew }));
      return true;
    }
    const existing = getScholarship(db, value.id);
    saveScholarship(db, { ...value, created_at: existing ? existing.created_at : undefined });
    redirect(res, `/admin/scholarships/${encodeURIComponent(value.id)}?msg=Saved`);
    return true;
  }

  const action = path.match(/^\/admin\/scholarships\/([a-z0-9-]{3,80})\/status$/);
  if (action && method === 'POST') {
    const s = getScholarship(db, action[1]);
    if (!s) {
      send(res, 404, layout('Not found', '<p>No such scholarship.</p>'));
      return true;
    }
    const form = await readForm(req, 1000);
    const next = ['draft', 'published', 'expired'].includes(form.status) ? form.status : null;
    if (!next) {
      redirect(res, '/admin');
      return true;
    }
    // Re-check the stored record as it would be published, so a publish can never skip the rules.
    const { errors } = validateScholarship({ ...asFormValues(s), status: next });
    if (next === 'published' && errors.length) {
      send(res, 422, scholarshipFormPage({ ...asFormValues(s), status: 'draft' }, errors, { isNew: false }));
      return true;
    }
    setStatus(db, s.id, next);
    redirect(res, `/admin/scholarships/${encodeURIComponent(s.id)}?msg=${encodeURIComponent(`Status set to ${next}`)}`);
    return true;
  }

  send(res, 404, layout('Not found', '<p>Page not found.</p>'));
  return true;
}

