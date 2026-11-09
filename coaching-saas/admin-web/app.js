import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';

const L = window.PanelLogic;
const $ = (id) => document.getElementById(id);

/** Tiny DOM builder. Institute names / e-mails are typed by users, so everything goes through textContent (no innerHTML). */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return el;
}

if (!window.FIREBASE_CONFIG || window.FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
  say('Edit admin-web/config.js with your Firebase web config first.', 'err');
  throw new Error('Firebase config missing');
}
const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const functions = getFunctions(app, window.FUNCTIONS_REGION || 'asia-south1');
const call = async (name, data) => (await httpsCallable(functions, name)(data)).data;

let institutes = [];
let busy = false;

function say(text, kind = '') {
  const m = $('msg');
  m.textContent = text;
  m.className = kind;
}
function show(which) {
  for (const id of ['login', 'denied', 'app']) $(id).hidden = id !== which;
  $('who').hidden = which === 'login';
}

// ---------------------------------------------------------------- auth
$('google').onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => say(e.message, 'err'));
$('signout').onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  say('');
  if (!user) return show('login');
  $('email').textContent = user.email || '';
  const token = await user.getIdTokenResult(true);
  if (token.claims.sa !== true) return show('denied');
  show('app');
  load();
});

// ---------------------------------------------------------------- list
async function load() {
  say('Loading...');
  try {
    institutes = (await call('saListInstitutes', { limit: 500 })).institutes;
    say('');
    render();
  } catch (e) {
    say(e.message, 'err');
  }
}

function render() {
  const now = Date.now();
  const s = L.summarize(institutes, now);
  const tiles = $('tiles');
  tiles.replaceChildren(...[
    ['Institutes', s.total], ['Active', s.active], ['Suspended', s.suspended], ['Expired', s.expired], ['On paid plans', s.paid], ['Students', s.students],
  ].map(([label, n]) => h('div', { class: 'tile' }, h('b', {}, n), h('span', {}, label))));

  const list = L.filterInstitutes(institutes, { q: $('q').value, plan: $('fplan').value, status: $('fstatus').value }, now);
  $('empty').hidden = list.length > 0;
  $('rows').replaceChildren(...list.map((i) => {
    const st = L.statusOf(i, now);
    return h('tr', {},
      h('td', {}, h('b', {}, i.name), h('small', {}, i.id + ' · ' + (i.ownerEmail || ''))),
      h('td', {}, i.plan),
      h('td', {}, h('span', { class: 'badge ' + st }, st), i.statusReason ? h('small', {}, i.statusReason) : ''),
      h('td', {}, L.fmtDate(i.expiresAt)),
      h('td', { class: 'use' }, L.ROLES.map(([r, label]) => usageBar(label, i.usage?.[r] || 0, i.limits?.[r] || 0))),
      h('td', {}, h('button', { onclick: () => manage(i.id) }, 'Manage')));
  }));
}

function usageBar(label, used, limit) {
  const p = L.percent(used, limit);
  return h('div', {}, label + ' ' + used + '/' + limit, h('div', { class: 'bar' }, h('i', { class: p >= 100 ? 'full' : '', style: 'width:' + p + '%' })));
}

for (const id of ['q', 'fplan', 'fstatus']) $(id).addEventListener('input', render);
$('reload').onclick = load;
for (const p of L.PLANS) $('fplan').append(h('option', { value: p }, p));

// ---------------------------------------------------------------- manage dialog
async function run(label, name, data, reopen) {
  if (busy) return;
  busy = true;
  say(label + '...');
  try {
    await call(name, data);
    say('Done: ' + label, 'ok');
    institutes = (await call('saListInstitutes', { limit: 500 })).institutes;
    render();
    if (reopen) manage(reopen);
  } catch (e) {
    say(e.message, 'err');
  } finally {
    busy = false;
  }
}

function manage(id) {
  const i = institutes.find((x) => x.id === id);
  if (!i) return;
  const now = Date.now();
  $('dtitle').textContent = i.name + ' (' + i.id + ')';

  const planSel = h('select', {}, L.PLANS.map((p) => h('option', { value: p, selected: p === i.plan }, p)));
  const feats = Object.entries(L.FEATURES).map(([k, label]) =>
    h('label', { class: 'feat' }, h('input', { type: 'checkbox', 'data-key': k, checked: i.features?.[k] === true, disabled: k === 'core' }), h('span', {}, h('b', {}, k), ' - ' + label)));
  const limitInputs = Object.fromEntries(L.ROLES.map(([r]) => [r, h('input', { type: 'number', min: 0, value: i.limits?.[r] ?? 0 })]));
  const reason = h('input', { placeholder: 'Reason (shown to the institute)', value: i.statusReason || '', style: 'flex:1;min-width:180px' });
  const exp = h('input', { type: 'date', value: i.expiresAt ? L.fmtDate(i.expiresAt) : '' });
  const suspended = i.status === 'suspended';

  const body = h('div', {},
    h('div', { class: 'sec' }, h('h3', {}, 'Plan'), h('div', { class: 'row' }, planSel,
      h('button', { class: 'primary', onclick: () => {
        if (confirm('Switch to ' + planSel.value + '? Limits and features reset to that plan.')) run('Plan changed', 'saSetPlan', { inst: id, plan: planSel.value }, id);
      } }, 'Apply'),
      h('span', { class: 'muted' }, 'Resets features and limits to the plan defaults'))),
    h('div', { class: 'sec' }, h('h3', {}, 'Features'), feats, h('div', { class: 'row' },
      h('button', { onclick: () => {
        const features = {};
        body.querySelectorAll('input[data-key]').forEach((c) => { features[c.dataset.key] = c.checked; });
        run('Features saved', 'saSetFeatures', { inst: id, features }, id);
      } }, 'Save features'))),
    h('div', { class: 'sec' }, h('h3', {}, 'Limits (accounts per role)'),
      h('div', { class: 'limits' }, L.ROLES.map(([r, label]) => h('div', {}, h('label', {}, label), limitInputs[r]))),
      h('p', {}, h('button', { onclick: () => {
        try {
          const vals = Object.fromEntries(Object.entries(limitInputs).map(([r, el]) => [r, el.value]));
          run('Limits saved', 'saSetLimits', { inst: id, limits: L.limitsFromForm(vals) }, id);
        } catch (e) { say(e.message, 'err'); }
      } }, 'Save limits'), ' ', h('button', { class: 'ghost', onclick: () => run('Usage recounted', 'saRecountUsage', { inst: id }, id) }, 'Recount usage'))),
    h('div', { class: 'sec' }, h('h3', {}, 'Expiry'), h('div', { class: 'row' }, exp,
      h('button', { onclick: () => {
        try { run('Expiry saved', 'saSetExpiry', { inst: id, expiresAt: L.parseExpiry(exp.value) }, id); } catch (e) { say(e.message, 'err'); }
      } }, 'Save'),
      h('button', { class: 'ghost', onclick: () => run('Expiry extended', 'saSetExpiry', { inst: id, expiresAt: L.extendExpiry(i.expiresAt, now, 30) }, id) }, '+30 days'),
      h('button', { class: 'ghost', onclick: () => run('Expiry extended', 'saSetExpiry', { inst: id, expiresAt: L.extendExpiry(i.expiresAt, now, 365) }, id) }, '+1 year'),
      h('button', { class: 'ghost', onclick: () => run('Expiry removed', 'saSetExpiry', { inst: id, expiresAt: null }, id) }, 'Never expires'))),
    h('div', { class: 'sec' }, h('h3', {}, suspended ? 'Suspended' : 'Suspend'), h('div', { class: 'row' }, suspended ? '' : reason,
      suspended
        ? h('button', { class: 'primary', onclick: () => run('Institute activated', 'saSetStatus', { inst: id, status: 'active' }, id) }, 'Activate')
        : h('button', { class: 'danger', onclick: () => {
          if (confirm('Suspend ' + i.name + '? Nobody there can use the app until you activate it.')) run('Institute suspended', 'saSetStatus', { inst: id, status: 'suspended', reason: reason.value }, id);
        } }, 'Suspend'))));
  $('dbody').replaceChildren(body);
  const dlg = $('dlg');
  if (!dlg.open) dlg.showModal();
}
