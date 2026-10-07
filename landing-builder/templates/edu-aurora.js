/* Template 1 — AURORA: dark, glowing webinar / masterclass funnel */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'edu-aurora',
    category: 'education',
    name: 'Aurora',
    tagline: 'Dark & glowing live-webinar funnel',
    best: 'Free masterclass · Webinar · Course launch',
    colors: [
      { v: '--accent', l: 'Main colour', d: '#8b5cf6' },
      { v: '--accent2', l: 'Glow colour', d: '#22d3ee' }
    ],
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Free Live Masterclass</title>
<meta name="description" content="Join our free live masterclass and learn the exact system toppers use.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#8b5cf6;--accent2:#22d3ee;--bg:#06060d;--ink:#f4f4fb;--mut:#a0a3bd;--line:rgba(255,255,255,.09);--card:rgba(255,255,255,.045)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Plus Jakarta Sans',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Sora',system-ui,sans-serif;letter-spacing:-.02em;line-height:1.15}
em{font-style:normal;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
.wrap{width:min(1160px,100% - 40px);margin:0 auto}
.glow{position:absolute;border-radius:50%;filter:blur(110px);opacity:.38;pointer-events:none}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 30px;border-radius:999px;font-weight:700;font-size:16px;background:linear-gradient(110deg,var(--accent),var(--accent2));color:#fff;box-shadow:0 18px 50px -14px var(--accent);transition:transform .2s,box-shadow .2s;border:0;cursor:pointer}
.btn:hover{transform:translateY(-2px);box-shadow:0 24px 60px -12px var(--accent)}
.btn.ghost{background:var(--card);border:1px solid var(--line);box-shadow:none;color:var(--ink)}
.btn.sm{padding:11px 22px;font-size:14px}
.eyebrow{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-size:13px;font-weight:600;color:#d8d9ec}
.eyebrow i{width:8px;height:8px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.25);animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.35}}
header{position:sticky;top:0;z-index:50;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(6,6,13,.7);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:70px;gap:20px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Sora';font-weight:700;font-size:19px}
.brand img{width:38px;height:38px;border-radius:11px;object-fit:cover}
.links{display:flex;gap:30px;font-size:14.5px;color:var(--mut);font-weight:500}
.links a:hover{color:#fff}
section{position:relative}
.hero{padding:70px 0 90px;text-align:center;overflow:hidden}
.hero h1{font-size:clamp(34px,5.6vw,66px);max-width:940px;margin:22px auto 20px;font-weight:800}
.hero .sub{max-width:660px;margin:0 auto 34px;color:var(--mut);font-size:clamp(16px,1.8vw,19px)}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.cd{display:flex;gap:14px;justify-content:center;margin:44px 0 10px}
.cd div{min-width:84px;padding:16px 10px;border-radius:18px;background:var(--card);border:1px solid var(--line)}
.cd b{display:block;font-family:'Sora';font-size:34px;font-weight:700;line-height:1}
.cd span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.meta{display:flex;gap:28px;justify-content:center;flex-wrap:wrap;margin-top:22px;color:#cfd0e6;font-size:14.5px;font-weight:600}
.meta span{display:inline-flex;align-items:center;gap:8px}
.vidwrap{max-width:900px;margin:64px auto 0;padding:10px;border-radius:30px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 70%,transparent),color-mix(in srgb,var(--accent2) 60%,transparent));box-shadow:0 40px 120px -30px var(--accent)}
.vidwrap .lb-vid{border-radius:22px}
.stats{padding:10px 0 80px}
.stats .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat{padding:26px 20px;text-align:center;border-radius:20px;background:var(--card);border:1px solid var(--line)}
.stat b{display:block;font-family:'Sora';font-size:36px;font-weight:800}
.stat span{color:var(--mut);font-size:14px}
.head{text-align:center;max-width:720px;margin:0 auto 54px}
.head .tag{color:var(--accent2);font-weight:700;letter-spacing:.16em;font-size:12.5px;text-transform:uppercase}
.head h2{font-size:clamp(28px,4vw,44px);margin:12px 0 14px;font-weight:700}
.head p{color:var(--mut);font-size:17px}
.learn{padding:80px 0}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{padding:30px 28px;border-radius:24px;background:var(--card);border:1px solid var(--line);transition:transform .25s,border-color .25s}
.card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 60%,transparent)}
.ico{width:52px;height:52px;border-radius:15px;display:grid;place-items:center;font-size:25px;margin-bottom:20px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 35%,transparent),color-mix(in srgb,var(--accent2) 25%,transparent));border:1px solid var(--line)}
.card h3{font-size:19px;margin-bottom:10px;font-weight:600}
.card p{color:var(--mut);font-size:15px}
.speaker{padding:90px 0}
.sp{display:grid;grid-template-columns:.9fr 1.1fr;gap:64px;align-items:center}
.sp .ph{position:relative;border-radius:32px;overflow:hidden;aspect-ratio:4/4.6;border:1px solid var(--line)}
.sp .ph img{width:100%;height:100%;object-fit:cover}
.sp .ph::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(6,6,13,.7))}
.sp h2{font-size:clamp(28px,3.8vw,42px);margin:12px 0 18px}
.sp p{color:var(--mut);font-size:17px;margin-bottom:22px}
.ticks{list-style:none;display:grid;gap:12px}
.ticks li{display:flex;gap:12px;align-items:flex-start;font-weight:500}
.ticks li::before{content:"✓";flex:none;width:24px;height:24px;margin-top:2px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff}
.bonus{padding:60px 0}
.bonus .box{padding:56px;border-radius:36px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 22%,#0b0b18),color-mix(in srgb,var(--accent2) 14%,#0b0b18));border:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}
.bonus h2{font-size:clamp(26px,3.4vw,38px);margin:10px 0 14px}
.bonus p{color:#cfd0e6}
.bonus .gift{display:grid;gap:14px}
.gift div{display:flex;gap:16px;align-items:center;padding:18px 20px;border-radius:18px;background:rgba(6,6,13,.55);border:1px solid var(--line)}
.gift b{display:block;font-size:16px}.gift small{color:var(--mut);font-size:13.5px}
.gift .e{font-size:28px}
.reviews{padding:90px 0}
.rev{padding:30px;border-radius:24px;background:var(--card);border:1px solid var(--line)}
.rev .stars{color:#fbbf24;letter-spacing:3px;margin-bottom:14px}
.rev p{font-size:16px;margin-bottom:22px}
.who{display:flex;align-items:center;gap:14px}
.who img{width:48px;height:48px;border-radius:50%;object-fit:cover}
.who b{display:block;font-size:15px}.who small{color:var(--mut)}
.faq{padding:60px 0 90px}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:14px}
.acc{border-radius:18px;background:var(--card);border:1px solid var(--line);overflow:hidden}
.acc-h{display:flex;justify-content:space-between;gap:16px;padding:22px 26px;font-weight:600;font-size:17px;cursor:pointer}
.acc-h::after{content:"+";font-size:24px;line-height:1;color:var(--accent2);transition:transform .25s}
.acc.open .acc-h::after{transform:rotate(45deg)}
.acc-b{display:none;padding:0 26px 24px;color:var(--mut)}
.acc.open .acc-b{display:block}
.final{padding:30px 0 100px}
.final .box{position:relative;overflow:hidden;text-align:center;padding:76px 28px;border-radius:40px;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent2) 80%,#000));box-shadow:0 50px 120px -40px var(--accent)}
.final h2{font-size:clamp(28px,4.4vw,48px);max-width:720px;margin:0 auto 14px;color:#fff}
.final p{color:rgba(255,255,255,.85);max-width:560px;margin:0 auto 32px;font-size:18px}
.final .btn{background:#fff;color:#0b0b18;box-shadow:0 20px 50px -16px rgba(0,0,0,.5)}
footer{padding:40px 0 50px;border-top:1px solid var(--line);color:var(--mut);font-size:14px}
.foot{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:center}
@media(max-width:900px){.links{display:none}.cards{grid-template-columns:1fr 1fr}.sp,.bonus .box{grid-template-columns:1fr;gap:34px}.bonus .box{padding:34px 24px}.stats .grid{grid-template-columns:1fr 1fr}.hero{padding-top:44px}}
@media(max-width:600px){.stat b{font-size:28px;white-space:nowrap}.cards{grid-template-columns:1fr}.cd div{min-width:68px;padding:12px 6px}.cd b{font-size:26px}.cd{gap:9px}.btn{width:100%}.nav .btn{width:auto}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#8b5cf6', '#22d3ee', 'A')}" alt="Logo"><span data-e>Your Academy</span></a>
    <nav class="links"><a href="#learn" data-e>What you'll learn</a><a href="#speaker" data-e>Your mentor</a><a href="#reviews" data-e>Results</a><a href="#faq" data-e>FAQ</a></nav>
    <a class="btn sm" data-cta="enroll" data-e>Register Free</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="glow" style="width:520px;height:520px;background:var(--accent);left:-160px;top:-120px"></div>
  <div class="glow" style="width:460px;height:460px;background:var(--accent2);right:-140px;top:120px"></div>
  <div class="wrap" style="position:relative">
    <span class="eyebrow rv"><i></i><span data-e>FREE LIVE MASTERCLASS · 90 MINUTES</span></span>
    <h1 class="rv" data-e>Learn the exact system toppers use to <em>study less</em> and <em>score more</em></h1>
    <p class="sub rv" data-e>Join 25,000+ students who transformed their preparation in one live session. No fluff — only proven strategies, a step-by-step plan and live Q&amp;A.</p>
    <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Reserve My Free Seat →</a><a class="btn ghost" href="#preview" data-e>▶ Watch Preview</a></div>
    <div class="cd rv" data-countdown><div><b data-cd="d">02</b><span>Days</span></div><div><b data-cd="h">14</b><span>Hours</span></div><div><b data-cd="m">36</b><span>Minutes</span></div><div><b data-cd="s">09</b><span>Seconds</span></div></div>
    <div class="meta rv"><span>📅 <span data-event-date data-e>Sat, 18 Oct · 7:00 PM IST</span></span><span data-e>🎥 Live on webinar</span><span data-e>🔥 Only 500 seats</span></div>
    <div class="vidwrap rv" id="preview"><div data-video data-label="Preview video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  </div>
</section>

<section class="stats" data-section="Trust numbers">
  <div class="wrap"><div class="grid" data-list>
    <div class="stat rv"><b data-e>25,000+</b><span data-e>Students trained</span></div>
    <div class="stat rv"><b data-e>4.9/5</b><span data-e>Average rating</span></div>
    <div class="stat rv"><b data-e>1,200+</b><span data-e>Top ranks & selections</span></div>
    <div class="stat rv"><b data-e>12 yrs</b><span data-e>Teaching experience</span></div>
  </div></div>
</section>

<section class="learn" id="learn" data-section="What you'll learn">
  <div class="wrap">
    <div class="head rv"><span class="tag" data-e>IN THIS MASTERCLASS</span><h2 data-e>What you will <em>learn live</em></h2><p data-e>Six powerful modules packed into one focused session.</p></div>
    <div class="cards" data-list>
      <div class="card rv"><div class="ico">🧠</div><h3 data-e>The 3-Step Learning Loop</h3><p data-e>Understand, recall and apply — the science-backed loop that makes concepts stick for good.</p></div>
      <div class="card rv"><div class="ico">⏱️</div><h3 data-e>Time-Blocking Blueprint</h3><p data-e>Build a daily timetable that fits your schedule and removes last-minute panic.</p></div>
      <div class="card rv"><div class="ico">🎯</div><h3 data-e>Smart Revision Method</h3><p data-e>Revise a full syllabus in a fraction of the time using our spaced-repetition sheet.</p></div>
      <div class="card rv"><div class="ico">📝</div><h3 data-e>Exam-Day Strategy</h3><p data-e>Question selection, time per section and how to avoid silly mistakes under pressure.</p></div>
      <div class="card rv"><div class="ico">🔥</div><h3 data-e>Stay Consistent</h3><p data-e>Beat procrastination and distraction with a simple accountability system.</p></div>
      <div class="card rv"><div class="ico">💬</div><h3 data-e>Live Q&amp;A with Mentor</h3><p data-e>Ask your doubts directly and get a personal answer during the session.</p></div>
    </div>
  </div>
</section>

<section class="speaker" id="speaker" data-section="Mentor">
  <div class="wrap sp">
    <div class="ph rv"><img data-img="mentor" data-label="Mentor photo" src="${P.person('#7c3aed', '#0891b2')}" alt="Mentor"></div>
    <div class="rv">
      <span class="eyebrow" data-e>YOUR LIVE MENTOR</span>
      <h2 data-e>Meet <em>Rahul Sharma</em></h2>
      <p data-e>Educator, author and mentor with 12+ years of experience. He has guided over 25,000 students and personally trained 1,200+ toppers across competitive exams.</p>
      <ul class="ticks" data-list>
        <li data-e>Founder, Your Academy — 25,000+ students</li>
        <li data-e>Ex-faculty at a leading national institute</li>
        <li data-e>Featured educator in top education publications</li>
        <li data-e>Creator of the "Smart Study" method</li>
      </ul>
    </div>
  </div>
</section>

<section class="bonus" data-section="Live bonuses">
  <div class="wrap"><div class="box">
    <div class="rv"><span class="eyebrow" data-e>ATTEND LIVE &amp; GET</span><h2 data-e>Exclusive bonuses worth <em>₹4,999</em> — free</h2><p data-e>Only for people who join the live session. Replay and bonuses are shared on WhatsApp after the event.</p></div>
    <div class="gift rv" data-list>
      <div><span class="e">📘</span><span><b data-e>Smart Study Planner (PDF)</b><small data-e>Ready-made weekly planner</small></span></div>
      <div><span class="e">🎁</span><span><b data-e>Revision Cheat-Sheet Pack</b><small data-e>One-page formula &amp; concept sheets</small></span></div>
      <div><span class="e">🎟️</span><span><b data-e>Special scholarship coupon</b><small data-e>Up to 40% off on our full course</small></span></div>
    </div>
  </div></div>
</section>

<section class="reviews" id="reviews" data-section="Student reviews">
  <div class="wrap">
    <div class="head rv"><span class="tag" data-e>REAL RESULTS</span><h2 data-e>Students <em>love</em> the method</h2></div>
    <div class="cards" data-list>
      <div class="rev rv"><div class="stars">★★★★★</div><p data-e>"I was studying 10 hours a day with no results. After this session I studied 6 hours and my mock scores jumped by 90 marks."</p><div class="who"><img data-img="r1" data-label="Student 1" src="${P.avatar('#f472b6', '#8b5cf6')}" alt=""><span><b data-e>Ananya Verma</b><small data-e>Selected, Top 100 rank</small></span></div></div>
      <div class="rev rv"><div class="stars">★★★★★</div><p data-e>"The revision method alone is worth it. I finished the whole syllabus 3 times before the exam. Thank you sir!"</p><div class="who"><img data-img="r2" data-label="Student 2" src="${P.avatar('#34d399', '#0891b2')}" alt=""><span><b data-e>Mohit Singh</b><small data-e>Scored 94%</small></span></div></div>
      <div class="rev rv"><div class="stars">★★★★★</div><p data-e>"Very practical, zero theory. My parents also attended and now they trust my plan. Highly recommended."</p><div class="who"><img data-img="r3" data-label="Student 3" src="${P.avatar('#fbbf24', '#ef4444')}" alt=""><span><b data-e>Priya Kapoor</b><small data-e>Class 12 student</small></span></div></div>
    </div>
  </div>
</section>

<section class="faq" id="faq" data-section="FAQ">
  <div class="wrap">
    <div class="head rv"><span class="tag" data-e>GOT QUESTIONS?</span><h2 data-e>Frequently asked <em>questions</em></h2></div>
    <div class="faqbox" data-list>
      <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Is the masterclass really free?</div><div class="acc-b" data-acc-body data-e>Yes, 100% free. You only need to register with your name and mobile number.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Where will the session be held?</div><div class="acc-b" data-acc-body data-e>It is fully online. After registering you will get the joining link instantly and on WhatsApp.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Will I get a recording if I miss it?</div><div class="acc-b" data-acc-body data-e>The replay is available for 48 hours for everyone who registered. Joining live gives you the bonuses.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Which class or exam is this useful for?</div><div class="acc-b" data-acc-body data-e>Students of Class 9 to 12 and competitive-exam aspirants. The system works for any subject.</div></div>
    </div>
  </div>
</section>

<section class="final" data-section="Final call to action">
  <div class="wrap"><div class="box rv">
    <h2 data-e>Your seat is waiting. Don't miss the live session.</h2>
    <p data-e>Seats are limited to keep the session interactive. Register now and get the joining link instantly.</p>
    <a class="btn" data-cta="enroll" data-e>Reserve My Free Seat →</a>
  </div></div>
</section>
</main>
<footer data-section="Footer" data-fixed>
  <div class="wrap foot"><span data-e>© 2025 Your Academy. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 Chat on WhatsApp</a> &nbsp; <a data-cta="call" data-e>📞 Call us</a></span></div>
</footer>
</body>
</html>`
  });
})();
