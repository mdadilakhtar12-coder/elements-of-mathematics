/* Real Estate 1 — SKYLINE: premium apartment project launch (deep navy + gold) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 're-skyline',
    category: 'realestate',
    name: 'Skyline',
    tagline: 'Premium apartment project launch',
    best: 'Builder project launch · Luxury apartments · Pre-launch leads',
    colors: [
      { v: '--accent', l: 'Gold', d: '#c9a24b' },
      { v: '--accent2', l: 'Navy', d: '#0f1d3a' }
    ],
    defaults: {
      enroll: { title: 'Get price & brochure', sub: 'Share your details. Our property advisor will send the brochure and best price on WhatsApp.', button: 'Send Me The Details', thanks: 'Thank you! We will contact you shortly.', extraOn: true, extraLabel: 'Interested in', extraOptions: '2 BHK, 3 BHK, 4 BHK, Penthouse' },
      whatsapp: { message: 'Hi! I want to know the price and availability for the project.' },
      countdown: { on: false }, bar: { on: true, text: 'Get Price' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Skyline Residences — Luxury Apartments</title>
<meta name="description" content="Premium 2, 3 and 4 BHK residences with world-class amenities. Get price and brochure.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#c9a24b;--accent2:#0f1d3a;--accent-ink:#101828;--ink:#101828;--mut:#5d667a;--line:#e3e6ee;--bg:#f6f7fa}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Hanken Grotesk',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;letter-spacing:-.02em;line-height:1.08;font-weight:700}
em{font-style:normal;color:var(--accent)}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:var(--accent);color:var(--accent-ink);font-weight:600;font-size:15.5px;border:2px solid var(--accent);transition:.25s;cursor:pointer;border-radius:4px}
.btn:hover{background:transparent;color:var(--accent)}
.btn.o{background:transparent;color:#fff;border-color:rgba(255,255,255,.45)}.btn.o:hover{border-color:var(--accent);color:var(--accent)}
.k{font-size:12.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);font-weight:600}
header{position:absolute;top:0;left:0;right:0;z-index:20;color:#fff}
.nav{display:flex;align-items:center;justify-content:space-between;height:86px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Bricolage Grotesque';font-size:25px;font-weight:700}
.brand img{width:42px;height:42px;border-radius:8px;object-fit:cover}
.links{display:flex;gap:30px;font-size:14.5px;font-weight:500;color:#dde2ee}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:14px}
.hero{position:relative;min-height:760px;display:flex;align-items:flex-end;color:#fff;overflow:hidden;padding:150px 0 70px}
.hero .bg{position:absolute;inset:0}.hero .bg img{width:100%;height:100%;object-fit:cover}
.hero .bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,29,58,.55),rgba(15,29,58,.9))}
.hg{position:relative;display:grid;grid-template-columns:1.2fr .8fr;gap:50px;align-items:end}
.hero h1{font-size:clamp(44px,6.6vw,88px);margin:16px 0 18px}
.hero p{font-size:19px;color:#d5dbe9;max-width:560px;margin-bottom:30px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.price{background:rgba(255,255,255,.1);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.22);padding:28px;border-radius:14px}
.price small{display:block;color:#cfd6e6;font-size:13px;letter-spacing:.1em;text-transform:uppercase}
.price b{display:block;font-family:'Bricolage Grotesque';font-size:44px;line-height:1.1;margin:6px 0 14px}
.price ul{list-style:none;display:grid;gap:8px;font-size:15px;border-top:1px solid rgba(255,255,255,.2);padding-top:14px}
.price li{display:flex;justify-content:space-between}.price li span:last-child{color:var(--accent);font-weight:600}
.hl{background:var(--accent2);color:#fff}
.hl .g{display:grid;grid-template-columns:repeat(4,1fr)}
.hl .g>div{padding:32px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.12)}.hl .g>div:last-child{border:0}
.hl b{font-family:'Bricolage Grotesque';font-size:36px;color:var(--accent);display:block;line-height:1.1}.hl span{font-size:14px;color:#c4cce0}
.sec{padding:100px 0}
.head{max-width:680px;margin:0 auto 56px;text-align:center}
.head h2{font-size:clamp(34px,4.6vw,54px);margin:12px 0 14px;color:var(--accent2)}.head p{color:var(--mut);font-size:17.5px}
.ab{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.ab .im{aspect-ratio:5/4.5;overflow:hidden;border-radius:6px}.ab .im img{width:100%;height:100%;object-fit:cover}
.ab h2{font-size:clamp(34px,4.2vw,52px);margin:14px 0 20px;color:var(--accent2)}.ab p{color:var(--mut);font-size:17px;margin-bottom:16px}
.ticks{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-top:22px;font-weight:500}.ticks li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}
.cfg{background:var(--bg)}
.cg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.cc{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden;transition:.3s}.cc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -34px rgba(15,29,58,.5)}
.cc .p{aspect-ratio:4/3;background:#eef0f6}.cc .p img{width:100%;height:100%;object-fit:cover}
.cc .in{padding:24px 26px 28px}.cc h3{font-size:26px;color:var(--accent2)}.cc .sz{color:var(--mut);margin:4px 0 12px;font-size:15px}
.cc .pr{font-family:'Bricolage Grotesque';font-size:28px;font-weight:700;margin-bottom:16px}.cc .pr small{font-size:13px;font-weight:500;color:var(--mut)}
.cc .btn{width:100%;padding:13px}
.am{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.ai{padding:28px 22px;border:1px solid var(--line);border-radius:10px;text-align:center;transition:.3s}.ai:hover{border-color:var(--accent);background:var(--bg)}
.ai i{font-style:normal;font-size:34px;display:block;margin-bottom:10px}.ai b{font-family:'Bricolage Grotesque';font-size:18px;display:block;color:var(--accent2)}.ai span{font-size:14px;color:var(--mut)}
.vd{background:var(--accent2)}.vd .head h2{color:#fff}.vd .head p{color:#c4cce0}
.vbox{max-width:940px;margin:0 auto;border-radius:10px;overflow:hidden;border:6px solid rgba(255,255,255,.1)}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:210px;gap:12px}
.gal div{overflow:hidden;border-radius:6px}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal div:nth-child(4){grid-column:span 2}
.gal img{width:100%;height:100%;object-fit:cover;transition:transform .7s}.gal div:hover img{transform:scale(1.07)}
.loc{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:stretch}
.loc h2{font-size:clamp(34px,4vw,50px);margin:12px 0 22px;color:var(--accent2)}
.ll{display:grid;gap:0}.ll div{display:flex;justify-content:space-between;gap:14px;padding:15px 0;border-bottom:1px solid var(--line);font-weight:500}.ll span:last-child{color:var(--accent);font-weight:700;white-space:nowrap}
.map{min-height:420px;border-radius:10px;border:1px solid var(--line)}
.dev{background:var(--bg)}
.dg{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.dg h2{font-size:clamp(32px,4vw,48px);margin:12px 0 18px;color:var(--accent2)}.dg p{color:var(--mut);font-size:17px}
.ds{display:grid;grid-template-columns:1fr 1fr;gap:18px}.ds div{background:#fff;border:1px solid var(--line);border-radius:10px;padding:26px;text-align:center}.ds b{font-family:'Bricolage Grotesque';font-size:38px;color:var(--accent);display:block;line-height:1.1}.ds span{color:var(--mut);font-size:14px}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}
.acc{border:1px solid var(--line);border-radius:10px}.acc-h{display:flex;justify-content:space-between;gap:14px;padding:19px 24px;font-weight:600;font-size:17px;cursor:pointer;font-family:'Bricolage Grotesque'}
.acc-h::after{content:"+";color:var(--accent);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}
.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.final{background:linear-gradient(120deg,var(--accent2),#1b2f5e);color:#fff;text-align:center;padding:90px 0}
.final h2{font-size:clamp(34px,5vw,62px);max-width:780px;margin:12px auto 16px}.final p{color:#cfd6e6;max-width:540px;margin:0 auto 30px;font-size:18px}
.rera{font-size:12.5px;color:var(--mut);padding:26px 0;border-top:1px solid var(--line)}
footer{background:#0a1226;color:#9aa4bd;padding:30px 0;font-size:14px}.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.ab,.loc,.dg{grid-template-columns:1fr;gap:40px}.hl .g{grid-template-columns:1fr 1fr}.hl .g>div:nth-child(2){border-right:0}.cg{grid-template-columns:1fr}.am{grid-template-columns:1fr 1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:160px}.sec{padding:70px 0}.nav .btn{display:none}.ticks{grid-template-columns:1fr}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#c9a24b', '#0f1d3a', 'S')}" alt="Logo"><span data-e>Skyline</span></a>
  <nav class="links"><a href="#about" data-e>Overview</a><a href="#config" data-e>Configurations</a><a href="#amenities" data-e>Amenities</a><a href="#location" data-e>Location</a></nav>
  <a class="btn" data-cta="enroll" data-e>Get Price</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="bg"><img data-img="hero" data-label="Hero building photo" src="${P.bg('#2a3d6b', '#0f1d3a', 1600, 1000)}" alt=""></div>
  <div class="wrap hg">
    <div><span class="k rv" data-e>Pre-launch · RERA registered</span><h1 class="rv" data-e>Live above it all at <em>Skyline Residences</em></h1><p class="rv" data-e>Luxury 2, 3 &amp; 4 BHK homes with sweeping city views, 40+ lifestyle amenities and possession in 2027.</p><div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Download Brochure</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div></div>
    <div class="price rv"><small data-e>Starting price</small><b data-e>₹1.35 Cr*</b><ul data-list><li><span data-e>2 BHK · 1,150 sq.ft</span><span data-e>₹1.35 Cr</span></li><li><span data-e>3 BHK · 1,650 sq.ft</span><span data-e>₹1.95 Cr</span></li><li><span data-e>4 BHK · 2,300 sq.ft</span><span data-e>₹2.85 Cr</span></li></ul></div>
  </div>
</section>
<section class="hl" data-section="Key numbers"><div class="wrap g" data-list><div><b data-e>5 Acres</b><span data-e>Land parcel</span></div><div><b data-e>2 Towers</b><span data-e>38 floors each</span></div><div><b data-e>70%</b><span data-e>Open green area</span></div><div><b data-e>Dec 2027</b><span data-e>RERA possession</span></div></div></section>

<section class="sec" id="about" data-section="Overview">
  <div class="wrap ab"><div class="im rv"><img data-img="about" data-label="Project photo" src="${P.photo('#34508f', '#0f1d3a', 900, 800)}" alt=""></div>
  <div class="rv"><span class="k" data-e>Project overview</span><h2 data-e>Where luxury meets the <em>skyline</em></h2><p data-e>Skyline Residences is a landmark address by a developer trusted for 25 years and 12,000+ delivered homes. Spacious, vastu-compliant layouts, premium specifications and a clubhouse designed for families.</p><ul class="ticks" data-list><li data-e>Vastu-compliant homes</li><li data-e>Italian marble flooring</li><li data-e>Smart-home ready</li><li data-e>Podium parking</li></ul></div></div>
</section>

<section class="sec cfg" id="config" data-section="Configurations & price">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Configurations</span><h2 data-e>Homes designed around <em>you</em></h2><p data-e>Click any image to replace it with your floor plan.</p></div>
  <div class="cg" data-list>
    <div class="cc rv"><div class="p"><img data-img="fp1" data-label="Floor plan 1" src="${P.photo('#e8ebf3', '#c5cbe0', 800, 600)}" alt=""></div><div class="in"><h3 data-e>2 BHK Premium</h3><div class="sz" data-e>1,150 sq.ft carpet · 2 baths · Balcony</div><div class="pr"><span data-e>₹1.35 Cr</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Floor Plan</a></div></div>
    <div class="cc rv"><div class="p"><img data-img="fp2" data-label="Floor plan 2" src="${P.photo('#e8ebf3', '#c5cbe0', 800, 600)}" alt=""></div><div class="in"><h3 data-e>3 BHK Luxe</h3><div class="sz" data-e>1,650 sq.ft carpet · 3 baths · Study</div><div class="pr"><span data-e>₹1.95 Cr</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Floor Plan</a></div></div>
    <div class="cc rv"><div class="p"><img data-img="fp3" data-label="Floor plan 3" src="${P.photo('#e8ebf3', '#c5cbe0', 800, 600)}" alt=""></div><div class="in"><h3 data-e>4 BHK Grand</h3><div class="sz" data-e>2,300 sq.ft carpet · 4 baths · Terrace</div><div class="pr"><span data-e>₹2.85 Cr</span> <small data-e>onwards*</small></div><a class="btn" data-cta="enroll" data-e>Get Floor Plan</a></div></div>
  </div></div>
</section>

<section class="sec" id="amenities" data-section="Amenities">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Amenities</span><h2 data-e>A resort-style <em>lifestyle</em></h2></div>
  <div class="am" data-list>
    <div class="ai rv"><i>🏊</i><b data-e>Infinity pool</b><span data-e>Rooftop with skyline view</span></div><div class="ai rv"><i>🏋️</i><b data-e>Fitness studio</b><span data-e>Fully equipped gym &amp; yoga deck</span></div><div class="ai rv"><i>🌳</i><b data-e>Landscaped gardens</b><span data-e>3 acres of greens</span></div><div class="ai rv"><i>🎾</i><b data-e>Sports courts</b><span data-e>Tennis, badminton, cricket net</span></div>
    <div class="ai rv"><i>🎬</i><b data-e>Mini theatre</b><span data-e>Private screening room</span></div><div class="ai rv"><i>🧒</i><b data-e>Kids' zone</b><span data-e>Play area &amp; creche</span></div><div class="ai rv"><i>🛡️</i><b data-e>24×7 security</b><span data-e>CCTV &amp; smart access</span></div><div class="ai rv"><i>⚡</i><b data-e>Power backup</b><span data-e>100% DG &amp; EV charging</span></div>
  </div></div>
</section>

<section class="sec vd" data-section="Video walkthrough">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Walkthrough</span><h2 data-e>Take a <em>virtual tour</em></h2><p data-e>See the sample flat and the clubhouse in 3 minutes.</p></div><div class="vbox rv"><div data-video data-label="Project video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div>
</section>

<section class="sec" data-section="Gallery">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Gallery</span><h2 data-e>Glimpses of <em>Skyline</em></h2></div>
  <div class="gal" data-list><div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#34508f', '#0f1d3a', 900, 900)}" alt=""></div><div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#c9a24b', '#6b5420', 600, 600)}" alt=""></div><div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#1b2f5e', '#34508f', 600, 600)}" alt=""></div><div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#6b5420', '#0f1d3a', 900, 450)}" alt=""></div><div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#4a6bb5', '#1b2f5e', 600, 600)}" alt=""></div><div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#c9a24b', '#34508f', 600, 600)}" alt=""></div></div></div>
</section>

<section class="sec cfg" id="location" data-section="Location">
  <div class="wrap loc"><div class="rv"><span class="k" data-e>Location advantage</span><h2 data-e>Connected to <em>everything</em></h2>
    <div class="ll" data-list><div><span data-e>International airport</span><span data-e>18 min</span></div><div><span data-e>Metro station</span><span data-e>5 min</span></div><div><span data-e>IT park &amp; business district</span><span data-e>10 min</span></div><div><span data-e>Top schools &amp; hospitals</span><span data-e>7 min</span></div><div><span data-e>Shopping mall</span><span data-e>6 min</span></div></div></div>
    <div class="map rv" data-map data-label="Project location" data-q="Hinjewadi, Pune"></div></div>
</section>

<section class="sec dev" data-section="About the developer">
  <div class="wrap dg"><div class="rv"><span class="k" data-e>The developer</span><h2 data-e>25 years of <em>trust</em></h2><p data-e>Delivering landmark residential and commercial projects across the city with a spotless record of on-time possession and transparent dealings.</p></div>
  <div class="ds rv" data-list><div><b data-e>25+</b><span data-e>Years</span></div><div><b data-e>12,000+</b><span data-e>Homes delivered</span></div><div><b data-e>18</b><span data-e>Projects</span></div><div><b data-e>100%</b><span data-e>RERA compliant</span></div></div></div>
</section>

<section class="sec" data-section="FAQ">
  <div class="wrap"><div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Common <em>questions</em></h2></div>
  <div class="faqbox" data-list>
    <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>What is the possession date?</div><div class="acc-b" data-acc-body data-e>RERA possession is December 2027. Construction updates are shared with every buyer.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Is home loan available?</div><div class="acc-b" data-acc-body data-e>Yes. We are approved by all leading banks and help with quick loan processing.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Can I schedule a site visit?</div><div class="acc-b" data-acc-body data-e>Absolutely. Enquire and our advisor will arrange a free site visit with pick-up.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>What are the payment plans?</div><div class="acc-b" data-acc-body data-e>Flexible construction-linked and 10:90 plans are available. Ask for the detailed price sheet.</div></div>
  </div></div>
</section>

<section class="final" data-section="Final call to action"><div class="wrap"><h2 class="rv" data-e>Pre-launch prices end soon</h2><p class="rv" data-e>Book a free site visit and lock the best price on the best floors.</p><a class="btn rv" data-cta="enroll" data-e>Get Price &amp; Brochure</a></div></section>
<div class="wrap rera" data-section="RERA disclaimer"><span data-e>RERA No. PXXXXXXXXXXX. Prices, specifications and images are indicative and subject to change. *T&amp;C apply. Visit the RERA website for project details.</span></div>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 Skyline Developers. All rights reserved.</span><span><a data-cta="call" data-e>📞 Call us</a> &nbsp;·&nbsp; <a data-cta="whatsapp" data-e>💬 WhatsApp</a></span></div></footer>
</body>
</html>`
  });
})();
