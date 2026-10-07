/* Real Estate 3 — PRIME: personal-brand property consultant / broker (charcoal + teal) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 're-prime',
    category: 'realestate',
    name: 'Prime Realty',
    tagline: 'Personal-brand property consultant',
    best: 'Real estate agent · Broker · Property consultant · Resale & rental',
    colors: [
      { v: '--accent', l: 'Teal', d: '#0e8f9c' },
      { v: '--accent2', l: 'Charcoal', d: '#1f2933' }
    ],
    defaults: {
      enroll: { title: 'Tell me what you need', sub: 'Share your requirement. I will send matching properties on WhatsApp within a few hours.', button: 'Get Matching Properties', thanks: 'Got it! I will contact you soon.', extraOn: true, extraLabel: 'I am looking to', extraOptions: 'Buy a home, Rent a home, Sell my property, Invest, Commercial space' },
      whatsapp: { message: 'Hi! I am looking for a property. Can you help?' },
      countdown: { on: false }, bar: { on: true, text: 'Enquire' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prime Realty — Property Consultant</title>
<meta name="description" content="Buy, sell or rent property with a trusted consultant. 500+ happy families.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#0e8f9c;--accent2:#1f2933;--accent-ink:#fff;--bg:#f4f7f8;--ink:#1f2933;--mut:#617078;--line:#dfe6e9}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Source Sans 3',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:17px}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Libre Baskerville',Georgia,serif;line-height:1.2;font-weight:700}
em{font-style:italic;color:var(--accent)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 30px;background:var(--accent);color:#fff;font-weight:600;font-size:16px;border-radius:6px;border:2px solid var(--accent);transition:.25s;cursor:pointer}
.btn:hover{background:var(--accent2);border-color:var(--accent2)}
.btn.o{background:transparent;color:var(--accent2);border-color:var(--accent2)}.btn.o:hover{background:var(--accent2);color:#fff}
.k{font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
header{position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Libre Baskerville';font-weight:700;font-size:22px}
.brand img{width:42px;height:42px;border-radius:8px;object-fit:cover}
.links{display:flex;gap:30px;font-size:15.5px;font-weight:600;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:10px 22px;font-size:15px}
.hero{background:var(--bg);padding:60px 0 0;overflow:hidden}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:end}
.hero h1{font-size:clamp(36px,5vw,62px);margin:14px 0 18px;color:var(--accent2)}
.hero p{color:var(--mut);font-size:19px;max-width:520px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:34px}
.pr{display:flex;gap:34px;flex-wrap:wrap;padding-bottom:50px}.pr b{font-family:'Libre Baskerville';font-size:34px;color:var(--accent);display:block;line-height:1.1}.pr span{font-size:14px;color:var(--mut)}
.hp{position:relative;max-width:460px;margin-left:auto;align-self:end}
.hp .a{aspect-ratio:4/5;background:linear-gradient(160deg,var(--accent),var(--accent2));border-radius:200px 200px 0 0;overflow:hidden}.hp .a img{width:100%;height:100%;object-fit:cover;object-position:top}
.hp .c{position:absolute;left:-30px;bottom:60px;background:#fff;padding:14px 20px;border-radius:12px;box-shadow:0 20px 40px -16px rgba(0,0,0,.35);font-weight:600;font-size:15px}.hp .c b{color:var(--accent)}
.tiles{background:var(--accent2);color:#fff}
.tg{display:grid;grid-template-columns:repeat(4,1fr)}.tg a{padding:28px 22px;text-align:center;border-right:1px solid rgba(255,255,255,.12);transition:.25s}.tg a:last-child{border:0}.tg a:hover{background:var(--accent)}
.tg i{font-style:normal;font-size:30px;display:block}.tg b{display:block;font-size:17px;margin-top:4px}.tg span{font-size:14px;color:#b9c4cb}
.sec{padding:96px 0}
.head{max-width:660px;margin:0 auto 50px;text-align:center}
.head h2{font-size:clamp(30px,4vw,44px);margin:12px 0 12px;color:var(--accent2)}.head p{color:var(--mut);font-size:18px}
.lg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.lc{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff;transition:.3s}.lc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -34px rgba(31,41,51,.5)}
.lc .p{aspect-ratio:4/3;position:relative}.lc .p img{width:100%;height:100%;object-fit:cover}
.lc .t{position:absolute;left:14px;top:14px;background:var(--accent);color:#fff;padding:4px 12px;border-radius:5px;font-size:13px;font-weight:700}
.lc .in{padding:20px 22px 22px}.lc .pr2{font-family:'Libre Baskerville';font-size:26px;color:var(--accent2)}.lc h3{font-size:18px;margin:4px 0 4px;font-family:'Source Sans 3';font-weight:600}.lc .ad{color:var(--mut);font-size:15px}
.lc .sp{display:flex;gap:16px;margin:14px 0;padding:12px 0;border-block:1px solid var(--line);font-size:14.5px;font-weight:600;flex-wrap:wrap}
.lc .btn{width:100%;padding:12px}
.sv{background:var(--bg)}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.sc{background:#fff;border-radius:10px;padding:30px 24px;border-top:4px solid var(--accent)}.sc i{font-style:normal;font-size:32px;display:block;margin-bottom:10px}.sc h3{font-size:19px;margin-bottom:8px}.sc p{color:var(--mut);font-size:15.5px}
.ab{display:grid;grid-template-columns:.85fr 1.15fr;gap:64px;align-items:center}
.ab .im{aspect-ratio:4/5;border-radius:10px;overflow:hidden;box-shadow:16px 16px 0 var(--accent)}.ab .im img{width:100%;height:100%;object-fit:cover}
.ab h2{font-size:clamp(30px,4vw,44px);margin:12px 0 18px;color:var(--accent2)}.ab p{color:var(--mut);margin-bottom:16px}
.cr{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.cr span{padding:8px 16px;border:1px solid var(--line);border-radius:99px;font-weight:600;font-size:14.5px;background:var(--bg)}
.ps{background:var(--accent2);color:#fff}.ps .head h2{color:#fff}.ps .head p{color:#b9c4cb}.ps .k{color:#6fd3dc}
.pg{display:grid;grid-template-columns:repeat(4,1fr);gap:26px}.pp{text-align:center}.pp i{display:grid;place-items:center;width:70px;height:70px;border-radius:50%;background:var(--accent);margin:0 auto 16px;font-family:'Libre Baskerville';font-style:normal;font-size:26px;font-weight:700}.pp h3{font-size:19px;margin-bottom:6px}.pp p{color:#b9c4cb;font-size:15.5px}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{border:1px solid var(--line);border-radius:10px;padding:30px;background:#fff}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:10px}.rc p{margin-bottom:18px;font-size:16.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:48px;height:48px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:16px}.who small{color:var(--mut)}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:50px;align-items:stretch}
.ci h2{font-size:clamp(30px,3.8vw,42px);margin:12px 0 22px;color:var(--accent2)}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}.ci span{font-size:18px}
.map{min-height:380px;border-radius:10px;border:1px solid var(--line)}
.final{background:var(--accent);color:#fff;text-align:center;padding:76px 0}.final h2{font-size:clamp(30px,4.4vw,52px);max-width:760px;margin:0 auto 14px}.final p{max-width:520px;margin:0 auto 28px;font-size:19px;opacity:.92}.final .btn{background:#fff;color:var(--accent);border-color:#fff}.final .btn:hover{background:var(--accent2);color:#fff;border-color:var(--accent2)}
footer{background:var(--accent2);color:#9aa8b0;padding:28px 0;font-size:14.5px}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.ab,.ct{grid-template-columns:1fr;gap:40px}.hp{margin:0 auto}.hp .c{left:0}.tg,.sg,.pg{grid-template-columns:1fr 1fr}.tg a:nth-child(2){border-right:0}.lg,.rg{grid-template-columns:1fr}.sec{padding:70px 0}.nav .btn{display:none}}
@media(max-width:560px){.sg,.pg{grid-template-columns:1fr}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#0e8f9c', '#1f2933', 'P')}" alt="Logo"><span data-e>Prime Realty</span></a>
  <nav class="links"><a href="#listings" data-e>Properties</a><a href="#services" data-e>Services</a><a href="#about" data-e>About me</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Enquire Now</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>Trusted property consultant</span><h1 class="rv" data-e>Find the right property, <em>without the stress</em></h1><p class="rv" data-e>Buying, selling or renting? I handle shortlisting, site visits, negotiation and paperwork so you get the best deal safely.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Get Matching Properties</a><a class="btn o" data-cta="whatsapp" data-e>💬 Chat on WhatsApp</a></div>
  <div class="pr rv" data-list><div><b data-e>500+</b><span data-e>Families settled</span></div><div><b data-e>₹250 Cr</b><span data-e>Deals closed</span></div><div><b data-e>12 yrs</b><span data-e>Experience</span></div></div></div>
  <div class="hp rv"><div class="a"><img data-img="agent" data-label="Your photo" src="${P.person('#1f2933', '#0e8f9c')}" alt="Agent"></div><div class="c">⭐ <b data-e>4.9</b> <span data-e>Google rating</span></div></div>
</div></section>
<section class="tiles" data-section="Quick categories"><div class="wrap tg" data-list><a data-cta="enroll"><i>🏠</i><b data-e>Buy a Home</b><span data-e>Apartments &amp; villas</span></a><a data-cta="enroll"><i>🔑</i><b data-e>Rent</b><span data-e>Verified rentals</span></a><a data-cta="enroll"><i>💼</i><b data-e>Commercial</b><span data-e>Shops &amp; offices</span></a><a data-cta="enroll"><i>📈</i><b data-e>Invest</b><span data-e>Plots &amp; high-yield</span></a></div></section>

<section class="sec" id="listings" data-section="Featured properties">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Featured properties</span><h2 data-e>Handpicked <em>listings</em></h2><p data-e>Verified properties with clear titles. Replace photos and prices with your own listings.</p></div>
  <div class="lg" data-list>
    <div class="lc rv"><div class="p"><img data-img="l1" data-label="Listing 1" src="${P.photo('#6fa8b0', '#1f2933', 800, 600)}" alt=""><span class="t" data-e>For Sale</span></div><div class="in"><div class="pr2" data-e>₹1.45 Cr</div><h3 data-e>3 BHK Apartment, Sector 21</h3><div class="ad" data-e>📍 Near Metro Station, Your City</div><div class="sp"><span data-e>🛏 3 Beds</span><span data-e>🛁 3 Baths</span><span data-e>📐 1,450 sq.ft</span></div><a class="btn" data-cta="enroll" data-e>Enquire</a></div></div>
    <div class="lc rv"><div class="p"><img data-img="l2" data-label="Listing 2" src="${P.photo('#d8a35a', '#7a4a14', 800, 600)}" alt=""><span class="t" data-e>For Rent</span></div><div class="in"><div class="pr2" data-e>₹42,000/mo</div><h3 data-e>2 BHK Furnished Flat</h3><div class="ad" data-e>📍 Business District, Your City</div><div class="sp"><span data-e>🛏 2 Beds</span><span data-e>🛁 2 Baths</span><span data-e>📐 1,100 sq.ft</span></div><a class="btn" data-cta="enroll" data-e>Enquire</a></div></div>
    <div class="lc rv"><div class="p"><img data-img="l3" data-label="Listing 3" src="${P.photo('#7fb08a', '#244a33', 800, 600)}" alt=""><span class="t" data-e>For Sale</span></div><div class="in"><div class="pr2" data-e>₹2.9 Cr</div><h3 data-e>4 BHK Independent Villa</h3><div class="ad" data-e>📍 Green Valley, Your City</div><div class="sp"><span data-e>🛏 4 Beds</span><span data-e>🛁 4 Baths</span><span data-e>📐 2,800 sq.ft</span></div><a class="btn" data-cta="enroll" data-e>Enquire</a></div></div>
  </div></div>
</section>

<section class="sec sv" id="services" data-section="Services">
  <div class="wrap"><div class="head rv"><span class="k" data-e>What I do</span><h2 data-e>End-to-end <em>property services</em></h2></div>
  <div class="sg" data-list><div class="sc rv"><i>🔍</i><h3 data-e>Property search</h3><p data-e>Shortlist only properties that match your budget and needs.</p></div><div class="sc rv"><i>📑</i><h3 data-e>Legal &amp; paperwork</h3><p data-e>Title checks, agreement and registration handled end to end.</p></div><div class="sc rv"><i>🤝</i><h3 data-e>Negotiation</h3><p data-e>Strong local knowledge to get you the best possible price.</p></div><div class="sc rv"><i>🏦</i><h3 data-e>Home loan help</h3><p data-e>Tie-ups with leading banks for quick approvals.</p></div></div></div>
</section>

<section class="sec" id="about" data-section="About me">
  <div class="wrap ab"><div class="im rv"><img data-img="about" data-label="About photo" src="${P.person('#0e8f9c', '#1f2933')}" alt=""></div>
  <div class="rv"><span class="k" data-e>About me</span><h2 data-e>Hi, I'm <em>Rohit Malhotra</em></h2><p data-e>For 12 years I've helped families find homes and investors find the right deals. I believe in honest advice, zero hidden charges and treating your money as carefully as my own.</p><p data-e>RERA-registered agent, deep local knowledge of 25+ neighbourhoods.</p><div class="cr" data-list><span data-e>RERA Registered</span><span data-e>No hidden brokerage</span><span data-e>Verified listings only</span></div></div></div>
</section>

<section class="sec ps" data-section="How it works">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Simple process</span><h2 data-e>From enquiry to <em style="color:#6fd3dc">keys</em></h2></div>
  <div class="pg" data-list><div class="pp rv"><i>1</i><h3 data-e>Tell me your needs</h3><p data-e>Budget, location, type — a 5-minute chat.</p></div><div class="pp rv"><i>2</i><h3 data-e>Get shortlist</h3><p data-e>3–5 verified properties on WhatsApp.</p></div><div class="pp rv"><i>3</i><h3 data-e>Visit &amp; negotiate</h3><p data-e>Free site visits and best-price negotiation.</p></div><div class="pp rv"><i>4</i><h3 data-e>Close the deal</h3><p data-e>Paperwork, loan and registration done.</p></div></div></div>
</section>

<section class="sec" data-section="Client reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Client stories</span><h2 data-e>What my clients <em>say</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Rohit found us our dream flat in just 2 weeks and negotiated ₹6 lakh off. Honest and very professional."</p><div class="who"><img data-img="u1" data-label="Client 1" src="${P.avatar('#0e8f9c', '#1f2933')}" alt=""><span><b data-e>Vivek &amp; Neha Singh</b><small data-e>Bought a 3 BHK</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Sold my old flat at a great price and he handled every document. Stress-free experience."</p><div class="who"><img data-img="u2" data-label="Client 2" src="${P.avatar('#d8a35a', '#7a4a14')}" alt=""><span><b data-e>Meera Pillai</b><small data-e>Sold a property</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"As an NRI I trusted him fully. Regular video updates and smooth rental management."</p><div class="who"><img data-img="u3" data-label="Client 3" src="${P.avatar('#7fb08a', '#244a33')}" alt=""><span><b data-e>Sanjay Gupta</b><small data-e>NRI investor</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="contact" style="padding-top:0" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Get in touch</span><h2 data-e>Let's find your <em>next address</em></h2><div class="r"><b data-e>Office</b><span data-e>Prime Realty, 2nd Floor, City Centre, Your City</span></div><div class="r"><b data-e>Hours</b><span data-e>Mon – Sat · 10:00 AM – 7:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Get Matching Properties</a></div>
  <div class="map rv" data-map data-label="Office location" data-q="Salt Lake, Kolkata"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><h2 class="rv" data-e>Ready to make your move?</h2><p class="rv" data-e>Tell me what you need. I'll send you the best matches on WhatsApp today.</p><a class="btn rv" data-cta="enroll" data-e>Enquire Now →</a></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Prime Realty. RERA No. XXXXXXXX.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
