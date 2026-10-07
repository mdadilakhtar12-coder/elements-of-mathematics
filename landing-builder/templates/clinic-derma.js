/* Clinic 3 — DERMA: elegant skin & hair clinic (blush + deep plum, serif) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'clinic-derma',
    category: 'clinic',
    name: 'Derma',
    tagline: 'Elegant skin, hair & aesthetics clinic',
    best: 'Dermatology · Skin & hair clinic · Aesthetics · Laser · Hair transplant',
    colors: [
      { v: '--accent', l: 'Plum', d: '#7a2e5e' },
      { v: '--accent2', l: 'Rose gold', d: '#d79a86' }
    ],
    defaults: {
      enroll: { title: 'Book a skin consultation', sub: 'Tell us your concern. Our dermatologist team will confirm your slot on WhatsApp.', button: 'Book Consultation', thanks: 'Consultation requested!', extraOn: true, extraLabel: 'Concern', extraOptions: 'Acne & Scars, Pigmentation, Hair Fall, Hair Transplant, Laser Hair Removal, Anti-ageing, Skin Brightening' },
      whatsapp: { message: 'Hi! I would like to book a skin / hair consultation.' },
      countdown: { on: false }, bar: { on: true, text: 'Book Now' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Derma Clinic — Skin &amp; Hair Experts</title>
<meta name="description" content="Advanced skin, hair and aesthetic treatments by board-certified dermatologists.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Mulish:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--accent:#7a2e5e;--accent2:#d79a86;--accent-ink:#fff;--bg:#fbf4f1;--bg2:#f4e6e0;--ink:#2e1a28;--mut:#7d6a74;--line:#ecd9d3}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Mulish',system-ui,sans-serif;line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:'Marcellus',Georgia,serif;font-weight:400;line-height:1.12}
em{font-style:italic;color:var(--accent2)}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 34px;background:var(--accent);color:#fff;font-weight:600;font-size:14px;letter-spacing:.12em;text-transform:uppercase;border:1px solid var(--accent);transition:.3s;cursor:pointer;border-radius:2px}
.btn:hover{background:transparent;color:var(--accent)}
.btn.o{background:transparent;color:var(--accent)}.btn.o:hover{background:var(--accent);color:#fff}
.k{font-size:12.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent2);font-weight:700}
header{position:sticky;top:0;z-index:40;background:rgba(251,244,241,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:84px;gap:16px}
.brand{display:flex;align-items:center;gap:12px;font-family:'Marcellus';font-size:28px;color:var(--accent);letter-spacing:.02em}
.brand img{width:44px;height:44px;border-radius:50%;object-fit:cover}
.links{display:flex;gap:32px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:12px 24px;font-size:12px}
.hero{padding:60px 0 100px}
.hg{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.hero h1{font-size:clamp(44px,6vw,80px);margin:18px 0 20px;color:var(--accent)}
.hero p{font-size:18px;color:var(--mut);max-width:480px;margin-bottom:32px}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:40px}
.cr{display:flex;gap:34px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:26px}.cr b{font-family:'Marcellus';font-size:34px;color:var(--accent);display:block;line-height:1}.cr span{font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.hv{position:relative}.hv .a{aspect-ratio:4/5;border-radius:999px 999px 20px 20px;overflow:hidden;background:var(--bg2)}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;left:-30px;bottom:60px;background:#fff;padding:16px 22px;box-shadow:0 20px 40px -18px rgba(122,46,94,.4);border-radius:4px}.hv .c b{font-family:'Marcellus';font-size:22px;color:var(--accent);display:block}.hv .c span{font-size:13px;color:var(--mut)}
.strip{background:var(--accent);color:#f6e3ea;padding:22px 0}.strip .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-family:'Marcellus';font-size:21px}.strip span::before{content:"✦";color:var(--accent2);margin-right:12px;font-size:13px}
.sec{padding:100px 0}
.head{max-width:640px;margin:0 auto 56px;text-align:center}.head h2{font-size:clamp(34px,4.6vw,56px);margin:14px 0 12px;color:var(--accent)}.head p{color:var(--mut);font-size:17.5px}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.tc{background:#fff;border:1px solid var(--line);padding:36px 30px;transition:.3s;position:relative}.tc:hover{transform:translateY(-8px);box-shadow:0 30px 50px -32px rgba(122,46,94,.5);border-color:var(--accent2)}
.tc i{font-style:normal;font-size:34px;display:block;margin-bottom:14px}.tc h3{font-size:26px;color:var(--accent);margin-bottom:8px}.tc p{color:var(--mut);font-size:15.5px;margin-bottom:16px}.tc span{color:var(--accent2);font-weight:700;font-size:14.5px;letter-spacing:.04em}
.ba{background:var(--bg2)}.bg2{display:grid;grid-template-columns:1.1fr .9fr;gap:60px;align-items:center}
.bx{aspect-ratio:4/3;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(122,46,94,.5)}.bx .lbl{position:absolute;top:14px;z-index:2;background:rgba(255,255,255,.94);padding:5px 15px;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--accent)}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px}
.bg2 h2{font-size:clamp(32px,4.2vw,52px);margin:14px 0 18px;color:var(--accent)}.bg2 p{color:var(--mut);margin-bottom:16px}.note{font-size:13px;color:var(--mut);margin-bottom:24px}
.dr{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}.dc{text-align:center}.dc .p{aspect-ratio:4/5;overflow:hidden;margin-bottom:18px;border:1px solid var(--line);background:var(--bg2)}.dc .p img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.dc:hover .p img{transform:scale(1.05)}.dc h3{font-size:28px;color:var(--accent)}.dc .q{color:var(--accent2);font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase}.dc p{color:var(--mut);font-size:15px;margin-top:6px}
.pr{background:var(--accent);color:#fff}.pr .head h2{color:#fff}.pr .head p{color:#e8cfdc}.pr .k{color:var(--accent2)}
.pg{display:grid;grid-template-columns:repeat(4,1fr);gap:26px}.pp{text-align:center}.pp i{display:grid;place-items:center;width:76px;height:76px;border-radius:50%;border:1px solid var(--accent2);margin:0 auto 16px;font-family:'Marcellus';font-style:normal;font-size:28px;color:var(--accent2)}.pp h3{font-size:22px;margin-bottom:6px}.pp p{color:#e8cfdc;font-size:15px}
.vd{max-width:900px;margin:0 auto;border:8px solid #fff;box-shadow:0 40px 80px -36px rgba(122,46,94,.5)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.rc{background:#fff;border:1px solid var(--line);padding:34px 30px}.rc .st{color:var(--accent2);letter-spacing:4px;margin-bottom:10px}.rc p{font-family:'Marcellus';font-size:21px;line-height:1.45;margin-bottom:20px}
.who{display:flex;gap:12px;align-items:center}.who img{width:46px;height:46px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:15px}.who small{color:var(--mut)}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}.acc{background:#fff;border:1px solid var(--line)}.acc-h{display:flex;justify-content:space-between;gap:14px;padding:20px 26px;font-family:'Marcellus';font-size:21px;color:var(--accent);cursor:pointer}.acc-h::after{content:"+";color:var(--accent2);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}.acc-b{display:none;padding:0 26px 22px;color:var(--mut)}.acc.open .acc-b{display:block}
.ct{display:grid;grid-template-columns:1fr 1.2fr;gap:50px}.ci h2{font-size:clamp(32px,4vw,50px);margin:14px 0 24px;color:var(--accent)}.ci .r{margin-bottom:20px}.ci b{display:block;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--accent2)}.ci span{font-size:17.5px}
.map{min-height:400px;border:8px solid #fff;box-shadow:0 30px 60px -34px rgba(122,46,94,.45)}
.final{background:linear-gradient(rgba(122,46,94,.9),rgba(90,30,70,.94));color:#fff;text-align:center;padding:96px 0}.final .k{color:var(--accent2)}.final h2{font-size:clamp(34px,5.2vw,64px);max-width:780px;margin:14px auto 14px}.final p{color:#e8cfdc;max-width:520px;margin:0 auto 30px;font-size:17.5px}.final .btn{background:var(--accent2);border-color:var(--accent2);color:#2e1a28}.final .btn:hover{background:transparent;color:#fff;border-color:#fff}
footer{padding:30px 0;color:var(--mut);font-size:14px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.bg2,.ct{grid-template-columns:1fr;gap:44px}.hv .c{left:0}.tg,.dr,.rg{grid-template-columns:1fr}.pg{grid-template-columns:1fr 1fr}.sec{padding:70px 0}.nav .btn{display:none}}
@media(max-width:560px){.pg{grid-template-columns:1fr}}
</style>
</head>
<body>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#7a2e5e', '#d79a86', 'D')}" alt="Logo"><span data-e>Derma Clinic</span></a>
  <nav class="links"><a href="#treatments" data-e>Treatments</a><a href="#results" data-e>Results</a><a href="#doctors" data-e>Doctors</a><a href="#contact" data-e>Contact</a></nav>
  <a class="btn" data-cta="enroll" data-e>Book Now</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>Skin · Hair · Aesthetics</span><h1 class="rv" data-e>Healthy skin is the <em>best confidence</em></h1><p class="rv" data-e>Board-certified dermatologists, USFDA-approved technology and personalised treatment plans for visible, lasting results.</p>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Book Consultation</a><a class="btn o" data-cta="whatsapp" data-e>💬 WhatsApp</a></div>
  <div class="cr rv" data-list><div><b data-e>20,000+</b><span data-e>Patients</span></div><div><b data-e>15 yrs</b><span data-e>Experience</span></div><div><b data-e>4.9★</b><span data-e>Rating</span></div></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Hero photo" src="${P.person('#d79a86', '#7a2e5e')}" alt=""></div><div class="c"><b data-e>USFDA approved</b><span data-e>Lasers &amp; devices</span></div></div>
</div></section>
<div class="strip" data-section="Services strip"><div class="wrap" data-list><span data-e>Acne &amp; Scars</span><span data-e>Pigmentation</span><span data-e>Hair Restoration</span><span data-e>Laser</span><span data-e>Anti-ageing</span></div></div>

<section class="sec" id="treatments" data-section="Treatments">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Treatments</span><h2 data-e>Advanced care for <em>skin &amp; hair</em></h2><p data-e>Every plan begins with a detailed skin and hair analysis.</p></div>
  <div class="tg" data-list>
    <div class="tc rv"><i>✨</i><h3 data-e>Acne &amp; Scar Treatment</h3><p data-e>Medical facials, peels and laser to clear acne and fade scars.</p><span data-e>From ₹2,500 / session</span></div>
    <div class="tc rv"><i>🌞</i><h3 data-e>Pigmentation &amp; Glow</h3><p data-e>Targeted therapies for melasma, tan and uneven skin tone.</p><span data-e>From ₹3,000 / session</span></div>
    <div class="tc rv"><i>💇</i><h3 data-e>Hair Fall &amp; PRP</h3><p data-e>Diagnosis-led treatment, PRP and mesotherapy for thicker hair.</p><span data-e>From ₹4,500 / session</span></div>
    <div class="tc rv"><i>🔬</i><h3 data-e>Laser Hair Removal</h3><p data-e>Painless, long-lasting hair reduction for all skin types.</p><span data-e>From ₹1,999 / session</span></div>
    <div class="tc rv"><i>💉</i><h3 data-e>Anti-ageing</h3><p data-e>Botox, fillers and skin-boosters for a natural youthful look.</p><span data-e>Consultation based</span></div>
    <div class="tc rv"><i>🌱</i><h3 data-e>Hair Transplant</h3><p data-e>FUE / DHI transplant by experienced surgeons with natural results.</p><span data-e>From ₹35 / graft</span></div>
  </div></div>
</section>

<section class="sec ba" id="results" data-section="Before & After">
  <div class="wrap bg2"><div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#c9a99b', '#8a6a5e', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#f4e6e0', '#d79a86', 900, 675)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After</span></div>
  <div class="rv"><span class="k" data-e>Real results</span><h2 data-e>See the <em>difference</em></h2><p data-e>Slide to compare. Results are shown with patient consent and may vary by skin type and condition.</p><div class="note" data-e>Results vary. Treatment plans are personalised after consultation.</div><a class="btn" data-cta="enroll" data-e>Get My Skin Analysis</a></div></div>
</section>

<section class="sec" id="doctors" data-section="Doctors">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Our doctors</span><h2 data-e>Meet your <em>specialists</em></h2></div>
  <div class="dr" data-list>
    <div class="dc rv"><div class="p"><img data-img="d1" data-label="Doctor 1" src="${P.person('#7a2e5e', '#d79a86')}" alt=""></div><h3 data-e>Dr. Aditi Kapoor</h3><div class="q" data-e>MD Dermatology</div><p data-e>Skin &amp; laser specialist · 15 yrs</p></div>
    <div class="dc rv"><div class="p"><img data-img="d2" data-label="Doctor 2" src="${P.person('#d79a86', '#4a1f3a')}" alt=""></div><h3 data-e>Dr. Rohan Mehta</h3><div class="q" data-e>Hair Transplant Surgeon</div><p data-e>FUE / DHI expert · 12 yrs</p></div>
    <div class="dc rv"><div class="p"><img data-img="d3" data-label="Doctor 3" src="${P.person('#4a1f3a', '#d79a86')}" alt=""></div><h3 data-e>Dr. Sana Qureshi</h3><div class="q" data-e>Cosmetologist</div><p data-e>Aesthetics &amp; anti-ageing · 10 yrs</p></div>
  </div></div>
</section>

<section class="sec pr" data-section="How it works">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Your journey</span><h2 data-e>Simple, <em style="color:#d79a86">personalised</em> care</h2></div>
  <div class="pg" data-list><div class="pp rv"><i>1</i><h3 data-e>Consult</h3><p data-e>Detailed skin &amp; hair analysis with a dermatologist.</p></div><div class="pp rv"><i>2</i><h3 data-e>Plan</h3><p data-e>A clear, personalised plan with transparent pricing.</p></div><div class="pp rv"><i>3</i><h3 data-e>Treat</h3><p data-e>Safe, comfortable treatments with advanced devices.</p></div><div class="pp rv"><i>4</i><h3 data-e>Follow-up</h3><p data-e>Regular reviews to ensure lasting results.</p></div></div></div>
</section>

<section class="sec" data-section="Clinic video"><div class="wrap"><div class="head rv"><span class="k" data-e>Inside the clinic</span><h2 data-e>Experience <em>Derma</em></h2></div><div class="vd rv"><div data-video data-label="Clinic video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div></section>

<section class="sec" style="padding-top:0" data-section="Patient reviews">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Patient stories</span><h2 data-e>Glowing <em>reviews</em></h2></div>
  <div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My acne scars faded dramatically in 4 sessions. Dr. Aditi is honest and truly caring."</p><div class="who"><img data-img="u1" data-label="Patient 1" src="${P.avatar('#7a2e5e', '#d79a86')}" alt=""><span><b data-e>Tanya Sharma</b><small data-e>Acne scar treatment</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Got my hair transplant here. Natural hairline and the team was fantastic throughout."</p><div class="who"><img data-img="u2" data-label="Patient 2" src="${P.avatar('#d79a86', '#4a1f3a')}" alt=""><span><b data-e>Vishal Rathi</b><small data-e>Hair transplant</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Spotless clinic, no hidden charges and visible glow. Highly recommend for pigmentation."</p><div class="who"><img data-img="u3" data-label="Patient 3" src="${P.avatar('#4a1f3a', '#7a2e5e')}" alt=""><span><b data-e>Meghna Das</b><small data-e>Pigmentation care</small></span></div></div>
  </div></div>
</section>

<section class="sec" style="padding-top:0" data-section="FAQ"><div class="wrap"><div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Your <em>questions</em></h2></div>
  <div class="faqbox" data-list>
    <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Are the treatments safe?</div><div class="acc-b" data-acc-body data-e>Yes. All procedures are done by qualified dermatologists with USFDA-approved devices after a proper assessment.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>How many sessions will I need?</div><div class="acc-b" data-acc-body data-e>It depends on your concern and skin type. You get a clear plan and cost after the first consultation.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Is there any downtime?</div><div class="acc-b" data-acc-body data-e>Most treatments have little to no downtime. We explain aftercare for every procedure.</div></div>
  </div></div></section>

<section class="sec" id="contact" style="padding-top:0" data-section="Contact">
  <div class="wrap ct"><div class="ci rv"><span class="k" data-e>Visit us</span><h2 data-e>Book your <em>consultation</em></h2><div class="r"><b data-e>Clinic</b><span data-e>Derma Clinic, 2nd Floor, Luxe Plaza, Your City</span></div><div class="r"><b data-e>Timings</b><span data-e>Mon – Sat · 10:00 AM – 8:00 PM</span></div><div class="r"><b data-e>Call</b><span><a data-cta="call" data-e>+91 98765 43210</a></span></div><a class="btn" data-cta="enroll" data-e>Book Consultation</a></div>
  <div class="map rv" data-map data-label="Clinic location" data-q="Banjara Hills, Hyderabad"></div></div>
</section>
<section class="final" data-section="Final call to action"><div class="wrap"><span class="k rv" data-e>Begin today</span><h2 class="rv" data-e>Your best skin is <em>one visit away</em></h2><p class="rv" data-e>Book a consultation and receive a personalised treatment plan.</p><a class="btn rv" data-cta="enroll" data-e>Book Consultation</a></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 Derma Clinic. Individual results may vary.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
