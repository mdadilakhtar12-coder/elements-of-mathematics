/* Fitness 3 — PULSE: high-energy HIIT / CrossFit box with a 30-day challenge countdown (red-orange) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'fit-pulse',
    category: 'fitness',
    name: 'Pulse',
    tagline: 'High-energy HIIT & CrossFit with challenge countdown',
    best: 'CrossFit box · HIIT studio · Bootcamp · 30-day challenge',
    colors: [
      { v: '--accent', l: 'Fire orange', d: '#ff5a1f' },
      { v: '--accent2', l: 'Deep red', d: '#c4161c' }
    ],
    defaults: {
      enroll: { title: 'Join the 30-Day Challenge', sub: 'Register now. We will add you to the challenge group on WhatsApp.', button: 'Join The Challenge', thanks: "You're in! Get ready.", extraOn: true, extraLabel: 'Fitness level', extraOptions: 'Beginner, Intermediate, Advanced' },
      whatsapp: { message: 'Hi! I want to join the 30-day challenge.' },
      countdown: { on: true, date: '' }, bar: { on: true, text: 'Join Challenge' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pulse Fitness — 30-Day Challenge</title>
<meta name="description" content="Join the 30-day transformation challenge. HIIT, CrossFit and expert coaching.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Chivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#ff5a1f;--accent2:#c4161c;--accent-ink:#fff;--bg:#120c0c;--bg2:#1d1313;--ink:#fff4ee;--mut:#b09a92;--line:rgba(255,255,255,.12)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Chivo',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Oswald',Impact,sans-serif;font-weight:700;text-transform:uppercase;line-height:1.02;letter-spacing:.01em}
em{font-style:normal;background:linear-gradient(90deg,var(--accent),#ffb02e);-webkit-background-clip:text;background-clip:text;color:transparent}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:17px 34px;background:linear-gradient(110deg,var(--accent2),var(--accent));color:#fff;font-family:'Oswald';font-weight:600;font-size:19px;letter-spacing:.08em;text-transform:uppercase;border:0;border-radius:6px;transition:.2s;cursor:pointer;box-shadow:0 16px 36px -14px var(--accent)}
.btn:hover{transform:translateY(-3px) skewX(-3deg)}
.btn.o{background:transparent;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}.btn.o:hover{box-shadow:inset 0 0 0 2px var(--accent);color:var(--accent)}
.k{font-family:'Oswald';font-weight:500;font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}
header{position:sticky;top:0;z-index:40;background:rgba(18,12,12,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Oswald';font-weight:700;font-size:30px;text-transform:uppercase;letter-spacing:.04em}
.brand img{width:42px;height:42px;border-radius:8px;object-fit:cover}
.links{display:flex;gap:30px;font-family:'Oswald';font-weight:500;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#d6c4bc}.links a:hover{color:var(--accent)}
.nav .btn{padding:10px 22px;font-size:16px;box-shadow:none}
.hero{position:relative;padding:90px 0 120px;overflow:hidden;background:radial-gradient(800px 500px at 80% 0%,rgba(255,90,31,.35),transparent 70%),radial-gradient(600px 400px at 0% 100%,rgba(196,22,28,.4),transparent 70%)}
.hero::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:80px;background:var(--bg);clip-path:polygon(0 100%,100% 0,100% 100%)}
.hg{display:grid;grid-template-columns:1.15fr .85fr;gap:50px;align-items:center;position:relative;z-index:1}
.hero h1{font-size:clamp(56px,9.2vw,128px);margin:14px 0 18px}
.hero p{font-size:19px;color:#e5cfc6;max-width:520px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.cd{display:flex;gap:12px;margin:0 0 30px}.cd div{min-width:84px;padding:14px 8px;text-align:center;background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:10px}.cd b{display:block;font-family:'Oswald';font-size:38px;line-height:1;color:var(--accent)}.cd span{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut)}
.cdl{font-family:'Oswald';font-size:15px;letter-spacing:.18em;text-transform:uppercase;color:#ffd7c4;margin-bottom:10px;display:block}
.hv{position:relative}.hv .a{aspect-ratio:1/1.1;border-radius:6px;overflow:hidden;border:3px solid var(--accent);transform:rotate(2deg);box-shadow:16px 16px 0 var(--accent2)}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;left:-26px;bottom:40px;background:#fff;color:#111;padding:12px 20px;font-family:'Oswald';font-weight:600;text-transform:uppercase;transform:rotate(-4deg);box-shadow:0 14px 30px rgba(0,0,0,.4)}.hv .c b{font-size:30px;color:var(--accent2);display:block;line-height:1}.hv .c span{font-size:13px;letter-spacing:.1em}
.sec{padding:96px 0}
.head{margin-bottom:46px}.head.c{text-align:center;max-width:700px;margin-inline:auto}
.head h2{font-size:clamp(42px,6.4vw,84px);margin-top:10px}.head p{color:var(--mut);font-size:18px;margin-top:12px;max-width:560px}.head.c p{margin-inline:auto}
.wg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.wc{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:30px 24px;position:relative;overflow:hidden;transition:.3s}.wc:hover{border-color:var(--accent);transform:translateY(-8px)}
.wc::after{content:attr(data-n);position:absolute;right:14px;top:-4px;font-family:'Oswald';font-size:90px;font-weight:700;color:rgba(255,255,255,.05);line-height:1}
.wc i{font-style:normal;font-size:34px;display:block;margin-bottom:12px}.wc h3{font-size:28px;margin-bottom:8px}.wc p{color:var(--mut);font-size:15px}
.chl{background:linear-gradient(135deg,var(--accent2),var(--accent));color:#fff}
.cg{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.cg h2{font-size:clamp(40px,5.6vw,72px);margin:12px 0 18px}.cg p{font-size:18px;color:#ffe6d9;margin-bottom:22px}
.cl{list-style:none;display:grid;gap:12px;margin-bottom:28px;font-weight:600;font-size:17px}.cl li::before{content:"🔥";margin-right:12px}
.chl .btn{background:#fff;color:var(--accent2);box-shadow:0 16px 36px -14px rgba(0,0,0,.5)}
.bx{aspect-ratio:4/3;border:4px solid #fff;box-shadow:14px 14px 0 rgba(0,0,0,.35)}.bx .lbl{position:absolute;top:14px;z-index:2;background:#111;color:#fff;padding:4px 14px;font-family:'Oswald';font-size:18px;letter-spacing:.06em;text-transform:uppercase}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px;background:var(--accent)}
.co{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.cc{background:var(--bg2);border:1px solid var(--line);border-radius:10px;overflow:hidden}.cc .p{aspect-ratio:1/1;background:linear-gradient(160deg,var(--accent),var(--accent2))}.cc .p img{width:100%;height:100%;object-fit:cover}.cc .in{padding:22px 24px 26px}.cc h3{font-size:32px}.cc .q{color:var(--accent);font-family:'Oswald';letter-spacing:.14em;text-transform:uppercase;font-size:14px;margin:4px 0 8px}.cc p{color:var(--mut);font-size:15px}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{background:var(--bg2);border:2px solid var(--line);border-radius:12px;padding:40px 30px;position:relative;transition:.3s}.pc:hover{border-color:var(--accent)}.pc.h{border-color:var(--accent);background:linear-gradient(180deg,rgba(255,90,31,.14),var(--bg2))}
.pc .fl{position:absolute;right:20px;top:-14px;background:var(--accent);color:#fff;font-family:'Oswald';font-size:15px;letter-spacing:.08em;padding:3px 14px;text-transform:uppercase}
.pc h3{font-size:36px}.pc .d{color:var(--mut);font-size:14.5px}.pc .pr{font-family:'Oswald';font-weight:700;font-size:62px;color:var(--accent);line-height:1;margin:14px 0 4px}.pc .pr small{font-family:'Chivo';font-size:16px;font-weight:500;color:var(--mut)}
.pc ul{list-style:none;display:grid;gap:10px;margin:20px 0 28px;font-weight:500;color:#e5cfc6}.pc li::before{content:"✓";color:var(--accent);margin-right:12px;font-weight:700}.pc .btn{width:100%}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:10px}.gal div{overflow:hidden;border-radius:8px}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal img{width:100%;height:100%;object-fit:cover;transition:.6s}.gal div:hover img{transform:scale(1.08)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.rc{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:30px}.rc .st{color:var(--accent);letter-spacing:4px;margin-bottom:10px}.rc p{font-size:17px;margin-bottom:18px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-family:'Oswald';font-weight:600;font-size:20px;letter-spacing:.04em;text-transform:uppercase}.who small{color:var(--mut)}
.vs{display:grid;grid-template-columns:1fr 1.2fr;gap:0;border:1px solid var(--line);border-radius:12px;overflow:hidden}.vi{padding:50px 44px;background:var(--bg2)}.vi h2{font-size:clamp(42px,5.4vw,70px);margin:10px 0 24px}.vi .r{margin-bottom:20px}.vi b{display:block;font-family:'Oswald';font-weight:500;font-size:14px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent)}.vi span{font-size:18px}
.map{min-height:420px;filter:grayscale(1) invert(.92) contrast(.9)}
.final{text-align:center;padding:96px 0;background:radial-gradient(700px 400px at 50% 0%,rgba(255,90,31,.4),transparent 70%)}.final h2{font-size:clamp(46px,8vw,112px);max-width:980px;margin:12px auto 14px}.final p{color:#e5cfc6;max-width:520px;margin:0 auto 30px;font-size:19px}
footer{padding:28px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.cg,.vs{grid-template-columns:1fr}.hv{max-width:420px;margin:0 auto}.hv .c{left:0}.wg{grid-template-columns:1fr 1fr}.co,.pk,.rg{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:150px}.sec{padding:70px 0}.nav .btn{display:none}.cd div{min-width:68px}.cd b{font-size:30px}}
@media(max-width:560px){.wg{grid-template-columns:1fr}.btn{width:100%}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#ff5a1f', '#c4161c', 'P')}" alt="Logo"><span data-e>Pulse</span></a>
  <nav class="links"><a href="#wod" data-e>Workouts</a><a href="#coaches" data-e>Coaches</a><a href="#plans" data-e>Plans</a><a href="#visit" data-e>Visit</a></nav>
  <a class="btn" data-cta="enroll" data-e>Join Now</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>HIIT · CrossFit · Bootcamp</span><h1 class="rv" data-e>Sweat. Push. <em>Transform.</em></h1><p class="rv" data-e>Join India's most intense 30-day transformation challenge. Daily coached workouts, nutrition guidance and a squad that won't let you quit.</p>
  <div class="rv" data-countdown><span class="cdl" data-e>Next challenge starts in</span><div class="cd"><div><b data-cd="d">02</b><span>Days</span></div><div><b data-cd="h">14</b><span>Hours</span></div><div><b data-cd="m">36</b><span>Minutes</span></div><div><b data-cd="s">09</b><span>Seconds</span></div></div></div>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Join The Challenge</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.photo('#ff5a1f', '#4a0a0a', 800, 880)}" alt=""></div><div class="c"><b data-e>1,200+</b><span data-e>Transformed</span></div></div>
</div></section>

<section class="sec" id="wod" data-section="Workout types">
  <div class="wrap"><div class="head"><span class="k" data-e>What you'll do</span><h2 data-e>Built to <em>break limits</em></h2></div>
  <div class="wg" data-list>
    <div class="wc rv" data-n="01"><i>🔥</i><h3 data-e>HIIT Burn</h3><p data-e>45-minute fat-torching intervals. Maximum effort, minimum time.</p></div>
    <div class="wc rv" data-n="02"><i>🏋️</i><h3 data-e>CrossFit WOD</h3><p data-e>Workout of the day: lifting, gymnastics and conditioning.</p></div>
    <div class="wc rv" data-n="03"><i>🥊</i><h3 data-e>Boxing Cardio</h3><p data-e>Bag work and pad drills for power, speed and stress relief.</p></div>
    <div class="wc rv" data-n="04"><i>🥗</i><h3 data-e>Nutrition Plan</h3><p data-e>Simple meal plans and weekly check-ins with our coach.</p></div>
  </div></div>
</section>

<section class="sec chl" data-section="30-day challenge">
  <div class="wrap cg"><div class="rv"><span class="k" style="color:#fff" data-e>The challenge</span><h2 data-e>30 days. <em style="background:none;color:#111;-webkit-text-fill-color:#111">New you.</em></h2><p data-e>A guided, high-intensity programme designed to burn fat, build strength and lock in habits that last.</p><ul class="cl" data-list><li data-e>6 coached sessions every week</li><li data-e>Personal meal &amp; macro guide</li><li data-e>Weekly weigh-ins &amp; progress photos</li><li data-e>Prizes for top transformations</li></ul><a class="btn" data-cta="enroll" data-e>Join The Challenge</a></div>
  <div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#6a4a42', '#2a1a16', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#ffb02e', '#ff5a1f', 900, 675)}" alt="After"><span class="lbl l" data-e>Day 1</span><span class="lbl r" data-e>Day 30</span></div></div>
</section>

<section class="sec" id="coaches" data-section="Coaches">
  <div class="wrap"><div class="head"><span class="k" data-e>The squad</span><h2 data-e>Your <em>coaches</em></h2></div>
  <div class="co" data-list>
    <div class="cc rv"><div class="p"><img data-img="c1" data-label="Coach 1" src="${P.person('#ff5a1f', '#4a0a0a')}" alt=""></div><div class="in"><h3 data-e>Karan "KD" Dhillon</h3><div class="q" data-e>Head Coach · CrossFit L2</div><p data-e>10 yrs · 800+ transformations</p></div></div>
    <div class="cc rv"><div class="p"><img data-img="c2" data-label="Coach 2" src="${P.person('#c4161c', '#ffb02e')}" alt=""></div><div class="in"><h3 data-e>Tara Menon</h3><div class="q" data-e>HIIT &amp; Nutrition</div><p data-e>8 yrs · fat-loss specialist</p></div></div>
    <div class="cc rv"><div class="p"><img data-img="c3" data-label="Coach 3" src="${P.person('#2a1a16', '#ff5a1f')}" alt=""></div><div class="in"><h3 data-e>Zaid Ansari</h3><div class="q" data-e>Boxing &amp; Mobility</div><p data-e>7 yrs · ex-state boxer</p></div></div>
  </div></div>
</section>

<section class="sec" id="plans" style="padding-top:0" data-section="Plans">
  <div class="wrap"><div class="head c"><span class="k" data-e>Pricing</span><h2 data-e>Choose your <em>fire</em></h2></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>30-Day Challenge</h3><div class="d" data-e>Kick-start your transformation</div><div class="pr"><span data-e>₹2,999</span></div><ul data-list><li data-e>24 coached sessions</li><li data-e>Meal plan</li><li data-e>Challenge group</li></ul><a class="btn o" data-cta="enroll" data-e>Join</a></div>
    <div class="pc h rv"><span class="fl" data-e>Best value</span><h3 data-e>Unlimited</h3><div class="d" data-e>Train as much as you want</div><div class="pr"><span data-e>₹3,999</span><small data-e>/mo</small></div><ul data-list><li data-e>Unlimited classes</li><li data-e>Monthly body scan</li><li data-e>Nutrition support</li><li data-e>Free merch</li></ul><a class="btn" data-cta="enroll" data-e>Join</a></div>
    <div class="pc rv"><h3 data-e>Personal Coaching</h3><div class="d" data-e>1-on-1 attention</div><div class="pr"><span data-e>₹9,999</span><small data-e>/mo</small></div><ul data-list><li data-e>12 PT sessions</li><li data-e>Custom programme</li><li data-e>Daily WhatsApp check-in</li></ul><a class="btn o" data-cta="enroll" data-e>Join</a></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Gallery">
  <div class="wrap"><div class="head"><span class="k" data-e>Inside Pulse</span><h2 data-e>The <em>box</em></h2></div>
  <div class="gal" data-list><div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#ff5a1f', '#3a0a0a', 900, 900)}" alt=""></div><div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#2a1a16', '#c4161c', 600, 600)}" alt=""></div><div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#ffb02e', '#8a3a00', 600, 600)}" alt=""></div><div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#c4161c', '#1d1313', 900, 450)}" alt=""></div><div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#4a2a22', '#ff5a1f', 600, 600)}" alt=""></div><div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#ff5a1f', '#1d1313', 600, 600)}" alt=""></div></div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Reviews">
  <div class="wrap"><div class="head"><span class="k" data-e>No excuses</span><h2 data-e>Real <em>results</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Lost 9 kg in the 30-day challenge. The coaches and the squad kept me going every day."</p><div class="who"><img data-img="u1" data-label="Member 1" src="${P.avatar('#ff5a1f', '#4a0a0a')}" alt=""><span><b data-e>Sahil B.</b><small data-e>Challenge winner</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Hardest and most fun workouts of my life. I've never felt this strong."</p><div class="who"><img data-img="u2" data-label="Member 2" src="${P.avatar('#c4161c', '#ffb02e')}" alt=""><span><b data-e>Ritika M.</b><small data-e>Member · 1 year</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Started as a beginner. Coaches scale every move so everyone wins. Love this community."</p><div class="who"><img data-img="u3" data-label="Member 3" src="${P.avatar('#2a1a16', '#ff5a1f')}" alt=""><span><b data-e>Aakash T.</b><small data-e>Member · 6 months</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap vs"><div class="vi"><span class="k" data-e>Find us</span><h2 data-e>Come <em>sweat</em></h2><div class="r"><b data-e>Box</b><span data-e>Pulse Fitness, Industrial Estate, Your City</span></div><div class="r"><b data-e>Classes</b><span data-e>Mon – Sat · 5:30 AM – 9:30 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Join The Challenge</a></div>
  <div class="map" data-map data-label="Box location" data-q="Whitefield, Bengaluru"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><span class="k rv" data-e>Spots are limited</span><h2 class="rv" data-e>Stop planning. <em>Start sweating.</em></h2><p class="rv" data-e>Join the next 30-day challenge and become the person you've been promising to be.</p><a class="btn rv" data-cta="enroll" data-e>Join The Challenge</a></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Pulse Fitness. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
