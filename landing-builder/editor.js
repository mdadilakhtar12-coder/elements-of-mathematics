/* PageCraft editor: loads a template into an iframe, makes it editable,
 * keeps settings (buttons, form, colours) and exports a ZIP. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var id = new URLSearchParams(location.search).get('t') || 'edu-aurora';
  var tpl = LB.get(id);
  if (!tpl) { location.href = 'index.html'; return; }
  var KEY = 'lb:project:' + id;
  var frame = $('#frame');
  var cfg = merge(LB.defaultCfg(), tpl.defaults || {});
  var mode = 'edit';
  var history = [];
  var dirtyTimer, quotaWarned = false, currentHtml = tpl.html;
  var doc, win;

  $('#tplName').textContent = tpl.name + ' · ' + tpl.tagline;
  document.title = tpl.name + ' — PageCraft Editor';

  /* ---------- helpers ---------- */
  function toast(msg, ms) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, ms || 2600);
  }
  function setSaveState(dirty) {
    var s = $('#saveState'); s.textContent = dirty ? 'Saving…' : 'Saved ✓'; s.classList.toggle('dirty', !!dirty);
  }
  function merge(dst, src) {
    Object.keys(src || {}).forEach(function (k) {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) { dst[k] = merge(dst[k] || {}, src[k]); }
      else dst[k] = src[k];
    });
    return dst;
  }

  /* ---------- persistence ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p.html) currentHtml = p.html; if (p.cfg) cfg = merge(merge(LB.defaultCfg(), tpl.defaults || {}), p.cfg); }
    } catch (e) {}
  }
  function save() {
    if (mode !== 'edit' || !doc) return;
    try {
      currentHtml = serialize(false);
      localStorage.setItem(KEY, JSON.stringify({ html: currentHtml, cfg: cfg }));
      setSaveState(false);
    } catch (e) {
      setSaveState(false);
      if (!quotaWarned) { quotaWarned = true; toast('Auto-save is full (big images). Please Download ZIP regularly.', 5000); }
    }
  }
  function queueSave() { setSaveState(true); clearTimeout(dirtyTimer); dirtyTimer = setTimeout(save, 700); }

  /* ---------- serialisation ---------- */
  /* publish=false -> keeps hidden sections (so they can be re-enabled);
   * publish=true  -> final clean page. Neither adds lb.js / head code. */
  function serialize(publish) {
    var clone = doc.documentElement.cloneNode(true);
    $$('[data-lb-ed],[data-lb-rt],#lb-runtime,#lb-ed-css', clone).forEach(function (n) { n.remove(); });
    $$('script', clone).forEach(function (s) { if (/__LB_EDIT__/.test(s.textContent)) s.remove(); });
    $$('[contenteditable]', clone).forEach(function (n) { n.removeAttribute('contenteditable'); n.removeAttribute('spellcheck'); });
    $$('[data-lb-off]', clone).forEach(function (n) { n.removeAttribute('data-lb-off'); });
    $$('[data-countdown]', clone).forEach(function (n) { n.removeAttribute('style'); });
    $$('[data-map]', clone).forEach(function (n) { n.innerHTML = ''; n.classList.remove('lb-map'); if (!n.className) n.removeAttribute('class'); });
    $$('[data-ba]', clone).forEach(function (n) { n.classList.remove('lb-ba'); if (!n.className) n.removeAttribute('class'); });
    $$('[data-video]', clone).forEach(function (n) { n.innerHTML = ''; n.classList.remove('lb-vid'); n.removeAttribute('data-id'); if (!n.className) n.removeAttribute('class'); });
    clone.classList.remove('lb-js'); if (!clone.getAttribute('class')) clone.removeAttribute('class');
    if (publish) $$('[data-hidden]', clone).forEach(function (n) { n.remove(); });
    var c = $('#lb-config', clone); if (c) c.textContent = JSON.stringify(cfg).replace(/</g, '\\u003c');
    var t = $('title', clone); if (t && cfg.title) t.textContent = cfg.title;
    var d = $('meta[name=description]', clone); if (d && cfg.description) d.setAttribute('content', cfg.description);
    return '<!doctype html>\n' + clone.outerHTML;
  }

  /* ---------- frame ---------- */
  var EDITOR_CSS =
    '[data-e]{cursor:text}[data-e]:hover{outline:1.5px dashed rgba(99,102,241,.8);outline-offset:3px}' +
    '[data-e]:focus{outline:2px solid #6366f1;outline-offset:3px;background:rgba(99,102,241,.08)}' +
    '[data-e]:empty::before{content:"Type here…";opacity:.45}' +
    '[data-hidden]{display:none!important}' +
    '[data-acc] [data-acc-body]{display:block!important}' +
    '.rv{opacity:1!important;transform:none!important;transition:none!important}' +
    '#lb-hl{position:fixed;z-index:2147483200;pointer-events:none;border:2.5px solid #6366f1;border-radius:10px;background:rgba(99,102,241,.14);display:none}' +
    '#lb-hl span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#4f46e5;color:#fff;font:700 13px system-ui,sans-serif;padding:8px 14px;border-radius:99px;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.35)}' +
    '#lb-tb{position:fixed;z-index:2147483300;display:none;gap:4px;padding:4px;background:#0f172a;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.4)}' +
    '#lb-tb button,#lb-fmt button{border:0;background:transparent;color:#fff;font:700 13px system-ui,sans-serif;padding:6px 10px;border-radius:7px;cursor:pointer}' +
    '#lb-tb button:hover,#lb-fmt button:hover{background:rgba(255,255,255,.18)}#lb-tb button.del:hover{background:#dc2626}' +
    '#lb-fmt{position:fixed;z-index:2147483300;display:none;gap:2px;padding:4px;background:#0f172a;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.4)}';

  function loadFrame(html, keepScroll) {
    var y = 0;
    try { if (doc && keepScroll) y = doc.documentElement.scrollTop || win.scrollY; } catch (e) {}
    frame.onload = function () { onFrame(y); };
    frame.srcdoc = LB.buildDoc(html, { edit: mode === 'edit', cfg: cfg });
  }

  function onFrame(scrollY) {
    win = frame.contentWindow; doc = frame.contentDocument;
    if (scrollY) win.scrollTo(0, scrollY);
    if (mode !== 'edit') return;
    var st = doc.createElement('style'); st.id = 'lb-ed-css'; st.setAttribute('data-lb-ed', ''); st.textContent = EDITOR_CSS;
    doc.head.appendChild(st);
    $$('[data-e]', doc).forEach(function (el) { el.setAttribute('contenteditable', 'true'); el.setAttribute('spellcheck', 'false'); });
    buildOverlays();
    bindFrameEvents();
    syncCfgToFrame();
    renderLists();
  }

  var hl, tb, fmt, tbTarget;
  function mk(tag, idv, html) {
    var e = doc.createElement(tag); e.id = idv; e.setAttribute('data-lb-ed', ''); if (html) e.innerHTML = html; doc.body.appendChild(e); return e;
  }
  function buildOverlays() {
    hl = mk('div', 'lb-hl', '<span></span>');
    tb = mk('div', 'lb-tb', '<button data-a="up" title="Move earlier">◀</button><button data-a="dn" title="Move later">▶</button><button data-a="dup" title="Duplicate">⧉ Copy</button><button data-a="del" class="del" title="Delete">✕</button>');
    fmt = mk('div', 'lb-fmt', '<button data-f="hl">✨ Highlight</button><button data-f="b">B</button><button data-f="clr">Clear</button>');
    tb.addEventListener('click', onToolbar);
    fmt.addEventListener('mousedown', function (e) { e.preventDefault(); });
    fmt.addEventListener('click', onFormat);
  }

  function hit(x, y) {
    var stack = doc.elementsFromPoint(x, y);
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      if (el.closest && el.closest('[data-lb-ed]')) return null;
      if (el.hasAttribute('data-e')) return { type: 'text', el: el };
      if (el.hasAttribute('data-img')) return { type: 'img', el: el };
      if (el.hasAttribute('data-video')) return { type: 'video', el: el };
      if (el.hasAttribute('data-map')) return { type: 'map', el: el };
    }
    return null;
  }
  function itemAt(target) {
    var n = target && target.closest ? target.closest('[data-list] > *') : null;
    if (n && n.hasAttribute('data-fixed-row')) return null;
    return n;
  }

  function bindFrameEvents() {
    var moveRaf;
    doc.addEventListener('mousemove', function (e) {
      if (moveRaf) return;
      moveRaf = win.requestAnimationFrame(function () {
        moveRaf = 0;
        var h = hit(e.clientX, e.clientY);
        if (h && h.type !== 'text') {
          var r = h.el.getBoundingClientRect();
          hl.style.cssText = 'display:block;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
          hl.firstChild.textContent = h.type === 'img' ? '🖼 Click to change image' : h.type === 'map' ? '📍 Click to set address' : '🎬 Click to set video';
          doc.documentElement.style.cursor = 'pointer';
        } else { hl.style.display = 'none'; doc.documentElement.style.cursor = ''; }
        if (e.target.closest && e.target.closest('#lb-tb')) return;
        var it = itemAt(e.target);
        if (it) showToolbar(it); else if (!(e.target.closest && e.target.closest('#lb-tb'))) tb.style.display = 'none';
      });
    });
    doc.addEventListener('scroll', function () { hl.style.display = 'none'; tb.style.display = 'none'; fmt.style.display = 'none'; }, true);
    doc.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-ed]')) return;
      var a = e.target.closest('a'); if (a) e.preventDefault();
      var h = hit(e.clientX, e.clientY);
      if (h && h.type === 'img') { e.preventDefault(); pickImage(h.el); }
      else if (h && h.type === 'video') { e.preventDefault(); focusVideo(h.el); }
      else if (h && h.type === 'map') { e.preventDefault(); focusMap(h.el); }
    }, true);
    doc.addEventListener('input', queueSave);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.hasAttribute && e.target.hasAttribute('data-e')) {
        e.preventDefault(); doc.execCommand('insertLineBreak');
      }
    });
    doc.addEventListener('paste', function (e) {
      if (!(e.target.hasAttribute && e.target.hasAttribute('data-e'))) return;
      e.preventDefault();
      var t = (e.clipboardData || win.clipboardData).getData('text/plain');
      doc.execCommand('insertText', false, t);
    });
    doc.addEventListener('selectionchange', onSelection);
    /* drag & drop an image file onto an image */
    doc.addEventListener('dragover', function (e) { e.preventDefault(); });
    doc.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f || f.type.indexOf('image/') !== 0) return;
      e.preventDefault();
      var h = hit(e.clientX, e.clientY);
      if (h && h.type === 'img') setImageFromFile(h.el, f);
    });
  }

  /* ----- list item toolbar ----- */
  function showToolbar(it) {
    tbTarget = it;
    var r = it.getBoundingClientRect();
    var vh = win.innerHeight;
    if (r.bottom < 40 || r.top > vh - 40) { tb.style.display = 'none'; return; }
    tb.style.display = 'flex';
    var w = tb.offsetWidth || 200;
    tb.style.left = Math.max(6, Math.min(r.right - w - 6, win.innerWidth - w - 6)) + 'px';
    tb.style.top = Math.max(6, r.top + 6) + 'px';
  }
  function onToolbar(e) {
    var b = e.target.closest('button'); if (!b || !tbTarget) return;
    var a = b.getAttribute('data-a'), el = tbTarget, p = el.parentNode;
    pushHistory();
    if (a === 'dup') { var c = el.cloneNode(true); p.insertBefore(c, el.nextSibling); toast('Copied. Edit the new card.'); }
    else if (a === 'del') { if (p.children.length <= 1) { toast('Keep at least one item here.'); return; } el.remove(); tb.style.display = 'none'; }
    else if (a === 'up' && el.previousElementSibling) p.insertBefore(el, el.previousElementSibling);
    else if (a === 'dn' && el.nextElementSibling) p.insertBefore(el.nextElementSibling, el);
    afterStructure();
  }

  /* ----- selection toolbar (highlight / bold) ----- */
  function onSelection() {
    var s = doc.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) { fmt.style.display = 'none'; return; }
    var node = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
    if (!node || !node.closest || !node.closest('[data-e]')) { fmt.style.display = 'none'; return; }
    var r = s.getRangeAt(0).getBoundingClientRect();
    fmt.style.display = 'flex';
    var w = fmt.offsetWidth || 190;
    fmt.style.left = Math.max(6, Math.min(r.left + r.width / 2 - w / 2, win.innerWidth - w - 6)) + 'px';
    fmt.style.top = Math.max(6, r.top - 46) + 'px';
  }
  function onFormat(e) {
    var b = e.target.closest('button'); if (!b) return;
    var f = b.getAttribute('data-f'), s = doc.getSelection();
    if (f === 'hl') {
      var txt = s.toString().replace(/</g, '&lt;');
      doc.execCommand('insertHTML', false, '<em>' + txt + '</em>');
    } else if (f === 'b') doc.execCommand('bold');
    else if (f === 'clr') {
      var n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
      var em = n && n.closest ? n.closest('em,b,strong') : null;
      if (em) { while (em.firstChild) em.parentNode.insertBefore(em.firstChild, em); em.remove(); }
    }
    queueSave();
  }

  /* ---------- images ---------- */
  var fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  var fileTarget = null;
  fileInput.addEventListener('change', function () {
    if (fileInput.files[0] && fileTarget) setImageFromFile(fileTarget, fileInput.files[0]);
    fileInput.value = '';
  });
  function pickImage(el) { fileTarget = el; fileInput.click(); }

  var WEBP = (function () { try { return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0; } catch (e) { return false; } })();
  function fileToDataUrl(file, max) {
    return new Promise(function (resolve, reject) {
      if (file.type === 'image/svg+xml' || (file.type === 'image/gif' && file.size < 1500000)) {
        var fr = new FileReader(); fr.onload = function () { resolve(fr.result); }; fr.onerror = reject; fr.readAsDataURL(file); return;
      }
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, max / Math.max(img.width, img.height));
        var cv = document.createElement('canvas');
        cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        var keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
        resolve(keepAlpha ? (WEBP ? cv.toDataURL('image/webp', 0.88) : cv.toDataURL('image/png')) : cv.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = reject; img.src = url;
    });
  }
  function setImageFromFile(el, file) {
    var max = el.getAttribute('data-img') === 'logo' ? 700 : 1800;
    fileToDataUrl(file, max).then(function (d) { setImage(el, d); }, function () { toast('Could not read that image.'); });
  }
  function setImage(el, src) {
    pushHistory();
    el.removeAttribute('srcset'); el.src = src;
    afterStructure(); toast('Image updated ✓');
  }

  /* ---------- videos ---------- */
  function focusVideo(el) {
    switchTab('content');
    var idx = $$('[data-video]', doc).indexOf(el);
    var row = $$('#vidList .vrow')[idx];
    if (row) { row.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.classList.add('hl'); var i = $('input', row); if (i) i.focus(); setTimeout(function () { row.classList.remove('hl'); }, 1600); }
  }

  function focusMap(el) {
    switchTab('content');
    var idx = $$('[data-map]', doc).indexOf(el), row = $$('#mapList .vrow')[idx];
    if (row) { row.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.classList.add('hl'); var i = $('input', row); if (i) i.focus(); setTimeout(function () { row.classList.remove('hl'); }, 1600); }
  }

  /* ---------- undo ---------- */
  function pushHistory() {
    try { history.push({ html: serialize(false), y: doc.documentElement.scrollTop }); if (history.length > 30) history.shift(); } catch (e) {}
    $('#undoBtn').disabled = false;
  }
  $('#undoBtn').addEventListener('click', function () {
    var h = history.pop(); if (!h) return;
    $('#undoBtn').disabled = history.length === 0;
    currentHtml = h.html; loadFrame(h.html, false);
    frame.addEventListener('load', function once() { frame.removeEventListener('load', once); try { win.scrollTo(0, h.y); } catch (e) {} });
    queueSave();
  });
  $('#undoBtn').disabled = true;

  function afterStructure() { renderLists(); queueSave(); }

  /* ---------- side panel: sections / images / videos / colours ---------- */
  function renderLists() {
    if (!doc || mode !== 'edit') return;
    /* sections */
    var secs = $$('[data-section]', doc), box = $('#secList'); box.innerHTML = '';
    secs.forEach(function (s) {
      var row = document.createElement('div'); row.className = 'row' + (s.hasAttribute('data-hidden') ? ' off' : '');
      var fixed = s.hasAttribute('data-fixed');
      var sibs = Array.prototype.filter.call(s.parentNode.children, function (c) { return c.hasAttribute('data-section'); });
      var pos = sibs.indexOf(s);
      row.innerHTML = '<span class="nm" title="Jump to section">' + esc(s.getAttribute('data-section')) + '</span>' +
        (fixed ? '' : '<button class="mini" data-a="up" ' + (pos === 0 ? 'disabled' : '') + '>↑</button><button class="mini" data-a="dn" ' + (pos === sibs.length - 1 ? 'disabled' : '') + '>↓</button>') +
        '<button class="mini" data-a="eye">' + (s.hasAttribute('data-hidden') ? 'Show' : 'Hide') + '</button>';
      row.querySelector('.nm').onclick = function () { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || b.disabled) return;
        var a = b.getAttribute('data-a'); pushHistory();
        if (a === 'eye') { if (s.hasAttribute('data-hidden')) s.removeAttribute('data-hidden'); else s.setAttribute('data-hidden', ''); }
        if (a === 'up') s.parentNode.insertBefore(s, sibs[pos - 1]);
        if (a === 'dn') s.parentNode.insertBefore(sibs[pos + 1], s);
        afterStructure();
        if (a !== 'eye') s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      box.appendChild(row);
    });
    /* images */
    var ib = $('#imgList'); ib.innerHTML = '';
    $$('[data-img]', doc).forEach(function (im, i) {
      var row = document.createElement('div'); row.className = 'row';
      row.innerHTML = '<img class="th" src="' + esc(im.getAttribute('src')) + '" alt=""><span class="nm">' + esc(im.getAttribute('data-label') || 'Image ' + (i + 1)) + '</span>' +
        '<button class="mini" data-a="up">Upload</button><button class="mini" data-a="url">URL</button><button class="mini" data-a="rs" title="Back to original">↺</button>';
      row.querySelector('.nm').onclick = function () { im.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
        if (a === 'up') pickImage(im);
        if (a === 'url') { var u = prompt('Paste image link (https://…)'); if (u) setImage(im, u.trim()); }
        if (a === 'rs') { var o = originalImage(im); if (o) setImage(im, o); }
      });
      ib.appendChild(row);
    });
    if (!ib.children.length) ib.innerHTML = '<p class="hint">This template has no replaceable images.</p>';
    /* videos */
    var vb = $('#vidList'); vb.innerHTML = '';
    $$('[data-video]', doc).forEach(function (v, i) {
      var row = document.createElement('div'); row.className = 'vrow';
      row.innerHTML = '<div class="vt"><b>' + esc(v.getAttribute('data-label') || 'Video ' + (i + 1)) + '</b><button class="mini" data-a="go">Show</button><button class="mini" data-a="play">▶ Test</button></div>' +
        '<input placeholder="https://www.youtube.com/watch?v=…" value="' + esc(v.getAttribute('data-url') || '') + '"><div class="hint" style="margin:0"></div>';
      var inp = row.querySelector('input'), hint = row.querySelector('.hint');
      function status() { var ok = win.LBRT.ytId(inp.value); hint.textContent = !inp.value ? 'Empty — visitors will see a placeholder.' : ok ? '✓ Video found — thumbnail shown on the page.' : '⚠ Could not read this YouTube link.'; hint.style.color = ok || !inp.value ? '#64748b' : '#b45309'; }
      status();
      inp.addEventListener('input', function () {
        v.setAttribute('data-url', inp.value.trim()); v._lbUrl = null; win.LBRT.renderVideo(v); status(); queueSave();
      });
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
        if (a === 'go') v.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (a === 'play') { v.scrollIntoView({ behavior: 'smooth', block: 'center' }); win.LBRT.playVideo(v); }
      });
      vb.appendChild(row);
    });
    if (!vb.children.length) vb.innerHTML = '<p class="hint">This template has no video block.</p>';
    /* maps */
    var mb = $('#mapList'); mb.innerHTML = '';
    $$('[data-map]', doc).forEach(function (m, i) {
      var row = document.createElement('div'); row.className = 'vrow';
      row.innerHTML = '<div class="vt"><b>' + esc(m.getAttribute('data-label') || 'Map ' + (i + 1)) + '</b><button class="mini" data-a="go">Show</button></div>' +
        '<input placeholder="Shop 12, MG Road, Pune  — or paste the map embed code" value="' + esc(m.getAttribute('data-q') || '') + '"><div class="hint" style="margin:0">Tip: Google Maps → Share → Embed a map → copy HTML and paste here.</div>';
      var inp = row.querySelector('input');
      inp.addEventListener('input', function () { m.setAttribute('data-q', inp.value.trim()); m._lbQ = null; win.LBRT.renderMap(m); queueSave(); });
      row.querySelector('button').onclick = function () { m.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      mb.appendChild(row);
    });
    if (!mb.children.length) mb.innerHTML = '<p class="hint">This template has no map block.</p>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var origDoc = null;
  function originalImage(im) {
    if (!origDoc) origDoc = new DOMParser().parseFromString(tpl.html, 'text/html');
    var o = origDoc.querySelector('[data-img="' + im.getAttribute('data-img') + '"]');
    return o ? o.getAttribute('src') : null;
  }

  /* colours */
  function renderColors() {
    var box = $('#colorList'); box.innerHTML = '';
    tpl.colors.forEach(function (c) {
      var cur = (doc && doc.documentElement.style.getPropertyValue(c.v).trim()) || c.d;
      var row = document.createElement('div'); row.className = 'crow';
      row.innerHTML = '<input type="color" value="' + cur + '"><span>' + esc(c.l) + '</span><code>' + c.v + '</code>';
      row.querySelector('input').addEventListener('input', function (e) {
        doc.documentElement.style.setProperty(c.v, e.target.value); queueSave();
      });
      box.appendChild(row);
    });
  }
  $('#colorReset').onclick = function () {
    tpl.colors.forEach(function (c) { doc.documentElement.style.removeProperty(c.v); });
    if (!doc.documentElement.getAttribute('style')) doc.documentElement.removeAttribute('style');
    renderColors(); queueSave();
  };

  /* ---------- config <-> form fields ---------- */
  var F = {};
  ['exOn', 'exLabel', 'exOpts', 'barOn', 'barText', 'webUrl', 'gfUrl', 'askEmail', 'enTitle', 'enSub', 'enBtn', 'enThanks', 'waOn', 'waNum', 'waMsg', 'callOn', 'callNum', 'cdOn', 'cdDate', 'headCode', 'pgTitle', 'pgDesc']
    .forEach(function (k) { F[k] = $('#' + k); });

  function fillFields() {
    $$('input[name=mode]').forEach(function (r) { r.checked = r.value === cfg.enroll.mode; });
    F.webUrl.value = cfg.enroll.webinarUrl; F.gfUrl.value = cfg.enroll.formUrl; F.askEmail.checked = !!cfg.enroll.askEmail;
    F.enTitle.value = cfg.enroll.title; F.enSub.value = cfg.enroll.sub; F.enBtn.value = cfg.enroll.button; F.enThanks.value = cfg.enroll.thanks;
    F.exOn.checked = !!cfg.enroll.extraOn; F.exLabel.value = cfg.enroll.extraLabel; F.exOpts.value = cfg.enroll.extraOptions;
    F.barOn.checked = !!cfg.bar.on; F.barText.value = cfg.bar.text;
    F.waOn.checked = !!cfg.whatsapp.on; F.waNum.value = cfg.whatsapp.number; F.waMsg.value = cfg.whatsapp.message;
    F.callOn.checked = !!cfg.call.on; F.callNum.value = cfg.call.number;
    F.cdOn.checked = !!cfg.countdown.on; F.cdDate.value = cfg.countdown.date;
    F.headCode.value = cfg.headCode; F.pgTitle.value = cfg.title; F.pgDesc.value = cfg.description;
    parseGoogleForm(false); toggleFormBox();
  }
  function toggleFormBox() { $('#formBox').style.display = cfg.enroll.mode === 'form' ? '' : 'none'; $('#exBox').style.display = F.exOn.checked ? '' : 'none'; }

  function syncCfgToFrame() {
    if (win && win.LBRT) { var el = doc.getElementById('lb-config'); if (el) el.textContent = JSON.stringify(cfg); win.LBRT.apply(cfg); }
  }
  function readFields() {
    cfg.enroll.mode = ($('input[name=mode]:checked') || {}).value || 'form';
    cfg.enroll.webinarUrl = F.webUrl.value.trim(); cfg.enroll.askEmail = F.askEmail.checked;
    cfg.enroll.title = F.enTitle.value; cfg.enroll.sub = F.enSub.value; cfg.enroll.button = F.enBtn.value; cfg.enroll.thanks = F.enThanks.value;
    cfg.enroll.extraOn = F.exOn.checked; cfg.enroll.extraLabel = F.exLabel.value || 'Service'; cfg.enroll.extraOptions = F.exOpts.value;
    cfg.bar.on = F.barOn.checked; cfg.bar.text = F.barText.value || 'Book Now';
    cfg.whatsapp.on = F.waOn.checked; cfg.whatsapp.number = F.waNum.value.trim(); cfg.whatsapp.message = F.waMsg.value;
    cfg.call.on = F.callOn.checked; cfg.call.number = F.callNum.value.trim();
    cfg.countdown.on = F.cdOn.checked; cfg.countdown.date = F.cdDate.value;
    cfg.headCode = F.headCode.value; cfg.title = F.pgTitle.value.trim(); cfg.description = F.pgDesc.value.trim();
  }
  function onField() { readFields(); toggleFormBox(); syncCfgToFrame(); queueSave(); }
  Object.keys(F).forEach(function (k) { if (k !== 'gfUrl') F[k].addEventListener('input', onField); });
  $$('input[name=mode]').forEach(function (r) { r.addEventListener('change', onField); });

  /* Google Form: derive formResponse URL + entry ids from a pre-filled link */
  function parseGoogleForm(write) {
    var url = F.gfUrl.value.trim(), st = $('#gfStatus');
    if (write !== false) { cfg.enroll.formUrl = url; }
    var e = cfg.enroll; e.actionUrl = ''; e.entryName = ''; e.entryPhone = ''; e.entryEmail = ''; e.entryExtra = '';
    if (!url) { st.className = 'status'; st.textContent = 'Optional. Without it, the popup just collects nothing and opens your session link.'; return; }
    var u; try { u = new URL(url); } catch (x) { st.className = 'status bad'; st.textContent = '⚠ This is not a valid link.'; return; }
    var m = /\/forms\/d\/e\/([^/]+)\//.exec(u.pathname);
    if (!/docs\.google\.com|forms\.gle/.test(u.hostname) || !m) { st.className = 'status bad'; st.textContent = '⚠ Use the pre-filled link from Google Forms (⋮ → Get pre-filled link). It contains /forms/d/e/…'; return; }
    e.actionUrl = u.origin + '/forms/d/e/' + m[1] + '/formResponse';
    u.searchParams.forEach(function (val, key) {
      if (key.indexOf('entry.') !== 0) return;
      var v = val.trim().toLowerCase();
      if (v === 'name') e.entryName = key; else if (v === 'phone' || v === 'mobile' || v === 'number') e.entryPhone = key; else if (v === 'email') e.entryEmail = key; else if (v === 'service' || v === 'course' || v === 'interest' || v === 'extra') e.entryExtra = key;
    });
    var found = [e.entryName && 'Name', e.entryPhone && 'Phone', e.entryEmail && 'Email', e.entryExtra && 'Service/Choice'].filter(Boolean);
    if (!found.length) { st.className = 'status bad'; st.textContent = '⚠ Form found, but no fields matched. In the pre-filled link type exactly: name, phone, email.'; }
    else { st.className = 'status ok'; st.textContent = '✓ Form connected · fields: ' + found.join(', '); }
  }
  F.gfUrl.addEventListener('input', function () { parseGoogleForm(true); syncCfgToFrame(); queueSave(); });
  $('#testPopup').onclick = function () { syncCfgToFrame(); win.LBRT.openModal(); };

  /* ---------- tabs / mode / device ---------- */
  function switchTab(name) {
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === name); });
    $$('.tabbody').forEach(function (t) { t.classList.toggle('on', t.id === 'tab-' + name); });
  }
  $$('#tabs button').forEach(function (b) { b.onclick = function () { switchTab(b.getAttribute('data-tab')); }; });
  $$('#devSeg button').forEach(function (b) {
    b.onclick = function () {
      $$('#devSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#deviceFrame').classList.toggle('mobile', b.getAttribute('data-dev') === 'mobile');
    };
  });
  $$('#modeSeg button').forEach(function (b) {
    b.onclick = function () {
      var m = b.getAttribute('data-mode'); if (m === mode) return;
      $$('#modeSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      if (m === 'preview') { save(); var html = serialize(true); mode = 'preview'; loadFrame(html, true); toast('Preview — this is how visitors will see it. Videos & buttons work.'); }
      else { mode = 'edit'; loadFrame(currentHtml, true); }
    };
  });

  /* ---------- export ---------- */
  function dataToFile(dataUri) { return fetch(dataUri).then(function (r) { return r.blob(); }); }
  var EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };

  function exportZip() {
    if (mode === 'edit') save();
    var html = serialize(true);
    var d = new DOMParser().parseFromString(html, 'text/html');
    var zip = new JSZip(), seen = {}, n = 0, jobs = [];
    $$('img[src^="data:"]', d).forEach(function (img) {
      var src = img.getAttribute('src');
      if (seen[src]) { img.setAttribute('src', seen[src]); return; }
      var mime = (/^data:([^;,]+)/.exec(src) || [])[1] || 'image/png';
      var name = 'assets/' + (img.getAttribute('data-img') || 'image').replace(/[^\w-]/g, '') + '-' + (++n) + '.' + (EXT[mime] || 'png');
      seen[src] = name; img.setAttribute('src', name);
      jobs.push(dataToFile(src).then(function (b) { zip.file(name, b); }));
    });
    return Promise.all(jobs).then(function () {
      var out = '<!doctype html>\n' + d.documentElement.outerHTML;
      if (cfg.headCode.trim()) out = out.replace('</head>', function () { return cfg.headCode + '\n</head>'; });
      out = out.replace('</body>', function () { return '<script src="lb.js"></script>\n</body>'; });
      zip.file('index.html', out);
      zip.file('lb.js', '(' + window.LB_RUNTIME.toString() + ')();');
      zip.file('README.txt', 'Your landing page\n=================\n\n1. Keep index.html, lb.js and the assets folder together.\n2. Drag & drop this whole folder on Netlify Drop (app.netlify.com/drop), Cloudflare Pages, or upload it to any hosting.\n3. To test locally, double-click index.html.\n');
      return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    }).then(function (blob) {
      var a = document.createElement('a'), name = (cfg.title || tpl.name || 'landing-page').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'landing-page';
      a.href = URL.createObjectURL(blob); a.download = name + '.zip'; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      toast('ZIP downloaded ✓  Upload the folder to any host (e.g. Netlify Drop).', 5000);
    });
  }
  $('#dlBtn').onclick = $('#dlBtn2').onclick = function () { exportZip().catch(function (e) { toast('Export failed: ' + e.message, 5000); }); };

  $('#resetBtn').onclick = function () {
    if (!confirm('Discard ALL your changes on this template and start fresh?')) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.reload();
  };

  window.addEventListener('beforeunload', function () { if (mode === 'edit') save(); });

  /* ---------- go ---------- */
  load();
  fillFields();
  loadFrame(currentHtml, false);
  frame.addEventListener('load', function () { renderColors(); });
  window.__lb = { serialize: serialize, exportZip: exportZip, cfg: function () { return cfg; }, frame: frame };
})();
