import { LEVELS, CATEGORIES, daysLeft, todayIST, CLOSING_SOON_DAYS } from '/shared/eligibility.js';

const app = document.getElementById('app');
const PROFILE_KEY = 'sf-profile';
const STATES = [
  'Odisha', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];
const CONFIRM_NOTE = 'Please confirm on the official website before applying.';

// Escape anything from the API before putting it into HTML.
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Dates are India dates. Format them in India time so a phone in another timezone shows the same day.
const fmtDate = (iso) =>
  iso
    ? new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
    : 'Not announced';

function daysBadge(lastDate) {
  if (!lastDate) return '<span class="badge grey">Open-ended</span>';
  const left = daysLeft(lastDate, todayIST());
  if (left < 0) return '<span class="badge grey">Expired</span>';
  if (left === 0) return '<span class="badge red">Last day today</span>';
  if (left < CLOSING_SOON_DAYS) return `<span class="badge red">${left} day${left === 1 ? '' : 's'} left</span>`;
  return `<span class="badge">${left} days left</span>`;
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
  } catch {
    return null;
  }
}
function saveProfile(p) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* private mode: the form still works, just not remembered */
  }
}

const options = (items, selected) =>
  items.map(([v, l]) => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(l)}</option>`).join('');

// ---------- Home: profile form ----------
function renderForm() {
  const p = loadProfile() || {};
  app.innerHTML = `
    <section class="card intro">
      <h1>Find scholarships you can apply for</h1>
      <p>Fill this short form. We show only the scholarships you may be eligible for.</p>
    </section>
    <form id="profile" class="card form" novalidate>
      <label>Name <span class="muted">(optional)</span>
        <input name="name" autocomplete="given-name" maxlength="60" value="${esc(p.name)}">
      </label>
      <label>Class / course
        <select name="level" required>
          <option value="">Select</option>
          ${options(Object.entries(LEVELS), p.level)}
        </select>
      </label>
      <label>Marks in last exam (%)
        <input name="percentage" type="number" inputmode="decimal" min="0" max="100" step="0.01" value="${esc(p.percentage ?? '')}" placeholder="e.g. 78.5">
      </label>
      <label>Category
        <select name="category">
          <option value="">Select</option>
          ${options(CATEGORIES.map((c) => [c, c]), p.category)}
        </select>
      </label>
      <fieldset>
        <legend>Gender</legend>
        <div class="row">
          ${[['female', 'Female'], ['male', 'Male'], ['other', 'Other']]
            .map(([v, l]) => `<label class="inline"><input type="radio" name="gender" value="${v}" ${p.gender === v ? 'checked' : ''}> ${l}</label>`)
            .join('')}
        </div>
      </fieldset>
      <label>State
        <select name="state">
          <option value="">Select</option>
          ${options(STATES.map((s) => [s, s]), p.state)}
        </select>
      </label>
      <label>Annual family income (₹)
        <input name="income" type="number" inputmode="numeric" min="0" step="1000" value="${esc(p.income ?? '')}" placeholder="e.g. 180000">
      </label>
      <fieldset>
        <legend>Do you have a disability (PwD)?</legend>
        <div class="row">
          <label class="inline"><input type="radio" name="disability" value="yes" ${p.disability === true ? 'checked' : ''}> Yes</label>
          <label class="inline"><input type="radio" name="disability" value="no" ${p.disability === false ? 'checked' : ''}> No</label>
        </div>
      </fieldset>
      <label>School / college type
        <select name="institution">
          <option value="">Select</option>
          ${options(
            [['government', 'Government'], ['aided', 'Aided / government-supported'], ['private', 'Private'], ['other', 'Other']],
            p.institution,
          )}
        </select>
      </label>
      <p id="formError" class="error" role="alert" hidden></p>
      <button class="primary" type="submit">Show my scholarships</button>
    </form>`;

  document.getElementById('profile').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const profile = {
      name: f.get('name')?.trim() || '',
      level: f.get('level') || null,
      percentage: f.get('percentage') ? Number(f.get('percentage')) : null,
      category: f.get('category') || null,
      gender: f.get('gender') || null,
      state: f.get('state') || null,
      income: f.get('income') ? Number(f.get('income')) : null,
      disability: f.get('disability') === 'yes' ? true : f.get('disability') === 'no' ? false : null,
      institution: f.get('institution') || null,
    };
    if (!profile.level) {
      const err = document.getElementById('formError');
      err.textContent = 'Please choose your class or course.';
      err.hidden = false;
      return;
    }
    saveProfile(profile);
    location.hash = '#/results';
  });
}

// ---------- Results: cards ----------
let cache = { key: null, data: null };

async function renderResults() {
  const profile = loadProfile();
  if (!profile) return (location.hash = '#/');
  const filter = sessionStorage.getItem('sf-filter') || 'all';
  app.innerHTML = `<p class="muted center" role="status">Checking scholarships…</p>`;

  const key = JSON.stringify(profile);
  try {
    if (cache.key !== key) {
      const res = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: key });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cache = { key, data: await res.json() };
    }
  } catch {
    app.innerHTML = `<section class="card"><p class="error">Could not load scholarships. Check your connection and try again.</p>
      <button class="primary" id="retry">Retry</button> <a href="#/">Edit details</a></section>`;
    document.getElementById('retry').onclick = () => {
      cache = { key: null, data: null };
      renderResults();
    };
    return;
  }

  // Days left is recalculated on the device every time, so an open page stays correct.
  const today = todayIST();
  const items = cache.data.results
    .map((s) => ({ ...s, days_left: s.last_date ? daysLeft(s.last_date, today) : null }))
    .filter((s) => s.days_left === null || s.days_left >= 0)
    .filter((s) => filter !== 'closing' || (s.days_left !== null && s.days_left <= CLOSING_SOON_DAYS));

  const chip = (id, label) =>
    `<button class="chip ${filter === id ? 'on' : ''}" data-filter="${id}" aria-pressed="${filter === id}">${label}</button>`;

  app.innerHTML = `
    <section class="summary">
      <h1>${profile.name ? `Hi ${esc(profile.name)}, ` : ''}${items.length} scholarship${items.length === 1 ? '' : 's'} for you</h1>
      <p class="muted">Sorted by last date. ${esc(CONFIRM_NOTE)}</p>
    </section>
    <nav class="chips" aria-label="Filter">
      ${chip('all', 'All')}${chip('closing', 'Closing soon')}
      <a class="chip link" href="#/">Edit details</a>
    </nav>
    <ul class="cards" aria-live="polite">
      ${items.length ? items.map(cardHtml).join('') : `<li class="card empty">No scholarships match this filter right now.</li>`}
    </ul>`;

  app.querySelectorAll('[data-filter]').forEach((b) =>
    b.addEventListener('click', () => {
      sessionStorage.setItem('sf-filter', b.dataset.filter);
      renderResults();
    }),
  );
}

function cardHtml(s) {
  return `
    <li class="card">
      <a class="card-link" href="#/s/${esc(s.id)}">
        <div class="tags">
          <span class="tag eligible">Eligible</span>
          ${s.newly_added ? '<span class="tag new">Newly added</span>' : ''}
        </div>
        <h2>${esc(s.name)}</h2>
        <p class="muted">${esc(s.provider)}</p>
        <p class="amount">${esc(s.amount || 'Amount not listed')}</p>
        <div class="meta">
          <span>Last date: <strong>${fmtDate(s.last_date)}</strong></span>
          ${daysBadge(s.last_date)}
        </div>
      </a>
      <p class="fine">${esc(CONFIRM_NOTE)} Last verified: ${s.last_verified_on ? fmtDate(s.last_verified_on) : 'not yet'}</p>
    </li>`;
}

// ---------- Detail ----------
async function renderDetail(id) {
  app.innerHTML = `<p class="muted center" role="status">Loading…</p>`;
  let s;
  try {
    const res = await fetch(`/api/scholarships/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      app.innerHTML = `<section class="card"><p>This scholarship is closed or no longer listed.</p><a href="#/results">Back to my list</a></section>`;
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    s = await res.json();
  } catch {
    app.innerHTML = `<section class="card"><p class="error">Could not load this scholarship. Try again.</p><a href="#/results">Back</a></section>`;
    return;
  }
  if (!s.official_link) return; // never show a scholarship without an official link

  const today = todayIST();
  const left = s.last_date ? daysLeft(s.last_date, today) : null;
  const list = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join('');
  app.innerHTML = `
    <a class="back" href="#/results">← Back to my list</a>
    <article class="card detail">
      <div class="tags">
        <span class="tag eligible">Eligible</span>
        ${s.newly_added ? '<span class="tag new">Newly added</span>' : ''}
      </div>
      <h1>${esc(s.name)}</h1>
      <p class="muted">${esc(s.provider)}</p>
      <p class="amount">${esc(s.amount || 'Amount not listed')}</p>
      <dl class="dates">
        <div><dt>Start date</dt><dd>${fmtDate(s.start_date)}</dd></div>
        <div><dt>Last date</dt><dd>${fmtDate(s.last_date)}</dd></div>
        <div><dt>Days left</dt><dd>${left === null ? 'Open-ended' : left < 0 ? 'Expired' : daysBadge(s.last_date)}</dd></div>
      </dl>

      <h2>Eligibility criteria</h2>
      <ul class="bullets">${list(s.criteria)}</ul>

      <h2>Documents required</h2>
      <ul class="bullets">${list(s.documents)}</ul>

      <h2>How to apply</h2>
      <ol class="steps">${s.apply_steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>

      <a class="apply" href="${esc(s.official_link)}" target="_blank" rel="noopener noreferrer">Apply on official website</a>
      <p class="fine">${esc(CONFIRM_NOTE)} Last verified: ${s.last_verified_on ? fmtDate(s.last_verified_on) : 'not yet'}.
      ${s.verification_note ? `<br>${esc(s.verification_note)}` : ''}</p>
    </article>`;
}

// ---------- Router ----------
function route() {
  const hash = location.hash || '#/';
  const detail = hash.match(/^#\/s\/([\w-]{1,80})$/);
  if (detail) return renderDetail(detail[1]);
  if (hash === '#/results') return renderResults();
  return renderForm();
}

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
