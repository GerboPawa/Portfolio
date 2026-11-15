/* ==========================================================================
   FILIPPO GERBINO — PORTFOLIO V2 — script.js
   Shared across pages: every module checks its own elements before running.
   ========================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch      = window.matchMedia('(hover: none)').matches;

  /* ── Analytics events (GoatCounter, cookieless) ──────────────────────── */
  function track(name) {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({ path: name, title: name, event: true });
      }
    } catch (e) {}
  }
  // where do "Start a Project" clicks come from?
  document.querySelectorAll('a[href*="start-a-project"]').forEach(a => {
    a.addEventListener('click', () => {
      const zone = a.closest('section, header, nav, .player-bar');
      track('cta-start-project--' + ((zone && zone.id) || 'page'));
    });
  });

  /* ── Footer year ─────────────────────────────────────────────────────── */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ── Nav: scrolled state + scroll progress ───────────────────────────── */
  const nav            = document.getElementById('nav');
  const scrollProgress = document.getElementById('scrollProgress');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (scrollProgress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ─────────────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    const setMenu = (open) => {
      navLinks.classList.toggle('open', open);
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) && !hamburger.contains(e.target)) setMenu(false);
    });
  }

  /* ── Scroll reveal ───────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ── Hero: floating note glyphs canvas ───────────────────────────────── */
  const notesCanvas = document.getElementById('notesCanvas');
  if (notesCanvas) {
    const ctx = notesCanvas.getContext('2d');
    const GLYPHS = ['♪', '♫', '♩', '𝄞', '𝄢', '♭', '♯'];
    let W, H, dpr, particles = [];
    let mouseX = 0.5, mouseY = 0.5;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = notesCanvas.clientWidth;
      H = notesCanvas.clientHeight;
      notesCanvas.width  = W * dpr;
      notesCanvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      const count = Math.min(38, Math.floor(W / 34));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 11 + Math.random() * 17,
        speed: 0.12 + Math.random() * 0.3,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.008,
        depth: 0.3 + Math.random() * 0.7,
        alpha: 0.05 + Math.random() * 0.16,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const px = (mouseX - 0.5) * 26;
      const py = (mouseY - 0.5) * 18;
      for (const p of particles) {
        p.y -= p.speed;
        p.sway += p.swaySpeed;
        if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; }
        const x = p.x + Math.sin(p.sway) * 14 + px * p.depth;
        const y = p.y + py * p.depth;
        ctx.font = p.size + 'px serif';
        ctx.fillStyle = 'rgba(201, 168, 76, ' + p.alpha + ')';
        ctx.fillText(p.glyph, x, y);
      }
    }

    const hero = document.getElementById('hero');

    resize();
    spawn();
    if (reduceMotion) {
      draw(); // one static frame
    } else {
      // animate only while the hero is on screen and the tab is visible:
      // no point burning CPU/battery on a canvas nobody can see
      let onScreen = true, rafId = 0;
      const tick = () => { rafId = 0; draw(); run(); };
      const run  = () => { if (!rafId && onScreen && !document.hidden) rafId = requestAnimationFrame(tick); };
      if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          onScreen = entries[entries.length - 1].isIntersecting;
          run();
        }).observe(hero);
      }
      document.addEventListener('visibilitychange', run);
      run();
    }
    // phones fire "resize" every time the address bar slides in or out: rebuild the
    // particles only when the size really changed, and at most once per frame
    let resizeQueued = false;
    window.addEventListener('resize', () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        if (notesCanvas.clientWidth === W && notesCanvas.clientHeight === H) return;
        const widthChanged = notesCanvas.clientWidth !== W;
        resize();
        if (widthChanged) spawn();
        if (reduceMotion) draw();
      });
    });

    // mouse parallax + spotlight
    const glow = document.getElementById('heroGlow');
    if (hero && !isTouch) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        mouseX = (e.clientX - r.left) / r.width;
        mouseY = (e.clientY - r.top)  / r.height;
        if (glow) {
          glow.style.setProperty('--mx', (mouseX * 100) + '%');
          glow.style.setProperty('--my', (mouseY * 100) + '%');
        }
      }, { passive: true });
    }
  }

  /* ── Magnetic buttons ────────────────────────────────────────────────── */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = 'translate(' + (dx * 5) + 'px,' + (dy * 5 - 2) + 'px)';
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ── Tilt cards ──────────────────────────────────────────────────────── */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top)  / r.height;
        card.style.transform =
          'perspective(900px) rotateX(' + ((0.5 - py) * 5) + 'deg) rotateY(' + ((px - 0.5) * 5) + 'deg) translateY(-3px)';
        card.style.setProperty('--cx', (px * 100) + '%');
        card.style.setProperty('--cy', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     AUDIO PLAYER — track rows + persistent bottom bar
     ═════════════════════════════════════════════════════════════════════ */
  const audio  = document.getElementById('globalAudio');
  const rows   = Array.from(document.querySelectorAll('.track-item'));

  if (audio && rows.length) {
    const playerBar = document.getElementById('playerBar');
    const pbPlay    = document.getElementById('pbPlay');
    const pbPrev    = document.getElementById('pbPrev');
    const pbNext    = document.getElementById('pbNext');
    const pbClose   = document.getElementById('pbClose');
    const pbTitle   = document.getElementById('pbTitle');
    const pbGenre   = document.getElementById('pbGenre');
    const pbTime    = document.getElementById('pbTime');
    const pbWave    = document.getElementById('pbWave');
    const pbCanvas  = document.getElementById('pbCanvas');

    let current = -1;   // index into rows
    let barOpen = false;

    /* deterministic pseudo-waveform peaks per track */
    function makePeaks(seedStr, n) {
      let seed = 0;
      for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const peaks = [];
      let v = 0.5;
      for (let i = 0; i < n; i++) {
        v += (rand() - 0.5) * 0.55;
        v = Math.max(0.12, Math.min(1, v));
        // gentle envelope so it looks like a piece of music
        const env = 0.35 + 0.65 * Math.sin((i / n) * Math.PI) * (0.7 + 0.3 * rand());
        peaks.push(Math.max(0.08, v * env));
      }
      return peaks;
    }

    const trackData = rows.map((row, i) => {
      const title = row.querySelector('.track-title')?.textContent.trim() || ('Track ' + (i + 1));
      const base  = (row.dataset.src || '').split('/').pop().replace(/\.[^.]+$/, '');
      // optional chapters: data-chapters='[[seconds,"Label"],…]' (used by the reel)
      let chapters = [];
      try {
        chapters = JSON.parse(row.dataset.chapters || '[]').map(c => ({ t: +c[0], label: String(c[1]) }));
      } catch (e) {}
      return {
        row,
        src:   row.dataset.src,
        slug:  base,
        title,
        titleEl: row.querySelector('.track-title'),
        genreEl: row.querySelector('.track-genre'),
        peaks: (window.TRACK_PEAKS || {})[base] || makePeaks(title, 96),
        canvas: row.querySelector('.waveform-canvas'),
        curEl:  row.querySelector('.current-time'),
        durEl:  row.querySelector('.duration'),
        duration: parseFloat(row.dataset.duration) || 0,
        chapters,
        chapter: -1,                 // index of the chapter being played
        chips: [],
        chipBox: row.dataset.chaptersList ? document.getElementById(row.dataset.chaptersList) : null,
        nowEl:   row.querySelector('.reel-now'),
      };
    });

    function fmt(t) {
      if (!isFinite(t) || t < 0) t = 0;
      const m = Math.floor(t / 60), s = Math.floor(t % 60);
      return m + ':' + String(s).padStart(2, '0');
    }

    // read live from the DOM, so the bar follows the EN/IT switch
    const titleOf = (t) => (t.titleEl ? t.titleEl.textContent.trim() : '') || t.title;
    const genreOf = (t) => (t.genreEl ? t.genreEl.textContent.trim() : '');
    const chapterText = (ch) => fmt(ch.t) + ' · ' + ch.label;

    // chapter boundaries as fractions of the track, for tick marks on the waveform
    function marksOf(t) {
      const dur = t.duration || 0;
      if (!t.chapters.length || !dur) return null;
      return t.chapters.filter(c => c.t > 0).map(c => c.t / dur);
    }

    trackData.forEach(t => { if (t.duration && t.durEl) t.durEl.textContent = fmt(t.duration); });

    /* waveform drawing (base + progress in one pass) */
    function drawWave(canvas, peaks, progress, active, marks) {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
      const c = canvas.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      const n = peaks.length;
      const gap = 2;
      const bw = Math.max(1.5, (w - gap * n) / n);
      for (let i = 0; i < n; i++) {
        const x = i * (bw + gap);
        const bh = Math.max(2, peaks[i] * (h - 4));
        const played = (i / n) < progress;
        c.fillStyle = played
          ? (active ? '#EBCD75' : 'rgba(201,168,76,0.75)')
          : (active ? 'rgba(201,168,76,0.38)' : 'rgba(255,255,255,0.13)');
        const y = (h - bh) / 2;
        c.beginPath();
        if (c.roundRect) { c.roundRect(x, y, bw, bh, 1.5); c.fill(); }
        else c.fillRect(x, y, bw, bh);
      }
      if (marks) {
        c.fillStyle = active ? 'rgba(240,233,216,0.7)' : 'rgba(201,168,76,0.6)';
        marks.forEach(m => c.fillRect(Math.round(m * w), 0, 1, h));
      }
    }

    function drawAllStatic() {
      trackData.forEach((t, i) => {
        const prog = (i === current && audio.duration) ? (audio.currentTime / audio.duration) : 0;
        drawWave(t.canvas, t.peaks, prog, i === current, marksOf(t));
      });
    }

    /* chapters (reel): which one is playing, chips, labels */
    function chapterAt(t, time) {
      let idx = -1;
      for (let k = 0; k < t.chapters.length; k++) if (time + 0.05 >= t.chapters[k].t) idx = k;
      return idx;
    }
    function setChapter(t, idx) {
      if (t.chapter === idx) return;
      t.chapter = idx;
      const ch = t.chapters[idx];
      t.chips.forEach((chip, k) => {
        chip.classList.toggle('active', k === idx);
        if (k === idx) chip.setAttribute('aria-current', 'true');
        else chip.removeAttribute('aria-current');
      });
      if (t.nowEl) {
        t.nowEl.textContent = ch ? chapterText(ch) : '';
        t.nowEl.classList.toggle('hidden', !ch);
        if (t.genreEl) t.genreEl.classList.toggle('hidden', !!ch);
      }
      if (pbGenre && trackData[current] === t) pbGenre.textContent = ch ? chapterText(ch) : genreOf(t);
      // keep the active chip in view inside a horizontally scrolling strip (never scrolls the page)
      const chip = t.chips[idx];
      if (chip && t.chipBox && t.chipBox.scrollWidth > t.chipBox.clientWidth) {
        t.chipBox.scrollTo({
          left: chip.offsetLeft - (t.chipBox.clientWidth - chip.offsetWidth) / 2,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      }
    }

    /* lazy duration fetch — one file at a time, only after the page has
       fully loaded, so it never competes with first paint */
    function probeDurations() {
      let i = 0;
      const next = () => {
        if (i >= trackData.length) return;
        // never compete with actual playback for bandwidth
        if (!audio.paused) { setTimeout(next, 2000); return; }
        const t = trackData[i++];
        if (t.duration) { next(); return; }
        const probe = new Audio();
        probe.preload = 'metadata';
        const done = () => { probe.removeAttribute('src'); setTimeout(next, 200); };
        probe.addEventListener('loadedmetadata', () => {
          t.duration = probe.duration;
          if (t.durEl) t.durEl.textContent = fmt(probe.duration);
          done();
        }, { once: true });
        probe.addEventListener('error', done, { once: true });
        probe.src = t.src;
      };
      next();
    }
    if (document.readyState === 'complete') setTimeout(probeDurations, 500);
    else window.addEventListener('load', () => setTimeout(probeDurations, 500), { once: true });

    function openBar() {
      if (!playerBar || barOpen) return;
      barOpen = true;
      playerBar.classList.add('visible');
      playerBar.setAttribute('aria-hidden', 'false');
      document.body.classList.add('player-open');
    }
    function closeBar() {
      if (!playerBar) return;
      barOpen = false;
      audio.pause();
      playerBar.classList.remove('visible');
      playerBar.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('player-open');
    }

    function setRowState() {
      trackData.forEach((t, i) => {
        const activeNow = i === current && !audio.paused;
        t.row.classList.toggle('active', i === current);
        t.row.querySelector('.icon-play')?.classList.toggle('hidden', activeNow);
        t.row.querySelector('.icon-pause')?.classList.toggle('hidden', !activeNow);
      });
      if (pbPlay) {
        pbPlay.querySelector('.icon-play')?.classList.toggle('hidden', !audio.paused);
        pbPlay.querySelector('.icon-pause')?.classList.toggle('hidden', audio.paused);
      }
      document.querySelectorAll('.proj-track-link').forEach(btn => {
        btn.classList.toggle('playing',
          current >= 0 && btn.dataset.playSrc === trackData[current].src && !audio.paused);
      });
      drawAllStatic();
    }

    function load(i, autoplay = true) {
      if (i < 0) i = trackData.length - 1;
      if (i >= trackData.length) i = 0;
      if (current >= 0 && current !== i) setChapter(trackData[current], -1);
      current = i;
      const t = trackData[i];
      audio.src = t.src;
      if (pbTitle) pbTitle.textContent = titleOf(t);
      if (pbGenre) pbGenre.textContent = genreOf(t);
      openBar();
      if (autoplay) {
        audio.play().catch(() => {});
        track('track-play--' + (t.slug || String(i + 1).padStart(2, '0')));
      }
      setRowState();
    }

    function toggle(i) {
      if (i === current) {
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
        setRowState();
      } else {
        load(i);
      }
    }

    /* row interactions */
    trackData.forEach((t, i) => {
      t.row.addEventListener('click', () => toggle(i));
      t.row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); }
      });
      // seek by clicking the row waveform
      const waveBox = t.row.querySelector('.track-waveform');
      if (waveBox) {
        waveBox.addEventListener('click', (e) => {
          e.stopPropagation();
          const r = waveBox.getBoundingClientRect();
          const frac = (e.clientX - r.left) / r.width;
          if (i !== current) load(i);
          const seekWhenReady = () => {
            if (audio.duration) audio.currentTime = frac * audio.duration;
          };
          if (audio.duration) seekWhenReady();
          else audio.addEventListener('loadedmetadata', seekWhenReady, { once: true });
        });
      }
    });

    /* jump to a point of a track (loads it first if it isn't the current one) */
    function seekTo(i, time) {
      const go = () => { try { audio.currentTime = time; } catch (e) {} };
      if (i !== current) {
        load(i);
        audio.addEventListener('loadedmetadata', go, { once: true });
      } else {
        if (audio.readyState >= 1) go();
        else audio.addEventListener('loadedmetadata', go, { once: true });
        if (audio.paused) audio.play().catch(() => {});
      }
    }

    /* chapter chips: one clickable timestamp per chapter */
    trackData.forEach((t, i) => {
      if (!t.chapters.length || !t.chipBox) return;
      t.chapters.forEach((ch) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'reel-chip';
        const time = document.createElement('span');
        time.className = 'reel-chip-t';
        time.textContent = fmt(ch.t);
        const label = document.createElement('span');
        label.textContent = ch.label;
        chip.append(time, label);
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          seekTo(i, ch.t);
          track('reel-chapter--' + ch.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
        });
        t.chipBox.appendChild(chip);
        t.chips.push(chip);
      });
    });

    /* project-card quick links */
    document.querySelectorAll('.proj-track-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = trackData.findIndex(t => t.src === btn.dataset.playSrc);
        if (i >= 0) toggle(i);
      });
    });

    /* hero "Listen" button: play first track + scroll to portfolio */
    const heroListen = document.getElementById('heroListenBtn');
    if (heroListen) {
      heroListen.addEventListener('click', () => {
        load(0);
        document.getElementById('portfolio')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    /* bar controls */
    pbPlay?.addEventListener('click', () => { if (current >= 0) toggle(current); else load(0); });
    pbPrev?.addEventListener('click', () => load(current - 1));
    pbNext?.addEventListener('click', () => load(current + 1));
    pbClose?.addEventListener('click', closeBar);

    /* bar waveform seek */
    if (pbWave) {
      pbWave.addEventListener('click', (e) => {
        if (current < 0 || !audio.duration) return;
        const r = pbWave.getBoundingClientRect();
        audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
      });
    }

    /* audio events */
    audio.addEventListener('timeupdate', () => {
      if (current < 0) return;
      const t = trackData[current];
      const dur = audio.duration || t.duration || 0;
      const prog = dur ? audio.currentTime / dur : 0;
      if (t.curEl) t.curEl.textContent = fmt(audio.currentTime);
      if (pbTime)  pbTime.textContent  = fmt(audio.currentTime) + ' / ' + fmt(dur);
      if (t.chapters.length) setChapter(t, chapterAt(t, audio.currentTime));
      const marks = marksOf(t);
      drawWave(t.canvas, t.peaks, prog, true, marks);
      if (pbCanvas) drawWave(pbCanvas, t.peaks, prog, true, marks);
    });
    audio.addEventListener('loadedmetadata', () => {
      if (current < 0) return;
      const t = trackData[current];
      t.duration = audio.duration;
      if (t.durEl) t.durEl.textContent = fmt(audio.duration);
      if (pbTime)  pbTime.textContent  = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
    });
    // language switched: refresh the texts the bar copied from the row
    window.addEventListener('langchange', () => {
      if (current < 0) return;
      const t = trackData[current];
      if (pbTitle) pbTitle.textContent = titleOf(t);
      if (pbGenre && t.chapter < 0) pbGenre.textContent = genreOf(t);
    });
    audio.addEventListener('play',  setRowState);
    audio.addEventListener('pause', setRowState);
    audio.addEventListener('ended', () => load(current + 1)); // auto-advance

    // redraw the waveforms at most once per frame while the window is being resized
    let waveQueued = false;
    window.addEventListener('resize', () => {
      if (waveQueued) return;
      waveQueued = true;
      requestAnimationFrame(() => { waveQueued = false; drawAllStatic(); });
    });
    drawAllStatic();
  }

  /* ══════════════════════════════════════════════════════════════════════
     YOUTUBE FACADES — the heavy player loads only when clicked.
     Also keeps videos and the track player from talking over each other.
     ═════════════════════════════════════════════════════════════════════ */
  const globalAudioEl = document.getElementById('globalAudio');
  const ytFrames = {}; // yt video id -> live iframe

  function ytPost(frame, payload) {
    try { frame.contentWindow?.postMessage(JSON.stringify(payload), '*'); } catch (e) {}
  }
  function ytHandshake() {
    Object.values(ytFrames).forEach(f =>
      ytPost(f, { event: 'listening', id: f.dataset.ytId, channel: 'widget' }));
  }
  function ytCreate(facade, startAt) {
    const id = facade.dataset.ytId;
    if (ytFrames[id]) return ytFrames[id];
    const iframe = document.createElement('iframe');
    // no autoplay: when the browser denies it, the player can hang on a black
    // screen — one extra click on YouTube's own play button is always safe
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?enablejsapi=1' +
                 (startAt ? '&start=' + startAt : '');
    iframe.title = facade.dataset.ytTitle || 'YouTube video';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.dataset.ytId = id;
    iframe.addEventListener('load', () => setTimeout(ytHandshake, 600));
    ytFrames[id] = iframe;
    facade.innerHTML = '';
    facade.appendChild(iframe);
    facade.classList.add('yt-loaded');
    facade.removeAttribute('role');
    facade.removeAttribute('tabindex');
    globalAudioEl?.pause(); // don't talk over the video
    track('video-play--' + (facade.dataset.ytName || id));
    return iframe;
  }

  document.querySelectorAll('.yt-facade').forEach(facade => {
    facade.addEventListener('click', () => ytCreate(facade));
    facade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ytCreate(facade); }
    });
  });

  // a YouTube video started → pause the track player
  window.addEventListener('message', (e) => {
    if (!/^https:\/\/([^/]*\.)?youtube(-nocookie)?\.com$/.test(e.origin)) return;
    if (typeof e.data !== 'string') return;
    try {
      const d = JSON.parse(e.data);
      if (d.event === 'infoDelivery' && d.info && d.info.playerState === 1 &&
          globalAudioEl && !globalAudioEl.paused) {
        globalAudioEl.pause();
      }
    } catch (err) {}
  });

  // a track started → pause any playing YouTube video
  if (globalAudioEl) {
    globalAudioEl.addEventListener('play', () => {
      Object.values(ytFrames).forEach(f =>
        ytPost(f, { event: 'command', func: 'pauseVideo', args: [] }));
    });
  }

  /* ── Implementation video: chapter chips (create player / seek) ──────── */
  document.querySelectorAll('.impl-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const t = parseInt(chip.dataset.seek, 10) || 0;
      const facade = chip.closest('.impl-item')?.querySelector('.yt-facade');
      if (!facade) return;
      globalAudioEl?.pause();
      const frame = ytFrames[facade.dataset.ytId];
      if (frame) {
        ytPost(frame, { event: 'command', func: 'seekTo', args: [t, true] });
        ytPost(frame, { event: 'command', func: 'playVideo', args: [] });
      } else {
        ytCreate(facade, t);
      }
    });
  });

  /* ── Cinematic rescore carousel ──────────────────────────────────────── */
  (function () {
    const carousel = document.getElementById('rescoreCarousel');
    const track    = document.getElementById('rescoreTrack');
    const prevBtn  = document.getElementById('rescorePrev');
    const nextBtn  = document.getElementById('rescoreNext');
    const dots     = Array.from(document.querySelectorAll('#rescoreDots .rescore-dot'));
    if (!carousel || !track || !dots.length) return;

    const slides = Array.from(track.children);
    let index = 0;

    function goTo(i) {
      const from = slides[index];
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach((d, di) => d.classList.toggle('active', di === index));

      // pause whatever video/audio was playing on the slide we're leaving
      if (from && from !== slides[index]) {
        const facade = from.querySelector('.yt-facade');
        const frame  = facade && ytFrames[facade.dataset.ytId];
        if (frame) ytPost(frame, { event: 'command', func: 'pauseVideo', args: [] });
      }
    }

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', 'Cinematic rescore examples');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    // basic swipe support on touch
    let touchX = null;
    track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? index + 1 : index - 1);
      touchX = null;
    }, { passive: true });
  })();

  /* ── FAQ accordion ───────────────────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Contact form (Formspree) ────────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const successEl = document.getElementById('formSuccess');
    const errorEl   = document.getElementById('formError');
    const submitBtn = document.getElementById('contactSubmit');
    const T = (key, fallback) => (window.i18n && window.i18n.t(key) !== key) ? window.i18n.t(key) : fallback;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;

      submitBtn.disabled = true;
      const label = submitBtn.querySelector('.btn-label');
      const original = label.textContent;
      label.textContent = T('form.sending', 'Sending…');
      errorEl.classList.add('hidden');

      try {
        const res = await fetch('https://formspree.io/f/mkoaqpop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name:    contactForm.name.value,
            email:   contactForm.email.value,
            message: contactForm.message.value,
          }),
        });
        if (!res.ok) throw new Error('server');
        track('contact-sent');
        contactForm.classList.add('hidden');
        successEl.classList.remove('hidden');
        successEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      } catch {
        errorEl.textContent = T('form.error', 'Something went wrong — please email contact@filippogerbino.com directly.');
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        label.textContent = original;
      }
    });
  }

  /* ── Shop: free downloads via Kit ────────────────────────────────────── */
  // Each .shop-form carries its Kit form ID in data-kit-form. The endpoint below
  // must match the form action of the HTML embed code Kit shows for that form.
  const shopForms = document.querySelectorAll('.shop-form');
  if (shopForms.length) {
    const T = (key, fallback) => (window.i18n && window.i18n.t(key) !== key) ? window.i18n.t(key) : fallback;
    const kitEndpoint = (id) => 'https://app.kit.com/forms/' + encodeURIComponent(id) + '/subscriptions';

    shopForms.forEach(form => {
      const card    = form.closest('.shop-card');
      const success = card.querySelector('.form-success');
      const errorEl = card.querySelector('.form-error');
      const btn     = form.querySelector('button[type="submit"]');
      const label   = btn.querySelector('.btn-label');
      const slug    = form.dataset.product || 'unknown';

      const showError = () => {
        errorEl.textContent = T('shop.error', 'Something went wrong — please email contact@filippogerbino.com and I’ll send you the PDF.');
        errorEl.classList.remove('hidden');
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        if (form.elements.website.value) return; // honeypot: only bots fill it
        errorEl.classList.add('hidden');

        const formId = (form.dataset.kitForm || '').trim();
        if (!formId) {
          console.warn('[shop] data-kit-form is empty for "' + slug + '" — connect it to a Kit form first.');
          showError();
          return;
        }

        btn.disabled = true;
        const original = label.textContent;
        label.textContent = T('form.sending', 'Sending…');

        try {
          const body = new FormData();
          body.append('email_address', form.elements.email_address.value);
          // optional newsletter consent: Kit stores it as a tag (field "tags[]", value = tag ID)
          const consent = form.elements.consent;
          if (consent && consent.checked && consent.dataset.kitField) {
            body.append(consent.dataset.kitField, consent.dataset.kitValue || '1');
          }
          const res = await fetch(kitEndpoint(formId), {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body,
          });
          if (!res.ok) throw new Error('server');
          track('shop-free-request--' + slug);
          form.classList.add('hidden');
          success.classList.remove('hidden');
        } catch {
          showError();
          btn.disabled = false;
          label.textContent = original;
        }
      });
    });
  }
})();
