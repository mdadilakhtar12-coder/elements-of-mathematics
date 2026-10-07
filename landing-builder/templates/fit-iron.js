/* Fitness 1 — IRON: hardcore gym (black + neon lime) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'fit-iron',
    category: 'fitness',
    name: 'Iron Gym',
    tagline: 'Hardcore black & neon gym',
    best: 'Gym · Bodybuilding · Strength training · Fitness club',
    colors: [
      { v: '--accent', l: 'Neon lime', d: '#c6ff1a' },
      { v: '--accent2', l: 'Alert red', d: '#ff3b30' }
    ],
    defaults: {
      enroll: { title: 'Claim your FREE trial', sub: 'Pick your goal and we will book your free trial session on WhatsApp.', button: 'Claim Free Trial', thanks: 'Trial booked! See you at the gym.', extraOn: true, extraLabel: 'Your goal', extraOptions: 'Muscle gain, Fat loss, Strength, Fitness & stamina, Personal training' },
      whatsapp: { message: 'Hi! I want a free trial at the gym.' },
      countdown: { on: false }, bar: { on: true, text: 'Free Trial' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Iron Gym — Free Trial</title>
<meta name="description" content="Premium gym with expert trainers and modern equipment. Claim your free trial.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#c6ff1a;--accent2:#ff3b30;--accent-ink:#0a0a0a;--bg:#0a0a0a;--bg2:#141414;--ink:#f4f4f0;--mut:#9a9a92;--line:rgba(255,255,255,.12)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Barlow',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;line-height:1;letter-spacing:.01em}
em{font-style:normal;color:var(--accent)}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:17px 34px;background:var(--accent);color:#0a0a0a;font-family:'Anton';font-size:19px;letter-spacing:.06em;text-transform:uppercase;border:2px solid var(--accent);transition:.2s;cursor:pointer;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);padding-right:44px}
.btn:hover{background:#fff;border-color:#fff}
.btn.o{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}.btn.o:hover{background:var(--accent);color:#0a0a0a;border-color:var(--accent)}
.k{font-weight:700;font-size:14px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}
.alert{background:var(--accent2);color:#fff;font-weight:700;font-size:14px;padding:8px 0;text-transform:uppercase;letter-spacing:.06em}.alert .wrap{text-align:center}
header{position:sticky;top:0;z-index:40;background:rgba(10,10,10,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Anton';font-size:30px;text-transform:uppercase;letter-spacing:.04em}
.brand img{width:42px;height:42px;object-fit:cover}
.links{display:flex;gap:30px;font-weight:600;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#cfcfc8}.links a:hover{color:var(--accent)}
.nav .btn{padding:10px 24px;padding-right:32px;font-size:16px}
.hero{position:relative;min-height:760px;display:flex;align-items:center;overflow:hidden;padding:90px 0}
.hero .bg{position:absolute;inset:0}.hero .bg img{width:100%;height:100%;object-fit:cover}.hero .bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,10,.95) 10%,rgba(10,10,10,.5) 60%,rgba(10,10,10,.75))}
.hero .in{position:relative;max-width:760px}
.hero h1{font-size:clamp(64px,11vw,150px);margin:16px 0 20px}.hero h1 span{-webkit-text-stroke:2px #fff;color:transparent}
.hero p{font-size:20px;color:#cfcfc8;max-width:520px;margin-bottom:32px;font-weight:500}
.cta-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:44px}
.hs{display:flex;gap:40px;flex-wrap:wrap}.hs b{font-family:'Anton';font-size:46px;color:var(--accent);display:block;line-height:1}.hs span{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.mq{background:var(--accent);color:#0a0a0a;padding:14px 0;overflow:hidden}.mq .wrap{display:flex;gap:44px;justify-content:center;flex-wrap:wrap;font-family:'Anton';font-size:26px;text-transform:uppercase;letter-spacing:.04em}.mq span::before{content:"✦";margin-right:18px}
.sec{padding:100px 0}
.head{margin-bottom:50px}.head.c{text-align:center;max-width:700px;margin-inline:auto;margin-bottom:50px}
.head h2{font-size:clamp(46px,7vw,92px);margin-top:12px}.head p{color:var(--mut);font-size:18px;margin-top:12px;max-width:560px}.head.c p{margin-inline:auto}
.pg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.pc{background:var(--bg2);border:1px solid var(--line);overflow:hidden;position:relative;transition:.3s}.pc:hover{border-color:var(--accent);transform:translateY(-8px)}
.pc .p{aspect-ratio:1/1.2}.pc .p img{width:100%;height:100%;object-fit:cover;filter:grayscale(.3);transition:.5s}.pc:hover .p img{filter:none;transform:scale(1.05)}
.pc .in{position:absolute;left:0;right:0;bottom:0;padding:60px 20px 20px;background:linear-gradient(transparent,rgba(10,10,10,.95))}.pc h3{font-size:28px}.pc span{color:var(--accent);font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase}
.tf{background:var(--bg2)}.tg{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.bx{aspect-ratio:4/3;border:2px solid var(--accent)}.bx .lbl{position:absolute;top:14px;z-index:2;background:var(--accent);color:#0a0a0a;padding:4px 14px;font-family:'Anton';font-size:18px;letter-spacing:.06em}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px}
.tg h2{font-size:clamp(40px,5.4vw,70px);margin:12px 0 16px}.tg p{color:var(--mut);margin-bottom:18px;font-size:18px}
.st{display:flex;gap:34px;margin:24px 0 28px;flex-wrap:wrap}.st b{font-family:'Anton';font-size:44px;color:var(--accent);display:block;line-height:1}.st span{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
.pl{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:stretch}
.pn{border:2px solid var(--line);padding:42px 32px;background:var(--bg2);position:relative;transition:.3s}.pn:hover{border-color:var(--accent)}
.pn.h{background:var(--accent);color:#0a0a0a;border-color:var(--accent)}.pn.h .pr,.pn.h li::before{color:#0a0a0a}.pn.h .btn{background:#0a0a0a;color:#fff;border-color:#0a0a0a}.pn.h .d{color:#333}
.pn .fl{position:absolute;right:20px;top:-14px;background:var(--accent2);color:#fff;font-family:'Anton';font-size:16px;padding:3px 14px;letter-spacing:.06em}
.pn h3{font-size:40px}.pn .d{color:var(--mut);font-size:15px}.pn .pr{font-family:'Anton';font-size:70px;color:var(--accent);line-height:1;margin:14px 0 4px}.pn .pr small{font-family:'Barlow';font-size:18px;font-weight:600}
.pn ul{list-style:none;display:grid;gap:11px;margin:22px 0 30px;font-weight:500}.pn li::before{content:"✓";color:var(--accent);margin-right:12px;font-weight:700}
.tr{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.tc{background:var(--bg2);border:1px solid var(--line);overflow:hidden}.tc .p{aspect-ratio:1/1.05}.tc .p img{width:100%;height:100%;object-fit:cover;filter:grayscale(.4)}.tc .in{padding:22px 24px 26px}.tc h3{font-size:34px}.tc .q{color:var(--accent);font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;margin:4px 0 8px}.tc p{color:var(--mut);font-size:15px}
.sc{border:1px solid var(--line);overflow:hidden}.sr{display:grid;grid-template-columns:1.1fr 1fr 1fr 1fr;gap:10px;padding:18px 26px;border-top:1px solid var(--line);align-items:center;font-weight:500}.sr:first-child{border-top:0}.sr.h{background:var(--bg2);font-family:'Anton';text-transform:uppercase;letter-spacing:.06em;color:var(--accent);font-size:17px}.sr b{font-family:'Anton';font-weight:400;font-size:22px;text-transform:uppercase;letter-spacing:.03em}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:210px;gap:10px}.gal div{overflow:hidden}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal img{width:100%;height:100%;object-fit:cover;filter:grayscale(.3);transition:.6s}.gal div:hover img{filter:none;transform:scale(1.07)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.rc{border-left:4px solid var(--accent);background:var(--bg2);padding:30px}.rc .stt{color:var(--accent);letter-spacing:4px;margin-bottom:10px}.rc p{font-size:17px;margin-bottom:18px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-family:'Anton';font-weight:400;font-size:20px;letter-spacing:.04em;text-transform:uppercase}.who small{color:var(--mut)}
.vs{display:grid;grid-template-columns:1fr 1.2fr;border:2px solid var(--line)}.vi{padding:50px 44px;background:var(--bg2)}.vi h2{font-size:clamp(46px,6vw,76px);margin:12px 0 26px}.vi .r{margin-bottom:20px}.vi b{display:block;font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent)}.vi span{font-size:18px}
.map{min-height:420px;filter:grayscale(1) invert(.92) contrast(.9)}
.final{background:var(--accent);color:#0a0a0a;text-align:center;padding:90px 0}.final h2{font-size:clamp(50px,8vw,120px)}.final p{font-size:19px;margin:12px 0 30px;font-weight:600}.final .btn{background:#0a0a0a;color:#fff;border-color:#0a0a0a}.final .btn:hover{background:#fff;color:#0a0a0a}
footer{padding:28px 0;color:var(--mut);font-size:14px}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.pg{grid-template-columns:1fr 1fr}.tg,.vs{grid-template-columns:1fr}.pl,.tr,.rg{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:160px}.sr{grid-template-columns:1fr 1fr;padding:16px}.sr.h{display:none}.sr b{grid-column:1/-1}.sec{padding:70px 0}.nav .btn{display:none}.hero .bg::after{background:rgba(10,10,10,.78)}}
</style>
</head>
<body>
<div class="alert" data-section="Offer bar" data-fixed><div class="wrap"><span data-e>🔥 New-year offer: 3 DAYS FREE TRIAL + ZERO joining fee</span></div></div>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#c6ff1a', '#0a0a0a', 'I')}" alt="Logo"><span data-e>Iron Gym</span></a>
  <nav class="links"><a href="#programs" data-e>Programs</a><a href="#plans" data-e>Plans</a><a href="#trainers" data-e>Trainers</a><a href="#visit" data-e>Visit</a></nav>
  <a class="btn" data-cta="enroll" data-e>Free Trial</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="bg"><img data-img="hero" data-label="Hero background" src="${P.bg('#2a2a2a', '#0a0a0a', 1600, 1000)}" alt=""></div>
  <div class="wrap"><div class="in">
    <span class="k rv" data-e>Strength · Conditioning · Transformation</span>
    <h1 class="rv"><span data-e>Forge your</span><br><em data-e>strongest self</em></h1>
    <p class="rv" data-e>Premium equipment, elite trainers and a community that pushes you. Start with a free trial and feel the difference.</p>
    <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Claim Free Trial</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
    <div class="hs rv" data-list><div><b data-e>2,500+</b><span data-e>Members</span></div><div><b data-e>15</b><span data-e>Expert trainers</span></div><div><b data-e>24/7</b><span data-e>Access</span></div></div>
  </div></div>
</section>
<div class="mq" data-section="Strip"><div class="wrap" data-list><span data-e>Strength</span><span data-e>Cardio</span><span data-e>CrossFit</span><span data-e>Boxing</span><span data-e>Functional</span><span data-e>Yoga</span></div></div>

<section class="sec" id="programs" data-section="Programs">
  <div class="wrap"><div class="head"><span class="k" data-e>Train your way</span><h2 data-e>Our <em>programs</em></h2></div>
  <div class="pg" data-list>
    <div class="pc rv"><div class="p"><img data-img="p1" data-label="Program 1" src="${P.photo('#333333', '#111111', 600, 720)}" alt=""></div><div class="in"><span data-e>Build muscle</span><h3 data-e>Strength &amp; Power</h3></div></div>
    <div class="pc rv"><div class="p"><img data-img="p2" data-label="Program 2" src="${P.photo('#c6ff1a', '#3a4a00', 600, 720)}" alt=""></div><div class="in"><span data-e>Burn fat</span><h3 data-e>HIIT &amp; Cardio</h3></div></div>
    <div class="pc rv"><div class="p"><img data-img="p3" data-label="Program 3" src="${P.photo('#ff3b30', '#4a0a05', 600, 720)}" alt=""></div><div class="in"><span data-e>Fight fit</span><h3 data-e>Boxing &amp; MMA</h3></div></div>
    <div class="pc rv"><div class="p"><img data-img="p4" data-label="Program 4" src="${P.photo('#555555', '#1a1a1a', 600, 720)}" alt=""></div><div class="in"><span data-e>1-on-1</span><h3 data-e>Personal Training</h3></div></div>
  </div></div>
</section>

<section class="sec tf" data-section="Transformations">
  <div class="wrap tg"><div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#3a3a3a', '#1a1a1a', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#c6ff1a', '#3a4a00', 900, 675)}" alt="After"><span class="lbl l" data-e>Day 1</span><span class="lbl r" data-e>Day 90</span></div>
  <div class="rv"><span class="k" data-e>Real results</span><h2 data-e>Transformations that <em>speak</em></h2><p data-e>Our members don't just look different — they feel stronger, sleep better and live with more energy. Drag the slider to compare.</p><div class="st" data-list><div><b data-e>−14 kg</b><span data-e>Avg. fat loss</span></div><div><b data-e>90</b><span data-e>Days programme</span></div></div><a class="btn" data-cta="enroll" data-e>Start Your Story</a></div></div>
</section>

<section class="sec" id="plans" data-section="Membership plans">
  <div class="wrap"><div class="head c"><span class="k" data-e>Membership</span><h2 data-e>Pick your <em>plan</em></h2><p data-e>No hidden fees. Freeze anytime.</p></div>
  <div class="pl" data-list>
    <div class="pn rv"><h3 data-e>Monthly</h3><div class="d" data-e>Try it out</div><div class="pr"><span data-e>₹1,999</span><small data-e>/mo</small></div><ul data-list><li data-e>Full gym access</li><li data-e>Cardio &amp; weights</li><li data-e>Locker &amp; shower</li></ul><a class="btn o" data-cta="enroll" data-e>Join</a></div>
    <div class="pn h rv"><span class="fl" data-e>Best value</span><h3 data-e>Quarterly</h3><div class="d" data-e>Most popular</div><div class="pr"><span data-e>₹4,999</span><small data-e>/3 mo</small></div><ul data-list><li data-e>Everything in Monthly</li><li data-e>2 PT sessions</li><li data-e>Diet chart</li><li data-e>Group classes</li></ul><a class="btn" data-cta="enroll" data-e>Join</a></div>
    <div class="pn rv"><h3 data-e>Annual</h3><div class="d" data-e>Serious commitment</div><div class="pr"><span data-e>₹14,999</span><small data-e>/yr</small></div><ul data-list><li data-e>Everything in Quarterly</li><li data-e>8 PT sessions</li><li data-e>Free supplements kit</li><li data-e>Freeze 30 days</li></ul><a class="btn o" data-cta="enroll" data-e>Join</a></div>
  </div></div>
</section>

<section class="sec tf" id="trainers" data-section="Trainers">
  <div class="wrap"><div class="head"><span class="k" data-e>The coaches</span><h2 data-e>Meet your <em>trainers</em></h2></div>
  <div class="tr" data-list>
    <div class="tc rv"><div class="p"><img data-img="t1" data-label="Trainer 1" src="${P.person('#333333', '#c6ff1a')}" alt=""></div><div class="in"><h3 data-e>Rahul "Rocky"</h3><div class="q" data-e>Head Coach · Strength</div><p data-e>12 yrs · ex-national powerlifter</p></div></div>
    <div class="tc rv"><div class="p"><img data-img="t2" data-label="Trainer 2" src="${P.person('#4a0a05', '#ff3b30')}" alt=""></div><div class="in"><h3 data-e>Simran Kaur</h3><div class="q" data-e>HIIT &amp; Fat loss</div><p data-e>9 yrs · 500+ transformations</p></div></div>
    <div class="tc rv"><div class="p"><img data-img="t3" data-label="Trainer 3" src="${P.person('#1a1a1a', '#c6ff1a')}" alt=""></div><div class="in"><h3 data-e>Dev Malhotra</h3><div class="q" data-e>Boxing &amp; Functional</div><p data-e>8 yrs · state-level boxer</p></div></div>
  </div></div>
</section>

<section class="sec" data-section="Class schedule">
  <div class="wrap"><div class="head"><span class="k" data-e>Timetable</span><h2 data-e>Class <em>schedule</em></h2></div>
  <div class="sc rv" data-list>
    <div class="sr h"><span>Class</span><span>Mon · Wed · Fri</span><span>Tue · Thu</span><span>Sat</span></div>
    <div class="sr"><b data-e>HIIT Burn</b><span data-e>6:00 AM</span><span data-e>6:00 PM</span><span data-e>7:00 AM</span></div>
    <div class="sr"><b data-e>Strength</b><span data-e>7:00 AM</span><span data-e>7:00 PM</span><span data-e>9:00 AM</span></div>
    <div class="sr"><b data-e>Boxing</b><span data-e>6:00 PM</span><span data-e>6:00 AM</span><span data-e>5:00 PM</span></div>
    <div class="sr"><b data-e>Yoga &amp; Stretch</b><span data-e>8:00 AM</span><span data-e>8:00 AM</span><span data-e>10:30 AM</span></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Gallery">
  <div class="wrap"><div class="head"><span class="k" data-e>Inside the gym</span><h2 data-e>Where it <em>happens</em></h2></div>
  <div class="gal" data-list><div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#333333', '#0a0a0a', 900, 900)}" alt=""></div><div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#c6ff1a', '#3a4a00', 600, 600)}" alt=""></div><div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#444444', '#111111', 600, 600)}" alt=""></div><div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#ff3b30', '#3a0a05', 900, 450)}" alt=""></div><div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#222222', '#c6ff1a', 600, 600)}" alt=""></div><div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#555555', '#0a0a0a', 600, 600)}" alt=""></div></div></div>
</section>

<section class="sec tf" data-section="Member reviews">
  <div class="wrap"><div class="head"><span class="k" data-e>Straight talk</span><h2 data-e>Members <em>say</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="stt">★★★★★</div><p data-e>"Lost 16 kg in 4 months. Trainers push you but never judge. Best gym in the city."</p><div class="who"><img data-img="u1" data-label="Member 1" src="${P.avatar('#c6ff1a', '#0a0a0a')}" alt=""><span><b data-e>Amit K.</b><small data-e>Member · 1 year</small></span></div></div>
    <div class="rc rv"><div class="stt">★★★★★</div><p data-e>"Spotless, new equipment and no overcrowding. Group HIIT classes are insane."</p><div class="who"><img data-img="u2" data-label="Member 2" src="${P.avatar('#ff3b30', '#1a1a1a')}" alt=""><span><b data-e>Neha R.</b><small data-e>Member · 8 months</small></span></div></div>
    <div class="rc rv"><div class="stt">★★★★★</div><p data-e>"Rocky built my strength plan from scratch. I deadlift double my body weight now."</p><div class="who"><img data-img="u3" data-label="Member 3" src="${P.avatar('#444444', '#c6ff1a')}" alt=""><span><b data-e>Varun S.</b><small data-e>Member · 2 years</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="visit" data-section="Visit us">
  <div class="wrap vs"><div class="vi"><span class="k" data-e>Find us</span><h2 data-e>Come <em>train</em></h2><div class="r"><b data-e>Address</b><span data-e>Iron Gym, 3rd Floor, Fitness Hub, Your City</span></div><div class="r"><b data-e>Open</b><span data-e>Mon – Sun · 5:00 AM – 11:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Claim Free Trial</a></div>
  <div class="map" data-map data-label="Gym location" data-q="Sector 18, Noida"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><h2 class="rv" data-e>No excuses. Just results.</h2><p class="rv" data-e>Your free trial is waiting. Show up and we'll do the rest.</p><a class="btn rv" data-cta="enroll" data-e>Claim Free Trial</a></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Iron Gym. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
