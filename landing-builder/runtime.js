/*
 * Runtime that lives INSIDE every landing page (editor preview + exported ZIP).
 * It is written as a function so the builder can serialise it with toString()
 * and ship it as lb.js inside the ZIP. Do not reference anything outside it.
 *
 * Handles: WhatsApp / Call buttons, Enroll popup (-> Google Form -> webinar
 * link), countdown, event date text, lite YouTube videos, accordion, reveal.
 */
window.LB_RUNTIME = function () {
  'use strict';
  var EDIT = !!window.__LB_EDIT__;
  var doc = document;
  var root = doc.documentElement;
  var cfg = {};

  var CSS =
    '.lb-float{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;gap:12px;align-items:flex-end}' +
    '.lb-fab{position:relative;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:0 12px 32px rgba(0,0,0,.30);transition:transform .2s ease;text-decoration:none}' +
    '.lb-fab:hover{transform:scale(1.08)}.lb-fab svg{width:30px;height:30px;fill:currentColor}' +
    '.lb-wa{background:#25d366}.lb-call{background:#2563eb}' +
    '.lb-wa::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #25d366;animation:lbp 2.2s ease-out infinite}' +
    '@keyframes lbp{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.55);opacity:0}}' +
    '.lb-vid{position:relative;aspect-ratio:16/9;overflow:hidden;background:linear-gradient(135deg,#171a2b,#0b0b12);cursor:pointer;border-radius:inherit}' +
    '.lb-vid img,.lb-vid iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0;display:block}' +
    '.lb-play{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;border:0;background:rgba(255,255,255,.95);box-shadow:0 14px 40px rgba(0,0,0,.35);cursor:pointer;transition:transform .2s ease}' +
    '.lb-vid:hover .lb-play{transform:scale(1.1)}' +
    '.lb-play::before{content:"";position:absolute;left:31px;top:24px;border-left:22px solid #111;border-top:14px solid transparent;border-bottom:14px solid transparent}' +
    '.lb-vph{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;color:#cbd5e1;font:600 15px/1.3 system-ui,sans-serif;background:repeating-linear-gradient(45deg,#111827,#111827 14px,#0f172a 14px,#0f172a 28px)}' +
    '.lb-vph b{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center}' +
    '.lb-vph b::before{content:"";border-left:18px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent;margin-left:4px}' +
    '.lb-modal{position:fixed;inset:0;z-index:2147483100;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(8,10,20,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +
    '.lb-modal.on{display:flex;animation:lbf .2s ease}@keyframes lbf{from{opacity:0}to{opacity:1}}' +
    '.lb-card{position:relative;width:100%;max-width:440px;background:#fff;color:#0f172a;border-radius:22px;padding:30px 26px 26px;box-shadow:0 40px 90px rgba(0,0,0,.45);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:lbu .28s ease}' +
    '@keyframes lbu{from{transform:translateY(18px) scale(.98);opacity:0}to{transform:none;opacity:1}}' +
    '.lb-card h3{margin:0 0 6px;font-size:23px;line-height:1.25;letter-spacing:-.01em}.lb-card p{margin:0 0 18px;color:#475569;font-size:14.5px;line-height:1.55}' +
    '.lb-x{position:absolute;right:14px;top:12px;width:34px;height:34px;border-radius:50%;border:0;background:#f1f5f9;color:#334155;font-size:22px;line-height:1;cursor:pointer}' +
    '.lb-card label{display:block;margin:0 0 13px;font-size:12.5px;font-weight:600;color:#334155}' +
    '.lb-card input{display:block;width:100%;margin-top:6px;padding:13px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font:500 16px system-ui,sans-serif;color:#0f172a;background:#f8fafc;outline:0;box-sizing:border-box}' +
    '.lb-card input:focus{border-color:var(--accent,#4f46e5);background:#fff;box-shadow:0 0 0 4px rgba(99,102,241,.14)}' +
    '.lb-go{display:block;width:100%;margin-top:6px;padding:15px 18px;border:0;border-radius:14px;background:var(--accent,#4f46e5);color:var(--accent-ink,#fff);font:700 16px system-ui,sans-serif;cursor:pointer;box-shadow:0 14px 30px -10px var(--accent,#4f46e5)}' +
    '.lb-go[disabled]{opacity:.65;cursor:wait}.lb-err{color:#dc2626;font-size:13px;margin:10px 0 0!important;min-height:1px}' +
    '.lb-ok{display:none;text-align:center;padding:10px 0 4px}.lb-card.done form,.lb-card.done>h3,.lb-card.done>p{display:none}.lb-card.done .lb-ok{display:block}' +
    '.lb-tick{width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#dcfce7;color:#16a34a;font-size:32px;display:grid;place-items:center}' +
    '.lb-js .rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}.lb-js .rv.in{opacity:1;transform:none}' +
    '.lb-map{position:relative;min-height:280px;overflow:hidden;border-radius:inherit;background:#e5e7eb}.lb-map iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '.lb-ba{position:relative;overflow:hidden;user-select:none;-webkit-user-select:none}.lb-ba img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}' +
    '.lb-bah{position:absolute;top:0;bottom:0;width:3px;margin-left:-1.5px;background:#fff;z-index:3;pointer-events:none;box-shadow:0 0 14px rgba(0,0,0,.45)}' +
    '.lb-bah i{position:absolute;top:50%;left:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.4);display:grid;place-items:center;font:700 18px system-ui,sans-serif;color:#111;font-style:normal}' +
    '.lb-bah i::before{content:"\\2194"}' +
    '.lb-bar-r{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize;z-index:4}' +
    '.lb-bar{display:none;position:fixed;left:0;right:0;bottom:0;z-index:2147483000;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid rgba(0,0,0,.08);box-shadow:0 -12px 30px rgba(0,0,0,.12);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.lb-bar a{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:13px 8px;border-radius:12px;font-weight:700;font-size:14.5px;text-decoration:none;color:#fff;white-space:nowrap}' +
    '.lb-bar .b-c{background:#2563eb}.lb-bar .b-w{background:#25d366}.lb-bar .b-b{flex:1.5;background:var(--accent,#4f46e5);color:var(--accent-ink,#fff)}' +
    '@media(max-width:640px){.lb-bar.on{display:flex}html.lb-hasbar body{padding-bottom:78px}html.lb-hasbar .lb-float{display:none!important}}' +
    '.lb-card select{display:block;width:100%;margin-top:6px;padding:13px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font:500 16px system-ui,sans-serif;color:#0f172a;background:#f8fafc;outline:0;box-sizing:border-box}' +
    '.lb-burger{display:none;width:44px;height:44px;border-radius:12px;border:1.5px solid rgba(128,128,128,.4);background:transparent;color:inherit;cursor:pointer;place-items:center;font-size:22px;line-height:1;flex:none;margin-left:8px}' +
    '.lb-mnav{position:fixed;left:12px;right:12px;top:var(--lb-mtop,76px);z-index:2147482990;display:none;flex-direction:column;background:#fff;color:#111;border-radius:16px;box-shadow:0 30px 70px rgba(0,0,0,.35);padding:8px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.lb-mnav.on{display:flex}.lb-mnav a{padding:14px 16px;border-radius:10px;font-weight:600;font-size:17px;color:#111;text-decoration:none}.lb-mnav a:active,.lb-mnav a:hover{background:#f1f2f6}' +
    '@media(max-width:900px){.lb-burger.on{display:grid}}' +
    '[data-cta][data-lb-off]{display:none!important}';

  var WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
  var CALL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  function waLink(number, msg) {
    var d = digits(number);
    if (d.length === 10) d = '91' + d;
    return 'https://wa.me/' + d + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  function telLink(number) {
    var s = String(number || '').trim();
    return 'tel:' + (s.charAt(0) === '+' ? '+' : '') + digits(s);
  }

  /* ---------- config ---------- */
  function readCfg() {
    var el = doc.getElementById('lb-config');
    try { cfg = JSON.parse((el && el.textContent) || '{}'); } catch (e) { cfg = {}; }
  }
  function C(path, def) {
    var o = cfg, p = path.split('.');
    for (var i = 0; i < p.length; i++) { if (o == null) return def; o = o[p[i]]; }
    return o == null || o === '' ? def : o;
  }

  /* ---------- floating buttons ---------- */
  var floatBox;
  function floats() {
    if (!floatBox) {
      floatBox = doc.createElement('div');
      floatBox.className = 'lb-float';
      floatBox.setAttribute('data-lb-rt', '');
      doc.body.appendChild(floatBox);
    }
    var html = '';
    var waOn = C('whatsapp.on', false) && (C('whatsapp.number', '') || EDIT);
    var callOn = C('call.on', false) && (C('call.number', '') || EDIT);
    if (callOn) html += '<a class="lb-fab lb-call" href="' + telLink(C('call.number', '')) + '" aria-label="Call us">' + CALL_SVG + '</a>';
    if (waOn) html += '<a class="lb-fab lb-wa" href="' + waLink(C('whatsapp.number', ''), C('whatsapp.message', '')) + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + WA_SVG + '</a>';
    floatBox.innerHTML = html;
    floatBox.style.display = html ? 'flex' : 'none';
  }

  /* ---------- CTA elements in the template ---------- */
  function ctas() {
    var waOk = C('whatsapp.on', false) && C('whatsapp.number', '');
    var callOk = C('call.on', false) && C('call.number', '');
    $$('[data-cta="whatsapp"]').forEach(function (a) {
      a.setAttribute('href', waLink(C('whatsapp.number', ''), C('whatsapp.message', '')));
      a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
      if (!EDIT && !waOk) a.setAttribute('data-lb-off', ''); else a.removeAttribute('data-lb-off');
    });
    $$('[data-cta="call"]').forEach(function (a) {
      a.setAttribute('href', telLink(C('call.number', '')));
      if (!EDIT && !callOk) a.setAttribute('data-lb-off', ''); else a.removeAttribute('data-lb-off');
    });
    $$('[data-cta="enroll"]').forEach(function (a) { if (!a.getAttribute('href')) a.setAttribute('href', '#enroll'); });
  }

  /* ---------- event date + countdown ---------- */
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function parts(v) {
    var m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(v || '');
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    var h = +m[4], ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return { day: DAYS[d.getUTCDay()] + ', ' + (+m[3]) + ' ' + MONTHS[+m[2] - 1], time: h + ':' + m[5] + ' ' + ap + ' IST' };
  }
  function dates() {
    var p = parts(C('countdown.date', ''));
    if (!p) return;
    $$('[data-event-date]').forEach(function (e) { e.textContent = p.day + ' · ' + p.time; });
    $$('[data-event-day]').forEach(function (e) { e.textContent = p.day; });
    $$('[data-event-time]').forEach(function (e) { e.textContent = p.time; });
  }
  var timer;
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var target = Date.parse(C('countdown.date', '') + ':00+05:30');
    var on = C('countdown.on', false);
    var show = on && !isNaN(target) && target > Date.now();
    $$('[data-countdown]').forEach(function (box) {
      if (!EDIT && !show) { box.setAttribute('data-lb-off', ''); box.style.display = 'none'; return; }
      box.removeAttribute('data-lb-off'); box.style.display = '';
      if (EDIT && isNaN(target)) return; /* keep the sample numbers while editing */
      var left = isNaN(target) ? 0 : Math.max(0, target - Date.now());
      var s = Math.floor(left / 1000);
      var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      ['d', 'h', 'm', 's'].forEach(function (k) {
        $$('[data-cd="' + k + '"]', box).forEach(function (el) { el.textContent = pad(v[k]); });
      });
    });
  }
  function countdown() { clearInterval(timer); tick(); timer = setInterval(tick, 1000); }

  /* ---------- videos ---------- */
  function ytId(u) {
    u = String(u || '').trim();
    var m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/.exec(u);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(u) ? u : '';
  }
  function renderVideo(el) {
    var url = el.getAttribute('data-url') || '';
    if (el._lbUrl === url && el.firstChild) return;
    el._lbUrl = url;
    el.classList.add('lb-vid');
    var id = ytId(url);
    el.setAttribute('data-id', id);
    if (!id) { el.innerHTML = '<div class="lb-vph"><b></b><span>Paste a YouTube link</span></div>'; return; }
    el.innerHTML = '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" onerror="this.style.display=\'none\'"><button class="lb-play" aria-label="Play video"></button>';
  }
  function videos() { $$('[data-video]').forEach(renderVideo); }
  function playVideo(el) {
    var id = el.getAttribute('data-id');
    if (!id) return;
    el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  }

  /* ---------- maps ---------- */
  function mapSrc(q) {
    q = String(q || '').trim();
    if (!q) return '';
    var m = /src=["']([^"']+)["']/.exec(q); if (m) q = m[1];
    if (/^https?:\/\/(www\.)?google\.[^\/]+\/maps\/embed/.test(q)) return q;
    if (/^https?:\/\//.test(q)) return '';
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
  }
  function renderMap(el) {
    var q = el.getAttribute('data-q') || '';
    if (el._lbQ === q && el.firstChild) return;
    el._lbQ = q; el.classList.add('lb-map');
    var src = mapSrc(q);
    el.innerHTML = src ? '<iframe src="' + src.replace(/"/g, '&quot;') + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe>' : '<div class="lb-vph"><span>📍 Type your address to show the map</span></div>';
  }
  function maps() { $$('[data-map]').forEach(renderMap); }

  /* ---------- before / after slider ---------- */
  function befores() {
    $$('[data-ba]').forEach(function (box) {
      if (box._lbba) return;
      var imgs = $$('img', box), after = imgs[1];
      if (!after) return;
      box._lbba = 1; box.classList.add('lb-ba');
      var h = doc.createElement('div'); h.className = 'lb-bah'; h.setAttribute('data-lb-rt', ''); h.innerHTML = '<i></i>';
      var r = doc.createElement('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = 50; r.className = 'lb-bar-r';
      r.setAttribute('data-lb-rt', ''); r.setAttribute('aria-label', 'Before and after slider');
      if (EDIT) r.style.pointerEvents = 'none';
      box.appendChild(h); box.appendChild(r);
      function set(v) { after.style.clipPath = 'inset(0 0 0 ' + v + '%)'; h.style.left = v + '%'; }
      r.addEventListener('input', function () { set(r.value); }); set(50);
    });
  }

  /* ---------- mobile bottom bar ---------- */
  var barEl;
  function bar() {
    var on = C('bar.on', false);
    root.classList.toggle('lb-hasbar', !!on);
    if (!barEl) { barEl = doc.createElement('div'); barEl.className = 'lb-bar'; barEl.setAttribute('data-lb-rt', ''); doc.body.appendChild(barEl); }
    barEl.classList.toggle('on', !!on);
    var h = '';
    if (C('call.on', false) && (C('call.number', '') || EDIT)) h += '<a class="b-c" href="' + telLink(C('call.number', '')) + '">📞 Call</a>';
    if (C('whatsapp.on', false) && (C('whatsapp.number', '') || EDIT)) h += '<a class="b-w" href="' + waLink(C('whatsapp.number', ''), C('whatsapp.message', '')) + '" target="_blank" rel="noopener">💬 WhatsApp</a>';
    h += '<a class="b-b" data-cta="enroll" href="#enroll">' + String(C('bar.text', 'Book Now')).replace(/</g, '&lt;') + '</a>';
    barEl.innerHTML = h;
  }

  /* ---------- enroll modal ---------- */
  var modal;
  function buildModal() {
    modal = doc.createElement('div');
    modal.className = 'lb-modal';
    modal.setAttribute('data-lb-rt', '');
    modal.innerHTML =
      '<div class="lb-card" role="dialog" aria-modal="true"><button class="lb-x" type="button" aria-label="Close">&times;</button>' +
      '<h3 class="lb-t"></h3><p class="lb-s"></p>' +
      '<form novalidate>' +
      '<label>Full name<input name="name" autocomplete="name" placeholder="Your name"></label>' +
      '<label>WhatsApp / mobile number<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="10 digit number"></label>' +
      '<label class="lb-em">Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>' +
      '<label class="lb-ex">Service<select name="extra"></select></label>' +
      '<button class="lb-go" type="submit"></button><p class="lb-err"></p></form>' +
      '<div class="lb-ok"><div class="lb-tick">&#10003;</div><h3 class="lb-okt"></h3><p class="lb-oks"></p></div></div>';
    doc.body.appendChild(modal);
    $('.lb-x', modal).addEventListener('click', closeModal);
    modal.addEventListener('mousedown', function (e) { if (e.target === modal) closeModal(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    $('form', modal).addEventListener('submit', submitForm);
  }
  function modalTexts() {
    if (!modal) return;
    $('.lb-t', modal).textContent = C('enroll.title', 'Reserve your free seat');
    $('.lb-s', modal).textContent = C('enroll.sub', 'Fill in your details and we will take you to the session.');
    $('.lb-go', modal).textContent = C('enroll.button', 'Confirm my seat');
    $('.lb-okt', modal).textContent = C('enroll.thanks', 'You are registered!');
    $('.lb-oks', modal).textContent = C('enroll.url', '') || C('enroll.webinarUrl', '') ? 'Taking you to the session…' : 'We will contact you shortly.';
    $('.lb-em', modal).style.display = C('enroll.askEmail', true) ? '' : 'none';
    var ex = $('.lb-ex', modal), opts = String(C('enroll.extraOptions', '')).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    ex.style.display = C('enroll.extraOn', false) && opts.length ? '' : 'none';
    ex.firstChild.nodeValue = C('enroll.extraLabel', 'Service');
    var sel = $('select', ex), old = sel.value;
    sel.innerHTML = '<option value="">Select…</option>' + opts.map(function (o) { return '<option>' + o.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</option>'; }).join('');
    if (old) sel.value = old;
  }
  function openModal() {
    if (!modal) buildModal();
    modalTexts();
    $('.lb-card', modal).classList.remove('done');
    $('.lb-go', modal).disabled = false;
    $('.lb-err', modal).textContent = '';
    modal.classList.add('on');
    setTimeout(function () { var i = $('input[name=name]', modal); if (i && !EDIT) i.focus(); }, 60);
  }
  function closeModal() { if (modal) modal.classList.remove('on'); }

  function submitForm(e) {
    e.preventDefault();
    var f = e.target, err = $('.lb-err', modal);
    var name = f.name.value.trim(), phone = f.phone.value.trim(), email = f.email.value.trim();
    var askEmail = C('enroll.askEmail', true);
    if (name.length < 2) { err.textContent = 'Please enter your name.'; return; }
    if (digits(phone).length < 10) { err.textContent = 'Please enter a valid mobile number.'; return; }
    if (askEmail && email && !/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'That email does not look right.'; return; }
    err.textContent = '';
    $('.lb-go', modal).disabled = true;

    var action = C('enroll.actionUrl', '');
    var body = new URLSearchParams();
    if (C('enroll.entryName', '')) body.append(C('enroll.entryName', ''), name);
    if (C('enroll.entryPhone', '')) body.append(C('enroll.entryPhone', ''), phone);
    if (C('enroll.entryEmail', '') && askEmail) body.append(C('enroll.entryEmail', ''), email);
    if (C('enroll.entryExtra', '') && f.extra.value) body.append(C('enroll.entryExtra', ''), f.extra.value);

    var sent = Promise.resolve();
    if (action && !EDIT) {
      try {
        sent = Promise.race([
          fetch(action, { method: 'POST', mode: 'no-cors', body: body, keepalive: true }),
          new Promise(function (r) { setTimeout(r, 3000); })
        ]).catch(function () {});
      } catch (x) {}
    }
    sent.then(function () {
      $('.lb-card', modal).classList.add('done');
      var url = C('enroll.webinarUrl', '');
      if (url && !EDIT) setTimeout(function () { window.location.href = url; }, 1300);
    });
  }

  /* ---------- wiring ---------- */
  function wire() {
    if (EDIT) return;
    doc.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-cta="enroll"], [data-video], [data-acc-head]') : null;
      if (!t) return;
      if (t.hasAttribute('data-cta')) {
        e.preventDefault();
        var mode = C('enroll.mode', 'form');
        if (mode === 'link' && C('enroll.webinarUrl', '')) { window.location.href = C('enroll.webinarUrl', ''); return; }
        if (mode === 'whatsapp' && C('whatsapp.number', '')) { window.open(waLink(C('whatsapp.number', ''), C('whatsapp.message', '')), '_blank'); return; }
        openModal();
      } else if (t.hasAttribute('data-video')) {
        if (!t.querySelector('iframe')) playVideo(t);
      } else {
        var item = t.closest('[data-acc]');
        if (item) item.classList.toggle('open');
      }
    });
    /* reveal on scroll */
    root.classList.add('lb-js');
    var els = $$('.rv');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    } else els.forEach(function (el) { el.classList.add('in'); });
    $$('[data-acc][data-acc-open]').forEach(function (a) { a.classList.add('open'); });
  }

  /* ---------- mobile menu (when the page hides its menu on phones) ---------- */
  var burger, mnav;
  function menu() {
    if (EDIT) return;
    var nav = $('header nav'); if (!nav) return;
    var links = $$('a', nav); if (links.length < 2) return;
    var hidden = getComputedStyle(nav).display === 'none';
    if (!burger) {
      burger = doc.createElement('button'); burger.className = 'lb-burger'; burger.type = 'button'; burger.setAttribute('aria-label', 'Menu'); burger.setAttribute('data-lb-rt', ''); burger.innerHTML = '&#9776;';
      var host = nav.parentElement; host.appendChild(burger);
      mnav = doc.createElement('div'); mnav.className = 'lb-mnav'; mnav.setAttribute('data-lb-rt', '');
      mnav.innerHTML = links.map(function (a) { return '<a href="' + (a.getAttribute('href') || '#') + '">' + a.textContent + '</a>'; }).join('');
      doc.body.appendChild(mnav);
      burger.addEventListener('click', function () {
        var h = nav.closest('header'); mnav.style.setProperty('--lb-mtop', (h ? h.getBoundingClientRect().bottom + 6 : 76) + 'px'); mnav.classList.toggle('on');
        burger.innerHTML = mnav.classList.contains('on') ? '&times;' : '&#9776;';
      });
      mnav.addEventListener('click', function (e) { if (e.target.closest('a')) { mnav.classList.remove('on'); burger.innerHTML = '&#9776;'; } });
    }
    burger.classList.toggle('on', hidden);
    if (!hidden) mnav.classList.remove('on');
  }

  function apply(newCfg) {
    if (newCfg) cfg = newCfg;
    floats(); ctas(); countdown(); dates(); videos(); maps(); befores(); bar(); modalTexts();
  }

  if (!doc.getElementById('lb-rt-css')) {
    var st = doc.createElement('style');
    st.id = 'lb-rt-css'; st.setAttribute('data-lb-rt', ''); st.textContent = CSS;
    doc.head.appendChild(st);
  }
  readCfg();
  wire();
  apply();
  menu(); window.addEventListener('resize', menu);
  window.LBRT = { apply: apply, openModal: openModal, closeModal: closeModal, renderVideo: renderVideo, renderMap: renderMap, playVideo: playVideo, ytId: ytId, EDIT: EDIT };
};
