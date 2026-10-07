/* Salon 4 — ZEN: calm, airy wellness spa (sage & sand) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'salon-zen',
    category: 'salon',
    name: 'Zen Spa',
    tagline: 'Calm, airy & natural wellness spa',
    best: 'Day spa · Massage centre · Ayurveda · Wellness studio',
    colors: [
      { v: '--accent', l: 'Main (sage)', d: '#5f7a61' },
      { v: '--accent2', l: 'Warm sand', d: '#d9c7a8' }
    ],
    defaults: {
      enroll: { title: 'Reserve your relaxation', sub: 'Choose a treatment and we will confirm your session on WhatsApp.', button: 'Reserve Session', thanks: 'Session requested. Namaste 🙏', extraOn: true, extraLabel: 'Treatment', extraOptions: 'Swedish Massage, Deep Tissue, Aromatherapy, Ayurvedic Abhyanga, Facial Therapy, Couple Spa' },
      whatsapp: { message: 'Hi! I would like to book a spa session.' },
      countdown: { on: false }, bar: { on: true, text: 'Reserve' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zen Spa — Relax. Restore. Renew.</title>
<meta name="description" content="Massage, aromatherapy and wellness treatments in a calm, private space. Reserve your session.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#5f7a61;--accent2:#d9c7a8;--accent-ink:#fff;--bg:#f7f3ec;--bg2:#efe8db;--ink:#2a3a2d;--mut:#6f7a6e;--line:#e2d9c8}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Nunito Sans',system-ui,sans-serif;line-height:1.75;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Cormorant',Georgia,serif;font-weight:500;line-height:1.1}
em{font-style:italic;color:var(--accent)}
.wrap{width:min(1160px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 36px;background:var(--accent);color:#fff;border-radius:99px;font-weight:600;font-size:15px;letter-spacing:.06em;border:1.5px solid var(--accent);transition:.3s;cursor:pointer}
.btn:hover{background:transparent;color:var(--accent)}
.btn.o{background:transparent;color:var(--accent)}.btn.o:hover{background:var(--accent);color:#fff}
.k{font-size:12.5px;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);font-weight:600}
header{position:sticky;top:0;z-index:40;background:rgba(247,243,236,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:80px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Cormorant';font-size:30px;font-weight:600}
.brand img{width:42px;height:42px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:34px;font-size:14px;color:var(--mut);font-weight:600;letter-spacing:.06em}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 26px;font-size:13.5px}
.hero{padding:70px 0 100px;position:relative}
.hg{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.hero h1{font-size:clamp(50px,7vw,92px);margin:20px 0 22px}
.hero p{font-size:18.5px;color:var(--mut);max-width:480px;margin-bottom:34px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px}
.hs{display:flex;gap:40px;flex-wrap:wrap}.hs b{font-family:'Cormorant';font-size:44px;color:var(--accent);display:block;line-height:1}.hs span{font-size:13.5px;color:var(--mut)}
.hp{position:relative}
.hp .a{aspect-ratio:4/5;border-radius:999px 999px 24px 24px;overflow:hidden}
.hp .a img{width:100%;height:100%;object-fit:cover}
.hp .b{position:absolute;left:-40px;bottom:50px;width:42%;aspect-ratio:1/1;border-radius:50%;overflow:hidden;border:8px solid var(--bg)}
.hp .b img{width:100%;height:100%;object-fit:cover}
.hp::before{content:"";position:absolute;right:-40px;top:-30px;width:200px;height:200px;border-radius:50%;background:var(--accent2);opacity:.55;z-index:-1}
.sec{padding:100px 0}
.head{text-align:center;max-width:640px;margin:0 auto 60px}
.head h2{font-size:clamp(38px,5vw,62px);margin:14px 0 14px}.head p{color:var(--mut);font-size:17.5px}
.tr{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.tc{background:#fff;border-radius:26px;overflow:hidden;border:1px solid var(--line);transition:.4s}
.tc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -34px rgba(60,80,60,.5)}
.tc .p{aspect-ratio:4/3;overflow:hidden}.tc .p img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.tc:hover .p img{transform:scale(1.07)}
.tc .in{padding:26px 28px 30px}.tc h3{font-size:30px;margin-bottom:6px}.tc p{color:var(--mut);font-size:15.5px;margin-bottom:16px}
.tc .m{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding-top:16px;font-size:14.5px}
.tc .m b{font-family:'Cormorant';font-size:28px;color:var(--accent);font-weight:600}.tc .m span{color:var(--mut)}
.band{background:var(--accent);color:#fff;padding:90px 0}
.bg2{display:grid;grid-template-columns:1fr 1.1fr;gap:70px;align-items:center}
.bg2 h2{font-size:clamp(38px,4.6vw,58px);margin:14px 0 24px}.bg2 .k{color:var(--accent2)}.bg2 h2 em{color:var(--accent2)}
.bn{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.bn div i{font-style:normal;font-size:30px;display:block;margin-bottom:8px}.bn b{font-family:'Cormorant';font-size:25px;display:block;font-weight:600}.bn span{color:#dfe8de;font-size:15px}
.vd{border-radius:26px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(0,0,0,.5);border:6px solid rgba(255,255,255,.2)}
.baw{max-width:820px;margin:0 auto}
.ba{aspect-ratio:16/10;border-radius:26px;border:6px solid #fff;box-shadow:0 30px 60px -30px rgba(60,80,60,.5)}
.ba .lbl{position:absolute;top:16px;z-index:2;background:rgba(255,255,255,.92);padding:5px 16px;border-radius:99px;font-size:12.5px;font-weight:700;color:var(--accent)}.ba .lbl.l{left:16px}.ba .lbl.r{right:16px}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:stretch}
.pc{background:#fff;border:1px solid var(--line);border-radius:28px;padding:42px 34px;text-align:center;position:relative}
.pc.hot{background:var(--ink);color:#fff;border-color:var(--ink)}.pc.hot .pr,.pc.hot li::before{color:var(--accent2)}.pc.hot li{color:#dfe8de}
.pc.hot .btn{background:var(--accent2);border-color:var(--accent2);color:var(--ink)}
.pc h3{font-size:34px}.pc .d{color:var(--mut);font-size:14.5px}.pc.hot .d{color:#b8c7b8}
.pc .pr{font-family:'Cormorant';font-size:58px;font-weight:600;color:var(--accent);margin:14px 0 6px;line-height:1}
.pc ul{list-style:none;margin:20px 0 28px;display:grid;gap:10px;font-size:15.5px;color:var(--mut)}.pc li::before{content:"❀";color:var(--accent);margin-right:10px}
.pc .fl{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent2);color:var(--ink);padding:4px 18px;border-radius:99px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.th{display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
.tp{text-align:center}.tp .p{width:190px;height:190px;border-radius:50%;overflow:hidden;margin:0 auto 20px;border:6px solid #fff;box-shadow:0 20px 40px -20px rgba(60,80,60,.5)}.tp .p img{width:100%;height:100%;object-fit:cover}
.tp h3{font-size:30px}.tp span{color:var(--accent);font-size:13px;letter-spacing:.2em;text-transform:uppercase;font-weight:600}
.rv2{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.rc{background:var(--bg2);border-radius:26px;padding:36px 32px}
.rc .st{color:#c9a24a;letter-spacing:4px;margin-bottom:12px}.rc p{font-family:'Cormorant';font-size:23px;line-height:1.4;font-style:italic;margin-bottom:22px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15px}.who small{color:var(--mut)}
.gift{padding:0 0 100px}
.gift .box{background:linear-gradient(135deg,var(--accent2),#efe3cc);border-radius:36px;padding:70px 40px;text-align:center;position:relative;overflow:hidden}
.gift h2{font-size:clamp(36px,5vw,60px);margin:14px 0}.gift p{color:#5b5a4a;max-width:520px;margin:0 auto 28px;font-size:17.5px}
.visit{display:grid;grid-template-columns:1fr 1.2fr;gap:50px;align-items:stretch}
.vc h2{font-size:clamp(36px,4.4vw,54px);margin:14px 0 28px}.vc .r{margin-bottom:22px}.vc b{display:block;font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);font-weight:700}.vc span{font-size:18px}
.map{border-radius:28px;min-height:380px;border:6px solid #fff;box-shadow:0 30px 60px -34px rgba(60,80,60,.5)}
footer{padding:34px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.bg2,.visit{grid-template-columns:1fr;gap:44px}.tr,.pk,.th,.rv2{grid-template-columns:1fr}.hp .b{left:0}.sec{padding:70px 0}.nav .btn{display:none}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#5f7a61', '#d9c7a8', 'Z')}" alt="Logo"><span data-e>Zen Spa</span></a>
    <nav class="links"><a href="#treatments" data-e>Treatments</a><a href="#packages" data-e>Packages</a><a href="#therapists" data-e>Therapists</a><a href="#visit" data-e>Visit</a></nav>
    <a class="btn" data-cta="enroll" data-e>Reserve</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap hg">
    <div>
      <span class="k rv" data-e>Wellness · Massage · Renewal</span>
      <h1 class="rv" data-e>Relax. Restore. <em>Renew.</em></h1>
      <p class="rv" data-e>Escape the noise. Our calm, private sanctuary and skilled therapists will melt away stress and bring balance back to your body and mind.</p>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Reserve a Session</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
      <div class="hs rv" data-list><div><b data-e>4.9★</b><span data-e>1,500+ reviews</span></div><div><b data-e>15</b><span data-e>Certified therapists</span></div><div><b data-e>10 yrs</b><span data-e>of calm</span></div></div>
    </div>
    <div class="hp rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.photo('#9db39f', '#5f7a61', 800, 1000)}" alt=""></div><div class="b"><img data-img="hero2" data-label="Small round photo" src="${P.photo('#d9c7a8', '#a88f63', 500, 500)}" alt=""></div></div>
  </div>
</section>

<section class="sec" id="treatments" data-section="Treatments" style="padding-top:20px">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Our treatments</span><h2 data-e>Ease for every <em>body</em></h2><p data-e>Each treatment is tailored to your needs and delivered by trained therapists.</p></div>
    <div class="tr" data-list>
      <div class="tc rv"><div class="p"><img data-img="t1" data-label="Treatment 1" src="${P.photo('#b7c7b4', '#5f7a61', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Swedish Massage</h3><p data-e>Gentle, flowing strokes to ease tension and improve circulation.</p><div class="m"><span data-e>60 min</span><b data-e>₹2,499</b></div></div></div>
      <div class="tc rv"><div class="p"><img data-img="t2" data-label="Treatment 2" src="${P.photo('#d9c7a8', '#8d6e3f', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Deep Tissue</h3><p data-e>Firm pressure to release chronic knots and muscle stiffness.</p><div class="m"><span data-e>60 min</span><b data-e>₹2,999</b></div></div></div>
      <div class="tc rv"><div class="p"><img data-img="t3" data-label="Treatment 3" src="${P.photo('#c9d6c7', '#44624a', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Aromatherapy</h3><p data-e>Essential-oil massage that calms the mind and lifts your mood.</p><div class="m"><span data-e>75 min</span><b data-e>₹3,299</b></div></div></div>
      <div class="tc rv"><div class="p"><img data-img="t4" data-label="Treatment 4" src="${P.photo('#e6d9bd', '#a88f63', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Ayurvedic Abhyanga</h3><p data-e>Warm herbal-oil therapy rooted in ancient healing tradition.</p><div class="m"><span data-e>75 min</span><b data-e>₹3,499</b></div></div></div>
      <div class="tc rv"><div class="p"><img data-img="t5" data-label="Treatment 5" src="${P.photo('#a9bda9', '#3f5a43', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Facial Therapy</h3><p data-e>Organic facial with lymphatic massage for naturally radiant skin.</p><div class="m"><span data-e>60 min</span><b data-e>₹2,199</b></div></div></div>
      <div class="tc rv"><div class="p"><img data-img="t6" data-label="Treatment 6" src="${P.photo('#efe3cc', '#b99c6b', 800, 600)}" alt=""></div><div class="in"><h3 data-e>Couple Spa</h3><p data-e>A shared, private retreat with side-by-side massages and tea.</p><div class="m"><span data-e>90 min</span><b data-e>₹6,999</b></div></div></div>
    </div>
  </div>
</section>

<section class="band" data-section="Benefits & video">
  <div class="wrap bg2">
    <div class="rv"><span class="k" data-e>Why Zen</span><h2 data-e>A calmer you begins <em>here</em></h2>
      <div class="bn" data-list><div><i>🌿</i><b data-e>Natural products</b><span data-e>Organic oils and chemical-free care.</span></div><div><i>🕯️</i><b data-e>Private rooms</b><span data-e>Soft lights, warm music, total peace.</span></div><div><i>🙏</i><b data-e>Expert therapists</b><span data-e>Certified, caring and experienced.</span></div><div><i>🧼</i><b data-e>Spotless hygiene</b><span data-e>Fresh linen and sanitised spaces.</span></div></div></div>
    <div class="vd rv"><div data-video data-label="Spa tour video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  </div>
</section>

<section class="sec" data-section="Before & After">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Visible results</span><h2 data-e>Skin that <em>glows</em></h2><p data-e>Slide to compare — replace with your real client photos.</p></div>
    <div class="baw rv"><div class="ba" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#b9b3a3', '#7a7565', 1000, 625)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#d9c7a8', '#5f7a61', 1000, 625)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div></div>
</section>

<section class="sec" id="packages" style="background:var(--bg2)" data-section="Packages">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Spa packages</span><h2 data-e>Curated <em>rituals</em></h2></div>
    <div class="pk" data-list>
      <div class="pc rv"><h3 data-e>Quick Escape</h3><div class="d" data-e>Perfect lunch-break reset</div><div class="pr" data-e>₹2,999</div><ul data-list><li data-e>45-min back &amp; shoulder massage</li><li data-e>Foot reflexology</li><li data-e>Herbal tea</li></ul><a class="btn o" data-cta="enroll" data-e>Reserve</a></div>
      <div class="pc hot rv"><span class="fl" data-e>Most popular</span><h3 data-e>Full Serenity</h3><div class="d" data-e>Our signature 2.5-hour ritual</div><div class="pr" data-e>₹7,499</div><ul data-list><li data-e>Aromatherapy full-body massage</li><li data-e>Organic facial</li><li data-e>Steam &amp; foot soak</li><li data-e>Refreshments</li></ul><a class="btn" data-cta="enroll" data-e>Reserve</a></div>
      <div class="pc rv"><h3 data-e>Couple Retreat</h3><div class="d" data-e>Together time, beautifully done</div><div class="pr" data-e>₹10,999</div><ul data-list><li data-e>Side-by-side massages</li><li data-e>Private suite</li><li data-e>Champagne &amp; fruits</li></ul><a class="btn o" data-cta="enroll" data-e>Reserve</a></div>
    </div>
  </div>
</section>

<section class="sec" id="therapists" data-section="Therapists">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Healing hands</span><h2 data-e>Our <em>therapists</em></h2></div>
    <div class="th" data-list>
      <div class="tp rv"><div class="p"><img data-img="p1" data-label="Therapist 1" src="${P.person('#9db39f', '#5f7a61')}" alt=""></div><h3 data-e>Anita Rao</h3><span data-e>Senior Therapist</span></div>
      <div class="tp rv"><div class="p"><img data-img="p2" data-label="Therapist 2" src="${P.person('#d9c7a8', '#8d6e3f')}" alt=""></div><h3 data-e>Dr. Suresh Nair</h3><span data-e>Ayurveda Expert</span></div>
      <div class="tp rv"><div class="p"><img data-img="p3" data-label="Therapist 3" src="${P.person('#b7c7b4', '#44624a')}" alt=""></div><h3 data-e>Lakshmi Menon</h3><span data-e>Skin &amp; Facial Therapist</span></div>
    </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Guest stories</span><h2 data-e>Moments of <em>calm</em></h2></div>
    <div class="rv2" data-list>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"I walked in stressed and walked out floating. The aromatherapy session was pure bliss."</p><div class="who"><img data-img="u1" data-label="Guest 1" src="${P.avatar('#9db39f', '#5f7a61')}" alt=""><span><b data-e>Meenal Kulkarni</b><small data-e>Aromatherapy</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Beautiful ambience, spotless rooms and therapists who truly listen. My monthly ritual now."</p><div class="who"><img data-img="u2" data-label="Guest 2" src="${P.avatar('#d9c7a8', '#8d6e3f')}" alt=""><span><b data-e>Rohit &amp; Sana</b><small data-e>Couple Retreat</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My back pain is so much better after the deep tissue sessions. Highly recommend."</p><div class="who"><img data-img="u3" data-label="Guest 3" src="${P.avatar('#b7c7b4', '#44624a')}" alt=""><span><b data-e>Deepak Arora</b><small data-e>Deep Tissue</small></span></div></div>
    </div></div>
</section>

<section class="gift" data-section="Gift card"><div class="wrap"><div class="box rv"><span class="k" data-e>Gift serenity</span><h2 data-e>Give the gift of <em>relaxation</em></h2><p data-e>Spa gift cards for birthdays, anniversaries and festivals — delivered instantly on WhatsApp.</p><a class="btn" data-cta="enroll" data-e>Buy a Gift Card</a></div></div></section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap visit">
    <div class="vc rv"><span class="k" data-e>Find your calm</span><h2 data-e>Visit <em>Zen Spa</em></h2>
      <div class="r"><b data-e>Address</b><span data-e>12, Garden Lane, Your City – 000000</span></div><div class="r"><b data-e>Open</b><span data-e>Daily · 9:00 AM – 9:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div>
      <a class="btn" data-cta="enroll" data-e>Reserve a Session</a></div>
    <div class="map rv" data-map data-label="Spa location" data-q="Indiranagar, Bengaluru"></div>
  </div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 Zen Spa. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-e>Instagram</a></span></div></footer>
</body>
</html>`
  });
})();
