/* Salem Gutter Pros - minimal vanilla JS, no frameworks or backend required. */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('resize', () => {
  if (window.innerWidth > 800 && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false);
});
document.getElementById('year').textContent = String(new Date().getFullYear());

const form = document.getElementById('quote-form');
const formResult = document.getElementById('form-result');
const formStatus = document.getElementById('form-status');
const openSMS = document.getElementById('open-sms');
const copyRequest = document.getElementById('copy-request');
let preparedMessage = '';

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const name = document.getElementById('customer-name').value.trim();
  const area = document.getElementById('customer-area').value.trim();
  const home = document.getElementById('customer-home').value;
  const notes = document.getElementById('customer-notes').value.trim();
  if (!name || !area) { formStatus.textContent = 'Please enter your name and city or ZIP code.'; formResult.hidden = false; return; }

  preparedMessage = `Hi Salem Gutter Pros! I'd like a free gutter cleaning quote.\nName: ${name}\nCity/ZIP: ${area}\nHome: ${home}${notes ? `\nDetails: ${notes}` : ''}`;
  const encoded = encodeURIComponent(preparedMessage);
  // Mobile browsers use slightly different SMS URL conventions.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const smsURL = `sms:+15035694291${isIOS ? '&' : '?'}body=${encoded}`;
  openSMS.href = smsURL;
  formResult.hidden = false;
  const isLikelyMobile = /Android|iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  formStatus.textContent = isLikelyMobile
    ? 'Your request is ready. Review it in Messages and press Send. If Messages does not open, copy your request instead.'
    : 'Your request is ready. Copy it and text it to (503) 569-4291, or use Open Messages if your computer supports texting.';
  copyRequest.textContent = 'Copy Request';
  // Open only from this explicit user gesture and only on mobile devices.
  if (isLikelyMobile) window.location.href = smsURL;
});

copyRequest.addEventListener('click', async () => {
  if (!preparedMessage) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(preparedMessage);
    } else {
      const helper = document.createElement('textarea');
      helper.value = preparedMessage;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.focus(); helper.select();
      if (!document.execCommand('copy')) throw new Error('Copy unavailable');
      helper.remove();
    }
    copyRequest.textContent = 'Copied!';
    formStatus.textContent = 'Copied! Paste the request into a text message to (503) 569-4291.';
  } catch (_) {
    formStatus.textContent = `Copying was blocked by your browser. Send this information to (503) 569-4291: ${preparedMessage}`;
  }
});
