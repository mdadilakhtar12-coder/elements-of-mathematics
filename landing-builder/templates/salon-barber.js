/* Salon 3 — BARBER: bold black & amber men's grooming / barbershop */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'salon-barber',
    category: 'salon',
    name: 'Barber Co.',
    tagline: 'Bold & masculine men\'s grooming',
    best: 'Barbershop · Men\'s salon · Grooming lounge',
    colors: [
      { v: '--accent', l: 'Main (amber)', d: '#f5b335' },
      { v: '--accent2', l: 'Barber-pole red', d: '#d6362b' }
    ],
    defaults: {
      enroll: { title: 'Book your chair', sub: 'Pick your service and we will confirm your slot on WhatsApp.', button: 'Book My Chair', thanks: 'Chair reserved!', extraOn: true, extraLabel: 'Service', extraOptions: 'Haircut, Beard Trim & Shape, Haircut + Beard, Hair Colour, Shave, Head Massage' },
      whatsapp: { message: 'Hi! I want to book a haircut slot.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Chair' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Barber Co. — Book Your Chair</title>
<meta name="description" content="Premium haircuts, beard styling and grooming for men. Book your chair today.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#f5b335;--accent2:#d6362b;--accent-ink:#111;--bg:#0b0b0b;--bg2:#141414;--ink:#f5f2ec;--mut:#9b958b;--line:rgba(255,255,255,.1)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Barlow',system-ui,sans-serif;line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3,.bebas{font-family:'Bebas Neue',Impact,sans-serif;font-weight:400;line-height:.95;letter-spacing:.02em;text-transform:uppercase}
em{font-style:normal;color:var(--accent)}
.wrap{width:min(1180px,100% - 40px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 34px;background:var(--accent);color:var(--accent-ink);font-family:'Bebas Neue';font-size:22px;letter-spacing:.08em;border:2px solid var(--accent);transition:.2s;cursor:pointer;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.btn:hover{background:#fff;border-color:#fff}
.btn.o{background:transparent;color:#fff;border-color:rgba(255,255,255,.4)}.btn.o:hover{background:var(--accent);color:#111;border-color:var(--accent)}
.pole{height:10px;background:repeating-linear-gradient(135deg,var(--accent2) 0 16px,#fff 16px 32px,#2b5bd7 32px 48px,#fff 48px 64px)}
header{position:sticky;top:0;z-index:40;background:rgba(11,11,11,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Bebas Neue';font-size:34px;letter-spacing:.06em}
.brand img{width:44px;height:44px;border-radius:8px;object-fit:cover}
.links{display:flex;gap:32px;font-weight:600;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#cfc9bf}.links a:hover{color:var(--accent)}
.nav .btn{padding:10px 26px;font-size:19px}
.hero{padding:70px 0 90px;position:relative;overflow:hidden}
.hero::before{content:"BARBER";position:absolute;left:-20px;top:20px;font-family:'Bebas Neue';font-size:clamp(160px,28vw,420px);color:rgba(255,255,255,.035);line-height:1;pointer-events:none}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center;position:relative}
.tag{display:inline-flex;gap:10px;align-items:center;color:var(--accent);font-weight:600;letter-spacing:.24em;font-size:13.5px;text-transform:uppercase}
.tag::before{content:"";width:40px;height:3px;background:var(--accent2)}
.hero h1{font-size:clamp(64px,10.4vw,150px);margin:18px 0 22px}
.hero h1 span{-webkit-text-stroke:2px #fff;color:transparent}
.hero p{font-size:19px;color:#c4beb3;max-width:490px;margin-bottom:34px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.hi{position:relative;max-width:460px;margin:0 auto}
.hi .a{aspect-ratio:4/5;overflow:hidden;border:3px solid var(--accent);clip-path:polygon(0 0,100% 0,100% 90%,88% 100%,0 100%)}
.hi .a img{width:100%;height:100%;object-fit:cover;filter:contrast(1.05)}
.hi .b{position:absolute;left:-26px;bottom:34px;background:var(--accent);color:#111;padding:14px 22px;font-family:'Bebas Neue';font-size:26px;line-height:1;transform:rotate(-3deg)}
.hi .b small{display:block;font-family:'Barlow';font-size:12.5px;font-weight:600;letter-spacing:.1em}
.mq{background:var(--accent);color:#111;padding:14px 0;overflow:hidden;white-space:nowrap}
.mq div{display:flex;gap:50px;justify-content:center;flex-wrap:wrap;font-family:'Bebas Neue';font-size:26px;letter-spacing:.06em}
.mq span::before{content:"✂";margin-right:18px}
.sec{padding:100px 0}
.head{margin-bottom:56px}.head.c{text-align:center;max-width:680px;margin-inline:auto;margin-bottom:56px}
.head h2{font-size:clamp(48px,7vw,92px);margin-top:12px}.head p{color:var(--mut);font-size:18px;margin-top:14px;max-width:560px}.head.c p{margin-inline:auto}
.board{display:grid;grid-template-columns:1fr 1fr;gap:0 70px;border:2px solid var(--line);padding:50px 56px;background:var(--bg2);position:relative}
.board::before,.board::after{content:"";position:absolute;width:26px;height:26px;border:3px solid var(--accent)}
.board::before{left:-2px;top:-2px;border-right:0;border-bottom:0}.board::after{right:-2px;bottom:-2px;border-left:0;border-top:0}
.pi{display:flex;align-items:baseline;gap:12px;padding:20px 0;border-bottom:1px dashed rgba(255,255,255,.16)}
.pi b{font-family:'Bebas Neue';font-size:30px;font-weight:400;letter-spacing:.04em}.pi small{display:block;color:var(--mut);font-size:14px;font-family:'Barlow'}
.pi .d{flex:1}.pi .pr{font-family:'Bebas Neue';font-size:38px;color:var(--accent)}
.baw{max-width:860px;margin:0 auto}
.ba{aspect-ratio:16/10;border:3px solid var(--accent)}
.ba .lbl{position:absolute;top:16px;z-index:2;background:var(--accent);color:#111;padding:4px 16px;font-family:'Bebas Neue';font-size:20px;letter-spacing:.08em}.ba .lbl.l{left:16px}.ba .lbl.r{right:16px}
.team{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.bc{background:var(--bg2);border:1px solid var(--line);overflow:hidden;transition:.3s}.bc:hover{border-color:var(--accent);transform:translateY(-8px)}
.bc .p{aspect-ratio:1/1.1;overflow:hidden}.bc .p img{width:100%;height:100%;object-fit:cover;filter:grayscale(.2);transition:.6s}.bc:hover .p img{filter:none;transform:scale(1.05)}
.bc .in{padding:22px 24px 26px}.bc h3{font-size:34px}.bc span{color:var(--accent);font-weight:600;font-size:13.5px;letter-spacing:.16em;text-transform:uppercase}.bc p{color:var(--mut);font-size:15px;margin-top:8px}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pl{border:2px solid var(--line);padding:40px 32px;position:relative;background:var(--bg2);transition:.3s}.pl:hover{border-color:var(--accent)}
.pl.hot{background:var(--accent);color:#111;border-color:var(--accent)}.pl.hot .pr,.pl.hot li::before{color:#111}.pl.hot .btn{background:#111;color:#fff;border-color:#111}
.pl h3{font-size:42px}.pl .pr{font-family:'Bebas Neue';font-size:76px;color:var(--accent);line-height:1;margin:14px 0 4px}.pl .pr small{font-size:22px;font-family:'Barlow';font-weight:600}
.pl ul{list-style:none;display:grid;gap:11px;margin:22px 0 30px;font-weight:500}.pl li::before{content:"✓";color:var(--accent);margin-right:12px;font-weight:700}
.pl .flag{position:absolute;right:24px;top:-14px;background:var(--accent2);color:#fff;font-family:'Bebas Neue';font-size:18px;padding:3px 14px;letter-spacing:.08em}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:230px;gap:12px}
.gal div{overflow:hidden}.gal div:nth-child(1){grid-column:span 2;grid-row:span 2}.gal img{width:100%;height:100%;object-fit:cover;filter:grayscale(.25);transition:.6s}.gal div:hover img{filter:none;transform:scale(1.08)}
.rev{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{border-left:4px solid var(--accent);background:var(--bg2);padding:32px 30px}
.rc .st{color:var(--accent);letter-spacing:4px;margin-bottom:12px}.rc p{font-size:17px;margin-bottom:20px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-family:'Bebas Neue';font-weight:400;font-size:21px;letter-spacing:.05em}.who small{color:var(--mut)}
.visit{display:grid;grid-template-columns:1fr 1.2fr;gap:0;border:2px solid var(--line)}
.vi{padding:54px 46px;background:var(--bg2)}.vi h2{font-size:clamp(46px,6vw,76px);margin:12px 0 28px}
.vi .r{margin-bottom:22px}.vi b{display:block;color:var(--accent);font-weight:600;letter-spacing:.2em;font-size:13px;text-transform:uppercase}.vi span{font-size:18px}
.map{min-height:420px;filter:grayscale(1) invert(.92) contrast(.9)}
.final{background:var(--accent);color:#111;text-align:center;padding:80px 0}
.final h2{font-size:clamp(50px,8vw,110px)}.final p{font-size:19px;margin:12px 0 30px;font-weight:500}.final .btn{background:#111;color:#fff;border-color:#111}.final .btn:hover{background:#fff;color:#111}
footer{padding:30px 0;color:var(--mut);font-size:14px}.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.visit,.board{grid-template-columns:1fr}.board{padding:30px 24px}.team,.plans,.rev{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:170px}.sec{padding:70px 0}.nav .btn{display:none}.hi .b{left:0}}
</style>
</head>
<body>
<div class="pole" data-section="Barber pole stripe" data-fixed></div>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#f5b335', '#d6362b', 'B')}" alt="Logo"><span data-e>Barber Co.</span></a>
    <nav class="links"><a href="#prices" data-e>Prices</a><a href="#team" data-e>Barbers</a><a href="#plans" data-e>Membership</a><a href="#visit" data-e>Visit</a></nav>
    <a class="btn" data-cta="enroll" data-e>Book Now</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap hg">
    <div>
      <span class="tag rv" data-e>Est. 2016 · Premium grooming</span>
      <h1 class="rv"><span data-e>Look sharp.</span><br><em data-e>Feel sharper.</em></h1>
      <p class="rv" data-e>Precision haircuts, classic hot-towel shaves and beard artistry by master barbers. Walk in good. Walk out unstoppable.</p>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book My Chair</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
    </div>
    <div class="hi rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.person('#2b2b2b', '#f5b335')}" alt=""></div><div class="b">4.9 ★ RATED<small data-e>1,800+ Google reviews</small></div></div>
  </div>
</section>
<div class="mq" data-section="Services marquee"><div data-list><span data-e>Haircut</span><span data-e>Beard Trim</span><span data-e>Hot-towel Shave</span><span data-e>Hair Colour</span><span data-e>Head Massage</span><span data-e>Facial</span></div></div>

<section class="sec" id="prices" data-section="Price board">
  <div class="wrap">
    <div class="head"><span class="tag" data-e>The menu</span><h2 data-e>Service <em>price board</em></h2></div>
    <div class="board rv" data-list>
      <div><div class="pi"><span class="d"><b data-e>Classic Haircut</b><small data-e>Wash, cut &amp; style</small></span><span class="pr" data-e>₹299</span></div>
      <div class="pi"><span class="d"><b data-e>Beard Trim &amp; Shape</b><small data-e>Precision line-up</small></span><span class="pr" data-e>₹199</span></div>
      <div class="pi"><span class="d"><b data-e>Haircut + Beard</b><small data-e>The complete combo</small></span><span class="pr" data-e>₹449</span></div></div>
      <div><div class="pi"><span class="d"><b data-e>Hot-towel Shave</b><small data-e>Traditional straight razor</small></span><span class="pr" data-e>₹249</span></div>
      <div class="pi"><span class="d"><b data-e>Hair Colour</b><small data-e>Ammonia-free, full head</small></span><span class="pr" data-e>₹799</span></div>
      <div class="pi"><span class="d"><b data-e>Head Massage</b><small data-e>20 minutes relaxation</small></span><span class="pr" data-e>₹149</span></div></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-section="Before & After">
  <div class="wrap">
    <div class="head c"><span class="tag" data-e>Transformations</span><h2 data-e>Before <em>&amp; after</em></h2></div>
    <div class="baw rv"><div class="ba" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#3a3a3a', '#1a1a1a', 1000, 625)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#f5b335', '#8a5a10', 1000, 625)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div>
  </div>
</section>

<section class="sec" id="team" style="background:var(--bg2)" data-section="Barbers">
  <div class="wrap">
    <div class="head"><span class="tag" data-e>The crew</span><h2 data-e>Meet your <em>barbers</em></h2></div>
    <div class="team" data-list>
      <div class="bc rv"><div class="p"><img data-img="b1" data-label="Barber 1" src="${P.person('#3a3a3a', '#f5b335')}" alt=""></div><div class="in"><h3 data-e>Vikram "Vik"</h3><span data-e>Master Barber · 12 yrs</span><p data-e>Fades, skin tapers and classic gentleman cuts.</p></div></div>
      <div class="bc rv"><div class="p"><img data-img="b2" data-label="Barber 2" src="${P.person('#1f2937', '#d6362b')}" alt=""></div><div class="in"><h3 data-e>Sameer</h3><span data-e>Beard Specialist · 8 yrs</span><p data-e>Beard sculpting and straight-razor shaves.</p></div></div>
      <div class="bc rv"><div class="p"><img data-img="b3" data-label="Barber 3" src="${P.person('#4b3b20', '#f5b335')}" alt=""></div><div class="in"><h3 data-e>Dev</h3><span data-e>Colour &amp; Style · 7 yrs</span><p data-e>Trendy colours, textures and modern styles.</p></div></div>
    </div>
  </div>
</section>

<section class="sec" id="plans" data-section="Membership">
  <div class="wrap">
    <div class="head c"><span class="tag" data-e>Save more</span><h2 data-e>Join the <em>club</em></h2><p data-e>Monthly memberships for the man who's always sharp.</p></div>
    <div class="plans" data-list>
      <div class="pl rv"><h3 data-e>Regular</h3><div class="pr"><span data-e>₹599</span><small data-e>/mo</small></div><ul data-list><li data-e>2 haircuts a month</li><li data-e>10% off other services</li><li data-e>Priority booking</li></ul><a class="btn o" data-cta="enroll" data-e>Join now</a></div>
      <div class="pl hot rv"><span class="flag" data-e>Best value</span><h3 data-e>Gentleman</h3><div class="pr"><span data-e>₹999</span><small data-e>/mo</small></div><ul data-list><li data-e>2 haircuts + 2 beard trims</li><li data-e>20% off other services</li><li data-e>Free head massage</li></ul><a class="btn" data-cta="enroll" data-e>Join now</a></div>
      <div class="pl rv"><h3 data-e>VIP</h3><div class="pr"><span data-e>₹1,799</span><small data-e>/mo</small></div><ul data-list><li data-e>Unlimited cuts &amp; shaves</li><li data-e>30% off other services</li><li data-e>Complimentary drinks</li></ul><a class="btn o" data-cta="enroll" data-e>Join now</a></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-section="Gallery">
  <div class="wrap">
    <div class="head"><span class="tag" data-e>Our work</span><h2 data-e>Fresh <em>cuts</em></h2></div>
    <div class="gal" data-list>
      <div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#3a3a3a', '#f5b335', 900, 900)}" alt=""></div>
      <div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#1f1f1f', '#d6362b', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#f5b335', '#2b2b2b', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#4a3a1a', '#111', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#d6362b', '#1a1a1a', 600, 600)}" alt=""></div>
    </div>
  </div>
</section>

<section class="sec" style="background:var(--bg2)" data-section="Reviews">
  <div class="wrap">
    <div class="head"><span class="tag" data-e>Straight talk</span><h2 data-e>What the <em>guys say</em></h2></div>
    <div class="rev" data-list>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Best fade in the city. Vik is a genius. I've stopped going anywhere else."</p><div class="who"><img data-img="u1" data-label="Client 1" src="${P.avatar('#f5b335', '#2b2b2b')}" alt=""><span><b data-e>Rahul M.</b><small data-e>Member since 2022</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Hot-towel shave was an experience. Clean shop, great music, zero waiting."</p><div class="who"><img data-img="u2" data-label="Client 2" src="${P.avatar('#d6362b', '#1a1a1a')}" alt=""><span><b data-e>Karan S.</b><small data-e>Regular</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Booked via WhatsApp in 30 seconds. Walked out looking 5 years younger."</p><div class="who"><img data-img="u3" data-label="Client 3" src="${P.avatar('#4b3b20', '#f5b335')}" alt=""><span><b data-e>Arjun P.</b><small data-e>First visit</small></span></div></div>
    </div>
  </div>
</section>

<section class="sec" id="visit" data-section="Visit us">
  <div class="wrap visit">
    <div class="vi"><span class="tag" data-e>Find us</span><h2 data-e>Drop <em>in</em></h2>
      <div class="r"><b data-e>Address</b><span data-e>45, High Street, Your City – 000000</span></div><div class="r"><b data-e>Hours</b><span data-e>Mon – Sun · 10:00 AM – 9:30 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div></div>
    <div class="map" data-map data-label="Shop location" data-q="Koramangala, Bengaluru"></div>
  </div>
</section>

<section class="final" data-section="Final call to action"><div class="wrap"><h2 class="rv" data-e>Your chair is waiting</h2><p class="rv" data-e>Walk-ins welcome. Book ahead to skip the queue.</p><a class="btn rv" data-cta="enroll" data-e>Book My Chair</a></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 Barber Co. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-e>Instagram</a></span></div></footer>
</body>
</html>`
  });
})();
