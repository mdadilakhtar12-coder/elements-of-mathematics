/* Shared helpers: template registry, placeholder art, document builder. */
(function () {
  var LB = (window.LB = window.LB || {});
  LB.templates = [];
  LB.categories = [
    { id: 'education', name: 'Education & Coaching', icon: '🎓', live: true },
    { id: 'salon', name: 'Salon · Beauty · Spa', icon: '💇', live: false },
    { id: 'realestate', name: 'Real Estate', icon: '🏠', live: false },
    { id: 'clinic', name: 'Health · Clinic · Dental', icon: '🩺', live: false },
    { id: 'fitness', name: 'Fitness · Gym · Yoga', icon: '💪', live: false }
  ];
  LB.register = function (t) { LB.templates.push(t); };
  LB.get = function (id) { return LB.templates.filter(function (t) { return t.id === id; })[0]; };

  LB.defaultCfg = function () {
    return {
      whatsapp: { on: true, number: '', message: 'Hi! I want to know more about the course.' },
      call: { on: true, number: '' },
      enroll: {
        mode: 'form', webinarUrl: '', formUrl: '', actionUrl: '',
        entryName: '', entryPhone: '', entryEmail: '', askEmail: true,
        title: 'Reserve your free seat',
        sub: 'Fill in your details and we will take you straight to the session.',
        button: 'Confirm my seat', thanks: 'You are registered!'
      },
      countdown: { on: true, date: '' },
      headCode: '', title: '', description: ''
    };
  };

  /* ---------- placeholder art (SVG data URIs) ---------- */
  function uri(svg) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }
  function grad(c1, c2) {
    return '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>';
  }
  LB.ph = {
    person: function (c1, c2) {
      return uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480">' + grad(c1, c2) +
        '<rect width="400" height="480" fill="url(#g)"/><circle cx="340" cy="80" r="130" fill="#fff" opacity=".09"/><circle cx="40" cy="430" r="110" fill="#fff" opacity=".07"/>' +
        '<circle cx="200" cy="185" r="78" fill="#fff" opacity=".88"/><path d="M36 480c0-112 72-192 164-192s164 80 164 192z" fill="#fff" opacity=".88"/></svg>');
    },
    avatar: function (c1, c2) {
      return uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' + grad(c1, c2) +
        '<rect width="120" height="120" fill="url(#g)"/><circle cx="60" cy="46" r="21" fill="#fff" opacity=".9"/><path d="M18 120c0-34 18-54 42-54s42 20 42 54z" fill="#fff" opacity=".9"/></svg>');
    },
    photo: function (c1, c2, w, h) {
      w = w || 800; h = h || 600;
      var cx = w / 2, cy = h / 2, s = Math.min(w, h) / 600;
      return uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' + grad(c1, c2) +
        '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/>' +
        '<circle cx="' + w * 0.85 + '" cy="' + h * 0.12 + '" r="' + 170 * s + '" fill="#fff" opacity=".08"/>' +
        '<circle cx="' + w * 0.1 + '" cy="' + h * 0.95 + '" r="' + 150 * s + '" fill="#fff" opacity=".07"/>' +
        '<g transform="translate(' + (cx - 70 * s) + ' ' + (cy - 55 * s) + ') scale(' + s + ')" fill="#fff" opacity=".85">' +
        '<rect x="0" y="0" width="140" height="110" rx="14" fill="none" stroke="#fff" stroke-width="9"/><circle cx="42" cy="38" r="12"/><path d="M12 98l38-38 24 24 18-18 38 38z"/></g></svg>');
    },
    logo: function (c1, c2, letter) {
      letter = letter || 'A';
      return uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' + grad(c1, c2) +
        '<rect width="96" height="96" rx="24" fill="url(#g)"/><text x="48" y="65" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="52" fill="#fff">' + letter + '</text></svg>');
    }
  };

  /* ---------- build a full HTML document ready for an iframe ---------- */
  LB.buildDoc = function (html, opts) {
    opts = opts || {};
    if (html.indexOf('id="lb-config"') < 0) {
      var cfgTag = '<script id="lb-config" type="application/json">' + JSON.stringify(opts.cfg || {}).replace(/</g, '\\u003c') + '</script>';
      html = html.replace('</body>', function () { return cfgTag + '</body>'; });
    }
    var inject = '<script>window.__LB_EDIT__=' + (opts.edit ? 'true' : 'false') + ';</script>' +
      '<script id="lb-runtime">(' + window.LB_RUNTIME.toString() + ')();</script>';
    return html.replace('</body>', function () { return inject + '</body>'; });
  };
})();
