const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}

menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('resize', () => {
  if (window.innerWidth > 820 && menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
});

const form = document.getElementById('quote-form');
const panels = Array.from(form.querySelectorAll('.quote-step'));
const result = document.getElementById('form-result');
const resultStatus = document.getElementById('form-status');
const summary = document.getElementById('request-summary');
const openSMS = document.getElementById('open-sms');
const copyRequest = document.getElementById('copy-request');
const edit = document.getElementById('edit-request');
let currentStep = 0;
let preparedMessage = '';

function showStep(index, focus = false) {
  currentStep = Math.max(0, Math.min(panels.length - 1, index));
  panels.forEach((panel, i) => panel.hidden = i !== currentStep);
  result.hidden = true;
  if (focus) {
    const h = panels[currentStep].querySelector('h4');
    if (h) {
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }
  }
}

function inputsOn(panel) {
  return Array.from(panel.querySelectorAll('input,textarea,select'));
}

function validStep() {
  const visible = panels[currentStep];
  for (const input of inputsOn(visible)) {
    if (input.type === 'radio') {
      const group = form.querySelectorAll(`input[name="${input.name}"]`);
      if (![...group].some(r => r.checked)) {
        group[0].reportValidity();
        return false;
      }
      continue;
    }
    if (input.required && !input.value.trim()) {
      input.setCustomValidity('Please complete this field.');
      input.reportValidity();
      input.setCustomValidity('');
      return false;
    }
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }
  if (currentStep === 3) {
    const phone = document.getElementById('customer-phone');
    if (phone.value.replace(/\D/g, '').length < 10) {
      phone.setCustomValidity('Please enter a valid phone number.');
      phone.reportValidity();
      phone.setCustomValidity('');
      return false;
    }
  }
  return true;
}

form.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => {
  if (validStep()) showStep(currentStep + 1, true);
}));
form.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', () => showStep(currentStep - 1, true)));
form.querySelectorAll('input[name="home"]').forEach(radio => radio.addEventListener('change', () => {
  if (currentStep === 0 && validStep()) showStep(1, true);
}));
form.querySelectorAll('input:not([type="radio"])').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && currentStep < 3) {
      e.preventDefault();
      if (validStep()) showStep(currentStep + 1, true);
    }
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validStep()) return;
  const get = id => document.getElementById(id).value.trim();
  const home = form.querySelector('input[name="home"]:checked');
  const address = get('customer-address');
  const area = get('customer-area');
  const name = get('customer-name');
  const phone = get('customer-phone');
  const notes = get('customer-notes');
  if (!home || !address || !area || !name || !phone) return;

  preparedMessage = `Hi Salem Gutter Pros! I'd like a free gutter cleaning quote.\n\nName: ${name}\nPhone: ${phone}\nProperty: ${home.value}\nAddress: ${address}, ${area}${notes ? `\nNotes: ${notes}` : ''}`;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const sep = isIOS ? '&' : '?';
  const url = `sms:+15035694291${sep}body=${encodeURIComponent(preparedMessage)}`;
  openSMS.href = url;
  summary.textContent = preparedMessage;
  result.hidden = false;
  panels.forEach(panel => panel.hidden = true);
  copyRequest.textContent = 'Copy Request';
  resultStatus.textContent = 'Your details are prepared. Open your Messages app and press Send, or copy the request and text it to (503) 569-4291.';
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) window.location.href = url;
});

edit?.addEventListener('click', () => showStep(3, true));
copyRequest?.addEventListener('click', async () => {
  if (!preparedMessage) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(preparedMessage);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = preparedMessage;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      if (!document.execCommand('copy')) throw new Error('Clipboard blocked');
      textarea.remove();
    }
    copyRequest.textContent = 'Copied!';
  } catch (error) {
    resultStatus.textContent = 'Select and copy the details shown above, then text them to (503) 569-4291.';
  }
});

showStep(0);

// Footer year and keyboard dismissal of the responsive menu.
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
document.addEventListener("keydown", event => { if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") { setMenu(false); menuToggle.focus(); } });
document.addEventListener("click", event => { if (menuToggle?.getAttribute("aria-expanded") === "true" && !event.target.closest(".site-header")) setMenu(false); });
