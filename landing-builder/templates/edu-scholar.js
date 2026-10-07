/* Template 2 — SCHOLAR: classic, trustworthy institute / coaching centre (navy + gold, serif) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'edu-scholar',
    category: 'education',
    name: 'Scholar',
    tagline: 'Classic & trusted — navy and gold',
    best: 'Institute · School · Coaching centre admissions',
    colors: [
      { v: '--accent', l: 'Main (navy)', d: '#10234a' },
      { v: '--accent2', l: 'Highlight (gold)', d: '#c28b2c' }
    ],
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admissions Open — Your Institute</title>
<meta name="description" content="Admissions open. Expert faculty, proven results and personal mentoring.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#10234a;--accent2:#c28b2c;--accent-ink:#fff;--bg:#fbf8f2;--ink:#171c2b;--mut:#5b6275;--line:#e8e1d2;--card:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'DM Sans',system-ui,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3,.serif{font-family:'Playfair Display',Georgia,serif;line-height:1.15;letter-spacing:-.01em}
em{font-style:italic;color:var(--accent2)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;gap:10px;padding:16px 30px;border-radius:6px;font-weight:700;font-size:15.5px;background:var(--accent);color:#fff;border:2px solid var(--accent);transition:.2s;cursor:pointer;letter-spacing:.01em}
.btn:hover{background:var(--accent2);border-color:var(--accent2);transform:translateY(-2px)}
.btn.gold{background:var(--accent2);border-color:var(--accent2)}
.btn.gold:hover{background:#fff;color:var(--accent);border-color:#fff}
.btn.line{background:transparent;color:var(--accent)}
.btn.line:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.top{background:var(--accent);color:#e9ecf5;font-size:13.5px;padding:9px 0}
.top .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.top b{color:#f3d58c}
header{background:rgba(251,248,242,.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);position:sticky;top:0;z-index:40;border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px;gap:20px}
.brand{display:flex;align-items:center;gap:13px}
.brand img{width:46px;height:46px;border-radius:50%;object-fit:cover}
.brand b{font-family:'Playfair Display';font-size:22px;color:var(--accent);display:block;line-height:1.1}
.brand small{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.links{display:flex;gap:30px;font-weight:600;font-size:14.5px;color:#3a4156}
.links a:hover{color:var(--accent2)}
.hero{padding:70px 0 90px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;right:-180px;top:-140px;width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(194,139,44,.18),transparent 68%)}
.hgrid{display:grid;grid-template-columns:1.08fr .92fr;gap:60px;align-items:center;position:relative}
.kicker{display:inline-flex;gap:10px;align-items:center;font-weight:700;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent2)}
.kicker::before{content:"";width:34px;height:2px;background:var(--accent2)}
.hero h1{font-size:clamp(38px,5.4vw,66px);font-weight:700;color:var(--accent);margin:18px 0 22px}
.hero p.lead{font-size:18.5px;color:var(--mut);max-width:560px;margin-bottom:30px}
.checks{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;margin-bottom:36px}
.checks li{display:flex;gap:10px;font-weight:600;font-size:15px}
.checks li::before{content:"✓";color:var(--accent2);font-weight:800}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.arch{position:relative;max-width:470px;margin-left:auto}
.arch .im{border-radius:240px 240px 24px 24px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 40px 80px -30px rgba(16,35,74,.55);border:8px solid #fff}
.arch .im img{width:100%;height:100%;object-fit:cover}
.badge{position:absolute;background:#fff;border-radius:16px;padding:14px 18px;box-shadow:0 20px 50px -18px rgba(16,35,74,.45);display:flex;gap:12px;align-items:center}
.badge b{font-family:'Playfair Display';font-size:28px;color:var(--accent);line-height:1}
.badge span{font-size:12.5px;color:var(--mut);line-height:1.3}
.badge.a{left:-34px;bottom:70px}.badge.b{right:-14px;top:50px}
.stats{background:var(--accent);color:#fff;padding:46px 0}
.stats .g{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center}
.stats b{font-family:'Playfair Display';font-size:46px;color:#f3d58c;display:block;line-height:1.1}
.stats span{font-size:14.5px;color:#cfd6ea}
.stats .g>div+div{border-left:1px solid rgba(255,255,255,.16)}
.sec{padding:96px 0}
.head{max-width:680px;margin:0 auto 56px;text-align:center}
.head h2{font-size:clamp(30px,4vw,46px);color:var(--accent);margin:14px 0}
.head p{color:var(--mut);font-size:17.5px}
.why{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.why .im{border-radius:24px;overflow:hidden;aspect-ratio:5/4.4;box-shadow:0 30px 70px -30px rgba(16,35,74,.5)}
.why .im img{width:100%;height:100%;object-fit:cover}
.why h2{font-size:clamp(30px,3.8vw,44px);color:var(--accent);margin:14px 0 20px}
.pts{display:grid;gap:22px;margin-top:28px}
.pt{display:flex;gap:18px}
.pt .n{flex:none;width:48px;height:48px;border-radius:50%;background:var(--accent);color:#f3d58c;font-family:'Playfair Display';font-size:20px;font-weight:700;display:grid;place-items:center}
.pt h3{font-size:19px;color:var(--accent);margin-bottom:4px}
.pt p{color:var(--mut);font-size:15.5px}
.progs{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pc{background:var(--bg);border:1px solid var(--line);border-radius:18px;padding:34px 30px;transition:.3s;position:relative}
.pc:hover{transform:translateY(-8px);box-shadow:0 30px 60px -30px rgba(16,35,74,.4);border-color:var(--accent2)}
.pc .tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--accent2);padding:5px 12px;border-radius:99px;margin-bottom:18px}
.pc h3{font-size:25px;color:var(--accent);margin-bottom:10px}
.pc p{color:var(--mut);font-size:15.5px;margin-bottom:18px}
.pc ul{list-style:none;display:grid;gap:8px;margin-bottom:22px;font-size:14.5px;font-weight:500}
.pc li::before{content:"◆";color:var(--accent2);font-size:10px;margin-right:10px}
.pc a{font-weight:700;color:var(--accent);border-bottom:2px solid var(--accent2);padding-bottom:2px}
.tour{background:var(--accent);padding:96px 0;color:#fff}
.tour .head h2{color:#fff}.tour .head p{color:#cfd6ea}
.tour .vbox{max-width:920px;margin:0 auto;border-radius:22px;overflow:hidden;border:8px solid rgba(255,255,255,.12);box-shadow:0 50px 100px -30px rgba(0,0,0,.6)}
.fac{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.fc{text-align:center}
.fc .p{border-radius:20px;overflow:hidden;aspect-ratio:1/1.1;margin-bottom:16px;border:1px solid var(--line)}
.fc .p img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.fc:hover .p img{transform:scale(1.06)}
.fc h3{font-size:19px;color:var(--accent)}.fc span{color:var(--mut);font-size:14.5px}
.steps{background:#fff;border-top:1px solid var(--line)}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;counter-reset:s}
.st{position:relative;padding-top:30px;border-top:3px solid var(--line)}
.st::before{counter-increment:s;content:"0" counter(s);position:absolute;top:-22px;left:0;background:#fff;padding-right:12px;font-family:'Playfair Display';font-size:36px;color:var(--accent2);font-weight:700}
.st h3{font-size:20px;color:var(--accent);margin-bottom:8px}.st p{color:var(--mut);font-size:15.5px}
.tm{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.tc{background:#fff;border:1px solid var(--line);border-radius:18px;padding:32px 28px;position:relative}
.tc::before{content:"“";position:absolute;top:6px;right:22px;font-family:'Playfair Display';font-size:90px;color:var(--accent2);opacity:.28;line-height:1}
.tc p{font-size:16px;margin-bottom:22px;color:#2b3246}
.who{display:flex;gap:14px;align-items:center}.who img{width:50px;height:50px;border-radius:50%;object-fit:cover}
.who b{display:block;color:var(--accent)}.who small{color:var(--mut)}
.faqbox{max-width:820px;margin:0 auto;display:grid;gap:12px}
.acc{background:#fff;border:1px solid var(--line);border-radius:14px}
.acc-h{display:flex;justify-content:space-between;gap:16px;padding:20px 24px;font-weight:700;font-size:16.5px;color:var(--accent);cursor:pointer}
.acc-h::after{content:"+";color:var(--accent2);font-size:26px;line-height:1;transition:transform .25s}
.acc.open .acc-h::after{transform:rotate(45deg)}
.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.cta{padding:20px 0 96px}
.cta .box{background:linear-gradient(120deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#000));border-radius:26px;padding:70px 40px;text-align:center;color:#fff;position:relative;overflow:hidden}
.cta .box::after{content:"";position:absolute;left:-80px;bottom:-120px;width:340px;height:340px;border-radius:50%;background:rgba(194,139,44,.28)}
.cta h2{font-size:clamp(30px,4vw,46px);margin-bottom:14px;position:relative}
.cta p{color:#d3d9ec;font-size:18px;max-width:560px;margin:0 auto 30px;position:relative}
.cta .btn{position:relative}
footer{background:#0b1733;color:#aab3cc;padding:56px 0 30px;font-size:14.5px}
.fg{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px;padding-bottom:34px;border-bottom:1px solid rgba(255,255,255,.12)}
footer h4{color:#fff;font-family:'Playfair Display';font-size:19px;margin-bottom:14px}
footer p{margin-bottom:8px}
.copy{padding-top:22px;font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hgrid,.why{grid-template-columns:1fr;gap:44px}.arch{margin:0 auto}.badge.a{left:-8px}.badge.b{right:-6px}.cards,.tm{grid-template-columns:1fr}.fac,.sg{grid-template-columns:1fr 1fr}.stats .g{grid-template-columns:1fr 1fr}.stats .g>div+div{border:0}.fg{grid-template-columns:1fr}.top .wrap span:last-child{display:none}.checks{grid-template-columns:1fr}}
@media(max-width:560px){.brand small{display:none}.brand b{font-size:19px}.nav .btn{white-space:nowrap;padding:12px 18px}.fac,.sg{grid-template-columns:1fr}.btn{width:100%;justify-content:center}.nav .btn{width:auto}}
</style>
</head>
<body>
<div class="top" data-section="Top strip" data-fixed><div class="wrap"><span>🎓 <b data-e>Admissions Open 2025–26</b> · <span data-e>Limited seats in every batch</span></span><span><a data-cta="call" data-e>📞 Call: +91 98765 43210</a></span></div></div>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#10234a', '#c28b2c', 'S')}" alt="Logo"><span><b data-e>Your Institute</b><small data-e>Excellence in education</small></span></a>
    <nav class="links"><a href="#why" data-e>About</a><a href="#programs" data-e>Programs</a><a href="#faculty" data-e>Faculty</a><a href="#admission" data-e>Admission</a><a href="#faq" data-e>FAQ</a></nav>
    <a class="btn gold" data-cta="enroll" data-e>Enroll Now</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap hgrid">
    <div>
      <span class="kicker rv" data-e>Admissions open</span>
      <h1 class="rv" data-e>Where <em>talent</em> meets the right guidance</h1>
      <p class="lead rv" data-e>For over 15 years we have shaped confident learners through expert teaching, small batches and personal mentoring. Give your child the strongest start.</p>
      <ul class="checks rv" data-list><li data-e>Small batches of 25 students</li><li data-e>Weekly tests &amp; parent reports</li><li data-e>Doubt-solving every day</li><li data-e>Scholarships for toppers</li></ul>
      <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Free Counselling →</a><a class="btn line" data-cta="whatsapp" data-e>Chat on WhatsApp</a></div>
    </div>
    <div class="arch rv">
      <div class="im"><img data-img="hero" data-label="Hero photo" src="${P.person('#10234a', '#c28b2c')}" alt="Students"></div>
      <div class="badge a"><b data-e>4.9★</b><span data-e>Rated by<br>3,500+ parents</span></div>
      <div class="badge b"><b data-e>98%</b><span data-e>Students pass<br>with distinction</span></div>
    </div>
  </div>
</section>

<section class="stats" data-section="Achievements strip">
  <div class="wrap g" data-list>
    <div class="rv"><b data-e>15+</b><span data-e>Years of excellence</span></div>
    <div class="rv"><b data-e>12,000+</b><span data-e>Students taught</span></div>
    <div class="rv"><b data-e>85+</b><span data-e>Expert faculty</span></div>
    <div class="rv"><b data-e>320+</b><span data-e>State &amp; national ranks</span></div>
  </div>
</section>

<section class="sec" id="why" data-section="Why choose us">
  <div class="wrap why">
    <div class="im rv"><img data-img="why" data-label="About photo" src="${P.photo('#10234a', '#2c4a8f', 900, 800)}" alt="Classroom"></div>
    <div class="rv">
      <span class="kicker" data-e>Why parents trust us</span>
      <h2 data-e>A learning environment built for <em>results</em></h2>
      <div class="pts" data-list>
        <div class="pt"><div class="n">1</div><div><h3 data-e>Experienced mentors</h3><p data-e>Teachers with 10+ years of experience who explain concepts simply and patiently.</p></div></div>
        <div class="pt"><div class="n">2</div><div><h3 data-e>Structured curriculum</h3><p data-e>Chapter plans, notes and practice papers aligned to the latest syllabus.</p></div></div>
        <div class="pt"><div class="n">3</div><div><h3 data-e>Regular assessment</h3><p data-e>Weekly tests with detailed analysis so every student knows where to improve.</p></div></div>
        <div class="pt"><div class="n">4</div><div><h3 data-e>Personal attention</h3><p data-e>Dedicated mentor for each student and monthly parent–teacher meetings.</p></div></div>
      </div>
    </div>
  </div>
</section>

<section class="sec progs" id="programs" data-section="Programs">
  <div class="wrap">
    <div class="head rv"><span class="kicker" data-e>Our programs</span><h2 data-e>Choose the right <em>program</em></h2><p data-e>Carefully designed courses for every stage of learning.</p></div>
    <div class="cards" data-list>
      <div class="pc rv"><span class="tag" data-e>Class 6 – 8</span><h3 data-e>Foundation Course</h3><p data-e>Build strong basics in Maths, Science and English with activity-based learning.</p><ul data-list><li data-e>Daily 2-hour classes</li><li data-e>Olympiad preparation</li><li data-e>Monthly progress report</li></ul><a data-cta="enroll" data-e>Know more →</a></div>
      <div class="pc rv"><span class="tag" data-e>Class 9 – 10</span><h3 data-e>Board Excellence</h3><p data-e>Complete board syllabus with NCERT depth, sample papers and revision plans.</p><ul data-list><li data-e>Chapter-wise tests</li><li data-e>Previous year papers</li><li data-e>Doubt classes on weekends</li></ul><a data-cta="enroll" data-e>Know more →</a></div>
      <div class="pc rv"><span class="tag" data-e>Class 11 – 12</span><h3 data-e>Senior Achievers</h3><p data-e>Board + entrance exam preparation with expert faculty and test series.</p><ul data-list><li data-e>Board + entrance combo</li><li data-e>All-India test series</li><li data-e>Career counselling</li></ul><a data-cta="enroll" data-e>Know more →</a></div>
    </div>
  </div>
</section>

<section class="tour" data-section="Campus video">
  <div class="wrap">
    <div class="head rv"><span class="kicker" data-e>Take a tour</span><h2 data-e>See life at <em>our campus</em></h2><p data-e>A 2-minute walkthrough of our classrooms, labs and teachers.</p></div>
    <div class="vbox rv"><div data-video data-label="Campus tour video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  </div>
</section>

<section class="sec" id="faculty" data-section="Faculty">
  <div class="wrap">
    <div class="head rv"><span class="kicker" data-e>Our faculty</span><h2 data-e>Learn from the <em>best minds</em></h2></div>
    <div class="fac" data-list>
      <div class="fc rv"><div class="p"><img data-img="f1" data-label="Faculty 1" src="${P.person('#10234a', '#4b6cb7')}" alt=""></div><h3 data-e>Dr. Anil Mehta</h3><span data-e>Mathematics · 18 yrs</span></div>
      <div class="fc rv"><div class="p"><img data-img="f2" data-label="Faculty 2" src="${P.person('#7a4a14', '#c28b2c')}" alt=""></div><h3 data-e>Neha Kulkarni</h3><span data-e>Physics · 12 yrs</span></div>
      <div class="fc rv"><div class="p"><img data-img="f3" data-label="Faculty 3" src="${P.person('#1f5f4a', '#3aa57f')}" alt=""></div><h3 data-e>Prof. R. Iyer</h3><span data-e>Chemistry · 20 yrs</span></div>
      <div class="fc rv"><div class="p"><img data-img="f4" data-label="Faculty 4" src="${P.person('#6b2150', '#c0529a')}" alt=""></div><h3 data-e>Sana Khan</h3><span data-e>English · 10 yrs</span></div>
    </div>
  </div>
</section>

<section class="sec steps" id="admission" data-section="Admission process">
  <div class="wrap">
    <div class="head rv"><span class="kicker" data-e>Admission process</span><h2 data-e>Join in <em>4 simple steps</em></h2></div>
    <div class="sg" data-list>
      <div class="st rv"><h3 data-e>Register</h3><p data-e>Fill the short enquiry form or call us. It takes less than a minute.</p></div>
      <div class="st rv"><h3 data-e>Free counselling</h3><p data-e>Meet our counsellor, visit the campus and choose the right batch.</p></div>
      <div class="st rv"><h3 data-e>Scholarship test</h3><p data-e>Take the optional test and win up to 50% scholarship.</p></div>
      <div class="st rv"><h3 data-e>Confirm seat</h3><p data-e>Complete the formalities and start your first class.</p></div>
    </div>
  </div>
</section>

<section class="sec" data-section="Parent reviews">
  <div class="wrap">
    <div class="head rv"><span class="kicker" data-e>Testimonials</span><h2 data-e>What parents &amp; students <em>say</em></h2></div>
    <div class="tm" data-list>
      <div class="tc rv"><p data-e>My daughter's confidence has grown so much. The teachers genuinely care and the weekly reports keep us informed.</p><div class="who"><img data-img="t1" data-label="Parent 1" src="${P.avatar('#10234a', '#c28b2c')}" alt=""><span><b data-e>Sunita Rao</b><small data-e>Parent of Class 9 student</small></span></div></div>
      <div class="tc rv"><p data-e>Joined in Class 11 with average marks and secured 96% in boards. The doubt sessions made all the difference.</p><div class="who"><img data-img="t2" data-label="Student 1" src="${P.avatar('#1f5f4a', '#3aa57f')}" alt=""><span><b data-e>Aarav Joshi</b><small data-e>Class 12 · 96%</small></span></div></div>
      <div class="tc rv"><p data-e>Best decision for my son. Disciplined environment, excellent faculty and honest guidance from the management.</p><div class="who"><img data-img="t3" data-label="Parent 2" src="${P.avatar('#6b2150', '#c0529a')}" alt=""><span><b data-e>Rajesh Gupta</b><small data-e>Parent of Class 10 student</small></span></div></div>
    </div>
  </div>
</section>

<section class="sec" id="faq" style="padding-top:0" data-section="FAQ">
  <div class="wrap">
    <div class="head rv"><span class="kicker" data-e>FAQ</span><h2 data-e>Questions we <em>often hear</em></h2></div>
    <div class="faqbox" data-list>
      <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>What is the batch size?</div><div class="acc-b" data-acc-body data-e>We keep batches to a maximum of 25 students so every child gets individual attention.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Are scholarships available?</div><div class="acc-b" data-acc-body data-e>Yes. Merit scholarships up to 50% are offered based on our admission test and previous results.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Do you provide study material?</div><div class="acc-b" data-acc-body data-e>Complete printed notes, practice sheets and online recordings are included in the fee.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Can I attend a demo class first?</div><div class="acc-b" data-acc-body data-e>Absolutely. Book a free demo class and experience our teaching before you decide.</div></div>
    </div>
  </div>
</section>

<section class="cta" data-section="Final call to action">
  <div class="wrap"><div class="box rv"><h2 data-e>Give your child the advantage they deserve</h2><p data-e>Seats fill up fast every year. Book a free counselling session today.</p><a class="btn gold" data-cta="enroll" data-e>Enroll Now →</a></div></div>
</section>
</main>
<footer data-section="Footer" data-fixed>
  <div class="wrap">
    <div class="fg">
      <div><h4 data-e>Your Institute</h4><p data-e>Helping students achieve their best since 2010. Admissions open for the new academic session.</p></div>
      <div><h4 data-e>Contact</h4><p data-e>📍 123, Main Road, Your City – 000000</p><p><a data-cta="call" data-e>📞 +91 98765 43210</a></p><p><a data-cta="whatsapp" data-e>💬 Chat on WhatsApp</a></p></div>
      <div><h4 data-e>Timings</h4><p data-e>Mon – Sat: 8:00 AM – 7:00 PM</p><p data-e>Sunday: Doubt classes</p></div>
    </div>
    <div class="copy"><span data-e>© 2025 Your Institute. All rights reserved.</span><span data-e>Privacy Policy · Terms</span></div>
  </div>
</footer>
</body>
</html>`
  });
})();
