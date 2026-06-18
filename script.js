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
  let p = 0;

  function tick() {
    p += Math.floor(Math.random() * 16) + 4;
    if (p >= 100) {
      p = 100;
      numEl.textContent = '100';
      setTimeout(finish, 260);
    } else {
      numEl.textContent = p;
      setTimeout(tick, Math.random() * 100 + 30);
    }
  }
  function finish() {
    loader.classList.add('hide');
    setTimeout(() => {
      document.body.classList.add('loaded');
      animateHeroName();
    }, REDUCED ? 0 : 820);
  }
  tick();
})();

/* ── HERO NAME: CHARACTER BLUR-IN ─────────────────────────── */
function animateHeroName() {
  const nameEl = document.querySelector('.hero-name');
  if (!nameEl) return;
  const raw = nameEl.textContent.trim();
  nameEl.innerHTML = raw.split('').map((ch, i) => {
    const delay = i * 38 + 80;
    const c = ch === ' ' ? '&nbsp;' : ch;
    return `<span class="char" style="transition-delay:${delay}ms">${c}</span>`;
  }).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => nameEl.classList.add('animate')));
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
      lenis.scrollTo(target, { offset: -10, duration: 1.4 });
      closeMenu();
    });
  });
}

/* ── CUSTOM MAGNETIC CURSOR ───────────────────────────────── */
if (FINE_POINTER && !REDUCED) {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my; // ring trails behind

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    document.body.classList.add('cursor-ready');
    dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
  });

  function ringLoop() {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  // Grow on interactive elements
  const interactive = document.querySelectorAll('a, button, .project-img-wrap, .design-card');
  interactive.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
  document.addEventListener('mouseenter', () => document.body.classList.add('cursor-ready'));
}

/* ── MAGNETIC BUTTONS ─────────────────────────────────────── */
if (FINE_POINTER && !REDUCED) {
  document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    const strength = 0.35;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

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

/* ── NAVBAR ELEVATION ─────────────────────────────────────── */
const siteHeader = document.getElementById('site-header');
function onScrollHeader(y) { siteHeader.classList.toggle('scrolled', y > 40); }
window.addEventListener('scroll', () => onScrollHeader(window.scrollY), { passive: true });

/* ── HAMBURGER ────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });

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
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    if (entry.target.closest('[data-counter]')) {
      document.querySelectorAll('.stat-num[data-target]').forEach(countUp);
    }
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section-reveal, .reveal-words')
  .forEach(el => revealObserver.observe(el));

function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.target, 10);
  const duration = 1100;
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
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

/* ── MARQUEE BUILDER + VELOCITY SKEW ──────────────────────── */
const progTools = [
  { name: 'HTML',          img: 'images/programming/html.png'   },
  { name: 'CSS',           img: 'images/programming/css.png'    },
  { name: 'JavaScript',    img: 'images/programming/js.png'     },
  { name: 'React',         img: 'images/programming/react.png'  },
  { name: 'Java',          img: 'images/programming/java.png'   },
  { name: 'Python',        img: 'images/programming/python.png' },
  { name: 'PHP',           img: 'images/programming/php.png'    },
  { name: 'MySQL',         img: 'images/programming/mysql.png'  },
  { name: 'Git',           img: 'images/programming/git.png'    },
  { name: 'VS Code',       img: 'images/programming/vs.png'     },
  { name: 'GitHub',        img: 'images/programming/github.png' },
  { name: 'Packet Tracer', img: 'images/programming/packet.png' },
];
const designTools = [
  { name: 'Figma',       img: 'images/designing/figma.png'    },
  { name: 'Illustrator', img: 'images/designing/ai.png'       },
  { name: 'Photoshop',   img: 'images/designing/ps.png'       },
  { name: 'Affinity',    img: 'images/designing/affinity.png' },
];
function buildMarquee(trackId, items, repeats) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const all = Array.from({ length: repeats }, () => items).flat();
  track.innerHTML = all.map(item =>
    `<div class="marquee-item">
       <img src="${item.img}" alt="${item.name}" loading="lazy" />
       <span>${item.name}</span>
     </div>`
  ).join('');
}
buildMarquee('prog-track',   progTools,   4);
buildMarquee('design-track', designTools, 10);

/* Scroll velocity subtly skews the marquees for a kinetic feel */
if (!REDUCED) {
  const skewTargets = document.querySelectorAll('.marquee-outer');
  let curSkew = 0;
  function skewLoop() {
    const targetSkew = clamp(scrollVelocity * 0.35, -8, 8);
    curSkew = lerp(curSkew, targetSkew, 0.1);
    scrollVelocity *= 0.9; // decay when no Lenis
    skewTargets.forEach(t => { t.style.transform = `skewX(${curSkew.toFixed(2)}deg)`; });
    requestAnimationFrame(skewLoop);
  }
  // Only skew via wheel velocity when Lenis isn't supplying it
  if (lenis) skewLoop();
  else {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      scrollVelocity = window.scrollY - lastY;
      lastY = window.scrollY;
    }, { passive: true });
    skewLoop();
  }
}

/* ── FOOTER YEAR ──────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();
