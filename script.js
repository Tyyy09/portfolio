/* ============================================================
   ICHTY TE — PORTFOLIO · ADVANCED MOTION ENGINE
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ── LOADER ────────────────────────────────────────────────
   Counts to 100, fades, then releases the hero. */
(function () {
  const loader = document.getElementById('loader');
  const numEl  = document.getElementById('loader-number');
  const barEl  = document.getElementById('loader-bar-fill');
  let p = 0;

  const render = () => {
    numEl.textContent = p;
    if (barEl) barEl.style.width = p + '%';
  };
  function tick() {
    p += Math.floor(Math.random() * 6) + 2;
    if (p >= 100) {
      p = 100;
      render();
      setTimeout(finish, 460);
    } else {
      render();
      setTimeout(tick, Math.random() * 130 + 130);
    }
  }
  function finish() {
    loader.classList.add('hide');         // fades counter, sweeps panels up
    // Reveal the hero just as the panels clear it, so it rises in from behind.
    setTimeout(() => {
      document.body.classList.add('loaded');
      animateHeroName();
    }, REDUCED ? 0 : 620);
    setTimeout(() => loader.classList.add('gone'), REDUCED ? 0 : 1200);
  }
  render();
  tick();
})();

/* ── HERO NAME: SCRAMBLE ON HOVER ──────────────────────────
   The name is handed off clean from the loader, so it does NOT
   scramble on load (that would break the seamless transition).
   Each line scrambles independently on hover, leaving the dot intact. */
function animateHeroName() {
  const lines = document.querySelectorAll('.hero-name .bn-text');
  if (!lines.length) return;
  lines.forEach(el => { el.dataset.final = el.textContent.trim(); });

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || REDUCED) return;

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØ#%&@*/<>';
  function scramble(el, duration) {
    const finalText = el.dataset.final;
    cancelAnimationFrame(el._raf);
    const start = performance.now();
    function frame(now) {
      const t = (now - start) / duration;
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        const revealAt = 0.15 + (i / finalText.length) * 0.7;
        out += (t >= revealAt) ? finalText[i] : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (t < 1) { el._raf = requestAnimationFrame(frame); }
      else { el.textContent = finalText; }
    }
    el._raf = requestAnimationFrame(frame);
  }

  const nameEl = document.querySelector('.hero-name');
  nameEl.addEventListener('mouseenter', () => lines.forEach(el => scramble(el, 700)));
}

/* ── NAV LINKS: SCRAMBLE ON HOVER (same effect as the name) ── */
(function () {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || REDUCED) return;
  const targets = document.querySelectorAll('.nav-link span, .nav-cta');
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
    const trigger = el.closest('.nav-link') || el;
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
    { c: [200, 169, 126], r: 0.55, ax: 0.16, ay: 0.12, sx: 0.00022, sy: 0.00017, px: 0, py: 0 },
    { c: [178, 138, 92],  r: 0.45, ax: 0.18, ay: 0.16, sx: 0.00015, sy: 0.00024, px: 2, py: 1 },
    { c: [110, 88, 64],   r: 0.62, ax: 0.20, ay: 0.10, sx: 0.00012, sy: 0.00019, px: 4, py: 3 },
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
  function loop() { t += 16; draw(); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; loop(); } }
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
  // Reduced motion: park a gentle static glow and stop.
  if (REDUCED) { aura.style.setProperty('--aura-x', '50%'); aura.style.setProperty('--aura-y', '20%'); return; }
  let tx = 50, ty = 20, cx = 50, cy = 20, raf = null;
  function loop() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    aura.style.setProperty('--aura-x', cx.toFixed(2) + '%');
    aura.style.setProperty('--aura-y', cy.toFixed(2) + '%');
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      raf = requestAnimationFrame(loop);
    } else { raf = null; }
  }
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth) * 100;
    ty = (e.clientY / window.innerHeight) * 100;
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
  let base = 'rgba(136,136,136,0.18)', accent = '200,169,126';

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    accent = (cs.getPropertyValue('--accent-rgb').trim()) || '200,169,126';
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
  function loop() { draw(); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; loop(); } }
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

/* ── MAGNETIC ELEMENTS ─────────────────────────────────────
   Buttons and the nav CTA drift toward the cursor, then spring
   back on leave — the signature "premium" micro-interaction. */
(function () {
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

/* ── CUSTOM MAGNETIC CURSOR ───────────────────────────────── */
if (FINE_POINTER && !REDUCED) {
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
      el.textContent = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(new Date());
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

/* ── FOOTER YEAR ──────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();
