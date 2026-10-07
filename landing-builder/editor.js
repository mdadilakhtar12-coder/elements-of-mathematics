/* PageCraft editor v2
 * - template pages OR blank pages built from a section library
 * - many pages per site, menu links, button/link settings
 * - drag & drop elements, free "image canvas", custom HTML
 * - image rules + automatic compression, page-speed optimised ZIP export
 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var id = new URLSearchParams(location.search).get('t') || location.hash.replace('#', '') || 'edu-aurora';
  var tpl = LB.get(id);
  if (!tpl) { location.href = 'index.html'; return; }
  var KEY = 'lb:project:' + id;
  var frame = $('#frame');
  var cfg = merge(LB.defaultCfg(), tpl.defaults || {});
  var pages = [], cur = 0;
  var mode = 'edit';
  var history = [];
  var dirtyTimer, quotaWarned = false;
  var doc, win;
  var activeSec = null, activeNode = null, activeCanvas = null;
  var MAX_UPLOAD = 15 * 1024 * 1024;
  var TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

  $('#tplName').textContent = (id === 'blank' ? 'Blank page' : tpl.name) + ' · ' + tpl.tagline;
  document.title = tpl.name + ' — PageCraft Editor';

  /* =====================================================================
   * helpers
   * ===================================================================== */
  function toast(msg, ms) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, ms || 2800);
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
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Math.random().toString(36).slice(2, 7); }
  function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }
  function fmtKB(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function dataBytes(uri) { var i = uri.indexOf(','); var body = uri.slice(i + 1); return /;base64/.test(uri.slice(0, i)) ? Math.floor(body.length * 0.75) : decodeURIComponent(body).length; }

  /* in-page dialogs (browser prompt/confirm are unreliable) */
  function openDlg(idv) { var d = $('#' + idv); d.hidden = false; try { window.focus(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {} return d; }
  function closeDlgs() { $$('.dlg-back').forEach(function (d) { d.hidden = true; }); }
  $$('.dlg-back').forEach(function (d) {
    d.addEventListener('mousedown', function (e) { if (e.target === d) d.hidden = true; });
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.hidden = true; }); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDlgs(); });
  function ask(title, msg, value, cb, noInput) {
    $('#askTitle').textContent = title; $('#askMsg').textContent = msg || '';
    var inp = $('#askInput'); inp.style.display = noInput ? 'none' : ''; inp.value = value || '';
    var d = openDlg('dlgAsk'); if (!noInput) setTimeout(function () { inp.focus(); inp.select(); }, 30);
    $('#askOk').onclick = function () { d.hidden = true; cb(inp.value.trim()); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') $('#askOk').click(); };
  }

  /* =====================================================================
   * project (pages) + persistence
   * ===================================================================== */
  function newPage(name, html, tplId) {
    return { id: 'p' + uid(), name: name, slug: '', html: html, tpl: tplId || '' };
  }
  function assignSlug(p) {
    var base = slugify(p.name) || 'page', s = base, n = 2;
    var taken = function (x) { return pages.some(function (o) { return o !== p && o.slug === x; }); };
    if (pages.indexOf(p) === 0 || !pages.length) s = 'index';
    while (taken(s)) s = base + '-' + (n++);
    p.slug = s;
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p.pages && p.pages.length) { pages = p.pages; cur = Math.min(p.cur || 0, pages.length - 1); }
        else if (p.html) { pages = [newPage('Home', p.html, tpl.id)]; }
        if (p.cfg) cfg = merge(merge(LB.defaultCfg(), tpl.defaults || {}), p.cfg);
      }
    } catch (e) {}
    if (!pages.length) pages = [newPage('Home', tpl.html, tpl.id)];
    pages.forEach(function (p, i) { if (!p.slug) { assignSlug(p); } if (i === 0) p.slug = 'index'; });
  }
  function save() {
    if (mode !== 'edit' || !doc) return;
    try {
      pages[cur].html = serialize();
      localStorage.setItem(KEY, JSON.stringify({ v: 2, pages: pages, cur: cur, cfg: cfg }));
      setSaveState(false);
    } catch (e) {
      setSaveState(false);
      if (!quotaWarned) { quotaWarned = true; toast('Auto-save is full. Please Download ZIP now so you do not lose work.', 6000); }
    }
  }
  function queueSave() { setSaveState(true); clearTimeout(dirtyTimer); dirtyTimer = setTimeout(save, 700); }
  /* before swapping the frame content: store the current page and make sure a late autosave cannot write into another page */
  function detachFrame() { save(); clearTimeout(dirtyTimer); doc = null; }

  /* =====================================================================
   * serialisation
   * ===================================================================== */
  /* project html: editor leftovers removed, hidden sections kept */
  function serialize() {
    var clone = doc.documentElement.cloneNode(true);
    $$('[data-lb-ed],[data-lb-rt],#lb-runtime,#lb-ed-css', clone).forEach(function (n) { n.remove(); });
    $$('script', clone).forEach(function (s) { if (/__LB_EDIT__/.test(s.textContent)) s.remove(); });
    $$('[contenteditable]', clone).forEach(function (n) { n.removeAttribute('contenteditable'); n.removeAttribute('spellcheck'); });
    $$('[data-lb-off]', clone).forEach(function (n) { n.removeAttribute('data-lb-off'); });
    $$('[data-countdown]', clone).forEach(function (n) { n.removeAttribute('style'); });
    $$('[data-map]', clone).forEach(function (n) { n.innerHTML = ''; n.classList.remove('lb-map'); if (!n.className) n.removeAttribute('class'); });
    $$('[data-ba]', clone).forEach(function (n) { n.classList.remove('lb-ba'); if (!n.className) n.removeAttribute('class'); });
    $$('[data-video]', clone).forEach(function (n) { n.innerHTML = ''; n.classList.remove('lb-vid'); n.removeAttribute('data-id'); if (!n.className) n.removeAttribute('class'); });
    clone.classList.remove('lb-js', 'lb-hasbar'); if (!clone.getAttribute('class')) clone.removeAttribute('class');
    var c = $('#lb-config', clone); if (c) c.textContent = JSON.stringify(cfg).replace(/</g, '\\u003c');
    return '<!doctype html>\n' + clone.outerHTML;
  }
  function parseHtml(html) { return new DOMParser().parseFromString(html, 'text/html'); }
  /* a page ready to show to visitors (still with data-URI images) */
  function publishDoc(html) {
    var d = parseHtml(html);
    $$('[data-hidden]', d).forEach(function (n) { n.remove(); });
    var c = d.getElementById('lb-config'); if (c) c.textContent = JSON.stringify(cfg).replace(/</g, '\\u003c');
    return d;
  }
  function pageHtmlNow(i) { return (i === cur && mode === 'edit' && doc) ? serialize() : pages[i].html; }

  /* =====================================================================
   * frame
   * ===================================================================== */
  var EDITOR_CSS =
    '[data-e]{cursor:text}[data-e]:hover{outline:1.5px dashed rgba(99,102,241,.8);outline-offset:3px}' +
    '[data-e]:focus{outline:2px solid #6366f1;outline-offset:3px;background:rgba(99,102,241,.08)}' +
    '[data-e]:empty::before{content:"Type here…";opacity:.45}' +
    '[data-hidden]{display:none!important}' +
    '[data-acc] [data-acc-body]{display:block!important}' +
    '.rv{opacity:1!important;transform:none!important;transition:none!important}' +
    '.bk-el:hover{outline:1px dashed rgba(99,102,241,.5);outline-offset:4px}' +
    '.bk-cv-i{cursor:default}.bk-cv-i:hover{outline:1.5px dashed #6366f1;outline-offset:4px}' +
    '[data-html]{outline:1.5px dashed rgba(99,102,241,.45);outline-offset:-4px;cursor:pointer;min-height:60px}' +
    '#lb-hl{position:fixed;z-index:2147483200;pointer-events:none;border:2.5px solid #6366f1;border-radius:10px;background:rgba(99,102,241,.14);display:none}' +
    '#lb-hl span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#4f46e5;color:#fff;font:700 13px system-ui,sans-serif;padding:8px 14px;border-radius:99px;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.35);text-align:center;line-height:1.3}' +
    '#lb-hl span small{display:block;font-weight:500;font-size:11.5px;opacity:.9}' +
    '#lb-tb,#lb-cvtb,#lb-fmt{position:fixed;z-index:2147483300;display:none;gap:3px;padding:4px;background:#0f172a;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.4);align-items:center}' +
    '#lb-tb button,#lb-fmt button,#lb-cvtb button,#lb-chip{border:0;background:transparent;color:#fff;font:700 13px system-ui,sans-serif;padding:6px 9px;border-radius:7px;cursor:pointer;white-space:nowrap}' +
    '#lb-tb button:hover,#lb-fmt button:hover,#lb-cvtb button:hover{background:rgba(255,255,255,.18)}#lb-tb button.del:hover,#lb-cvtb button.del:hover{background:#dc2626}' +
    '#lb-cvtb input[type=color]{width:28px;height:26px;border:0;padding:0;background:none;cursor:pointer}#lb-cvtb .sep{width:1px;height:20px;background:rgba(255,255,255,.25);margin:0 3px}' +
    '#lb-cvtb .drag{cursor:grab;font-size:16px}' +
    '#lb-chip{position:fixed;z-index:2147483310;display:none;background:#4f46e5;box-shadow:0 8px 20px rgba(0,0,0,.35);border-radius:99px}#lb-chip:hover{background:#3730a3}' +
    '#lb-dl{position:fixed;z-index:2147483320;display:none;height:4px;background:#4f46e5;border-radius:4px;pointer-events:none;box-shadow:0 0 0 3px rgba(99,102,241,.35)}' +
    '#lb-dl.box{height:auto;background:rgba(99,102,241,.12);border:2.5px dashed #4f46e5;box-shadow:none}';

  function loadFrame(html, keepScroll) {
    var y = 0;
    try { if (doc && keepScroll) y = doc.documentElement.scrollTop || win.scrollY; } catch (e) {}
    frame.onload = function () { onFrame(y); };
    frame.srcdoc = LB.buildDoc(html, { edit: mode === 'edit', cfg: cfg });
  }
  function onFrame(scrollY) {
    win = frame.contentWindow; doc = frame.contentDocument;
    if (scrollY) win.scrollTo(0, scrollY);
    if (mode === 'preview') { bindPreview(); return; }
    var st = doc.createElement('style'); st.id = 'lb-ed-css'; st.setAttribute('data-lb-ed', ''); st.textContent = EDITOR_CSS;
    doc.head.appendChild(st);
    $$('header nav', doc).forEach(function (n) { n.setAttribute('data-list', ''); });
    prepareEditable(doc);
    buildOverlays();
    bindFrameEvents();
    syncCfgToFrame();
    renderAll();
  }
  function prepareEditable(root) {
    $$('[data-e]', root).forEach(function (el) { el.setAttribute('contenteditable', 'true'); el.setAttribute('spellcheck', 'false'); });
  }

  /* overlays living inside the frame */
  var hl, tb, fmt, chip, cvtb, dl, tbTarget, cvTarget, chipTarget;
  function mk(tag, idv, html) {
    var e = doc.createElement(tag); e.id = idv; e.setAttribute('data-lb-ed', ''); if (html) e.innerHTML = html; doc.body.appendChild(e); return e;
  }
  function buildOverlays() {
    hl = mk('div', 'lb-hl', '<span></span>');
    tb = mk('div', 'lb-tb', '<button data-a="up" title="Move earlier">◀</button><button data-a="dn" title="Move later">▶</button><button data-a="dup" title="Duplicate">⧉ Copy</button><button data-a="del" class="del" title="Delete">✕</button>');
    fmt = mk('div', 'lb-fmt', '<button data-f="hl">✨ Highlight</button><button data-f="b">B</button><button data-f="clr">Clear</button>');
    chip = mk('button', 'lb-chip', '🔗 Button / link');
    cvtb = mk('div', 'lb-cvtb', '<button class="drag" data-a="drag" title="Drag to move">✥</button><span class="sep"></span><button data-a="fs-" title="Smaller text">A−</button><button data-a="fs+" title="Bigger text">A+</button><span class="sep"></span><button data-a="w-" title="Narrower">↔−</button><button data-a="w+" title="Wider">↔+</button><span class="sep"></span><button data-a="m-" title="Smaller on phones">📱−</button><button data-a="m+" title="Bigger on phones">📱+</button><span class="sep"></span><input type="color" data-a="color" title="Colour" value="#ffffff"><button data-a="del" class="del" title="Delete">✕</button>');
    dl = mk('div', 'lb-dl', '');
    tb.addEventListener('click', onToolbar);
    cvtb.addEventListener('click', onCanvasTb);
    cvtb.addEventListener('input', onCanvasTb);
    cvtb.addEventListener('mousedown', function (e) { if (e.target.getAttribute('data-a') === 'drag') startCvDrag(e); });
    fmt.addEventListener('mousedown', function (e) { e.preventDefault(); });
    fmt.addEventListener('click', onFormat);
    chip.addEventListener('click', function () { if (chipTarget) openBtnDlg(chipTarget); });
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
      if (el.hasAttribute('data-html')) return { type: 'html', el: el };
    }
    return null;
  }
  function itemAt(t) {
    var n = t && t.closest ? t.closest('[data-list] > *, .bk-el') : null;
    if (n && (n.hasAttribute('data-fixed-row') || n.closest('.bk-cv'))) return null;
    return n;
  }
  function linkAt(t) {
    var a = t && t.closest ? t.closest('a') : null;
    return (a && !a.closest('[data-lb-ed]')) ? a : null;
  }

  function bindFrameEvents() {
    var moveRaf;
    doc.addEventListener('mousemove', function (e) {
      if (cvDrag) return;
      if (moveRaf) return;
      moveRaf = win.requestAnimationFrame(function () {
        moveRaf = 0;
        var inOv = e.target.closest && e.target.closest('#lb-tb,#lb-cvtb,#lb-chip');
        var h = hit(e.clientX, e.clientY);
        if (h && h.type !== 'text') {
          var r = h.el.getBoundingClientRect();
          hl.style.cssText = 'display:block;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
          if (h.type === 'img') { var sp = imageSpec(h.el); hl.firstChild.innerHTML = '🖼 Click to change image<small>best size ' + sp.w + ' × ' + sp.h + ' px · JPG / PNG / WebP · max 15 MB</small>'; }
          else hl.firstChild.innerHTML = h.type === 'map' ? '📍 Click to set address' : h.type === 'html' ? '&lt;/&gt; Click to edit code' : '🎬 Click to set video';
          doc.documentElement.style.cursor = 'pointer';
        } else if (!inOv) { hl.style.display = 'none'; doc.documentElement.style.cursor = ''; }
        if (inOv) return;
        /* canvas item toolbar */
        var cv = e.target.closest && e.target.closest('.bk-cv-i');
        if (cv) showCvTb(cv); else cvtb.style.display = 'none';
        /* link chip */
        var a = linkAt(e.target);
        if (a) showChip(a); else chip.style.display = 'none';
        /* list / element toolbar */
        var it = cv ? null : itemAt(e.target);
        if (it) showToolbar(it); else tb.style.display = 'none';
      });
    });
    doc.addEventListener('scroll', function () { hl.style.display = 'none'; tb.style.display = 'none'; fmt.style.display = 'none'; chip.style.display = 'none'; cvtb.style.display = 'none'; }, true);
    doc.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-ed]')) return;
      var sec = e.target.closest('section[data-section]');
      activeSec = (sec && !sec.hasAttribute('data-fixed')) ? sec : activeSec; activeNode = e.target; activeCanvas = e.target.closest('[data-canvas]');
      renderSections();
      var a = e.target.closest('a'); if (a) e.preventDefault();
      var h = hit(e.clientX, e.clientY);
      if (h && h.type === 'img') { e.preventDefault(); openImgDlg(h.el); }
      else if (h && h.type === 'video') { e.preventDefault(); focusRow('#vidList', $$('[data-video]', doc).indexOf(h.el)); }
      else if (h && h.type === 'map') { e.preventDefault(); focusRow('#mapList', $$('[data-map]', doc).indexOf(h.el)); }
      else if (h && h.type === 'html') { e.preventDefault(); openHtmlDlg(h.el); }
    }, true);
    doc.addEventListener('input', queueSave);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDlgs(); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.hasAttribute && e.target.hasAttribute('data-e')) { e.preventDefault(); doc.execCommand('insertLineBreak'); }
    });
    doc.addEventListener('paste', function (e) {
      if (!(e.target.hasAttribute && e.target.hasAttribute('data-e'))) return;
      e.preventDefault();
      doc.execCommand('insertText', false, (e.clipboardData || win.clipboardData).getData('text/plain'));
    });
    doc.addEventListener('selectionchange', onSelection);
    /* drag & drop: image files + palette items */
    doc.addEventListener('dragover', function (e) {
      if (dragData) { e.preventDefault(); showDropIndicator(e); }
      else if (e.dataTransfer && e.dataTransfer.types && Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0) e.preventDefault();
    });
    doc.addEventListener('dragleave', function (e) { if (!e.relatedTarget) dl.style.display = 'none'; });
    doc.addEventListener('drop', function (e) {
      dl.style.display = 'none';
      if (dragData) { e.preventDefault(); var d = dragData; dragData = null; dropInsert(d, e); return; }
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f || f.type.indexOf('image/') !== 0) return;
      e.preventDefault();
      var h = hit(e.clientX, e.clientY);
      if (h && h.type === 'img') processFile(f, h.el).then(function (r) { if (r) { applyImage(h.el, r.src); toast('Image updated · ' + r.msg, 4500); } });
    });
  }

  /* ----- list / element toolbar ----- */
  function showToolbar(it) {
    tbTarget = it;
    var r = it.getBoundingClientRect();
    if (r.bottom < 40 || r.top > win.innerHeight - 40) { tb.style.display = 'none'; return; }
    tb.style.display = 'flex';
    var w = tb.offsetWidth || 200;
    tb.style.left = Math.max(6, Math.min(r.right - w - 6, win.innerWidth - w - 6)) + 'px';
    tb.style.top = Math.max(6, r.top + 6) + 'px';
  }
  function onToolbar(e) {
    var b = e.target.closest('button'); if (!b || !tbTarget) return;
    var a = b.getAttribute('data-a'), el = tbTarget, p = el.parentNode;
    pushHistory();
    if (a === 'dup') { var c = el.cloneNode(true); $$('[data-img]', c).forEach(function (im) { var k = (im.getAttribute('data-img') || 'img').replace(/-[a-z0-9]{5}$/, '') + '-' + uid(); im.setAttribute('data-img', k); }); p.insertBefore(c, el.nextSibling); toast('Copied. Edit the new one.'); }
    else if (a === 'del') {
      if (p.hasAttribute('data-list') && p.children.length <= 1 && !el.classList.contains('bk-el')) { toast('Keep at least one item here.'); return; }
      var wrapper = el.parentElement && el.parentElement.classList.contains('bk-w') && el.parentElement.children.length === 1 ? el.closest('section') : null;
      el.remove(); if (wrapper && wrapper.getAttribute('data-section') === 'Content') wrapper.remove(); tb.style.display = 'none';
    }
    else if (a === 'up' && el.previousElementSibling) p.insertBefore(el, el.previousElementSibling);
    else if (a === 'dn' && el.nextElementSibling) p.insertBefore(el.nextElementSibling, el);
    afterStructure();
  }

  /* ----- link / button chip ----- */
  function showChip(a) {
    chipTarget = a;
    var r = a.getBoundingClientRect();
    if (r.bottom < 10 || r.top > win.innerHeight - 10 || r.width < 8) { chip.style.display = 'none'; return; }
    chip.style.display = 'block';
    var w = chip.offsetWidth || 130;
    chip.style.left = Math.max(6, Math.min(r.right - w, win.innerWidth - w - 6)) + 'px';
    chip.style.top = (a.closest('.bk-cv-i') ? Math.min(win.innerHeight - 34, r.bottom + 6) : Math.max(6, r.top - 30)) + 'px';
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
    if (f === 'hl') doc.execCommand('insertHTML', false, '<em>' + s.toString().replace(/</g, '&lt;') + '</em>');
    else if (f === 'b') doc.execCommand('bold');
    else if (f === 'clr') {
      var n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
      var em = n && n.closest ? n.closest('em,b,strong') : null;
      if (em) { while (em.firstChild) em.parentNode.insertBefore(em.firstChild, em); em.remove(); }
    }
    queueSave();
  }

  /* =====================================================================
   * free image canvas
   * ===================================================================== */
  var cvDrag = null;
  function showCvTb(item) {
    cvTarget = item;
    var r = item.getBoundingClientRect();
    cvtb.style.display = 'flex';
    var w = cvtb.offsetWidth || 340;
    cvtb.style.left = Math.max(6, Math.min(r.left, win.innerWidth - w - 6)) + 'px';
    cvtb.style.top = Math.max(6, r.top - 40) + 'px';
    var first = item.firstElementChild, col = '#ffffff';
    if (first) { var cs = win.getComputedStyle(first); col = rgb2hex(first.tagName === 'A' ? cs.backgroundColor : cs.color); }
    $('input[data-a=color]', cvtb).value = col;
  }
  function rgb2hex(c) { var m = /(\d+)[, ]+(\d+)[, ]+(\d+)/.exec(c || ''); if (!m) return '#ffffff'; return '#' + [m[1], m[2], m[3]].map(function (x) { return ('0' + (+x).toString(16)).slice(-2); }).join(''); }
  function cvNum(item, prop, def) { var v = parseFloat(item.style.getPropertyValue(prop)); return isNaN(v) ? def : v; }
  function onCanvasTb(e) {
    var t = e.target; var a = t.getAttribute && t.getAttribute('data-a'); if (!a || !cvTarget || a === 'drag') return;
    var it = cvTarget, isImg = !!it.querySelector('img');
    if (e.type === 'input' && a === 'color') {
      var f = it.firstElementChild;
      if (f) { if (f.tagName === 'A') { f.style.background = t.value; f.style.borderColor = t.value; } else f.style.color = t.value; }
      queueSave(); return;
    }
    if (e.type !== 'click') return;
    pushHistory();
    var fs = cvNum(it, '--fs', 3), fm = cvNum(it, '--fsm', fs * 1.7);
    if (a === 'fs-') it.style.setProperty('--fs', Math.max(0.8, +(fs * 0.9).toFixed(2)));
    if (a === 'fs+') it.style.setProperty('--fs', Math.min(14, +(fs * 1.1).toFixed(2)));
    if (a === 'm-') it.style.setProperty('--fsm', Math.max(2, +(fm * 0.9).toFixed(2)));
    if (a === 'm+') it.style.setProperty('--fsm', Math.min(16, +(fm * 1.1).toFixed(2)));
    if (a === 'w-' || a === 'w+') { var w = parseFloat(it.style.width) || (isImg ? 30 : 50); it.style.width = Math.max(8, Math.min(100, w + (a === 'w+' ? 6 : -6))) + '%'; }
    if (a === 'del') { it.remove(); cvtb.style.display = 'none'; }
    afterStructure();
  }
  function startCvDrag(e) {
    e.preventDefault();
    var it = cvTarget; if (!it) return;
    pushHistory();
    var cv = it.closest('.bk-cv'), r = cv.getBoundingClientRect();
    cvDrag = { it: it, cv: cv, r: r, sx: e.clientX, sy: e.clientY, l: parseFloat(it.style.left) || 0, t: parseFloat(it.style.top) || 0 };
    var move = function (ev) {
      var dx = (ev.clientX - cvDrag.sx) / r.width * 100, dy = (ev.clientY - cvDrag.sy) / r.height * 100;
      it.style.left = Math.max(-5, Math.min(95, cvDrag.l + dx)).toFixed(2) + '%'; it.style.top = Math.max(-5, Math.min(97, cvDrag.t + dy)).toFixed(2) + '%';
      showCvTb(it);
    };
    var up = function () { doc.removeEventListener('mousemove', move, true); doc.removeEventListener('mouseup', up, true); cvDrag = null; queueSave(); };
    doc.addEventListener('mousemove', move, true); doc.addEventListener('mouseup', up, true);
    /* the toolbar lives in the frame, so also listen on the parent for releases outside */
    document.addEventListener('mouseup', up, { once: true });
  }
  function addCanvasItem(cv, kind, el, x, y) {
    var html;
    if (kind === 'h') html = '<div class="bk-cv-t" data-e>New heading</div>', fsv = 3.4;
    else if (kind === 'p') html = '<div class="bk-cv-t" style="font-weight:500" data-e>Write your text here.</div>', fsv = 1.8;
    else if (el && el.cv) html = el.cv, fsv = 1.8;
    else if (el && el.cvImg) html = '<img class="bk-cv-img" data-img="cv-' + uid() + '" data-label="Canvas image" src="' + LB.ph.photo('#6366f1', '#312e81', 800, 600) + '" alt="">', fsv = 2;
    else return false;
    var fsv2 = fsv;
    var item = doc.createElement('div'); item.className = 'bk-cv-i'; item.setAttribute('data-cv', '');
    item.style.cssText = 'left:' + Math.max(0, Math.min(90, x)).toFixed(1) + '%;top:' + Math.max(0, Math.min(92, y)).toFixed(1) + '%;--fs:' + fsv2 + (el && el.cvImg ? ';width:30%' : (kind === 'h' || kind === 'p' ? ';width:50%' : ''));
    item.innerHTML = html; cv.appendChild(item); prepareEditable(item);
    return true;
  }
  var fsv;

  /* =====================================================================
   * images: rules, specs, optimisation
   * ===================================================================== */
  var WEBP = (function () { try { return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0; } catch (e) { return false; } })();
  function ratioLabel(w, h) {
    var r = w / h, list = [[1, 1, '1:1'], [4, 3, '4:3'], [3, 2, '3:2'], [16, 9, '16:9'], [16, 10, '16:10'], [5, 4, '5:4'], [4, 5, '4:5'], [3, 4, '3:4'], [2, 3, '2:3'], [9, 16, '9:16'], [21, 9, '21:9']];
    for (var i = 0; i < list.length; i++) if (Math.abs(r - list[i][0] / list[i][1]) < 0.05) return list[i][2];
    return w + ':' + h;
  }
  function imageSpec(el) {
    var r = el.getBoundingClientRect(), cw = Math.round(r.width), ch = Math.round(r.height);
    if (cw < 24 || ch < 24) { cw = el.naturalWidth || 600; ch = el.naturalHeight || 400; }
    var recW = Math.max(200, Math.min(2400, Math.round(cw * 2 / 10) * 10));
    var recH = Math.round(recW * ch / cw);
    var isLogo = el.getAttribute('data-img') === 'logo' || cw <= 180;
    var budget = isLogo ? 90 : cw >= 1000 ? 420 : cw < 500 ? 150 : 260;
    var cover = win.getComputedStyle(el).objectFit === 'cover';
    return { w: recW, h: recH, cssW: cw, cssH: ch, ratio: ratioLabel(cw, ch), budget: budget, logo: isLogo, cover: cover };
  }
  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
  function blobToDataUrl(b) { return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.readAsDataURL(b); }); }
  function canvasBlob(cv, type, q) { return new Promise(function (res) { cv.toBlob(res, type, q); }); }

  /* validates, shrinks and converts; resolves {src,msg,level} or null (error shown in dialog) */
  function processFile(file, el) {
    var res = $('#imgRes');
    function fail(m) { res.className = 'res bad'; res.textContent = m; toast(m, 5000); return null; }
    if (TYPES.indexOf(file.type) < 0) return Promise.resolve(fail('This file type is not supported (' + (file.type || 'unknown') + '). Please use JPG, PNG, WebP, GIF or SVG.'));
    if (file.size > MAX_UPLOAD) return Promise.resolve(fail('This file is ' + fmtKB(file.size) + '. The maximum is 15 MB. Please make it smaller first (for example at squoosh.app).'));
    var sp = imageSpec(el);
    res.className = 'res warn'; res.textContent = 'Optimising ' + fmtKB(file.size) + '…';
    if (file.type === 'image/svg+xml') {
      if (file.size > 1048576) return Promise.resolve(fail('This SVG is ' + fmtKB(file.size) + ' (too heavy). Use an SVG under 1 MB, or a PNG/JPG.'));
      return blobToDataUrl(file).then(function (u) { return { src: u, msg: 'SVG kept as is (' + fmtKB(file.size) + ')', level: 'ok' }; });
    }
    if (file.type === 'image/gif') {
      if (file.size > 3145728) return Promise.resolve(fail('This GIF is ' + fmtKB(file.size) + '. Big GIFs make pages slow. Use a GIF under 3 MB, or add the video with a YouTube link.'));
      return blobToDataUrl(file).then(function (u) { return { src: u, msg: 'GIF kept as is (' + fmtKB(file.size) + ')', level: file.size > 1048576 ? 'warn' : 'ok' }; });
    }
    var url = URL.createObjectURL(file);
    return loadImg(url).then(function (im) {
      URL.revokeObjectURL(url);
      var nw = im.naturalWidth, nh = im.naturalHeight;
      var w = Math.min(nw, sp.w, 2400), warn = '';
      if (nw < sp.w * 0.6) warn = ' This image is smaller than the best size (' + nw + '×' + nh + ' vs ' + sp.w + '×' + sp.h + '), so it may look blurry.';
      var type = WEBP ? 'image/webp' : (file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png');
      var budget = sp.budget * 1024, q = 0.86, blob = null, tries = 0;
      function attempt() {
        var h = Math.round(w * nh / nw), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, 0, 0, w, h);
        return canvasBlob(cv, type, q).then(function (b) {
          blob = b; tries++;
          if (b.size > budget && type !== 'image/png' && tries < 9) { if (q > 0.56) q -= 0.08; else w = Math.max(480, Math.round(w * 0.86)); return attempt(); }
          if (type === 'image/png' && b.size > budget && w > 600 && tries < 6) { w = Math.round(w * 0.85); return attempt(); }
          return b;
        });
      }
      return attempt().then(function (b) {
        if (b.size >= file.size && w >= nw && file.size < budget * 1.2) b = file;
        return blobToDataUrl(b).then(function (u) {
          var finalW = Math.min(w, nw), fmt = b.type.replace('image/', '').toUpperCase().replace('JPEG', 'JPG');
          var big = b.size > budget * 1.5;
          return { src: u, level: (warn || big) ? 'warn' : 'ok', msg: fmtKB(file.size) + ' → ' + fmtKB(b.size) + ' (' + fmt + ', ' + finalW + ' px wide)' + warn + (big ? ' Still a bit heavy — a simpler picture would load faster.' : '') };
        });
      });
    }, function () { return fail('We could not read this image. It may be damaged. Please try another file.'); });
  }
  function applyImage(el, src) {
    pushHistory();
    el.removeAttribute('srcset'); el.src = src;
    afterStructure();
  }

  /* image dialog */
  var imgTarget = null;
  var fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif'; fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  function openImgDlg(el) {
    imgTarget = el;
    var sp = imageSpec(el), lab = el.getAttribute('data-label') || 'Image';
    $('#imgTitle').textContent = 'Replace image · ' + lab;
    $('#imgSpec').innerHTML = '<b>Best size: ' + sp.w + ' × ' + sp.h + ' px</b> <span>(' + sp.ratio + ')</span><small>It shows at about ' + sp.cssW + ' × ' + sp.cssH + ' px on a computer. We use 2× so it stays sharp on phones.' + (sp.cover ? ' Other shapes also work — the picture is cropped to fit.' : '') + '</small>';
    $('#imgRules').innerHTML = '<li>File types: <b>JPG, PNG, WebP, GIF or SVG</b> (JPG for photos, PNG/WebP for logos with a transparent background)</li>' +
      '<li>Maximum upload: <b>15 MB</b></li><li>We shrink it automatically to about <b>' + sp.budget + ' KB</b> so your page opens quickly — you do not need to compress it yourself</li>' +
      (sp.logo ? '<li>Logos: a square or wide PNG with a transparent background looks best</li>' : '');
    $('#imgRes').className = 'res'; $('#imgRes').textContent = '';
    $('#imgUrl').value = '';
    var orig = originalImage(el); $('#imgReset').style.display = orig ? '' : 'none';
    openDlg('dlgImg');
  }
  $('#imgChoose').onclick = function () { fileInput.click(); };
  fileInput.addEventListener('change', function () { var f = fileInput.files[0]; fileInput.value = ''; if (f) handleFile(f); });
  function handleFile(f) {
    if (!imgTarget) return;
    processFile(f, imgTarget).then(function (r) {
      if (!r) return;
      applyImage(imgTarget, r.src);
      var res = $('#imgRes'); res.className = 'res ' + (r.level === 'ok' ? 'ok' : 'warn'); res.textContent = '✓ Image updated. ' + r.msg;
      toast('Image updated ✓', 2200);
      setTimeout(function () { if (!$('#dlgImg').hidden) $('#dlgImg').hidden = true; }, r.level === 'ok' ? 900 : 3800);
    });
  }
  var drop = $('#imgDrop');
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) handleFile(f); });
  $('#imgUseUrl').onclick = function () {
    var u = $('#imgUrl').value.trim(); if (!u || !imgTarget) return;
    if (!/^https?:\/\//i.test(u)) { $('#imgRes').className = 'res bad'; $('#imgRes').textContent = 'The link must start with https://'; return; }
    applyImage(imgTarget, u); $('#imgRes').className = 'res warn'; $('#imgRes').textContent = 'Using the image from that link. For the fastest page, upload the file instead — links to other sites can be slow or stop working.';
  };
  $('#imgReset').onclick = function () { var o = imgTarget && originalImage(imgTarget); if (o) { applyImage(imgTarget, o); $('#dlgImg').hidden = true; toast('Back to the original image'); } };

  function originalImage(im) {
    var p = pages[cur], t = p && p.tpl ? LB.get(p.tpl) : null; if (!t) return null;
    var od = parseHtml(t.html), o = od.querySelector('[data-img="' + im.getAttribute('data-img') + '"]');
    return o ? o.getAttribute('src') : null;
  }

  /* =====================================================================
   * button / link dialog
   * ===================================================================== */
  var btnTarget = null;
  function isButtonLike(a) { return a.classList.contains('btn') || a.classList.contains('bk-btn') || a.hasAttribute('data-cta') || /(^|\s)(mini|b-pri)(\s|$)/.test(a.className); }
  function sectionId(sec) { if (!sec.id) sec.id = 'sec-' + (slugify(sec.getAttribute('data-section')) || uid()); return sec.id; }
  function openBtnDlg(a) {
    btnTarget = a;
    $('#bText').value = a.textContent.trim();
    var cta = a.getAttribute('data-cta'), href = a.getAttribute('href') || '', act = 'link';
    if (cta === 'enroll' || cta === 'whatsapp' || cta === 'call') act = cta;
    else if (/^#./.test(href) && href !== '#enroll') act = 'section';
    else if (pages.some(function (p) { return href === p.slug + '.html'; })) act = 'page';
    $('#bAct').value = act;
    $('#bUrl').value = act === 'link' ? (href === '#' ? '' : href) : ''; $('#bNew').checked = a.getAttribute('target') === '_blank';
    $('#bPage').innerHTML = pages.map(function (p) { return '<option value="' + esc(p.slug) + '.html">' + esc(p.name) + '</option>'; }).join('');
    if (act === 'page') $('#bPage').value = href;
    var secs = $$('section[data-section]', doc).filter(function (s) { return !s.hasAttribute('data-fixed'); });
    $('#bSec').innerHTML = secs.map(function (s) { return '<option value="' + esc(sectionId(s)) + '">' + esc(s.getAttribute('data-section')) + '</option>'; }).join('');
    if (act === 'section') $('#bSec').value = href.slice(1);
    var btn = isButtonLike(a); $('#bStyleBox').style.display = btn ? '' : 'none';
    var cs = win.getComputedStyle(a); $('#bBg').value = rgb2hex(a.style.background || cs.backgroundColor); $('#bFg').value = rgb2hex(a.style.color || cs.color);
    $('#bVarBox').style.display = a.classList.contains('bk-btn') ? '' : 'none';
    $('#bVar').value = a.classList.contains('o') ? 'o' : a.classList.contains('d') ? 'd' : '';
    $('#bBg').dataset.touched = ''; $('#bFg').dataset.touched = '';
    $('#bRemove').style.display = a.closest('header,footer,nav') ? 'none' : '';
    toggleBtnBoxes(); openDlg('dlgBtn');
  }
  function toggleBtnBoxes() { var v = $('#bAct').value; $('#bLinkBox').style.display = v === 'link' ? '' : 'none'; $('#bPageBox').style.display = v === 'page' ? '' : 'none'; $('#bSecBox').style.display = v === 'section' ? '' : 'none'; }
  $('#bAct').onchange = toggleBtnBoxes;
  $('#bBg').oninput = function () { this.dataset.touched = '1'; }; $('#bFg').oninput = function () { this.dataset.touched = '1'; };
  $('#bResetCol').onclick = function () { if (!btnTarget) return; btnTarget.style.background = ''; btnTarget.style.color = ''; btnTarget.style.borderColor = ''; if (!btnTarget.getAttribute('style')) btnTarget.removeAttribute('style'); $('#dlgBtn').hidden = true; queueSave(); toast('Colours reset'); };
  $('#bRemove').onclick = function () { if (!btnTarget) return; pushHistory(); var host = btnTarget.closest('.bk-cv-i') || btnTarget.closest('.bk-el') || btnTarget; host.remove(); $('#dlgBtn').hidden = true; afterStructure(); };
  $('#bSave').onclick = function () {
    var a = btnTarget; if (!a) return; pushHistory();
    var act = $('#bAct').value, txt = $('#bText').value.trim();
    if (txt && txt !== a.textContent.trim()) a.textContent = txt;
    a.removeAttribute('data-cta'); a.removeAttribute('target'); a.removeAttribute('rel');
    if (act === 'enroll' || act === 'whatsapp' || act === 'call') { a.setAttribute('data-cta', act); a.removeAttribute('data-lb-off'); if (act === 'enroll') a.setAttribute('href', '#enroll'); }
    else if (act === 'link') {
      var u = $('#bUrl').value.trim(); if (u && !/^(https?:|mailto:|tel:|#|\/)/i.test(u)) u = 'https://' + u;
      a.setAttribute('href', u || '#'); if ($('#bNew').checked) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    } else if (act === 'page') a.setAttribute('href', $('#bPage').value);
    else if (act === 'section') a.setAttribute('href', '#' + $('#bSec').value);
    if (isButtonLike(a)) {
      if ($('#bBg').dataset.touched) { a.style.background = $('#bBg').value; a.style.borderColor = $('#bBg').value; }
      if ($('#bFg').dataset.touched) a.style.color = $('#bFg').value;
      if (a.classList.contains('bk-btn')) { a.classList.remove('o', 'd'); if ($('#bVar').value) a.classList.add($('#bVar').value); if ($('#bVar').value) { a.style.background = ''; a.style.color = ''; a.style.borderColor = ''; } }
    }
    $('#dlgBtn').hidden = true; syncCfgToFrame(); afterStructure(); toast('Saved ✓');
  };

  /* custom HTML */
  var htmlTarget = null;
  function openHtmlDlg(el) { htmlTarget = el; $('#htmlCode').value = el.innerHTML.trim(); openDlg('dlgHtml'); }
  $('#htmlSave').onclick = function () { if (!htmlTarget) return; pushHistory(); htmlTarget.innerHTML = $('#htmlCode').value; $('#dlgHtml').hidden = true; afterStructure(); toast('Code saved'); };

  /* =====================================================================
   * adding sections and elements
   * ===================================================================== */
  function mainEl() { return doc.querySelector('main') || doc.body; }
  function ensureBlocksCss() {
    if (doc.getElementById('lb-blocks-css')) return;
    var st = doc.createElement('style'); st.id = 'lb-blocks-css'; st.textContent = LB.blocksCss; doc.head.appendChild(st);
  }
  function fillKeys(html) { return html.replace(/\{\{k\}\}/g, uid()); }
  function insertSection(html, refSec, where) {
    ensureBlocksCss();
    var t = doc.createElement('template'); t.innerHTML = fillKeys(html).trim(); var sec = t.content.firstElementChild;
    var main = mainEl();
    if (refSec && refSec.parentNode === main) refSec.insertAdjacentElement(where || 'afterend', sec);
    else main.appendChild(sec);
    prepareEditable(sec);
    if (win.LBRT) win.LBRT.apply(cfg);
    return sec;
  }
  function openBlocks() {
    var after = activeSec && activeSec.parentNode === mainEl() ? activeSec : null;
    $('#blkWhere').textContent = after ? 'after “' + after.getAttribute('data-section') + '”' : 'at the end of the page';
    var g = $('#blkGrid'); g.innerHTML = '';
    LB.blocks.forEach(function (b) {
      var c = document.createElement('button'); c.className = 'blk';
      c.innerHTML = '<div class="pv"><iframe tabindex="-1" title=""></iframe></div><div class="in"><b>' + b.icon + ' ' + esc(b.name) + '</b><span>' + esc(b.desc) + '</span></div>';
      c.querySelector('iframe').srcdoc = blockPreview(b);
      c.onclick = function () {
        pushHistory();
        var sec = insertSection(b.html, after, 'afterend');
        $('#dlgBlocks').hidden = true; activeSec = sec; afterStructure();
        sec.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast('Section added — click any text to edit');
      };
      g.appendChild(c);
    });
    $$('.blk .pv', g).forEach(function (pv) { var k = pv.clientWidth / 1100; pv.firstChild.style.transform = 'scale(' + k + ')'; });
    openDlg('dlgBlocks');
    $$('.blk .pv', g).forEach(function (pv) { var k = pv.clientWidth / 1100; pv.firstChild.style.transform = 'scale(' + k + ')'; });
  }
  function blockPreview(b) {
    var cs = doc ? doc.documentElement.getAttribute('style') || '' : '';
    var theme = doc && doc.documentElement.hasAttribute('data-bk') ? (' data-bk style="' + esc(cs) + '"') : (' style="' + esc(cs) + '"');
    var font = doc && doc.getElementById('lb-font') ? '<link rel="stylesheet" href="' + doc.getElementById('lb-font').getAttribute('href') + '">' : '';
    return '<!doctype html><html' + theme + '><head><meta charset="utf-8">' + font + '<style>body{margin:0;background:var(--bk-bg,#fff);font-family:var(--bk-body,system-ui,sans-serif)}.rv{opacity:1}</style><style>' + LB.blocksCss + '</style></head><body>' + fillKeys(b.html) + '</body></html>';
  }
  $('#addSecBtn').onclick = openBlocks;

  /* palette of elements */
  var dragData = null;
  function buildPalette() {
    var box = $('#elPalette'); box.innerHTML = '';
    LB.elements.forEach(function (el) {
      var c = document.createElement('div'); c.className = 'chip'; c.draggable = true; c.title = 'Drag onto the page, or tap to add';
      c.innerHTML = '<i>' + el.icon + '</i>' + esc(el.name);
      c.addEventListener('dragstart', function (e) { dragData = { kind: 'el', id: el.id }; e.dataTransfer.setData('text/plain', 'pagecraft:' + el.id); e.dataTransfer.effectAllowed = 'copy'; });
      c.addEventListener('dragend', function () { dragData = null; if (dl) dl.style.display = 'none'; });
      c.addEventListener('click', function () { insertElementActive(el); });
      box.appendChild(c);
    });
  }
  /* find the block (slot) next to which a new element goes */
  function slotFor(node) {
    var sec = node && node.closest ? node.closest('section[data-section]') : null;
    if (!sec || sec.hasAttribute('data-fixed') || sec.parentNode !== mainEl()) return null;
    var el = node;
    while (el && el !== sec) {
      var p = el.parentElement; if (!p) break;
      if (p === sec) break;
      var isCont = p.classList.contains('wrap') || p.classList.contains('bk-w');
      var disp = win.getComputedStyle(p).display;
      if (isCont && disp === 'block') break;
      if (isCont && (p.parentElement === sec) && disp !== 'block') { el = p; break; }
      el = p;
    }
    return { sec: sec, slot: el === sec ? null : el };
  }
  function makeElementNode(el) {
    ensureBlocksCss();
    var t = doc.createElement('template'); t.innerHTML = fillKeys(el.html).trim(); var n = t.content.firstElementChild; return n;
  }
  function placeElement(el, ref, pos) {
    var n = makeElementNode(el), s = ref && ref.slot, sec = ref && ref.sec;
    if (s && sec) {
      if (s.parentElement === sec) { var w = doc.createElement('div'); w.className = 'bk-w'; w.appendChild(n); s.insertAdjacentElement(pos, w); }
      else s.insertAdjacentElement(pos, n);
    } else {
      var host = doc.createElement('section'); host.className = 'bk'; host.setAttribute('data-section', 'Content'); var w2 = doc.createElement('div'); w2.className = 'bk-w'; w2.appendChild(n); host.appendChild(w2);
      var main = mainEl();
      if (sec && sec.parentNode === main) sec.insertAdjacentElement(pos, host); else main.appendChild(host);
    }
    prepareEditable(n); if (win.LBRT) win.LBRT.apply(cfg);
    return n;
  }
  function insertElementActive(el) {
    if (!doc || mode !== 'edit') return;
    pushHistory();
    var cv = activeCanvas && doc.contains(activeCanvas) ? activeCanvas : null;
    if (cv && (el.id === 'h' || el.id === 'p' || el.cv || el.cvImg)) {
      addCanvasItem(cv, el.id, el, 10 + Math.random() * 30, 12 + Math.random() * 50);
      afterStructure(); toast('Added to the canvas — drag it with ✥'); return;
    }
    var ref = activeNode ? slotFor(activeNode) : null;
    if (!ref || !ref.slot) ref = activeSec ? { sec: activeSec, slot: null } : null;
    var n = placeElement(el, ref, 'afterend');
    afterStructure(); n.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast('Element added');
  }
  function showDropIndicator(e) {
    var t = doc.elementFromPoint(e.clientX, e.clientY); if (!t) return;
    var info = dropTarget(t, e, dragData.id);
    if (!info) { dl.style.display = 'none'; return; }
    if (info.canvas) { var r = info.canvas.getBoundingClientRect(); dl.className = 'box'; dl.style.cssText = 'display:block;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px'; return; }
    var rr = info.ref.getBoundingClientRect(), y = info.pos === 'beforebegin' ? rr.top : rr.bottom;
    dl.className = ''; dl.style.cssText = 'display:block;left:' + Math.max(0, rr.left) + 'px;top:' + (y - 2) + 'px;width:' + Math.min(rr.width, win.innerWidth) + 'px';
  }
  function dropTarget(t, e, idv) {
    var cv = t.closest && t.closest('[data-canvas]'); var el = LB.elements.filter(function (x) { return x.id === idv; })[0] || {};
    if (cv && (idv === 'h' || idv === 'p' || el.cv || el.cvImg)) return { canvas: cv };
    var s = slotFor(t);
    if (s && s.slot) { var r = s.slot.getBoundingClientRect(); return { ref: s.slot, sec: s.sec, slot: s.slot, pos: e.clientY < r.top + r.height / 2 ? 'beforebegin' : 'afterend' }; }
    var sec = t.closest && t.closest('main > section[data-section]');
    if (sec && !sec.hasAttribute('data-fixed')) { var r2 = sec.getBoundingClientRect(); return { ref: sec, sec: sec, slot: null, pos: e.clientY < r2.top + r2.height / 2 ? 'beforebegin' : 'afterend' }; }
    var last = mainEl().lastElementChild; if (last) return { ref: last, sec: last, slot: null, pos: 'afterend' };
    return null;
  }
  function dropInsert(d, e) {
    var el = LB.elements.filter(function (x) { return x.id === d.id; })[0]; if (!el) return;
    var t = doc.elementFromPoint(e.clientX, e.clientY); if (!t) return;
    var info = dropTarget(t, e, d.id); if (!info) return;
    pushHistory();
    if (info.canvas) {
      var r = info.canvas.getBoundingClientRect();
      addCanvasItem(info.canvas, d.id, el, (e.clientX - r.left) / r.width * 100 - 3, (e.clientY - r.top) / r.height * 100 - 3);
      activeCanvas = info.canvas; afterStructure(); toast('Placed on the canvas — drag it with ✥ to fine-tune'); return;
    }
    var n = placeElement(el, { sec: info.sec, slot: info.slot }, info.pos);
    afterStructure(); n.scrollIntoView({ block: 'nearest' }); toast('Element added');
  }

  /* =====================================================================
   * undo
   * ===================================================================== */
  function pushHistory() {
    try { history.push({ html: serialize(), y: doc.documentElement.scrollTop, page: cur }); if (history.length > 30) history.shift(); } catch (e) {}
    $('#undoBtn').disabled = false;
  }
  $('#undoBtn').addEventListener('click', function () {
    var h = history.pop(); if (!h) return;
    $('#undoBtn').disabled = history.length === 0;
    if (h.page !== cur) { history = []; return; }
    clearTimeout(dirtyTimer); doc = null; pages[cur].html = h.html; loadFrame(h.html, false);
    frame.addEventListener('load', function once() { frame.removeEventListener('load', once); try { win.scrollTo(0, h.y); } catch (e) {} });
    queueSave();
  });
  $('#undoBtn').disabled = true;
  function afterStructure() { renderAll(); queueSave(); }

  /* =====================================================================
   * side panel
   * ===================================================================== */
  function renderAll() { if (!doc || mode !== 'edit') return; renderSections(); renderImages(); renderCanvases(); renderVideos(); renderMaps(); renderColors(); renderTheme(); renderPages(); renderMenu(); fillPageInfo(); renderWeight(); }

  function renderSections() {
    if (!doc || mode !== 'edit') return;
    var secs = $$('[data-section]', doc), box = $('#secList'); box.innerHTML = '';
    secs.forEach(function (s) {
      var row = document.createElement('div'); row.className = 'row' + (s.hasAttribute('data-hidden') ? ' off' : '') + (s === activeSec ? ' act' : '');
      var fixed = s.hasAttribute('data-fixed');
      var sibs = Array.prototype.filter.call(s.parentNode.children, function (c) { return c.hasAttribute('data-section') && !c.hasAttribute('data-fixed'); });
      var pos = sibs.indexOf(s);
      row.innerHTML = '<span class="nm" title="Jump to section">' + esc(s.getAttribute('data-section')) + '</span>' +
        (fixed ? '' : '<button class="mini" data-a="up" title="Move up" ' + (pos === 0 ? 'disabled' : '') + '>↑</button><button class="mini" data-a="dn" title="Move down" ' + (pos === sibs.length - 1 ? 'disabled' : '') + '>↓</button><button class="mini" data-a="dup" title="Copy section">⧉</button>') +
        '<button class="mini" data-a="eye" title="' + (s.hasAttribute('data-hidden') ? 'Hidden — click to show' : 'Click to hide') + '">' + (s.hasAttribute('data-hidden') ? '🙈' : '👁') + '</button>' +
        (fixed ? '' : '<button class="mini danger" data-a="del" title="Delete section">✕</button>');
      row.querySelector('.nm').onclick = function () { activeSec = fixed ? activeSec : s; s.scrollIntoView({ behavior: 'smooth', block: 'start' }); renderSections(); };
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || b.disabled) return;
        var a = b.getAttribute('data-a'); pushHistory();
        if (a === 'eye') { if (s.hasAttribute('data-hidden')) s.removeAttribute('data-hidden'); else s.setAttribute('data-hidden', ''); }
        if (a === 'up') s.parentNode.insertBefore(s, sibs[pos - 1]);
        if (a === 'dn') s.parentNode.insertBefore(sibs[pos + 1], s);
        if (a === 'dup') { var c = s.cloneNode(true); $$('[data-img]', c).forEach(function (im) { im.setAttribute('data-img', (im.getAttribute('data-img') || 'img').replace(/-[a-z0-9]{5}$/, '') + '-' + uid()); }); c.removeAttribute('id'); s.parentNode.insertBefore(c, s.nextSibling); activeSec = c; }
        if (a === 'del') { if (activeSec === s) activeSec = null; s.remove(); }
        afterStructure();
        if (a === 'up' || a === 'dn' || a === 'dup') s.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      box.appendChild(row);
    });
  }

  function renderImages() {
    var ib = $('#imgList'); ib.innerHTML = '';
    $$('[data-img]', doc).forEach(function (im, i) {
      if (im.closest('.bk-cv-bg')) return;
      var sp = imageSpec(im);
      var row = document.createElement('div'); row.className = 'row';
      row.innerHTML = '<img class="th" src="' + esc(im.getAttribute('src')) + '" alt=""><span class="nm">' + esc(im.getAttribute('data-label') || 'Image ' + (i + 1)) + '<span class="sub">Best ' + sp.w + '×' + sp.h + ' px · max 15 MB</span></span>' +
        '<button class="mini" data-a="up">Change</button>';
      row.querySelector('.nm').onclick = function () { im.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      row.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) openImgDlg(im); });
      ib.appendChild(row);
    });
    if (!ib.children.length) ib.innerHTML = '<p class="hint">No images on this page yet. Add an Image element or section.</p>';
  }

  function renderCanvases() {
    var box = $('#cvList'); box.innerHTML = '';
    $$('[data-canvas]', doc).forEach(function (cv, i) {
      var row = document.createElement('div'); row.className = 'vrow';
      var AR = [['16/9', 'Wide 16:9'], ['3/2', '3:2'], ['4/3', '4:3'], ['1/1', 'Square 1:1'], ['21/9', 'Cinema 21:9'], ['4/5', 'Tall 4:5'], ['9/16', 'Story 9:16']];
      var opt = function (cur) { return AR.map(function (a) { return '<option value="' + a[0] + '"' + (a[0] === cur ? ' selected' : '') + '>' + a[1] + '</option>'; }).join(''); };
      var curD = cv.style.getPropertyValue('--ar') || '16/9', curM = cv.style.getPropertyValue('--arm') || '4/5';
      var bg = $('img.bk-cv-bg', cv), sp = bg ? imageSpec(bg) : { w: 1920, h: 1080 };
      row.innerHTML = '<div class="vt"><b>Canvas ' + (i + 1) + '</b><button class="mini" data-a="bg">Replace background</button><button class="mini" data-a="go">Show</button></div>' +
        '<div class="hint" style="margin:0">Upload your own design as the background, then drag text, buttons and images on top. Best size <b>' + sp.w + ' × ' + sp.h + ' px</b> (any shape works). Hover an item and drag the ✥ handle.</div>' +
        '<label class="f" style="margin:6px 0 0">Computer shape<select data-k="--ar">' + opt(curD) + '</select></label><label class="f" style="margin:6px 0 0">Phone shape<select data-k="--arm">' + opt(curM) + '</select></label>';
      $$('select', row).forEach(function (s) { s.onchange = function () { cv.style.setProperty(s.getAttribute('data-k'), s.value); queueSave(); }; });
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
        if (a === 'bg' && bg) openImgDlg(bg); if (a === 'go') cv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      box.appendChild(row);
    });
    if (!box.children.length) box.innerHTML = '<p class="hint">No canvas yet. Use <b>＋ Add section → Image canvas</b> to place text and buttons on your own design.</p>';
  }

  function focusRow(sel, idx) {
    switchTab('content');
    var row = $$(sel + ' .vrow')[idx];
    if (row) { row.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.classList.add('hl'); var i = $('input', row); if (i) i.focus(); setTimeout(function () { row.classList.remove('hl'); }, 1600); }
  }
  function renderVideos() {
    var vb = $('#vidList'); vb.innerHTML = '';
    $$('[data-video]', doc).forEach(function (v, i) {
      var row = document.createElement('div'); row.className = 'vrow';
      row.innerHTML = '<div class="vt"><b>' + esc(v.getAttribute('data-label') || 'Video ' + (i + 1)) + '</b><button class="mini" data-a="go">Show</button><button class="mini" data-a="play">▶ Test</button></div>' +
        '<input placeholder="https://www.youtube.com/watch?v=…" value="' + esc(v.getAttribute('data-url') || '') + '"><div class="hint" style="margin:0"></div>';
      var inp = row.querySelector('input'), hint = row.querySelector('.hint');
      function status() { var ok = win.LBRT.ytId(inp.value); hint.textContent = !inp.value ? 'Empty — visitors will see a placeholder.' : ok ? '✓ Video found — thumbnail shown on the page.' : '⚠ Could not read this YouTube link.'; hint.style.color = ok || !inp.value ? '#64748b' : '#b45309'; }
      status();
      inp.addEventListener('input', function () { v.setAttribute('data-url', inp.value.trim()); v._lbUrl = null; win.LBRT.renderVideo(v); status(); queueSave(); });
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
        if (a === 'go') v.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (a === 'play') { v.scrollIntoView({ behavior: 'smooth', block: 'center' }); win.LBRT.playVideo(v); }
      });
      vb.appendChild(row);
    });
    if (!vb.children.length) vb.innerHTML = '<p class="hint">No video on this page. Add one with <b>Add elements → Video</b>.</p>';
  }
  function renderMaps() {
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
    if (!mb.children.length) mb.innerHTML = '<p class="hint">No map on this page. Add the <b>Contact + map</b> section.</p>';
  }

  /* colours + theme */
  function pageColors() { var t = pages[cur] && pages[cur].tpl ? LB.get(pages[cur].tpl) : tpl; return (t && t.colors) || tpl.colors; }
  function renderColors() {
    var box = $('#colorList'); box.innerHTML = '';
    pageColors().forEach(function (c) {
      var cur2 = (doc && doc.documentElement.style.getPropertyValue(c.v).trim()) || c.d;
      if (!/^#[0-9a-f]{6}$/i.test(cur2)) cur2 = c.d;
      var row = document.createElement('div'); row.className = 'crow';
      row.innerHTML = '<input type="color" value="' + cur2 + '"><span>' + esc(c.l) + '</span><code>' + c.v + '</code>';
      row.querySelector('input').addEventListener('input', function (e) { doc.documentElement.style.setProperty(c.v, e.target.value); queueSave(); });
      box.appendChild(row);
    });
  }
  $('#colorReset').onclick = function () {
    pageColors().forEach(function (c) { doc.documentElement.style.removeProperty(c.v); });
    if (!doc.documentElement.getAttribute('style')) doc.documentElement.removeAttribute('style');
    var bk = doc.documentElement.getAttribute('data-bk-theme'); if (bk) applyTheme(bk);
    renderColors(); queueSave();
  };
  function renderTheme() {
    var isBlank = doc && doc.documentElement.hasAttribute('data-bk');
    $('#themeBox').style.display = isBlank ? '' : 'none';
    if (!isBlank) return;
    var sel = $('#themeSel'); sel.innerHTML = LB.themes.map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + '</option>'; }).join('');
    sel.value = doc.documentElement.getAttribute('data-bk-theme') || 'clean';
  }
  function applyTheme(idv) {
    var t = LB.theme(idv), root = doc.documentElement;
    Object.keys(t.v).forEach(function (k) { root.style.setProperty(k, t.v[k]); });
    root.style.setProperty('--bk-head', t.head); root.style.setProperty('--bk-body', t.body);
    root.setAttribute('data-bk-theme', t.id);
    var f = doc.getElementById('lb-font'); if (f) f.setAttribute('href', t.font);
  }
  $('#themeSel').onchange = function () { pushHistory(); applyTheme(this.value); renderColors(); queueSave(); };

  /* page info */
  function fillPageInfo() {
    var t = doc.querySelector('title'), d = doc.querySelector('meta[name=description]');
    $('#pgTitle').value = t ? t.textContent : ''; $('#pgDesc').value = d ? d.getAttribute('content') || '' : '';
  }
  $('#pgTitle').addEventListener('input', function () { var t = doc.querySelector('title'); if (!t) { t = doc.createElement('title'); doc.head.appendChild(t); } t.textContent = this.value; queueSave(); });
  $('#pgDesc').addEventListener('input', function () { var d = doc.querySelector('meta[name=description]'); if (!d) { d = doc.createElement('meta'); d.setAttribute('name', 'description'); doc.head.appendChild(d); } d.setAttribute('content', this.value); queueSave(); });

  /* =====================================================================
   * pages tab + menu
   * ===================================================================== */
  function renderPages() {
    var box = $('#pageList'); box.innerHTML = '';
    var sel = $('#pageSel'); sel.innerHTML = pages.map(function (p, i) { return '<option value="' + i + '">' + esc(p.name) + '</option>'; }).join(''); sel.value = cur;
    pages.forEach(function (p, i) {
      var row = document.createElement('div'); row.className = 'row' + (i === cur ? ' act' : '');
      row.innerHTML = '<span class="nm" title="Open this page">' + esc(p.name) + '<span class="sub">' + esc(p.slug) + '.html' + (i === 0 ? ' · home page' : '') + '</span></span>' +
        (i > 0 ? '<button class="mini" data-a="up" title="Move up">↑</button>' : '') + (i > 0 && i < pages.length - 1 ? '<button class="mini" data-a="dn" title="Move down">↓</button>' : '') +
        '<button class="mini" data-a="dup" title="Copy page">⧉</button><button class="mini" data-a="ren" title="Rename">✎</button>' + (pages.length > 1 ? '<button class="mini danger" data-a="del" title="Delete page">✕</button>' : '');
      row.querySelector('.nm').onclick = function () { gotoPage(i); };
      row.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a');
        if (a === 'ren') ask('Rename page', 'The page name is used in the menu and the file name.', p.name, function (v) { if (!v) return; p.name = v; if (i > 0) assignSlug(p); renderPages(); renderMenu(); queueSave(); });
        if (a === 'dup') { save(); var c = newPage(p.name + ' copy', i === cur && doc ? serialize() : p.html, p.tpl); pages.splice(i + 1, 0, c); assignSlug(c); renderPages(); queueSave(); toast('Page copied'); }
        if (a === 'del') ask('Delete page?', '“' + p.name + '” will be removed from this site. This cannot be undone.', '', function () {
          var was = cur; if (i === was) { clearTimeout(dirtyTimer); doc = null; } else save();
          pages.splice(i, 1); pages.forEach(function (q, k) { if (k === 0) q.slug = 'index'; });
          if (i === was) { cur = Math.min(was, pages.length - 1); history = []; loadFrame(pages[cur].html, false); } else { if (i < was) cur = was - 1; renderPages(); }
          try { localStorage.setItem(KEY, JSON.stringify({ v: 2, pages: pages, cur: cur, cfg: cfg })); } catch (e) {}
        }, true);
        if (a === 'up' || a === 'dn') { save(); var j = a === 'up' ? i - 1 : i + 1; if (j < 1 && a === 'up') return; var t = pages[i]; pages[i] = pages[j]; pages[j] = t; if (cur === i) cur = j; else if (cur === j) cur = i; renderPages(); queueSave(); }
      });
      box.appendChild(row);
    });
  }
  $('#pageSel').onchange = function () { gotoPage(+this.value); };
  function gotoPage(i) {
    if (i === cur || !pages[i]) return;
    if (mode === 'edit') detachFrame(); else save();
    cur = i; history = []; $('#undoBtn').disabled = true; activeSec = null; activeNode = null; activeCanvas = null;
    if (mode === 'preview') previewPage(i); else loadFrame(pages[cur].html, false);
    queueSave();
  }
  $('#addPageBtn').onclick = function () {
    var from = $('#npFrom');
    var groups = {}; LB.templates.forEach(function (t) { if (t.id === 'blank') return; (groups[t.category] = groups[t.category] || []).push(t); });
    var names = { education: 'Education', salon: 'Salon · Beauty', realestate: 'Real Estate', clinic: 'Clinic', fitness: 'Fitness' };
    from.innerHTML = '<option value="blank">✦ Blank page (build with sections)</option>' + Object.keys(groups).map(function (k) { return '<optgroup label="' + (names[k] || k) + '">' + groups[k].map(function (t) { return '<option value="' + t.id + '">' + esc(t.name) + ' — ' + esc(t.tagline) + '</option>'; }).join('') + '</optgroup>'; }).join('');
    $('#npName').value = ''; openDlg('dlgPage'); setTimeout(function () { $('#npName').focus(); }, 30);
  };
  $('#npCreate').onclick = function () {
    var name = $('#npName').value.trim() || 'New page', from = $('#npFrom').value, t = LB.get(from); if (!t) return;
    var html = from === 'blank' ? LB.blankHtml(pageTheme()) : t.html;
    detachFrame(); var p = newPage(name, html, from); pages.push(p); assignSlug(p);
    $('#dlgPage').hidden = true; cur = pages.length - 1; history = []; $('#undoBtn').disabled = true; loadFrame(p.html, false); toast('Page “' + name + '” created — find it in the Page menu'); queueSave();
  };
  function pageTheme() { return (doc && doc.documentElement.getAttribute('data-bk-theme')) || 'clean'; }

  function menuNav() { return doc ? doc.querySelector('header nav') : null; }
  function renderMenu() {
    var box = $('#menuList'); box.innerHTML = ''; var nav = menuNav();
    if (!nav) { box.innerHTML = '<p class="hint">This page has no top menu.</p>'; return; }
    $$('a', nav).forEach(function (a) {
      var href = a.getAttribute('href') || '', row = document.createElement('div'); row.className = 'vrow';
      var sel = '<select>' + pages.map(function (p) { return '<option value="' + esc(p.slug) + '.html"' + (href === p.slug + '.html' ? ' selected' : '') + '>Page: ' + esc(p.name) + '</option>'; }).join('') + '<option value="__c"' + (pages.some(function (p) { return href === p.slug + '.html'; }) ? '' : ' selected') + '>Custom link…</option></select>';
      row.innerHTML = '<div class="vt"><input value="' + esc(a.textContent.trim()) + '" style="flex:1"><button class="mini danger" title="Remove">✕</button></div>' + sel + '<input class="cu" placeholder="#about or https://…" value="' + esc(href) + '" style="display:none">';
      var txt = $('input', row), s = $('select', row), cu = $('.cu', row);
      var isCustom = function () { return s.value === '__c'; };
      cu.style.display = isCustom() ? '' : 'none';
      txt.oninput = function () { a.textContent = txt.value; queueSave(); };
      s.onchange = function () { if (isCustom()) { cu.style.display = ''; cu.focus(); } else { cu.style.display = 'none'; a.setAttribute('href', s.value); queueSave(); } };
      cu.oninput = function () { a.setAttribute('href', cu.value); queueSave(); };
      $('button', row).onclick = function () { pushHistory(); a.remove(); afterStructure(); };
      box.appendChild(row);
    });
  }
  $('#menuAdd').onclick = function () {
    var nav = menuNav(); if (!nav) { toast('This page has no top menu.'); return; }
    pushHistory(); var last = $$('a', nav).pop(), a = last ? last.cloneNode(true) : doc.createElement('a');
    a.textContent = 'New link'; a.setAttribute('href', '#'); a.removeAttribute('data-cta'); a.setAttribute('data-e', ''); a.setAttribute('contenteditable', 'true'); nav.appendChild(a); afterStructure();
  };
  $('#menuCopy').onclick = function () {
    var nav = menuNav(); if (!nav) return; save();
    var inner = nav.innerHTML.replace(/ contenteditable="true"| spellcheck="false"/g, '');
    pages.forEach(function (p, i) { if (i === cur) return; var d = parseHtml(p.html), n = d.querySelector('header nav'); if (n) { n.innerHTML = inner; p.html = '<!doctype html>\n' + d.documentElement.outerHTML; } });
    toast('Menu copied to the other pages');
  };

  /* =====================================================================
   * Buttons & Form settings (shared, whole site)
   * ===================================================================== */
  var F = {};
  ['exOn', 'exLabel', 'exOpts', 'barOn', 'barText', 'webUrl', 'gfUrl', 'askEmail', 'enTitle', 'enSub', 'enBtn', 'enThanks', 'waOn', 'waNum', 'waMsg', 'callOn', 'callNum', 'cdOn', 'cdDate', 'headCode']
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
    F.headCode.value = cfg.headCode;
    parseGoogleForm(false); toggleFormBox();
  }
  function toggleFormBox() { $('#formBox').style.display = cfg.enroll.mode === 'form' ? '' : 'none'; $('#exBox').style.display = F.exOn.checked ? '' : 'none'; }
  function syncCfgToFrame() {
    if (win && win.LBRT && doc && mode === 'edit') { var el = doc.getElementById('lb-config'); if (el) el.textContent = JSON.stringify(cfg); win.LBRT.apply(cfg); }
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
    cfg.headCode = F.headCode.value;
  }
  function onField() { readFields(); toggleFormBox(); syncCfgToFrame(); queueSave(); }
  Object.keys(F).forEach(function (k) { if (k !== 'gfUrl') F[k].addEventListener('input', onField); });
  $$('input[name=mode]').forEach(function (r) { r.addEventListener('change', onField); });

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

  /* =====================================================================
   * tabs / mode / device
   * ===================================================================== */
  function switchTab(name) {
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === name); });
    $$('.tabbody').forEach(function (t) { t.classList.toggle('on', t.id === 'tab-' + name); });
    if (name === 'publish') renderWeight();
  }
  $$('#tabs button').forEach(function (b) { b.onclick = function () { switchTab(b.getAttribute('data-tab')); }; });
  $$('#devSeg button').forEach(function (b) {
    b.onclick = function () {
      $$('#devSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#deviceFrame').classList.toggle('mobile', b.getAttribute('data-dev') === 'mobile');
    };
  });

  /* preview: shows the real published page; links between pages work */
  function previewPage(i) {
    var d = publishDoc(pageHtmlNow(i));
    frame.onload = function () { win = frame.contentWindow; doc = frame.contentDocument; bindPreview(); };
    frame.srcdoc = LB.buildDoc('<!doctype html>\n' + d.documentElement.outerHTML, { edit: false, cfg: cfg });
    $('#pageSel').value = i;
  }
  function bindPreview() {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a'); if (!a) return;
      var href = a.getAttribute('href') || '', m = /^([a-z0-9-]+)\.html(#.*)?$/i.exec(href);
      if (!m) return;
      var idx = -1; pages.forEach(function (p, k) { if (p.slug === m[1]) idx = k; });
      if (idx < 0) return;
      e.preventDefault(); cur = idx; previewPage(idx);
      frame.addEventListener('load', function once() { frame.removeEventListener('load', once); if (m[2]) { var t = frame.contentDocument.querySelector(m[2]); if (t) t.scrollIntoView(); } });
    });
  }
  $$('#modeSeg button').forEach(function (b) {
    b.onclick = function () {
      var m = b.getAttribute('data-mode'); if (m === mode) return;
      $$('#modeSeg button').forEach(function (x) { x.classList.toggle('on', x === b); });
      if (m === 'preview') { save(); mode = 'preview'; clearTimeout(dirtyTimer); previewPage(cur); toast('Preview — this is how visitors see it. Buttons, videos and page links work.'); }
      else { mode = 'edit'; loadFrame(pages[cur].html, true); }
    };
  });

  /* =====================================================================
   * page weight report
   * ===================================================================== */
  function renderWeight() {
    var box = $('#weightBox'); if (!box || !doc || mode !== 'edit') return;
    if (!$('#tab-publish').classList.contains('on')) return;
    var imgs = [], total = 0;
    $$('img', doc).forEach(function (im) {
      var s = im.getAttribute('src') || ''; if (s.indexOf('data:') !== 0 || s.indexOf('data:image/svg') === 0) return;
      var b = dataBytes(s); total += b; imgs.push({ n: im.getAttribute('data-label') || im.getAttribute('data-img') || 'image', b: b });
    });
    var htmlBytes = pageHtmlNowLength();
    var all = total + htmlBytes, cls = all < 1048576 ? 'ok' : all < 1572864 ? 'warn' : 'bad';
    imgs.sort(function (a, b) { return b.b - a.b; });
    box.innerHTML = 'This page: <b class="' + cls + '">' + fmtKB(all) + '</b> (page code ' + fmtKB(htmlBytes) + ' + your images ' + fmtKB(total) + ')<br>' +
      (cls === 'ok' ? '✓ Light and fast.' : cls === 'warn' ? '⚠ A bit heavy. Replace big images with lighter ones.' : '✗ Too heavy for mobile data. Remove or replace the largest images.') +
      (imgs.length ? '<table>' + imgs.slice(0, 5).map(function (x) { return '<tr><td>' + esc(x.n) + '</td><td>' + fmtKB(x.b) + '</td></tr>'; }).join('') + '</table>' : '');
  }
  function pageHtmlNowLength() {
    try {
      var len = doc.documentElement.outerHTML.length;
      $$('img', doc).forEach(function (im) { var s = im.getAttribute('src') || ''; if (s.indexOf('data:') === 0) len -= s.length; });
      return Math.round(len * 0.6);
    } catch (e) { return 0; }
  }
  $('#weightRefresh').onclick = renderWeight;

  /* =====================================================================
   * export (all pages, optimised)
   * ===================================================================== */
  var EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif', 'image/avif': 'avif' };
  var STRIP = ['data-e', 'data-label', 'data-fixed', 'data-list', 'data-section', 'data-img', 'data-fixed-row', 'data-canvas', 'data-cv', 'data-html', 'data-bk-theme', 'contenteditable', 'spellcheck'];

  function optimisePage(d, ctx) {
    /* images: move data-URIs to files, lazy-load below the fold */
    var imgs = $$('img', d), eagerLimit = 0;
    imgs.forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (src.indexOf('data:') === 0) {
        if (ctx.seen[src]) img.setAttribute('src', ctx.seen[src]);
        else {
          var mime = (/^data:([^;,]+)/.exec(src) || [])[1] || 'image/png';
          var name = 'assets/' + (img.getAttribute('data-img') || 'image').replace(/[^\w-]/g, '').slice(0, 24) + '-' + (++ctx.n) + '.' + (EXT[mime] || 'png');
          ctx.seen[src] = name; img.setAttribute('src', name);
          ctx.jobs.push(fetch(src).then(function (r) { return r.blob(); }).then(function (b) { ctx.zip.file(name, b); ctx.imgBytes += b.size; }));
        }
      }
    });
    var firstSecs = $$('main > section, body > section', d).slice(0, 2);
    var heroSeen = false;
    imgs.forEach(function (img) {
      var inHead = !!img.closest('header'), inFirst = firstSecs.some(function (s) { return s.contains(img); });
      if (inHead || inFirst) { img.setAttribute('loading', 'eager'); if (!heroSeen && !inHead) { img.setAttribute('fetchpriority', 'high'); heroSeen = true; } }
      else img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('alt')) img.setAttribute('alt', '');
    });
    /* strip editor attributes + comments */
    $$('*', d).forEach(function (n) { STRIP.forEach(function (a) { if (n.hasAttribute(a)) n.removeAttribute(a); }); });
    var walker = d.createTreeWalker(d.documentElement, NodeFilter.SHOW_COMMENT), cm = [], c;
    while ((c = walker.nextNode())) cm.push(c); cm.forEach(function (x) { x.remove(); });
    /* tracking code + script */
    var out = '<!doctype html>\n' + d.documentElement.outerHTML;
    out = out.replace(/>\s*\n\s*</g, '><').replace(/<style id="lb-blocks-css">\s+/, '<style id="lb-blocks-css">');
    if (cfg.headCode.trim()) out = out.replace('</head>', function () { return cfg.headCode + '\n</head>'; });
    out = out.replace('</body>', function () { return '<script src="lb.js" defer></script></body>'; });
    return out;
  }

  function exportZip() {
    if (mode === 'edit') save();
    var zip = new JSZip(), ctx = { zip: zip, seen: {}, n: 0, jobs: [], imgBytes: 0 }, files = [];
    pages.forEach(function (p, i) {
      var d = publishDoc(i === cur && mode === 'edit' && doc ? serialize() : p.html);
      files.push({ name: p.slug + '.html', html: optimisePage(d, ctx), page: p });
    });
    return Promise.all(ctx.jobs).then(function () {
      var htmlBytes = 0;
      files.forEach(function (f) { zip.file(f.name, f.html); htmlBytes += f.html.length; });
      zip.file('lb.js', '(' + window.LB_RUNTIME.toString() + ')();');
      zip.file('README.txt', 'Your website\n============\n\nPages: ' + files.map(function (f) { return f.name; }).join(', ') + '\n\n1. Keep every .html file, lb.js and the assets folder together.\n2. Drag & drop this whole folder on Netlify Drop (app.netlify.com/drop), Cloudflare Pages, or upload it to any hosting.\n3. To test locally, double-click index.html.\n');
      return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then(function (blob) {
        var a = document.createElement('a');
        var t0 = parseHtml(files[0].html).querySelector('title'), name = slugify((t0 && t0.textContent) || tpl.name || 'website') || 'website';
        a.href = URL.createObjectURL(blob); a.download = name + '.zip'; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        var per = Math.round((htmlBytes / files.length + ctx.imgBytes / files.length) / 1024);
        toast('ZIP downloaded ✓ · ' + files.length + ' page' + (files.length > 1 ? 's' : '') + ' · about ' + fmtKB(htmlBytes / files.length * 0.9 + ctx.imgBytes / files.length) + ' per page. Upload the folder to any host (e.g. Netlify Drop).', 7000);
        return { files: files.map(function (f) { return f.name; }), html: htmlBytes, images: ctx.imgBytes };
      });
    });
  }
  $('#dlBtn').onclick = $('#dlBtn2').onclick = function () { exportZip().catch(function (e) { toast('Export failed: ' + e.message, 6000); }); };

  $('#resetBtn').onclick = function () {
    ask('Start over?', 'This removes ALL pages and changes of this project and starts fresh.', '', function () {
      try { localStorage.removeItem(KEY); } catch (e) {} location.reload();
    }, true);
  };
  window.addEventListener('beforeunload', function () { if (mode === 'edit') save(); });

  /* =====================================================================
   * go
   * ===================================================================== */
  load();
  fillFields();
  buildPalette();
  loadFrame(pages[cur].html, false);
  window.__lb = { serialize: serialize, exportZip: exportZip, cfg: function () { return cfg; }, frame: frame, pages: function () { return pages; }, imageSpec: imageSpec, processFile: processFile };
})();
