/* Fitness 5 — GROOVE: vibrant dance & Zumba studio (violet + hot pink) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'fit-groove',
    category: 'fitness',
    name: 'Groove',
    tagline: 'Vibrant dance, Zumba & aerobics studio',
    best: 'Dance academy · Zumba · Bollywood · Hip-hop · Kids dance',
    colors: [
      { v: '--accent', l: 'Violet', d: '#7c3aed' },
      { v: '--accent2', l: 'Hot pink', d: '#ff2d87' }
    ],
    defaults: {
      enroll: { title: 'Book your free demo class', sub: 'Pick a style and we will confirm your demo slot on WhatsApp.', button: 'Book Free Demo', thanks: "You're on the floor! Demo requested.", extraOn: true, extraLabel: 'Dance style', extraOptions: 'Zumba, Bollywood, Hip-hop, Contemporary, Salsa & Latin, Kids Dance, Wedding Choreography' },
      whatsapp: { message: 'Hi! I want to book a free demo dance class.' },
      countdown: { on: false }, bar: { on: true, text: 'Free Demo' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Groove Dance Studio — Free Demo Class</title>
<meta name="description" content="Zumba, Bollywood, hip-hop and more. Book your free demo class today.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#7c3aed;--accent2:#ff2d87;--accent-ink:#fff;--dark:#1a0b3b;--bg:#fbf7ff;--ink:#1e1238;--mut:#6d6488;--line:#e8dff7}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Figtree',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:17px}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Unbounded',system-ui,sans-serif;font-weight:700;letter-spacing:-.04em;line-height:1.08}
em{font-style:normal;background:linear-gradient(90deg,var(--accent2),#ff8a3d);-webkit-background-clip:text;background-clip:text;color:transparent}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:linear-gradient(110deg,var(--accent),var(--accent2));color:#fff;font-family:'Unbounded';font-weight:600;font-size:14.5px;border-radius:99px;border:0;transition:.2s;cursor:pointer;box-shadow:0 16px 34px -14px var(--accent2)}
.btn:hover{transform:translateY(-3px) scale(1.02)}
.btn.o{background:#fff;color:var(--accent);box-shadow:inset 0 0 0 2px var(--accent)}.btn.o:hover{background:var(--accent);color:#fff}
.k{display:inline-block;font-family:'Unbounded';font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent2)}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-family:'Unbounded';font-weight:800;font-size:22px;letter-spacing:-.05em;color:var(--accent)}
.brand img{width:42px;height:42px;border-radius:12px;object-fit:cover}
.links{display:flex;gap:28px;font-weight:600;font-size:15px;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 22px;font-size:13px;box-shadow:none}
.hero{background:linear-gradient(135deg,var(--dark),#3b1580 60%,#6b1c8f);color:#fff;padding:70px 0 90px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;right:-120px;top:-100px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(255,45,135,.5),transparent 70%)}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center;position:relative}
.hero h1{font-size:clamp(40px,6.4vw,84px);margin:16px 0 20px}
.hero p{color:#d8c9f5;font-size:19px;max-width:500px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}.hero .btn.o{background:transparent;color:#fff;box-shadow:inset 0 0 0 2px rgba(255,255,255,.4)}.hero .btn.o:hover{background:#fff;color:var(--dark)}
.hs{display:flex;gap:34px;flex-wrap:wrap}.hs b{font-family:'Unbounded';font-size:30px;display:block;line-height:1.1}.hs span{font-size:13.5px;color:#cbb8ee}
.hv{position:relative;max-width:470px;margin:0 auto}.hv .a{aspect-ratio:1/1.15;border-radius:36px;overflow:hidden;transform:rotate(3deg);border:4px solid #fff;box-shadow:0 40px 80px -30px rgba(0,0,0,.6);background:var(--accent)}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;background:#fff;color:var(--ink);border-radius:16px;padding:12px 18px;font-weight:700;font-size:14.5px;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);display:flex;gap:10px;align-items:center}.hv .c.a1{left:-26px;top:50px;transform:rotate(-5deg)}.hv .c.a2{right:-12px;bottom:44px;transform:rotate(4deg)}
.mq{background:var(--accent2);color:#fff;padding:14px 0;overflow:hidden}.mq .wrap{display:flex;gap:40px;justify-content:center;flex-wrap:wrap;font-family:'Unbounded';font-weight:700;font-size:18px;letter-spacing:-.02em}.mq span::before{content:"✦";margin-right:16px}
.sec{padding:96px 0}
.head{max-width:680px;margin:0 auto 50px;text-align:center}.head h2{font-size:clamp(30px,4.4vw,52px);margin:14px 0 12px;color:var(--dark)}.head p{color:var(--mut);font-size:18px}
.sg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.sc{border-radius:28px;overflow:hidden;background:#fff;border:1.5px solid var(--line);transition:.3s}.sc:hover{transform:translateY(-8px) rotate(-.5deg);box-shadow:0 30px 60px -34px var(--accent);border-color:var(--accent)}
.sc .p{aspect-ratio:4/3;overflow:hidden}.sc .p img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.sc:hover .p img{transform:scale(1.07)}
.sc .in{padding:22px 26px 28px}.sc h3{font-size:22px;margin-bottom:6px;color:var(--dark)}.sc p{color:var(--mut);font-size:15.5px;margin-bottom:12px}.sc .t{display:inline-block;background:var(--bg);color:var(--accent);font-weight:700;font-size:13px;padding:4px 14px;border-radius:99px}
.tt{background:var(--bg)}
.tg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.tc{background:#fff;border-radius:24px;padding:28px 22px;border:1.5px solid var(--line);text-align:center}.tc h3{font-size:19px;color:var(--accent);margin-bottom:12px}.tc div{padding:8px 0;border-top:1px dashed var(--line);font-weight:600;font-size:15px}.tc div small{display:block;color:var(--mut);font-weight:500;font-size:13px}
.bx2{display:grid;grid-template-columns:1fr 1.1fr;gap:60px;align-items:center}
.bx2 h2{font-size:clamp(30px,4vw,48px);margin:14px 0 18px;color:var(--dark)}.bx2 p{color:var(--mut);margin-bottom:16px}
.ls{list-style:none;display:grid;gap:11px;margin:20px 0 28px;font-weight:600}.ls li::before{content:"💃";margin-right:10px}
.vd{border-radius:28px;overflow:hidden;border:6px solid #fff;box-shadow:0 40px 80px -30px rgba(124,58,237,.5)}
.co{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.cc{text-align:center}.cc .p{aspect-ratio:1/1;border-radius:32px;overflow:hidden;margin-bottom:16px;background:linear-gradient(160deg,var(--accent),var(--accent2));transform:rotate(-2deg);transition:.3s}.cc:hover .p{transform:rotate(2deg) scale(1.03)}.cc .p img{width:100%;height:100%;object-fit:cover}.cc h3{font-size:22px}.cc span{color:var(--accent2);font-weight:700;font-size:14px}.cc p{color:var(--mut);font-size:15px;margin-top:4px}
.pl{background:var(--dark);color:#fff}.pl .head h2{color:#fff}.pl .head p{color:#cbb8ee}.pl .k{color:#ff7ab4}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.16);border-radius:28px;padding:38px 30px;position:relative;text-align:center}.pc.h{background:linear-gradient(160deg,var(--accent),var(--accent2));border:0}.pc .fl{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#fff;color:var(--accent2);padding:4px 16px;border-radius:99px;font-family:'Unbounded';font-size:11px;font-weight:700}
.pc h3{font-size:24px}.pc .d{color:#cbb8ee;font-size:14.5px}.pc.h .d{color:#ffe1ef}.pc .pr{font-family:'Unbounded';font-size:42px;font-weight:700;margin:14px 0 4px;letter-spacing:-.05em}.pc .pr small{font-family:'Figtree';font-size:15px;font-weight:500;opacity:.8}.pc ul{list-style:none;display:grid;gap:10px;margin:18px 0 26px;font-weight:600;font-size:15.5px}.pc li::before{content:"✓";margin-right:10px;font-weight:800;color:#ff7ab4}.pc.h li::before{color:#fff}.pc .btn{width:100%;background:#fff;color:var(--accent);box-shadow:none}.pc.h .btn{background:#fff;color:var(--accent2)}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:12px}.gal div{border-radius:22px;overflow:hidden}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal div:nth-child(4){grid-column:span 2}.gal img{width:100%;height:100%;object-fit:cover;transition:.6s}.gal div:hover img{transform:scale(1.08)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.rc{background:var(--bg);border-radius:26px;padding:30px;border:1.5px solid var(--line)}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.rc p{margin-bottom:18px;font-size:17px;font-weight:500}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15.5px}.who small{color:var(--mut)}
.vs{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}.vi{background:linear-gradient(160deg,var(--accent),var(--dark));color:#fff;border-radius:32px;padding:46px 40px}.vi h2{font-size:clamp(28px,3.4vw,42px);margin:14px 0 22px}.vi .k{color:#ff9cc8}.vi .r{margin-bottom:18px}.vi b{display:block;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#ff9cc8}.vi span{font-size:18px}
.map{min-height:400px;border-radius:32px;border:1.5px solid var(--line)}
.final{padding:0 0 96px}.final .box{background:linear-gradient(135deg,var(--accent2),var(--accent));border-radius:40px;color:#fff;text-align:center;padding:80px 30px}.final h2{font-size:clamp(32px,5.2vw,64px);max-width:820px;margin:0 auto 14px}.final p{color:#ffe1ef;max-width:520px;margin:0 auto 28px;font-size:19px}.final .btn{background:#fff;color:var(--accent2);box-shadow:none}
footer{padding:28px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.bx2,.vs{grid-template-columns:1fr;gap:40px}.hv{max-width:400px}.hv .c.a1{left:0}.hv .c.a2{right:0}.sg,.co,.pk,.rg{grid-template-columns:1fr}.tg{grid-template-columns:1fr 1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:150px}.sec{padding:70px 0}.nav .btn{display:none}}
@media(max-width:560px){.tg{grid-template-columns:1fr}.btn{width:100%}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#7c3aed', '#ff2d87', 'G')}" alt="Logo"><span data-e>Groove</span></a>
  <nav class="links"><a href="#styles" data-e>Styles</a><a href="#timetable" data-e>Timetable</a><a href="#teachers" data-e>Teachers</a><a href="#visit" data-e>Visit</a></nav>
  <a class="btn" data-cta="enroll" data-e>Free Demo</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" style="color:#ff9cc8" data-e>Dance · Zumba · Fitness</span><h1 class="rv" data-e>Move to the beat. <em>Love the burn.</em></h1><p class="rv" data-e>Fun, high-energy dance classes for all ages and levels. No experience needed — just bring your energy and we'll bring the music.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Free Demo</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="hs rv" data-list><div><b data-e>4,000+</b><span data-e>Dancers trained</span></div><div><b data-e>10</b><span data-e>Dance styles</span></div><div><b data-e>4.9★</b><span data-e>Studio rating</span></div></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.photo('#ff2d87', '#4c1d95', 800, 920)}" alt=""></div><div class="c a1">🔥 <span data-e>Burn 600 cal / class</span></div><div class="c a2">🎶 <span data-e>Live DJ weekends</span></div></div>
</div></section>
<div class="mq" data-section="Styles strip"><div class="wrap" data-list><span data-e>Zumba</span><span data-e>Bollywood</span><span data-e>Hip-hop</span><span data-e>Salsa</span><span data-e>Contemporary</span><span data-e>Kids</span></div></div>

<section class="sec" id="styles" data-section="Dance styles">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Pick your groove</span><h2 data-e>Find your <em>dance style</em></h2><p data-e>Beginners welcome in every class.</p></div>
  <div class="sg" data-list>
    <div class="sc rv"><div class="p"><img data-img="s1" data-label="Style 1" src="${P.photo('#ff2d87', '#7c3aed', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Zumba Fitness</h3><p data-e>Latin-inspired cardio party that burns calories without feeling like a workout.</p><span class="t" data-e>All levels · 60 min</span></div></div>
    <div class="sc rv"><div class="p"><img data-img="s2" data-label="Style 2" src="${P.photo('#ffb02e', '#ff2d87', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Bollywood</h3><p data-e>Learn the latest Bollywood hits with fun, easy-to-follow choreography.</p><span class="t" data-e>All levels · 60 min</span></div></div>
    <div class="sc rv"><div class="p"><img data-img="s3" data-label="Style 3" src="${P.photo('#1a0b3b', '#7c3aed', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Hip-hop</h3><p data-e>Street-style grooves, isolations and freestyle with serious attitude.</p><span class="t" data-e>Beginner+ · 60 min</span></div></div>
    <div class="sc rv"><div class="p"><img data-img="s4" data-label="Style 4" src="${P.photo('#7c3aed', '#c026d3', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Contemporary</h3><p data-e>Expressive, flowing movement that builds grace, strength and flexibility.</p><span class="t" data-e>Intermediate · 75 min</span></div></div>
    <div class="sc rv"><div class="p"><img data-img="s5" data-label="Style 5" src="${P.photo('#ff7a2f', '#c4161c', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Salsa &amp; Latin</h3><p data-e>Partner and solo salsa, bachata and cha-cha in a social, friendly setting.</p><span class="t" data-e>All levels · 60 min</span></div></div>
    <div class="sc rv"><div class="p"><img data-img="s6" data-label="Style 6" src="${P.photo('#34d399', '#7c3aed', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Kids Dance</h3><p data-e>Playful classes (ages 4–14) that build confidence, rhythm and friendships.</p><span class="t" data-e>Ages 4–14 · 45 min</span></div></div>
  </div></div>
</section>

<section class="sec tt" id="timetable" data-section="Timetable">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Batch timings</span><h2 data-e>Weekly <em>timetable</em></h2><p data-e>Morning, evening and weekend batches. Ask for your best slot.</p></div>
  <div class="tg" data-list>
    <div class="tc rv"><h3 data-e>Morning</h3><div data-e>Zumba<small>Mon · Wed · Fri · 7:00 AM</small></div><div data-e>Aerobics<small>Tue · Thu · 7:30 AM</small></div></div>
    <div class="tc rv"><h3 data-e>Evening</h3><div data-e>Bollywood<small>Mon · Wed · Fri · 6:30 PM</small></div><div data-e>Hip-hop<small>Tue · Thu · 7:30 PM</small></div></div>
    <div class="tc rv"><h3 data-e>Weekend</h3><div data-e>Salsa &amp; Latin<small>Sat · 6:00 PM</small></div><div data-e>Contemporary<small>Sun · 11:00 AM</small></div></div>
    <div class="tc rv"><h3 data-e>Kids</h3><div data-e>Kids Dance (4–9)<small>Sat · 4:00 PM</small></div><div data-e>Kids Hip-hop (10–14)<small>Sun · 4:00 PM</small></div></div>
  </div></div>
</section>

<section class="sec" data-section="Showreel">
  <div class="wrap bx2"><div class="rv"><span class="k" data-e>Why Groove</span><h2 data-e>Fitness that feels like a <em>party</em></h2><p data-e>Lose weight, build confidence and make friends. Our certified instructors make every class fun, safe and motivating.</p><ul class="ls" data-list><li data-e>Certified, friendly instructors</li><li data-e>Small batches · personal attention</li><li data-e>Stage shows &amp; annual day performances</li></ul><a class="btn" data-cta="enroll" data-e>Book Free Demo</a></div>
  <div class="vd rv"><div data-video data-label="Showreel video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div>
</section>

<section class="sec" id="teachers" style="padding-top:0" data-section="Instructors">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Your instructors</span><h2 data-e>Meet the <em>dancers</em></h2></div>
  <div class="co" data-list>
    <div class="cc rv"><div class="p"><img data-img="t1" data-label="Instructor 1" src="${P.person('#ff2d87', '#7c3aed')}" alt=""></div><h3 data-e>Maya D'Souza</h3><span data-e>Zumba &amp; Bollywood</span><p data-e>Certified Zumba instructor · 9 yrs</p></div>
    <div class="cc rv"><div class="p"><img data-img="t2" data-label="Instructor 2" src="${P.person('#7c3aed', '#1a0b3b')}" alt=""></div><h3 data-e>Dev Raheja</h3><span data-e>Hip-hop &amp; Freestyle</span><p data-e>TV dance-show finalist · 8 yrs</p></div>
    <div class="cc rv"><div class="p"><img data-img="t3" data-label="Instructor 3" src="${P.person('#ffb02e', '#ff2d87')}" alt=""></div><h3 data-e>Isha Bhatt</h3><span data-e>Contemporary &amp; Kids</span><p data-e>Trained in Mumbai &amp; London · 10 yrs</p></div>
  </div></div>
</section>

<section class="sec pl" data-section="Pricing">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Membership</span><h2 data-e>Dance <em style="background:none;color:#ff7ab4;-webkit-text-fill-color:#ff7ab4">plans</em></h2></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Drop-in</h3><div class="d" data-e>Try any class</div><div class="pr"><span data-e>₹400</span></div><ul data-list><li data-e>Single class</li><li data-e>No commitment</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
    <div class="pc h rv"><span class="fl" data-e>BEST VALUE</span><h3 data-e>Monthly Unlimited</h3><div class="d" data-e>All group classes</div><div class="pr"><span data-e>₹3,000</span><small data-e>/mo</small></div><ul data-list><li data-e>Unlimited classes</li><li data-e>Free annual-day entry</li><li data-e>Bring-a-friend pass</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
    <div class="pc rv"><h3 data-e>Kids Term</h3><div class="d" data-e>3 months · 2 classes/wk</div><div class="pr"><span data-e>₹6,500</span></div><ul data-list><li data-e>Kids batch</li><li data-e>Costume for show</li><li data-e>Progress report</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
  </div></div>
</section>

<section class="sec" data-section="Gallery">
  <div class="wrap"><div class="head rv"><span class="k" data-e>On the floor</span><h2 data-e>Studio <em>moments</em></h2></div>
  <div class="gal" data-list><div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#7c3aed', '#ff2d87', 900, 900)}" alt=""></div><div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#ffb02e', '#ff2d87', 600, 600)}" alt=""></div><div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#1a0b3b', '#7c3aed', 600, 600)}" alt=""></div><div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#ff2d87', '#c026d3', 900, 450)}" alt=""></div><div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#34d399', '#7c3aed', 600, 600)}" alt=""></div><div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#c026d3', '#ffb02e', 600, 600)}" alt=""></div></div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Student reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Love from dancers</span><h2 data-e>Happy <em>feet</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Lost 8 kg in 3 months and I never felt like I was exercising. Zumba with Maya is the best part of my day!"</p><div class="who"><img data-img="u1" data-label="Student 1" src="${P.avatar('#ff2d87', '#7c3aed')}" alt=""><span><b data-e>Kritika Sen</b><small data-e>Zumba member</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My 7-year-old is so confident after performing on stage at the annual day. Wonderful teachers."</p><div class="who"><img data-img="u2" data-label="Student 2" src="${P.avatar('#ffb02e', '#ff2d87')}" alt=""><span><b data-e>Arti Menon</b><small data-e>Parent</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Joined as a total beginner and now I'm doing hip-hop routines. Super friendly environment."</p><div class="who"><img data-img="u3" data-label="Student 3" src="${P.avatar('#7c3aed', '#1a0b3b')}" alt=""><span><b data-e>Rohan Das</b><small data-e>Hip-hop student</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap vs"><div class="vi rv"><span class="k" data-e>Visit the studio</span><h2 data-e>Come <em style="color:#ff9cc8">dance</em> with us</h2><div class="r"><b data-e>Studio</b><span data-e>Groove Studio, 2nd Floor, Arts Square, Your City</span></div><div class="r"><b data-e>Classes</b><span data-e>Mon – Sun · 6:30 AM – 9:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" style="background:#fff;color:var(--accent)" data-cta="enroll" data-e>Book Free Demo</a></div>
  <div class="map rv" data-map data-label="Studio location" data-q="Bandra West, Mumbai"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Your first class is on us!</h2><p data-e>Put on your sneakers and come try a free demo. We'll handle the rest.</p><a class="btn" data-cta="enroll" data-e>Book Free Demo →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Groove Dance Studio. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
