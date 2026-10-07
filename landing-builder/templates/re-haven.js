/* Real Estate 2 — HAVEN: warm villas & gated community (earthy green + terracotta) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 're-haven',
    category: 'realestate',
    name: 'Haven',
    tagline: 'Warm, earthy villas & gated community',
    best: 'Villas · Row houses · Gated township · Farmhouse',
    colors: [
      { v: '--accent', l: 'Forest green', d: '#2f5d46' },
      { v: '--accent2', l: 'Terracotta', d: '#c8683f' }
    ],
    defaults: {
      enroll: { title: 'Plan your site visit', sub: 'Tell us when you would like to visit. We arrange free pick-up and drop.', button: 'Book Site Visit', thanks: 'Visit request received!', extraOn: true, extraLabel: 'Interested in', extraOptions: '3 BHK Villa, 4 BHK Villa, Row House, Plot' },
      whatsapp: { message: 'Hi! I want to visit the villa project. Please share details.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Visit' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Haven Villas — Book a Site Visit</title>
<meta name="description" content="Spacious villas in a green gated community. Book a free site visit.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#2f5d46;--accent2:#c8683f;--accent-ink:#fff;--bg:#f7f2e9;--bg2:#efe7d8;--ink:#23301f;--mut:#667060;--line:#e2d9c6}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Work Sans',system-ui,sans-serif;line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Fraunces',Georgia,serif;font-weight:600;line-height:1.1;letter-spacing:-.01em}
em{font-style:italic;color:var(--accent2);font-weight:500}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:var(--accent);color:#fff;font-weight:600;font-size:15px;border-radius:99px;border:2px solid var(--accent);transition:.25s;cursor:pointer}
.btn:hover{background:var(--accent2);border-color:var(--accent2);transform:translateY(-2px)}
.btn.o{background:transparent;color:var(--accent)}.btn.o:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.btn.t{background:var(--accent2);border-color:var(--accent2)}.btn.t:hover{background:var(--accent);border-color:var(--accent)}
.k{display:inline-block;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2)}
header{position:sticky;top:0;z-index:40;background:rgba(247,242,233,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Fraunces';font-weight:700;font-size:26px;color:var(--accent)}
.brand img{width:42px;height:42px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:30px;font-size:14.5px;font-weight:500;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:14px}
.hero{padding:50px 0 80px}
.hh{position:relative;border-radius:34px;overflow:hidden;min-height:620px;display:flex;align-items:flex-end;color:#fff}
.hh .bg{position:absolute;inset:0}.hh .bg img{width:100%;height:100%;object-fit:cover}.hh .bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,35,20,.15),rgba(20,35,20,.82))}
.hh .in{position:relative;padding:60px;max-width:760px}
.hh .k{color:#f4c9ae}.hh h1{font-size:clamp(42px,6vw,78px);margin:14px 0 16px}.hh h1 em{color:#f4c9ae}
.hh p{font-size:18px;color:#e6eadf;max-width:520px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}.hh .btn.o{color:#fff;border-color:rgba(255,255,255,.5)}.hh .btn.o:hover{background:#fff;color:var(--accent)}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:0;background:#fff;border:1px solid var(--line);border-radius:22px;margin-top:-50px;position:relative;padding:8px}
.facts div{padding:26px 20px;text-align:center;border-right:1px solid var(--line)}.facts div:last-child{border:0}
.facts b{font-family:'Fraunces';font-size:32px;color:var(--accent);display:block;line-height:1.1}.facts span{font-size:13.5px;color:var(--mut)}
.sec{padding:100px 0}
.head{max-width:640px;margin:0 auto 54px;text-align:center}
.head h2{font-size:clamp(34px,4.6vw,54px);margin:12px 0 12px;color:var(--accent)}.head p{color:var(--mut);font-size:17px}
.ab{display:grid;grid-template-columns:1.05fr .95fr;gap:70px;align-items:center}
.ab .ims{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ab .ims div{overflow:hidden;border-radius:24px}.ab .ims div:first-child{grid-row:span 2;aspect-ratio:3/4.4}.ab .ims div:last-child{aspect-ratio:1/1}
.ab .ims img{width:100%;height:100%;object-fit:cover}
.ab h2{font-size:clamp(34px,4.2vw,52px);margin:14px 0 20px;color:var(--accent)}.ab p{color:var(--mut);font-size:17px;margin-bottom:16px}
.ls{display:grid;gap:14px;margin-top:22px}.ls div{display:flex;gap:14px;align-items:center;font-weight:500}.ls i{font-style:normal;width:42px;height:42px;border-radius:50%;background:var(--bg2);display:grid;place-items:center;font-size:20px;flex:none}
.vil{background:var(--bg2)}
.vg{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.vc{background:#fff;border-radius:26px;overflow:hidden;transition:.3s;border:1px solid var(--line)}.vc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -34px rgba(47,93,70,.5)}
.vc .p{aspect-ratio:4/3;position:relative}.vc .p img{width:100%;height:100%;object-fit:cover}
.vc .t{position:absolute;left:16px;top:16px;background:var(--accent2);color:#fff;padding:5px 14px;border-radius:99px;font-size:12.5px;font-weight:600}
.vc .in{padding:24px 26px 28px}.vc h3{font-size:27px;color:var(--accent)}
.vc .sp{display:flex;gap:16px;margin:10px 0 14px;font-size:14px;color:var(--mut);flex-wrap:wrap}
.vc .pr{font-family:'Fraunces';font-size:30px;font-weight:600;margin-bottom:16px}.vc .pr small{font-family:'Work Sans';font-size:13px;color:var(--mut);font-weight:400}
.vc .btn{width:100%;padding:13px}
.ft2{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.fc{padding:34px 28px;background:#fff;border-radius:24px;border:1px solid var(--line)}.fc i{font-style:normal;font-size:36px;display:block;margin-bottom:12px}.fc h3{font-size:23px;margin-bottom:8px;color:var(--accent)}.fc p{color:var(--mut);font-size:15px}
.ba{aspect-ratio:16/9;border-radius:26px;border:6px solid #fff;box-shadow:0 30px 60px -34px rgba(47,93,70,.5)}.baw{max-width:860px;margin:0 auto}
.ba .lbl{position:absolute;top:16px;z-index:2;background:rgba(255,255,255,.92);padding:5px 15px;border-radius:99px;font-size:12.5px;font-weight:600;color:var(--accent)}.ba .lbl.l{left:16px}.ba .lbl.r{right:16px}
.vd{background:var(--accent);color:#fff}.vd .head h2{color:#fff}.vd .head h2 em{color:#f4c9ae}.vd .head p{color:#cfe0d4}.vd .k{color:#f4c9ae}
.vbox{max-width:920px;margin:0 auto;border-radius:26px;overflow:hidden;border:6px solid rgba(255,255,255,.14)}
.rev{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{background:#fff;border:1px solid var(--line);border-radius:24px;padding:32px 28px}.rc .st{color:#e2a02f;letter-spacing:3px;margin-bottom:10px}.rc p{margin-bottom:20px;font-size:16px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15px}.who small{color:var(--mut)}
.vis{display:grid;grid-template-columns:1fr 1.15fr;gap:46px;align-items:stretch}
.vi{background:var(--accent);color:#fff;border-radius:30px;padding:48px 40px}.vi h2{font-size:clamp(32px,3.8vw,46px);margin:12px 0 22px}.vi h2 em{color:#f4c9ae}.vi .k{color:#f4c9ae}
.vi .r{margin-bottom:18px}.vi b{display:block;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#f4c9ae;font-weight:600}.vi span{color:#e6eadf}
.map{border-radius:30px;min-height:380px;border:6px solid #fff;box-shadow:0 30px 60px -34px rgba(47,93,70,.45)}
.final{padding:0 0 100px}.final .box{background:var(--accent2);color:#fff;border-radius:34px;padding:76px 30px;text-align:center}
.final h2{font-size:clamp(34px,5vw,60px);max-width:760px;margin:0 auto 14px}.final p{max-width:520px;margin:0 auto 28px;color:#ffe8d9;font-size:17.5px}.final .btn{background:#fff;color:var(--accent2);border-color:#fff}
footer{padding:32px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.ab,.vis{grid-template-columns:1fr;gap:40px}.facts{grid-template-columns:1fr 1fr;margin-top:-30px}.facts div:nth-child(2){border-right:0}.facts div:nth-child(-n+2){border-bottom:1px solid var(--line)}.vg,.ft2,.rev{grid-template-columns:1fr}.hh .in{padding:34px 26px}.hh{min-height:540px}.sec{padding:70px 0}.nav .btn{display:none}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#2f5d46', '#c8683f', 'H')}" alt="Logo"><span data-e>Haven Villas</span></a>
  <nav class="links"><a href="#about" data-e>Community</a><a href="#villas" data-e>Villas</a><a href="#features" data-e>Features</a><a href="#visit" data-e>Visit</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Visit</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap">
  <div class="hh"><div class="bg"><img data-img="hero" data-label="Hero photo" src="${P.bg('#4f7a5f', '#1d3324', 1600, 900)}" alt=""></div>
    <div class="in"><span class="k rv" data-e>Gated villa community · 12 acres</span><h1 class="rv" data-e>Space to breathe. A home to <em>belong</em>.</h1><p class="rv" data-e>Independent 3 &amp; 4 BHK villas with private gardens, clubhouse and 70% open greens, just 20 minutes from the city.</p><div class="cta-row rv"><a class="btn t" data-cta="enroll" data-e>Book Free Site Visit</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div></div></div>
  <div class="facts" data-list><div><b data-e>12 Acres</b><span data-e>Gated township</span></div><div><b data-e>148</b><span data-e>Premium villas</span></div><div><b data-e>70%</b><span data-e>Open green space</span></div><div><b data-e>₹1.2 Cr</b><span data-e>Starting price*</span></div></div>
</div></section>

<section class="sec" id="about" data-section="Community">
  <div class="wrap ab"><div class="ims rv"><div><img data-img="a1" data-label="Community photo 1" src="${P.photo('#6b8f71', '#2f5d46', 700, 1000)}" alt=""></div><div><img data-img="a2" data-label="Community photo 2" src="${P.photo('#c8683f', '#7a3a1e', 600, 600)}" alt=""></div><div><img data-img="a3" data-label="Community photo 3" src="${P.photo('#a9bf9a', '#4c7a5a', 600, 600)}" alt=""></div></div>
  <div class="rv"><span class="k" data-e>The community</span><h2 data-e>Life the way it's <em>meant to be</em></h2><p data-e>Wake up to birdsong, walk to the clubhouse, let the kids cycle safely. Haven blends the calm of nature with every modern convenience.</p><div class="ls" data-list><div><i>🌿</i><span data-e>Landscaped parks &amp; walking trails</span></div><div><i>🏡</i><span data-e>Independent villas with private gardens</span></div><div><i>🔒</i><span data-e>Gated entry with 24×7 security</span></div></div></div></div>
</section>

<section class="sec vil" id="villas" data-section="Villa types">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Villa types</span><h2 data-e>Choose your <em>haven</em></h2><p data-e>Three thoughtfully designed homes for every family size.</p></div>
  <div class="vg" data-list>
    <div class="vc rv"><div class="p"><img data-img="v1" data-label="Villa 1" src="${P.photo('#7a9b82', '#2f5d46', 800, 600)}" alt=""><span class="t" data-e>Ready to move</span></div><div class="in"><h3 data-e>3 BHK Villa</h3><div class="sp"><span data-e>2,100 sq.ft</span><span data-e>3 bath</span><span data-e>Garden</span></div><div class="pr"><span data-e>₹1.2 Cr</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Details</a></div></div>
    <div class="vc rv"><div class="p"><img data-img="v2" data-label="Villa 2" src="${P.photo('#d98a63', '#8a3e1e', 800, 600)}" alt=""><span class="t" data-e>Most popular</span></div><div class="in"><h3 data-e>4 BHK Villa</h3><div class="sp"><span data-e>2,900 sq.ft</span><span data-e>4 bath</span><span data-e>Terrace</span></div><div class="pr"><span data-e>₹1.75 Cr</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Details</a></div></div>
    <div class="vc rv"><div class="p"><img data-img="v3" data-label="Villa 3" src="${P.photo('#9fb5a3', '#3c6a50', 800, 600)}" alt=""><span class="t" data-e>New launch</span></div><div class="in"><h3 data-e>Row House</h3><div class="sp"><span data-e>1,650 sq.ft</span><span data-e>3 bath</span><span data-e>Patio</span></div><div class="pr"><span data-e>₹95 L</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Details</a></div></div>
  </div></div>
</section>

<section class="sec" id="features" data-section="Features">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Why Haven</span><h2 data-e>Everything your family <em>needs</em></h2></div>
  <div class="ft2" data-list>
    <div class="fc rv"><i>🌳</i><h3 data-e>Green living</h3><p data-e>Rain-water harvesting, solar street lights and 2,000+ trees.</p></div><div class="fc rv"><i>🏊</i><h3 data-e>Clubhouse</h3><p data-e>Pool, gym, indoor games, party hall and co-working lounge.</p></div><div class="fc rv"><i>🚸</i><h3 data-e>Kid-safe roads</h3><p data-e>Wide internal roads, cycling tracks and a dedicated play park.</p></div>
    <div class="fc rv"><i>🏫</i><h3 data-e>Near schools</h3><p data-e>Top schools and hospitals within 10 minutes.</p></div><div class="fc rv"><i>📶</i><h3 data-e>Smart community</h3><p data-e>App-based visitor management and complaint tracking.</p></div><div class="fc rv"><i>💧</i><h3 data-e>24×7 utilities</h3><p data-e>Treated water, power backup and underground wiring.</p></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Before & After">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Progress</span><h2 data-e>From land to <em>home</em></h2><p data-e>Slide to see the site then and now.</p></div><div class="baw rv"><div class="ba" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#b9b49a', '#7a7660', 1000, 560)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#6b8f71', '#2f5d46', 1000, 560)}" alt="After"><span class="lbl l" data-e>2022</span><span class="lbl r" data-e>Today</span></div></div></div>
</section>

<section class="sec vd" data-section="Video tour">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Site tour</span><h2 data-e>Walk through your <em>future home</em></h2><p data-e>A 3-minute drone and sample-villa tour.</p></div><div class="vbox rv"><div data-video data-label="Site tour video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div>
</section>

<section class="sec" data-section="Resident reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Happy families</span><h2 data-e>Words from our <em>residents</em></h2></div>
  <div class="rev" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"We moved from an apartment and the kids love the garden. The community feels like family."</p><div class="who"><img data-img="u1" data-label="Resident 1" src="${P.avatar('#2f5d46', '#c8683f')}" alt=""><span><b data-e>Anil &amp; Sushma Rao</b><small data-e>3 BHK villa owners</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Transparent pricing, on-time possession and a very helpful team from enquiry to registry."</p><div class="who"><img data-img="u2" data-label="Resident 2" src="${P.avatar('#c8683f', '#7a3a1e')}" alt=""><span><b data-e>Kunal Mehta</b><small data-e>4 BHK villa owner</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Peaceful, safe and green. Best investment we've made. Property value has already grown 30%."</p><div class="who"><img data-img="u3" data-label="Resident 3" src="${P.avatar('#6b8f71', '#2f5d46')}" alt=""><span><b data-e>Farida Sheikh</b><small data-e>Row house owner</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap vis"><div class="vi rv"><span class="k" data-e>Visit us</span><h2 data-e>Come see <em>Haven</em></h2><div class="r"><b data-e>Site address</b><span data-e>Haven Villas, Outer Ring Road, Your City – 000000</span></div><div class="r"><b data-e>Sales office</b><span data-e>Daily · 9:30 AM – 7:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn t" data-cta="enroll" data-e>Book Free Site Visit</a></div>
  <div class="map rv" data-map data-label="Project location" data-q="Kokapet, Hyderabad"></div></div>
</section>

<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Your forever home is waiting</h2><p data-e>Limited villas left in Phase 1. Book a free site visit with pick-up and drop.</p><a class="btn" data-cta="enroll" data-e>Book Site Visit →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Haven Villas. RERA No. XXXXXXXX. *T&amp;C apply.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
