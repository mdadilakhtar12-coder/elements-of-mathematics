/* Salon 5 — BRIDAL: editorial bridal makeup & hair artist portfolio (ivory, maroon, gold) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'salon-bridal',
    category: 'salon',
    name: 'Bridal Studio',
    tagline: 'Editorial bridal makeup artist portfolio',
    best: 'Makeup artist · Bridal studio · Hair & makeup freelancer',
    colors: [
      { v: '--accent', l: 'Main (maroon)', d: '#7b1e3a' },
      { v: '--accent2', l: 'Gold', d: '#b8924a' }
    ],
    defaults: {
      enroll: { title: 'Check your date', sub: 'Share your wedding date and we will confirm availability within a few hours.', button: 'Check Availability', thanks: 'Enquiry received!', extraOn: true, extraLabel: 'Occasion', extraOptions: 'Bridal Makeup, Engagement / Reception, Party Makeup, Pre-wedding Shoot, Family Makeup, Makeup Course' },
      whatsapp: { message: 'Hi! I would like to check bridal makeup availability for my date.' },
      countdown: { on: false }, bar: { on: true, text: 'Check Date' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bridal Makeup Artist — Check Your Date</title>
<meta name="description" content="Luxury bridal makeup and hair styling. Check availability for your wedding date.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#7b1e3a;--accent2:#b8924a;--accent-ink:#fff;--bg:#fbf6ef;--bg2:#f3eadc;--ink:#2a1a1f;--mut:#7a6a6a;--line:#e8dccb}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Montserrat',system-ui,sans-serif;line-height:1.75;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-weight:400}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif;font-weight:500;line-height:1.12}
em{font-style:italic;color:var(--accent2)}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:17px 38px;background:var(--accent);color:#fff;font-weight:500;font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;border:1px solid var(--accent);transition:.3s;cursor:pointer}
.btn:hover{background:transparent;color:var(--accent)}
.btn.o{background:transparent;color:var(--ink);border-color:var(--ink)}.btn.o:hover{background:var(--ink);color:#fff}
.btn.g{background:var(--accent2);border-color:var(--accent2)}.btn.g:hover{background:transparent;color:var(--accent2)}
.k{font-size:11.5px;letter-spacing:.34em;text-transform:uppercase;color:var(--accent2);font-weight:600}
.orn{display:flex;align-items:center;justify-content:center;gap:14px;color:var(--accent2);margin:18px 0}.orn::before,.orn::after{content:"";width:60px;height:1px;background:var(--accent2)}
header{position:sticky;top:0;z-index:40;background:rgba(251,246,239,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:84px;gap:16px}
.brand{display:flex;align-items:center;gap:13px;font-family:'Playfair Display';font-size:25px;font-weight:600;letter-spacing:.02em;color:var(--accent)}
.brand img{width:44px;height:44px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:34px;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:12px 24px;font-size:11px}
.hero{padding:50px 0 90px}
.hg{display:grid;grid-template-columns:1.05fr .95fr;gap:60px;align-items:center}
.hero h1{font-size:clamp(46px,6.2vw,88px);margin:18px 0 20px;color:var(--accent)}
.hero p{font-size:16.5px;color:var(--mut);max-width:480px;margin-bottom:34px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:46px}
.hs{display:flex;gap:44px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:28px}.hs b{font-family:'Playfair Display';font-size:40px;color:var(--accent);display:block;line-height:1}.hs span{font-size:12px;color:var(--mut);letter-spacing:.1em;text-transform:uppercase}
.hp{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:end}
.hp .a{aspect-ratio:3/4.4;overflow:hidden;border:1px solid var(--line)}.hp .a img{width:100%;height:100%;object-fit:cover}
.hp .a:nth-child(2){aspect-ratio:3/3.6;transform:translateY(-40px);border-radius:999px 999px 0 0}
.sec{padding:100px 0}
.head{text-align:center;max-width:640px;margin:0 auto 56px}
.head h2{font-size:clamp(36px,4.8vw,60px);margin:14px 0 8px;color:var(--accent)}.head p{color:var(--mut);font-size:16px}
.mas{columns:4;column-gap:14px}
.mas div{break-inside:avoid;margin-bottom:14px;overflow:hidden;position:relative}
.mas img{width:100%;display:block;transition:transform .8s}.mas div:hover img{transform:scale(1.06)}
.mas div:nth-child(odd) img{aspect-ratio:3/4.3;object-fit:cover}.mas div:nth-child(even) img{aspect-ratio:1/1;object-fit:cover}.mas div:nth-child(3n) img{aspect-ratio:3/3.8}
.mas div:hover::after{content:"";position:absolute;inset:0;border:8px solid rgba(255,255,255,.55);pointer-events:none}
.about{background:var(--accent);color:#fff}
.ag{display:grid;grid-template-columns:.9fr 1.1fr;gap:80px;align-items:center}
.ag .im{aspect-ratio:4/5;overflow:hidden;border:10px solid rgba(255,255,255,.12)}.ag .im img{width:100%;height:100%;object-fit:cover}
.ag h2{font-size:clamp(38px,4.6vw,60px);margin:16px 0 22px}.ag h2 em{color:#e0c58f}.ag p{color:#e8d6dc;font-size:16.5px;margin-bottom:18px}
.ag .k{color:#e0c58f}
.ag .stats{display:flex;gap:44px;margin-top:30px;flex-wrap:wrap}.ag .stats b{font-family:'Playfair Display';font-size:48px;color:#e0c58f;display:block;line-height:1}.ag .stats span{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#d8bfc7}
.looks{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.lk{text-align:center}.lk .p{aspect-ratio:3/4;overflow:hidden;margin-bottom:20px;border:1px solid var(--line)}.lk .p img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.lk:hover .p img{transform:scale(1.05)}
.lk h3{font-size:30px;color:var(--accent)}.lk p{color:var(--mut);font-size:14.5px;margin-top:6px}
.baw{max-width:820px;margin:0 auto}
.ba{aspect-ratio:16/10;border:10px solid #fff;box-shadow:0 30px 60px -30px rgba(80,20,40,.4)}
.ba .lbl{position:absolute;top:16px;z-index:2;background:rgba(255,255,255,.94);padding:5px 16px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;color:var(--accent)}.ba .lbl.l{left:16px}.ba .lbl.r{right:16px}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:stretch}
.pc{background:#fff;border:1px solid var(--line);padding:46px 34px;text-align:center;position:relative;transition:.3s}.pc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -34px rgba(80,20,40,.45)}
.pc.hot{border:2px solid var(--accent2)}
.pc .fl{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent2);color:#fff;padding:4px 20px;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600}
.pc h3{font-size:32px;color:var(--accent)}.pc .d{font-size:13.5px;color:var(--mut)}
.pc .pr{font-family:'Playfair Display';font-size:54px;color:var(--ink);margin:16px 0 4px;line-height:1}.pc .pr small{font-size:14px;font-family:'Montserrat';color:var(--mut)}
.pc ul{list-style:none;margin:22px 0 30px;display:grid;gap:11px;font-size:14.5px;color:var(--mut)}.pc li::before{content:"♡";color:var(--accent2);margin-right:10px}
.steps{background:var(--bg2)}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}
.st{text-align:center}.st i{display:grid;place-items:center;width:78px;height:78px;border-radius:50%;border:1px solid var(--accent2);margin:0 auto 20px;font-family:'Playfair Display';font-style:normal;font-size:30px;color:var(--accent)}
.st h3{font-size:25px;margin-bottom:8px}.st p{color:var(--mut);font-size:14.5px}
.vid{max-width:900px;margin:0 auto;border:10px solid #fff;box-shadow:0 40px 80px -34px rgba(80,20,40,.5)}
.rv2{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.rc{background:#fff;border:1px solid var(--line);padding:40px 32px;position:relative}
.rc::before{content:"“";position:absolute;top:2px;left:26px;font-family:'Playfair Display';font-size:80px;color:var(--accent2);opacity:.45;line-height:1}
.rc p{font-family:'Playfair Display';font-size:20px;font-style:italic;line-height:1.55;margin:26px 0 22px}
.who{display:flex;gap:14px;align-items:center}.who img{width:50px;height:50px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:14px;letter-spacing:.06em}.who small{color:var(--mut);font-size:12.5px}
.final{background:linear-gradient(rgba(60,10,25,.82),rgba(60,10,25,.88)),var(--accent);color:#fff;text-align:center;padding:100px 0}
.final .k{color:#e0c58f}.final h2{font-size:clamp(38px,5.4vw,70px);margin:16px auto 16px;max-width:760px}.final h2 em{color:#e0c58f}.final p{color:#e8d6dc;max-width:520px;margin:0 auto 32px}
.visit{display:grid;grid-template-columns:1fr 1.2fr;gap:50px}
.vc h2{font-size:clamp(34px,4.2vw,54px);margin:14px 0 26px;color:var(--accent)}.vc .r{margin-bottom:20px}.vc b{display:block;font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:var(--accent2);font-weight:600}.vc span{font-size:16.5px}
.map{min-height:380px;border:10px solid #fff;box-shadow:0 30px 60px -34px rgba(80,20,40,.4)}
footer{padding:34px 0;color:var(--mut);font-size:13px;border-top:1px solid var(--line)}.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.ag,.visit{grid-template-columns:1fr;gap:44px}.mas{columns:2}.looks,.pk,.rv2{grid-template-columns:1fr}.sg{grid-template-columns:1fr 1fr}.hp .a:nth-child(2){transform:none}.sec{padding:70px 0}.nav .btn{display:none}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#7b1e3a', '#b8924a', 'S')}" alt="Logo"><span data-e>Studio Aarohi</span></a>
    <nav class="links"><a href="#portfolio" data-e>Portfolio</a><a href="#about" data-e>About</a><a href="#packages" data-e>Packages</a><a href="#visit" data-e>Contact</a></nav>
    <a class="btn" data-cta="enroll" data-e>Check Date</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap hg">
    <div>
      <span class="k rv" data-e>Bridal Makeup &amp; Hair Artist</span>
      <h1 class="rv" data-e>Your most <em>beautiful</em> day, beautifully told</h1>
      <p class="rv" data-e>Flawless, long-lasting bridal looks that photograph as beautifully as they feel. Limited weddings each month — secure your date early.</p>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Check Availability</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
      <div class="hs rv" data-list><div><b data-e>600+</b><span data-e>Brides styled</span></div><div><b data-e>9 yrs</b><span data-e>Experience</span></div><div><b data-e>4.9★</b><span data-e>Rated</span></div></div>
    </div>
    <div class="hp rv"><div class="a"><img data-img="hero1" data-label="Hero photo 1" src="${P.person('#7b1e3a', '#b8924a')}" alt=""></div><div class="a"><img data-img="hero2" data-label="Hero photo 2" src="${P.person('#b8924a', '#7b1e3a')}" alt=""></div></div>
  </div>
</section>

<section class="sec" id="portfolio" style="padding-top:20px" data-section="Portfolio">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Portfolio</span><div class="orn">❦</div><h2 data-e>Brides we've <em>adored</em></h2><p data-e>A glimpse of recent bridal looks. Replace with your own best work.</p></div>
    <div class="mas" data-list>
      <div class="rv"><img data-img="p1" data-label="Portfolio 1" src="${P.photo('#7b1e3a', '#2a0e16', 600, 860)}" alt=""></div>
      <div class="rv"><img data-img="p2" data-label="Portfolio 2" src="${P.photo('#b8924a', '#5a4020', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="p3" data-label="Portfolio 3" src="${P.photo('#a34462', '#4a1226', 600, 760)}" alt=""></div>
      <div class="rv"><img data-img="p4" data-label="Portfolio 4" src="${P.photo('#d9c08a', '#8a6a2a', 600, 860)}" alt=""></div>
      <div class="rv"><img data-img="p5" data-label="Portfolio 5" src="${P.photo('#5a1530', '#b8924a', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="p6" data-label="Portfolio 6" src="${P.photo('#c9778f', '#7b1e3a', 600, 760)}" alt=""></div>
      <div class="rv"><img data-img="p7" data-label="Portfolio 7" src="${P.photo('#8a6a2a', '#2a1a1f', 600, 860)}" alt=""></div>
      <div class="rv"><img data-img="p8" data-label="Portfolio 8" src="${P.photo('#7b1e3a', '#d9c08a', 600, 600)}" alt=""></div>
    </div>
  </div>
</section>

<section class="sec about" id="about" data-section="About the artist">
  <div class="wrap ag">
    <div class="im rv"><img data-img="artist" data-label="Artist photo" src="${P.person('#b8924a', '#4a1226')}" alt=""></div>
    <div class="rv"><span class="k" data-e>The artist</span><h2 data-e>Hello, I'm <em>Aarohi</em></h2><p data-e>For nine years I have helped brides across the city feel confident, radiant and completely themselves on the biggest day of their lives.</p><p data-e>My approach is simple: enhance, never mask. Skin-first prep, premium international products and a calm, unhurried experience.</p>
      <div class="stats" data-list><div><b data-e>600+</b><span data-e>Weddings</span></div><div><b data-e>12</b><span data-e>Cities travelled</span></div><div><b data-e>HD</b><span data-e>&amp; Airbrush</span></div></div></div>
  </div>
</section>

<section class="sec" data-section="Signature looks">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Signature looks</span><div class="orn">❦</div><h2 data-e>Find your <em>style</em></h2></div>
    <div class="looks" data-list>
      <div class="lk rv"><div class="p"><img data-img="l1" data-label="Look 1" src="${P.photo('#7b1e3a', '#2a0e16', 600, 800)}" alt=""></div><h3 data-e>Classic Royal</h3><p data-e>Rich reds, defined eyes and timeless elegance.</p></div>
      <div class="lk rv"><div class="p"><img data-img="l2" data-label="Look 2" src="${P.photo('#e9c9b0', '#b8924a', 600, 800)}" alt=""></div><h3 data-e>Soft Glam</h3><p data-e>Dewy skin, nude tones and a luminous natural finish.</p></div>
      <div class="lk rv"><div class="p"><img data-img="l3" data-label="Look 3" src="${P.photo('#b8924a', '#4a3a1a', 600, 800)}" alt=""></div><h3 data-e>Golden Hour</h3><p data-e>Warm bronze and gold for sunset ceremonies.</p></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-section="Before & After">
  <div class="wrap"><div class="head rv"><span class="k" data-e>The transformation</span><div class="orn">❦</div><h2 data-e>Before &amp; <em>after</em></h2></div>
    <div class="baw rv"><div class="ba" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#cdbfb4', '#8a7a70', 1000, 625)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#7b1e3a', '#b8924a', 1000, 625)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div></div>
</section>

<section class="sec" id="packages" style="background:var(--bg2)" data-section="Packages">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Investment</span><div class="orn">❦</div><h2 data-e>Bridal <em>packages</em></h2><p data-e>Trial included in Signature &amp; Luxe. Travel charges extra outside the city.</p></div>
    <div class="pk" data-list>
      <div class="pc rv"><h3 data-e>Essential</h3><div class="d" data-e>Makeup &amp; hair on the day</div><div class="pr" data-e>₹18,000</div><ul data-list><li data-e>HD bridal makeup</li><li data-e>Hair styling</li><li data-e>Saree / dupatta draping</li></ul><a class="btn o" data-cta="enroll" data-e>Enquire</a></div>
      <div class="pc hot rv"><span class="fl" data-e>Most booked</span><h3 data-e>Signature</h3><div class="d" data-e>The complete bridal experience</div><div class="pr" data-e>₹32,000</div><ul data-list><li data-e>Airbrush bridal makeup</li><li data-e>Premium hair styling</li><li data-e>Pre-bridal trial session</li><li data-e>Mother &amp; sister touch-ups</li></ul><a class="btn" data-cta="enroll" data-e>Enquire</a></div>
      <div class="pc rv"><h3 data-e>Luxe</h3><div class="d" data-e>Multi-day wedding coverage</div><div class="pr" data-e>₹58,000</div><ul data-list><li data-e>Engagement + Wedding + Reception</li><li data-e>Airbrush &amp; HD looks</li><li data-e>Trial + family makeup</li><li data-e>Assistant artist</li></ul><a class="btn o" data-cta="enroll" data-e>Enquire</a></div>
    </div>
  </div>
</section>

<section class="sec" data-section="How it works">
  <div class="wrap"><div class="head rv"><span class="k" data-e>The process</span><div class="orn">❦</div><h2 data-e>From booking to <em>"I do"</em></h2></div>
    <div class="sg" data-list>
      <div class="st rv"><i>1</i><h3 data-e>Enquire</h3><p data-e>Share your date, venue and look ideas.</p></div>
      <div class="st rv"><i>2</i><h3 data-e>Confirm</h3><p data-e>Pay a small advance to reserve your slot.</p></div>
      <div class="st rv"><i>3</i><h3 data-e>Trial</h3><p data-e>Finalise your look in a relaxed trial session.</p></div>
      <div class="st rv"><i>4</i><h3 data-e>Your day</h3><p data-e>Sit back and glow while I handle everything.</p></div>
    </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Video reel">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Behind the scenes</span><div class="orn">❦</div><h2 data-e>Watch the <em>magic</em></h2></div><div class="vid rv"><div data-video data-label="Reel / video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Bride reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Happy brides</span><div class="orn">❦</div><h2 data-e>Kind <em>words</em></h2></div>
    <div class="rv2" data-list>
      <div class="rc rv"><p data-e>Aarohi made me feel like a queen. My makeup lasted from the morning pheras till the late-night reception without a single touch-up.</p><div class="who"><img data-img="u1" data-label="Bride 1" src="${P.avatar('#7b1e3a', '#b8924a')}" alt=""><span><b data-e>Tanvi Deshmukh</b><small data-e>Bride · Dec 2024</small></span></div></div>
      <div class="rc rv"><p data-e>So calm and professional. The trial was the best part — she understood exactly the soft, natural look I wanted.</p><div class="who"><img data-img="u2" data-label="Bride 2" src="${P.avatar('#c9778f', '#7b1e3a')}" alt=""><span><b data-e>Simran Bhatia</b><small data-e>Bride · Feb 2025</small></span></div></div>
      <div class="rc rv"><p data-e>Every relative asked for her number! She also did my mother and sister's makeup and everyone looked stunning.</p><div class="who"><img data-img="u3" data-label="Bride 3" src="${P.avatar('#b8924a', '#5a4020')}" alt=""><span><b data-e>Ayesha Khan</b><small data-e>Bride · Mar 2025</small></span></div></div>
    </div></div>
</section>

<section class="final" data-section="Final call to action"><div class="wrap"><span class="k rv" data-e>Limited dates</span><h2 class="rv" data-e>Your wedding date is <em>precious</em>. Secure it today.</h2><p class="rv" data-e>I take only a few weddings every month to give each bride my full attention.</p><a class="btn g rv" data-cta="enroll" data-e>Check Availability</a></div></section>

<section class="sec" id="visit" data-section="Contact">
  <div class="wrap visit">
    <div class="vc rv"><span class="k" data-e>Studio</span><h2 data-e>Visit the <em>studio</em></h2>
      <div class="r"><b data-e>Address</b><span data-e>7, Heritage Square, Your City – 000000</span></div><div class="r"><b data-e>Hours</b><span data-e>Mon – Sat · 10:00 AM – 7:00 PM (by appointment)</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div>
      <a class="btn" data-cta="enroll" data-e>Check Availability</a></div>
    <div class="map rv" data-map data-label="Studio location" data-q="Jubilee Hills, Hyderabad"></div>
  </div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 Studio Aarohi. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-e>Instagram</a></span></div></footer>
</body>
</html>`
  });
})();
