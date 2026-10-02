/* ============================================================
   ICHTY TE — PORTFOLIO · ADVANCED MOTION ENGINE
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ── LOADER ────────────────────────────────────────────────
   Real progress: waits on the actual fonts + preloads every image
   on the page, so the percentage reflects genuine load state rather
   than a scripted count. The displayed number eases toward the real
   fraction for a smooth read. */
(function () {
  const loader = document.getElementById('loader');
  const numEl  = document.getElementById('loader-number');
  const barEl  = document.getElementById('loader-bar-fill');
  const statusEl = document.getElementById('loader-status');
  if (!loader || !numEl) return;

  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØ#%&@*/<>';
  const randGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  function scrambleTo(el, text, duration) {
    if (REDUCED) { el.textContent = text; return; }
    const start = performance.now();
    (function frame(now) {
      const t = (now - start) / duration;
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === ' ') { out += ' '; continue; }
        out += (t >= 0.15 + (i / text.length) * 0.7) ? ch : randGlyph();
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame); else el.textContent = text;
    })(performance.now());
  }

  // Collect the real things we're waiting on: web fonts + every image src.
  const srcs = [...new Set(
    [...document.querySelectorAll('img')]
      .map(img => img.getAttribute('src'))
      .filter(Boolean)
  )];

  const tasks = [];
  if (document.fonts && document.fonts.ready) {
    tasks.push(document.fonts.ready.catch(() => {}));
  }
  srcs.forEach(src => {
    tasks.push(new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = src;
    }));
  });

  const total = tasks.length || 1;
  let done = 0;
  let target = 0;   // real fraction * 100
  tasks.forEach(p => p.then(() => { done++; target = Math.round((done / total) * 100); }));

  // Failsafes so the site always reveals even if an asset stalls.
  window.addEventListener('load', () => { target = 100; });
  setTimeout(() => { target = 100; }, 8000);

  // Minimum on-screen time so the ink animation always gets to play, even when
  // everything is cached and the real fraction jumps to 100 instantly.
  const MIN_MS = REDUCED ? 0 : 1500;
  const start = performance.now();

  let shown = 0, finished = false, statusDone = false;
  function loop(now) {
    now = now || performance.now();
    // The bar can't outrun real progress OR the minimum time, whichever is slower.
    const timeCap = MIN_MS ? Math.min(100, ((performance.now() - start) / MIN_MS) * 100) : 100;
    const eff = Math.min(target, timeCap);
    shown += (eff - shown) * 0.14;
    if (eff - shown < 0.6) shown = eff;
    const pct = Math.min(100, Math.round(shown));
    numEl.textContent = pct;
    if (barEl) barEl.style.width = pct + '%';
    if (statusEl && pct >= 100 && !statusDone) { statusDone = true; scrambleTo(statusEl, 'Ready', 420); }
    if (target >= 100 && eff >= 100 && pct >= 100) {
      if (!finished) { finished = true; setTimeout(finish, REDUCED ? 0 : 300); }
      return;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function finish() {
    document.body.classList.add('loaded');
    animateHeroName();
    loader.classList.add('wipe');                 // panels sweep up, revealing the hero
    setTimeout(() => loader.classList.add('gone'), REDUCED ? 0 : 1300);
  }
})();

/* ── HERO NAME: handed off clean from the loader ───────────
   No hover scramble here anymore — that effect now lives on the
   "Scroll to explore" link instead (see below). */
function animateHeroName() {
  const lines = document.querySelectorAll('.hero-name .bn-text');
  lines.forEach(el => { el.dataset.final = el.textContent.trim(); });
}

/* ── SCROLL-TO-EXPLORE: SCRAMBLE ON HOVER (name-style effect) ──
   Same scramble treatment the hero name used to have. */
(function () {
  const el = document.querySelector('.hero-scroll .scroll-label');
  const trigger = document.querySelector('.hero-scroll');
  if (!el || !trigger) return;
  el.dataset.final = el.textContent.trim();

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || REDUCED) return;

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØ#%&@*/<>';
  function scramble(duration) {
    const finalText = el.dataset.final;
    cancelAnimationFrame(el._raf);
    const start = performance.now();
    function frame(now) {
      const t = (now - start) / duration;
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        if (ch === ' ') { out += ' '; continue; }
        const revealAt = 0.15 + (i / finalText.length) * 0.7;
        out += (t >= revealAt) ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (t < 1) { el._raf = requestAnimationFrame(frame); }
      else { el.textContent = finalText; }
    }
    el._raf = requestAnimationFrame(frame);
  }
  trigger.addEventListener('mouseenter', () => scramble(700));
})();

/* ── NAV LINKS: SCRAMBLE ON HOVER (same effect as the name) ── */
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || REDUCED) return;
  const targets = document.querySelectorAll('.nav-link span, .nav-cta, .hero-socials .social-label');
  if (!targets.length) return;

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>';
  function scramble(el) {
    const finalText = el.dataset.final;
    cancelAnimationFrame(el._raf);
    const start = performance.now();
    const duration = 420;
    function frame(now) {
      const t = (now - start) / duration;
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        if (ch === ' ') { out += ' '; continue; }
        const revealAt = 0.15 + (i / finalText.length) * 0.7;
        out += (t >= revealAt) ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (t < 1) { el._raf = requestAnimationFrame(frame); }
      else { el.textContent = finalText; }
    }
    el._raf = requestAnimationFrame(frame);
  }

  targets.forEach(el => {
    el.dataset.final = el.textContent.trim();
    const trigger = el.closest('.nav-link') || el.closest('a') || el;
    trigger.addEventListener('mouseenter', () => scramble(el));
  });
})();

/* ── HOLD-TO-CONNECT (hold-to-charge → opens email) ──────── */
(function () {
  const btn = document.getElementById('hold-btn');
  if (!btn) return;
  const text = document.querySelector('.hold-text');
  const DURATION = 1000;
  let timer = null, done = false;

  function start(e) {
    if (done) return;
    if (e && e.pointerId != null && btn.setPointerCapture) {
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
    }
    btn.classList.add('holding');
    timer = setTimeout(complete, DURATION);
  }
  function cancel() {
    if (done) return;
    btn.classList.remove('holding');
    clearTimeout(timer);
  }
  function complete() {
    done = true;
    btn.classList.remove('holding');
    btn.classList.add('done');
    if (text) text.textContent = 'Opening mail…';
    window.location.href = 'mailto:ichty086@gmail.com';
    setTimeout(() => {
      done = false;
      btn.classList.remove('done');
      if (text) text.textContent = 'Hold to connect';
    }, 2600);
  }
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', cancel);
  btn.addEventListener('pointerleave', cancel);
  btn.addEventListener('pointercancel', cancel);
  btn.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && !done) { e.preventDefault(); complete(); }
  });
})();

/* ── HERO AURA: animated mesh gradient ─────────────────────
   Soft drifting gold light field that eases toward the cursor. */
(function () {
  const canvas = document.getElementById('hero-aura-canvas');
  const hero = document.getElementById('home');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, raf = null, running = false, t = 0;
  const target = { x: 0.42, y: 0.45 }, cur = { x: 0.42, y: 0.45 };
  const blobs = [
    { c: [255, 255, 255], r: 0.55, ax: 0.16, ay: 0.12, sx: 0.00022, sy: 0.00017, px: 0, py: 0 },
    { c: [210, 210, 210], r: 0.45, ax: 0.18, ay: 0.16, sx: 0.00015, sy: 0.00024, px: 2, py: 1 },
    { c: [150, 150, 150],   r: 0.62, ax: 0.20, ay: 0.10, sx: 0.00012, sy: 0.00019, px: 4, py: 3 },
  ];

  function resize() {
    w = hero.offsetWidth; h = hero.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    cur.x += (target.x - cur.x) * 0.06;
    cur.y += (target.y - cur.y) * 0.06;
    for (const b of blobs) {
      const cx = (0.4 + Math.sin(t * b.sx + b.px) * b.ax + (cur.x - 0.5) * 0.42) * w;
      const cy = (0.46 + Math.cos(t * b.sy + b.py) * b.ay + (cur.y - 0.5) * 0.42) * h;
      const rad = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.17)`);
      g.addColorStop(0.5, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.05)`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  // Throttle to ~33fps — the aura is a slow drift, so recreating its three
  // radial gradients 60x/sec is wasted work on lower-end machines.
  let lastFrame = 0;
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    now = now || performance.now();
    if (now - lastFrame < 30) return;
    t += now - lastFrame;
    lastFrame = now;
    draw();
  }
  function start() { if (!running) { running = true; lastFrame = performance.now(); raf = requestAnimationFrame(loop); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  resize();
  window.addEventListener('resize', resize);
  if (REDUCED) { draw(); return; }
  window.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    target.x = (e.clientX - rect.left) / w;
    target.y = (e.clientY - rect.top) / h;
  });
  new IntersectionObserver(([en]) => { if (en.isIntersecting) start(); else stop(); }, { threshold: 0 }).observe(hero);
})();

/* ── PAGE-WIDE AMBIENT AURA ────────────────────────────────
   A soft accent glow that eases toward the cursor across every
   section, so the whole page breathes with the same light. */
(function () {
  const aura = document.getElementById('page-aura');
  if (!aura) return;
  const setPos = (x, y) => {
    aura.style.setProperty('--ax', x.toFixed(1) + 'px');
    aura.style.setProperty('--ay', y.toFixed(1) + 'px');
  };
  let tx = innerWidth * 0.5, ty = innerHeight * 0.22, cx = tx, cy = ty;
  setPos(cx, cy);
  // Reduced motion: park a static glow and stop.
  if (REDUCED) return;
  let raf = null;
  function loop() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    setPos(cx, cy);
    if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
      raf = requestAnimationFrame(loop);
    } else { raf = null; }
  }
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
})();

/* ── INTERACTIVE HERO GRID ─────────────────────────────────
   A dot grid (aligned to the line grid) that glows + grows near
   the cursor. The signature hero interaction. */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('home');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const GAP = 64, BASE_R = 1.1, GLOW_R = 3.6, RADIUS = 150;
  let w = 0, h = 0, dots = [], raf = null, running = false;
  const mouse = { x: -9999, y: -9999 };
  let base = 'rgba(136,136,136,0.18)', accent = '255,255,255';

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    accent = (cs.getPropertyValue('--accent-rgb').trim()) || '255,255,255';
    base = (document.documentElement.getAttribute('data-theme') === 'light')
      ? 'rgba(0,0,0,0.14)' : 'rgba(160,160,160,0.16)';
  }
  function resize() {
    w = hero.offsetWidth; h = hero.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (let y = GAP; y < h; y += GAP)
      for (let x = GAP; x < w; x += GAP) dots.push({ x, y });
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
      const t = Math.max(0, 1 - dist / RADIUS);
      const r = BASE_R + t * t * (GLOW_R - BASE_R);
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fillStyle = t > 0.04
        ? `rgba(${accent}, ${0.2 + t * 0.8})`
        : base;
      ctx.fill();
    }
  }
  // Only repaint when the cursor actually moved — the dots are a pure function
  // of mouse position, so idle frames would redraw an identical image.
  let lastMx = NaN, lastMy = NaN;
  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (mouse.x === lastMx && mouse.y === lastMy) return;
    lastMx = mouse.x; lastMy = mouse.y;
    draw();
  }
  function start() { if (!running) { running = true; lastMx = lastMy = NaN; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

  readColors();
  resize();
  window.addEventListener('resize', resize);

  if (fine && !REDUCED) {
    window.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    // only animate while the hero is on screen
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) start(); else { stop(); mouse.x = mouse.y = -9999; draw(); }
    }, { threshold: 0 }).observe(hero);
  }
  // repaint base colors on theme change
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => setTimeout(() => { readColors(); draw(); }, 50));
})();

/* ── CURSOR SPOTLIGHT ON CARDS ─────────────────────────────
   Feeds --mx/--my to each card so the CSS glow tracks the cursor. */
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (REDUCED || !fine) return;
  const cards = document.querySelectorAll('.project-img-wrap, .design-card');
  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, { passive: true });
  });
})();

/* ── MAGNETIC ELEMENTS (disabled) ────────────────────────── */
(function () {
  return; // magnetic mouse-follow disabled
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (REDUCED || !fine) return;
  const STRENGTH = 0.32, MAX = 9;
  const els = document.querySelectorAll('.btn, .nav-cta, .hold-btn, .project-link');
  els.forEach(el => {
    el.style.willChange = 'transform';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      let x = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
      let y = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
      const d = Math.hypot(x, y);
      if (d > MAX) { x = (x / d) * MAX; y = (y / d) * MAX; }
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ── PAGE TRANSITION CURTAIN ──────────────────────────────── */
let ptBusy = false;
function runPageTransition(target, labelText) {
  const pt = document.getElementById('page-transition');
  const label = document.getElementById('page-transition-label');
  const jump = () => {
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
  };
  if (!pt || ptBusy) { jump(); return; }
  ptBusy = true;
  const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
  if (label) label.textContent = labelText || '';

  // 1) cover — slide up from the bottom
  pt.style.transition = `transform 0.55s ${EASE}`;
  pt.style.transform = 'translateY(0)';
  pt.classList.add('is-cover');

  // 2) once covered, jump to the target, then reveal
  setTimeout(() => {
    jump();
    pt.classList.remove('is-cover');
    requestAnimationFrame(() => { pt.style.transform = 'translateY(-100%)'; });
    // 3) reset off-screen (bottom) for next time
    setTimeout(() => {
      pt.style.transition = 'none';
      pt.style.transform = 'translateY(100%)';
      ptBusy = false;
    }, 600);
  }, 600);
}

/* ── LENIS SMOOTH SCROLL ──────────────────────────────────── */
let lenis = null;
let scrollVelocity = 0;

if (!REDUCED && typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    lerp: 0.1,
  });

  lenis.on('scroll', ({ velocity }) => {
    scrollVelocity = velocity;
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Anchor links route through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const isNav = a.closest('#nav-links') || a.classList.contains('nav-logo');
      closeMenu();              // also restarts Lenis (it was stopped while menu open)
      if (isNav && !REDUCED) {
        runPageTransition(target, a.dataset.label || a.textContent.trim());
      } else {
        lenis.scrollTo(target, { offset: -10, duration: 1.2, force: true });
      }
    });
  });
}

/* ── CUSTOM MAGNETIC CURSOR (removed — guarded on missing elements) ── */
if (FINE_POINTER && !REDUCED && document.getElementById('cursor-dot')) {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my; // ring trails behind
  let magnetEl = null;  // element the ring is currently drawn toward

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    document.body.classList.add('cursor-ready');
    dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
  });

  function ringLoop() {
    // When hovering an interactive element, the ring is drawn toward its
    // center, so it "snaps" onto buttons and links like a magnet.
    let tx = mx, ty = my;
    if (magnetEl) {
      const r = magnetEl.getBoundingClientRect();
      tx = mx + ((r.left + r.width / 2) - mx) * 0.35;
      ty = my + ((r.top + r.height / 2) - my) * 0.35;
    }
    rx = lerp(rx, tx, magnetEl ? 0.24 : 0.18);
    ry = lerp(ry, ty, magnetEl ? 0.24 : 0.18);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  // Grow on generic interactive elements + magnetize the ring onto them
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); magnetEl = el; });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); if (magnetEl === el) magnetEl = null; });
  });

  // 'View' label on project + design cards
  const cursorLabel = document.getElementById('cursor-label');
  document.querySelectorAll('.project-img-wrap, .design-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursorLabel) cursorLabel.textContent = 'View';
      document.body.classList.add('cursor-view');
    });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
  });

  document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
  document.addEventListener('mouseenter', () => document.body.classList.add('cursor-ready'));
}

/* Magnetic buttons live in the consolidated MAGNETIC ELEMENTS block above
   (clamped, pointer-events, wider element set). */

/* ── HERO SPOTLIGHT (follows mouse) ───────────────────────── */
if (FINE_POINTER && !REDUCED) {
  const spotlight = document.getElementById('hero-spotlight');
  const hero = document.getElementById('home');
  if (spotlight && hero) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      spotlight.style.setProperty('--mx', x + '%');
      spotlight.style.setProperty('--my', y + '%');
    });
  }
}

/* ── NAVBAR CONDENSE ON SCROLL ────────────────────────────── */
const siteHeader = document.getElementById('site-header');
function onScrollHeader(y) { siteHeader.classList.toggle('scrolled', y > 40); }
if (lenis) lenis.on('scroll', ({ scroll }) => onScrollHeader(scroll));
else window.addEventListener('scroll', () => onScrollHeader(window.scrollY), { passive: true });

/* ── WORK INDEX ────────────────────────────────────────────
   An editorial index: hovering or focusing a project row swaps
   the sticky preview panel (image, tags, description, links) and
   tints the active row with that project's accent. On narrow
   screens the sticky preview is hidden and each row expands into
   a full card (handled in CSS). */
(function () {
  const list    = document.getElementById('work-list');
  const preview = document.getElementById('work-preview-inner');
  const explorer = document.getElementById('work-explorer');
  if (!list || !preview || !explorer) return;

  const rows = Array.from(list.querySelectorAll('.work-row'));
  if (!rows.length) return;
  const mq = window.matchMedia('(min-width: 900px)');

  function activate(row) {
    rows.forEach(r => r.classList.toggle('is-active', r === row));
    explorer.style.setProperty('--row-accent', row.dataset.accent || 'var(--accent)');
    if (!mq.matches) return;                 // mobile shows inline detail instead
    const detail = row.querySelector('.work-row-detail');
    if (detail) preview.innerHTML = detail.innerHTML;
  }

  rows.forEach(row => {
    row.addEventListener('mouseenter', () => { if (mq.matches) activate(row); });
    row.addEventListener('focusin',  () => { if (mq.matches) activate(row); });
  });

  // Initialise with the first row (or whichever is pre-marked active).
  activate(rows.find(r => r.classList.contains('is-active')) || rows[0]);
  mq.addEventListener('change', () => activate(document.querySelector('.work-row.is-active') || rows[0]));
})();

/* ── HAMBURGER ────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
function setMenu(open) {
  navLinks.classList.toggle('open', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (lenis) { open ? lenis.stop() : lenis.start(); }
}
hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
function closeMenu() { setMenu(false); }
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });

/* ── NAV: LIVE LOCAL TIME ─────────────────────────────────── */
(function () {
  const el = document.getElementById('nav-time');
  if (!el) return;
  function tick() {
    try {
      el.textContent = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      }).format(new Date()).toUpperCase();
    } catch (e) {
      el.textContent = new Date().toLocaleTimeString();
    }
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── HERO: ROTATING ROLE WORDS ────────────────────────────── */
(function () {
  const rotator = document.getElementById('hero-rotator');
  if (!rotator || REDUCED) return;
  const word = rotator.querySelector('.rot-word');
  if (!word) return;
  const words = ['web experiences', 'user interfaces', 'brand systems', 'digital products', 'clean code'];
  let i = 0;
  function rotate() {
    word.classList.remove('is-active');
    word.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      word.style.transition = 'none';
      word.classList.remove('is-out');     // jump to start position (below)
      word.textContent = words[i];
      void word.offsetWidth;               // force reflow
      word.style.transition = '';
      word.classList.add('is-active');     // slide up into view
    }, 500);
  }
  setInterval(rotate, 2800);
})();

/* ── WORD-BY-WORD HEADING REVEAL ──────────────────────────── */
function splitWords(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text.trim());
  el.classList.add('reveal-words');
  // Split on spaces but preserve line breaks already in markup via <br>
  const html = el.innerHTML;
  // Rebuild: walk text, wrapping words; keep <br>
  const parts = html.split(/(<br\s*\/?>)/i);
  el.innerHTML = parts.map(part => {
    if (/<br/i.test(part)) return part;
    return part.split(/(\s+)/).map(token => {
      if (token.trim() === '') return token;
      return `<span class="word"><span>${token}</span></span>`;
    }).join('');
  }).join('');
  // Stagger
  el.querySelectorAll('.word > span').forEach((span, i) => {
    span.style.setProperty('--word-delay', (i * 60) + 'ms');
  });
}

if (!REDUCED) {
  document.querySelectorAll('.about-heading, .section-title, .contact-heading')
    .forEach(splitWords);
}

/* ── INTERSECTION OBSERVER: reveals + counters + words ────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.closest('[data-counter]')) {
        document.querySelectorAll('.stat-num[data-target]').forEach(countUp);
      }
    } else if (entry.intersectionRatio === 0) {
      // fully out of view → reset so it replays when scrolled back into view
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: [0, 0.15] });

document.querySelectorAll('.section-reveal, .reveal-words')
  .forEach(el => revealObserver.observe(el));

// scroll-driven image reveals (revealed when their parent .section-reveal card becomes visible)
if (!REDUCED) {
  document.querySelectorAll('.project-img-wrap, .design-img-wrap').forEach(el => {
    if (el.closest('.section-reveal')) el.classList.add('reveal-img');
  });
}

function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.target, 10);
  const duration = 1100;
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(eased * target)).padStart(2, '0');
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ── SCROLL PARALLAX (rAF, viewport-relative) ─────────────── */
if (!REDUCED) {
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')].map(el => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0.05,
  }));

  let ticking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach(({ el, speed }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      // distance of element center from viewport center
      const center = r.top + r.height / 2 - vh / 2;
      const shift = -center * speed;
      el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(1.08)`;
    });
    ticking = false;
  }
  function requestParallax() {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
  updateParallax();
}


/* ── SCROLL PROGRESS + SCROLL-SPY NAV ─────────────────────── */
(function () {
  const progress = document.getElementById('scroll-progress');
  const navLinkEls = [...document.querySelectorAll('#nav-links a')]
    .filter(a => (a.getAttribute('href') || '').startsWith('#'));
  const sections = navLinkEls
    .map(a => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(s => s.el);

  let ticking = false;
  function update() {
    const sh = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (progress) progress.style.transform = `scaleX(${sh > 0 ? Math.min(y / sh, 1) : 0})`;

    const mid = y + window.innerHeight * 0.35;
    let active = null;
    sections.forEach(s => {
      const top = s.el.getBoundingClientRect().top + window.scrollY;
      if (top <= mid) active = s;
    });
    navLinkEls.forEach(a => a.classList.remove('active'));
    if (active) active.a.classList.add('active');
    ticking = false;
  }
  function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (lenis) lenis.on('scroll', onScroll);
  update();
})();

/* ── THEME TOGGLE (dark / light) ──────────────────────────── */
(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  function apply(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f6f3' : '#0a0a0a');
  }
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.classList.add('theme-anim');
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    setTimeout(() => root.classList.remove('theme-anim'), 440);
  });
})();

/* ── 3D TILT + CURSOR GLARE ───────────────────────────────── */
if (FINE_POINTER && !REDUCED) {
  function addTilt(el, max) {
    el.classList.add('tilt');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.transition = 'none';
      el.style.transform =
        `perspective(1000px) rotateX(${(-(py - 0.5) * max * 2).toFixed(2)}deg) rotateY(${((px - 0.5) * max * 2).toFixed(2)}deg)`;
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      el.style.setProperty('--go', '1');
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.setProperty('--go', '0');
    });
  }
  document.querySelectorAll('.project-img-wrap').forEach(el => addTilt(el, 5));
  document.querySelectorAll('.design-card').forEach(el => addTilt(el, 4));
}

/* ── CONTACT FORM (validation + Web3Forms submit) ─────────── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('.cf-status');
  const btn = form.querySelector('.cf-submit');

  function setError(el, msg) {
    const field = el.closest('.field');
    if (!field) return;
    field.classList.toggle('invalid', !!msg);
    field.querySelector('.field-error').textContent = msg || '';
  }
  function validate() {
    let ok = true;
    if (!form.name.value.trim()) { setError(form.name, 'Please enter your name'); ok = false; }
    else setError(form.name, '');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value.trim())) { setError(form.email, 'Enter a valid email'); ok = false; }
    else setError(form.email, '');
    if (form.message.value.trim().length < 10) { setError(form.message, 'Message is a bit short'); ok = false; }
    else setError(form.message, '');
    return ok;
  }

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => { if (el.name) setError(el, ''); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const key = form.access_key.value;
    if (!key || key.indexOf('YOUR_') !== -1) {
      status.className = 'cf-status err';
      status.textContent = 'Form not configured yet — add your Web3Forms key.';
      return;
    }

    btn.disabled = true;
    status.className = 'cf-status';
    status.textContent = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        status.className = 'cf-status ok';
        status.textContent = 'Thanks! Your message has been sent.';
      } else {
        status.className = 'cf-status err';
        status.textContent = 'Something went wrong. Please email me directly.';
      }
    } catch (err) {
      status.className = 'cf-status err';
      status.textContent = 'Network error. Please email me directly.';
    }
    btn.disabled = false;
  });
})();

/* ── SKILLS KEYCAPS (press a key) ─────────────────────────── */
(function () {
  const caps = [...document.querySelectorAll('.keycap')];
  if (!caps.length) return;
  const byKey = {};
  caps.forEach(c => { if (c.dataset.key) byKey[c.dataset.key] = c; });

  function press(cap) {
    if (!cap) return;
    cap.classList.add('pressed');
    clearTimeout(cap._pt);
    cap._pt = setTimeout(() => cap.classList.remove('pressed'), 170);
  }

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement || {}).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const k = (e.key || '').toLowerCase();
    if (k.length !== 1) return;
    press(byKey[k] || caps[(Math.random() * caps.length) | 0]);
  });

  caps.forEach(c => c.addEventListener('click', () => press(c)));

  // Auto-ripple: keys light up on their own so the board feels alive
  if (!REDUCED) {
    let i = 0;
    const order = caps.map((_, idx) => idx); // sequential ripple
    setInterval(() => {
      press(caps[order[i % order.length]]);
      i++;
    }, 240);
  }
})();

/* ── HERO LINE-ART HOOK (rotating wireframe network) ───────── */
(function () {
  const canvas = document.getElementById('hero-art');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Resolve the stroke colour from CSS (--text-2) so it tracks the theme.
  let stroke = 'rgb(200,200,200)';
  function readColor() { stroke = getComputedStyle(canvas).color; }
  readColor();
  new MutationObserver(readColor).observe(
    document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }
  );

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  /* Contour lines are level slices through a sphere whose radius is pushed
     around by a travelling field. Every level samples that same field, so
     neighbouring lines bend together and read as one landform instead of
     a stack of unrelated rings. */
  function field(x, y, z, t) {
    return (Math.sin(x * 3.1 + t) * 0.5
          + Math.sin(y * 4.3 - t * 0.7) * 0.3
          + Math.sin(z * 2.7 + t * 0.5) * 0.4
          + Math.sin((x + z) * 5.2 - t * 0.9) * 0.2) / 1.4;
  }

  const LEVELS = 46;   // contour lines from pole to pole
  const SEG = 90;      // samples around each line
  const AMP = 0.13;    // how far the field displaces the radius

  // Cursor easing.
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', (e) => {
    tmx = (e.clientX / window.innerWidth - 0.5) * 2;
    tmy = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let ry = 0, t = 0;

  function frame() {
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    if (!REDUCED) { ry += 0.0022; t += 0.004; }

    const rotY = ry + mx * 0.6;
    const rotX = my * 0.5;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    // Large sphere pushed off the right edge — only ~30% of it peeks in.
    const R = Math.max(W, H) * 0.62;
    const cx = W + R * 0.28;
    const cy = H * 0.5;
    const persp = 2.8;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;

    for (let l = 0; l < LEVELS; l++) {
      const y = -0.94 + (l / (LEVELS - 1)) * 1.88;
      const r0 = Math.sqrt(Math.max(0, 1 - y * y));
      let prevBucket = 0;

      for (let s = 0; s <= SEG; s++) {
        const th = (s / SEG) * Math.PI * 2;
        const ct = Math.cos(th), st = Math.sin(th);
        const r = r0 + field(ct * r0, y, st * r0, t) * AMP;
        const px = ct * r, pz = st * r;

        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const sc = persp / (persp - z2);
        const sx = cx + x1 * R * sc;
        const sy = cy + y1 * R * sc;

        // Quantise depth so a line can be stroked in a few runs rather than
        // one path per segment, while still fading as it turns away.
        const bucket = Math.round((z2 + 1) * 4);
        if (s === 0) { ctx.beginPath(); ctx.moveTo(sx, sy); prevBucket = bucket; continue; }

        ctx.lineTo(sx, sy);
        if (bucket !== prevBucket || s === SEG) {
          ctx.globalAlpha = 0.04 + (prevBucket / 8) * 0.26;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          prevBucket = bucket;
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ── HERO ART: released once Work scrolls in ───────────────
   The canvas is pinned to the viewport, so it needs an explicit cue to
   leave — otherwise it would sit behind every section below. */
(function () {
  const wrap = document.querySelector('.hero-artwrap');
  const work = document.getElementById('projects');
  if (!wrap || !work) return;

  /* Derived from Work's position every time rather than from intersection
     events: an observer only reports state *changes*, so reloading deep in the
     page and jumping back to the top can skip the callback and strand the
     artwork hidden. */
  let queued = false;
  function update() {
    queued = false;
    wrap.classList.toggle('is-off', work.getBoundingClientRect().top <= window.innerHeight * 0.1);
  }
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ── CONTACT WIREFRAME TORUS (sibling motif to the hero globe) ── */
(function () {
  const canvas = document.getElementById('footer-art');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stroke = 'rgb(180,180,180)';
  function readColor() { stroke = getComputedStyle(canvas).color; }
  readColor();
  new MutationObserver(readColor).observe(
    document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }
  );

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Parametric torus mesh.
  const NU = 32, NV = 12, RMAJ = 1.0, RMIN = 0.42;
  const pts = [];
  for (let i = 0; i < NU; i++) {
    const u = (i / NU) * Math.PI * 2;
    for (let j = 0; j < NV; j++) {
      const v = (j / NV) * Math.PI * 2;
      const ring = RMAJ + RMIN * Math.cos(v);
      pts.push([ring * Math.cos(u), ring * Math.sin(u), RMIN * Math.sin(v)]);
    }
  }
  const at = (i, j) => ((i % NU) + NU) % NU * NV + ((j % NV) + NV) % NV;
  const edges = [];
  for (let i = 0; i < NU; i++) {
    for (let j = 0; j < NV; j++) {
      edges.push([at(i, j), at(i + 1, j)]);   // around the ring
      edges.push([at(i, j), at(i, j + 1)]);   // around the tube
    }
  }

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', (e) => {
    tmx = (e.clientX / window.innerWidth - 0.5) * 2;
    tmy = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const proj = new Array(pts.length);
  let ry = 0;
  const TILT = 0.62;

  function frame() {
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    if (!REDUCED) ry += 0.0026;

    const rotY = ry + mx * 0.5;
    const rotX = TILT + my * 0.4;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const R = Math.max(W, H) * 0.46;
    const cx = W + R * 0.34;   // bleed off the right
    const cy = H * 0.5;
    const persp = 3.0;

    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      const x1 = p[0] * cosY - p[2] * sinY;
      const z1 = p[0] * sinY + p[2] * cosY;
      const y1 = p[1] * cosX - z1 * sinX;
      const z2 = p[1] * sinX + z1 * cosX;
      const s = persp / (persp - z2);
      proj[k] = [cx + x1 * R * s, cy + y1 * R * s, z2];
    }

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    for (let e = 0; e < edges.length; e++) {
      const a = proj[edges[e][0]], b = proj[edges[e][1]];
      const depth = (a[2] + b[2]) * 0.5;
      ctx.globalAlpha = 0.05 + (depth + 1) * 0.5 * 0.34;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ── FOOTER YEAR ──────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── PER-SECTION 3D MOTIFS ─────────────────────────────────
   Each content section gets its own wireframe background, drawn on an
   absolutely-positioned canvas that fills the section behind the content.
   Shared scaffolding (resize, theme colour, cursor easing, rAF loop) lives
   in sectionArt(); each section supplies only its draw routine. */
function sectionArt(id, draw) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stroke = 'rgb(180,180,180)';
  const readColor = () => { stroke = getComputedStyle(canvas).color; };
  readColor();
  new MutationObserver(readColor).observe(
    document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }
  );

  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();
  // Sections grow once content/fonts settle; re-measure shortly after load.
  window.addEventListener('load', () => setTimeout(resize, 300));

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', (e) => {
    tmx = (e.clientX / window.innerWidth - 0.5) * 2;
    tmy = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let t = 0;
  function frame() {
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    if (!REDUCED) t += 1;
    if (W > 0 && H > 0) {
      // Keep the shape at the vertical centre of whatever slice of this
      // (often taller-than-viewport) section is currently on screen.
      const top = canvas.getBoundingClientRect().top;
      const cy = Math.max(0, Math.min(H, window.innerHeight / 2 - top));
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      draw(ctx, { W, H, mx, my, t, cy });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ABOUT — rotating icosahedron */
(function () {
  const PHI = (1 + Math.sqrt(5)) / 2;
  let V = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ].map(p => { const L = Math.hypot(p[0], p[1], p[2]); return [p[0]/L, p[1]/L, p[2]/L]; });
  const E = [];
  for (let i = 0; i < V.length; i++)
    for (let j = i + 1; j < V.length; j++) {
      const d = Math.hypot(V[i][0]-V[j][0], V[i][1]-V[j][1], V[i][2]-V[j][2]);
      if (d < 1.2) E.push([i, j]);
    }

  sectionArt('about-art', (ctx, s) => {
    const { W, H, mx, my, t } = s;
    const rotY = t * 0.004 + mx * 0.5, rotX = 0.3 + my * 0.4;
    const cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX);
    const R = Math.min(W, window.innerHeight) * 0.34;
    const ox = W + R * 0.15, oy = s.cy, persp = 3.2;
    const P = V.map(p => {
      const x1 = p[0]*cY - p[2]*sY, z1 = p[0]*sY + p[2]*cY;
      const y1 = p[1]*cX - z1*sX, z2 = p[1]*sX + z1*cX;
      const sc = persp / (persp - z2);
      return [ox + x1*R*sc, oy + y1*R*sc, z2];
    });
    for (const [a, b] of E) {
      const z = (P[a][2] + P[b][2]) * 0.5;
      ctx.globalAlpha = 0.1 + Math.max(0, (z + 1) / 2) * 0.5;
      ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
})();

/* SKILLS — rotating double helix */
(function () {
  const N = 64, turns = 3, r = 0.5;
  sectionArt('skills-art', (ctx, s) => {
    const { W, H, mx, my, t } = s;
    const rotY = t * 0.006 + mx * 0.4;
    const cY = Math.cos(rotY), sY = Math.sin(rotY);
    const tilt = 0.1 + my * 0.2, cX = Math.cos(tilt), sX = Math.sin(tilt);
    const Sx = Math.min(W, window.innerHeight) * 0.3;
    const Sy = Math.min(H, window.innerHeight) * 0.42;
    const ox = W * 0.78, oy = s.cy, persp = 3.0;
    const proj = (ang, yy) => {
      const x = Math.cos(ang) * r, z = Math.sin(ang) * r, y = yy;
      const x1 = x*cY - z*sY, z1 = x*sY + z*cY;
      const y1 = y*cX - z1*sX, z2 = y*sX + z1*cX;
      const sc = persp / (persp - z2);
      return [ox + x1*Sx*sc, oy + y1*Sy*sc, z2];
    };
    const A = [], B = [];
    for (let k = 0; k <= N; k++) {
      const f = k / N, yy = -1 + 2 * f, ang = f * Math.PI * 2 * turns + t * 0.01;
      A.push(proj(ang, yy)); B.push(proj(ang + Math.PI, yy));
    }
    const strand = (arr) => {
      for (let k = 1; k < arr.length; k++) {
        const z = (arr[k][2] + arr[k-1][2]) * 0.5;
        ctx.globalAlpha = 0.1 + Math.max(0, (z + 1) / 2) * 0.5;
        ctx.beginPath(); ctx.moveTo(arr[k-1][0], arr[k-1][1]); ctx.lineTo(arr[k][0], arr[k][1]); ctx.stroke();
      }
    };
    strand(A); strand(B);
    for (let k = 0; k <= N; k += 3) {
      const z = (A[k][2] + B[k][2]) * 0.5;
      ctx.globalAlpha = 0.07 + Math.max(0, (z + 1) / 2) * 0.33;
      ctx.beginPath(); ctx.moveTo(A[k][0], A[k][1]); ctx.lineTo(B[k][0], B[k][1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
})();

/* WORK — undulating grid / wave plane */
(function () {
  const GX = 22, GY = 14, sp = 0.2;
  sectionArt('work-art', (ctx, s) => {
    const { W, H, mx, my, t } = s;
    const rotY = mx * 0.3, cY = Math.cos(rotY), sY = Math.sin(rotY);
    const tilt = 1.12 + my * 0.15, cX = Math.cos(tilt), sX = Math.sin(tilt);
    const scale = Math.min(W, window.innerHeight) * 0.6;
    const ox = W * 0.82, oy = s.cy, persp = 5.0;
    const P = [];
    for (let j = 0; j < GY; j++) {
      P[j] = [];
      for (let i = 0; i < GX; i++) {
        const x = (i - (GX - 1) / 2) * sp;
        const z = (j - (GY - 1) / 2) * sp;
        const y = (Math.sin(x * 2.3 + t * 0.03) + Math.cos(z * 2.1 + t * 0.024)) * 0.16;
        const x1 = x*cY - z*sY, z1 = x*sY + z*cY;
        const y1 = y*cX - z1*sX, z2 = y*sX + z1*cX;
        const sc = persp / (persp - z2);
        P[j][i] = [ox + x1*scale*sc, oy + y1*scale*sc, z2];
      }
    }
    const seg = (a, b) => {
      const z = (a[2] + b[2]) * 0.5;
      ctx.globalAlpha = 0.05 + Math.max(0, (z + 1) / 2) * 0.4;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    };
    for (let j = 0; j < GY; j++) for (let i = 1; i < GX; i++) seg(P[j][i-1], P[j][i]);
    for (let i = 0; i < GX; i++) for (let j = 1; j < GY; j++) seg(P[j-1][i], P[j][i]);
    ctx.globalAlpha = 1;
  });
})();
