/* ============================================
   QUOTE PAGE — quote.js
   ============================================ */

const TOTAL_STEPS   = 5;
const RATE_PER_MIN  = 150;
let   currentStep   = 1;

const form          = document.getElementById('quoteForm');
const progressBar   = document.getElementById('progressBar');
const progressLbl   = document.getElementById('progressLabel');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const submitBtn     = document.getElementById('submitBtn');
const successEl     = document.getElementById('quoteSuccess');
const budgetWarning = document.getElementById('budgetWarning');
const budgetWarnTxt = document.getElementById('budgetWarningText');
const contactFields = document.getElementById('contactFields');

// ── i18n helper (falls back to the key if i18n.js isn't loaded) ───────────────
const T = (key, vars) => (window.i18n ? window.i18n.t(key, vars) : key);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMinutes() {
  return parseInt(document.getElementById('minutesSlider').value) || 15;
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => el.style.animation = '', 400);
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function updateProgress() {
  const pct = (currentStep / TOTAL_STEPS) * 100;
  progressBar.style.setProperty('--progress', pct + '%');
  progressLbl.textContent = T('q.step', { n: currentStep, total: TOTAL_STEPS });
}

// ── Budget logic ──────────────────────────────────────────────────────────────
function isBudgetTooLow(radio) {
  if (!radio) return false;
  const mins    = getMinutes();
  const minCost = mins * RATE_PER_MIN;
  return parseInt(radio.dataset.max) < minCost;
}

function updateBudgetStep() {
  const mins    = getMinutes();
  const minCost = mins * RATE_PER_MIN;

  // Dim and disable options that are too low
  document.querySelectorAll('input[name="budget"]').forEach(radio => {
    const tooLow = parseInt(radio.dataset.max) < minCost;
    radio.dataset.tooLow = tooLow ? 'true' : 'false';
    radio.disabled = tooLow;
    if (tooLow && radio.checked) {
      radio.checked = false;
      budgetWarning.classList.add('hidden');
      contactFields.classList.remove('hidden');
      submitBtn.classList.add('hidden');
      submitBtn.disabled = true;
    }
  });

  // Re-evaluate any already-selected radio
  const selected = form.querySelector('input[name="budget"]:checked');
  if (selected) evaluateBudget(selected);
}

function evaluateBudget(radio) {
  const tooLow = isBudgetTooLow(radio);

  if (tooLow) {
    const mins    = getMinutes();
    const minCost = mins * RATE_PER_MIN;
    budgetWarning.classList.remove('hidden');
    budgetWarnTxt.textContent = T('q.budgetWarn', { mins: mins, cost: minCost.toLocaleString() });
    contactFields.classList.add('hidden');
    submitBtn.classList.add('hidden');
    submitBtn.disabled = true;
  } else {
    budgetWarning.classList.add('hidden');
    contactFields.classList.remove('hidden');
    if (currentStep === TOTAL_STEPS) {
      submitBtn.classList.remove('hidden');
      submitBtn.disabled = false;
    }
  }
}

// Wire budget radios
document.querySelectorAll('input[name="budget"]').forEach(radio => {
  radio.addEventListener('change', () => evaluateBudget(radio));
});

// ── Step display ──────────────────────────────────────────────────────────────
function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active');

  prevBtn.style.visibility = n === 1 ? 'hidden' : 'visible';

  if (n === TOTAL_STEPS) {
    nextBtn.classList.add('hidden');
    updateBudgetStep(); // refresh min-cost note whenever step 5 is entered

    // Show submit only if a valid budget is already selected
    const selected = form.querySelector('input[name="budget"]:checked');
    if (selected && !isBudgetTooLow(selected)) {
      submitBtn.classList.remove('hidden');
      submitBtn.disabled = false;
    } else {
      submitBtn.classList.add('hidden');
      submitBtn.disabled = true;
    }
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }

  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Step validation ───────────────────────────────────────────────────────────
function validateStep(n) {
  if (n === 1) {
    const checked = form.querySelectorAll('input[name="needs"]:checked');
    if (!checked.length) { shake(nextBtn); return false; }
  }
  if (n === 3) {
    if (!form.querySelector('input[name="vibe"]:checked')) { shake(nextBtn); return false; }
  }
  if (n === 4) {
    if (!form.querySelector('input[name="implementation"]:checked')) { shake(nextBtn); return false; }
  }
  return true;
}

nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS) { currentStep++; showStep(currentStep); }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) { currentStep--; showStep(currentStep); }
});

// ── Slider ────────────────────────────────────────────────────────────────────
const slider     = document.getElementById('minutesSlider');
const sliderDisp = document.getElementById('sliderDisplay');
const sliderCtx  = document.getElementById('sliderContext');

const contexts = [
  [1,   3,   'q.slider.1'],
  [4,   10,  'q.slider.2'],
  [11,  20,  'q.slider.3'],
  [21,  40,  'q.slider.4'],
  [41,  70,  'q.slider.5'],
  [71,  120, 'q.slider.6'],
];

function updateSlider() {
  const v = parseInt(slider.value);
  sliderDisp.textContent = v;
  const ctx = contexts.find(([mn, mx]) => v >= mn && v <= mx);
  if (ctx) sliderCtx.textContent = T(ctx[2]);
}

slider.addEventListener('input', updateSlider);
updateSlider();

// ── Form submit → Formspree ───────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Safety check — block if budget is too low (shouldn't reach here, but just in case)
  const selectedBudget = form.querySelector('input[name="budget"]:checked');
  if (isBudgetTooLow(selectedBudget)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = T('q.sending');

  const needs   = [...form.querySelectorAll('input[name="needs"]:checked')].map(i => i.value).join(', ');
  const minutes = slider.value;
  const vibe    = form.querySelector('input[name="vibe"]:checked')?.value   || '—';
  const impl    = form.querySelector('input[name="implementation"]:checked')?.value || '—';
  const budget  = selectedBudget?.value || '—';
  const name    = form.querySelector('input[name="name"]').value;
  const email   = form.querySelector('input[name="email"]').value;
  const extra   = form.querySelector('textarea[name="extra"]').value;

  const message = `
QUOTE REQUEST

What they need:        ${needs}
Minutes of music:      ~${minutes} min  (min budget ~$${(parseInt(minutes) * RATE_PER_MIN).toLocaleString()})
Vibe/Instrumentation:  ${vibe}
Implementation:        ${impl}
Budget range:          ${budget}

Extra notes:
${extra || '(none)'}
  `.trim();

  try {
    const res = await fetch('https://formspree.io/f/mkoaqpop', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      form.classList.add('hidden');
      document.querySelector('.progress-wrap').classList.add('hidden');
      successEl.classList.remove('hidden');
    } else {
      throw new Error('Server error');
    }
  } catch {
    submitBtn.disabled = false;
    submitBtn.textContent = T('q.submit');
    alert(T('q.error'));
  }
});

// ── Shake keyframes ───────────────────────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}`;
document.head.appendChild(styleEl);

// ── Language switch: re-render dynamic strings on change ──────────────────────
window.addEventListener('langchange', () => {
  updateProgress();
  updateSlider();
  // refresh budget warning text if it's currently shown
  const sel = form.querySelector('input[name="budget"]:checked');
  if (sel && isBudgetTooLow(sel)) evaluateBudget(sel);
});

// ── Init ──────────────────────────────────────────────────────────────────────
showStep(1);
