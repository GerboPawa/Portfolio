/* ============================================
   QUOTE PAGE — quote.js
   ============================================ */

const TOTAL_STEPS = 5;
let currentStep  = 1;

const form        = document.getElementById('quoteForm');
const progressBar = document.getElementById('progressBar');
const progressLbl = document.getElementById('progressLabel');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const submitBtn   = document.getElementById('submitBtn');
const successEl   = document.getElementById('quoteSuccess');

// ── Progress ──────────────────────────────────────────────────────────────────
function updateProgress() {
  const pct = (currentStep / TOTAL_STEPS) * 100;
  progressBar.style.setProperty('--progress', pct + '%');
  progressLbl.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
}

// ── Step navigation ───────────────────────────────────────────────────────────
function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`).classList.add('active');

  prevBtn.style.visibility = n === 1 ? 'hidden' : 'visible';

  if (n === TOTAL_STEPS) {
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    submitBtn.classList.add('hidden');
  }

  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(n) {
  if (n === 1) {
    const checked = form.querySelectorAll('input[name="needs"]:checked');
    if (checked.length === 0) { shake(nextBtn); return false; }
  }
  if (n === 3) {
    const picked = form.querySelector('input[name="vibe"]:checked');
    if (!picked) { shake(nextBtn); return false; }
  }
  if (n === 4) {
    const picked = form.querySelector('input[name="implementation"]:checked');
    if (!picked) { shake(nextBtn); return false; }
  }
  return true;
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => el.style.animation = '', 400);
}

nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    showStep(currentStep);
  }
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
});

// ── Slider ────────────────────────────────────────────────────────────────────
const slider      = document.getElementById('minutesSlider');
const sliderDisp  = document.getElementById('sliderDisplay');
const sliderCtx   = document.getElementById('sliderContext');

const contexts = [
  [1,  3,  'A jingle or short sting — perfect.'],
  [4,  10, 'A handful of tracks — ideal for a game jam.'],
  [11, 20, 'A solid indie vertical slice.'],
  [21, 40, 'Full small-to-mid indie game OST.'],
  [41, 70, 'Substantial OST — we\'re talking a real release.'],
  [71, 120,'Full-scale production. Let\'s talk details.'],
];

function updateSlider() {
  const v = parseInt(slider.value);
  sliderDisp.textContent = v;
  const ctx = contexts.find(([min, max]) => v >= min && v <= max);
  if (ctx) sliderCtx.textContent = ctx[2];
}

slider.addEventListener('input', updateSlider);
updateSlider();

// ── Form submit → Formspree ───────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  // Gather all selected options
  const needs   = [...form.querySelectorAll('input[name="needs"]:checked')].map(i => i.value).join(', ');
  const minutes = form.querySelector('#minutesSlider').value;
  const vibe    = form.querySelector('input[name="vibe"]:checked')?.value || '—';
  const impl    = form.querySelector('input[name="implementation"]:checked')?.value || '—';
  const budget  = form.querySelector('input[name="budget"]:checked')?.value || '—';
  const name    = form.querySelector('input[name="name"]').value;
  const email   = form.querySelector('input[name="email"]').value;
  const extra   = form.querySelector('textarea[name="extra"]').value;

  const message = `
QUOTE REQUEST

What they need: ${needs}
Minutes of music: ~${minutes} min
Vibe / Instrumentation: ${vibe}
Implementation: ${impl}
Budget range: ${budget}

Extra notes:
${extra || '(none)'}
  `.trim();

  try {
    const res = await fetch('https://formspree.io/f/mkoaqpop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      form.classList.add('hidden');
      successEl.classList.remove('hidden');
      document.querySelector('.progress-wrap').classList.add('hidden');
    } else {
      throw new Error('Server error');
    }
  } catch {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get My Custom Quote';
    alert('Something went wrong — please try emailing filippo.gerbino.mail@gmail.com directly.');
  }
});

// ── Shake keyframes (injected) ────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}`;
document.head.appendChild(style);

// ── Nav hamburger ─────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.dataset.open === '1';
    navLinks.dataset.open = open ? '0' : '1';
    Object.assign(navLinks.style, {
      display:        open ? 'none' : 'flex',
      position:       'fixed',
      top:            '70px',
      left:           '0',
      right:          '0',
      flexDirection:  'column',
      background:     'rgba(10,10,15,0.97)',
      padding:        '2rem',
      borderBottom:   '1px solid rgba(201,168,76,0.15)',
      gap:            '1.5rem',
      backdropFilter: 'blur(20px)',
      zIndex:         '99',
    });
  });
}

// Init
showStep(1);
