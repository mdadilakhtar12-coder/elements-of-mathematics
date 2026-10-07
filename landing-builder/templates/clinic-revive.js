/* Clinic 4 — REVIVE: physiotherapy / pain & rehab clinic (energetic green + orange) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'clinic-revive',
    category: 'clinic',
    name: 'Revive Physio',
    tagline: 'Energetic physiotherapy & pain-relief clinic',
    best: 'Physiotherapy · Chiropractic · Pain clinic · Sports injury · Rehab',
    colors: [
      { v: '--accent', l: 'Green', d: '#12a05c' },
      { v: '--accent2', l: 'Orange', d: '#ff7a2f' }
    ],
    defaults: {
      enroll: { title: 'Book your first session', sub: 'Tell us where it hurts. A physiotherapist will call to confirm your slot.', button: 'Book Session', thanks: 'Session requested!', extraOn: true, extraLabel: 'Problem area', extraOptions: 'Back pain, Neck pain, Knee pain, Shoulder pain, Sports injury, Post-surgery rehab, Paralysis / Neuro rehab' },
      whatsapp: { message: 'Hi! I want to book a physiotherapy session.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Session' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revive Physio — Pain Relief &amp; Rehab</title>
<meta name="description" content="Get relief from back, neck and knee pain with expert physiotherapy. Book your first session.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--accent:#12a05c;--accent2:#ff7a2f;--accent-ink:#fff;--dark:#0d2b1f;--bg:#f1faf5;--ink:#14281f;--mut:#5c7367;--line:#d8eadf}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Rubik',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-weight:700;letter-spacing:-.03em;line-height:1.08}
em{font-style:normal;color:var(--accent2)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:var(--accent2);color:#fff;font-weight:600;font-size:16px;border-radius:14px;border:0;transition:.2s;cursor:pointer;font-family:'Rubik';box-shadow:0 14px 28px -14px var(--accent2)}
.btn:hover{transform:translateY(-3px)}
.btn.g{background:var(--accent);box-shadow:0 14px 28px -14px var(--accent)}
.btn.o{background:#fff;color:var(--accent);box-shadow:inset 0 0 0 2px var(--accent)}.btn.o:hover{background:var(--accent);color:#fff}
.k{display:inline-block;color:var(--accent);font-weight:700;font-size:13.5px;letter-spacing:.1em;text-transform:uppercase}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:24px;letter-spacing:-.03em;color:var(--dark)}
.brand img{width:42px;height:42px;border-radius:12px;object-fit:cover}
.links{display:flex;gap:28px;font-weight:500;font-size:15.5px;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:15px;box-shadow:none}
.hero{background:var(--dark);color:#fff;padding:70px 0 0;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;right:-100px;top:-100px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(18,160,92,.5),transparent 70%)}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:end;position:relative}
.hero .k{color:#6fe0a8}.hero h1{font-size:clamp(40px,6.2vw,80px);margin:16px 0 18px}
.hero p{color:#b5d0c2;font-size:18.5px;max-width:520px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}.hero .btn.o{background:transparent;color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.4)}.hero .btn.o:hover{background:#fff;color:var(--dark)}
.pts{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:60px;font-weight:500;font-size:15px;color:#cfe3d8}.pts span::before{content:"✓";color:#6fe0a8;margin-right:8px;font-weight:800}
.hv{position:relative;align-self:end}.hv .a{aspect-ratio:1/1.12;background:linear-gradient(160deg,var(--accent),#0a6b3d);border-radius:240px 240px 0 0;overflow:hidden}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;left:-30px;top:60px;background:#fff;color:var(--ink);border-radius:16px;padding:14px 20px;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);font-weight:600;font-size:14.5px}.hv .c b{color:var(--accent);font-size:26px;display:block;line-height:1.1}
.cond{background:#fff;margin-top:-1px}.cg{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;padding:34px 0}
.cc{background:var(--bg);border-radius:16px;padding:20px 12px;text-align:center;font-weight:600;font-size:15px;transition:.25s;cursor:pointer}.cc:hover{background:var(--accent);color:#fff;transform:translateY(-5px)}.cc i{font-style:normal;font-size:28px;display:block;margin-bottom:4px}
.sec{padding:96px 0}
.head{max-width:640px;margin:0 auto 50px;text-align:center}.head h2{font-size:clamp(32px,4.4vw,52px);margin:12px 0 12px;color:var(--dark)}.head p{color:var(--mut);font-size:18px}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.tc{border:2px solid var(--line);border-radius:22px;padding:32px 28px;transition:.3s;background:#fff}.tc:hover{border-color:var(--accent);transform:translateY(-8px);box-shadow:0 30px 50px -34px var(--accent)}
.tc i{font-style:normal;width:60px;height:60px;border-radius:16px;background:var(--bg);display:grid;place-items:center;font-size:30px;margin-bottom:16px}.tc h3{font-size:23px;margin-bottom:8px;color:var(--dark)}.tc p{color:var(--mut);font-size:15.5px}
.pr{background:var(--bg)}.pg{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;position:relative}
.pp{background:#fff;border-radius:22px;padding:30px 24px;position:relative}.pp i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--accent);color:#fff;font-style:normal;font-weight:800;font-size:21px;margin-bottom:14px}.pp h3{font-size:21px;margin-bottom:6px;color:var(--dark)}.pp p{color:var(--mut);font-size:15px}
.rs{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.bx{aspect-ratio:4/3;border-radius:26px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(13,43,31,.5)}.bx .lbl{position:absolute;top:14px;z-index:2;background:var(--accent2);color:#fff;padding:5px 15px;border-radius:99px;font-size:13px;font-weight:700}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px;background:var(--accent)}
.rs h2{font-size:clamp(32px,4.2vw,50px);margin:12px 0 16px;color:var(--dark)}.rs p{color:var(--mut);margin-bottom:18px}
.ch{list-style:none;display:grid;gap:10px;margin-bottom:26px;font-weight:500}.ch li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}
.dr{background:var(--dark);color:#fff}.dr .head h2{color:#fff}.dr .head p{color:#b5d0c2}.dr .k{color:#6fe0a8}
.dg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.dc{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:24px;overflow:hidden}.dc .p{aspect-ratio:1/1;background:linear-gradient(160deg,var(--accent),#0a6b3d)}.dc .p img{width:100%;height:100%;object-fit:cover}.dc .in{padding:22px 24px 26px}.dc h3{font-size:22px}.dc .q{color:#6fe0a8;font-weight:600;font-size:14.5px}.dc p{color:#b5d0c2;font-size:14.5px;margin-top:6px}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{border:2px solid var(--line);border-radius:24px;padding:36px 30px;text-align:center;position:relative;background:#fff}.pc.h{border-color:var(--accent2);box-shadow:0 30px 60px -36px var(--accent2)}.pc .fl{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--accent2);color:#fff;padding:3px 16px;border-radius:99px;font-size:12.5px;font-weight:700}
.pc h3{font-size:24px;color:var(--dark)}.pc .pr2{font-size:46px;font-weight:800;color:var(--accent);margin:10px 0;letter-spacing:-.04em}.pc .pr2 small{font-size:15px;color:var(--mut);font-weight:500}.pc ul{list-style:none;display:grid;gap:9px;margin:16px 0 24px;color:var(--mut);font-size:15.5px}.pc li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}
.vd{max-width:900px;margin:0 auto;border-radius:26px;overflow:hidden;border:8px solid var(--bg);box-shadow:0 40px 80px -36px rgba(13,43,31,.5)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.rc{background:var(--bg);border-radius:22px;padding:30px}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.rc p{margin-bottom:18px;font-size:16.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15.5px}.who small{color:var(--mut)}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}.acc{border:2px solid var(--line);border-radius:16px}.acc-h{display:flex;justify-content:space-between;gap:14px;padding:19px 24px;font-weight:600;font-size:17.5px;cursor:pointer}.acc-h::after{content:"+";color:var(--accent);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}.acc.open{border-color:var(--accent)}.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}.ci{background:var(--accent);color:#fff;border-radius:28px;padding:46px 40px}.ci h2{font-size:clamp(30px,3.6vw,44px);margin:12px 0 22px}.ci .k{color:#c5f5db}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#c5f5db}.ci span{font-size:18px}
.map{min-height:400px;border-radius:28px;border:2px solid var(--line)}
.final{padding:0 0 96px}.final .box{background:var(--accent2);border-radius:34px;color:#fff;text-align:center;padding:76px 30px}.final h2{font-size:clamp(32px,5vw,60px);max-width:780px;margin:0 auto 14px}.final p{color:#ffe6d6;max-width:520px;margin:0 auto 28px;font-size:18px}.final .btn{background:#fff;color:var(--accent2);box-shadow:none}
footer{padding:28px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.rs,.ct{grid-template-columns:1fr;gap:40px}.hv{max-width:420px;margin:0 auto}.hv .c{left:0}.cg{grid-template-columns:repeat(3,1fr)}.tg,.dg,.pk,.rg{grid-template-columns:1fr}.pg{grid-template-columns:1fr 1fr}.sec{padding:70px 0}.nav .btn{display:none}.pts{margin-bottom:34px}}
@media(max-width:560px){.pg{grid-template-columns:1fr}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#12a05c', '#ff7a2f', 'R')}" alt="Logo"><span data-e>Revive Physio</span></a>
  <nav class="links"><a href="#treatments" data-e>Treatments</a><a href="#process" data-e>How it works</a><a href="#team" data-e>Therapists</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Session</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>Physiotherapy · Pain relief · Rehab</span><h1 class="rv" data-e>Move freely. <em>Live pain-free.</em></h1><p class="rv" data-e>Expert physiotherapists, advanced equipment and personalised recovery plans for back, neck, knee and sports injuries.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book First Session</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="pts rv" data-list><span data-e>No surgery needed</span><span data-e>Home visits</span><span data-e>Insurance accepted</span></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.person('#12a05c', '#0a6b3d')}" alt=""></div><div class="c"><b data-e>8,000+</b><span data-e>Patients recovered</span></div></div>
</div></section>
<section class="cond" data-section="Conditions"><div class="wrap cg" data-list><div class="cc" data-cta="enroll"><i>🧍</i><span data-e>Back pain</span></div><div class="cc" data-cta="enroll"><i>🦒</i><span data-e>Neck pain</span></div><div class="cc" data-cta="enroll"><i>🦵</i><span data-e>Knee pain</span></div><div class="cc" data-cta="enroll"><i>💪</i><span data-e>Shoulder</span></div><div class="cc" data-cta="enroll"><i>🏃</i><span data-e>Sports injury</span></div><div class="cc" data-cta="enroll"><i>🩹</i><span data-e>Post-surgery</span></div></div></section>

<section class="sec" id="treatments" data-section="Treatments">
  <div class="wrap"><div class="head rv"><span class="k" data-e>What we treat</span><h2 data-e>Complete <em>rehabilitation</em></h2><p data-e>Evidence-based treatments tailored to you.</p></div>
  <div class="tg" data-list>
    <div class="tc rv"><i>🤲</i><h3 data-e>Manual therapy</h3><p data-e>Hands-on techniques to release tight muscles and restore joint movement.</p></div><div class="tc rv"><i>⚡</i><h3 data-e>Electrotherapy</h3><p data-e>Ultrasound, IFT and TENS for quick pain relief and faster healing.</p></div><div class="tc rv"><i>🏋️</i><h3 data-e>Strength &amp; rehab</h3><p data-e>Guided exercise programmes to rebuild strength and prevent re-injury.</p></div>
    <div class="tc rv"><i>🦴</i><h3 data-e>Spine care</h3><p data-e>Posture correction and treatment for slip disc, sciatica and stiffness.</p></div><div class="tc rv"><i>🧠</i><h3 data-e>Neuro rehab</h3><p data-e>Recovery programmes for stroke, paralysis and balance problems.</p></div><div class="tc rv"><i>🏠</i><h3 data-e>Home physio</h3><p data-e>Qualified physiotherapists visit your home for comfortable treatment.</p></div>
  </div></div>
</section>

<section class="sec pr" id="process" data-section="How it works">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Your recovery</span><h2 data-e>4 steps to <em>feeling better</em></h2></div>
  <div class="pg" data-list><div class="pp rv"><i>1</i><h3 data-e>Assessment</h3><p data-e>Detailed examination to find the root cause.</p></div><div class="pp rv"><i>2</i><h3 data-e>Plan</h3><p data-e>A clear recovery plan with expected timeline.</p></div><div class="pp rv"><i>3</i><h3 data-e>Treatment</h3><p data-e>Hands-on therapy plus guided exercises.</p></div><div class="pp rv"><i>4</i><h3 data-e>Prevention</h3><p data-e>Home programme to stay pain-free for good.</p></div></div></div>
</section>

<section class="sec" data-section="Before & After">
  <div class="wrap rs"><div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#b3bfb8', '#6b7a72', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#8fe0b6', '#12a05c', 900, 675)}" alt="After"><span class="lbl l" data-e>Day 1</span><span class="lbl r" data-e>Week 6</span></div>
  <div class="rv"><span class="k" data-e>Real recovery</span><h2 data-e>From pain to <em>performance</em></h2><p data-e>Most patients feel significant relief within 3–5 sessions. Replace the photos with a posture or mobility comparison.</p><ul class="ch" data-list><li data-e>Free posture analysis in the first visit</li><li data-e>One-to-one sessions, no crowded gym</li><li data-e>Progress tracked every week</li></ul><a class="btn g" data-cta="enroll" data-e>Book Free Assessment</a></div></div>
</section>

<section class="sec dr" id="team" data-section="Therapists">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our team</span><h2 data-e>Expert <em>physiotherapists</em></h2></div>
  <div class="dg" data-list>
    <div class="dc rv"><div class="p"><img data-img="t1" data-label="Therapist 1" src="${P.person('#12a05c', '#0a6b3d')}" alt=""></div><div class="in"><h3 data-e>Dr. Nikhil Joshi</h3><div class="q" data-e>MPT Ortho · Clinic Head</div><p data-e>14 yrs · spine &amp; sports rehab</p></div></div>
    <div class="dc rv"><div class="p"><img data-img="t2" data-label="Therapist 2" src="${P.person('#ff7a2f', '#a8420f')}" alt=""></div><div class="in"><h3 data-e>Dr. Pooja Desai</h3><div class="q" data-e>MPT Neuro</div><p data-e>10 yrs · stroke &amp; paralysis rehab</p></div></div>
    <div class="dc rv"><div class="p"><img data-img="t3" data-label="Therapist 3" src="${P.person('#0a6b3d', '#6fe0a8')}" alt=""></div><div class="in"><h3 data-e>Dr. Arjun Pillai</h3><div class="q" data-e>BPT, Sports Specialist</div><p data-e>8 yrs · athletes &amp; injury prevention</p></div></div>
  </div></div>
</section>

<section class="sec" data-section="Packages">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Plans</span><h2 data-e>Simple <em>session plans</em></h2></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Single Session</h3><div class="pr2"><span data-e>₹700</span> <small data-e>/ session</small></div><ul data-list><li data-e>45-min one-to-one</li><li data-e>Assessment included</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
    <div class="pc h rv"><span class="fl" data-e>Best value</span><h3 data-e>10-Session Pack</h3><div class="pr2"><span data-e>₹5,999</span> <small data-e>/ 10 sessions</small></div><ul data-list><li data-e>Save ₹1,000</li><li data-e>Custom exercise plan</li><li data-e>Free review visit</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
    <div class="pc rv"><h3 data-e>Home Visit</h3><div class="pr2"><span data-e>₹1,200</span> <small data-e>/ visit</small></div><ul data-list><li data-e>Therapist visits you</li><li data-e>All equipment carried</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Clinic video"><div class="wrap"><div class="head rv"><span class="k" data-e>See us in action</span><h2 data-e>A look at <em>our clinic</em></h2></div><div class="vd rv"><div data-video data-label="Clinic video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div></section>

<section class="sec" style="padding-top:0" data-section="Patient reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Success stories</span><h2 data-e>Back to <em>doing what they love</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"6 years of back pain gone in 8 sessions. I can finally play with my kids again."</p><div class="who"><img data-img="u1" data-label="Patient 1" src="${P.avatar('#12a05c', '#0a6b3d')}" alt=""><span><b data-e>Manoj Tiwari</b><small data-e>Back pain</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Torn ligament recovery was smooth. I was back on the football field in 3 months."</p><div class="who"><img data-img="u2" data-label="Patient 2" src="${P.avatar('#ff7a2f', '#a8420f')}" alt=""><span><b data-e>Aryan Khanna</b><small data-e>Sports injury</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Home visits for my father after his stroke were a blessing. Very patient therapists."</p><div class="who"><img data-img="u3" data-label="Patient 3" src="${P.avatar('#6fe0a8', '#12a05c')}" alt=""><span><b data-e>Lata Deshpande</b><small data-e>Neuro rehab</small></span></div></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="FAQ"><div class="wrap"><div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Good to <em>know</em></h2></div>
  <div class="faqbox" data-list>
    <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Do I need a doctor's prescription?</div><div class="acc-b" data-acc-body data-e>No. You can walk in directly. Our physiotherapist will assess you and guide the right treatment.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>How many sessions will I need?</div><div class="acc-b" data-acc-body data-e>Most conditions improve in 6–10 sessions. You get a clear timeline after the assessment.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Is treatment painful?</div><div class="acc-b" data-acc-body data-e>Treatment is gentle and tailored to your comfort. Mild soreness may occur but is temporary.</div></div>
  </div></div></section>

<section class="sec" id="contact" style="padding-top:0" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Visit us</span><h2 data-e>Start your <em style="color:#fff">recovery</em></h2><div class="r"><b data-e>Clinic</b><span data-e>Revive Physio, Ground Floor, Health Plaza, Your City</span></div><div class="r"><b data-e>Timings</b><span data-e>Mon – Sat · 8:00 AM – 8:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Book Session</a></div>
  <div class="map rv" data-map data-label="Clinic location" data-q="Koregaon Park, Pune"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Don't live with the pain</h2><p data-e>Book your first session today and take the first step to recovery.</p><a class="btn" data-cta="enroll" data-e>Book First Session →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Revive Physio. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
