/* Clinic 5 — VISION: eye care / LASIK / cataract centre (indigo + cyan, clean) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'clinic-vision',
    category: 'clinic',
    name: 'Vision',
    tagline: 'Clean, clear eye-care & LASIK centre',
    best: 'Eye hospital · LASIK · Cataract · Optical store · Pediatric eye care',
    colors: [
      { v: '--accent', l: 'Indigo', d: '#3a35c8' },
      { v: '--accent2', l: 'Cyan', d: '#19b7d6' }
    ],
    defaults: {
      enroll: { title: 'Book an eye check-up', sub: 'Share your details and we will confirm your slot on WhatsApp.', button: 'Book Eye Check-up', thanks: 'Check-up requested!', extraOn: true, extraLabel: 'Service', extraOptions: 'Comprehensive Eye Exam, LASIK Consultation, Cataract Surgery, Kids Eye Care, Glasses / Lenses, Dry Eye / Retina' },
      whatsapp: { message: 'Hi! I would like to book an eye check-up.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Check-up' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vision Eye Centre — Book Eye Check-up</title>
<meta name="description" content="Advanced eye care: LASIK, cataract, retina and kids eye care. Book your eye check-up.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
<style>
:root{--accent:#3a35c8;--accent2:#19b7d6;--accent-ink:#fff;--bg:#f4f5ff;--ink:#14143a;--mut:#5f6088;--line:#e1e2f6}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'DM Sans',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:17px}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.1;letter-spacing:-.01em}
em{font-style:italic;color:var(--accent2)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:var(--accent);color:#fff;font-weight:600;font-size:16px;border-radius:99px;border:2px solid var(--accent);transition:.25s;cursor:pointer;font-family:'DM Sans'}
.btn:hover{background:var(--accent2);border-color:var(--accent2);transform:translateY(-3px)}
.btn.o{background:transparent;color:var(--accent)}.btn.o:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.k{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent2)}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'DM Serif Display';font-size:27px;color:var(--accent)}
.brand img{width:42px;height:42px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:30px;font-weight:500;font-size:15.5px;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:15px}
.hero{background:linear-gradient(135deg,#f4f5ff,#e8f9fd);padding:70px 0 80px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;right:-60px;top:-60px;width:520px;height:520px;border-radius:50%;border:60px solid rgba(25,183,214,.14)}
.hg{display:grid;grid-template-columns:1.05fr .95fr;gap:50px;align-items:center;position:relative}
.hero h1{font-size:clamp(42px,6vw,78px);margin:16px 0 18px;color:var(--accent)}
.hero p{color:var(--mut);font-size:19px;max-width:500px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:30px}
.tr{display:flex;gap:26px;flex-wrap:wrap;font-weight:500;font-size:15px;color:var(--mut)}.tr span::before{content:"✓";color:var(--accent2);margin-right:8px;font-weight:800}
.hv{position:relative;max-width:480px;margin:0 auto}.hv .a{aspect-ratio:1/1;border-radius:50%;overflow:hidden;border:10px solid #fff;box-shadow:0 40px 80px -36px rgba(58,53,200,.55);background:linear-gradient(160deg,var(--accent2),var(--accent))}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;background:#fff;border-radius:16px;padding:12px 18px;box-shadow:0 20px 40px -16px rgba(58,53,200,.4);font-weight:600;font-size:14.5px;display:flex;gap:10px;align-items:center}.hv .c.a1{left:-14px;top:50px}.hv .c.a2{right:-10px;bottom:40px}
.nm{background:var(--accent);color:#fff}.ng{display:grid;grid-template-columns:repeat(4,1fr)}.ng div{padding:30px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.14)}.ng div:last-child{border:0}.ng b{font-family:'DM Serif Display';font-size:40px;font-weight:400;color:#9fe9f7;display:block;line-height:1.1}.ng span{font-size:14px;color:#c9c8f5}
.sec{padding:96px 0}
.head{max-width:640px;margin:0 auto 50px;text-align:center}.head h2{font-size:clamp(34px,4.6vw,54px);margin:12px 0 12px;color:var(--accent)}.head p{color:var(--mut);font-size:18px}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.tc{border:1.5px solid var(--line);border-radius:26px;padding:34px 30px;transition:.3s;background:#fff;position:relative;overflow:hidden}.tc:hover{border-color:var(--accent2);transform:translateY(-8px);box-shadow:0 30px 50px -34px var(--accent)}
.tc i{font-style:normal;width:64px;height:64px;border-radius:20px;background:var(--bg);display:grid;place-items:center;font-size:30px;margin-bottom:16px}.tc h3{font-size:27px;margin-bottom:8px;color:var(--accent)}.tc p{color:var(--mut);font-size:15.5px;margin-bottom:14px}.tc span{color:var(--accent2);font-weight:700;font-size:15px}
.ls{background:var(--bg)}.lg2{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.lg2 h2{font-size:clamp(34px,4.4vw,56px);margin:12px 0 16px;color:var(--accent)}.lg2 p{color:var(--mut);margin-bottom:16px}
.ck{list-style:none;display:grid;gap:11px;margin:20px 0 28px;font-weight:500}.ck li::before{content:"✓";color:var(--accent2);margin-right:10px;font-weight:800}
.bx{aspect-ratio:4/3;border-radius:28px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(58,53,200,.5)}.bx .lbl{position:absolute;top:14px;z-index:2;background:#fff;color:var(--accent);padding:5px 15px;border-radius:99px;font-size:13px;font-weight:700}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px}
.st2{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.sb{text-align:center;padding:30px 20px;border-radius:22px;background:#fff;border:1.5px solid var(--line)}.sb i{display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:var(--accent);color:#fff;font-family:'DM Serif Display';font-style:normal;font-size:24px;margin:0 auto 14px}.sb h3{font-size:22px;margin-bottom:6px;color:var(--accent)}.sb p{color:var(--mut);font-size:15px}
.dr{background:var(--accent);color:#fff}.dr .head h2{color:#fff}.dr .head p{color:#c9c8f5}.dr .k{color:#9fe9f7}
.dg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.dc{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:26px;overflow:hidden}.dc .p{aspect-ratio:1/1;background:linear-gradient(160deg,var(--accent2),#2a25a0)}.dc .p img{width:100%;height:100%;object-fit:cover}.dc .in{padding:22px 24px 26px}.dc h3{font-size:25px}.dc .q{color:#9fe9f7;font-weight:600;font-size:14.5px}.dc p{color:#c9c8f5;font-size:14.5px;margin-top:6px}
.vd{max-width:900px;margin:0 auto;border-radius:28px;overflow:hidden;border:8px solid var(--bg);box-shadow:0 40px 80px -36px rgba(58,53,200,.5)}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{border:1.5px solid var(--line);border-radius:26px;padding:36px 30px;text-align:center;position:relative;background:#fff}.pc.h{border-color:var(--accent);box-shadow:0 30px 60px -36px var(--accent)}.pc .fl{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:3px 16px;border-radius:99px;font-size:12.5px;font-weight:700}
.pc h3{font-size:26px;color:var(--accent)}.pc .pr{font-family:'DM Serif Display';font-size:46px;margin:8px 0;color:var(--ink)}.pc .pr small{font-family:'DM Sans';font-size:14px;color:var(--mut)}.pc ul{list-style:none;display:grid;gap:9px;margin:16px 0 24px;color:var(--mut);font-size:15.5px}.pc li::before{content:"✓";color:var(--accent2);margin-right:10px;font-weight:800}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.rc{background:var(--bg);border-radius:24px;padding:32px 30px}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.rc p{font-family:'DM Serif Display';font-size:21px;line-height:1.4;margin-bottom:18px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15.5px}.who small{color:var(--mut)}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}.acc{border:1.5px solid var(--line);border-radius:18px}.acc-h{display:flex;justify-content:space-between;gap:14px;padding:19px 24px;font-weight:600;font-size:17.5px;cursor:pointer}.acc-h::after{content:"+";color:var(--accent2);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}.acc.open{border-color:var(--accent2)}.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}.ci{background:var(--accent);color:#fff;border-radius:30px;padding:46px 40px}.ci h2{font-size:clamp(30px,3.6vw,44px);margin:12px 0 22px}.ci .k{color:#9fe9f7}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#9fe9f7}.ci span{font-size:18px}
.map{min-height:400px;border-radius:30px;border:1.5px solid var(--line)}
.final{padding:0 0 96px}.final .box{background:linear-gradient(120deg,var(--accent),#2a25a0);color:#fff;border-radius:36px;padding:76px 30px;text-align:center}.final h2{font-size:clamp(34px,5vw,60px);max-width:760px;margin:0 auto 14px}.final p{color:#c9c8f5;max-width:520px;margin:0 auto 28px;font-size:18px}.final .btn{background:#fff;color:var(--accent);border-color:#fff}
footer{padding:28px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.lg2,.ct{grid-template-columns:1fr;gap:40px}.hv .c.a1{left:0}.hv .c.a2{right:0}.ng{grid-template-columns:1fr 1fr}.ng div:nth-child(2){border-right:0}.tg,.dg,.pk,.rg{grid-template-columns:1fr}.st2{grid-template-columns:1fr 1fr}.sec{padding:70px 0}.nav .btn{display:none}}
@media(max-width:560px){.st2{grid-template-columns:1fr}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#3a35c8', '#19b7d6', 'V')}" alt="Logo"><span data-e>Vision Eye Centre</span></a>
  <nav class="links"><a href="#services" data-e>Services</a><a href="#lasik" data-e>LASIK</a><a href="#doctors" data-e>Doctors</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Check-up</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>👁 Advanced eye care for the whole family</span><h1 class="rv" data-e>See the world <em>clearly</em> again</h1><p class="rv" data-e>From LASIK to cataract and kids' eye care, our experienced eye surgeons use the latest technology for safe, precise and comfortable treatment.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Eye Check-up</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="tr rv" data-list><span data-e>Bladeless LASIK</span><span data-e>Same-day surgery</span><span data-e>Cashless insurance</span></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.person('#19b7d6', '#3a35c8')}" alt=""></div><div class="c a1">👓 <span data-e>Free glasses check</span></div><div class="c a2">⭐ <span data-e>4.9 · 6,000 reviews</span></div></div>
</div></section>
<section class="nm" data-section="Trust numbers"><div class="wrap ng" data-list><div><b data-e>50,000+</b><span data-e>Surgeries done</span></div><div><b data-e>20 yrs</b><span data-e>Experience</span></div><div><b data-e>99%</b><span data-e>Success rate</span></div><div><b data-e>6</b><span data-e>Eye surgeons</span></div></div></section>

<section class="sec" id="services" data-section="Services">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our services</span><h2 data-e>Complete <em>eye care</em></h2><p data-e>Every treatment begins with a thorough, comfortable examination.</p></div>
  <div class="tg" data-list>
    <div class="tc rv"><i>🔍</i><h3 data-e>Comprehensive Eye Exam</h3><p data-e>Vision, pressure, retina and dry-eye screening in one visit.</p><span data-e>From ₹499</span></div>
    <div class="tc rv"><i>⚡</i><h3 data-e>LASIK &amp; Smile Surgery</h3><p data-e>Remove glasses in minutes with bladeless, painless laser vision correction.</p><span data-e>From ₹35,000 / eye</span></div>
    <div class="tc rv"><i>🌫️</i><h3 data-e>Cataract Surgery</h3><p data-e>Micro-incision phaco with premium foldable lenses and quick recovery.</p><span data-e>From ₹18,000 / eye</span></div>
    <div class="tc rv"><i>🧒</i><h3 data-e>Kids Eye Care</h3><p data-e>Early detection of squint, lazy eye and power for healthy vision.</p><span data-e>From ₹399</span></div>
    <div class="tc rv"><i>🩸</i><h3 data-e>Retina &amp; Glaucoma</h3><p data-e>Advanced diagnosis and treatment for diabetic eye disease and glaucoma.</p><span data-e>Consultation based</span></div>
    <div class="tc rv"><i>👓</i><h3 data-e>Optical Store</h3><p data-e>Designer frames, premium lenses and contact lenses at fair prices.</p><span data-e>Frames from ₹999</span></div>
  </div></div>
</section>

<section class="sec ls" id="lasik" data-section="LASIK spotlight">
  <div class="wrap lg2"><div class="rv"><span class="k" data-e>Laser vision correction</span><h2 data-e>Say goodbye to <em>glasses</em></h2><p data-e>Over 90% of our LASIK patients achieve 6/6 vision. Most go home within an hour and return to work the next day.</p><ul class="ck" data-list><li data-e>Free LASIK eligibility test</li><li data-e>Bladeless, painless procedure</li><li data-e>Lifetime follow-up support</li></ul><a class="btn" data-cta="enroll" data-e>Check LASIK Eligibility</a></div>
  <div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#c9cbe8', '#7a7cb0', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#c8f1f8', '#19b7d6', 900, 675)}" alt="After"><span class="lbl l" data-e>Blurry</span><span class="lbl r" data-e>Clear</span></div></div>
</section>

<section class="sec" data-section="How LASIK works">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Your journey</span><h2 data-e>4 simple <em>steps</em></h2></div>
  <div class="st2" data-list><div class="sb rv"><i>1</i><h3 data-e>Free screening</h3><p data-e>Eligibility and corneal mapping.</p></div><div class="sb rv"><i>2</i><h3 data-e>Plan</h3><p data-e>Surgeon explains the best option.</p></div><div class="sb rv"><i>3</i><h3 data-e>Procedure</h3><p data-e>10-minute painless laser treatment.</p></div><div class="sb rv"><i>4</i><h3 data-e>Recovery</h3><p data-e>Follow-up visits and eye-drop care.</p></div></div></div>
</section>

<section class="sec dr" id="doctors" data-section="Surgeons">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our surgeons</span><h2 data-e>Experts you can <em style="color:#9fe9f7">trust</em></h2></div>
  <div class="dg" data-list>
    <div class="dc rv"><div class="p"><img data-img="d1" data-label="Doctor 1" src="${P.person('#3a35c8', '#19b7d6')}" alt=""></div><div class="in"><h3 data-e>Dr. Vikram Sethi</h3><div class="q" data-e>MS Ophthalmology · LASIK Surgeon</div><p data-e>20 yrs · 25,000+ LASIK procedures</p></div></div>
    <div class="dc rv"><div class="p"><img data-img="d2" data-label="Doctor 2" src="${P.person('#19b7d6', '#2a25a0')}" alt=""></div><div class="in"><h3 data-e>Dr. Meenakshi Rao</h3><div class="q" data-e>Cataract &amp; Retina Specialist</div><p data-e>16 yrs · 20,000+ surgeries</p></div></div>
    <div class="dc rv"><div class="p"><img data-img="d3" data-label="Doctor 3" src="${P.person('#2a25a0', '#9fe9f7')}" alt=""></div><div class="in"><h3 data-e>Dr. Faisal Khan</h3><div class="q" data-e>Pediatric Ophthalmologist</div><p data-e>12 yrs · squint &amp; lazy eye</p></div></div>
  </div></div>
</section>

<section class="sec" data-section="Packages">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Eye health plans</span><h2 data-e>Transparent <em>pricing</em></h2></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Eye Screening</h3><div class="pr"><span data-e>₹499</span> <small data-e>/ visit</small></div><ul data-list><li data-e>Vision &amp; power test</li><li data-e>Eye pressure check</li><li data-e>Doctor consultation</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
    <div class="pc h rv"><span class="fl" data-e>Popular</span><h3 data-e>Complete Eye Check</h3><div class="pr"><span data-e>₹1,499</span> <small data-e>/ visit</small></div><ul data-list><li data-e>Dilated retina exam</li><li data-e>Glaucoma &amp; dry-eye test</li><li data-e>Digital report</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
    <div class="pc rv"><h3 data-e>Family Pack</h3><div class="pr"><span data-e>₹3,499</span> <small data-e>/ 4 members</small></div><ul data-list><li data-e>Complete check for 4</li><li data-e>Kids vision screening</li><li data-e>10% off on glasses</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Centre video"><div class="wrap"><div class="head rv"><span class="k" data-e>Inside our centre</span><h2 data-e>Meet the <em>team</em></h2></div><div class="vd rv"><div data-video data-label="Centre video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div></section>

<section class="sec" style="padding-top:0" data-section="Patient reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Patient stories</span><h2 data-e>Life in <em>high definition</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"After 18 years of glasses, I woke up the next morning seeing the clock clearly. Life-changing."</p><div class="who"><img data-img="u1" data-label="Patient 1" src="${P.avatar('#3a35c8', '#19b7d6')}" alt=""><span><b data-e>Kabir Anand</b><small data-e>LASIK patient</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My mother's cataract surgery took 15 minutes and she was reading the same evening."</p><div class="who"><img data-img="u2" data-label="Patient 2" src="${P.avatar('#19b7d6', '#2a25a0')}" alt=""><span><b data-e>Divya Nambiar</b><small data-e>Cataract family</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Dr. Faisal was so gentle with my 4-year-old. Her squint is much better now."</p><div class="who"><img data-img="u3" data-label="Patient 3" src="${P.avatar('#2a25a0', '#9fe9f7')}" alt=""><span><b data-e>Rina Chatterjee</b><small data-e>Kids eye care</small></span></div></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="FAQ"><div class="wrap"><div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Common <em>questions</em></h2></div>
  <div class="faqbox" data-list>
    <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Is LASIK safe and painless?</div><div class="acc-b" data-acc-body data-e>Yes. LASIK is a quick, painless procedure done with numbing drops. Eligibility is checked in a free screening.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>How long is cataract surgery recovery?</div><div class="acc-b" data-acc-body data-e>Most patients resume normal activities within a few days. The surgery itself takes about 15 minutes.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Do you accept insurance?</div><div class="acc-b" data-acc-body data-e>Yes. We accept cashless insurance for cataract and other eligible surgeries. EMI is available for LASIK.</div></div>
  </div></div></section>

<section class="sec" id="contact" style="padding-top:0" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Visit us</span><h2 data-e>See us <em style="color:#9fe9f7">today</em></h2><div class="r"><b data-e>Centre</b><span data-e>Vision Eye Centre, Medical Square, Your City</span></div><div class="r"><b data-e>Timings</b><span data-e>Mon – Sat · 9:00 AM – 7:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" style="background:#fff;color:var(--accent);border-color:#fff" data-cta="enroll" data-e>Book Eye Check-up</a></div>
  <div class="map rv" data-map data-label="Centre location" data-q="T Nagar, Chennai"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Your eyes deserve the best</h2><p data-e>Book a check-up today and take the first step to clearer vision.</p><a class="btn" data-cta="enroll" data-e>Book Eye Check-up →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Vision Eye Centre. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
