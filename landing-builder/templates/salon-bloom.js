/* Salon 2 — BLOOM: soft pastel pink beauty parlour / ladies salon */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'salon-bloom',
    category: 'salon',
    name: 'Bloom',
    tagline: 'Soft, pretty & pastel beauty parlour',
    best: 'Ladies salon · Beauty parlour · Makeup & skin studio',
    colors: [
      { v: '--accent', l: 'Main (pink)', d: '#e0508a' },
      { v: '--accent2', l: 'Soft (blush)', d: '#ffd9e4' }
    ],
    defaults: {
      enroll: { title: 'Book your glow-up ✨', sub: 'Tell us what you need and we will confirm your slot on WhatsApp.', button: 'Book My Slot', thanks: 'Yay! Request received.', extraOn: true, extraLabel: 'Service', extraOptions: 'Facial & Glow, Hair Spa, Haircut, Bridal Makeup, Threading & Waxing, Mani-Pedi' },
      whatsapp: { message: 'Hi! I want to book an appointment.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Slot' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bloom Beauty Studio — Book Appointment</title>
<meta name="description" content="Facials, hair, bridal makeup and more. Book your appointment at Bloom Beauty Studio.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#e0508a;--accent2:#ffd9e4;--accent-ink:#fff;--bg:#fff7f6;--ink:#3a1f2b;--mut:#8a6a76;--line:#f4d9e0;--card:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Poppins',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.1}
em{font-style:italic;color:var(--accent)}
.wrap{width:min(1180px,100% - 40px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 32px;border-radius:99px;background:var(--accent);color:#fff;font-weight:500;font-size:15.5px;border:2px solid var(--accent);transition:.25s;cursor:pointer;box-shadow:0 14px 30px -14px var(--accent)}
.btn:hover{transform:translateY(-3px)}
.btn.o{background:transparent;color:var(--accent);box-shadow:none}.btn.o:hover{background:var(--accent);color:#fff}
.pill{display:inline-block;background:var(--accent2);color:var(--accent);font-weight:600;font-size:13px;padding:7px 18px;border-radius:99px;letter-spacing:.04em}
header{position:sticky;top:0;z-index:40;background:rgba(255,247,246,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'DM Serif Display';font-size:26px}
.brand img{width:42px;height:42px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:30px;font-size:14.5px;font-weight:500;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:14px;box-shadow:none}
.hero{padding:60px 0 100px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;right:-120px;top:-100px;width:560px;height:560px;border-radius:50%;background:var(--accent2);opacity:.7}
.hg{display:grid;grid-template-columns:1.05fr .95fr;gap:50px;align-items:center;position:relative}
.hero h1{font-size:clamp(46px,6.6vw,86px);margin:20px 0 20px;color:var(--ink)}
.hero p{font-size:18px;color:var(--mut);max-width:500px;margin-bottom:32px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.pf{display:flex;align-items:center;gap:14px;font-size:14px;color:var(--mut)}
.pf .fa{display:flex}.pf .fa img{width:40px;height:40px;border-radius:50%;border:3px solid #fff;margin-left:-10px;object-fit:cover}.pf .fa img:first-child{margin-left:0}
.pf b{color:var(--ink)}
.hp{position:relative;max-width:480px;margin:0 auto}
.hp .a{aspect-ratio:4/5;border-radius:240px 240px 30px 30px;overflow:hidden;border:8px solid #fff;box-shadow:0 40px 80px -30px rgba(224,80,138,.45)}
.hp .a img{width:100%;height:100%;object-fit:cover}
.hp .c{position:absolute;background:#fff;border-radius:18px;padding:12px 18px;box-shadow:0 18px 40px -16px rgba(90,30,60,.4);font-size:13.5px;font-weight:500;display:flex;gap:10px;align-items:center}
.hp .c.a1{left:-30px;bottom:90px}.hp .c.a2{right:-16px;top:60px}
.hp .c i{font-style:normal;font-size:22px}
.sec{padding:96px 0}
.head{text-align:center;max-width:640px;margin:0 auto 54px}
.head h2{font-size:clamp(36px,5vw,58px);margin:14px 0 12px}.head p{color:var(--mut);font-size:17px}
.sv{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.sc{background:#fff;border:1px solid var(--line);border-radius:28px;padding:34px 28px;transition:.3s;position:relative;overflow:hidden}
.sc:hover{transform:translateY(-8px);box-shadow:0 30px 50px -30px rgba(224,80,138,.5);border-color:var(--accent)}
.sc .i{width:64px;height:64px;border-radius:20px;background:var(--accent2);display:grid;place-items:center;font-size:30px;margin-bottom:20px}
.sc h3{font-size:28px;margin-bottom:8px}.sc p{color:var(--mut);font-size:15px;margin-bottom:18px}
.sc .pr{color:var(--accent);font-weight:600;font-size:15.5px}.sc .pr small{color:var(--mut);font-weight:400}
.why{background:#fff;border-block:1px solid var(--line)}
.wg{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.wg .im{border-radius:36px;overflow:hidden;aspect-ratio:1/1;box-shadow:0 30px 60px -30px rgba(224,80,138,.5)}.wg .im img{width:100%;height:100%;object-fit:cover}
.wg h2{font-size:clamp(34px,4.4vw,54px);margin:16px 0 24px}
.wl{display:grid;gap:18px}.wl div{display:flex;gap:16px;align-items:flex-start}
.wl i{flex:none;width:44px;height:44px;border-radius:50%;background:var(--accent2);display:grid;place-items:center;font-style:normal;font-size:20px}
.wl b{display:block;font-weight:600}.wl span{color:var(--mut);font-size:15px}
.baw{max-width:760px;margin:0 auto}
.ba{aspect-ratio:4/3;border-radius:32px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(224,80,138,.5)}
.ba .lbl{position:absolute;top:16px;z-index:2;background:rgba(255,255,255,.92);padding:5px 15px;border-radius:99px;font-size:12.5px;font-weight:600;color:var(--accent)}.ba .lbl.l{left:16px}.ba .lbl.r{right:16px}
.of{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.oc{border-radius:28px;padding:34px 30px;color:#fff;position:relative;overflow:hidden;min-height:230px;display:flex;flex-direction:column;justify-content:flex-end}
.oc:nth-child(1){background:linear-gradient(135deg,#e0508a,#f58bb0)}.oc:nth-child(2){background:linear-gradient(135deg,#a855f7,#e0508a)}.oc:nth-child(3){background:linear-gradient(135deg,#f59e0b,#f0689c)}
.oc::after{content:"%";position:absolute;right:-10px;top:-40px;font-family:'DM Serif Display';font-size:190px;opacity:.16}
.oc b{font-family:'DM Serif Display';font-size:50px;font-weight:400;line-height:1}.oc h3{font-size:24px;margin:6px 0 14px}
.oc a{align-self:flex-start;background:#fff;color:var(--accent);padding:9px 22px;border-radius:99px;font-weight:600;font-size:14px}
.gal{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.gal div{aspect-ratio:1/1;border-radius:24px;overflow:hidden}.gal img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.gal div:hover img{transform:scale(1.1)}
.tm{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.tc{text-align:center;background:#fff;border:1px solid var(--line);border-radius:30px;padding:34px 22px}
.tc .p{width:150px;height:150px;border-radius:50%;overflow:hidden;margin:0 auto 18px;border:5px solid var(--accent2)}.tc .p img{width:100%;height:100%;object-fit:cover}
.tc h3{font-size:27px}.tc span{color:var(--accent);font-size:14px;font-weight:500}
.rv2{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{background:#fff;border:1px solid var(--line);border-radius:28px;padding:32px 28px}
.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:12px}.rc p{margin-bottom:20px;font-size:15.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-weight:600;font-size:15px}.who small{color:var(--mut)}
.visit{display:grid;grid-template-columns:1fr 1.15fr;gap:46px}
.vc{background:var(--ink);color:#fff;border-radius:34px;padding:50px 42px}
.vc h2{font-size:clamp(34px,4vw,50px);margin:14px 0 26px}.vc .pill{background:rgba(255,255,255,.14);color:#ffd9e4}
.vc div.r{margin-bottom:20px}.vc b{display:block;color:#ffd9e4;font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:500}.vc span{color:#f3e5ea}
.map{border-radius:34px;min-height:380px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(224,80,138,.4)}
footer{padding:32px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.wg,.visit{grid-template-columns:1fr}.sv,.of,.tm,.rv2{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr}.hp .c.a1{left:0}.hp .c.a2{right:0}.sec{padding:70px 0}.nav .btn{display:none}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#e0508a', '#f58bb0', 'B')}" alt="Logo"><span data-e>Bloom Beauty</span></a>
    <nav class="links"><a href="#services" data-e>Services</a><a href="#offers" data-e>Offers</a><a href="#team" data-e>Team</a><a href="#visit" data-e>Visit</a></nav>
    <a class="btn" data-cta="enroll" data-e>Book Now</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap hg">
    <div>
      <span class="pill rv" data-e>🌸 Beauty · Hair · Bridal</span>
      <h1 class="rv" data-e>Feel <em>beautiful</em>, every single day</h1>
      <p class="rv" data-e>A warm, hygienic and friendly studio where every woman leaves glowing. Expert beauticians, premium products and prices that feel good too.</p>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Appointment</a><a class="btn o" data-cta="whatsapp" data-e>💬 Chat on WhatsApp</a></div>
      <div class="pf rv"><div class="fa"><img data-img="f1" data-label="Client face 1" src="${P.avatar('#e0508a', '#ffd9e4')}" alt=""><img data-img="f2" data-label="Client face 2" src="${P.avatar('#a855f7', '#f9a8d4')}" alt=""><img data-img="f3" data-label="Client face 3" src="${P.avatar('#f59e0b', '#f0689c')}" alt=""></div><span><b data-e>5,000+ happy clients</b> · <span data-e>4.9★ on Google</span></span></div>
    </div>
    <div class="hp rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.person('#f58bb0', '#e0508a')}" alt=""></div><div class="c a1"><i>✨</i><span data-e>Glow guarantee</span></div><div class="c a2"><i>🧴</i><span data-e>100% branded products</span></div></div>
  </div>
</section>

<section class="sec" id="services" data-section="Services">
  <div class="wrap">
    <div class="head rv"><span class="pill" data-e>What we do</span><h2 data-e>Services made for <em>you</em></h2><p data-e>From a quick cleanup to a complete makeover — everything under one roof.</p></div>
    <div class="sv" data-list>
      <div class="sc rv"><div class="i">💆‍♀️</div><h3 data-e>Facials &amp; Skin</h3><p data-e>Hydrating, brightening and anti-acne facials tailored to your skin type.</p><div class="pr"><span data-e>From ₹899</span></div></div>
      <div class="sc rv"><div class="i">💇‍♀️</div><h3 data-e>Hair Care</h3><p data-e>Haircuts, colour, spa, smoothening and keratin by trained stylists.</p><div class="pr"><span data-e>From ₹499</span></div></div>
      <div class="sc rv"><div class="i">👰</div><h3 data-e>Bridal Makeup</h3><p data-e>HD, airbrush and traditional looks that last through every ritual.</p><div class="pr"><span data-e>From ₹14,999</span></div></div>
      <div class="sc rv"><div class="i">💅</div><h3 data-e>Nails &amp; Mani-Pedi</h3><p data-e>Gel polish, nail art and relaxing spa pedicures.</p><div class="pr"><span data-e>From ₹799</span></div></div>
      <div class="sc rv"><div class="i">🪒</div><h3 data-e>Threading &amp; Waxing</h3><p data-e>Gentle, hygienic and pain-free with premium rica wax.</p><div class="pr"><span data-e>From ₹49</span></div></div>
      <div class="sc rv"><div class="i">💄</div><h3 data-e>Party Makeup</h3><p data-e>Get picture-perfect for parties, shoots and special days.</p><div class="pr"><span data-e>From ₹2,499</span></div></div>
    </div>
  </div>
</section>

<section class="sec why" data-section="Why choose us">
  <div class="wrap wg">
    <div class="im rv"><img data-img="why" data-label="Studio photo" src="${P.photo('#f9a8d4', '#e0508a', 800, 800)}" alt=""></div>
    <div class="rv"><span class="pill" data-e>Why Bloom</span><h2 data-e>Beauty care you can <em>trust</em></h2>
      <div class="wl" data-list><div><i>🧼</i><span><b data-e>Hospital-grade hygiene</b><span data-e>Sterilised tools and fresh disposables for every client.</span></span></div><div><i>🧴</i><span><b data-e>Only branded products</b><span data-e>L'Oréal, O3+, Lakmé and more — never compromised.</span></span></div><div><i>👩‍🎓</i><span><b data-e>Certified beauticians</b><span data-e>Trained professionals with 5–10 years of experience.</span></span></div><div><i>💖</i><span><b data-e>Friendly, private space</b><span data-e>A calm, ladies-only environment where you feel at ease.</span></span></div></div></div>
  </div>
</section>

<section class="sec" data-section="Before & After">
  <div class="wrap">
    <div class="head rv"><span class="pill" data-e>Real results</span><h2 data-e>Before &amp; <em>after</em></h2><p data-e>Slide to see the transformation.</p></div>
    <div class="baw rv"><div class="ba" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#c9b2b8', '#8a6a76', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#f9a8d4', '#e0508a', 900, 675)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div>
  </div>
</section>

<section class="sec" id="offers" style="padding-top:0" data-section="Offers">
  <div class="wrap"><div class="of" data-list>
    <div class="oc rv"><b data-e>30% OFF</b><h3 data-e>First-visit special</h3><a data-cta="enroll" data-e>Claim offer</a></div>
    <div class="oc rv"><b data-e>₹4,999</b><h3 data-e>Facial + Hair Spa + Mani-Pedi</h3><a data-cta="enroll" data-e>Book combo</a></div>
    <div class="oc rv"><b data-e>BOGO</b><h3 data-e>Bring a friend, get 20% off each</h3><a data-cta="enroll" data-e>Book together</a></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="Gallery">
  <div class="wrap">
    <div class="head rv"><span class="pill" data-e>Our work</span><h2 data-e>Follow us on <em>Instagram</em></h2></div>
    <div class="gal" data-list>
      <div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#f9a8d4', '#e0508a', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#ffd9e4', '#a855f7', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#f58bb0', '#f59e0b', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#e0508a', '#ffd9e4', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#a855f7', '#f9a8d4', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#f59e0b', '#e0508a', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g7" data-label="Gallery 7" src="${P.photo('#ffd9e4', '#e0508a', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g8" data-label="Gallery 8" src="${P.photo('#f9a8d4', '#a855f7', 600, 600)}" alt=""></div>
    </div>
  </div>
</section>

<section class="sec why" id="team" data-section="Team">
  <div class="wrap">
    <div class="head rv"><span class="pill" data-e>Our experts</span><h2 data-e>Meet the <em>beauticians</em></h2></div>
    <div class="tm" data-list>
      <div class="tc rv"><div class="p"><img data-img="t1" data-label="Expert 1" src="${P.person('#f58bb0', '#e0508a')}" alt=""></div><h3 data-e>Priya Sharma</h3><span data-e>Skin &amp; Makeup Expert</span></div>
      <div class="tc rv"><div class="p"><img data-img="t2" data-label="Expert 2" src="${P.person('#a855f7', '#f9a8d4')}" alt=""></div><h3 data-e>Kavita Joshi</h3><span data-e>Hair Specialist</span></div>
      <div class="tc rv"><div class="p"><img data-img="t3" data-label="Expert 3" src="${P.person('#f59e0b', '#f0689c')}" alt=""></div><h3 data-e>Nazia Khan</h3><span data-e>Bridal Artist</span></div>
    </div>
  </div>
</section>

<section class="sec" data-section="Reviews">
  <div class="wrap">
    <div class="head rv"><span class="pill" data-e>Happy clients</span><h2 data-e>What they <em>say</em></h2></div>
    <div class="rv2" data-list>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Super clean, friendly staff and my facial gave instant glow. Best parlour in the area!"</p><div class="who"><img data-img="u1" data-label="Client 1" src="${P.avatar('#e0508a', '#ffd9e4')}" alt=""><span><b data-e>Anjali Gupta</b><small data-e>Regular client</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Nazia did my bridal makeup and I couldn't stop smiling. Photos came out amazing."</p><div class="who"><img data-img="u2" data-label="Client 2" src="${P.avatar('#a855f7', '#f9a8d4')}" alt=""><span><b data-e>Ritu Agarwal</b><small data-e>Bride</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Great prices, great service. The hair spa made my hair so soft. Will visit again."</p><div class="who"><img data-img="u3" data-label="Client 3" src="${P.avatar('#f59e0b', '#f0689c')}" alt=""><span><b data-e>Farah Siddiqui</b><small data-e>Hair spa client</small></span></div></div>
    </div>
  </div>
</section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap visit">
    <div class="vc rv"><span class="pill" data-e>Come say hi</span><h2 data-e>Visit <em style="color:#ffd9e4">Bloom</em></h2>
      <div class="r"><b data-e>Address</b><span data-e>Shop 12, Rose Plaza, Your City – 000000</span></div><div class="r"><b data-e>Open</b><span data-e>Daily · 10:00 AM – 8:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div>
      <a class="btn" style="background:#fff;color:var(--accent);border-color:#fff" data-cta="enroll" data-e>Book Appointment</a></div>
    <div class="map rv" data-map data-label="Studio location" data-q="Bandra West, Mumbai"></div>
  </div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 Bloom Beauty Studio. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-e>Instagram</a></span></div></footer>
</body>
</html>`
  });
})();
