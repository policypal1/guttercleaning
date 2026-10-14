(() => {
  'use strict';
  const config = window.RAINLINE_CONFIG || {};
  document.querySelectorAll('[data-brand]').forEach(el => { el.textContent = config.shortName || 'rainline'; });
  document.querySelectorAll('[data-business]').forEach(el => { el.textContent = config.businessName || 'Rainline Gutter Care'; });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('[data-demo-note]').forEach(el => {
    if (!config.demoMode && config.formEndpoint) el.textContent = 'Illustrative imagery';
  });
  document.querySelectorAll('[data-contact-link]').forEach(el => {
    if (config.phone) { el.href = 'tel:' + config.phone.replace(/[^+\d]/g, ''); el.textContent = config.phone; el.hidden = false; }
    else if (config.email) { el.href = 'mailto:' + config.email; el.textContent = config.email; el.hidden = false; }
  });
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav?.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', event => { if (nav && !nav.contains(event.target) && !toggle?.contains(event.target)) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
})();
