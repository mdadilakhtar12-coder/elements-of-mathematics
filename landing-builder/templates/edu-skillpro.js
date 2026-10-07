/* Template 5 — SKILLPRO: clean modern online-course / career-skills sales page (emerald, bento) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'edu-skillpro',
    category: 'education',
    name: 'SkillPro',
    tagline: 'Clean & modern online-course sales page',
    best: 'Online course · Skill training · Career bootcamp · Certification',
    colors: [
      { v: '--accent', l: 'Main (emerald)', d: '#0ea371' },
      { v: '--accent2', l: 'Secondary (indigo)', d: '#4f46e5' }
    ],
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Master In-Demand Skills — Online Course</title>
<meta name="description" content="Job-ready online course with live mentorship, real projects and certification.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--accent:#0ea371;--accent2:#4f46e5;--ink:#0b1220;--mut:#5d6578;--line:#e6e9f0;--bg:#f6f8fb;--card:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Inter',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Manrope',system-ui,sans-serif;letter-spacing:-.03em;line-height:1.1;font-weight:800}
em{font-style:normal;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
.wrap{width:min(1140px,100% - 40px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 30px;border-radius:14px;font-family:'Manrope';font-weight:800;font-size:16px;background:var(--ink);color:#fff;transition:.2s;border:0;cursor:pointer}
.btn:hover{transform:translateY(-2px);box-shadow:0 18px 36px -16px rgba(11,18,32,.6)}
.btn.g{background:var(--accent);box-shadow:0 16px 34px -14px var(--accent)}
.btn.l{background:#fff;color:var(--ink);border:1.5px solid var(--line)}
header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:70px;gap:20px}
.brand{display:flex;align-items:center;gap:11px;font-family:'Manrope';font-weight:800;font-size:20px;letter-spacing:-.02em}
.brand img{width:36px;height:36px;border-radius:10px;object-fit:cover}
.links{display:flex;gap:30px;font-weight:600;font-size:14.5px;color:var(--mut)}.links a:hover{color:var(--ink)}
.nav .btn{padding:11px 22px;font-size:14.5px;border-radius:11px}
.hero{padding:70px 0 40px;text-align:center;background:radial-gradient(900px 420px at 50% -10%,rgba(14,163,113,.14),transparent 70%),radial-gradient(700px 360px at 90% 10%,rgba(79,70,229,.1),transparent 70%)}
.pill{display:inline-flex;align-items:center;gap:10px;padding:7px 16px 7px 8px;border-radius:99px;border:1px solid var(--line);background:#fff;font-weight:600;font-size:13.5px;box-shadow:0 6px 18px -10px rgba(11,18,32,.3)}
.pill b{background:var(--accent);color:#fff;border-radius:99px;padding:2px 11px;font-size:12px}
.hero h1{font-size:clamp(38px,6.2vw,74px);max-width:920px;margin:24px auto 20px}
.hero p.lead{max-width:640px;margin:0 auto 32px;color:var(--mut);font-size:19px}
.cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.proof{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;margin:30px 0 50px;color:var(--mut);font-size:14.5px;font-weight:500}
.proof span{display:inline-flex;align-items:center;gap:8px}.proof b{color:var(--ink)}
.stars{color:#f5a623;letter-spacing:2px}
.vid{max-width:960px;margin:0 auto;border-radius:26px;overflow:hidden;box-shadow:0 50px 100px -40px rgba(11,18,32,.55),0 0 0 8px rgba(255,255,255,.7),0 0 0 9px var(--line)}
.logos{padding:56px 0 20px;text-align:center}
.logos p{font-size:13px;color:var(--mut);letter-spacing:.14em;text-transform:uppercase;font-weight:600;margin-bottom:22px}
.lg{display:flex;gap:44px;justify-content:center;flex-wrap:wrap;font-family:'Manrope';font-weight:800;font-size:22px;color:#a7aebf}
.sec{padding:96px 0}
.head{max-width:700px;margin:0 auto 52px;text-align:center}
.head .k{font-weight:700;color:var(--accent);font-size:13.5px;letter-spacing:.14em;text-transform:uppercase}
.head h2{font-size:clamp(32px,4.6vw,52px);margin:12px 0 14px}.head p{color:var(--mut);font-size:18px}
.bento{display:grid;grid-template-columns:repeat(6,1fr);gap:18px}
.bx{background:var(--bg);border:1px solid var(--line);border-radius:26px;padding:32px;position:relative;overflow:hidden;transition:.3s}
.bx:hover{transform:translateY(-5px);box-shadow:0 30px 60px -34px rgba(11,18,32,.45)}
.bx.s2{grid-column:span 2}.bx.s3{grid-column:span 3}.bx.s4{grid-column:span 4}
.bx.dark{background:var(--ink);color:#fff;border-color:var(--ink)}.bx.dark p{color:#aab2c8}
.bx.gr{background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 60%,#000));color:#fff;border:0}.bx.gr p{color:rgba(255,255,255,.85)}
.bx.in{background:linear-gradient(135deg,var(--accent2),color-mix(in srgb,var(--accent2) 60%,#000));color:#fff;border:0}.bx.in p{color:rgba(255,255,255,.85)}
.bx .i{width:50px;height:50px;border-radius:15px;background:#fff;display:grid;place-items:center;font-size:25px;margin-bottom:20px;box-shadow:0 8px 20px -10px rgba(0,0,0,.35)}
.bx h3{font-size:22px;margin-bottom:8px}.bx p{color:var(--mut);font-size:15.5px}
.bx .big{font-family:'Manrope';font-weight:800;font-size:64px;line-height:1;letter-spacing:-.04em;margin-bottom:6px}
.cur{background:var(--bg)}
.cg{display:grid;grid-template-columns:.8fr 1.2fr;gap:56px;align-items:start}
.cg .sticky{position:sticky;top:110px}
.cg h2{font-size:clamp(32px,4.2vw,48px);margin:12px 0 16px}.cg p{color:var(--mut);font-size:17.5px;margin-bottom:26px}
.mods{display:grid;gap:12px}
.mod{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}
.mod-h{display:flex;align-items:center;gap:16px;padding:20px 22px;cursor:pointer}
.mod-h .n{flex:none;width:42px;height:42px;border-radius:12px;background:#e7f7f0;color:var(--accent);font-family:'Manrope';font-weight:800;display:grid;place-items:center}
.mod-h b{flex:1;font-family:'Manrope';font-size:17.5px}.mod-h small{color:var(--mut);font-weight:500}
.mod-h::after{content:"+";font-size:24px;color:var(--mut);transition:transform .25s}
.mod.open .mod-h::after{transform:rotate(45deg)}.mod.open{border-color:var(--accent)}
.mod-b{display:none;padding:0 22px 22px 80px;color:var(--mut);font-size:15.5px}.mod.open .mod-b{display:block}
.mod-b ul{list-style:none;display:grid;gap:7px}.mod-b li::before{content:"✓";color:var(--accent);font-weight:800;margin-right:10px}
.ins{display:grid;grid-template-columns:.85fr 1.15fr;gap:60px;align-items:center}
.ins .ph{border-radius:30px;overflow:hidden;aspect-ratio:1/1.08;background:linear-gradient(135deg,var(--accent),var(--accent2));position:relative}
.ins .ph img{width:100%;height:100%;object-fit:cover}
.ins h2{font-size:clamp(30px,4vw,46px);margin:12px 0 16px}.ins p{color:var(--mut);font-size:17px;margin-bottom:22px}
.chips{display:flex;flex-wrap:wrap;gap:10px}.chips span{padding:9px 16px;border:1px solid var(--line);border-radius:99px;background:var(--bg);font-weight:600;font-size:14px}
.price{background:var(--ink);color:#fff;position:relative;overflow:hidden}
.price::before{content:"";position:absolute;width:600px;height:600px;border-radius:50%;background:var(--accent);filter:blur(140px);opacity:.28;left:-160px;top:-160px}
.price .head h2{color:#fff}.price .head p{color:#aab2c8}
.pcard{position:relative;max-width:820px;margin:0 auto;background:#fff;color:var(--ink);border-radius:32px;display:grid;grid-template-columns:1.1fr .9fr;overflow:hidden;box-shadow:0 60px 120px -40px rgba(0,0,0,.7)}
.pcard .l{padding:44px 40px}.pcard .r{background:linear-gradient(160deg,var(--accent),color-mix(in srgb,var(--accent2) 80%,#000));color:#fff;padding:44px 36px;display:flex;flex-direction:column;justify-content:center;text-align:center}
.pcard h3{font-size:26px;margin-bottom:16px}
.pcard ul{list-style:none;display:grid;gap:12px;font-weight:500;font-size:15.5px}.pcard li::before{content:"✓";color:var(--accent);font-weight:800;margin-right:12px}
.pcard .old{text-decoration:line-through;opacity:.7;font-size:20px;font-weight:600}
.pcard .now{font-family:'Manrope';font-size:62px;font-weight:800;letter-spacing:-.04em;line-height:1.1;margin:4px 0}
.pcard .save{display:inline-block;background:rgba(255,255,255,.2);border-radius:99px;padding:5px 16px;font-weight:700;font-size:13.5px;margin-bottom:22px;align-self:center}
.pcard .btn{background:#fff;color:var(--ink);width:100%}
.pcard small{display:block;margin-top:14px;opacity:.85;font-size:13px}
.mas{columns:3;column-gap:18px}
.rv2{break-inside:avoid;background:var(--bg);border:1px solid var(--line);border-radius:22px;padding:26px;margin-bottom:18px}
.rv2 p{margin:10px 0 18px;font-size:15.5px}
.who{display:flex;gap:12px;align-items:center}.who img{width:44px;height:44px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15px}.who small{color:var(--mut)}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}
.acc{border:1px solid var(--line);border-radius:16px;background:#fff}
.acc-h{display:flex;justify-content:space-between;gap:14px;padding:20px 24px;font-family:'Manrope';font-weight:700;font-size:17px;cursor:pointer}
.acc-h::after{content:"+";color:var(--accent);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}
.acc-b{display:none;padding:0 24px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.fin{padding:0 0 90px}
.fin .box{background:linear-gradient(135deg,var(--accent2),color-mix(in srgb,var(--accent2) 55%,#000));border-radius:34px;color:#fff;text-align:center;padding:76px 28px;position:relative;overflow:hidden}
.fin .box::after{content:"";position:absolute;right:-90px;top:-90px;width:320px;height:320px;border-radius:50%;background:var(--accent);opacity:.35;filter:blur(60px)}
.fin h2{font-size:clamp(32px,4.6vw,56px);max-width:760px;margin:0 auto 14px;position:relative}.fin p{opacity:.9;font-size:18px;margin-bottom:30px;position:relative}
.fin .btn{background:#fff;color:var(--ink);position:relative}
footer{border-top:1px solid var(--line);padding:34px 0;color:var(--mut);font-size:14px}
.ft{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.sticky-bar{display:none}
@media(max-width:900px){.links{display:none}.bento{grid-template-columns:1fr 1fr}.bx.s2,.bx.s3,.bx.s4{grid-column:span 2}.cg,.ins,.pcard{grid-template-columns:1fr}.cg .sticky{position:static}.mas{columns:1}.pcard .l,.pcard .r{padding:34px 26px}.sec{padding:70px 0}}
@media(max-width:560px){.btn{width:100%}.nav .btn{width:auto}.bento{grid-template-columns:1fr}.bx.s2,.bx.s3,.bx.s4{grid-column:span 1}.mod-b{padding-left:22px}.lg{gap:24px;font-size:18px}
.sticky-bar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;background:#fff;border-top:1px solid var(--line);padding:10px 14px;gap:12px;align-items:center;box-shadow:0 -10px 30px rgba(0,0,0,.08)}
.sticky-bar div{flex:1;line-height:1.2}.sticky-bar b{font-family:'Manrope';font-size:18px}.sticky-bar small{display:block;color:var(--mut);font-size:12px}.sticky-bar .btn{width:auto;padding:12px 20px;font-size:14.5px}
body{padding-bottom:70px}.lb-float{bottom:84px!important}}
</style>
</head>
<body>
<header data-section="Header" data-fixed>
  <div class="wrap nav">
    <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#0ea371', '#4f46e5', 'S')}" alt="Logo"><span data-e>SkillPro</span></a>
    <nav class="links"><a href="#features" data-e>Why SkillPro</a><a href="#curriculum" data-e>Curriculum</a><a href="#mentor" data-e>Mentor</a><a href="#pricing" data-e>Pricing</a><a href="#faq" data-e>FAQ</a></nav>
    <a class="btn g" data-cta="enroll" data-e>Join Now</a>
  </div>
</header>
<main id="top">
<section class="hero" data-section="Hero">
  <div class="wrap">
    <span class="pill rv"><b data-e>NEW</b><span data-e>Cohort 12 starts on 1st of next month</span></span>
    <h1 class="rv" data-e>Learn a skill that gets you <em>hired</em> — in 12 weeks</h1>
    <p class="lead rv" data-e>Live mentor-led classes, real industry projects and a certificate employers trust. Built for beginners, designed for results.</p>
    <div class="cta-row rv"><a class="btn g" data-cta="enroll" data-e>Enroll Now →</a><a class="btn l" href="#curriculum" data-e>View curriculum</a></div>
    <div class="proof rv"><span><span class="stars">★★★★★</span> <b data-e>4.9</b> <span data-e>from 3,200+ learners</span></span><span data-e>✅ 7-day money-back guarantee</span><span data-e>🎓 Certificate included</span></div>
    <div class="vid rv"><div data-video data-label="Course trailer" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div>
  </div>
</section>

<section class="logos" data-section="Hiring partners"><div class="wrap"><p data-e>Our learners work at</p><div class="lg" data-list><span data-e>Google</span><span data-e>Amazon</span><span data-e>Infosys</span><span data-e>Flipkart</span><span data-e>Wipro</span><span data-e>Zomato</span></div></div></section>

<section class="sec" id="features" data-section="Why this course">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Why SkillPro</span><h2 data-e>Everything to go from <em>zero to job-ready</em></h2><p data-e>Not just videos — a complete system built around your success.</p></div>
    <div class="bento" data-list>
      <div class="bx s4 dark rv"><div class="i">🎥</div><h3 data-e>Live classes with expert mentors</h3><p data-e>Attend interactive sessions 4 days a week, ask doubts in real time and never feel stuck. Every class is recorded for revision.</p></div>
      <div class="bx s2 gr rv"><div class="big" data-e>12</div><h3 data-e>Weeks to job-ready</h3><p data-e>A focused, step-by-step roadmap.</p></div>
      <div class="bx s2 rv"><div class="i" style="background:#e7f7f0">🛠️</div><h3 data-e>8 real projects</h3><p data-e>Build a portfolio recruiters actually want to see.</p></div>
      <div class="bx s2 in rv"><div class="big" data-e>1:1</div><h3 data-e>Career mentoring</h3><p data-e>Resume, mock interviews and LinkedIn makeover.</p></div>
      <div class="bx s2 rv"><div class="i" style="background:#eceafd">💼</div><h3 data-e>Placement support</h3><p data-e>Job referrals and interview opportunities with 200+ hiring partners.</p></div>
      <div class="bx s3 rv"><div class="i" style="background:#fff3dc">📱</div><h3 data-e>Lifetime access</h3><p data-e>Recordings, notes and all future updates on mobile and laptop — forever.</p></div>
      <div class="bx s3 rv"><div class="i" style="background:#ffe9ee">👥</div><h3 data-e>Community of 10,000+</h3><p data-e>Join a private community for doubts, networking and accountability.</p></div>
    </div>
  </div>
</section>

<section class="sec cur" id="curriculum" data-section="Curriculum">
  <div class="wrap cg">
    <div class="sticky rv"><span class="k head" style="margin:0;text-align:left;color:var(--accent);font-weight:700;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase" data-e>The curriculum</span><h2 data-e>A clear path, <em>week by week</em></h2><p data-e>Each module ends with a hands-on project and a mentor review, so you learn by doing.</p><a class="btn g" data-cta="enroll" data-e>Reserve my seat →</a></div>
    <div class="mods" data-list>
      <div class="mod rv" data-acc data-acc-open><div class="mod-h" data-acc-head><span class="n">01</span><b data-e>Foundations</b><small data-e>Weeks 1–2</small></div><div class="mod-b" data-acc-body><ul data-list><li data-e>Core concepts &amp; tools setup</li><li data-e>Hands-on mini project</li><li data-e>Weekly live doubt session</li></ul></div></div>
      <div class="mod rv" data-acc><div class="mod-h" data-acc-head><span class="n">02</span><b data-e>Core skills</b><small data-e>Weeks 3–5</small></div><div class="mod-b" data-acc-body><ul data-list><li data-e>Practical techniques used in industry</li><li data-e>Guided project with mentor feedback</li><li data-e>Assignments &amp; quizzes</li></ul></div></div>
      <div class="mod rv" data-acc><div class="mod-h" data-acc-head><span class="n">03</span><b data-e>Advanced practice</b><small data-e>Weeks 6–8</small></div><div class="mod-b" data-acc-body><ul data-list><li data-e>Real-world case studies</li><li data-e>Team project</li><li data-e>Performance review</li></ul></div></div>
      <div class="mod rv" data-acc><div class="mod-h" data-acc-head><span class="n">04</span><b data-e>Capstone &amp; portfolio</b><small data-e>Weeks 9–10</small></div><div class="mod-b" data-acc-body><ul data-list><li data-e>Build your flagship project</li><li data-e>Portfolio &amp; GitHub/Behance polish</li><li data-e>Final presentation</li></ul></div></div>
      <div class="mod rv" data-acc><div class="mod-h" data-acc-head><span class="n">05</span><b data-e>Career launch</b><small data-e>Weeks 11–12</small></div><div class="mod-b" data-acc-body><ul data-list><li data-e>Resume &amp; LinkedIn makeover</li><li data-e>Mock interviews</li><li data-e>Job referrals &amp; placement support</li></ul></div></div>
    </div>
  </div>
</section>

<section class="sec" id="mentor" data-section="Mentor">
  <div class="wrap ins">
    <div class="ph rv"><img data-img="mentor" data-label="Mentor photo" src="${P.person('#0ea371', '#4f46e5')}" alt="Mentor"></div>
    <div class="rv"><span class="k" style="color:var(--accent);font-weight:700;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase" data-e>Your mentor</span><h2 data-e>Learn from <em>Ananya Mehra</em></h2><p data-e>Senior professional with 10+ years at top product companies. She has trained 5,000+ learners and helped hundreds land their first job in the industry.</p><div class="chips" data-list><span data-e>10+ yrs experience</span><span data-e>5,000+ learners trained</span><span data-e>Ex-product company</span><span data-e>Industry speaker</span></div></div>
  </div>
</section>

<section class="sec price" id="pricing" data-section="Pricing">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Simple pricing</span><h2 data-e>One price. <em>Everything included.</em></h2><p data-e>No hidden fees. 7-day no-questions-asked refund.</p></div>
    <div class="pcard rv">
      <div class="l"><h3 data-e>What you get</h3><ul data-list><li data-e>12 weeks of live mentor-led classes</li><li data-e>8 real-world projects</li><li data-e>1:1 career mentoring</li><li data-e>Certificate of completion</li><li data-e>Placement support &amp; referrals</li><li data-e>Lifetime access to recordings</li></ul></div>
      <div class="r"><span class="old" data-e>₹24,999</span><div class="now" data-e>₹9,999</div><span class="save" data-e>Save 60% · limited time</span><a class="btn" data-cta="enroll" data-e>Enroll Now →</a><small data-e>Pay in 3 easy EMIs · No cost EMI available</small></div>
    </div>
  </div>
</section>

<section class="sec" data-section="Learner reviews">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>Loved by learners</span><h2 data-e>Real people. <em>Real results.</em></h2></div>
    <div class="mas" data-list>
      <div class="rv2 rv"><div class="stars">★★★★★</div><p data-e>"I switched from a non-tech background and got my first job offer within 2 months of finishing. The projects gave me real confidence."</p><div class="who"><img data-img="u1" data-label="Learner 1" src="${P.avatar('#0ea371', '#4f46e5')}" alt=""><span><b data-e>Rahul Desai</b><small data-e>Now at a leading startup</small></span></div></div>
      <div class="rv2 rv"><div class="stars">★★★★★</div><p data-e>"Mentors are super responsive. Every doubt got solved the same day."</p><div class="who"><img data-img="u2" data-label="Learner 2" src="${P.avatar('#f59e0b', '#ef4444')}" alt=""><span><b data-e>Simran Kaur</b><small data-e>College student</small></span></div></div>
      <div class="rv2 rv"><div class="stars">★★★★★</div><p data-e>"Worth every rupee. The structure and accountability kept me consistent for the full 12 weeks. My salary jumped 80% after switching roles."</p><div class="who"><img data-img="u3" data-label="Learner 3" src="${P.avatar('#6366f1', '#ec4899')}" alt=""><span><b data-e>Karthik Raman</b><small data-e>Working professional</small></span></div></div>
      <div class="rv2 rv"><div class="stars">★★★★★</div><p data-e>"Clear, practical and zero fluff. Highly recommended to anyone starting out."</p><div class="who"><img data-img="u4" data-label="Learner 4" src="${P.avatar('#14b8a6', '#0ea371')}" alt=""><span><b data-e>Pooja Nair</b><small data-e>Freelancer</small></span></div></div>
    </div>
  </div>
</section>

<section class="sec" id="faq" style="padding-top:0" data-section="FAQ">
  <div class="wrap">
    <div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Questions? <em>Answered.</em></h2></div>
    <div class="faqbox" data-list>
      <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Do I need any prior experience?</div><div class="acc-b" data-acc-body data-e>No. The course starts from the basics and is designed for complete beginners.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>How much time do I need per week?</div><div class="acc-b" data-acc-body data-e>About 8–10 hours a week including live classes and project work.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>What if I miss a live class?</div><div class="acc-b" data-acc-body data-e>All sessions are recorded and available within a few hours in your dashboard.</div></div>
      <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Is there a refund policy?</div><div class="acc-b" data-acc-body data-e>Yes. If you are not satisfied within the first 7 days, we refund 100% — no questions asked.</div></div>
    </div>
  </div>
</section>

<section class="fin" data-section="Final call to action">
  <div class="wrap"><div class="box rv"><h2 data-e>Your future self will thank you. Start today.</h2><p data-e>Join the next cohort and build skills that last a lifetime.</p><a class="btn" data-cta="enroll" data-e>Enroll Now →</a></div></div>
</section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap ft"><span data-e>© 2025 SkillPro. All rights reserved.</span><span><a data-cta="call" data-e>📞 Call us</a> &nbsp;·&nbsp; <a data-cta="whatsapp" data-e>💬 WhatsApp</a></span></div></footer>
<div class="sticky-bar" data-section="Mobile sticky bar" data-fixed><div><b data-e>₹9,999</b><small data-e>Cohort 12 · limited seats</small></div><a class="btn g" data-cta="enroll" data-e>Enroll Now</a></div>
</body>
</html>`
  });
})();
