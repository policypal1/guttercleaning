(() => {
  'use strict';
  const config = window.RAINLINE_CONFIG || {};
  const form = document.getElementById('quote-form');
  if (!form) return;
  const steps = [...document.querySelectorAll('.quote-step')];
  const progress = [...document.querySelectorAll('.quote-progress li')];
  const error = document.getElementById('form-error');
  const next = document.getElementById('next');
  const previous = document.getElementById('previous');
  const demoNotice = document.getElementById('demo-notice');
  const success = document.getElementById('success');
  const demo = config.demoMode !== false || !config.formEndpoint;
  let current = 0;
  let sending = false;
  let completedData = null;
  demoNotice.hidden = !demo;

  const serviceMap = { cleaning: 'Gutter cleaning', downspouts: 'Downspout concern', seasonal: 'Seasonal gutter care' };
  const initialService = serviceMap[new URLSearchParams(location.search).get('service')];
  if (initialService) form.elements.service.value = initialService;

  function data() {
    const values = Object.fromEntries(new FormData(form).entries());
    Object.keys(values).forEach(key => { if (typeof values[key] === 'string') values[key] = values[key].trim(); });
    return values;
  }
  function clearError() {
    error.hidden = true;
    error.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  }
  function showError(message, input) {
    error.textContent = message;
    error.hidden = false;
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
    else error.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }
  function validateStep(index) {
    clearError();
    const values = data();
    if (index === 0) {
      if (!values.stories) { showError('Choose the number of stories, or select “3+ / unsure.”', form.elements.stories[0]); return false; }
      form.elements.zip.value = values.zip;
      if (!/^\d{5}(-\d{4})?$/.test(values.zip)) { showError('Enter a valid five-digit ZIP code, such as 97301.', form.elements.zip); return false; }
    }
    if (index === 1) {
      for (const [key, label] of [['name', 'your name'], ['email', 'your email address'], ['city', 'your city']]) {
        if (!values[key]) { showError('Please enter ' + label + '.', form.elements[key]); return false; }
      }
      form.elements.email.value = values.email;
      if (!form.elements.email.validity.valid) { showError('Enter a valid email address, such as you@example.com.', form.elements.email); return false; }
      const phoneDigits = (values.phone || '').replace(/\D/g, '');
      if (values.phone && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
        showError('Enter a phone number with 10–15 digits, or leave it empty and we’ll email you.', form.elements.phone); return false;
      }
    }
    if (index === 2 && !form.elements.consent.checked) { showError('Please check the box so we know it’s okay to contact you about your quote.', form.elements.consent); return false; }
    return true;
  }
  function updateSummary() {
    const values = data();
    const summary = { ...values, location: `${values.address ? values.address + ', ' : ''}${values.city}, ${values.zip}`, phone: values.phone || 'Not provided', notes: values.notes || 'No extra notes' };
    document.querySelectorAll('[data-summary]').forEach(element => { element.textContent = summary[element.dataset.summary] || ''; });
  }
  function showStep(index, focus = true) {
    current = index;
    clearError();
    steps.forEach((step, i) => { step.hidden = i !== index; });
    progress.forEach((item, i) => {
      item.classList.toggle('active', i === index);
      item.classList.toggle('complete', i < index);
      if (i === index) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    });
    previous.hidden = index === 0;
    next.innerHTML = index === 2 ? `${demo ? 'Finish the demo' : 'Send my request'} <span aria-hidden="true">→</span>` : 'Continue <span aria-hidden="true">→</span>';
    if (index === 2) updateSummary();
    if (focus) document.getElementById('step-title-' + index).focus({ preventScroll: false });
  }
  function finish(values) {
    completedData = values;
    form.hidden = true;
    document.querySelector('.quote-progress').hidden = true;
    demoNotice.hidden = true;
    success.hidden = false;
    document.getElementById('success-title').textContent = demo ? 'That’s the whole form!' : 'Got it. Thanks, neighbor!';
    document.getElementById('success-copy').textContent = demo
      ? 'You’ve tried every step. Once we connect the request form, this is where you’ll see your confirmation.'
      : `Thanks, ${values.name}. Your request was submitted. We’ll email you to talk through the details. We’ll agree on a price and a day before anything is booked.`;
    document.getElementById('success-demo').hidden = !demo;
    document.getElementById('success-title').focus();
  }
  function lockForm(locked) {
    sending = locked;
    form.setAttribute('aria-busy', String(locked));
    form.querySelectorAll('button').forEach(button => { button.disabled = locked; });
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !validateStep(current)) return;
    if (current < 2) { showStep(current + 1); return; }
    // Recheck earlier steps before sending, including values changed via review edits.
    for (let i = 0; i < 2; i++) {
      const oldStep = current;
      if (!validateStep(i)) { showStep(i); validateStep(i); return; }
      current = oldStep;
    }
    const values = data();
    if (values._gotcha) { showError('Unable to submit this request. Please reload and try again.'); return; }
    if (demo) { finish(values); return; }
    let endpoint;
    try { endpoint = new URL(config.formEndpoint); if (endpoint.protocol !== 'https:') throw new Error('Invalid endpoint'); }
    catch { showError('The request form is not connected correctly. Please use the contact details on the home page, if available.'); return; }
    lockForm(true);
    next.textContent = 'Sending request…';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint.href, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, _subject: `Gutter care quote — ${values.name}`, source: 'Website quote flow' }), signal: controller.signal
      });
      if (!response.ok) throw new Error('Submission failed');
      finish(values);
    } catch {
      showError('We couldn’t confirm delivery. Your details are still here. Check your connection and try again, or use the contact details on the home page if available.');
    } finally {
      window.clearTimeout(timeout);
      lockForm(false);
      next.innerHTML = 'Send my request <span aria-hidden="true">→</span>';
    }
  });
  previous.addEventListener('click', () => { if (!sending && current > 0) showStep(current - 1); });
  document.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => { if (!sending) showStep(Number(button.dataset.edit)); }));
  form.addEventListener('input', event => { if (event.target.hasAttribute('aria-invalid')) event.target.removeAttribute('aria-invalid'); });
  document.getElementById('download-summary').addEventListener('click', () => {
    if (!completedData) return;
    const v = completedData;
    const summary = `${config.businessName || 'Rainline Gutter Care'}\n${demo ? 'DEMO PREVIEW — NOT SENT' : 'QUOTE REQUEST SUBMITTED'}\n\nName: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone || 'Not provided'}\nAddress: ${v.address || 'Not provided'}, ${v.city}, ${v.zip}\nHome: ${v.stories}\nService: ${v.service}\nNotes: ${v.notes || 'None'}\n\nNo price or appointment has been confirmed.\n`;
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'gutter-care-quote-summary.txt'; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('restart').addEventListener('click', () => {
    form.reset(); completedData = null; form.hidden = false; success.hidden = true;
    document.querySelector('.quote-progress').hidden = false; demoNotice.hidden = !demo; showStep(0);
  });
  showStep(0, false);
})();
