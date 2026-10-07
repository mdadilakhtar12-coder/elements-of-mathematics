/* PageCraft building blocks: sections, elements, themes and the blank-page template.
 * Blocks are self-contained (all classes start with bk-) so they can be added to
 * a blank page OR to any ready-made template page. */
(function () {
  var LB = window.LB, P = LB.ph;
  var A = '#6366f1', B = '#312e81';

  /* ---------- themes (blank pages) ---------- */
  var GF = 'https://fonts.googleapis.com/css2?family=';
  LB.themes = [
    { id: 'clean', name: 'Clean light', head: "'Plus Jakarta Sans',system-ui,sans-serif", body: "'Plus Jakarta Sans',system-ui,sans-serif", font: GF + 'Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
      v: { '--accent': '#4f46e5', '--accent2': '#06b6d4', '--bk-bg': '#ffffff', '--bk-ink': '#12141c', '--bk-mut': '#5f6678', '--bk-line': '#e4e7ef', '--bk-alt': '#f5f6fa', '--accent-ink': '#ffffff' } },
    { id: 'midnight', name: 'Midnight dark', head: "'Sora',system-ui,sans-serif", body: "'Plus Jakarta Sans',system-ui,sans-serif", font: GF + 'Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap',
      v: { '--accent': '#8b5cf6', '--accent2': '#22d3ee', '--bk-bg': '#0b0d1a', '--bk-ink': '#f3f4fb', '--bk-mut': '#a6abc4', '--bk-line': 'rgba(255,255,255,.14)', '--bk-alt': '#12152a', '--accent-ink': '#ffffff' } },
    { id: 'warm', name: 'Warm serif', head: "'Playfair Display',Georgia,serif", body: "'DM Sans',system-ui,sans-serif", font: GF + 'Playfair+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap',
      v: { '--accent': '#b4532a', '--accent2': '#d9a441', '--bk-bg': '#fbf6ee', '--bk-ink': '#2d2018', '--bk-mut': '#7a6a5e', '--bk-line': '#e8dccb', '--bk-alt': '#f3e9d9', '--accent-ink': '#ffffff' } },
    { id: 'fresh', name: 'Fresh green', head: "'Urbanist',system-ui,sans-serif", body: "'Urbanist',system-ui,sans-serif", font: GF + 'Urbanist:wght@400;500;600;700;800&display=swap',
      v: { '--accent': '#16a34a', '--accent2': '#fbbf24', '--bk-bg': '#ffffff', '--bk-ink': '#10231a', '--bk-mut': '#58705f', '--bk-line': '#d9ecdf', '--bk-alt': '#f2fbf5', '--accent-ink': '#ffffff' } },
    { id: 'bold', name: 'Bold orange', head: "'Archivo Black',Impact,sans-serif", body: "'Archivo',system-ui,sans-serif", font: GF + 'Archivo+Black&family=Archivo:wght@400;500;600;700&display=swap',
      v: { '--accent': '#ff4d00', '--accent2': '#111111', '--bk-bg': '#ffffff', '--bk-ink': '#111111', '--bk-mut': '#5f5f5f', '--bk-line': '#e5e5e0', '--bk-alt': '#f6f5ef', '--accent-ink': '#ffffff' } },
    { id: 'rose', name: 'Soft rose', head: "'Fraunces',Georgia,serif", body: "'Work Sans',system-ui,sans-serif", font: GF + 'Fraunces:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap',
      v: { '--accent': '#d6336c', '--accent2': '#f59f00', '--bk-bg': '#fff8f9', '--bk-ink': '#3a1f2b', '--bk-mut': '#8a6a76', '--bk-line': '#f4d9e0', '--bk-alt': '#fdeef2', '--accent-ink': '#ffffff' } }
  ];
  LB.theme = function (id) { return LB.themes.filter(function (t) { return t.id === id; })[0] || LB.themes[0]; };

  /* ---------- block stylesheet ---------- */
  LB.blocksCss =
    '.bk,.bk-hdr,.bk-ftr{--b-bg:var(--bk-bg,#fff);--b-ink:var(--bk-ink,#12141c);--b-mut:var(--bk-mut,#5f6678);--b-line:var(--bk-line,#e4e7ef);--b-card:var(--bk-alt,#f5f6fa);--b-acc:var(--accent,#4f46e5);--b-acc2:var(--accent2,#06b6d4);--b-ink2:var(--accent-ink,#fff)}' +
    '.bk{background:var(--b-bg);color:var(--b-ink);padding:clamp(44px,7vw,88px) 0;font-family:var(--bk-body,inherit);line-height:1.6;text-align:left;font-size:17px}' +
    '.bk.alt{background:var(--bk-alt,#f5f6fa)}.bk.dark{--b-bg:#0f1226;--b-ink:#f3f4fb;--b-mut:#a6abc4;--b-line:rgba(255,255,255,.16);--b-card:rgba(255,255,255,.07);background:#0f1226}' +
    '.bk *{box-sizing:border-box}.bk img{max-width:100%;display:block}.bk a{color:inherit}' +
    '.bk-w{width:min(1140px,100% - 40px);margin:0 auto}.bk-c{text-align:center}.bk-c .bk-p{margin-inline:auto}.bk-c .bk-row{justify-content:center}' +
    '.bk-eye{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--b-acc);margin:0 0 12px}' +
    '.bk-h1,.bk-h2,.bk-h3{font-family:var(--bk-head,inherit);color:inherit;margin:0;line-height:1.1;letter-spacing:-.02em;font-weight:700}' +
    '.bk-h1{font-size:clamp(34px,5.6vw,66px);margin-bottom:18px}.bk-h2{font-size:clamp(28px,4vw,46px);margin-bottom:14px}.bk-h3{font-size:21px;margin-bottom:6px}' +
    '.bk-p{margin:0 0 16px;color:var(--b-mut);font-size:18px;max-width:62ch}.bk-hero .bk-p{font-size:19px}' +
    '.bk-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:.85em 1.6em;border-radius:12px;background:var(--b-acc);color:var(--b-ink2);font-weight:600;font-size:16px;border:2px solid var(--b-acc);cursor:pointer;text-decoration:none!important;line-height:1.2;transition:transform .15s,box-shadow .15s}' +
    '.bk-btn:hover{transform:translateY(-2px);box-shadow:0 12px 24px -12px var(--b-acc)}.bk-btn.o{background:transparent;color:var(--b-acc)}.bk-btn.d{background:var(--b-ink);color:var(--b-bg);border-color:var(--b-ink)}' +
    '.bk-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}' +
    '.bk-g{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))}.bk-g.w{grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr))}' +
    '.bk-card{background:var(--b-card);border:1px solid var(--b-line);border-radius:18px;padding:26px}.bk-card .bk-p{margin:0;font-size:16px}.bk-ic{font-size:30px;display:block;margin-bottom:10px}' +
    '.bk-head{max-width:680px;margin:0 auto 40px;text-align:center}.bk-head .bk-p{margin-inline:auto}' +
    '.bk-split{display:grid;gap:clamp(28px,5vw,64px);grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));align-items:center}' +
    '.bk-imgbox{border-radius:20px;overflow:hidden;background:var(--b-card);aspect-ratio:4/3}.bk-imgbox img{width:100%;height:100%;object-fit:cover}' +
    '.bk-stat{text-align:center;padding:10px}.bk-stat b{display:block;font-family:var(--bk-head,inherit);font-size:clamp(32px,4.6vw,52px);color:var(--b-acc);line-height:1.1}.bk-stat span{color:var(--b-mut);font-size:15px}' +
    '.bk-price{display:flex;flex-direction:column;gap:6px;position:relative}.bk-price .pr{font-family:var(--bk-head,inherit);font-size:44px;font-weight:700;line-height:1.1}.bk-price ul{list-style:none;margin:10px 0 18px;padding:0;display:grid;gap:8px;color:var(--b-mut);font-size:16px}.bk-price li::before{content:"✓";color:var(--b-acc);font-weight:800;margin-right:10px}' +
    '.bk-price.hot{border-color:var(--b-acc);box-shadow:0 24px 50px -30px var(--b-acc)}.bk-price .bk-btn{margin-top:auto}' +
    '.bk-step{position:relative;padding-top:6px}.bk-step i{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--b-acc);color:var(--b-ink2);font-style:normal;font-weight:700;margin-bottom:12px}' +
    '.bk-gal{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}.bk-gal div{border-radius:16px;overflow:hidden;aspect-ratio:1/1;background:var(--b-card)}.bk-gal img{width:100%;height:100%;object-fit:cover}' +
    '.bk-vidbox{border-radius:20px;overflow:hidden;max-width:920px;margin:0 auto;box-shadow:0 30px 60px -30px rgba(0,0,0,.5);background:#000}' +
    '.bk-quote{margin:0}.bk-quote q{display:block;font-size:18px;margin-bottom:16px;quotes:none}.bk-quote .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.bk-who{display:flex;gap:12px;align-items:center}.bk-who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.bk-who b{display:block;font-size:15px}.bk-who small{color:var(--b-mut)}' +
    '.bk-faq{max-width:800px;margin:0 auto;display:grid;gap:12px}.bk-acc{border:1px solid var(--b-line);border-radius:14px;background:var(--b-card)}.bk-acc-h{display:flex;justify-content:space-between;gap:14px;padding:18px 22px;font-weight:600;font-size:18px;cursor:pointer}.bk-acc-h::after{content:"+";color:var(--b-acc);font-size:24px;line-height:1;transition:transform .25s}.bk-acc.open .bk-acc-h::after{transform:rotate(45deg)}.bk-acc-b{display:none;padding:0 22px 20px;color:var(--b-mut)}.bk-acc.open .bk-acc-b{display:block}' +
    '.bk-cta{border-radius:26px;padding:clamp(34px,6vw,70px) 24px;text-align:center;background:linear-gradient(130deg,var(--b-acc),var(--b-acc2));color:var(--b-ink2)}.bk-cta .bk-h2,.bk-cta .bk-p{color:inherit;margin-inline:auto}.bk-cta .bk-btn{background:#fff;color:#111;border-color:#fff}.bk-cta .bk-row{justify-content:center}' +
    '.bk-map{min-height:340px;border-radius:20px;overflow:hidden;border:1px solid var(--b-line)}' +
    '.bk-ba{aspect-ratio:16/10;border-radius:20px;border:1px solid var(--b-line);max-width:860px;margin:0 auto}.bk-ba .lbl{position:absolute;top:14px;z-index:2;background:rgba(0,0,0,.65);color:#fff;padding:4px 14px;border-radius:99px;font-size:13px;font-weight:600}.bk-ba .lbl.l{left:14px}.bk-ba .lbl.r{right:14px}' +
    '.bk-cd{display:flex;gap:12px;justify-content:center;margin:18px 0}.bk-cd div{min-width:78px;padding:12px 8px;text-align:center;background:var(--b-card);border:1px solid var(--b-line);border-radius:14px}.bk-cd b{display:block;font-family:var(--bk-head,inherit);font-size:32px;line-height:1}.bk-cd span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--b-mut)}' +
    '.bk-logos{display:flex;gap:14px 40px;justify-content:center;flex-wrap:wrap;font-family:var(--bk-head,inherit);font-weight:700;font-size:22px;color:var(--b-mut);opacity:.8}' +
    '.bk-team{text-align:center}.bk-team .p{width:150px;height:150px;border-radius:50%;overflow:hidden;margin:0 auto 14px;background:var(--b-card)}.bk-team .p img{width:100%;height:100%;object-fit:cover}.bk-team small{color:var(--b-acc);font-weight:600}' +
    '.bk-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}.bk-list li::before{content:"✓";color:var(--b-acc);font-weight:800;margin-right:10px}' +
    '.bk-contact b{display:block;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--b-acc);margin-top:14px}.bk-contact span{font-size:18px}' +
    '.bk-el{margin:16px auto;max-width:100%;color:var(--bk-ink,inherit)}.bk-sp{height:40px}.bk-hr{border:0;border-top:1px solid var(--b-line,#e4e7ef);margin:0}' +
    '.bk-hdr{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bk-bg,#fff) 92%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--bk-line,#e4e7ef);color:var(--bk-ink,#12141c);font-family:var(--bk-body,inherit)}' +
    '.bk-nav{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;min-height:72px;flex-wrap:wrap;padding-block:8px}.bk-brand{display:flex;align-items:center;gap:10px;font-family:var(--bk-head,inherit);font-weight:800;font-size:22px;text-decoration:none;color:inherit}.bk-brand img{width:38px;height:38px;border-radius:10px;object-fit:cover}' +
    '.bk-menu{display:flex;gap:6px 22px;flex-wrap:wrap;font-weight:600;font-size:15.5px;color:var(--bk-mut,#5f6678)}.bk-menu a{text-decoration:none;color:inherit}.bk-menu a:hover{color:var(--accent,#4f46e5)}.bk-hdr .bk-btn{padding:.6em 1.2em;font-size:15px}' +
    '@media(max-width:720px){.bk-menu{order:3;width:100%;overflow-x:auto;flex-wrap:nowrap;white-space:nowrap;padding-bottom:4px}}' +
    '.bk-ftr{padding:30px 0;border-top:1px solid var(--bk-line,#e4e7ef);color:var(--bk-mut,#5f6678);font-size:14.5px;background:var(--bk-bg,#fff);font-family:var(--bk-body,inherit)}.bk-ftr a{color:inherit;text-decoration:none}.bk-ftr .bk-w{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}' +
    /* free canvas */
    '.bk-cv-sec{padding:0;background:transparent}.bk-cv{position:relative;container-type:inline-size;width:100%;aspect-ratio:var(--ar,16/9);overflow:hidden;background:#1b1f3a}' +
    '.bk-cv-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.bk-cv-i{position:absolute;font-size:calc(var(--fs,3)*1cqw);line-height:1.15;color:#fff}.bk-cv-i .bk-btn{font-size:1em;padding:.55em 1.2em;border-radius:.4em;white-space:nowrap}' +
    '.bk-cv-t{font-family:var(--bk-head,inherit);font-weight:700;letter-spacing:-.01em;text-shadow:0 2px 14px rgba(0,0,0,.35)}.bk-cv-img{width:100%;height:auto;border-radius:.3em}' +
    '@media(max-width:700px){.bk-cv{aspect-ratio:var(--arm,4/5)}}' +
    '@container (max-width:700px){.bk-cv-i{font-size:calc(var(--fsm,calc(var(--fs,3)*1.7))*1cqw)}}';

  /* ---------- helpers for block markup ---------- */
  function img(key, label, src) { return '<img data-img="' + key + '-{{k}}" data-label="' + label + '" src="' + src + '" alt="">'; }
  var PH = function (w, h, a, b) { return P.photo(a || A, b || B, w, h); };

  /* ---------- blocks ---------- */
  LB.blocks = [
    { id: 'hero', name: 'Hero (centered)', icon: '🚀', desc: 'Big headline, text and two buttons',
      html: '<section class="bk bk-hero bk-c" data-section="Hero"><div class="bk-w"><span class="bk-eye" data-e>Welcome</span><h1 class="bk-h1" data-e>A headline that makes people say yes</h1><p class="bk-p" data-e>Explain what you offer and why it matters in one or two clear sentences.</p><div class="bk-row"><a class="bk-btn" data-cta="enroll" data-e>Get Started</a><a class="bk-btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div></div></section>' },
    { id: 'hero-split', name: 'Hero with image', icon: '🖼️', desc: 'Text on the left, picture on the right',
      html: '<section class="bk bk-hero" data-section="Hero with image"><div class="bk-w bk-split"><div><span class="bk-eye" data-e>Welcome</span><h1 class="bk-h1" data-e>Your main promise in one line</h1><p class="bk-p" data-e>Describe your offer, who it is for and the result they get.</p><div class="bk-row"><a class="bk-btn" data-cta="enroll" data-e>Get Started</a><a class="bk-btn o" data-cta="call" data-e>📞 Call us</a></div></div><div class="bk-imgbox">' + img('hero', 'Hero image', PH(1000, 800)) + '</div></div></section>' },
    { id: 'features', name: 'Features (cards)', icon: '✨', desc: 'Six cards with icon, title and text',
      html: '<section class="bk alt" data-section="Features"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Why us</span><h2 class="bk-h2" data-e>Everything you need</h2><p class="bk-p" data-e>A short line that introduces the points below.</p></div><div class="bk-g" data-list>' +
        ['⚡|Fast results|Explain this benefit in a sentence.', '🛡️|Trusted|Explain this benefit in a sentence.', '💬|Support|Explain this benefit in a sentence.', '🎯|Focused|Explain this benefit in a sentence.', '💰|Fair price|Explain this benefit in a sentence.', '🌟|Quality|Explain this benefit in a sentence.'].map(function (s) { var p = s.split('|'); return '<div class="bk-card"><span class="bk-ic">' + p[0] + '</span><h3 class="bk-h3" data-e>' + p[1] + '</h3><p class="bk-p" data-e>' + p[2] + '</p></div>'; }).join('') + '</div></div></section>' },
    { id: 'about', name: 'About (image + text)', icon: '👋', desc: 'Picture, story and a checklist',
      html: '<section class="bk" data-section="About"><div class="bk-w bk-split"><div class="bk-imgbox">' + img('about', 'About image', PH(900, 700)) + '</div><div><span class="bk-eye" data-e>About us</span><h2 class="bk-h2" data-e>Our story in a few lines</h2><p class="bk-p" data-e>Tell visitors who you are, what you believe and why customers choose you.</p><ul class="bk-list" data-list><li data-e>First strong point</li><li data-e>Second strong point</li><li data-e>Third strong point</li></ul></div></div></section>' },
    { id: 'stats', name: 'Numbers strip', icon: '🔢', desc: 'Four big numbers that build trust',
      html: '<section class="bk alt" data-section="Numbers"><div class="bk-w"><div class="bk-g" data-list><div class="bk-stat"><b data-e>5,000+</b><span data-e>Happy customers</span></div><div class="bk-stat"><b data-e>10 yrs</b><span data-e>Experience</span></div><div class="bk-stat"><b data-e>4.9★</b><span data-e>Average rating</span></div><div class="bk-stat"><b data-e>24×7</b><span data-e>Support</span></div></div></div></section>' },
    { id: 'pricing', name: 'Pricing (3 plans)', icon: '💳', desc: 'Three plan cards with buttons',
      html: '<section class="bk" data-section="Pricing"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Pricing</span><h2 class="bk-h2" data-e>Simple, clear pricing</h2></div><div class="bk-g" data-list>' +
        '<div class="bk-card bk-price"><h3 class="bk-h3" data-e>Basic</h3><div class="pr" data-e>₹999</div><ul data-list><li data-e>Feature one</li><li data-e>Feature two</li></ul><a class="bk-btn o" data-cta="enroll" data-e>Choose</a></div>' +
        '<div class="bk-card bk-price hot"><h3 class="bk-h3" data-e>Standard</h3><div class="pr" data-e>₹2,499</div><ul data-list><li data-e>Everything in Basic</li><li data-e>Feature three</li><li data-e>Feature four</li></ul><a class="bk-btn" data-cta="enroll" data-e>Choose</a></div>' +
        '<div class="bk-card bk-price"><h3 class="bk-h3" data-e>Premium</h3><div class="pr" data-e>₹4,999</div><ul data-list><li data-e>Everything in Standard</li><li data-e>Priority support</li></ul><a class="bk-btn o" data-cta="enroll" data-e>Choose</a></div></div></div></section>' },
    { id: 'steps', name: 'How it works (steps)', icon: '🪜', desc: 'Four numbered steps',
      html: '<section class="bk alt" data-section="How it works"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Process</span><h2 class="bk-h2" data-e>How it works</h2></div><div class="bk-g" data-list>' +
        [1, 2, 3, 4].map(function (n) { return '<div class="bk-step"><i>' + n + '</i><h3 class="bk-h3" data-e>Step ' + n + '</h3><p class="bk-p" data-e>Describe what happens in this step.</p></div>'; }).join('') + '</div></div></section>' },
    { id: 'gallery', name: 'Photo gallery', icon: '📷', desc: 'Grid of six photos',
      html: '<section class="bk" data-section="Gallery"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Gallery</span><h2 class="bk-h2" data-e>Our work</h2></div><div class="bk-gal" data-list>' +
        [['#6366f1', '#312e81'], ['#06b6d4', '#155e75'], ['#f59e0b', '#92400e'], ['#ec4899', '#831843'], ['#10b981', '#065f46'], ['#8b5cf6', '#4c1d95']].map(function (c, i) { return '<div>' + img('g' + (i + 1), 'Gallery photo ' + (i + 1), P.photo(c[0], c[1], 700, 700)) + '</div>'; }).join('') + '</div></div></section>' },
    { id: 'video', name: 'Video', icon: '🎬', desc: 'Large YouTube video with title',
      html: '<section class="bk dark" data-section="Video"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Watch</span><h2 class="bk-h2" data-e>See it in action</h2></div><div class="bk-vidbox"><div data-video data-label="Video" data-url=""></div></div></div></section>' },
    { id: 'reviews', name: 'Testimonials', icon: '⭐', desc: 'Three customer reviews',
      html: '<section class="bk alt" data-section="Reviews"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Reviews</span><h2 class="bk-h2" data-e>What customers say</h2></div><div class="bk-g" data-list>' +
        [['Asha Verma', 'Customer'], ['Rohit Shah', 'Customer'], ['Neha Rao', 'Customer']].map(function (p, i) { return '<figure class="bk-card bk-quote"><div class="st">★★★★★</div><q data-e>Write a real customer quote here. Keep it short and specific.</q><div class="bk-who">' + img('u' + (i + 1), 'Customer photo ' + (i + 1), P.avatar(A, B)) + '<span><b data-e>' + p[0] + '</b><small data-e>' + p[1] + '</small></span></div></figure>'; }).join('') + '</div></div></section>' },
    { id: 'team', name: 'Team / people', icon: '🧑‍🤝‍🧑', desc: 'Three people with photo and role',
      html: '<section class="bk" data-section="Team"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Team</span><h2 class="bk-h2" data-e>Meet the team</h2></div><div class="bk-g" data-list>' +
        ['Name One|Role', 'Name Two|Role', 'Name Three|Role'].map(function (s, i) { var p = s.split('|'); return '<div class="bk-team"><div class="p">' + img('t' + (i + 1), 'Person ' + (i + 1), P.person(A, B)) + '</div><h3 class="bk-h3" data-e>' + p[0] + '</h3><small data-e>' + p[1] + '</small></div>'; }).join('') + '</div></div></section>' },
    { id: 'faq', name: 'FAQ (questions)', icon: '❓', desc: 'Click-to-open questions and answers',
      html: '<section class="bk" data-section="FAQ"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>FAQ</span><h2 class="bk-h2" data-e>Common questions</h2></div><div class="bk-faq" data-list>' +
        [1, 2, 3, 4].map(function (n) { return '<div class="bk-acc" data-acc' + (n === 1 ? ' data-acc-open' : '') + '><div class="bk-acc-h" data-acc-head data-e>Question number ' + n + '?</div><div class="bk-acc-b" data-acc-body data-e>Write a clear, short answer here.</div></div>'; }).join('') + '</div></div></section>' },
    { id: 'cta', name: 'Call-to-action banner', icon: '📣', desc: 'Colourful banner with one button',
      html: '<section class="bk" data-section="Call to action"><div class="bk-w"><div class="bk-cta"><h2 class="bk-h2" data-e>Ready to get started?</h2><p class="bk-p" data-e>One short line that nudges visitors to take the next step.</p><div class="bk-row"><a class="bk-btn" data-cta="enroll" data-e>Get Started</a></div></div></div></section>' },
    { id: 'countdown', name: 'Countdown / event', icon: '⏳', desc: 'Event date, timer and register button',
      html: '<section class="bk dark bk-c" data-section="Countdown"><div class="bk-w"><span class="bk-eye" data-e>Free live session</span><h2 class="bk-h2" data-e>Starts soon — save your seat</h2><p class="bk-p" data-e><span data-event-date>Sat, 18 Oct · 7:00 PM IST</span></p><div data-countdown><div class="bk-cd"><div><b data-cd="d">02</b><span>Days</span></div><div><b data-cd="h">14</b><span>Hours</span></div><div><b data-cd="m">36</b><span>Mins</span></div><div><b data-cd="s">09</b><span>Secs</span></div></div></div><div class="bk-row"><a class="bk-btn" data-cta="enroll" data-e>Reserve My Seat</a></div></div></section>' },
    { id: 'ba', name: 'Before / After', icon: '↔️', desc: 'Slider to compare two photos',
      html: '<section class="bk alt" data-section="Before and after"><div class="bk-w"><div class="bk-head"><span class="bk-eye" data-e>Results</span><h2 class="bk-h2" data-e>See the difference</h2></div><div class="bk-ba" data-ba>' + img('before', 'Before photo', PH(1000, 625, '#9ca3af', '#4b5563')) + img('after', 'After photo', PH(1000, 625, '#6366f1', '#312e81')) + '<span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div></section>' },
    { id: 'logos', name: 'Clients / partners', icon: '🏢', desc: 'A row of client or partner names',
      html: '<section class="bk" data-section="Clients" style="padding-block:36px"><div class="bk-w bk-c"><p class="bk-eye" data-e>Trusted by</p><div class="bk-logos" data-list><span data-e>Brand One</span><span data-e>Brand Two</span><span data-e>Brand Three</span><span data-e>Brand Four</span><span data-e>Brand Five</span></div></div></section>' },
    { id: 'contact', name: 'Contact + map', icon: '📍', desc: 'Address, hours, phone and Google Map',
      html: '<section class="bk alt" data-section="Contact"><div class="bk-w bk-split"><div class="bk-contact"><span class="bk-eye" data-e>Contact</span><h2 class="bk-h2" data-e>Visit or call us</h2><b data-e>Address</b><span data-e>123, Main Road, Your City – 000000</span><b data-e>Open</b><span data-e>Mon – Sat · 9:00 AM – 7:00 PM</span><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span><div class="bk-row" style="margin-top:20px"><a class="bk-btn" data-cta="whatsapp" data-e>💬 WhatsApp</a></div></div><div class="bk-map" data-map data-label="Location map" data-q="Connaught Place, New Delhi"></div></div></section>' },
    { id: 'text', name: 'Text article', icon: '📝', desc: 'Heading and paragraphs',
      html: '<section class="bk" data-section="Text"><div class="bk-w" style="max-width:780px"><h2 class="bk-h2" data-e>A heading</h2><p class="bk-p" data-e>Write your paragraph here. Click on any text to edit it.</p><p class="bk-p" data-e>Add another paragraph if you need more space to explain.</p></div></section>' },
    { id: 'canvas', name: 'Image canvas (your design)', icon: '🎨', desc: 'Upload your own design/background, then drag text and buttons on top',
      html: '<section class="bk bk-cv-sec" data-section="Image canvas"><div class="bk-cv" data-canvas data-label="Image canvas">' + img('canvas', 'Canvas background (your design)', P.bg('#4338ca', '#0f172a', 1920, 1080)).replace('<img ', '<img class="bk-cv-bg" ') + '<div class="bk-cv-i" data-cv style="left:8%;top:26%;width:60%;--fs:4.4"><div class="bk-cv-t" data-e>Your big headline</div></div><div class="bk-cv-i" data-cv style="left:8%;top:52%;width:50%;--fs:1.8"><div class="bk-cv-t" style="font-weight:500" data-e>A short line below the headline.</div></div><div class="bk-cv-i" data-cv style="left:8%;top:70%;--fs:1.8"><a class="bk-btn" data-cta="enroll" data-e>Enroll Now</a></div></div></section>' },
    { id: 'html', name: 'Custom HTML code', icon: '</>', desc: 'Paste your own HTML (forms, widgets, embeds)',
      html: '<section class="bk" data-section="Custom HTML"><div class="bk-w" data-html><p class="bk-p">Your custom HTML goes here. Click this box and choose “Edit code”.</p></div></section>' }
  ];
  LB.block = function (id) { return LB.blocks.filter(function (b) { return b.id === id; })[0]; };

  /* ---------- single elements (drag onto the page) ---------- */
  LB.elements = [
    { id: 'h', name: 'Heading', icon: 'H', html: '<div class="bk-el"><h2 class="bk-h2" data-e>Your heading</h2></div>' },
    { id: 'p', name: 'Text', icon: '¶', html: '<div class="bk-el"><p class="bk-p" data-e>Write your text here.</p></div>' },
    { id: 'btn-wa', name: 'WhatsApp button', icon: '💬', html: '<div class="bk-el bk-row"><a class="bk-btn" data-cta="whatsapp" data-e>💬 Chat on WhatsApp</a></div>', cv: '<a class="bk-btn" data-cta="whatsapp" data-e>💬 WhatsApp</a>' },
    { id: 'btn-call', name: 'Call button', icon: '📞', html: '<div class="bk-el bk-row"><a class="bk-btn" data-cta="call" data-e>📞 Call us now</a></div>', cv: '<a class="bk-btn" data-cta="call" data-e>📞 Call now</a>' },
    { id: 'btn-form', name: 'Form / Enroll button', icon: '📝', html: '<div class="bk-el bk-row"><a class="bk-btn" data-cta="enroll" data-e>Enroll Now</a></div>', cv: '<a class="bk-btn" data-cta="enroll" data-e>Enroll Now</a>' },
    { id: 'btn-link', name: 'Link button', icon: '🔗', html: '<div class="bk-el bk-row"><a class="bk-btn o" href="https://" target="_blank" rel="noopener" data-e>Learn more</a></div>', cv: '<a class="bk-btn o" href="https://" target="_blank" rel="noopener" data-e>Learn more</a>' },
    { id: 'img', name: 'Image', icon: '🖼️', html: '<div class="bk-el"><div class="bk-imgbox">' + img('img', 'Image', PH(1000, 750)) + '</div></div>', cvImg: true },
    { id: 'video', name: 'Video', icon: '🎬', html: '<div class="bk-el"><div class="bk-vidbox"><div data-video data-label="Video" data-url=""></div></div></div>' },
    { id: 'list', name: 'Bullet list', icon: '☑️', html: '<div class="bk-el"><ul class="bk-list" data-list><li data-e>First point</li><li data-e>Second point</li><li data-e>Third point</li></ul></div>' },
    { id: 'quote', name: 'Quote', icon: '❝', html: '<div class="bk-el"><blockquote class="bk-card bk-quote"><q data-e>A short customer quote.</q><div class="bk-who"><span><b data-e>Customer name</b></span></div></blockquote></div>' },
    { id: 'hr', name: 'Divider line', icon: '➖', html: '<div class="bk-el"><hr class="bk-hr"></div>' },
    { id: 'sp', name: 'Space', icon: '↕️', html: '<div class="bk-el bk-sp"></div>' }
  ];

  /* ---------- blank page template ---------- */
  LB.blankHtml = function (themeId) {
    var t = LB.theme(themeId), vars = Object.keys(t.v).map(function (k) { return k + ':' + t.v[k]; }).join(';') + ';--bk-head:' + t.head + ';--bk-body:' + t.body;
    var rep = function (s) { return s.replace(/\{\{k\}\}/g, 'a'); };
    var starter = ['hero-split', 'features', 'cta'].map(function (id) { return rep(LB.block(id).html); }).join('\n');
    return '<!doctype html>\n<html lang="en" data-bk data-bk-theme="' + t.id + '" style="' + vars + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>My Landing Page</title>\n<meta name="description" content="Write a short description of this page.">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link id="lb-font" href="' + t.font + '" rel="stylesheet">\n' +
      '<style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bk-bg);color:var(--bk-ink);font-family:var(--bk-body);-webkit-font-smoothing:antialiased}img{max-width:100%}h1,h2,h3,p,ul,figure{margin:0}</style>\n' +
      '<style id="lb-blocks-css">' + LB.blocksCss + '</style>\n</head>\n<body>\n' +
      '<header class="bk-hdr" data-section="Header" data-fixed><div class="bk-w bk-nav"><a class="bk-brand" href="index.html"><img data-img="logo" data-label="Logo" src="' + P.logo('#4f46e5', '#06b6d4', 'Y') + '" alt="Logo"><span data-e>Your Brand</span></a><nav class="bk-menu" data-list><a href="index.html" data-e>Home</a><a href="#contact" data-e>Contact</a></nav><a class="bk-btn" data-cta="enroll" data-e>Get Started</a></div></header>\n' +
      '<main id="top">\n' + starter + '\n</main>\n' +
      '<footer class="bk-ftr" data-section="Footer" data-fixed><div class="bk-w"><span data-e>© 2025 Your Brand. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>\n</body>\n</html>';
  };

  LB.register({
    id: 'blank', category: 'custom', name: 'Blank page', tagline: 'Build your own page from sections',
    best: 'Start from scratch with the section library',
    colors: [
      { v: '--accent', l: 'Main colour', d: '#4f46e5' },
      { v: '--accent2', l: 'Second colour', d: '#06b6d4' },
      { v: '--bk-bg', l: 'Page background', d: '#ffffff' },
      { v: '--bk-ink', l: 'Text colour', d: '#12141c' },
      { v: '--bk-alt', l: 'Soft background', d: '#f5f6fa' }
    ],
    defaults: {
      enroll: { title: 'Get in touch', sub: 'Share your details and we will contact you shortly.', button: 'Send', thanks: 'Thank you!', extraOn: false },
      whatsapp: { message: 'Hi! I would like to know more.' }, countdown: { on: false }, bar: { on: true, text: 'Contact' }
    },
    html: LB.blankHtml('clean')
  });
})();
