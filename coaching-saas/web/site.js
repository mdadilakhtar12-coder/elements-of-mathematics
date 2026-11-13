/* Shared header / footer and business details of the BatchPilot website. Edit SITE to change the contact details. */
window.SITE = {
  name: 'BatchPilot',
  tagline: 'Coaching institute manager',
  // >>> Fill these in before sending the site to Cashfree / Play Store <<<
  owner: 'BatchPilot',                 // legal / business name of the owner
  email: 'support@example.com',        // support e-mail shown to customers
  phone: '',                           // optional support phone
  address: 'India',                    // business address (city, state)
  updated: '13 November 2026'
};
(function () {
  var S = window.SITE;
  function fill() {
    document.querySelectorAll('[data-site]').forEach(function (el) { el.textContent = S[el.getAttribute('data-site')] || ''; });
    document.querySelectorAll('a[data-mail]').forEach(function (a) { a.href = 'mailto:' + S.email; a.textContent = S.email; });
    var head = document.getElementById('site-head');
    if (head) {
      head.innerHTML = '<a class="brand" href="/"><img src="/logo.svg" alt="" width="34" height="34"><span>Batch<b>Pilot</b></span></a>' +
        '<nav><a href="/#pricing">Pricing</a><a href="/buy">Buy / renew</a><a href="/contact">Contact</a></nav>';
    }
    var foot = document.getElementById('site-foot');
    if (foot) {
      foot.innerHTML = '<div>&copy; ' + new Date().getFullYear() + ' ' + S.owner + '</div>' +
        '<nav><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/refund">Refunds</a><a href="/delete-account">Delete account</a><a href="/contact">Contact</a></nav>';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
