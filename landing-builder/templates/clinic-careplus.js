/* Clinic 2 — CARE+: multi-speciality clinic / hospital (trust blue, emergency red) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'clinic-careplus',
    category: 'clinic',
    name: 'Care+',
    tagline: 'Trusted multi-speciality clinic & hospital',
    best: 'Multi-speciality clinic · Hospital · Diagnostics · Health check-ups',
    colors: [
      { v: '--accent', l: 'Trust blue', d: '#1d5bd8' },
      { v: '--accent2', l: 'Emergency red', d: '#e5384b' }
    ],
    defaults: {
      enroll: { title: 'Book a doctor appointment', sub: 'Choose a department. We will confirm your slot on WhatsApp.', button: 'Request Appointment', thanks: 'Request received!', extraOn: true, extraLabel: 'Department', extraOptions: 'General Medicine, Cardiology, Orthopedics, Gynecology, Pediatrics, Dermatology, Health Check-up' },
      whatsapp: { message: 'Hi! I would like to book a doctor appointment.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Doctor' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Care+ Clinic — Book Appointment</title>
<meta name="description" content="Expert doctors across 20+ specialities under one roof. Book your appointment online.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#1d5bd8;--accent2:#e5384b;--accent-ink:#fff;--navy:#0c1f4a;--bg:#f3f6fd;--ink:#14213d;--mut:#5b6a86;--line:#dde4f3}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Public Sans',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Lexend',system-ui,sans-serif;font-weight:600;letter-spacing:-.02em;line-height:1.15}
em{font-style:normal;color:var(--accent)}
.wrap{width:min(1200px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 30px;background:var(--accent);color:#fff;font-weight:600;font-size:16px;border-radius:12px;border:2px solid var(--accent);transition:.25s;cursor:pointer;font-family:'Public Sans'}
.btn:hover{background:var(--navy);border-color:var(--navy)}
.btn.o{background:#fff;color:var(--accent)}.btn.o:hover{background:var(--accent);color:#fff}
.btn.r{background:var(--accent2);border-color:var(--accent2)}.btn.r:hover{background:#b82a3a;border-color:#b82a3a}
.k{display:inline-flex;gap:8px;align-items:center;font-size:13.5px;font-weight:600;color:var(--accent);letter-spacing:.06em;text-transform:uppercase}
.em{background:var(--accent2);color:#fff;font-size:14.5px;padding:9px 0}.em .wrap{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;align-items:center;text-align:center;font-weight:500}.em b{font-family:'Lexend';font-weight:600}.em a{background:#fff;color:var(--accent2);padding:3px 14px;border-radius:99px;font-weight:700}
header{position:sticky;top:0;z-index:40;background:#fff;border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;gap:16px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Lexend';font-weight:700;font-size:23px;color:var(--navy)}
.brand img{width:44px;height:44px;border-radius:12px;object-fit:cover}
.links{display:flex;gap:28px;font-weight:500;font-size:15.5px;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:15px}
.hero{background:linear-gradient(135deg,var(--navy),#16397f);color:#fff;padding:70px 0 90px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;right:-120px;top:-120px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.06)}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center;position:relative}
.hero .k{color:#9fc0ff}.hero h1{font-size:clamp(36px,5.2vw,64px);margin:16px 0 18px}.hero h1 em{color:#7fb0ff}
.hero p{color:#cbd8f3;font-size:18.5px;max-width:520px;margin-bottom:28px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:30px}.hero .btn.o{background:transparent;color:#fff;border-color:rgba(255,255,255,.45)}.hero .btn.o:hover{background:#fff;color:var(--navy)}
.pills{display:flex;gap:12px;flex-wrap:wrap}.pills span{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);padding:7px 16px;border-radius:99px;font-size:14px;font-weight:500}
.hc{background:#fff;color:var(--ink);border-radius:22px;padding:30px;box-shadow:0 40px 80px -30px rgba(0,0,0,.5)}
.hc h3{font-size:22px;margin-bottom:6px}.hc p{color:var(--mut);font-size:14.5px;margin-bottom:18px}
.hc .row{display:flex;gap:14px;align-items:center;padding:13px 0;border-top:1px solid var(--line)}.hc .row i{font-style:normal;width:44px;height:44px;border-radius:12px;background:var(--bg);display:grid;place-items:center;font-size:21px;flex:none}.hc .row b{display:block;font-size:15.5px;font-family:'Lexend';font-weight:500}.hc .row span{color:var(--mut);font-size:13.5px}
.hc .btn{width:100%;margin-top:14px}
.nm{margin-top:-40px;position:relative;z-index:2}.ng{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border-radius:20px;box-shadow:0 20px 50px -26px rgba(12,31,74,.45);border:1px solid var(--line)}.ng div{padding:28px 20px;text-align:center;border-right:1px solid var(--line)}.ng div:last-child{border:0}.ng b{font-family:'Lexend';font-size:34px;color:var(--accent);display:block;line-height:1.1}.ng span{font-size:14px;color:var(--mut)}
.sec{padding:96px 0}
.head{max-width:640px;margin:0 auto 50px;text-align:center}.head h2{font-size:clamp(30px,4.2vw,46px);margin:12px 0 12px;color:var(--navy)}.head p{color:var(--mut);font-size:17.5px}
.dg{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.dp{border:1.5px solid var(--line);border-radius:18px;padding:28px 22px;transition:.25s;background:#fff}.dp:hover{border-color:var(--accent);background:var(--bg);transform:translateY(-6px)}
.dp i{font-style:normal;font-size:34px;display:block;margin-bottom:10px}.dp h3{font-size:19px;margin-bottom:4px;color:var(--navy)}.dp span{color:var(--mut);font-size:14.5px}
.dr{background:var(--bg)}.drg{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.dc{background:#fff;border-radius:20px;overflow:hidden;border:1px solid var(--line)}.dc .p{aspect-ratio:1/1.05;background:linear-gradient(160deg,#cfe0ff,#fff)}.dc .p img{width:100%;height:100%;object-fit:cover}.dc .in{padding:18px 18px 22px}.dc h3{font-size:18px;color:var(--navy)}.dc .q{color:var(--accent);font-weight:600;font-size:14px}.dc small{color:var(--mut);display:block;margin:4px 0 12px;font-size:13.5px}.dc .btn{width:100%;padding:11px;font-size:14px}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{border:1.5px solid var(--line);border-radius:22px;padding:34px 30px;position:relative;background:#fff}.pc.h{border-color:var(--accent);box-shadow:0 30px 60px -36px var(--accent)}
.pc .fl{position:absolute;top:-13px;right:24px;background:var(--accent);color:#fff;padding:3px 14px;border-radius:99px;font-size:12.5px;font-weight:600}
.pc h3{font-size:23px;color:var(--navy)}.pc .pr{font-family:'Lexend';font-size:40px;font-weight:600;color:var(--accent);margin:8px 0}.pc .pr small{font-size:14px;color:var(--mut);font-weight:400;font-family:'Public Sans'}.pc ul{list-style:none;display:grid;gap:9px;margin:16px 0 24px;font-size:15px;color:var(--mut)}.pc li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}.pc .btn{width:100%}
.fa{background:var(--navy);color:#fff}.fa .head h2{color:#fff}.fa .head p{color:#b9c8e8}.fa .k{color:#9fc0ff}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.fl2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.fl2 div{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:22px}.fl2 i{font-style:normal;font-size:28px;display:block;margin-bottom:6px}.fl2 b{font-family:'Lexend';font-weight:500;font-size:16.5px;display:block}.fl2 span{color:#b9c8e8;font-size:14px}
.vd{border-radius:22px;overflow:hidden;border:6px solid rgba(255,255,255,.12)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.rc{border:1px solid var(--line);border-radius:20px;padding:30px;background:#fff}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.rc p{margin-bottom:18px;font-size:16.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15.5px}.who small{color:var(--mut)}
.ins{padding:40px 0;background:var(--bg);text-align:center}.ins p{font-size:13px;color:var(--mut);font-weight:600;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}.ins .lg{display:flex;gap:40px;justify-content:center;flex-wrap:wrap;font-family:'Lexend';font-weight:600;font-size:20px;color:#9aa8c4}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:44px}.ci{background:var(--accent);color:#fff;border-radius:24px;padding:44px 38px}.ci h2{font-size:clamp(28px,3.4vw,40px);margin:12px 0 22px}.ci .k{color:#cfe0ff}.ci .r{margin-bottom:18px}.ci b{display:block;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:#cfe0ff}.ci span{font-size:17.5px}
.map{min-height:400px;border-radius:24px;border:1px solid var(--line)}
.final{padding:0 0 96px}.final .box{background:linear-gradient(120deg,var(--accent),#1b44a8);color:#fff;border-radius:28px;padding:70px 30px;text-align:center}.final h2{font-size:clamp(30px,4.6vw,52px);max-width:760px;margin:0 auto 14px}.final p{color:#d6e2ff;max-width:520px;margin:0 auto 28px;font-size:18px}.final .btn{background:#fff;color:var(--accent);border-color:#fff}
footer{padding:28px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:960px){.links{display:none}.hg,.fg,.ct{grid-template-columns:1fr;gap:40px}.ng{grid-template-columns:1fr 1fr}.ng div:nth-child(2){border-right:0}.dg,.drg{grid-template-columns:1fr 1fr}.pk,.rg{grid-template-columns:1fr}.sec{padding:70px 0}.nav .btn{display:none}}
@media(max-width:560px){.dg,.drg,.fl2{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="em" data-section="Emergency strip" data-fixed><div class="wrap"><b data-e>🚑 24×7 Emergency &amp; Ambulance</b><a data-cta="call" data-e>Call +91 98765 43210</a></div></div>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#1d5bd8', '#0c1f4a', '+')}" alt="Logo"><span data-e>Care+ Clinic</span></a>
  <nav class="links"><a href="#departments" data-e>Departments</a><a href="#doctors" data-e>Doctors</a><a href="#packages" data-e>Health Packages</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Appointment</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>NABH accredited · 20+ specialities</span><h1 class="rv" data-e>Expert care for your <em>whole family</em>, under one roof</h1><p class="rv" data-e>Experienced doctors, advanced diagnostics and compassionate care. Book an appointment in under a minute.</p>
  <div class="cta-row rv"><a class="btn r" data-cta="enroll" data-e>Book Appointment</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="pills rv" data-list><span data-e>Cashless insurance</span><span data-e>Online reports</span><span data-e>Home sample collection</span></div></div>
  <div class="hc rv"><h3 data-e>Quick appointment</h3><p data-e>Same-day slots available with senior doctors.</p>
    <div class="row"><i>🩺</i><span><b data-e>General Physician</b><span data-e>Today · 10:00 AM onwards</span></span></div><div class="row"><i>❤️</i><span><b data-e>Cardiology</b><span data-e>Today · 12:30 PM onwards</span></span></div><div class="row"><i>🦴</i><span><b data-e>Orthopedics</b><span data-e>Tomorrow · 9:00 AM onwards</span></span></div>
    <a class="btn" data-cta="enroll" data-e>Book My Slot</a></div>
</div></section>
<section class="nm" data-section="Trust numbers"><div class="wrap ng" data-list><div><b data-e>20+</b><span data-e>Specialities</span></div><div><b data-e>60+</b><span data-e>Expert doctors</span></div><div><b data-e>1.2 L+</b><span data-e>Patients treated</span></div><div><b data-e>24×7</b><span data-e>Emergency care</span></div></div></section>

<section class="sec" id="departments" data-section="Departments">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our departments</span><h2 data-e>Comprehensive care, <em>every speciality</em></h2></div>
  <div class="dg" data-list>
    <div class="dp rv"><i>🩺</i><h3 data-e>General Medicine</h3><span data-e>Fever, diabetes, BP &amp; more</span></div><div class="dp rv"><i>❤️</i><h3 data-e>Cardiology</h3><span data-e>Heart care &amp; ECG/2D Echo</span></div><div class="dp rv"><i>🦴</i><h3 data-e>Orthopedics</h3><span data-e>Joints, spine &amp; sports injury</span></div><div class="dp rv"><i>🤰</i><h3 data-e>Gynecology</h3><span data-e>Maternity &amp; women's health</span></div>
    <div class="dp rv"><i>👶</i><h3 data-e>Pediatrics</h3><span data-e>Newborn &amp; child care</span></div><div class="dp rv"><i>🧴</i><h3 data-e>Dermatology</h3><span data-e>Skin, hair &amp; laser</span></div><div class="dp rv"><i>👁️</i><h3 data-e>Ophthalmology</h3><span data-e>Eye care &amp; surgery</span></div><div class="dp rv"><i>🧪</i><h3 data-e>Diagnostics</h3><span data-e>Lab, X-ray, CT &amp; MRI</span></div>
  </div></div>
</section>

<section class="sec dr" id="doctors" data-section="Doctors">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our doctors</span><h2 data-e>Meet the <em>specialists</em></h2></div>
  <div class="drg" data-list>
    <div class="dc rv"><div class="p"><img data-img="d1" data-label="Doctor 1" src="${P.person('#1d5bd8', '#0c1f4a')}" alt=""></div><div class="in"><h3 data-e>Dr. Rajesh Menon</h3><div class="q" data-e>Cardiologist</div><small data-e>MD, DM · 20 yrs</small><a class="btn o" data-cta="enroll" data-e>Book</a></div></div>
    <div class="dc rv"><div class="p"><img data-img="d2" data-label="Doctor 2" src="${P.person('#e5384b', '#7a1522')}" alt=""></div><div class="in"><h3 data-e>Dr. Priya Nair</h3><div class="q" data-e>Gynecologist</div><small data-e>MD, DGO · 15 yrs</small><a class="btn o" data-cta="enroll" data-e>Book</a></div></div>
    <div class="dc rv"><div class="p"><img data-img="d3" data-label="Doctor 3" src="${P.person('#0c1f4a', '#4b7be0')}" alt=""></div><div class="in"><h3 data-e>Dr. Amit Saxena</h3><div class="q" data-e>Orthopedic Surgeon</div><small data-e>MS Ortho · 18 yrs</small><a class="btn o" data-cta="enroll" data-e>Book</a></div></div>
    <div class="dc rv"><div class="p"><img data-img="d4" data-label="Doctor 4" src="${P.person('#4b7be0', '#cfe0ff')}" alt=""></div><div class="in"><h3 data-e>Dr. Sneha Kulkarni</h3><div class="q" data-e>Pediatrician</div><small data-e>MD Pediatrics · 12 yrs</small><a class="btn o" data-cta="enroll" data-e>Book</a></div></div>
  </div></div>
</section>

<section class="sec" id="packages" data-section="Health packages">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Preventive care</span><h2 data-e>Health <em>check-up packages</em></h2><p data-e>Reports delivered online within 24 hours.</p></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Basic Health Check</h3><div class="pr"><span data-e>₹999</span> <small data-e>/ person</small></div><ul data-list><li data-e>45 tests · CBC, sugar, lipid</li><li data-e>Doctor consultation</li><li data-e>ECG</li></ul><a class="btn o" data-cta="enroll" data-e>Book package</a></div>
    <div class="pc h rv"><span class="fl" data-e>Recommended</span><h3 data-e>Complete Wellness</h3><div class="pr"><span data-e>₹2,499</span> <small data-e>/ person</small></div><ul data-list><li data-e>85 tests incl. thyroid &amp; vitamin D</li><li data-e>ECG &amp; chest X-ray</li><li data-e>Physician + diet consult</li></ul><a class="btn" data-cta="enroll" data-e>Book package</a></div>
    <div class="pc rv"><h3 data-e>Senior Citizen</h3><div class="pr"><span data-e>₹3,499</span> <small data-e>/ person</small></div><ul data-list><li data-e>100+ tests &amp; 2D Echo</li><li data-e>Bone density scan</li><li data-e>Cardiology consult</li></ul><a class="btn o" data-cta="enroll" data-e>Book package</a></div>
  </div></div>
</section>

<section class="sec fa" data-section="Facilities">
  <div class="wrap fg"><div class="rv"><span class="k" data-e>Our facilities</span><h2 style="font-size:clamp(30px,4vw,46px);margin:12px 0 22px" data-e>Modern, clean and <em style="color:#7fb0ff">patient-first</em></h2><div class="fl2" data-list><div><i>🏥</i><b data-e>OPD &amp; IPD</b><span data-e>Comfortable rooms</span></div><div><i>🧪</i><b data-e>In-house lab</b><span data-e>NABL accredited</span></div><div><i>🩻</i><b data-e>Imaging</b><span data-e>X-ray, CT, MRI</span></div><div><i>💊</i><b data-e>24×7 pharmacy</b><span data-e>On-site</span></div></div></div>
  <div class="vd rv"><div data-video data-label="Hospital tour video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div>
</section>

<section class="sec" data-section="Patient reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Patient stories</span><h2 data-e>Trusted by <em>thousands</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Dr. Menon explained everything clearly and the staff were so caring. Excellent hospital."</p><div class="who"><img data-img="u1" data-label="Patient 1" src="${P.avatar('#1d5bd8', '#0c1f4a')}" alt=""><span><b data-e>Ramesh Pillai</b><small data-e>Cardiology patient</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Delivered my baby here. The entire team was supportive and the rooms are very clean."</p><div class="who"><img data-img="u2" data-label="Patient 2" src="${P.avatar('#e5384b', '#7a1522')}" alt=""><span><b data-e>Shalini Joshi</b><small data-e>Maternity</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Fast reports, no long queues and cashless insurance approved in an hour. Very smooth."</p><div class="who"><img data-img="u3" data-label="Patient 3" src="${P.avatar('#4b7be0', '#cfe0ff')}" alt=""><span><b data-e>Irfan Ahmed</b><small data-e>Health check-up</small></span></div></div>
  </div></div>
</section>
<section class="ins" data-section="Insurance partners"><div class="wrap"><p data-e>Cashless insurance accepted</p><div class="lg" data-list><span data-e>Star Health</span><span data-e>HDFC ERGO</span><span data-e>ICICI Lombard</span><span data-e>Niva Bupa</span><span data-e>Ayushman</span></div></div></section>

<section class="sec" id="contact" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Find us</span><h2 data-e>We're here, <em style="color:#fff">24×7</em></h2><div class="r"><b data-e>Address</b><span data-e>Care+ Clinic, Hospital Road, Your City – 000000</span></div><div class="r"><b data-e>OPD timings</b><span data-e>Mon – Sat · 9:00 AM – 8:00 PM</span></div><div class="r"><b data-e>Emergency</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" style="background:#fff;color:var(--accent);border-color:#fff" data-cta="enroll" data-e>Book Appointment</a></div>
  <div class="map rv" data-map data-label="Hospital location" data-q="Connaught Place, New Delhi"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Your health can't wait</h2><p data-e>Book your doctor appointment now and skip the queue.</p><a class="btn" data-cta="enroll" data-e>Book Appointment →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Care+ Clinic. All rights reserved. Reg. No. XXXXXX</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
