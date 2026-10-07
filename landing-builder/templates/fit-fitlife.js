/* Fitness 4 — FITLIFE: weight-loss / online coaching with free webinar funnel (fresh green + white) */
(function () {
  var P = LB.ph;
  LB.register({
    id: 'fit-fitlife',
    category: 'fitness',
    name: 'FitLife Coach',
    tagline: 'Weight-loss coaching with free webinar funnel',
    best: 'Online fitness coach · Weight loss · Diet programme · Free webinar',
    colors: [
      { v: '--accent', l: 'Fresh green', d: '#16a34a' },
      { v: '--accent2', l: 'Sunny yellow', d: '#fbbf24' }
    ],
    defaults: {
      enroll: { mode: 'form', title: 'Reserve your free seat', sub: 'Register for the free weight-loss masterclass. You will get the joining link right after.', button: 'Reserve My Free Seat', thanks: 'Seat reserved! Taking you to the session…', extraOn: false, extraLabel: 'Your goal', extraOptions: 'Lose weight, Gain muscle, PCOS / Thyroid, Stay fit' },
      whatsapp: { message: 'Hi! I want to join the free weight-loss masterclass.' },
      countdown: { on: true, date: '' }, bar: { on: true, text: 'Reserve Seat' }
    },
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FitLife Coach — Free Weight-Loss Masterclass</title>
<meta name="description" content="Join the free live masterclass and learn the simple system to lose weight naturally without crash diets.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--accent:#16a34a;--accent2:#fbbf24;--accent-ink:#fff;--dark:#0f2a1a;--bg:#f2fbf5;--ink:#10231a;--mut:#58705f;--line:#d9ecdf}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:#fff;color:var(--ink);font-family:'Urbanist',system-ui,sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-size:17.5px}
img{max-width:100%;display:block}a{color:inherit;text-decoration:none}
h1,h2,h3{font-weight:800;letter-spacing:-.03em;line-height:1.08}
em{font-style:normal;position:relative;z-index:0;white-space:nowrap}em::after{content:"";position:absolute;left:-2%;right:-2%;bottom:.04em;height:.34em;background:var(--accent2);border-radius:99px;z-index:-1}
h1,h2{position:relative;z-index:0}
.wrap{width:min(1180px,100% - 44px);margin:0 auto}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:17px 34px;background:var(--accent);color:#fff;font-weight:700;font-size:17px;border-radius:99px;border:0;transition:.2s;cursor:pointer;box-shadow:0 16px 32px -14px var(--accent);font-family:'Urbanist'}
.btn:hover{transform:translateY(-3px)}
.btn.y{background:var(--accent2);color:#2a1d00;box-shadow:0 16px 32px -14px var(--accent2)}
.btn.o{background:#fff;color:var(--accent);box-shadow:inset 0 0 0 2px var(--accent)}.btn.o:hover{background:var(--accent);color:#fff}
.k{display:inline-block;background:#dff5e6;color:var(--accent);font-weight:700;font-size:14px;padding:6px 16px;border-radius:99px}
.live{background:var(--dark);color:#fff;font-weight:600;font-size:14.5px;padding:9px 0}.live .wrap{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;align-items:center;text-align:center}.live i{width:9px;height:9px;border-radius:50%;background:#ef4444;display:inline-block;margin-right:8px;box-shadow:0 0 0 4px rgba(239,68,68,.3);animation:bl 1.4s infinite}@keyframes bl{50%{opacity:.4}}
header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:24px;letter-spacing:-.03em;color:var(--dark)}
.brand img{width:42px;height:42px;border-radius:12px;object-fit:cover}
.links{display:flex;gap:28px;font-weight:600;font-size:15.5px;color:var(--mut)}.links a:hover{color:var(--accent)}
.nav .btn{padding:11px 24px;font-size:15px;box-shadow:none}
.hero{background:linear-gradient(180deg,var(--bg),#fff);padding:60px 0 70px;overflow:hidden}
.hg{display:grid;grid-template-columns:1.1fr .9fr;gap:50px;align-items:center}
.hero h1{font-size:clamp(40px,5.8vw,76px);margin:18px 0 18px}
.hero p{color:var(--mut);font-size:20px;max-width:520px;margin-bottom:26px;font-weight:500}
.ev{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:24px;font-weight:700;font-size:16px}.ev span{display:inline-flex;gap:8px;align-items:center}
.cd{display:flex;gap:12px;margin-bottom:28px}.cd div{min-width:78px;padding:12px 8px;text-align:center;background:#fff;border:2px solid var(--line);border-radius:16px}.cd b{display:block;font-size:34px;line-height:1;color:var(--accent)}.cd span{font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);font-weight:700}
.cta-row{display:flex;gap:14px;flex-wrap:wrap}
.hv{position:relative;max-width:500px;margin:0 auto}.hv .a{aspect-ratio:1/1.08;border-radius:46% 54% 42% 58% / 46% 40% 60% 54%;overflow:hidden;background:var(--accent);box-shadow:16px 16px 0 var(--accent2)}.hv .a img{width:100%;height:100%;object-fit:cover}
.hv .c{position:absolute;background:#fff;border-radius:18px;padding:12px 18px;box-shadow:0 20px 40px -16px rgba(15,42,26,.4);font-weight:700;font-size:15px;display:flex;gap:10px;align-items:center}.hv .c.a1{left:-22px;top:56px}.hv .c.a2{right:-8px;bottom:46px}
.nm{background:var(--accent);color:#fff}.ng{display:grid;grid-template-columns:repeat(4,1fr)}.ng div{padding:28px 20px;text-align:center;border-right:1px solid rgba(255,255,255,.2)}.ng div:last-child{border:0}.ng b{font-size:40px;display:block;line-height:1.1;letter-spacing:-.04em}.ng span{font-size:14.5px;color:#d8f5e0;font-weight:600}
.sec{padding:96px 0}
.head{max-width:680px;margin:0 auto 50px;text-align:center}.head h2{font-size:clamp(34px,4.8vw,56px);margin:14px 0 12px;color:var(--dark)}.head p{color:var(--mut);font-size:19px;font-weight:500}
.lg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.lc{border:2px solid var(--line);border-radius:26px;padding:34px 28px;transition:.3s;background:#fff}.lc:hover{border-color:var(--accent);transform:translateY(-8px);box-shadow:0 30px 50px -34px var(--accent)}
.lc i{font-style:normal;width:62px;height:62px;border-radius:18px;background:var(--bg);display:grid;place-items:center;font-size:30px;margin-bottom:16px}.lc h3{font-size:25px;margin-bottom:8px;color:var(--dark)}.lc p{color:var(--mut);font-size:16px;font-weight:500}
.co{background:var(--bg)}.cg{display:grid;grid-template-columns:.9fr 1.1fr;gap:60px;align-items:center}
.cg .im{aspect-ratio:4/5;border-radius:32px;overflow:hidden;background:linear-gradient(160deg,var(--accent),#0d6b30);box-shadow:16px 16px 0 var(--accent2)}.cg .im img{width:100%;height:100%;object-fit:cover}
.cg h2{font-size:clamp(34px,4.4vw,54px);margin:14px 0 18px;color:var(--dark)}.cg p{color:var(--mut);margin-bottom:16px;font-weight:500}
.ch{list-style:none;display:grid;gap:11px;margin:20px 0 26px;font-weight:600}.ch li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}
.bs{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.bx{aspect-ratio:4/3;border-radius:28px;border:8px solid #fff;box-shadow:0 30px 60px -30px rgba(15,42,26,.5)}.bx .lbl{position:absolute;top:14px;z-index:2;background:var(--accent2);color:#2a1d00;padding:5px 15px;border-radius:99px;font-size:13px;font-weight:800}.bx .lbl.l{left:14px}.bx .lbl.r{right:14px;background:var(--accent);color:#fff}
.bs h2{font-size:clamp(34px,4.4vw,54px);margin:14px 0 16px;color:var(--dark)}.bs p{color:var(--mut);margin-bottom:18px;font-weight:500}
.pk{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.pc{border:2px solid var(--line);border-radius:28px;padding:38px 30px;text-align:center;position:relative;background:#fff}.pc.h{border-color:var(--accent);box-shadow:0 30px 60px -36px var(--accent)}.pc .fl{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--accent2);color:#2a1d00;padding:4px 16px;border-radius:99px;font-size:13px;font-weight:800}
.pc h3{font-size:27px;color:var(--dark)}.pc .d{color:var(--mut);font-size:15px;font-weight:500}.pc .pr{font-size:52px;font-weight:800;color:var(--accent);margin:12px 0 4px;letter-spacing:-.04em;line-height:1}.pc .pr small{font-size:16px;color:var(--mut);font-weight:600}.pc ul{list-style:none;display:grid;gap:10px;margin:20px 0 26px;color:var(--mut);font-weight:600;font-size:16px}.pc li::before{content:"✓";color:var(--accent);margin-right:10px;font-weight:800}.pc .btn{width:100%}
.vd{max-width:900px;margin:0 auto;border-radius:28px;overflow:hidden;border:8px solid var(--bg);box-shadow:0 40px 80px -36px rgba(15,42,26,.5)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.rc{background:var(--bg);border-radius:26px;padding:30px}.rc .st{color:#f5a623;letter-spacing:3px;margin-bottom:8px}.rc p{margin-bottom:18px;font-size:17px;font-weight:500}
.who{display:flex;gap:12px;align-items:center}.who img{width:48px;height:48px;border-radius:50%;object-fit:cover}.who b{display:block;font-size:16px}.who small{color:var(--mut);font-weight:500}
.faqbox{max-width:800px;margin:0 auto;display:grid;gap:12px}.acc{border:2px solid var(--line);border-radius:20px}.acc-h{display:flex;justify-content:space-between;gap:14px;padding:19px 24px;font-weight:700;font-size:18px;cursor:pointer}.acc-h::after{content:"+";color:var(--accent);font-size:26px;line-height:1;transition:transform .25s}.acc.open .acc-h::after{transform:rotate(45deg)}.acc.open{border-color:var(--accent)}.acc-b{display:none;padding:0 24px 22px;color:var(--mut);font-weight:500}.acc.open .acc-b{display:block}
.final{padding:0 0 96px}.final .box{background:linear-gradient(135deg,var(--accent),#0d6b30);border-radius:38px;color:#fff;text-align:center;padding:80px 30px}.final h2{font-size:clamp(34px,5.4vw,64px);max-width:800px;margin:0 auto 14px}.final p{color:#d8f5e0;max-width:520px;margin:0 auto 28px;font-size:19px;font-weight:500}.final .btn{background:var(--accent2);color:#2a1d00;box-shadow:none}
footer{padding:28px 0;color:var(--mut);font-size:14.5px;border-top:1px solid var(--line)}.fo{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.links{display:none}.hg,.cg,.bs{grid-template-columns:1fr;gap:40px}.hv .c.a1{left:0}.hv .c.a2{right:0}.ng{grid-template-columns:1fr 1fr}.ng div:nth-child(2){border-right:0}.lg,.pk,.rg{grid-template-columns:1fr}.sec{padding:70px 0}.nav .btn{display:none}.cd div{min-width:68px}.cd b{font-size:28px}}
@media(max-width:560px){.btn{width:100%}}
</style>
</head>
<body>
<div class="live" data-section="Webinar bar" data-fixed><div class="wrap"><span><i></i><span data-e>FREE LIVE MASTERCLASS</span></span><span data-event-date data-e>Sat, 18 Oct · 7:00 PM IST</span></div></div>
<header data-section="Header" data-fixed><div class="wrap nav">
  <a class="brand" href="#top"><img data-img="logo" data-label="Logo" src="${P.logo('#16a34a', '#fbbf24', 'F')}" alt="Logo"><span data-e>FitLife Coach</span></a>
  <nav class="links"><a href="#learn" data-e>What you'll learn</a><a href="#coach" data-e>Your coach</a><a href="#programs" data-e>Programs</a><a href="#faq" data-e>FAQ</a></nav>
  <a class="btn" data-cta="enroll" data-e>Reserve Free Seat</a>
</div></header>
<main id="top">
<section class="hero" data-section="Hero"><div class="wrap hg">
  <div><span class="k rv" data-e>🥗 100% free · No crash diets</span><h1 class="rv" data-e>Lose weight naturally in <em>90 days</em></h1><p class="rv" data-e>Join my free live masterclass and learn the simple, sustainable system 5,000+ people used to lose weight, gain energy and keep it off.</p>
  <div class="ev rv"><span>📅 <span data-event-day data-e>Sat, 18 Oct</span></span><span>🕖 <span data-event-time data-e>7:00 PM IST</span></span><span data-e>🎥 Live on Zoom</span></div>
  <div class="rv" data-countdown><div class="cd"><div><b data-cd="d">02</b><span>Days</span></div><div><b data-cd="h">14</b><span>Hours</span></div><div><b data-cd="m">36</b><span>Mins</span></div><div><b data-cd="s">09</b><span>Secs</span></div></div></div>
  <div class="cta-row rv"><a class="btn" data-cta="enroll" data-e>Reserve My Free Seat</a><a class="btn o" data-cta="whatsapp" data-e>💬 Ask a question</a></div></div>
  <div class="hv rv"><div class="a"><img data-img="hero" data-label="Coach photo" src="${P.person('#16a34a', '#0d6b30')}" alt=""></div><div class="c a1">🔥 <span data-e>5,000+ transformed</span></div><div class="c a2">⭐ <span data-e>4.9 coach rating</span></div></div>
</div></section>
<section class="nm" data-section="Trust numbers"><div class="wrap ng" data-list><div><b data-e>5,000+</b><span data-e>People coached</span></div><div><b data-e>−12 kg</b><span data-e>Avg. in 90 days</span></div><div><b data-e>10 yrs</b><span data-e>Experience</span></div><div><b data-e>4.9★</b><span data-e>Average rating</span></div></div></section>

<section class="sec" id="learn" data-section="What you'll learn">
  <div class="wrap"><div class="head rv"><span class="k" data-e>In the masterclass</span><h2 data-e>What you'll <em>discover</em></h2><p data-e>Simple, practical and based on Indian food and lifestyle.</p></div>
  <div class="lg" data-list>
    <div class="lc rv"><i>🍛</i><h3 data-e>Eat roti, lose weight</h3><p data-e>How to lose fat without giving up your favourite Indian foods.</p></div>
    <div class="lc rv"><i>🚫</i><h3 data-e>Stop crash diets</h3><p data-e>Why starving fails and what to do instead for lasting results.</p></div>
    <div class="lc rv"><i>⏱️</i><h3 data-e>30-minute workouts</h3><p data-e>Home routines that work even with a busy schedule.</p></div>
    <div class="lc rv"><i>😴</i><h3 data-e>Sleep &amp; stress hacks</h3><p data-e>The hidden reasons weight sticks, and how to fix them.</p></div>
    <div class="lc rv"><i>📋</i><h3 data-e>Your 7-day meal plan</h3><p data-e>Free printable meal plan for everyone who attends live.</p></div>
    <div class="lc rv"><i>💬</i><h3 data-e>Live Q&amp;A</h3><p data-e>Ask your PCOS, thyroid or weight questions directly.</p></div>
  </div></div>
</section>

<section class="sec co" id="coach" data-section="Your coach">
  <div class="wrap cg"><div class="im rv"><img data-img="coach" data-label="Coach photo" src="${P.person('#fbbf24', '#16a34a')}" alt=""></div>
  <div class="rv"><span class="k" data-e>Your host</span><h2 data-e>Hi, I'm <em>Coach Neha</em></h2><p data-e>Certified nutritionist and fitness coach. After losing 22 kg myself, I've helped 5,000+ people transform their health without extreme diets or gym addiction.</p><ul class="ch" data-list><li data-e>Certified Nutritionist &amp; Fitness Trainer</li><li data-e>Featured in leading health magazines</li><li data-e>PCOS &amp; thyroid weight-loss specialist</li></ul><a class="btn" data-cta="enroll" data-e>Join My Free Masterclass</a></div></div>
</section>

<section class="sec" data-section="Before & After">
  <div class="wrap bs"><div class="rv"><span class="k" data-e>Real transformations</span><h2 data-e>They did it. <em>So can you.</em></h2><p data-e>Slide to compare. Replace with your clients' photos (with their consent). Results vary by individual.</p><a class="btn y" data-cta="enroll" data-e>Start My Transformation</a></div>
  <div class="bx rv" data-ba><img data-img="before" data-label="Before photo" src="${P.photo('#c9c0a8', '#8a8470', 900, 675)}" alt="Before"><img data-img="after" data-label="After photo" src="${P.photo('#8ee0a8', '#16a34a', 900, 675)}" alt="After"><span class="lbl l" data-e>Before</span><span class="lbl r" data-e>After 90 days</span></div></div>
</section>

<section class="sec" id="programs" style="background:var(--bg)" data-section="Programs">
  <div class="wrap"><div class="head rv"><span class="k" data-e>Coaching programs</span><h2 data-e>Choose your <em>path</em></h2><p data-e>Attend the free masterclass first and get exclusive access to a special offer.</p></div>
  <div class="pk" data-list>
    <div class="pc rv"><h3 data-e>Diet Plan</h3><div class="d" data-e>Self-guided</div><div class="pr"><span data-e>₹1,999</span><small data-e>/ 30 days</small></div><ul data-list><li data-e>Custom diet chart</li><li data-e>Recipe e-book</li><li data-e>Email support</li></ul><a class="btn o" data-cta="enroll" data-e>Get started</a></div>
    <div class="pc h rv"><span class="fl" data-e>Most popular</span><h3 data-e>90-Day Transformation</h3><div class="d" data-e>Fully coached</div><div class="pr"><span data-e>₹9,999</span><small data-e>/ 90 days</small></div><ul data-list><li data-e>Personal diet &amp; workout plan</li><li data-e>Weekly 1-on-1 check-in</li><li data-e>Daily WhatsApp support</li><li data-e>Private community</li></ul><a class="btn" data-cta="enroll" data-e>Get started</a></div>
    <div class="pc rv"><h3 data-e>PCOS / Thyroid Care</h3><div class="d" data-e>Specialised plan</div><div class="pr"><span data-e>₹12,999</span><small data-e>/ 90 days</small></div><ul data-list><li data-e>Hormone-friendly meal plan</li><li data-e>Doctor-reviewed approach</li><li data-e>Weekly coaching calls</li></ul><a class="btn o" data-cta="enroll" data-e>Get started</a></div>
  </div></div>
</section>

<section class="sec" data-section="Video testimonials"><div class="wrap"><div class="head rv"><span class="k" data-e>Success stories</span><h2 data-e>Hear it from <em>them</em></h2></div><div class="vd rv"><div data-video data-label="Testimonial video" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div></div></div></section>

<section class="sec" style="padding-top:0" data-section="Client reviews">
  <div class="wrap"><div class="rg" data-list>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"Lost 14 kg without giving up rice or roti. Coach Neha's plan was so easy to follow."</p><div class="who"><img data-img="u1" data-label="Client 1" src="${P.avatar('#16a34a', '#fbbf24')}" alt=""><span><b data-e>Pallavi Joshi</b><small data-e>−14 kg in 90 days</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"My PCOS symptoms improved so much. Periods regular after years. Thank you!"</p><div class="who"><img data-img="u2" data-label="Client 2" src="${P.avatar('#fbbf24', '#b45309')}" alt=""><span><b data-e>Ankita Shah</b><small data-e>PCOS programme</small></span></div></div>
    <div class="rc rv"><div class="st">★★★★★</div><p data-e>"I'm 48 and feel 30. Lost 11 kg, off BP medicines. The daily support is amazing."</p><div class="who"><img data-img="u3" data-label="Client 3" src="${P.avatar('#0d6b30', '#8ee0a8')}" alt=""><span><b data-e>Rajiv Khanna</b><small data-e>−11 kg in 80 days</small></span></div></div>
  </div></div>
</section>

<section class="sec" id="faq" style="padding-top:0" data-section="FAQ"><div class="wrap"><div class="head rv"><span class="k" data-e>FAQ</span><h2 data-e>Got <em>questions?</em></h2></div>
  <div class="faqbox" data-list>
    <div class="acc" data-acc data-acc-open><div class="acc-h" data-acc-head data-e>Is the masterclass really free?</div><div class="acc-b" data-acc-body data-e>Yes, completely free. Just register with your name and number to get the joining link.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>What if I can't attend live?</div><div class="acc-b" data-acc-body data-e>A replay is available for 24 hours for registered participants. Live attendees also get bonus gifts.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Do I need a gym?</div><div class="acc-b" data-acc-body data-e>No. All workouts can be done at home with zero equipment.</div></div>
    <div class="acc" data-acc><div class="acc-h" data-acc-head data-e>Is this suitable for vegetarians?</div><div class="acc-b" data-acc-body data-e>Absolutely. Plans are customised for vegetarian, vegan and non-vegetarian diets.</div></div>
  </div></div></section>

<section class="final" data-section="Final call to action"><div class="wrap"><div class="box rv"><h2 data-e>Your healthiest chapter starts Saturday</h2><p data-e>Reserve your free seat now. Limited spots to keep the Q&amp;A personal.</p><a class="btn" data-cta="enroll" data-e>Reserve My Free Seat →</a></div></div></section>
</main>
<footer data-section="Footer" data-fixed><div class="wrap fo"><span data-e>© 2025 FitLife Coach. Results vary. Not a substitute for medical advice.</span><span><a data-cta="whatsapp" data-e>💬 WhatsApp</a> &nbsp;·&nbsp; <a data-cta="call" data-e>📞 Call</a></span></div></footer>
</body>
</html>`
  });
})();
