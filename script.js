/* ============================================
   COMPOSER PORTFOLIO — script.js
   ============================================ */

// ─── GLOBAL PREFS ─────────────────────────────────────────────────────────────
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keep the footer copyright year current automatically
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ─── NAV SCROLL + SCROLL PROGRESS ─────────────────────────────────────────────
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  if (scrollProgress) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
}, { passive: true });

// ─── HAMBURGER (MOBILE) ────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');

function setMenu(open) {
  navLinks.dataset.open = open ? '1' : '0';
  hamburger.classList.toggle('is-open', open);
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  Object.assign(navLinks.style, {
    display:        open ? 'flex' : 'none',
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
}

hamburger.addEventListener('click', () => {
  setMenu(navLinks.dataset.open !== '1');
});

// Close the mobile menu after tapping a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.dataset.open === '1') setMenu(false);
  });
});

// Close the mobile menu on Escape or an outside click
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.dataset.open === '1') setMenu(false);
});
document.addEventListener('click', (e) => {
  if (navLinks.dataset.open === '1' &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    setMenu(false);
  }
});

// ─── SCORE CANVAS (HERO BACKGROUND) ──────────────────────────────────────────
const scoreCanvas = document.getElementById('scoreCanvas');
const sCtx        = scoreCanvas.getContext('2d');

function resizeScoreCanvas() {
  scoreCanvas.width  = window.innerWidth;
  scoreCanvas.height = window.innerHeight;
}
resizeScoreCanvas();
window.addEventListener('resize', resizeScoreCanvas);

const STAFF_LINES  = 5;
const LINE_SPACING = 14;
const STAFF_GAP    = 100;

let isHeroVisible = true;

function drawScore() {
  if (!isHeroVisible) return; // pause when hero is off-screen
  sCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  sCtx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  sCtx.lineWidth   = 0.7;

  const numStaves = Math.ceil(scoreCanvas.height / (STAFF_LINES * LINE_SPACING + STAFF_GAP)) + 1;
  const t         = Date.now() * 0.00012;

  for (let s = 0; s < numStaves; s++) {
    const yBase = s * (STAFF_LINES * LINE_SPACING + STAFF_GAP) + 60;

    for (let l = 0; l < STAFF_LINES; l++) {
      const y = yBase + l * LINE_SPACING;
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(scoreCanvas.width, y);
      sCtx.stroke();
    }

    const barWidth = 90;
    const numBars  = Math.ceil(scoreCanvas.width / barWidth) + 1;
    for (let b = 0; b < numBars; b++) {
      const x = b * barWidth;
      sCtx.beginPath();
      sCtx.moveTo(x, yBase);
      sCtx.lineTo(x, yBase + (STAFF_LINES - 1) * LINE_SPACING);
      sCtx.stroke();
    }

    sCtx.save();
    sCtx.font      = '38px serif';
    sCtx.fillStyle = 'rgba(201, 168, 76, 0.55)';
    sCtx.fillText('𝄞', 6, yBase + (STAFF_LINES - 1) * LINE_SPACING + 4);
    sCtx.restore();

    const notePositions = [0, 1, 2, 3, 4, 5, 6, 7];
    const noteSymbols   = ['♩', '♪', '♫', '𝅗𝅥', '𝅘𝅥𝅮'];
    const numNotes      = 6 + s % 4;

    for (let n = 0; n < numNotes; n++) {
      const noteX = 50 + n * (barWidth * 1.1) + ((s * 17 + n * 13) % 40);
      if (noteX > scoreCanvas.width - 20) continue;
      const pitch = notePositions[(s * 3 + n * 5) % notePositions.length];
      const noteY = yBase + (STAFF_LINES - 1) * LINE_SPACING - pitch * (LINE_SPACING / 2) + 6;
      const wave  = Math.sin(t + n * 0.9 + s * 1.5) * 1.5;
      sCtx.save();
      sCtx.font      = '14px serif';
      sCtx.fillStyle = `rgba(201, 168, 76, ${0.4 + Math.sin(t + n + s) * 0.15})`;
      sCtx.fillText(noteSymbols[n % noteSymbols.length], noteX, noteY + wave);
      sCtx.restore();
    }
  }
  if (!reduceMotion) requestAnimationFrame(drawScore);
}
drawScore();

// Pause canvas animation when hero scrolls out of view
if (!reduceMotion) {
  const heroObserver = new IntersectionObserver((entries) => {
    isHeroVisible = entries[0].isIntersecting;
    if (isHeroVisible) drawScore(); // restart loop when hero re-enters
  }, { threshold: 0 });
  heroObserver.observe(document.getElementById('hero'));
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const pipelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.pipeline-step').forEach((step, i) => {
        setTimeout(() => step.classList.add('visible'), i * 120);
      });
      pipelineObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

const pipelineCard = document.querySelector('.pipeline-card');
if (pipelineCard) pipelineObserver.observe(pipelineCard);

// ─── CTA FLOATING NOTES ───────────────────────────────────────────────────────
const ctaNotes   = document.getElementById('ctaNotes');
const NOTE_CHARS = ['♩', '♪', '♫', '♬', '𝄞', '𝅗𝅥'];

function spawnNote() {
  const el  = document.createElement('span');
  el.textContent = NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)];
  const dur = 4 + Math.random() * 4;
  const del = Math.random() * 2;
  Object.assign(el.style, {
    position:    'absolute',
    left:        (Math.random() * 100) + '%',
    bottom:      '0',
    fontSize:    (1 + Math.random() * 1.5) + 'rem',
    color:       'rgba(201, 168, 76, 0.3)',
    animation:   `floatNote ${dur}s ${del}s ease-in both`,
    '--r':       ((Math.random() - 0.5) * 40) + 'deg',
    pointerEvents: 'none',
  });
  ctaNotes.appendChild(el);
  setTimeout(() => el.remove(), (dur + del) * 1000 + 500);
}

// Only run the note animation while the contact section is on screen
let noteTimer = null;
if (!reduceMotion && ctaNotes) {
  const ctaSection = document.getElementById('contact');
  const ctaObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (!noteTimer) noteTimer = setInterval(spawnNote, 600);
    } else if (noteTimer) {
      clearInterval(noteTimer);
      noteTimer = null;
    }
  }, { threshold: 0 });
  ctaObserver.observe(ctaSection);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  WAVEFORM ENGINE
//  Each track gets its own unique pseudo-random shape, pre-generated once and
//  cached. On every animation frame we only redraw bars — no overlay div needed.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Multi-octave noise for each track ────────────────────────────────────────
function generateWaveData(trackIndex, numBars) {
  const rand = mulberry32(trackIndex * 9973 + 1234);

  // Build random "control points" at low frequency, then interpolate + add harmonics
  const cp1Count = Math.floor(numBars / 12);
  const cp2Count = Math.floor(numBars / 5);
  const cp3Count = Math.floor(numBars / 2);

  const cp1 = Array.from({ length: cp1Count + 2 }, () => 0.15 + rand() * 0.85);
  const cp2 = Array.from({ length: cp2Count + 2 }, () => rand() * 0.5);
  const cp3 = Array.from({ length: cp3Count + 2 }, () => rand() * 0.25);

  function lerp(arr, t) {
    const scaled = t * (arr.length - 1);
    const i      = Math.floor(scaled);
    const f      = scaled - i;
    return (arr[i] ?? 0) * (1 - f) + (arr[Math.min(i + 1, arr.length - 1)] ?? 0) * f;
  }

  // Silence envelope: fade edges slightly for realism
  function envelope(i, total) {
    const x = i / total;
    const edgeFade = Math.min(x / 0.03, 1) * Math.min((1 - x) / 0.03, 1);
    return edgeFade;
  }

  const data = new Float32Array(numBars);
  for (let i = 0; i < numBars; i++) {
    const t   = i / numBars;
    const v   = lerp(cp1, t) * 0.6 + lerp(cp2, t) * 0.25 + lerp(cp3, t) * 0.15;
    data[i]   = Math.max(0.04, Math.min(1, v * envelope(i, numBars)));
  }
  return data;
}

// ── Draw waveform from cached data ────────────────────────────────────────────
// Colors
const COLOR_PLAYED   = '#C9A84C';
const COLOR_UNPLAYED = 'rgba(139,155,180,0.28)';
const COLOR_PLAYED_DIM = 'rgba(201,168,76,0.45)'; // paused state

function renderWaveform(canvas, waveData, progress, isPlaying) {
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.clientWidth;
  const H   = canvas.clientHeight;

  if (W === 0 || H === 0) return;

  // Only resize backing store when dimensions change
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  const ctx  = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const BAR_W   = 2.5;
  const GAP     = 1.5;
  const STEP    = BAR_W + GAP;
  const numBars = waveData.length;
  const totalW  = numBars * STEP - GAP;
  const offsetX = (W - totalW) / 2;

  const playedColor = isPlaying ? COLOR_PLAYED : COLOR_PLAYED_DIM;

  for (let i = 0; i < numBars; i++) {
    const x       = offsetX + i * STEP;
    const barH    = Math.max(2, waveData[i] * (H - 4));
    const y       = (H - barH) / 2;
    const pct     = i / numBars;
    const played  = pct < progress;

    ctx.fillStyle = played ? playedColor : COLOR_UNPLAYED;
    ctx.beginPath();
    ctx.roundRect(x, y, BAR_W, barH, 1.5);
    ctx.fill();

    // Playhead: glowing bar at current position
    if (progress > 0 && Math.abs(pct - progress) < (1 / numBars) * 1.5) {
      ctx.fillStyle = 'rgba(255, 220, 120, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x, 0, BAR_W, H, 1.5);
      ctx.fill();
    }
  }
}

// ── Per-track state store ─────────────────────────────────────────────────────
const trackStates = new Map(); // element → { waveData, progress, isPlaying }

function initTrackWaveform(item, trackIndex) {
  const canvas  = item.querySelector('.waveform-canvas');

  // Wait for layout to be ready
  requestAnimationFrame(() => {
    const W    = canvas.clientWidth || 300;
    const STEP = 4;
    const num  = Math.floor(W / STEP);

    const waveData = generateWaveData(trackIndex, num);
    trackStates.set(item, { waveData, progress: 0, isPlaying: false });
    renderWaveform(canvas, waveData, 0, false);
  });
}

// Initialise all tracks
document.querySelectorAll('.track-item').forEach((item, i) => {
  initTrackWaveform(item, i);
});

// Re-init on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('.track-item').forEach((item, i) => {
      initTrackWaveform(item, i);
    });
    // Re-decode the real waveform for whatever is currently loaded
    if (currentItem) loadRealWaveform(currentItem);
  }, 150);
});

// ── Real waveform: decode the actual audio and replace the synthetic shape ────
// Lazy — only runs when a track is first played, so page load stays light.
let sharedAudioCtx = null;

function computePeaks(audioBuffer, numBars) {
  const ch    = audioBuffer.getChannelData(0); // first channel is enough
  const block = Math.max(1, Math.floor(ch.length / numBars));
  const peaks = new Float32Array(numBars);
  let max = 0;
  for (let i = 0; i < numBars; i++) {
    let peak = 0;
    const start = i * block;
    const end   = Math.min(start + block, ch.length);
    for (let j = start; j < end; j++) {
      const v = Math.abs(ch[j]);
      if (v > peak) peak = v;
    }
    peaks[i] = peak;
    if (peak > max) max = peak;
  }
  // normalise to 0..1 with a small floor so silence still shows a sliver
  for (let i = 0; i < numBars; i++) {
    peaks[i] = Math.max(0.04, max > 0 ? peaks[i] / max : 0.04);
  }
  return peaks;
}

async function loadRealWaveform(item) {
  const state = trackStates.get(item);
  if (!state || state.realLoaded) return;
  state.realLoaded = true; // claim it early to avoid duplicate fetches
  try {
    sharedAudioCtx = sharedAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const res     = await fetch(item.dataset.src); // MP3 — decodable everywhere
    const bytes   = await res.arrayBuffer();
    const decoded = await sharedAudioCtx.decodeAudioData(bytes);
    state.waveData = computePeaks(decoded, state.waveData.length);
    renderWaveform(item.querySelector('.waveform-canvas'), state.waveData, state.progress, state.isPlaying);
  } catch (err) {
    state.realLoaded = false; // let it retry on the next play
    console.info('Waveform decode skipped:', err);
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
//  AUDIO PLAYER
// ═══════════════════════════════════════════════════════════════════════════════
const audio       = document.getElementById('globalAudio');
let   currentItem = null;
let   rafId       = null;

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return '—:——';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ── Animate progress on every frame ──────────────────────────────────────────
function tick() {
  if (!currentItem || !audio.duration) {
    rafId = requestAnimationFrame(tick);
    return;
  }

  const progress = audio.currentTime / audio.duration;
  const state    = trackStates.get(currentItem);
  if (state) {
    state.progress  = progress;
    state.isPlaying = !audio.paused;
    const canvas = currentItem.querySelector('.waveform-canvas');
    renderWaveform(canvas, state.waveData, progress, !audio.paused);
  }

  currentItem.querySelector('.current-time').textContent = formatTime(audio.currentTime);
  currentItem.querySelector('.duration').textContent     = formatTime(audio.duration);

  rafId = requestAnimationFrame(tick);
}
rafId = requestAnimationFrame(tick); // start loop immediately

// ── UI helpers ────────────────────────────────────────────────────────────────
function setPlaying(item, playing) {
  item.querySelector('.icon-play').classList.toggle('hidden', playing);
  item.querySelector('.icon-pause').classList.toggle('hidden', !playing);
  item.classList.toggle('active', playing);
}

function resetItem(item) {
  setPlaying(item, false);
  const state = trackStates.get(item);
  if (state) {
    state.progress  = 0;
    state.isPlaying = false;
    renderWaveform(item.querySelector('.waveform-canvas'), state.waveData, 0, false);
  }
  item.querySelector('.current-time').textContent = '0:00';
}

// ── Seek via waveform click ───────────────────────────────────────────────────
function seekFromClick(item, clientX) {
  if (!audio.duration) return;
  const wf   = item.querySelector('.track-waveform');
  const rect = wf.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
}

// ── Wire up each track ────────────────────────────────────────────────────────
document.querySelectorAll('.track-item').forEach(item => {
  // MP3/OGG smart src: prefer MP3 (Safari/iOS), fall back to OGG
  const canPlayOgg = audio.canPlayType('audio/ogg; codecs="vorbis"') !== '';
  const src = canPlayOgg
    ? (item.dataset.srcOgg || item.dataset.src)
    : item.dataset.src; // data-src is now MP3

  function triggerPlayPause() {
    if (currentItem === item) {
      if (audio.paused) {
        audio.play();
        setPlaying(item, true);
      } else {
        audio.pause();
        setPlaying(item, false);
      }
    } else {
      if (currentItem) resetItem(currentItem);
      currentItem = item;
      audio.src = src;
      audio.play().catch(err => console.info('Audio:', err));
      setPlaying(item, true);
      loadRealWaveform(item); // swap the synthetic waveform for the real one
    }
  }

  // Waveform: seek on click / drag
  const waveEl = item.querySelector('.track-waveform');

  let dragging = false;

  waveEl.addEventListener('mousedown', e => {
    e.stopPropagation();
    if (currentItem === item) {
      dragging = true;
      seekFromClick(item, e.clientX);
    }
  });

  window.addEventListener('mousemove', e => {
    if (dragging && currentItem === item) seekFromClick(item, e.clientX);
  });

  window.addEventListener('mouseup', () => { dragging = false; });

  // Touch seek
  waveEl.addEventListener('touchstart', e => {
    e.stopPropagation();
    if (currentItem === item) seekFromClick(item, e.touches[0].clientX);
  }, { passive: true });

  // Play / pause via row click
  item.addEventListener('click', e => {
    if (waveEl.contains(e.target)) return;
    triggerPlayPause();
  });

  // ── Keyboard accessibility ────────────────────────────────────────────────
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent page scroll on spacebar
      triggerPlayPause();
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
               currentItem === item && audio.duration) {
      e.preventDefault(); // seek ±5s with the arrow keys
      const delta = e.key === 'ArrowRight' ? 5 : -5;
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
    }
  });
});

// ── Global audio events ───────────────────────────────────────────────────────
audio.addEventListener('ended', () => {
  if (currentItem) resetItem(currentItem);
  currentItem = null;
});

audio.addEventListener('loadedmetadata', () => {
  if (currentItem) {
    currentItem.querySelector('.duration').textContent = formatTime(audio.duration);
  }
});

// ─── TESTIMONIALS CAROUSEL ────────────────────────────────────────────────────
(function () {
  const track  = document.getElementById('carouselTrack');
  const dotsEl = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!track) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });

  resetAuto();
})();
