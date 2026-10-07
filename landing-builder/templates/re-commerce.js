/* Real Estate 4 — COMMERCE: modern commercial / office / retail space (electric blue, light) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 're-commerce',
    category: 'realestate',
    name: 'Commerce Hub',
    tagline: 'Modern offices, shops & business parks',
    best: 'Commercial complex · Office space · Retail shops · Co-working',
    colors: [
      { v: '--accent', l: 'Electric blue', d: '#2347ff' },
      { v: '--accent2', l: 'Lime', d: '#b6f23c' }
    ],
    defaults: {
      enroll: { title: 'Request availability & rates', sub: 'Tell us your space need. Our leasing team will share options within 24 hours.', button: 'Request Details', thanks: 'Request received!', extraOn: true, extraLabel: 'Space needed', extraOptions: 'Office (500-1,000 sq.ft), Office (1,000-5,000 sq.ft), Retail shop, Showroom, Co-working seats' },
      whatsapp: { message: 'Hi! I want details about available commercial spaces.' },
      countdown: { on: false }, bar: { on: true, text: 'Get Rates' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Commerce Hub — Offices &amp; Retail Spaces</title>
<meta name="description" content="Grade-A offices and retail spaces in a prime business district. Request availability and rates.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--accent:#2347ff;--accent2:#b6f23c;--accent-ink:#fff;--ink:#0b1020;--mut:#5b6478;--line:#e4e7f0;--bg:#f4f6fb}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Albert Sans',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{letter-spacing:-.035em;line-height:1.05;font-weight:800}
em{font-style:normal;background:var(--accent2);color:var(--ink);padding:0 .15em;border-radius:6px}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 30px;background:var(--accent);color:#fff;font-weight:700;font-size:16px;border-radius:12px;transition:.2s;cursor:pointer;border:0}
.btn:hover{transform:translateY(-2px);box-shadow:0 18px 36px -14px var(--accent)}
.btn.l{background:var(--accent2);color:var(--ink)}.btn.l:hover{box-shadow:0 18px 36px -14px var(--accent2)}
.btn.o{background:#fff;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--line)}
.k{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}.k::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--accent2);box-shadow:0 0 0 3px var(--ink)}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:74px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:22px;letter-spacing:-.03em}
.brand img{width:38px;height:38px;border-radius:10px;object-fit:cover}
.links{display:flex;gap:30px;font-size:15px;font-weight:600;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 22px;font-size:14.5px}
.hero{padding:70px 0 40px;background:radial-gradient(900px 400px at 85% 0%,rgba(35,71,255,.1),transparent 70%)}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center}
.hero h1{font-size:clamp(42px,6.2vw,82px);margin:18px 0 20px}
.hero p{font-size:19px;color:var(--mut);max-width:520px;margin-bottom:30px}
.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:34px}
.mini{display:flex;gap:32px;flex-wrap:wrap}.mini b{font-size:34px;display:block;line-height:1;letter-spacing:-.04em}.mini span{font-size:13.5px;color:var(--mut)}
.hi{position:relative}.hi .a{aspect-ratio:1/1.05;border-radius:30px;overflow:hidden;box-shadow:0 40px 80px -40px rgba(35,71,255,.6)}.hi .a img{width:100%;height:100%;object-fit:cover}
.hi .c{position:absolute;left:-26px;bottom:34px;background:var(--ink);color:#fff;padding:16px 22px;border-radius:16px;box-shadow:0 20px 40px -16px rgba(0,0,0,.5)}.hi .c b{display:block;font-size:26px;color:var(--accent2);line-height:1.1}.hi .c span{font-size:13px;color:#b9c0d6}
.logos{padding:40px 0 20px;text-align:center}.logos p{font-size:13px;color:var(--mut);font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:18px}
.lg{display:flex;gap:44px;justify-content:center;flex-wrap:wrap;font-weight:800;font-size:22px;color:#a6adc0;letter-spacing:-.02em}
.sec{padding:96px 0}
.head{max-width:700px;margin:0 auto 52px;text-align:center}
.head h2{font-size:clamp(34px,4.8vw,58px);margin:14px 0 14px}.head p{color:var(--mut);font-size:18px}
.bento{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
.bx{background:var(--bg);border-radius:24px;padding:30px;position:relative;overflow:hidden;transition:.3s}.bx:hover{transform:translateY(-5px)}
.s2{grid-column:span 2}.s3{grid-column:span 3}.s4{grid-column:span 4}
.bx.d{background:var(--ink);color:#fff}.bx.d p{color:#aab2c8}.bx.b{background:var(--accent);color:#fff}.bx.b p{color:#cdd6ff}.bx.g{background:var(--accent2)}
.bx i{font-style:normal;font-size:30px;display:block;margin-bottom:12px}.bx h3{font-size:24px;margin-bottom:8px;letter-spacing:-.03em}.bx p{color:var(--mut);font-size:15.5px}
.bx .big{font-size:64px;font-weight:800;letter-spacing:-.05em;line-height:1}
.sp{background:var(--bg)}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.tc{background:#fff;border-radius:24px;overflow:hidden;border:1px solid var(--line);transition:.3s}.tc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -36px rgba(11,16,32,.5)}
.tc .p{aspect-ratio:4/3}.tc .p img{width:100%;height:100%;object-fit:cover}.tc .in{padding:24px 26px 28px}
.tc .tag{display:inline-block;background:var(--accent2);font-size:12.5px;font-weight:700;padding:4px 12px;border-radius:99px;margin-bottom:10px}.tc h3{font-size:24px;margin-bottom:6px}
.tc .sz{display:flex;gap:16px;color:var(--mut);font-size:14.5px;margin-bottom:14px;flex-wrap:wrap}.tc .rent{font-size:26px;font-weight:800;letter-spacing:-.03em;margin-bottom:16px}.tc .rent small{font-size:14px;color:var(--mut);font-weight:500}.tc .btn{width:100%;padding:13px}
.roi{background:var(--ink);color:#fff}.roi .head h2{color:#fff}.roi .head p{color:#aab2c8}.roi .k{color:var(--accent2)}.roi .k::before{box-shadow:0 0 0 3px #fff}
.rg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.rg div{border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:30px 24px}.rg b{font-size:48px;color:var(--accent2);letter-spacing:-.04em;display:block;line-height:1.1}.rg span{color:#aab2c8;font-size:15px}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:210px;gap:12px}.gal div{border-radius:20px;overflow:hidden}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal div:nth-child(4){grid-column:span 2}
.gal img{width:100%;height:100%;object-fit:cover;transition:transform .7s}.gal div:hover img{transform:scale(1.07)}
.vd{max-width:940px;margin:0 auto;border-radius:26px;overflow:hidden;box-shadow:0 50px 100px -40px rgba(35,71,255,.55)}
.rv2{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.rc{background:var(--bg);border-radius:24px;padding:30px}.rc p{font-size:17px;margin:12px 0 20px;font-weight:500}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15px}.who small{color:var(--mut)}.rc .st{color:#f5a623;letter-spacing:3px}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}.ci{background:var(--accent);color:#fff;border-radius:30px;padding:46px 40px}.ci h2{font-size:clamp(32px,3.8vw,46px);margin:14px 0 22px}.ci .k{color:#fff}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2)}.ci span{font-size:17px;color:#e3e8ff}
.map{min-height:400px;border-radius:30px;border:1px solid var(--line)}
.final{padding:0 0 96px}.final .box{background:var(--accent2);border-radius:36px;padding:80px 30px;text-align:center}.final h2{font-size:clamp(34px,5.4vw,66px);max-width:820px;margin:0 auto 14px}.final p{color:#324010;max-width:520px;margin:0 auto 28px;font-size:18.5px}.final .btn{background:var(--ink)}
footer{padding:30px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.ct{grid-template-columns:1fr}.hi .c{left:0}.bento{grid-template-columns:1fr 1fr}.s2,.s3,.s4{grid-column:span 2}.tg,.rv2{grid-template-columns:1fr}.rg{grid-template-columns:1fr 1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:160px}.sec{padding:70px 0}.nav .btn{display:none}}
@media(max-width:560px){.bento{grid-template-columns:1fr}.s2,.s3,.s4{grid-column:span 1}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#2347ff', '#0b1020', 'C')}" alt="Logo"><span data-e>Commerce Hub</span></a>
  <nav class="links"><a href="#why" data-e>Why us</a><a href="#spaces" data-e>Spaces</a><a href="#returns" data-e>Returns</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Get Rates</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>Grade-A commercial · Prime location</span><h1 class="rv" data-e>Your business deserves a <em>better address</em></h1><p class="rv" data-e>Ready-to-move offices, high-street shops and showrooms in the city's fastest-growing business district.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Request Availability</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="mini rv" data-list><div><b data-e>4.2 L</b><span data-e>sq.ft leasable</span></div><div><b data-e>92%</b><span data-e>Occupancy</span></div><div><b data-e>8–10%</b><span data-e>Rental yield</span></div></div></div>
  <div class="hi rv"><div class="a"><img data-img="hero" data-label="Building photo" src="${P.photo('#4a66ff', '#0b1020', 900, 950)}" alt=""></div><div class="c"><b data-e>₹95/sq.ft</b><span data-e>Starting monthly rent</span></div></div>
</div></section>
<section class="logos" data-section="Tenants"><div class="wrap"><p data-e>Trusted by growing businesses</p><div class="lg" data-list><span data-e>TechNova</span><span data-e>FinEdge</span><span data-e>Medico</span><span data-e>RetailX</span><span data-e>CloudNine</span></div></div></section>

<section class="sec" id="why" data-section="Why this location">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Why Commerce Hub</span><h2 data-e>Built for how business <em>works today</em></h2></div>
  <div class="bento" data-list>
    <div class="bx s4 d rv"><i>📍</i><h3 data-e>Prime connectivity</h3><p data-e>5 minutes from the metro, 15 from the airport and right on the main arterial road. Your team and clients reach you easily.</p></div>
    <div class="bx s2 b rv"><div class="big" data-e>24×7</div><h3 data-e>Access &amp; security</h3><p data-e>Smart access and CCTV.</p></div>
    <div class="bx s2 rv"><i>⚡</i><h3 data-e>100% power backup</h3><p data-e>Uninterrupted operations.</p></div>
    <div class="bx s2 g rv"><i>🅿️</i><h3 data-e>1,200 parking bays</h3><p data-e>Multi-level, EV ready.</p></div>
    <div class="bx s2 rv"><i>🌿</i><h3 data-e>Green certified</h3><p data-e>IGBC gold rated building.</p></div>
    <div class="bx s3 rv"><i>🍽️</i><h3 data-e>Food court &amp; cafés</h3><p data-e>Everything your team needs, downstairs.</p></div>
    <div class="bx s3 rv"><i>🛗</i><h3 data-e>High-speed lifts</h3><p data-e>Zero waiting, destination control.</p></div>
  </div></div>
</section>

<section class="sec sp" id="spaces" data-section="Available spaces">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Available now</span><h2 data-e>Spaces that <em>fit</em></h2><p data-e>Flexible sizes, bare-shell or fully fitted-out.</p></div>
  <div class="tg" data-list>
    <div class="tc rv"><div class="p"><img data-img="s1" data-label="Space 1" src="${P.photo('#6c83ff', '#1a2a8f', 800, 600)}" alt=""></div><div class="in"><span class="tag" data-e>Office</span><h3 data-e>Plug-and-play office</h3><div class="sz"><span data-e>1,000 – 5,000 sq.ft</span><span data-e>Fitted-out</span></div><div class="rent"><span data-e>₹110</span><small data-e> /sq.ft/month</small></div><a class="btn" data-cta="enroll" data-e>Request Details</a></div></div>
    <div class="tc rv"><div class="p"><img data-img="s2" data-label="Space 2" src="${P.photo('#d9f77a', '#5f7a14', 800, 600)}" alt=""></div><div class="in"><span class="tag" data-e>Retail</span><h3 data-e>High-street shops</h3><div class="sz"><span data-e>300 – 1,500 sq.ft</span><span data-e>Ground floor</span></div><div class="rent"><span data-e>₹250</span><small data-e> /sq.ft/month</small></div><a class="btn" data-cta="enroll" data-e>Request Details</a></div></div>
    <div class="tc rv"><div class="p"><img data-img="s3" data-label="Space 3" src="${P.photo('#1a2a8f', '#0b1020', 800, 600)}" alt=""></div><div class="in"><span class="tag" data-e>Co-working</span><h3 data-e>Private cabins &amp; desks</h3><div class="sz"><span data-e>Seats from 4 to 60</span><span data-e>Flexible</span></div><div class="rent"><span data-e>₹9,500</span><small data-e> /seat/month</small></div><a class="btn" data-cta="enroll" data-e>Request Details</a></div></div>
  </div></div>
</section>

<section class="sec roi" id="returns" data-section="Investment returns">
  <div class="wrap"><div class="head rv"><span class="k" data-e>For investors</span><h2 data-e>Commercial property that <em>pays you</em></h2><p data-e>Own a unit and earn assured rental income from reputed tenants.</p></div>
  <div class="rg" data-list><div class="rv"><b data-e>9.2%</b><span data-e>Average rental yield</span></div><div class="rv"><b data-e>11 yr</b><span data-e>Lease with escalation</span></div><div class="rv"><b data-e>15%</b><span data-e>Annual price growth</span></div><div class="rv"><b data-e>0</b><span data-e>Vacancy last 3 years</span></div></div></div>
</section>

<section class="sec" data-section="Gallery & video">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Inside Commerce Hub</span><h2 data-e>See it <em>for yourself</em></h2></div>
  <div class="vd rv" style="margin-bottom:40px"><div data-video data-label="Building tour video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  <div class="gal" data-list><div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#2347ff', '#0b1020', 900, 900)}" alt=""></div><div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#b6f23c', '#4a6a10', 600, 600)}" alt=""></div><div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#6c83ff', '#1a2a8f', 600, 600)}" alt=""></div><div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#0b1020', '#2347ff', 900, 450)}" alt=""></div><div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#d9f77a', '#2347ff', 600, 600)}" alt=""></div><div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#1a2a8f', '#b6f23c', 600, 600)}" alt=""></div></div></div>
</section>

<section class="sec sp" data-section="Tenant reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Tenant voices</span><h2 data-e>Businesses that <em>grew here</em></h2></div>
  <div class="rv2" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"We doubled our team in 18 months and expanded within the same building. Seamless."</p><div class="who"><img data-img="u1" data-label="Tenant 1" src="${P.avatar('#2347ff', '#0b1020')}" alt=""><span><b data-e>Rishi Kapoor</b><small data-e>CEO, TechNova</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Footfall on the ground floor is excellent. Sales are up 40% since we moved in."</p><div class="who"><img data-img="u2" data-label="Tenant 2" src="${P.avatar('#b6f23c', '#4a6a10')}" alt=""><span><b data-e>Pallavi Nair</b><small data-e>Owner, RetailX</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Management is responsive and the facilities are top class. Great investment too."</p><div class="who"><img data-img="u3" data-label="Tenant 3" src="${P.avatar('#6c83ff', '#1a2a8f')}" alt=""><span><b data-e>Dr. Amit Shah</b><small data-e>Clinic owner &amp; investor</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="contact" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Leasing office</span><h2 data-e>Let's find your <em>space</em></h2><div class="r"><b data-e>Address</b><span data-e>Commerce Hub, Business District, Your City – 000000</span></div><div class="r"><b data-e>Hours</b><span data-e>Mon – Sat · 9:30 AM – 6:30 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn l" data-cta="enroll" data-e>Request Availability</a></div>
  <div class="map rv" data-map data-label="Building location" data-q="BKC, Mumbai"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Spaces are leasing fast.</h2><p data-e>Get rates, floor plans and a site visit in 24 hours.</p><a class="btn" data-cta="enroll" data-e>Request Details →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Commerce Hub. RERA No. XXXXXXXX.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
