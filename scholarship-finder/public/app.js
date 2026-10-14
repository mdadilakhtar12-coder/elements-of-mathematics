import { LEVELS, CATEGORIES, daysLeft, todayIST, CLOSING_SOON_DAYS } from '/shared/eligibility.js';
import {
  STATES,
  STREAMS,
  UG_COURSES,
  SCIENCE_SUBJECTS,
  INSTITUTIONS,
  GENDERS,
} from '/shared/options.js';

const app = document.getElementById('app');
const PROFILE_KEY = 'sf-profile';
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
function saveProfileLocally(p) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* private mode: the form still works, just not remembered */
  }
}

const select = (name, items, selected, placeholder = 'Select') =>
  `<select name="${name}"><option value="">${placeholder}</option>${items
    .map(([v, l]) => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(l)}</option>`)
    .join('')}</select>`;

const same = (items) => items.map((x) => [x, x]);

// ---------- Home: profile form ----------
function renderForm(errors = [], current = null) {
  const p = current || loadProfile() || {};
  const showStream = p.level === 'class11' || p.level === 'class12';
  const showCourse = p.level === 'ug';
  const showSubjects = showCourse && p.course === 'B.Sc';

  app.innerHTML = `
    <section class="card intro">
      <h1>Find scholarships you can apply for</h1>
      <p>Fill this short form. We show only the scholarships you may be eligible for.</p>
    </section>
    <form id="profile" class="card form" novalidate>
      <fieldset>
        <legend>About you</legend>
        <label>Name <span class="muted">(optional)</span>
          <input name="name" autocomplete="name" maxlength="60" value="${esc(p.name)}">
        </label>
        <label>Mobile number <span class="muted">(needed only if you save your details)</span>
          <input name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="16" value="${esc(p.phone)}" placeholder="10-digit number">
        </label>
        <label>Email <span class="muted">(optional)</span>
          <input name="email" type="email" autocomplete="email" maxlength="120" value="${esc(p.email)}">
        </label>
      </fieldset>

      <fieldset>
        <legend>Your school or college</legend>
        <label>School / college name
          <input name="school_or_college" maxlength="120" value="${esc(p.school_or_college)}" placeholder="e.g. Ravenshaw University">
        </label>
        <label>Type
          ${select('institution', INSTITUTIONS, p.institution)}
        </label>
      </fieldset>

      <fieldset>
        <legend>Your class or course</legend>
        <label>Class / course
          ${select('level', Object.entries(LEVELS), p.level)}
        </label>
        <div data-show="stream" ${showStream ? '' : 'hidden'}>
          <label>Stream
            ${select('stream', same(STREAMS), p.stream)}
          </label>
        </div>
        <div data-show="course" ${showCourse ? '' : 'hidden'}>
          <label>Degree course
            ${select('course', same(UG_COURSES), p.course)}
          </label>
        </div>
        <div data-show="subjects" ${showSubjects ? '' : 'hidden'}>
          <label>B.Sc Honours subject
            ${select('honours_subject', same(SCIENCE_SUBJECTS), p.honours_subject)}
          </label>
          <label>B.Sc Minor subject <span class="muted">(if you have one)</span>
            ${select('minor_subject', same(SCIENCE_SUBJECTS), p.minor_subject)}
          </label>
        </div>
        <label>Marks in last exam (%)
          <input name="percentage" type="number" inputmode="decimal" min="0" max="100" step="0.01" value="${esc(p.percentage ?? '')}" placeholder="e.g. 78.5">
        </label>
      </fieldset>

      <fieldset>
        <legend>Eligibility details</legend>
        <label>Category
          ${select('category', same(CATEGORIES), p.category)}
        </label>
        <fieldset class="plain">
          <legend>Gender</legend>
          <div class="row">
            ${GENDERS.map(([v, l]) => `<label class="inline"><input type="radio" name="gender" value="${v}" ${p.gender === v ? 'checked' : ''}> ${l}</label>`).join('')}
          </div>
        </fieldset>
        <label>State
          ${select('state', same(STATES), p.state)}
        </label>
        <label>Annual family income (₹)
          <input name="income" type="number" inputmode="numeric" min="0" step="1000" value="${esc(p.income ?? '')}" placeholder="e.g. 180000">
        </label>
        <fieldset class="plain">
          <legend>Do you have a disability (PwD)?</legend>
          <div class="row">
            <label class="inline"><input type="radio" name="disability" value="yes" ${p.disability === true ? 'checked' : ''}> Yes</label>
            <label class="inline"><input type="radio" name="disability" value="no" ${p.disability === false ? 'checked' : ''}> No</label>
          </div>
        </fieldset>
      </fieldset>

      <label class="consent">
        <input type="checkbox" name="consent" ${p.consent ? 'checked' : ''}>
        <span>Save my details so the team can help me with scholarship applications. Your details are used only for this and are not shared. Leave this unticked to just see results.</span>
      </label>

      <div id="formError" class="error-box" role="alert" ${errors.length ? '' : 'hidden'}>
        ${errors.length ? `<strong>Please fix:</strong><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
      </div>
      <button class="primary" type="submit">Show my scholarships</button>
    </form>`;

  const form = document.getElementById('profile');
  // Show or hide the extra fields as the student picks their class or course.
  const refresh = () => {
    const fd = new FormData(form);
    const level = fd.get('level');
    const course = fd.get('course');
    form.querySelector('[data-show="stream"]').hidden = !(level === 'class11' || level === 'class12');
    form.querySelector('[data-show="course"]').hidden = level !== 'ug';
    form.querySelector('[data-show="subjects"]').hidden = !(level === 'ug' && course === 'B.Sc');
  };
  form.querySelector('[name="level"]').addEventListener('change', refresh);
  form.querySelector('[name="course"]').addEventListener('change', refresh);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const str = (k) => (f.get(k) || '').toString().trim();
    const profile = {
      name: str('name'),
      phone: str('phone'),
      email: str('email'),
      school_or_college: str('school_or_college'),
      institution: str('institution') || null,
      level: str('level') || null,
      stream: str('stream') || null,
      course: str('course') || null,
      honours_subject: str('honours_subject') || null,
      minor_subject: str('minor_subject') || null,
      percentage: str('percentage') ? Number(str('percentage')) : null,
      category: str('category') || null,
      gender: str('gender') || null,
      state: str('state') || null,
      income: str('income') ? Number(str('income')) : null,
      disability: f.get('disability') === 'yes' ? true : f.get('disability') === 'no' ? false : null,
      consent: f.get('consent') === 'on',
    };

    // Quick checks here; the server runs the full rules when details are saved.
    const problems = [];
    if (!profile.level) problems.push('Please choose your class or course.');
    if (profile.consent) {
      if (!profile.school_or_college) problems.push('Enter your school or college name.');
      if (!profile.phone) problems.push('Enter your mobile number to save your details.');
    }
    if (problems.length) return renderForm(problems, profile);

    const submit = form.querySelector('button[type=submit]');
    submit.disabled = true;
    submit.textContent = 'Checking…';
    try {
      if (profile.consent) {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          return renderForm(body.errors?.length ? body.errors : [body.error || 'Could not save your details.'], profile);
        }
      }
      saveProfileLocally(profile);
      location.hash = '#/results';
    } catch {
      renderForm(['Could not reach the server. Check your connection and try again.'], profile);
    }
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
