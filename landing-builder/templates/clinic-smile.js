/* Clinic 1 — SMILE: friendly modern dental clinic (teal + white) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'clinic-smile',
    category: 'clinic',
    name: 'Smile',
    tagline: 'Friendly, modern dental clinic',
    best: 'Dental clinic · Orthodontics · Implants · Smile design',
    colors: [
      { v: '--accent', l: 'Teal', d: '#0fa3a3' },
      { v: '--accent2', l: 'Deep navy', d: '#0b2e45' }
    ],
    defaults: {
      enroll: { title: 'Book your appointment', sub: 'Tell us what you need. Our team will confirm your slot on WhatsApp.', button: 'Book Appointment', thanks: 'Appointment requested!', extraOn: true, extraLabel: 'Treatment', extraOptions: 'Check-up & Cleaning, Teeth Whitening, Braces / Aligners, Dental Implants, Root Canal, Smile Makeover' },
      whatsapp: { message: 'Hi! I would like to book a dental appointment.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Now' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Smile Dental Clinic — Book Appointment</title>
<meta name="description" content="Painless, modern dentistry for the whole family. Book your appointment today.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--accent:#0fa3a3;--accent2:#0b2e45;--accent-ink:#fff;--bg:#f2fafa;--ink:#0b2e45;--mut:#5a7584;--line:#d9ebec}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Outfit',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:17px}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-weight:700;letter-spacing:-.025em;line-height:1.1}
em{font-style:normal;color:var(--accent)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:var(--accent);color:#fff;font-weight:600;font-size:16px;border-radius:99px;border:2px solid var(--accent);transition:.25s;cursor:pointer;box-shadow:0 14px 30px -14px var(--accent)}
.btn:hover{transform:translateY(-3px)}
.btn.o{background:#fff;color:var(--accent);box-shadow:none}.btn.o:hover{background:var(--accent);color:#fff}
.k{display:inline-block;background:#dff4f4;color:var(--accent);font-weight:600;font-size:14px;padding:6px 16px;border-radius:99px}
.top{background:var(--accent2);color:#cfe3ee;font-size:14px;padding:8px 0}.top .wrap{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.top b{color:#fff}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:24px;letter-spacing:-.03em}
.brand img{width:42px;height:42px;border-radius:12px;object-fit:cover}
.links{display:flex;gap:30px;font-weight:500;font-size:15.5px;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:15px;box-shadow:none}
.hero{background:linear-gradient(180deg,var(--bg),#fff);padding:60px 0 70px;overflow:hidden}
.hg{display:grid;grid-template-columns:1.05fr .95fr;gap:50px;align-items:center}
.hero h1{font-size:clamp(40px,5.8vw,74px);margin:18px 0 18px}
.hero p{font-size:19px;color:var(--mut);max-width:500px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:30px}
.tr{display:flex;gap:24px;flex-wrap:wrap;font-size:15px;font-weight:500;color:var(--mut)}.tr span::before{content:"✓";color:var(--accent);margin-right:8px;font-weight:800}
.hv{position:relative;max-width:500px;margin:0 auto}.hv .a{aspect-ratio:1/1.05;border-radius:42% 58% 50% 50% / 40% 40% 60% 60%;overflow:hidden;background:var(--accent)}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;background:#fff;border-radius:16px;padding:12px 18px;box-shadow:0 20px 40px -16px rgba(11,46,69,.4);display:flex;gap:10px;align-items:center;font-weight:600;font-size:14.5px}.hv .c.a{left:-24px;top:50px}.hv .c.b{right:-10px;bottom:50px}
.nm{background:var(--accent2);color:#fff}.ng{display:grid;grid-template-columns:repeat(4,1fr)}.ng div{padding:30px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.12)}.ng div:last-child{border:0}.ng b{font-size:38px;color:#5fe0e0;display:block;line-height:1.1}.ng span{font-size:14px;color:#b6cbd9}
.sec{padding:96px 0}
.head{max-width:640px;margin:0 auto 50px;text-align:center}.head h2{font-size:clamp(32px,4.4vw,52px);margin:14px 0 12px}.head p{color:var(--mut);font-size:18px}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.tc{border:1.5px solid var(--line);border-radius:24px;padding:32px 28px;transition:.3s;background:#fff}.tc:hover{border-color:var(--accent);transform:translateY(-8px);box-shadow:0 30px 50px -32px rgba(15,163,163,.6)}
.tc i{font-style:normal;width:62px;height:62px;border-radius:18px;background:#dff4f4;display:grid;place-items:center;font-size:30px;margin-bottom:18px}.tc h3{font-size:23px;margin-bottom:8px}.tc p{color:var(--mut);font-size:15.5px;margin-bottom:14px}.tc .f{color:var(--accent);font-weight:700;font-size:15px}
.ba{background:var(--bg)}
.bg2{display:grid;grid-template-columns:1fr 1.1fr;gap:60px;align-items:center}
.bg2 h2{font-size:clamp(32px,4.2vw,50px);margin:14px 0 18px}.bg2 p{color:var(--mut);margin-bottom:18px}
.bx{aspect-ratio:4/3;border-radius:28px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(11,46,69,.5)}
.bx .lbl{position:absolute;top:14px;z-index:2;background:#fff;color:var(--accent);padding:5px 15px;border-radius:99px;font-size:13px;font-weight:700}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px}
.dr{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.dc{text-align:center;border:1.5px solid var(--line);border-radius:26px;overflow:hidden;background:#fff}.dc .p{aspect-ratio:1/1;background:linear-gradient(160deg,var(--accent),var(--accent2))}.dc .p img{width:100%;height:100%;object-fit:cover}.dc .in{padding:22px 20px 26px}.dc h3{font-size:23px}.dc .q{color:var(--accent);font-weight:600;font-size:15px}.dc p{color:var(--mut);font-size:15px;margin-top:6px}
.wh{background:var(--accent2);color:#fff}.wh .head h2{color:#fff}.wh .head p{color:#b6cbd9}.wh .k{background:rgba(255,255,255,.12);color:#5fe0e0}
.wg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.wc{border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:28px 22px}.wc i{font-style:normal;font-size:32px;display:block;margin-bottom:10px}.wc h3{font-size:19px;margin-bottom:6px}.wc p{color:#b6cbd9;font-size:14.5px}
.vd{max-width:900px;margin:0 auto;border-radius:28px;overflow:hidden;border:8px solid var(--bg);box-shadow:0 40px 80px -36px rgba(11,46,69,.5)}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{border:1.5px solid var(--line);border-radius:26px;padding:36px 30px;text-align:center;position:relative;background:#fff}.pc.h{border-color:var(--accent);box-shadow:0 30px 60px -36px var(--accent)}
.pc .fl{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:3px 16px;border-radius:99px;font-size:12.5px;font-weight:700}
.pc h3{font-size:25px}.pc .pr{font-size:44px;font-weight:800;color:var(--accent);margin:10px 0}.pc ul{list-style:none;display:grid;gap:9px;margin:16px 0 24px;color:var(--mut);font-size:15.5px}.pc li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.rc{background:var(--bg);border-radius:24px;padding:30px}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.rc p{margin-bottom:18px;font-size:16.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15.5px}.who small{color:var(--mut)}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}.acc{border:1.5px solid var(--line);border-radius:18px}.acc-h{display:flex;justify-content:space-between;gap:14px;padding:19px 24px;font-weight:600;font-size:17.5px;cursor:pointer}.acc-h::after{content:"+";color:var(--accent);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}
.ci{background:var(--accent);color:#fff;border-radius:30px;padding:46px 40px}.ci h2{font-size:clamp(30px,3.6vw,44px);margin:14px 0 22px}.ci .k{background:rgba(255,255,255,.18);color:#fff}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#bff3f3}.ci span{font-size:18px}
.map{min-height:400px;border-radius:30px;border:1.5px solid var(--line)}
.final{padding:0 0 96px}.final .box{background:var(--accent2);color:#fff;border-radius:36px;padding:76px 30px;text-align:center}.final h2{font-size:clamp(32px,5vw,60px);max-width:760px;margin:0 auto 14px}.final p{color:#b6cbd9;max-width:520px;margin:0 auto 28px;font-size:18px}
footer{padding:30px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.bg2,.ct{grid-template-columns:1fr;gap:40px}.hv .c.a{left:0}.hv .c.b{right:0}.ng{grid-template-columns:1fr 1fr}.ng div:nth-child(2){border-right:0}.tg,.dr,.pk,.rg{grid-template-columns:1fr}.wg{grid-template-columns:1fr 1fr}.sec{padding:70px 0}.nav .btn{display:none}.top .wrap span:last-child{display:none}}
</style>
</head>
<body>
<div class="top" data-section="Top strip" data-fixed><div class="wrap"><span data-e>🦷 <b>New patients welcome</b> · Free first consultation</span><span><a data-cta="call" data-e>📞 +91 98765 43210</a></span></div></div>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#0fa3a3', '#0b2e45', 'S')}" alt="Logo"><span data-e>Smile Dental</span></a>
  <nav class="links"><a href="#treatments" data-e>Treatments</a><a href="#results" data-e>Results</a><a href="#doctors" data-e>Doctors</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Now</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>Painless · Modern · Family dentistry</span><h1 class="rv" data-e>Healthy teeth. A smile you'll <em>love</em>.</h1><p class="rv" data-e>Gentle, advanced dental care for every age. From routine check-ups to complete smile makeovers, all under one roof.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Appointment</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp Us</a></div>
  <div class="tr rv" data-list><span data-e>Painless treatments</span><span data-e>Sterilised tools</span><span data-e>EMI available</span></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.person('#5fe0e0', '#0b2e45')}" alt=""></div><div class="c a">😁 <span data-e>15,000+ smiles</span></div><div class="c b">⭐ <span data-e>4.9 Google rating</span></div></div>
</div></section>
<section class="nm" data-section="Trust numbers"><div class="wrap ng" data-list><div><b data-e>15,000+</b><span data-e>Happy patients</span></div><div><b data-e>12 yrs</b><span data-e>Experience</span></div><div><b data-e>5,000+</b><span data-e>Implants &amp; braces</span></div><div><b data-e>4.9★</b><span data-e>Patient rating</span></div></div></section>

<section class="sec" id="treatments" data-section="Treatments">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our treatments</span><h2 data-e>Complete dental care, <em>made easy</em></h2><p data-e>Advanced technology and gentle hands for every treatment.</p></div>
  <div class="tg" data-list>
    <div class="tc rv"><i>🪥</i><h3 data-e>Check-up &amp; Cleaning</h3><p data-e>Scaling, polishing and complete oral health check.</p><span class="f" data-e>From ₹499</span></div>
    <div class="tc rv"><i>✨</i><h3 data-e>Teeth Whitening</h3><p data-e>Up to 8 shades brighter in a single sitting.</p><span class="f" data-e>From ₹4,999</span></div>
    <div class="tc rv"><i>😁</i><h3 data-e>Braces &amp; Aligners</h3><p data-e>Metal, ceramic and invisible aligners for all ages.</p><span class="f" data-e>From ₹25,000</span></div>
    <div class="tc rv"><i>🦷</i><h3 data-e>Dental Implants</h3><p data-e>Permanent, natural-looking replacement for missing teeth.</p><span class="f" data-e>From ₹22,000</span></div>
    <div class="tc rv"><i>🩺</i><h3 data-e>Root Canal</h3><p data-e>Single-sitting, painless RCT with rotary technology.</p><span class="f" data-e>From ₹3,500</span></div>
    <div class="tc rv"><i>👶</i><h3 data-e>Kids Dentistry</h3><p data-e>Gentle, fun care that makes children love the dentist.</p><span class="f" data-e>From ₹399</span></div>
  </div></div>
</section>

<section class="sec ba" id="results" data-section="Before & After">
  <div class="wrap bg2"><div class="rv"><span class="k" data-e>Smile makeovers</span><h2 data-e>Real results. <em>Real smiles.</em></h2><p data-e>Slide to compare. Every case is planned digitally so you can preview your new smile before we begin.</p><a class="btn" data-cta="enroll" data-e>Get Free Smile Analysis</a></div>
  <div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#c9b99a', '#8a7a5a', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#e8fbfb', '#5fe0e0', 900, 675)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div></div>
</section>

<section class="sec" id="doctors" data-section="Doctors">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our team</span><h2 data-e>Meet your <em>dentists</em></h2></div>
  <div class="dr" data-list>
    <div class="dc rv"><div class="p"><img data-img="d1" data-label="Doctor 1" src="${P.person('#0fa3a3', '#0b2e45')}" alt=""></div><div class="in"><h3 data-e>Dr. Ananya Rao</h3><div class="q" data-e>BDS, MDS · Orthodontist</div><p data-e>12 years · 5,000+ smile cases</p></div></div>
    <div class="dc rv"><div class="p"><img data-img="d2" data-label="Doctor 2" src="${P.person('#0b2e45', '#5fe0e0')}" alt=""></div><div class="in"><h3 data-e>Dr. Karthik Iyer</h3><div class="q" data-e>BDS, MDS · Implantologist</div><p data-e>10 years · 3,000+ implants</p></div></div>
    <div class="dc rv"><div class="p"><img data-img="d3" data-label="Doctor 3" src="${P.person('#5fe0e0', '#0fa3a3')}" alt=""></div><div class="in"><h3 data-e>Dr. Sana Sheikh</h3><div class="q" data-e>BDS · Pediatric Dentist</div><p data-e>8 years · kids' favourite</p></div></div>
  </div></div>
</section>

<section class="sec wh" data-section="Why choose us">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Why Smile</span><h2 data-e>Care you can <em style="color:#5fe0e0">trust</em></h2></div>
  <div class="wg" data-list><div class="wc rv"><i>😌</i><h3 data-e>Painless care</h3><p data-e>Advanced anaesthesia and gentle technique.</p></div><div class="wc rv"><i>🧼</i><h3 data-e>Hospital-grade hygiene</h3><p data-e>Autoclave-sterilised instruments, every time.</p></div><div class="wc rv"><i>💻</i><h3 data-e>Digital dentistry</h3><p data-e>3D scans, digital X-rays and smile design.</p></div><div class="wc rv"><i>💳</i><h3 data-e>Easy EMI</h3><p data-e>No-cost EMI on major treatments.</p></div></div></div>
</section>

<section class="sec" data-section="Clinic video"><div class="wrap"><div class="head rv"><span class="k" data-e>Take a look</span><h2 data-e>Inside our <em>clinic</em></h2></div><div class="vd rv"><div data-video data-label="Clinic video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div></section>

<section class="sec" style="padding-top:0" data-section="Packages">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Smile packages</span><h2 data-e>Clear <em>pricing</em></h2></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Fresh Start</h3><div class="pr" data-e>₹1,499</div><ul data-list><li data-e>Full check-up &amp; X-ray</li><li data-e>Scaling &amp; polishing</li><li data-e>Oral care kit</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
    <div class="pc h rv"><span class="fl" data-e>Most popular</span><h3 data-e>Bright Smile</h3><div class="pr" data-e>₹5,999</div><ul data-list><li data-e>Teeth whitening</li><li data-e>Scaling &amp; polishing</li><li data-e>Free follow-up</li></ul><a class="btn" data-cta="enroll" data-e>Book</a></div>
    <div class="pc rv"><h3 data-e>Family Care</h3><div class="pr" data-e>₹3,999</div><ul data-list><li data-e>Check-up for 4 members</li><li data-e>Kids fluoride treatment</li><li data-e>Priority booking</li></ul><a class="btn o" data-cta="enroll" data-e>Book</a></div>
  </div></div>
</section>

<section class="sec" style="background:var(--bg)" data-section="Patient reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Patient stories</span><h2 data-e>Smiles that <em>say it all</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"I was terrified of dentists. Dr. Ananya made my braces treatment completely comfortable."</p><div class="who"><img data-img="u1" data-label="Patient 1" src="${P.avatar('#0fa3a3', '#0b2e45')}" alt=""><span><b data-e>Riya Banerjee</b><small data-e>Braces patient</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Got my implant done in one visit. No pain, perfect finish. Highly recommended."</p><div class="who"><img data-img="u2" data-label="Patient 2" src="${P.avatar('#5fe0e0', '#0b2e45')}" alt=""><span><b data-e>Suresh Patel</b><small data-e>Implant patient</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My 5-year-old actually asks to go to the dentist now. Wonderful with kids!"</p><div class="who"><img data-img="u3" data-label="Patient 3" src="${P.avatar('#f59e0b', '#0fa3a3')}" alt=""><span><b data-e>Pooja Verma</b><small data-e>Mother of Aarav</small></span></div></div>
  </div></div>
</section>

<section class="sec" data-section="FAQ"><div class="wrap"><div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Quick <em>answers</em></h2></div>
  <div class="faqbox" data-list>
    <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Are the treatments painful?</div><div class="acc-b" data-acc-body data-e>No. We use modern anaesthesia and gentle techniques, so most patients feel little to no discomfort.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>How much does a consultation cost?</div><div class="acc-b" data-acc-body data-e>Your first consultation is free. We give a clear treatment plan and cost before we begin.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Do you offer EMI?</div><div class="acc-b" data-acc-body data-e>Yes, no-cost EMI is available on braces, implants and smile makeovers.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Do you treat children?</div><div class="acc-b" data-acc-body data-e>Absolutely. Our pediatric dentist makes visits fun and stress-free.</div></div>
  </div></div></section>

<section class="sec" id="contact" style="padding-top:0" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Visit us</span><h2 data-e>We're ready to <em style="color:#bff3f3">help</em></h2><div class="r"><b data-e>Address</b><span data-e>Smile Dental, 1st Floor, Main Road, Your City</span></div><div class="r"><b data-e>Timings</b><span data-e>Mon – Sat · 10:00 AM – 8:00 PM</span></div><div class="r"><b data-e>Emergency</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" style="background:#fff;color:var(--accent);border-color:#fff" data-cta="enroll" data-e>Book Appointment</a></div>
  <div class="map rv" data-map data-label="Clinic location" data-q="Andheri West, Mumbai"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Your best smile starts today</h2><p data-e>Book a free consultation and get a personalised treatment plan.</p><a class="btn" data-cta="enroll" data-e>Book Free Consultation →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Smile Dental Clinic. All rights reserved.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
