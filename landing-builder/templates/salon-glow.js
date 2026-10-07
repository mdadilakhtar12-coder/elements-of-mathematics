/* Salon 1 — GLOW: luxury dark salon with rose-gold accents */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'salon-glow',
    category: 'salon',
    name: 'Glow',
    tagline: 'Luxury dark & rose-gold salon',
    best: 'Premium hair salon · Unisex salon · Beauty studio',
    colors: [
      { v: '--accent', l: 'Rose-gold', d: '#d4a285' },
      { v: '--accent2', l: 'Soft highlight', d: '#f3d9c8' }
    ],
    defaults: {
      enroll: { title: 'Book your appointment', sub: 'Share your details and our team will confirm your slot on WhatsApp.', button: 'Request Appointment', thanks: 'Request received!', extraOn: true, extraLabel: 'Service', extraOptions: 'Haircut & Styling, Hair Colour, Keratin / Smoothening, Facial & Cleanup, Bridal Makeup, Manicure & Pedicure' },
      whatsapp: { message: 'Hi! I would like to book an appointment.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Now' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Glow Salon — Book Your Appointment</title>
<meta name="description" content="Luxury hair, skin and bridal services by expert stylists. Book your appointment today.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#d4a285;--accent2:#f3d9c8;--accent-ink:#1a1210;--bg:#0d0b0c;--bg2:#151213;--ink:#f6efe9;--mut:#a89d96;--line:rgba(255,255,255,.1)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Jost',system-ui,sans-serif;line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3,.serif{font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;line-height:1.08;letter-spacing:-.01em}
em{font-style:italic;color:var(--accent)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 34px;border:1px solid var(--accent);background:var(--accent);color:var(--accent-ink);font-weight:500;font-size:14px;letter-spacing:.14em;text-transform:uppercase;transition:.3s;cursor:pointer}
.btn:hover{background:transparent;color:var(--accent)}
.btn.o{background:transparent;color:var(--ink);border-color:rgba(255,255,255,.35)}.btn.o:hover{border-color:var(--accent);color:var(--accent)}
.k{font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);font-weight:500}
header{position:absolute;top:0;left:0;right:0;z-index:20}
.nav{display:flex;align-items:center;justify-content:space-between;height:92px;gap:20px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Cormorant Garamond';font-size:30px;font-weight:600;letter-spacing:.04em}
.brand img{width:42px;height:42px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:34px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#d8cfc8}.links a:hover{color:var(--accent)}
.nav .btn{padding:12px 24px;font-size:12px}
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding:140px 0 90px}
.hero .bg{position:absolute;inset:0}.hero .bg img{width:100%;height:100%;object-fit:cover}
.hero .bg::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(13,11,12,.92) 8%,rgba(13,11,12,.55) 55%,rgba(13,11,12,.25));}
.hero .in{position:relative;max-width:690px}
.hero h1{font-size:clamp(50px,8vw,104px);margin:18px 0 22px}
.hero p{font-size:19px;color:#d3c8c1;max-width:520px;margin-bottom:36px;font-weight:400}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.rate{display:flex;gap:30px;margin-top:54px;flex-wrap:wrap}
.rate div b{font-family:'Cormorant Garamond';font-size:38px;color:var(--accent);display:block;line-height:1}.rate div span{font-size:13px;color:var(--mut);letter-spacing:.06em}
.strip{border-block:1px solid var(--line);padding:22px 0;background:var(--bg2)}
.strip .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-family:'Cormorant Garamond';font-size:23px;font-style:italic;color:#d8cfc8}
.strip span::before{content:"✦";color:var(--accent);font-style:normal;margin-right:12px;font-size:14px}
.sec{padding:110px 0}
.head{text-align:center;max-width:680px;margin:0 auto 62px}
.head h2{font-size:clamp(38px,5vw,64px);margin:14px 0 14px}.head p{color:var(--mut);font-size:17.5px}
.about{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.about .imgs{position:relative;padding-bottom:70px}
.about .a1{width:78%;aspect-ratio:3/4;overflow:hidden;border-radius:200px 200px 0 0}.about .a1 img,.about .a2 img{width:100%;height:100%;object-fit:cover}
.about .a2{position:absolute;right:0;bottom:0;width:50%;aspect-ratio:1/1;border:10px solid var(--bg);overflow:hidden}
.about h2{font-size:clamp(38px,4.6vw,60px);margin:14px 0 22px}.about p{color:var(--mut);font-size:17.5px;margin-bottom:18px}
.sig{display:flex;gap:40px;margin-top:30px}.sig div b{font-family:'Cormorant Garamond';font-size:46px;color:var(--accent);display:block;line-height:1}.sig span{font-size:13.5px;color:var(--mut)}
.menu{background:var(--bg2)}
.mg{display:grid;grid-template-columns:1fr 1fr;gap:20px 80px}
.mi h3{font-size:27px;color:var(--accent2);margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.row{display:flex;align-items:baseline;gap:10px;margin-bottom:18px}
.row b{font-weight:500;font-size:17px}.row small{display:block;color:var(--mut);font-size:13.5px;font-weight:400}
.row .dot{flex:1;border-bottom:1px dotted rgba(255,255,255,.25);transform:translateY(-4px);min-width:20px}
.row .pr{font-family:'Cormorant Garamond';font-size:25px;color:var(--accent);font-weight:600}
.baw{max-width:900px;margin:0 auto}
.ba{aspect-ratio:16/10;border-radius:4px;border:1px solid var(--line)}
.ba .lbl{position:absolute;top:18px;z-index:2;background:rgba(13,11,12,.75);padding:6px 16px;font-size:12px;letter-spacing:.2em;text-transform:uppercase}.ba .lbl.l{left:18px}.ba .lbl.r{right:18px}
.packs{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.pk{border:1px solid var(--line);padding:42px 34px;text-align:center;background:var(--bg2);transition:.3s;position:relative}
.pk:hover{border-color:var(--accent);transform:translateY(-8px)}
.pk.hot{border-color:var(--accent);background:linear-gradient(180deg,rgba(212,162,133,.12),var(--bg2))}
.pk .tag{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent);color:var(--accent-ink);font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;padding:5px 16px;font-weight:600}
.pk h3{font-size:32px;margin-bottom:6px}.pk .pr{font-family:'Cormorant Garamond';font-size:52px;color:var(--accent);margin:12px 0}
.pk ul{list-style:none;margin:16px 0 28px;color:#cfc5be;display:grid;gap:9px;font-size:15.5px}
.gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:240px;gap:14px}
.gal div{overflow:hidden;position:relative}.gal div:nth-child(1){grid-row:span 2}.gal div:nth-child(4){grid-column:span 2}
.gal img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.gal div:hover img{transform:scale(1.08)}
.team{display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
.tm{text-align:center}.tm .p{aspect-ratio:4/5;overflow:hidden;margin-bottom:20px;border:1px solid var(--line)}.tm .p img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.tm:hover .p img{transform:scale(1.05)}
.tm h3{font-size:30px}.tm span{color:var(--accent);font-size:13px;letter-spacing:.2em;text-transform:uppercase}
.rev{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.rc{border:1px solid var(--line);padding:38px 32px;background:var(--bg2)}
.rc .st{color:var(--accent);letter-spacing:4px;margin-bottom:16px}.rc p{font-family:'Cormorant Garamond';font-size:23px;line-height:1.4;font-style:italic;margin-bottom:24px}
.who{display:flex;gap:14px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-weight:500}.who small{color:var(--mut)}
.offer{padding:20px 0 110px}
.offer .box{border:1px solid var(--accent);padding:70px 30px;text-align:center;background:radial-gradient(600px 300px at 50% 0%,rgba(212,162,133,.18),transparent 70%)}
.offer h2{font-size:clamp(36px,5vw,64px);margin:14px 0}.offer p{color:var(--mut);max-width:520px;margin:0 auto 30px;font-size:17.5px}
.visit{display:grid;grid-template-columns:1fr 1.2fr;gap:56px;align-items:stretch}
.visit .info h2{font-size:clamp(36px,4.4vw,56px);margin:14px 0 26px}
.vi{display:grid;gap:22px}.vi div b{display:block;font-weight:500;color:var(--accent2);font-size:13px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:4px}.vi div span{color:#cfc5be}
.map{min-height:380px;border:1px solid var(--line);filter:grayscale(.4) contrast(1.05)}
footer{border-top:1px solid var(--line);padding:34px 0;color:var(--mut);font-size:14px}.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.about,.visit,.mg{grid-template-columns:1fr;gap:44px}.packs,.team,.rev{grid-template-columns:1fr}.gal{grid-template-columns:1fr 1fr;grid-auto-rows:170px}.hero .bg::after{background:rgba(13,11,12,.72)}.sec{padding:80px 0}.nav .btn{display:none}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#d4a285', '#8a5a44', 'G')}" alt="Logo"><span data-e>Glow Salon</span></a>
    <nav class="links"><a href="#about" data-e>About</a><a href="#menu" data-e>Services</a><a href="#packages" data-e>Packages</a><a href="#team" data-e>Team</a><a href="#visit" data-e>Visit</a></nav>
    <a class="btn" data-cta="enroll" data-e>Book Now</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="bg"><img data-img="hero" data-label="Hero background" src="${P.bg('#4a3029', '#0d0b0c', 1600, 1000)}" alt=""></div>
  <div class="wrap"><div class="in">
    <span class="k rv" data-e>Hair · Skin · Bridal</span>
    <h1 class="rv" data-e>Where beauty becomes <em>art</em></h1>
    <p class="rv" data-e>Step into a world of calm luxury. Our award-winning stylists craft looks that make you feel unmistakably you — only better.</p>
    <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Appointment</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp Us</a></div>
    <div class="rate rv" data-list><div><b data-e>4.9★</b><span data-e>2,400+ Google reviews</span></div><div><b data-e>12+</b><span data-e>Years of artistry</span></div><div><b data-e>18k</b><span data-e>Happy clients</span></div></div>
  </div></div>
</section>
<section class="strip" data-section="Services strip"><div class="wrap" data-list><span data-e>Hair Styling</span><span data-e>Colour</span><span data-e>Skin &amp; Facials</span><span data-e>Bridal</span><span data-e>Nails</span><span data-e>Spa</span></div></section>

<section class="sec" id="about" data-section="About">
  <div class="wrap about">
    <div class="imgs rv"><div class="a1"><img data-img="about1" data-label="About photo 1" src="${P.photo('#6b4637', '#241816', 700, 930)}" alt=""></div><div class="a2"><img data-img="about2" data-label="About photo 2" src="${P.photo('#d4a285', '#6b4637', 500, 500)}" alt=""></div></div>
    <div class="rv"><span class="k" data-e>Our story</span><h2 data-e>A sanctuary for <em>modern beauty</em></h2><p data-e>Since 2012 Glow has been the city's most loved destination for hair, skin and bridal artistry. We combine international techniques with premium, skin-safe products.</p><p data-e>Every visit begins with a personal consultation, because great results start with listening.</p><div class="sig" data-list><div><b data-e>12+</b><span data-e>Expert stylists</span></div><div><b data-e>100%</b><span data-e>Premium products</span></div></div></div>
  </div>
</section>

<section class="sec menu" id="menu" data-section="Services & prices">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Our menu</span><h2 data-e>Services &amp; <em>pricing</em></h2><p data-e>Transparent prices. Final price may vary with hair length &amp; product.</p></div>
    <div class="mg" data-list>
      <div class="mi rv"><h3 data-e>Hair</h3>
        <div class="row"><span><b data-e>Haircut &amp; Styling</b><small data-e>Consultation, wash, cut &amp; blow-dry</small></span><span class="dot"></span><span class="pr" data-e>₹799</span></div>
        <div class="row"><span><b data-e>Global Hair Colour</b><small data-e>Ammonia-free premium colour</small></span><span class="dot"></span><span class="pr" data-e>₹3,499</span></div>
        <div class="row"><span><b data-e>Balayage / Highlights</b><small data-e>Hand-painted, tone &amp; gloss</small></span><span class="dot"></span><span class="pr" data-e>₹5,999</span></div>
        <div class="row"><span><b data-e>Keratin Smoothening</b><small data-e>Frizz-free for up to 5 months</small></span><span class="dot"></span><span class="pr" data-e>₹6,499</span></div></div>
      <div class="mi rv"><h3 data-e>Skin &amp; Beauty</h3>
        <div class="row"><span><b data-e>Signature Facial</b><small data-e>Deep cleanse, massage &amp; mask</small></span><span class="dot"></span><span class="pr" data-e>₹1,799</span></div>
        <div class="row"><span><b data-e>De-tan Cleanup</b><small data-e>Instant glow and brightening</small></span><span class="dot"></span><span class="pr" data-e>₹999</span></div>
        <div class="row"><span><b data-e>Manicure &amp; Pedicure</b><small data-e>Spa treatment with gel polish</small></span><span class="dot"></span><span class="pr" data-e>₹1,499</span></div>
        <div class="row"><span><b data-e>Party Makeup</b><small data-e>Long-lasting HD finish</small></span><span class="dot"></span><span class="pr" data-e>₹3,999</span></div></div>
    </div>
  </div>
</section>

<section class="sec" data-section="Before & After">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Transformations</span><h2 data-e>See the <em>difference</em></h2><p data-e>Drag the slider to compare. Replace both photos with your real client work.</p></div>
    <div class="baw rv"><div class="ba" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#4a4040', '#231d1d', 1000, 625)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#d4a285', '#7a4a37', 1000, 625)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div>
  </div>
</section>

<section class="sec menu" id="packages" data-section="Packages">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Signature packages</span><h2 data-e>Indulge in <em>complete care</em></h2></div>
    <div class="packs" data-list>
      <div class="pk rv"><h3 data-e>Glow Essentials</h3><span data-e>Perfect for a quick refresh</span><div class="pr" data-e>₹2,499</div><ul data-list><li data-e>Haircut &amp; blow-dry</li><li data-e>De-tan cleanup</li><li data-e>Head massage</li></ul><a class="btn o" data-cta="enroll" data-e>Book this</a></div>
      <div class="pk hot rv"><span class="tag" data-e>Most loved</span><h3 data-e>Radiance Ritual</h3><span data-e>Our signature experience</span><div class="pr" data-e>₹4,999</div><ul data-list><li data-e>Signature facial</li><li data-e>Hair spa &amp; styling</li><li data-e>Manicure &amp; pedicure</li><li data-e>Complimentary refreshments</li></ul><a class="btn" data-cta="enroll" data-e>Book this</a></div>
      <div class="pk rv"><h3 data-e>Bridal Bliss</h3><span data-e>Look flawless on your day</span><div class="pr" data-e>₹24,999</div><ul data-list><li data-e>Bridal HD makeup</li><li data-e>Hair styling</li><li data-e>Pre-bridal facial</li><li data-e>Trial session included</li></ul><a class="btn o" data-cta="enroll" data-e>Book this</a></div>
    </div>
  </div>
</section>

<section class="sec" data-section="Gallery">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Our work</span><h2 data-e>The <em>gallery</em></h2></div>
    <div class="gal" data-list>
      <div class="rv"><img data-img="g1" data-label="Gallery 1" src="${P.photo('#6b4637', '#241816', 600, 900)}" alt=""></div>
      <div class="rv"><img data-img="g2" data-label="Gallery 2" src="${P.photo('#d4a285', '#5c3a2d', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g3" data-label="Gallery 3" src="${P.photo('#3a2620', '#d4a285', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g4" data-label="Gallery 4" src="${P.photo('#8a5a44', '#1a1210', 1000, 500)}" alt=""></div>
      <div class="rv"><img data-img="g5" data-label="Gallery 5" src="${P.photo('#c48f72', '#3a2620', 600, 600)}" alt=""></div>
      <div class="rv"><img data-img="g6" data-label="Gallery 6" src="${P.photo('#241816', '#d4a285', 600, 600)}" alt=""></div>
    </div>
  </div>
</section>

<section class="sec menu" id="team" data-section="Stylists">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>The artists</span><h2 data-e>Meet our <em>stylists</em></h2></div>
    <div class="team" data-list>
      <div class="tm rv"><div class="p"><img data-img="s1" data-label="Stylist 1" src="${P.person('#6b4637', '#241816')}" alt=""></div><h3 data-e>Riya Kapoor</h3><span data-e>Creative Director</span></div>
      <div class="tm rv"><div class="p"><img data-img="s2" data-label="Stylist 2" src="${P.person('#d4a285', '#5c3a2d')}" alt=""></div><h3 data-e>Aman Verma</h3><span data-e>Senior Colourist</span></div>
      <div class="tm rv"><div class="p"><img data-img="s3" data-label="Stylist 3" src="${P.person('#8a5a44', '#1a1210')}" alt=""></div><h3 data-e>Meera Shah</h3><span data-e>Makeup Artist</span></div>
    </div>
  </div>
</section>

<section class="sec" data-section="Client reviews">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Kind words</span><h2 data-e>Loved by <em>our guests</em></h2></div>
    <div class="rev" data-list>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"The best colour I've ever had. Riya understood exactly what I wanted and the salon feels like a spa."</p><div class="who"><img data-img="u1" data-label="Client 1" src="${P.avatar('#d4a285', '#6b4637')}" alt=""><span><b data-e>Ishita Malhotra</b><small data-e>Balayage client</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My bridal makeup was flawless for 14 hours. Everyone kept asking who did it!"</p><div class="who"><img data-img="u2" data-label="Client 2" src="${P.avatar('#f3d9c8', '#8a5a44')}" alt=""><span><b data-e>Sneha Iyer</b><small data-e>Bride, March 2025</small></span></div></div>
      <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Hygienic, professional and relaxing. The keratin treatment changed my hair completely."</p><div class="who"><img data-img="u3" data-label="Client 3" src="${P.avatar('#c48f72', '#3a2620')}" alt=""><span><b data-e>Pooja Reddy</b><small data-e>Regular client</small></span></div></div>
    </div>
  </div>
</section>

<section class="offer" data-section="Offer">
  <div class="wrap"><div class="box rv"><span class="k" data-e>New client offer</span><h2 data-e>Get <em>20% off</em> your first visit</h2><p data-e>Book this week and enjoy a complimentary head massage with any service.</p><a class="btn" data-cta="enroll" data-e>Claim My Offer</a></div></div>
</section>

<section class="sec" id="visit" style="padding-top:0" data-section="Visit us">
  <div class="wrap visit">
    <div class="info rv"><span class="k" data-e>Visit us</span><h2 data-e>We'd love to <em>see you</em></h2>
      <div class="vi" data-list><div><b data-e>Address</b><span data-e>123, Main Street, Your City – 000000</span></div><div><b data-e>Hours</b><span data-e>Mon – Sun · 10:00 AM – 8:30 PM</span></div><div><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div></div></div>
    <div class="map rv" data-map data-label="Salon location" data-q="Connaught Place, New Delhi"></div>
  </div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 Glow Salon. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-e>Instagram</a></span></div></footer>
</body>
</html>`
  });
})();
