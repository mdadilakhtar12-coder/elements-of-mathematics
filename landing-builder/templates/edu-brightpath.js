/* Template 3 — BRIGHTPATH: playful & colourful, for kids' academy / tuition / preschool */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'edu-brightpath',
    category: 'education',
    name: 'BrightPath',
    tagline: 'Fun, colourful & parent-friendly',
    best: 'Kids academy · Tuition · Preschool · Hobby classes',
    colors: [
      { v: '--accent', l: 'Main (purple)', d: '#6d3df5' },
      { v: '--accent2', l: 'Sunny (yellow)', d: '#ffc933' },
      { v: '--accent3', l: 'Pop (coral)', d: '#ff6b81' }
    ],
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BrightPath Kids Academy — Free Demo Class</title>
<meta name="description" content="Fun, caring and effective learning for kids. Book a free demo class today.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--accent:#6d3df5;--accent2:#ffc933;--accent3:#ff6b81;--mint:#2ed3a5;--sky:#4cc9f0;--bg:#fff9ec;--ink:#241a45;--mut:#6a6385;--card:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Nunito',system-ui,sans-serif;line-height:1.6;font-weight:600;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Fredoka',system-ui,sans-serif;line-height:1.1;font-weight:700}
h1,h2{position:relative;z-index:0}
em{font-style:normal;color:var(--accent);position:relative;white-space:nowrap}
em::after{content:"";position:absolute;left:-2%;right:-2%;bottom:.04em;height:.3em;background:var(--accent2);border-radius:99px;z-index:-1;opacity:.85}
.wrap{width:min(1180px,100% - 40px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;border-radius:99px;font-family:'Fredoka';font-weight:600;font-size:18px;background:var(--accent);color:#fff;box-shadow:0 7px 0 #4a22c4;transition:transform .15s,box-shadow .15s;border:0;cursor:pointer}
.btn:hover{transform:translateY(3px);box-shadow:0 4px 0 #4a22c4}
.btn.y{background:var(--accent2);color:#3b2a00;box-shadow:0 7px 0 #d99f00}.btn.y:hover{box-shadow:0 4px 0 #d99f00}
.btn.w{background:#fff;color:var(--accent);box-shadow:0 7px 0 rgba(0,0,0,.18)}
header{position:sticky;top:0;z-index:50;padding:14px 0;background:rgba(255,249,236,.9);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;background:#fff;border-radius:99px;padding:10px 12px 10px 22px;box-shadow:0 10px 30px -12px rgba(109,61,245,.35);border:3px solid var(--ink)}
.brand{display:flex;align-items:center;gap:11px;font-family:'Fredoka';font-weight:700;font-size:22px}
.brand img{width:40px;height:40px;border-radius:12px;object-fit:cover}
.links{display:flex;gap:26px;font-weight:800;font-size:15px}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:16px;box-shadow:0 4px 0 #4a22c4}
.hero{padding:56px 0 110px;position:relative}
.hgrid{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}
.pill{display:inline-flex;align-items:center;gap:8px;background:#fff;border:3px solid var(--ink);border-radius:99px;padding:7px 18px;font-weight:800;font-size:14.5px;transform:rotate(-2deg);box-shadow:4px 4px 0 var(--accent2)}
.hero h1{font-size:clamp(40px,6vw,76px);margin:22px 0 18px;z-index:0;position:relative}
.hero p{font-size:19px;color:var(--mut);max-width:520px;margin-bottom:30px}
.cta-row{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:30px}
.trust{display:flex;align-items:center;gap:14px;font-size:14.5px;font-weight:800}
.faces{display:flex}.faces img{width:42px;height:42px;border-radius:50%;border:3px solid #fff;margin-left:-12px;object-fit:cover}.faces img:first-child{margin-left:0}
.blob{position:relative;max-width:500px;margin:0 auto}
.blob .im{border-radius:62% 38% 55% 45% / 48% 55% 45% 52%;overflow:hidden;aspect-ratio:1/1;border:6px solid var(--ink);background:var(--accent);box-shadow:14px 14px 0 var(--accent2)}
.blob .im img{width:100%;height:100%;object-fit:cover}
.sticker{position:absolute;background:#fff;border:3px solid var(--ink);border-radius:20px;padding:10px 16px;font-family:'Fredoka';font-weight:600;font-size:16px;box-shadow:5px 5px 0 var(--ink);display:flex;gap:8px;align-items:center}
.sticker.a{left:-20px;top:36px;transform:rotate(-6deg);background:var(--accent3);color:#fff}
.sticker.b{right:-14px;bottom:70px;transform:rotate(5deg);background:var(--mint)}
.sticker.c{left:10px;bottom:-10px;transform:rotate(-3deg);background:var(--accent2)}
.deco{position:absolute;font-size:38px;animation:fl 4s ease-in-out infinite}
@keyframes fl{50%{transform:translateY(-14px) rotate(8deg)}}
.wave{position:absolute;left:0;right:0;bottom:-1px;line-height:0}
.wave svg{width:100%;height:70px}
.band{background:var(--accent);padding:30px 0 40px;color:#fff;overflow:hidden}
.chips{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.chips span{padding:11px 22px;border-radius:99px;background:rgba(255,255,255,.16);font-family:'Fredoka';font-weight:600;font-size:18px;border:2px dashed rgba(255,255,255,.5)}
.sec{padding:100px 0;position:relative}
.head{text-align:center;max-width:700px;margin:0 auto 54px}
.head h2{font-size:clamp(32px,4.6vw,56px);margin-bottom:14px}.head p{color:var(--mut);font-size:18.5px}
.fgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.fcard{background:#fff;border:3px solid var(--ink);border-radius:28px;padding:30px 24px;box-shadow:7px 7px 0 var(--ink);transition:transform .2s}
.fcard:hover{transform:translate(-3px,-5px) rotate(-1deg)}
.fcard .e{width:68px;height:68px;border-radius:22px;display:grid;place-items:center;font-size:34px;margin-bottom:18px;border:3px solid var(--ink)}
.fcard:nth-child(1) .e{background:var(--accent2)}.fcard:nth-child(2) .e{background:var(--accent3)}.fcard:nth-child(3) .e{background:var(--mint)}.fcard:nth-child(4) .e{background:var(--sky)}
.fcard h3{font-size:23px;margin-bottom:8px}.fcard p{color:var(--mut);font-size:15.5px}
.classes{background:#fff;border-top:3px solid var(--ink);border-bottom:3px solid var(--ink)}
.cg{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;align-items:stretch}
.cc{border:3px solid var(--ink);border-radius:30px;padding:34px 30px;position:relative;display:flex;flex-direction:column}
.cc:nth-child(1){background:#e9fbf5}.cc:nth-child(2){background:#fff1f3}.cc:nth-child(3){background:#eef0ff}
.cc .age{align-self:flex-start;background:var(--ink);color:#fff;padding:6px 16px;border-radius:99px;font-family:'Fredoka';font-size:15px;margin-bottom:16px}
.cc h3{font-size:28px;margin-bottom:10px}
.cc ul{list-style:none;display:grid;gap:9px;margin:14px 0 24px;flex:1;font-weight:700}
.cc li::before{content:"⭐";margin-right:10px}
.cc .price{font-family:'Fredoka';font-size:34px;font-weight:700;margin-bottom:16px}.cc .price small{font-size:15px;color:var(--mut);font-family:'Nunito'}
.cc .btn{width:100%}
.cc .hot{position:absolute;right:20px;top:-18px;background:var(--accent3);color:#fff;border:3px solid var(--ink);border-radius:99px;padding:5px 16px;font-family:'Fredoka';font-size:14px;transform:rotate(4deg)}
.vsec{background:var(--accent2)}
.vframe{max-width:900px;margin:0 auto;border:5px solid var(--ink);border-radius:36px;overflow:hidden;box-shadow:14px 14px 0 var(--ink);background:#000}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.tcard{text-align:center;background:#fff;border:3px solid var(--ink);border-radius:30px;padding:28px 22px 30px;box-shadow:7px 7px 0 var(--accent)}
.tcard .p{width:150px;height:150px;border-radius:50%;overflow:hidden;margin:0 auto 18px;border:4px solid var(--ink)}
.tcard .p img{width:100%;height:100%;object-fit:cover}
.tcard h3{font-size:23px}.tcard span{display:inline-block;margin:6px 0 10px;background:var(--accent2);padding:3px 14px;border-radius:99px;font-size:13.5px;font-weight:800}
.tcard p{color:var(--mut);font-size:15px}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:190px;gap:16px}
.gal div{border-radius:24px;overflow:hidden;border:3px solid var(--ink)}
.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal div:nth-child(4){grid-column:span 2}
.gal img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.gal div:hover img{transform:scale(1.08)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.rc{background:#fff;border:3px solid var(--ink);border-radius:28px;padding:28px;box-shadow:6px 6px 0 var(--accent3)}
.rc .st{color:#f5a300;font-size:20px;letter-spacing:2px;margin-bottom:10px}
.rc p{font-size:16px;margin-bottom:18px}
.who{display:flex;gap:12px;align-items:center}.who img{width:48px;height:48px;border-radius:50%;object-fit:cover;border:3px solid var(--ink)}.who b{display:block;font-family:'Fredoka';font-size:17px}.who small{color:var(--mut)}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:14px}
.acc{background:#fff;border:3px solid var(--ink);border-radius:22px}
.acc-h{display:flex;justify-content:space-between;gap:14px;padding:18px 24px;font-family:'Fredoka';font-weight:600;font-size:20px;cursor:pointer}
.acc-h::after{content:"+";width:32px;height:32px;border-radius:50%;background:var(--accent2);border:2.5px solid var(--ink);display:grid;place-items:center;flex:none;font-size:22px;line-height:1;transition:transform .25s}
.acc.open .acc-h::after{transform:rotate(45deg)}
.acc-b{display:none;padding:0 24px 22px;color:var(--mut);font-size:16.5px}.acc.open .acc-b{display:block}
.final{background:var(--accent);color:#fff;text-align:center;padding:100px 0;position:relative;overflow:hidden}
.final h2{font-size:clamp(34px,5.4vw,64px);max-width:800px;margin:0 auto 16px}
.final p{font-size:20px;opacity:.9;max-width:560px;margin:0 auto 34px}
footer{background:var(--ink);color:#c9c3e4;padding:44px 0;font-size:15px}
.fw{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:center}
@media(max-width:900px){.links{display:none}.hgrid{grid-template-columns:1fr}.fgrid{grid-template-columns:1fr 1fr}.cg,.tg,.rg{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr}.sticker.a{left:0}.sticker.b{right:0}}
@media(max-width:560px){.fgrid{grid-template-columns:1fr}.btn{width:100%}.nav .btn{width:auto}.gal{grid-auto-rows:130px}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap"><div class="nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#6d3df5', '#ff6b81', 'B')}" alt="Logo"><span data-e>BrightPath</span></a>
    <nav class="links"><a href="#why" data-e>Why us</a><a href="#classes" data-e>Classes</a><a href="#teachers" data-e>Teachers</a><a href="#faq" data-e>FAQ</a></nav>
    <a class="btn" data-cta="enroll" data-e>Free Demo!</a>
  </div></div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <span class="deco" style="left:3%;top:40px">⭐</span><span class="deco" style="right:6%;top:30px;animation-delay:1s">✏️</span><span class="deco" style="left:46%;bottom:90px;animation-delay:2s">🎈</span>
  <div class="wrap hgrid">
    <div>
      <span class="pill rv">🎉 <span data-e>Admissions open for 2025–26</span></span>
      <h1 class="rv" data-e>Where little minds grow <em>big ideas</em>!</h1>
      <p class="rv" data-e>Joyful, activity-based learning for ages 3 to 14. Small classes, loving teachers and real results parents can see.</p>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Free Demo Class</a><a class="btn y" data-cta="whatsapp" data-e>💬 WhatsApp Us</a></div>
      <div class="trust rv"><div class="faces"><img data-img="face1" data-label="Parent face 1" src="${P.avatar('#ff6b81', '#ffc933')}" alt=""><img data-img="face2" data-label="Parent face 2" src="${P.avatar('#2ed3a5', '#4cc9f0')}" alt=""><img data-img="face3" data-label="Parent face 3" src="${P.avatar('#6d3df5', '#ff6b81')}" alt=""><img data-img="face4" data-label="Parent face 4" src="${P.avatar('#ffc933', '#2ed3a5')}" alt=""></div><span data-e>Loved by 2,500+ happy parents</span></div>
    </div>
    <div class="blob rv">
      <div class="im"><img data-img="hero" data-label="Hero photo" src="${P.photo('#8a63ff', '#ff6b81', 700, 700)}" alt="Kids learning"></div>
      <div class="sticker a">⭐ <span data-e>4.9 Parent rating</span></div>
      <div class="sticker b">🎓 <span data-e>Expert teachers</span></div>
      <div class="sticker c">🧩 <span data-e>Learn by playing</span></div>
    </div>
  </div>
  <div class="wave"><svg viewBox="0 0 1440 70" preserveAspectRatio="none"><path d="M0 40C180 80 360 0 540 30s360 50 540 20 270-40 360-10V70H0z" fill="#6d3df5"/></svg></div>
</section>

<section class="band" data-section="Subjects strip"><div class="wrap"><div class="chips" data-list><span data-e>🔢 Maths</span><span data-e>🔬 Science</span><span data-e>📖 English</span><span data-e>🎨 Art &amp; Craft</span><span data-e>🎵 Music</span><span data-e>💻 Coding</span><span data-e>🗣️ Hindi</span></div></div></section>

<section class="sec" id="why" data-section="Why parents love us">
  <div class="wrap">
    <div class="head rv"><h2 data-e>Why kids &amp; parents <em>love us</em></h2><p data-e>We make learning feel like play — and results follow naturally.</p></div>
    <div class="fgrid" data-list>
      <div class="fcard rv"><div class="e">🧑‍🏫</div><h3 data-e>Caring teachers</h3><p data-e>Trained, patient mentors who treat every child like their own.</p></div>
      <div class="fcard rv"><div class="e">🎮</div><h3 data-e>Learning by play</h3><p data-e>Games, stories and activities that make hard topics easy and fun.</p></div>
      <div class="fcard rv"><div class="e">👨‍👩‍👧</div><h3 data-e>Parent updates</h3><p data-e>Monthly progress cards and open parent–teacher meetings.</p></div>
      <div class="fcard rv"><div class="e">🛡️</div><h3 data-e>Safe campus</h3><p data-e>CCTV, verified staff and a clean, child-friendly environment.</p></div>
    </div>
  </div>
</section>

<section class="sec classes" id="classes" data-section="Classes & fees">
  <div class="wrap">
    <div class="head rv"><h2 data-e>Classes for every <em>age</em></h2><p data-e>Pick a program. Your first demo class is always free!</p></div>
    <div class="cg" data-list>
      <div class="cc rv"><span class="age" data-e>Ages 3 – 5</span><h3 data-e>Little Explorers</h3><p data-e>Early learning through stories, rhymes and creative play.</p><ul data-list><li data-e>Phonics &amp; numbers</li><li data-e>Art &amp; motor skills</li><li data-e>3 days / week</li></ul><div class="price"><span data-e>₹1,999</span> <small data-e>/ month</small></div><a class="btn" data-cta="enroll" data-e>Join Now</a></div>
      <div class="cc rv"><span class="hot" data-e>Most popular</span><span class="age" data-e>Ages 6 – 9</span><h3 data-e>Bright Learners</h3><p data-e>Strong basics in Maths, English and Science with fun projects.</p><ul data-list><li data-e>All core subjects</li><li data-e>Weekly activity day</li><li data-e>6 days / week</li></ul><div class="price"><span data-e>₹2,999</span> <small data-e>/ month</small></div><a class="btn" data-cta="enroll" data-e>Join Now</a></div>
      <div class="cc rv"><span class="age" data-e>Ages 10 – 14</span><h3 data-e>Young Achievers</h3><p data-e>Concept clarity, Olympiad training and exam confidence.</p><ul data-list><li data-e>Olympiad coaching</li><li data-e>Coding &amp; robotics</li><li data-e>6 days / week</li></ul><div class="price"><span data-e>₹3,499</span> <small data-e>/ month</small></div><a class="btn" data-cta="enroll" data-e>Join Now</a></div>
    </div>
  </div>
</section>

<section class="sec vsec" data-section="Video">
  <div class="wrap">
    <div class="head rv"><h2 data-e>A day at <em style="color:#241a45">BrightPath</em> 🎒</h2><p data-e style="color:#241a45">Watch how your child will learn, play and grow with us.</p></div>
    <div class="vframe rv"><div data-video data-label="Intro video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  </div>
</section>

<section class="sec" id="teachers" data-section="Teachers">
  <div class="wrap">
    <div class="head rv"><h2 data-e>Meet our <em>super teachers</em></h2></div>
    <div class="tg" data-list>
      <div class="tcard rv"><div class="p"><img data-img="t1" data-label="Teacher 1" src="${P.person('#ff6b81', '#ffc933')}" alt=""></div><h3 data-e>Ms. Priya</h3><span data-e>Maths &amp; Logic</span><p data-e>10 years of making numbers fun with games and puzzles.</p></div>
      <div class="tcard rv"><div class="p"><img data-img="t2" data-label="Teacher 2" src="${P.person('#4cc9f0', '#6d3df5')}" alt=""></div><h3 data-e>Mr. Arjun</h3><span data-e>Science &amp; Coding</span><p data-e>Turns every experiment into an adventure kids remember.</p></div>
      <div class="tcard rv"><div class="p"><img data-img="t3" data-label="Teacher 3" src="${P.person('#2ed3a5', '#ffc933')}" alt=""></div><h3 data-e>Ms. Fatima</h3><span data-e>English &amp; Art</span><p data-e>Storytelling expert who builds confident little speakers.</p></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-section="Photo gallery">
  <div class="wrap">
    <div class="head rv"><h2 data-e>Moments of <em>joy</em> 📸</h2></div>
    <div class="gal" data-list>
      <div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#6d3df5', '#ff6b81', 800, 800)}" alt=""></div>
      <div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#2ed3a5', '#4cc9f0', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#ffc933', '#ff6b81', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#4cc9f0', '#6d3df5', 900, 500)}" alt=""></div>
      <div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#ff6b81', '#ffc933', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#6d3df5', '#2ed3a5', 600, 600)}" alt=""></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:20px" data-section="Parent reviews">
  <div class="wrap">
    <div class="head rv"><h2 data-e>Happy parents, <em>happy kids</em></h2></div>
    <div class="rg" data-list>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My son used to hate homework. Now he asks to go to class! The teachers are wonderful."</p><div class="who"><img data-img="p1" data-label="Parent 1" src="${P.avatar('#6d3df5', '#ff6b81')}" alt=""><span><b data-e>Neha Sharma</b><small data-e>Mother of Aryan, 7</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Her reading and confidence improved in just 3 months. Best decision we made for her."</p><div class="who"><img data-img="p2" data-label="Parent 2" src="${P.avatar('#2ed3a5', '#4cc9f0')}" alt=""><span><b data-e>Vikram Patel</b><small data-e>Father of Diya, 5</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Loved the monthly progress reports and the activity days. Totally worth every rupee."</p><div class="who"><img data-img="p3" data-label="Parent 3" src="${P.avatar('#ffc933', '#ff6b81')}" alt=""><span><b data-e>Farah Ali</b><small data-e>Mother of Zayan, 9</small></span></div></div>
    </div>
  </div>
</section>

<section class="sec" id="faq" style="padding-top:0" data-section="FAQ">
  <div class="wrap">
    <div class="head rv"><h2 data-e>Parents often <em>ask</em></h2></div>
    <div class="faqbox" data-list>
      <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Is the demo class really free?</div><div class="acc-b" data-acc-body data-e>Yes! Your child can attend one full demo class with no payment and no obligation.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>How many children are in a class?</div><div class="acc-b" data-acc-body data-e>We keep classes small — a maximum of 12 kids — so every child gets attention.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Do you offer online classes?</div><div class="acc-b" data-acc-body data-e>Yes, live online classes are available along with recordings for revision.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>What are the class timings?</div><div class="acc-b" data-acc-body data-e>Morning and evening batches are available. We will help you pick the best slot.</div></div>
    </div>
  </div>
</section>

<section class="final" data-section="Final call to action">
  <span class="deco" style="left:8%;top:40px">🌈</span><span class="deco" style="right:10%;bottom:50px;animation-delay:1.5s">🚀</span>
  <div class="wrap"><h2 class="rv" data-e>Ready to see your child shine?</h2><p class="rv" data-e>Book a free demo class today — seats are limited in every batch.</p><a class="btn y rv" data-cta="enroll" data-e>Book My Free Demo 🎉</a></div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fw"><span data-e>© 2025 BrightPath Kids Academy. Made with ❤️ for little learners.</span><span><a data-cta="call" data-e>📞 Call us</a> &nbsp;·&nbsp; <a data-cta="whatsapp" data-e>💬 WhatsApp</a></span></div></footer>
</body>
</html>`
  });
})();
