/* Real Estate 5 — PLOTLINE: bold plot / land investment sales page (yellow + black) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 're-plotline',
    category: 'realestate',
    name: 'Plotline',
    tagline: 'Bold plots & land investment page',
    best: 'Residential plots · Farm land · Land investment · Weekend homes',
    colors: [
      { v: '--accent', l: 'Yellow', d: '#ffc800' },
      { v: '--accent2', l: 'Black', d: '#111111' }
    ],
    defaults: {
      enroll: { title: 'Book a free site visit', sub: 'Pick your plot size and we will arrange a free site visit with pick-up.', button: 'Book Site Visit', thanks: 'Site visit requested!', extraOn: true, extraLabel: 'Plot size', extraOptions: '150 sq.yd, 200 sq.yd, 300 sq.yd, 500 sq.yd, Farm land' },
      whatsapp: { message: 'Hi! I want details about the plots and price.' },
      countdown: { on: true, date: '' }, bar: { on: true, text: 'Book Visit' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plotline — Residential Plots</title>
<meta name="description" content="Clear-title residential plots with 3x appreciation potential. Book a free site visit.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#ffc800;--accent2:#111111;--accent-ink:#111;--ink:#111;--mut:#5f5f5f;--line:#e5e5e0;--bg:#f6f5ef}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Archivo',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Archivo Black',Impact,sans-serif;font-weight:400;line-height:1;text-transform:uppercase;letter-spacing:-.01em}
em{font-style:normal;background:var(--accent);padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:18px 34px;background:var(--accent);color:#111;font-family:'Archivo Black';font-size:16px;text-transform:uppercase;border:3px solid #111;box-shadow:6px 6px 0 #111;transition:.15s;cursor:pointer}
.btn:hover{transform:translate(3px,3px);box-shadow:3px 3px 0 #111}
.btn.d{background:#111;color:#fff;border-color:#111;box-shadow:6px 6px 0 var(--accent)}.btn.d:hover{box-shadow:3px 3px 0 var(--accent)}
.btn.w{background:#fff}
.strip{background:var(--accent);border-bottom:3px solid #111;padding:9px 0;font-weight:700;font-size:14px}
.strip .wrap{display:flex;justify-content:center;align-items:center;gap:18px;flex-wrap:wrap;text-align:center}
.cd{display:inline-flex;gap:6px;background:#111;color:var(--accent);padding:2px 14px;font-family:'Archivo Black';font-size:17px}
header{position:sticky;top:0;z-index:40;background:#fff;border-bottom:3px solid #111}
.nav{display:flex;align-items:center;justify-content:space-between;height:74px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-family:'Archivo Black';font-size:24px;text-transform:uppercase}
.brand img{width:40px;height:40px;border:2px solid #111;object-fit:cover}
.links{display:flex;gap:28px;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.06em}.links a:hover{background:var(--accent)}
.nav .btn{padding:11px 22px;font-size:14px;box-shadow:4px 4px 0 #111}
.hero{background:var(--bg);padding:60px 0 70px;border-bottom:3px solid #111}
.hg{display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center}
.tag{display:inline-block;background:#111;color:var(--accent);font-weight:700;padding:6px 14px;font-size:13.5px;letter-spacing:.1em;text-transform:uppercase}
.hero h1{font-size:clamp(46px,7.4vw,104px);margin:18px 0 20px}
.hero p{font-size:19px;color:#444;max-width:520px;margin-bottom:28px;font-weight:500}
.cta-row{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px}
.hv{position:relative}.hv .a{aspect-ratio:1/1.1;border:3px solid #111;box-shadow:12px 12px 0 var(--accent);overflow:hidden;background:#ddd}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;left:-20px;bottom:30px;background:#111;color:#fff;padding:14px 20px;transform:rotate(-3deg)}.hv .c b{font-family:'Archivo Black';font-size:30px;color:var(--accent);display:block;line-height:1}.hv .c span{font-size:12.5px;text-transform:uppercase;letter-spacing:.08em}
.nums{background:#111;color:#fff}
.ng{display:grid;grid-template-columns:repeat(4,1fr)}.ng div{padding:30px 22px;text-align:center;border-right:1px solid #333}.ng div:last-child{border:0}.ng b{font-family:'Archivo Black';font-size:44px;color:var(--accent);display:block;line-height:1.1}.ng span{font-size:14px;color:#bbb}
.sec{padding:90px 0}
.head{margin-bottom:46px}.head.c{text-align:center;max-width:700px;margin-inline:auto;margin-bottom:46px}
.head h2{font-size:clamp(36px,5.6vw,72px);margin-top:14px}.head p{color:var(--mut);font-size:18px;margin-top:14px;max-width:560px;font-weight:500}.head.c p{margin-inline:auto}
.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pc{border:3px solid #111;background:#fff;box-shadow:8px 8px 0 #111;transition:.2s}.pc:hover{transform:translate(-4px,-4px);box-shadow:12px 12px 0 var(--accent)}
.pc .p{aspect-ratio:4/3;border-bottom:3px solid #111;position:relative;background:#eee}.pc .p img{width:100%;height:100%;object-fit:cover}
.pc .t{position:absolute;left:12px;top:12px;background:var(--accent);border:2px solid #111;font-weight:700;font-size:12.5px;padding:3px 10px;text-transform:uppercase}
.pc .in{padding:22px 24px 26px}.pc h3{font-size:30px;margin-bottom:6px}.pc .sz{color:var(--mut);margin-bottom:12px;font-weight:600}
.pc .pr{font-family:'Archivo Black';font-size:30px;margin-bottom:16px}.pc .pr small{font-family:'Archivo';font-size:13px;color:var(--mut);font-weight:600}.pc .btn{width:100%;padding:14px;font-size:14px;box-shadow:4px 4px 0 #111}
.why{background:var(--accent);border-block:3px solid #111}
.wg{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.wc{background:#fff;border:3px solid #111;padding:28px 26px}.wc i{font-style:normal;font-size:32px;display:block;margin-bottom:8px}.wc h3{font-size:22px;margin-bottom:8px}.wc p{color:#444;font-size:15.5px;font-weight:500}
.ap{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.ap .box{background:#111;color:#fff;padding:44px;border:3px solid #111;box-shadow:12px 12px 0 var(--accent)}
.ap .box h3{font-size:30px;margin-bottom:24px}
.bar{margin-bottom:22px}.bar div{display:flex;justify-content:space-between;font-weight:700;margin-bottom:8px;font-size:15px}.bar span.t{height:16px;background:#333;display:block}.bar span.t i{display:block;height:100%;background:var(--accent)}
.ap h2{font-size:clamp(34px,4.6vw,58px);margin-bottom:18px}.ap p{color:var(--mut);font-size:17.5px;margin-bottom:22px;font-weight:500}
.vd{border:3px solid #111;box-shadow:12px 12px 0 var(--accent);max-width:900px;margin:0 auto;background:#000}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:14px}.gal div{border:3px solid #111;overflow:hidden}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal img{width:100%;height:100%;object-fit:cover}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{border:3px solid #111;padding:28px;background:#fff;box-shadow:6px 6px 0 #111}.rc p{font-weight:500;font-size:16.5px;margin-bottom:18px}.rc .st{letter-spacing:3px;margin-bottom:8px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border:2px solid #111;object-fit:cover}.who b{display:block;font-family:'Archivo Black';font-weight:400;font-size:15px;text-transform:uppercase}.who small{color:var(--mut)}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}
.ci{background:#111;color:#fff;padding:44px 38px;border:3px solid #111;box-shadow:10px 10px 0 var(--accent)}.ci h2{font-size:clamp(32px,3.8vw,48px);margin:14px 0 22px}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}.ci span{font-size:17px;color:#ddd}
.map{min-height:400px;border:3px solid #111}
.final{background:#111;color:#fff;text-align:center;padding:90px 0}.final h2{font-size:clamp(40px,6.4vw,92px);max-width:900px;margin:0 auto 14px}.final p{color:#bbb;max-width:520px;margin:0 auto 30px;font-size:18px}
footer{padding:28px 0;font-size:14px;font-weight:600}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.ap,.ct{grid-template-columns:1fr}.hv .c{left:0}.ng{grid-template-columns:1fr 1fr}.ng div:nth-child(2){border-right:0}.pg,.wg,.rg{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:150px}.sec{padding:64px 0}.nav .btn{display:none}.ap .box{padding:30px 22px}}
</style>
</head>
<body>
<div class="strip" data-section="Offer bar" data-fixed><div class="wrap"><span data-e>🔥 Launch offer: ZERO registration charges on first 20 plots</span><span class="cd" data-countdown><span data-cd="d">02</span>d <span data-cd="h">14</span>h <span data-cd="m">36</span>m <span data-cd="s">09</span>s</span></div></div>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#ffc800', '#111111', 'P')}" alt="Logo"><span data-e>Plotline</span></a>
  <nav class="links"><a href="#plots" data-e>Plots</a><a href="#why" data-e>Why invest</a><a href="#growth" data-e>Growth</a><a href="#contact" data-e>Visit</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Visit</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="tag rv" data-e>DTCP approved · Clear title · Ready registry</span><h1 class="rv" data-e>Own land. <em>Own the future.</em></h1><p class="rv" data-e>Premium residential plots starting at ₹18 lakh, near the upcoming IT corridor. Build your dream home or watch your wealth grow.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Free Site Visit</a><a class="btn w" data-cta="whatsapp" data-e>💬 WhatsApp</a></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Site photo" src="${P.photo('#d9b300', '#6b5a00', 900, 1000)}" alt=""></div><div class="c"><b data-e>₹18 L*</b><span data-e>Plots starting</span></div></div>
</div></section>
<section class="nums" data-section="Key numbers"><div class="wrap ng" data-list><div><b data-e>40 Acres</b><span data-e>Layout</span></div><div><b data-e>420</b><span data-e>Plots</span></div><div><b data-e>40 ft</b><span data-e>Main roads</span></div><div><b data-e>100%</b><span data-e>Clear title</span></div></div></section>

<section class="sec" id="plots" data-section="Plot sizes & price">
  <div class="wrap"><div class="head"><h2 data-e>Pick your <em>plot</em></h2><p data-e>East, north and corner plots available. Replace with your layout photos.</p></div>
  <div class="pg" data-list>
    <div class="pc rv"><div class="p"><img data-img="p1" data-label="Plot photo 1" src="${P.photo('#e8c940', '#8a7000', 800, 600)}" alt=""><span class="t" data-e>Few left</span></div><div class="in"><h3 data-e>150 Sq.Yd</h3><div class="sz" data-e>1,350 sq.ft · East / North facing</div><div class="pr"><span data-e>₹18.5 L</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Price</a></div></div>
    <div class="pc rv"><div class="p"><img data-img="p2" data-label="Plot photo 2" src="${P.photo('#111111', '#555555', 800, 600)}" alt=""><span class="t" data-e>Best seller</span></div><div class="in"><h3 data-e>200 Sq.Yd</h3><div class="sz" data-e>1,800 sq.ft · Park facing</div><div class="pr"><span data-e>₹25 L</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Price</a></div></div>
    <div class="pc rv"><div class="p"><img data-img="p3" data-label="Plot photo 3" src="${P.photo('#c2a000', '#4a3d00', 800, 600)}" alt=""><span class="t" data-e>Corner</span></div><div class="in"><h3 data-e>300 Sq.Yd</h3><div class="sz" data-e>2,700 sq.ft · Corner plots</div><div class="pr"><span data-e>₹38 L</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Price</a></div></div>
  </div></div>
</section>

<section class="sec why" id="why" data-section="Why invest">
  <div class="wrap"><div class="head"><h2 data-e>Why this land is <em style="background:#111;color:#ffc800">smart</em></h2></div>
  <div class="wg" data-list><div class="wc rv"><i>✅</i><h3 data-e>Clear title &amp; approvals</h3><p data-e>DTCP approved, RERA registered, bank loans available.</p></div><div class="wc rv"><i>🛣️</i><h3 data-e>Near new highway</h3><p data-e>5 minutes from the upcoming Regional Ring Road exit.</p></div><div class="wc rv"><i>🏢</i><h3 data-e>IT corridor nearby</h3><p data-e>Major IT parks within 12 km, driving rental demand.</p></div><div class="wc rv"><i>💧</i><h3 data-e>Ready infrastructure</h3><p data-e>Black-top roads, drainage, water and street lights.</p></div><div class="wc rv"><i>🌳</i><h3 data-e>Park &amp; clubhouse</h3><p data-e>Landscaped parks and a community clubhouse.</p></div><div class="wc rv"><i>📈</i><h3 data-e>Proven appreciation</h3><p data-e>Nearby layouts have appreciated 2.5x in 4 years.</p></div></div></div>
</section>

<section class="sec" id="growth" data-section="Growth">
  <div class="wrap ap"><div class="box rv"><h3 data-e>Price growth nearby</h3><div class="bar"><div><span data-e>2020</span><span data-e>₹1,800/sq.yd</span></div><span class="t"><i style="width:22%"></i></span></div><div class="bar"><div><span data-e>2022</span><span data-e>₹3,200/sq.yd</span></div><span class="t"><i style="width:45%"></i></span></div><div class="bar"><div><span data-e>2024</span><span data-e>₹5,400/sq.yd</span></div><span class="t"><i style="width:72%"></i></span></div><div class="bar"><div><span data-e>2026 (est.)</span><span data-e>₹7,500/sq.yd</span></div><span class="t"><i style="width:100%"></i></span></div></div>
  <div class="rv"><h2 data-e>Land never <em>loses value</em></h2><p data-e>Every year, nearby plots have grown in value as infrastructure arrives. Buy today and benefit from the next wave of growth.</p><a class="btn d" data-cta="enroll" data-e>Get Investment Plan</a></div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Site video & gallery">
  <div class="wrap"><div class="head c"><h2 data-e>See the <em>site</em></h2></div><div class="vd rv" style="margin-bottom:40px"><div data-video data-label="Site video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  <div class="gal" data-list><div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#ffc800', '#7a6000', 900, 900)}" alt=""></div><div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#111111', '#444444', 600, 600)}" alt=""></div><div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#e8c940', '#5a4a00', 600, 600)}" alt=""></div><div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#555555', '#111111', 600, 600)}" alt=""></div><div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#c2a000', '#111111', 600, 600)}" alt=""></div></div></div>
</section>

<section class="sec" style="background:var(--bg);border-block:3px solid #111" data-section="Buyer reviews">
  <div class="wrap"><div class="head c"><h2 data-e>Buyers <em>trust us</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Bought a 200 sq.yd plot. Registry done in 3 days and everything was exactly as promised."</p><div class="who"><img data-img="u1" data-label="Buyer 1" src="${P.avatar('#ffc800', '#111')}" alt=""><span><b data-e>Naveen Kumar</b><small data-e>Plot owner</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Visited 6 projects, this had the clearest title and best infrastructure. Value already up 20%."</p><div class="who"><img data-img="u2" data-label="Buyer 2" src="${P.avatar('#111', '#ffc800')}" alt=""><span><b data-e>Shruti Menon</b><small data-e>Investor</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Team arranged loan, site visit and pick-up. Professional from start to finish."</p><div class="who"><img data-img="u3" data-label="Buyer 3" src="${P.avatar('#c2a000', '#4a3d00')}" alt=""><span><b data-e>Abdul Rahman</b><small data-e>Plot owner</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="contact" data-section="Visit us">
  <div class="wrap ct"><div class="ci rv"><span class="tag" data-e>Site office</span><h2 data-e>Visit the <em style="color:#111">land</em></h2><div class="r"><b data-e>Site address</b><span data-e>Plotline Layout, Highway Road, Your City – 000000</span></div><div class="r"><b data-e>Site visits</b><span data-e>Daily · 9:00 AM – 6:00 PM · Free pick-up</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Book Free Site Visit</a></div>
  <div class="map rv" data-map data-label="Site location" data-q="Shamshabad, Hyderabad"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><h2 class="rv" data-e>Don't wait. <em style="color:#111">Plots are selling.</em></h2><p class="rv" data-e>Only a few best-location plots left at launch price.</p><a class="btn rv" data-cta="enroll" data-e>Book Free Site Visit</a></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Plotline. DTCP / RERA No. XXXXXXXX. *T&amp;C apply.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
