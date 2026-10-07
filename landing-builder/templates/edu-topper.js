/* Template 4 — TOPPER: bold, high-energy competitive-exam coaching (JEE / NEET / UPSC / Boards) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'edu-topper',
    category: 'education',
    name: 'Topper',
    tagline: 'Bold & high-energy exam coaching',
    best: 'JEE · NEET · UPSC · SSC · Board exam coaching',
    colors: [
      { v: '--accent', l: 'Main (blue)', d: '#1b3fd8' },
      { v: '--accent2', l: 'Action (orange)', d: '#ff7a1a' }
    ],
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Batch Starting — Free Demo Class</title>
<meta name="description" content="Crack your exam with expert faculty, daily practice and a proven test series. Book your free demo class.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#1b3fd8;--accent2:#ff7a1a;--navy:#081241;--bg:#f3f5fc;--ink:#0e1530;--mut:#5a6382;--line:#e1e6f5}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Poppins',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3,.cond{font-family:'Barlow Condensed','Poppins',sans-serif;text-transform:uppercase;line-height:1.02;letter-spacing:.005em;font-weight:800}
em{font-style:normal;color:var(--accent2)}
.wrap{width:min(1200px,100% - 40px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 34px;background:var(--accent2);color:#fff;font-weight:700;font-size:16.5px;border-radius:10px;border:0;cursor:pointer;box-shadow:0 14px 30px -12px var(--accent2);transition:.2s;text-transform:uppercase;letter-spacing:.03em;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);padding-right:44px}
.btn:hover{transform:translateY(-3px);filter:brightness(1.06)}
.btn.o{background:transparent;color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.5);clip-path:none;padding-right:34px}
.btn.b{background:var(--accent);box-shadow:0 14px 30px -12px var(--accent)}
.urg{background:var(--accent2);color:#fff;font-weight:600;font-size:14px;padding:9px 0}
.urg .wrap{display:flex;justify-content:center;align-items:center;gap:18px;flex-wrap:wrap;text-align:center}
.urg .t{display:inline-flex;gap:6px;align-items:center;font-family:'Barlow Condensed';font-size:20px;font-weight:800;background:rgba(0,0,0,.2);padding:2px 14px;border-radius:99px;letter-spacing:.04em}
header{background:var(--navy);position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(255,255,255,.1)}
.nav{display:flex;align-items:center;justify-content:space-between;height:74px;gap:20px}
.brand{display:flex;align-items:center;gap:12px;color:#fff}
.brand img{width:44px;height:44px;border-radius:10px;object-fit:cover}
.brand b{font-family:'Barlow Condensed';font-size:28px;text-transform:uppercase;letter-spacing:.02em}
.links{display:flex;gap:28px;color:#b8c2ee;font-weight:500;font-size:14.5px}.links a:hover{color:#fff}
.nav .btn{padding:11px 26px;padding-right:34px;font-size:14px}
.hero{background:var(--navy);color:#fff;position:relative;overflow:hidden;padding:70px 0 100px}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(800px 500px at 85% 20%,rgba(27,63,216,.65),transparent 70%),radial-gradient(600px 400px at 0% 100%,rgba(255,122,26,.25),transparent 70%)}
.hero::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(180deg,#000,transparent 85%);-webkit-mask-image:linear-gradient(180deg,#000,transparent 85%)}
.hg{position:relative;z-index:1;display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.tag{display:inline-flex;gap:8px;align-items:center;background:rgba(255,122,26,.16);border:1px solid rgba(255,122,26,.5);color:#ffb27a;padding:7px 16px;border-radius:99px;font-weight:600;font-size:13.5px}
.hero h1{font-size:clamp(46px,7.4vw,98px);margin:20px 0 18px}
.hero h1 span{display:block;-webkit-text-stroke:2px #fff;color:transparent}
.hero p{font-size:18px;color:#c3cbf0;max-width:540px;margin-bottom:26px}
.ticks{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 20px;margin-bottom:34px;font-weight:600;font-size:15px}
.ticks li::before{content:"✔";color:var(--accent2);margin-right:10px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.dcard{background:#fff;color:var(--ink);border-radius:22px;padding:14px 14px 22px;box-shadow:0 50px 100px -30px rgba(0,0,0,.7);position:relative;transform:rotate(1.5deg)}
.dcard .lb-vid,.dcard [data-video]{border-radius:14px}
.ribbon{position:absolute;left:-14px;top:24px;z-index:3;background:var(--accent2);color:#fff;font-family:'Barlow Condensed';font-weight:800;font-size:20px;text-transform:uppercase;padding:6px 20px 6px 16px;clip-path:polygon(0 0,100% 0,calc(100% - 12px) 50%,100% 100%,0 100%);box-shadow:0 8px 20px rgba(0,0,0,.3)}
.dcard h3{font-size:26px;margin:16px 8px 4px;color:var(--navy)}.dcard p{margin:0 8px;color:var(--mut);font-size:14.5px;text-transform:none;max-width:none}
.res{background:var(--accent);color:#fff;padding:0}
.res .g{display:grid;grid-template-columns:repeat(4,1fr)}
.res .g>div{padding:36px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.18)}.res .g>div:last-child{border:0}
.res b{font-family:'Barlow Condensed';font-size:58px;font-weight:800;display:block;line-height:1}
.res span{font-size:14px;color:#cdd6ff;font-weight:500}
.sec{padding:96px 0}
.head{text-align:center;max-width:760px;margin:0 auto 52px}
.head .k{color:var(--accent2);font-weight:700;letter-spacing:.18em;font-size:13px;text-transform:uppercase}
.head h2{font-size:clamp(36px,5.4vw,64px);color:var(--navy);margin:8px 0 12px}
.head p{color:var(--mut);font-size:17.5px}
.wall{background:var(--bg)}
.tw{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.tp{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px -26px rgba(8,18,65,.5);transition:.25s;text-align:center;position:relative}
.tp:hover{transform:translateY(-8px)}
.tp .ph{aspect-ratio:1/1.05;background:linear-gradient(160deg,var(--accent),var(--navy));position:relative}
.tp .ph img{width:100%;height:100%;object-fit:cover}
.tp .rk{position:absolute;right:12px;top:12px;background:var(--accent2);color:#fff;font-family:'Barlow Condensed';font-weight:800;font-size:22px;padding:3px 14px;border-radius:8px;box-shadow:0 8px 18px rgba(0,0,0,.3)}
.tp .nm{padding:16px 10px 20px}.tp b{display:block;font-size:17px}.tp small{color:var(--mut);font-size:13.5px}
.bt{border:1.5px solid var(--line);border-radius:20px;overflow:hidden}
.br{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1fr 1.1fr;gap:12px;align-items:center;padding:20px 26px;border-top:1.5px solid var(--line);font-weight:500;font-size:15px}
.br:first-child{border-top:0}
.bh{background:var(--navy);color:#fff;font-family:'Barlow Condensed';text-transform:uppercase;font-size:17px;letter-spacing:.06em;font-weight:700}
.br b{font-size:17px;color:var(--navy)}.br .fee{font-weight:700;color:var(--accent)}
.br .mini{padding:10px 18px;border-radius:8px;background:var(--accent);color:#fff;font-weight:700;font-size:13.5px;text-align:center}.br .mini:hover{background:var(--accent2)}
.br:not(.bh):hover{background:#f7f9ff}
.feat{background:var(--navy);color:#fff}
.feat .head h2{color:#fff}.feat .head p{color:#b9c3ef}
.fg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.fc{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);border-radius:20px;padding:30px 28px;transition:.25s}
.fc:hover{background:rgba(255,255,255,.09);border-color:var(--accent2)}
.fc .i{font-size:34px;margin-bottom:16px}
.fc h3{font-size:26px;margin-bottom:8px}.fc p{color:#b9c3ef;font-size:15px;text-transform:none}
.fac{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.fcard{border-radius:20px;overflow:hidden;background:#fff;border:1.5px solid var(--line)}
.fcard .ph{aspect-ratio:1/1.1;background:linear-gradient(160deg,#dfe6ff,#fff)}.fcard .ph img{width:100%;height:100%;object-fit:cover}
.fcard .in{padding:16px 18px 20px}.fcard b{display:block;font-size:17px;color:var(--navy)}.fcard small{color:var(--mut);display:block}.fcard i{font-style:normal;display:inline-block;margin-top:8px;background:#eef2ff;color:var(--accent);font-weight:700;font-size:12.5px;padding:3px 12px;border-radius:99px}
.sch{padding:0 0 96px}
.sbox{background:linear-gradient(110deg,var(--accent2),#ff9a3d);border-radius:30px;color:#fff;padding:56px;display:grid;grid-template-columns:1.2fr .8fr;gap:30px;align-items:center;position:relative;overflow:hidden}
.sbox::after{content:"%";position:absolute;right:-30px;bottom:-110px;font-family:'Barlow Condensed';font-size:420px;font-weight:800;opacity:.12;line-height:1}
.sbox h2{font-size:clamp(34px,5vw,60px);margin-bottom:12px}.sbox p{font-size:17px;max-width:520px;opacity:.95}
.sbox .side{position:relative;z-index:1;background:#fff;color:var(--ink);border-radius:20px;padding:28px;text-align:center;box-shadow:0 30px 60px -24px rgba(0,0,0,.4)}
.sbox .side b{font-family:'Barlow Condensed';font-size:46px;color:var(--accent);display:block;line-height:1;text-transform:uppercase}
.sbox .side small{display:block;color:var(--mut);margin:6px 0 18px}
.sbox .side .btn{clip-path:none;padding-right:34px;width:100%}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{border:1.5px solid var(--line);border-radius:20px;padding:30px;background:#fff;position:relative}
.rc::before{content:"“";position:absolute;right:22px;top:8px;font-size:90px;font-family:Georgia;color:var(--accent);opacity:.12}
.rc p{margin-bottom:20px;font-size:15.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:50px;height:50px;border-radius:50%;object-fit:cover}.who b{display:block}.who small{color:var(--accent2);font-weight:700}
.faqbox{max-width:820px;margin:0 auto;display:grid;gap:12px}
.acc{border:1.5px solid var(--line);border-radius:14px;background:#fff}
.acc-h{display:flex;justify-content:space-between;gap:14px;padding:19px 24px;font-weight:600;font-size:16.5px;cursor:pointer}
.acc-h::after{content:"+";color:var(--accent2);font-size:26px;line-height:1;transition:transform .25s}
.acc.open .acc-h::after{transform:rotate(45deg)}.acc.open{border-color:var(--accent)}
.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.fin{background:var(--navy);color:#fff;text-align:center;padding:90px 0;position:relative;overflow:hidden}
.fin::before{content:"";position:absolute;inset:0;background:radial-gradient(700px 400px at 50% 0%,rgba(27,63,216,.7),transparent 70%)}
.fin .wrap{position:relative}.fin h2{font-size:clamp(38px,6vw,76px);max-width:900px;margin:0 auto 16px}.fin p{color:#c3cbf0;font-size:18px;margin-bottom:30px}
footer{background:#050b2b;color:#8e99c9;padding:34px 0;font-size:14px}
.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:center}
@media(max-width:960px){.links{display:none}.hg,.sbox{grid-template-columns:1fr}.dcard{transform:none}.res .g{grid-template-columns:1fr 1fr}.res .g>div:nth-child(2){border-right:0}.res .g>div:nth-child(-n+2){border-bottom:1px solid rgba(255,255,255,.18)}.tw,.fac{grid-template-columns:1fr 1fr}.fg,.rg{grid-template-columns:1fr}.bh{display:none}.br{grid-template-columns:1fr 1fr;padding:18px}.br>b{grid-column:1/-1}.sbox{padding:34px 24px}}
@media(max-width:560px){.brand b{font-size:21px}.nav .btn{white-space:nowrap;padding:11px 20px}.tw,.fac{grid-template-columns:1fr 1fr;gap:12px}.ticks{grid-template-columns:1fr}.btn{width:100%}.nav .btn{width:auto}}
</style>
</head>
<body>
<div class="urg" data-section="Offer bar" data-fixed><div class="wrap"><span data-e>🔥 New batch starts soon — Early-bird fee discount ends in</span><span class="t" data-countdown><span data-cd="d">02</span>d : <span data-cd="h">14</span>h : <span data-cd="m">36</span>m : <span data-cd="s">09</span>s</span></div></div>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#1b3fd8', '#ff7a1a', 'T')}" alt="Logo"><b data-e>TopRank Academy</b></a>
    <nav class="links"><a href="#results" data-e>Results</a><a href="#batches" data-e>Batches</a><a href="#faculty" data-e>Faculty</a><a href="#faq" data-e>FAQ</a></nav>
    <a class="btn" data-cta="enroll" data-e>Enroll Now</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap hg">
    <div>
      <span class="tag rv">🚀 <span data-e>NEW BATCH · ADMISSIONS OPEN</span></span>
      <h1 class="rv"><span data-e>Crack it in</span><em data-e>first attempt</em></h1>
      <p class="rv" data-e>India's most result-oriented coaching for JEE, NEET &amp; Boards. Top faculty, daily practice papers and an all-India test series that builds real rank.</p>
      <ul class="ticks rv" data-list><li data-e>Live + recorded classes</li><li data-e>Daily practice problems</li><li data-e>Weekly All-India tests</li><li data-e>24×7 doubt support</li></ul>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Free Demo Class</a><a class="btn o" data-cta="whatsapp" data-e>💬 Talk to Counsellor</a></div>
    </div>
    <div class="dcard rv">
      <span class="ribbon" data-e>Free Demo Class</span>
      <div data-video data-label="Demo class video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div>
      <h3 data-e>Watch a live demo lecture</h3><p data-e>See how our faculty teach before you decide. No signup needed.</p>
    </div>
  </div>
</section>

<section class="res" id="results" data-section="Results numbers">
  <div class="wrap g" data-list>
    <div><b data-e>1,850+</b><span data-e>Selections last year</span></div>
    <div><b data-e>AIR 3</b><span data-e>Best national rank</span></div>
    <div><b data-e>96%</b><span data-e>Students improved ranks</span></div>
    <div><b data-e>40K+</b><span data-e>Alumni network</span></div>
  </div>
</section>

<section class="sec wall" data-section="Toppers wall">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Our pride</span><h2 data-e>Meet our <em>toppers</em></h2><p data-e>Add your own topper photos — click any image to replace.</p></div>
    <div class="tw" data-list>
      <div class="tp rv"><div class="ph"><img data-img="tp1" data-label="Topper 1" src="${P.person('#1b3fd8', '#081241')}" alt=""><span class="rk" data-e>AIR 3</span></div><div class="nm"><b data-e>Aditya Verma</b><small data-e>JEE Advanced 2025</small></div></div>
      <div class="tp rv"><div class="ph"><img data-img="tp2" data-label="Topper 2" src="${P.person('#ff7a1a', '#c2410c')}" alt=""><span class="rk" data-e>AIR 11</span></div><div class="nm"><b data-e>Sneha Reddy</b><small data-e>NEET UG 2025</small></div></div>
      <div class="tp rv"><div class="ph"><img data-img="tp3" data-label="Topper 3" src="${P.person('#0f766e', '#134e4a')}" alt=""><span class="rk" data-e>AIR 27</span></div><div class="nm"><b data-e>Rohan Mishra</b><small data-e>JEE Main 2025</small></div></div>
      <div class="tp rv"><div class="ph"><img data-img="tp4" data-label="Topper 4" src="${P.person('#7c3aed', '#4c1d95')}" alt=""><span class="rk" data-e>AIR 42</span></div><div class="nm"><b data-e>Kavya Nair</b><small data-e>NEET UG 2025</small></div></div>
    </div>
  </div>
</section>

<section class="sec" id="batches" data-section="Batches & fees">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Choose your batch</span><h2 data-e>Upcoming <em>batches</em></h2><p data-e>Limited seats. Early-bird discount for the first 100 students.</p></div>
    <div class="bt rv" data-list>
      <div class="br bh" data-fixed-row><span>Batch</span><span>Class</span><span>Starts</span><span>Mode</span><span>Fee</span><span></span></div>
      <div class="br"><b data-e>Vijay — JEE 2026</b><span data-e>Class 12</span><span data-e>10 Nov</span><span data-e>Live online</span><span class="fee" data-e>₹24,999</span><a class="mini" data-cta="enroll" data-e>Enroll</a></div>
      <div class="br"><b data-e>Udaan — NEET 2026</b><span data-e>Class 12</span><span data-e>12 Nov</span><span data-e>Offline + Online</span><span class="fee" data-e>₹27,999</span><a class="mini" data-cta="enroll" data-e>Enroll</a></div>
      <div class="br"><b data-e>Lakshya — Foundation</b><span data-e>Class 9–10</span><span data-e>15 Nov</span><span data-e>Live online</span><span class="fee" data-e>₹12,999</span><a class="mini" data-cta="enroll" data-e>Enroll</a></div>
      <div class="br"><b data-e>Pragati — Droppers</b><span data-e>Repeaters</span><span data-e>20 Nov</span><span data-e>Offline</span><span class="fee" data-e>₹32,999</span><a class="mini" data-cta="enroll" data-e>Enroll</a></div>
    </div>
  </div>
</section>

<section class="sec feat" data-section="Why choose us">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>The TopRank edge</span><h2 data-e>Everything you need to <em>win</em></h2></div>
    <div class="fg" data-list>
      <div class="fc rv"><div class="i">🎯</div><h3 data-e>Exam-focused syllabus</h3><p data-e>Every chapter mapped to the latest pattern and weightage — zero time wasted.</p></div>
      <div class="fc rv"><div class="i">📊</div><h3 data-e>Test series &amp; analysis</h3><p data-e>Weekly All-India tests with detailed rank analysis and weak-topic reports.</p></div>
      <div class="fc rv"><div class="i">🧑‍🏫</div><h3 data-e>Top IITian faculty</h3><p data-e>Learn from teachers who have mentored thousands of selections.</p></div>
      <div class="fc rv"><div class="i">📱</div><h3 data-e>Learning app</h3><p data-e>Recorded lectures, notes, DPPs and quizzes available anytime on mobile.</p></div>
      <div class="fc rv"><div class="i">💬</div><h3 data-e>Doubt solving 24×7</h3><p data-e>Ask doubts on app or WhatsApp and get answers within minutes.</p></div>
      <div class="fc rv"><div class="i">🧘</div><h3 data-e>Mentorship &amp; wellness</h3><p data-e>Personal mentors to keep you motivated, consistent and stress-free.</p></div>
    </div>
  </div>
</section>

<section class="sec" id="faculty" data-section="Faculty">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Learn from the best</span><h2 data-e>Our <em>faculty</em></h2></div>
    <div class="fac" data-list>
      <div class="fcard rv"><div class="ph"><img data-img="fa1" data-label="Faculty 1" src="${P.person('#3b5bdb', '#dbe4ff')}" alt=""></div><div class="in"><b data-e>Vikas Sir</b><small data-e>Physics · IIT Delhi</small><i data-e>15 yrs exp.</i></div></div>
      <div class="fcard rv"><div class="ph"><img data-img="fa2" data-label="Faculty 2" src="${P.person('#f76707', '#ffe8cc')}" alt=""></div><div class="in"><b data-e>Pooja Ma'am</b><small data-e>Chemistry · IIT Bombay</small><i data-e>12 yrs exp.</i></div></div>
      <div class="fcard rv"><div class="ph"><img data-img="fa3" data-label="Faculty 3" src="${P.person('#0ca678', '#c3fae8')}" alt=""></div><div class="in"><b data-e>Amit Sir</b><small data-e>Maths · NIT Trichy</small><i data-e>14 yrs exp.</i></div></div>
      <div class="fcard rv"><div class="ph"><img data-img="fa4" data-label="Faculty 4" src="${P.person('#ae3ec9', '#f3d9fa')}" alt=""></div><div class="in"><b data-e>Dr. Meera</b><small data-e>Biology · AIIMS</small><i data-e>11 yrs exp.</i></div></div>
    </div>
  </div>
</section>

<section class="sch" data-section="Scholarship test">
  <div class="wrap"><div class="sbox rv">
    <div style="position:relative;z-index:1"><h2 data-e>Get up to 100% scholarship</h2><p data-e>Take our free national scholarship test from home and win fee waiver based on your rank. Registration is free.</p></div>
    <div class="side"><small data-e>Test date</small><b data-event-date data-e>Sun, 9 Nov · 10:00 AM IST</b><small data-e>Online · 60 minutes · Free</small><a class="btn" data-cta="enroll" data-e>Register Free →</a></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Student reviews">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Success stories</span><h2 data-e>What students <em>say</em></h2></div>
    <div class="rg" data-list>
      <div class="rc rv"><p data-e>"The test series and mentor support pushed me from 60 percentile to AIR 27. Truly life-changing."</p><div class="who"><img data-img="rv1" data-label="Student 1" src="${P.avatar('#1b3fd8', '#ff7a1a')}" alt=""><span><b data-e>Rohan Mishra</b><small data-e>AIR 27 · JEE Main</small></span></div></div>
      <div class="rc rv"><p data-e>"Biology faculty explains every diagram so clearly. I never needed any other book."</p><div class="who"><img data-img="rv2" data-label="Student 2" src="${P.avatar('#0ca678', '#1b3fd8')}" alt=""><span><b data-e>Kavya Nair</b><small data-e>AIR 42 · NEET UG</small></span></div></div>
      <div class="rc rv"><p data-e>"As a dropper I was low on confidence. The mentors rebuilt my plan and I made it to an NIT."</p><div class="who"><img data-img="rv3" data-label="Student 3" src="${P.avatar('#ff7a1a', '#ae3ec9')}" alt=""><span><b data-e>Imran Qureshi</b><small data-e>NIT Selection</small></span></div></div>
    </div>
  </div>
</section>

<section class="sec" id="faq" style="padding-top:0" data-section="FAQ">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Doubts?</span><h2 data-e>Frequently asked <em>questions</em></h2></div>
    <div class="faqbox" data-list>
      <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Can I attend a demo before paying?</div><div class="acc-b" data-acc-body data-e>Yes. Book a free demo class and decide only after you have experienced our teaching.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Are classes live or recorded?</div><div class="acc-b" data-acc-body data-e>Both. Attend live and revise later with recordings available in the app.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Is there an EMI option?</div><div class="acc-b" data-acc-body data-e>Yes, easy 3–6 month EMI with no extra charges is available on all batches.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>What if I miss a class?</div><div class="acc-b" data-acc-body data-e>Every class is recorded and uploaded within 2 hours, so you never miss a topic.</div></div>
    </div>
  </div>
</section>

<section class="fin" data-section="Final call to action">
  <div class="wrap"><h2 class="rv" data-e>Your rank is waiting. <em>Start today.</em></h2><p class="rv" data-e>Join thousands of toppers. Limited seats in every batch.</p><a class="btn rv" data-cta="enroll" data-e>Enroll Now →</a></div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 TopRank Academy. All rights reserved.</span><span><a data-cta="call" data-e>📞 Call us</a> &nbsp;·&nbsp; <a data-cta="whatsapp" data-e>💬 WhatsApp</a></span></div></footer>
</body>
</html>`
  });
})();
