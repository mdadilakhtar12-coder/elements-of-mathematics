// Privacy notice page, in plain language. The organisation name, contact email and retention period
// come from environment variables so they can be set on the host without changing code.
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function retentionMonths(env = process.env) {
  const n = Number(env.RETENTION_MONTHS);
  return Number.isInteger(n) && n > 0 && n <= 60 ? n : 12;
}

export function privacyPage(env = process.env) {
  const org = esc(env.ORG_NAME || 'the operator of this website');
  const contact = env.CONTACT_EMAIL
    ? `<a href="mailto:${esc(env.CONTACT_EMAIL)}">${esc(env.CONTACT_EMAIL)}</a>`
    : 'the contact details given on this website';
  const months = retentionMonths(env);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy notice · Scholarship Finder</title>
<link rel="stylesheet" href="/styles.css"></head>
<body>
<header class="top"><a class="brand" href="/">Scholarship Finder</a><span class="lang">English</span></header>
<main class="wrap legal">
  <p><a href="/">← Back to the scholarship finder</a></p>
  <h1>Privacy notice</h1>
  <p class="muted">In short: we save your details only if you tick the box on the form, we use them only to help you with scholarships, and you can ask us to delete them at any time.</p>

  <h2>Who we are</h2>
  <p>This website is run by ${org}. You can reach us at ${contact}.</p>

  <h2>Finding scholarships without saving anything</h2>
  <p>You can use the form and see your matching scholarships without ticking the consent box. In that case your answers are used to show the results and are <strong>not saved on our servers</strong>. Your browser keeps them on your own device so the form is filled in next time. Clearing your browser data removes them.</p>

  <h2>What we save if you tick the box</h2>
  <ul>
    <li>Contact details: name (if you give it), mobile number, email (if you give it).</li>
    <li>Your school or college name and type.</li>
    <li>Your class or course. For B.Sc students, the Honours and Minor subjects.</li>
    <li>Your marks, category, gender, state, family income, whether you have a disability, and the groups you ticked (for example minority community).</li>
    <li>The date you submitted the form.</li>
  </ul>
  <p>We do not ask for your Aadhaar number, documents, photos, or bank details.</p>

  <h2>Why we save it</h2>
  <p>To help you with scholarship applications, to contact you about scholarships that suit you, and to understand which scholarships students need. We do not use it for advertising and we do not sell it.</p>

  <h2>Who can see it</h2>
  <p>Only the administrators of this website. Your details are stored with our database provider (Supabase) and the website is served by our hosting provider. They handle the data for us and may not use it for their own purposes.</p>

  <h2>If you are under 18</h2>
  <p>Please tick the box only with the permission of your parent or guardian. By ticking it, you confirm that they agree. We may ask for this to be confirmed before contacting you.</p>

  <h2>How long we keep it</h2>
  <p>We delete saved details after ${months} months, or earlier if you ask.</p>

  <h2>Your choices</h2>
  <p>You can ask us to show you, correct, or delete the details we hold about you, or to stop contacting you, by writing to ${contact}. We will act on your request as soon as we can.</p>

  <h2>Scholarship information</h2>
  <p>Scholarship details on this website are gathered from official sources and may change. Always confirm on the official website before you apply. We are not the scholarship provider and do not take any fee.</p>

  <p class="fine">This notice may be updated. The latest version is always on this page.</p>
</main>
</body></html>`;
}
