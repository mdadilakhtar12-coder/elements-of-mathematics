/* Fitness 2 — FLOW: calm yoga & pilates studio (sand + terracotta) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'fit-flow',
    category: 'fitness',
    name: 'Flow Yoga',
    tagline: 'Calm, natural yoga & pilates studio',
    best: 'Yoga studio · Pilates · Meditation · Wellness retreat',
    colors: [
      { v: '--accent', l: 'Terracotta', d: '#b8613f' },
      { v: '--accent2', l: 'Sage', d: '#8aa186' }
    ],
    defaults: {
      enroll: { title: 'Book your free first class', sub: 'Choose a class and we will confirm your spot on WhatsApp.', button: 'Book Free Class', thanks: 'Namaste! Class requested.', extraOn: true, extraLabel: 'Class', extraOptions: 'Hatha Yoga, Vinyasa Flow, Power Yoga, Pilates, Meditation & Breathwork, Prenatal Yoga' },
      whatsapp: { message: 'Hi! I would like to book a free yoga class.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Class' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flow Yoga Studio — Free First Class</title>
<meta name="description" content="Yoga, pilates and meditation classes in a calm studio. Book your free first class.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gilda+Display&family=Karla:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#b8613f;--accent2:#8aa186;--accent-ink:#fff;--bg:#f8f1e7;--bg2:#efe4d3;--ink:#3a2b22;--mut:#85766b;--line:#e6d8c4}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Karla',system-ui,sans-serif;line-height:1.75;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:17px}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Gilda Display',Georgia,serif;font-weight:400;line-height:1.12}
em{font-style:italic;color:var(--accent)}
.wrap{width:min(1160px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 36px;background:var(--accent);color:#fff;font-weight:700;font-size:14px;letter-spacing:.14em;text-transform:uppercase;border-radius:99px;border:1.5px solid var(--accent);transition:.3s;cursor:pointer}
.btn:hover{background:transparent;color:var(--accent)}
.btn.o{background:transparent;color:var(--ink);border-color:var(--ink)}.btn.o:hover{background:var(--ink);color:#fff}
.k{font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent2);font-weight:700}
header{position:sticky;top:0;z-index:40;background:rgba(248,241,231,.93);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:82px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Gilda Display';font-size:28px;color:var(--accent)}
.brand img{width:44px;height:44px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:32px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:12px}
.hero{padding:60px 0 110px;position:relative}
.hg{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.hero h1{font-size:clamp(46px,6.4vw,88px);margin:18px 0 22px}
.hero p{font-size:19px;color:var(--mut);max-width:470px;margin-bottom:32px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:38px}
.hs{display:flex;gap:36px;flex-wrap:wrap}.hs b{font-family:'Gilda Display';font-size:38px;color:var(--accent);display:block;line-height:1}.hs span{font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.hv{position:relative}.hv .a{aspect-ratio:4/5;border-radius:999px 999px 24px 24px;overflow:hidden;background:var(--bg2)}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .b{position:absolute;left:-44px;bottom:50px;width:44%;aspect-ratio:1/1;border-radius:50%;overflow:hidden;border:8px solid var(--bg)}.hv .b img{width:100%;height:100%;object-fit:cover}
.hv::before{content:"";position:absolute;right:-40px;top:-20px;width:200px;height:200px;border-radius:50%;background:var(--accent2);opacity:.4;z-index:-1}
.sec{padding:100px 0}
.head{text-align:center;max-width:620px;margin:0 auto 56px}.head h2{font-size:clamp(36px,4.8vw,58px);margin:14px 0 12px}.head p{color:var(--mut);font-size:17.5px}
.cg{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.cc{background:#fff;border-radius:26px;overflow:hidden;border:1px solid var(--line);transition:.4s}.cc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -36px rgba(120,70,40,.5)}
.cc .p{aspect-ratio:4/3;overflow:hidden}.cc .p img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.cc:hover .p img{transform:scale(1.07)}
.cc .in{padding:24px 28px 30px}.cc h3{font-size:28px;margin-bottom:6px}.cc p{color:var(--mut);font-size:15.5px;margin-bottom:14px}.cc .m{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:14px;font-size:14px;color:var(--mut)}.cc .m b{color:var(--accent);font-weight:700}
.bn{background:var(--accent);color:#fff;padding:90px 0}.bg2{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.bn h2{font-size:clamp(36px,4.6vw,58px);margin:14px 0 22px}.bn h2 em{color:#f4d6c6}.bn .k{color:#f4d6c6}
.bl{display:grid;grid-template-columns:1fr 1fr;gap:26px}.bl i{font-style:normal;font-size:30px;display:block;margin-bottom:6px}.bl b{font-family:'Gilda Display';font-weight:400;font-size:22px;display:block}.bl span{color:#f6e1d5;font-size:15px}
.vd{border-radius:26px;overflow:hidden;border:6px solid rgba(255,255,255,.2);box-shadow:0 40px 80px -36px rgba(0,0,0,.45)}
.sh{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}.bx{aspect-ratio:4/3;border-radius:26px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(120,70,40,.5)}.bx .lbl{position:absolute;top:14px;z-index:2;background:rgba(255,255,255,.94);color:var(--accent);padding:5px 15px;border-radius:99px;font-size:12.5px;font-weight:700}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px}
.sh h2{font-size:clamp(34px,4.4vw,54px);margin:14px 0 18px}.sh p{color:var(--mut);margin-bottom:16px}
.tc2{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.tm{text-align:center}.tm .p{width:200px;height:200px;border-radius:50%;overflow:hidden;margin:0 auto 18px;border:6px solid #fff;box-shadow:0 20px 40px -20px rgba(120,70,40,.5)}.tm .p img{width:100%;height:100%;object-fit:cover}.tm h3{font-size:28px}.tm span{color:var(--accent);font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:700}.tm p{color:var(--mut);font-size:15px;margin-top:6px}
.pl{background:var(--bg2)}.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pc{background:#fff;border-radius:28px;padding:42px 34px;text-align:center;border:1px solid var(--line);position:relative}.pc.h{background:var(--ink);color:#fff;border-color:var(--ink)}.pc.h .pr{color:#e8b49a}.pc.h li{color:#d9ccc2}.pc.h .btn{background:#f4d6c6;border-color:#f4d6c6;color:var(--ink)}
.pc .fl{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent2);color:#fff;padding:4px 18px;border-radius:99px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.pc h3{font-size:32px}.pc .d{color:var(--mut);font-size:14.5px}.pc.h .d{color:#b9aca1}.pc .pr{font-family:'Gilda Display';font-size:54px;color:var(--accent);margin:14px 0 4px;line-height:1}.pc ul{list-style:none;display:grid;gap:10px;margin:20px 0 28px;color:var(--mut);font-size:15.5px}.pc li::before{content:"❀";color:var(--accent2);margin-right:10px}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.rc{background:#fff;border-radius:26px;padding:34px 30px;border:1px solid var(--line)}.rc .st{color:#d4a24b;letter-spacing:4px;margin-bottom:10px}.rc p{font-family:'Gilda Display';font-size:21px;line-height:1.45;margin-bottom:20px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15px}.who small{color:var(--mut)}
.vs{display:grid;grid-template-columns:1fr 1.2fr;gap:50px}.vc h2{font-size:clamp(34px,4.2vw,52px);margin:14px 0 24px}.vc .r{margin-bottom:20px}.vc b{display:block;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent2)}.vc span{font-size:18px}
.map{min-height:400px;border-radius:28px;border:6px solid #fff;box-shadow:0 30px 60px -34px rgba(120,70,40,.45)}
.final{padding:0 0 100px}.final .box{background:linear-gradient(135deg,var(--accent2),#6f8b6b);color:#fff;border-radius:36px;padding:80px 30px;text-align:center}.final h2{font-size:clamp(36px,5.2vw,64px);max-width:780px;margin:12px auto 14px}.final p{color:#eef3ec;max-width:500px;margin:0 auto 28px;font-size:18px}.final .btn{background:#fff;color:var(--accent);border-color:#fff}.final .k{color:#e4efe2}
footer{padding:30px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.bg2,.sh,.vs{grid-template-columns:1fr;gap:44px}.hv .b{left:0}.cg,.tc2,.pk,.rg{grid-template-columns:1fr}.sec{padding:70px 0}.nav .btn{display:none}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#b8613f', '#8aa186', 'F')}" alt="Logo"><span data-e>Flow Yoga</span></a>
  <nav class="links"><a href="#classes" data-e>Classes</a><a href="#teachers" data-e>Teachers</a><a href="#pricing" data-e>Pricing</a><a href="#visit" data-e>Visit</a></nav>
  <a class="btn" data-cta="enroll" data-e>Free Class</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>Yoga · Pilates · Meditation</span><h1 class="rv" data-e>Find your <em>balance</em>, one breath at a time</h1><p class="rv" data-e>A warm, welcoming studio for every body and every level. Join our small classes and feel calmer, stronger and more flexible.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Free Class</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="hs rv" data-list><div><b data-e>3,000+</b><span data-e>Students</span></div><div><b data-e>12</b><span data-e>Weekly classes</span></div><div><b data-e>4.9★</b><span data-e>Rated</span></div></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.photo('#c9b79c', '#b8613f', 800, 1000)}" alt=""></div><div class="b"><img data-img="hero2" data-label="Round photo" src="${P.photo('#8aa186', '#4b6347', 500, 500)}" alt=""></div></div>
</div></section>

<section class="sec" id="classes" style="padding-top:20px" data-section="Classes">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our classes</span><h2 data-e>Practice that <em>fits you</em></h2><p data-e>From gentle to powerful. Beginners always welcome.</p></div>
  <div class="cg" data-list>
    <div class="cc rv"><div class="p"><img data-img="c1" data-label="Class 1" src="${P.photo('#e6d2b5', '#b8613f', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Hatha Yoga</h3><p data-e>Slow, mindful postures to build flexibility and calm the mind.</p><div class="m"><span data-e>60 min · All levels</span><b data-e>Gentle</b></div></div></div>
    <div class="cc rv"><div class="p"><img data-img="c2" data-label="Class 2" src="${P.photo('#a9bfa5', '#4b6347', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Vinyasa Flow</h3><p data-e>Fluid sequences linking breath and movement for strength and stamina.</p><div class="m"><span data-e>60 min · Intermediate</span><b data-e>Flow</b></div></div></div>
    <div class="cc rv"><div class="p"><img data-img="c3" data-label="Class 3" src="${P.photo('#d98b66', '#7a3a1e', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Power Yoga</h3><p data-e>A dynamic, sweaty practice to burn calories and build core strength.</p><div class="m"><span data-e>60 min · Intermediate</span><b data-e>Strong</b></div></div></div>
    <div class="cc rv"><div class="p"><img data-img="c4" data-label="Class 4" src="${P.photo('#c9b79c', '#7a6a50', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Mat Pilates</h3><p data-e>Core-focused conditioning for posture, balance and a strong back.</p><div class="m"><span data-e>50 min · All levels</span><b data-e>Core</b></div></div></div>
    <div class="cc rv"><div class="p"><img data-img="c5" data-label="Class 5" src="${P.photo('#b9c9b6', '#6f8b6b', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Meditation &amp; Breathwork</h3><p data-e>Guided pranayama and meditation to reduce stress and sleep better.</p><div class="m"><span data-e>45 min · All levels</span><b data-e>Calm</b></div></div></div>
    <div class="cc rv"><div class="p"><img data-img="c6" data-label="Class 6" src="${P.photo('#efd9c4', '#b8613f', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Prenatal Yoga</h3><p data-e>Safe, supportive practice for every stage of pregnancy.</p><div class="m"><span data-e>50 min · Expecting mums</span><b data-e>Nurture</b></div></div></div>
  </div></div>
</section>

<section class="bn" data-section="Benefits & video">
  <div class="wrap bg2"><div class="rv"><span class="k" data-e>Why Flow</span><h2 data-e>A space to <em>breathe</em></h2><div class="bl" data-list><div><i>🌿</i><b data-e>Small classes</b><span data-e>Max 12 for personal care.</span></div><div><i>🕯️</i><b data-e>Calm studio</b><span data-e>Natural light, warm tones.</span></div><div><i>🧘</i><b data-e>Certified teachers</b><span data-e>RYT-500 trained.</span></div><div><i>🤝</i><b data-e>Welcoming community</b><span data-e>All ages, all levels.</span></div></div></div>
  <div class="vd rv"><div data-video data-label="Studio tour video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div>
</section>

<section class="sec" data-section="Results">
  <div class="wrap sh"><div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#c9bcae', '#85766b', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#e6d2b5', '#b8613f', 900, 675)}" alt="After"><span class="lbl l" data-e>Month 0</span><span class="lbl r" data-e>Month 3</span></div>
  <div class="rv"><span class="k" data-e>Real change</span><h2 data-e>Feel the <em>difference</em></h2><p data-e>Regular practice improves flexibility, posture and sleep. Slide to compare posture or mobility progress. Replace with your students' results (with consent).</p><a class="btn" data-cta="enroll" data-e>Start Your Journey</a></div></div>
</section>

<section class="sec" id="teachers" style="padding-top:0" data-section="Teachers">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Your guides</span><h2 data-e>Meet our <em>teachers</em></h2></div>
  <div class="tc2" data-list>
    <div class="tm rv"><div class="p"><img data-img="t1" data-label="Teacher 1" src="${P.person('#b8613f', '#efd9c4')}" alt=""></div><h3 data-e>Ananya Rao</h3><span data-e>Founder · Hatha &amp; Vinyasa</span><p data-e>RYT-500 · 12 years teaching</p></div>
    <div class="tm rv"><div class="p"><img data-img="t2" data-label="Teacher 2" src="${P.person('#8aa186', '#4b6347')}" alt=""></div><h3 data-e>Kabir Mehta</h3><span data-e>Power Yoga &amp; Pilates</span><p data-e>Certified · 8 years teaching</p></div>
    <div class="tm rv"><div class="p"><img data-img="t3" data-label="Teacher 3" src="${P.person('#d98b66', '#7a3a1e')}" alt=""></div><h3 data-e>Dr. Leela Iyer</h3><span data-e>Meditation &amp; Prenatal</span><p data-e>Ayurveda doctor · 15 years</p></div>
  </div></div>
</section>

<section class="sec pl" id="pricing" data-section="Pricing">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Membership</span><h2 data-e>Simple <em>pricing</em></h2></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Drop-in</h3><div class="d" data-e>Try any class</div><div class="pr" data-e>₹500</div><ul data-list><li data-e>Single class</li><li data-e>Mat provided</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
    <div class="pc h rv"><span class="fl" data-e>Most popular</span><h3 data-e>Unlimited</h3><div class="d" data-e>Monthly membership</div><div class="pr" data-e>₹3,500</div><ul data-list><li data-e>Unlimited group classes</li><li data-e>Free guest pass</li><li data-e>Workshops 20% off</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
    <div class="pc rv"><h3 data-e>10-Class Pack</h3><div class="d" data-e>Valid for 3 months</div><div class="pr" data-e>₹3,999</div><ul data-list><li data-e>10 group classes</li><li data-e>Flexible timings</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
  </div></div>
</section>

<section class="sec" data-section="Student reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Kind words</span><h2 data-e>Our <em>community</em> says</h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"I came for flexibility and stayed for the peace. The best part of my week."</p><div class="who"><img data-img="u1" data-label="Student 1" src="${P.avatar('#b8613f', '#efd9c4')}" alt=""><span><b data-e>Smita Kulkarni</b><small data-e>Member · 2 years</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Total beginner here. Ananya's guidance made me feel safe and my back pain is gone."</p><div class="who"><img data-img="u2" data-label="Student 2" src="${P.avatar('#8aa186', '#4b6347')}" alt=""><span><b data-e>Rohit Jain</b><small data-e>Member · 6 months</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Prenatal classes were a blessing. Such a warm, caring space."</p><div class="who"><img data-img="u3" data-label="Student 3" src="${P.avatar('#d98b66', '#7a3a1e')}" alt=""><span><b data-e>Priyanka Das</b><small data-e>Prenatal student</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap vs"><div class="vc rv"><span class="k" data-e>Visit the studio</span><h2 data-e>Roll out your <em>mat</em></h2><div class="r"><b data-e>Studio</b><span data-e>Flow Yoga, 1st Floor, Green Court, Your City</span></div><div class="r"><b data-e>Classes</b><span data-e>Daily · 6:00 AM – 8:30 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Book Free Class</a></div>
  <div class="map rv" data-map data-label="Studio location" data-q="Koregaon Park, Pune"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><span class="k" data-e>Your first class is on us</span><h2 data-e>Come as you are. <em style="color:#fff">Leave lighter.</em></h2><p data-e>Book a free class and experience the calm.</p><a class="btn" data-cta="enroll" data-e>Book Free Class</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Flow Yoga Studio. Namaste 🙏</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
