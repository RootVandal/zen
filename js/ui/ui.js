/* Interface: loader, header, drawer, toggles, cursor, ink click,
   progress katana, HUD timecode, phone sheet, paper grain. */
import { env, $, $$, store } from '../core/env.js';
import { t, textOf, onLang } from '../core/i18n.js';
import { trail } from '../fx/slice.js';
import { sound } from '../fx/fx.js';
import { WORKS } from '../data.js';

const gsap = () => window.gsap;
const h = document.documentElement;

/* ======================= Loader ======================= */
export function runLoader() {
  const el = $('.loader');
  const G = gsap();
  const shown = el && getComputedStyle(el).display !== 'none';
  if (!shown || !G) { el?.classList.add('is-done'); return Promise.resolve(false); }
  return new Promise((resolve) => {
    const sheath = $('.loader__sheath', el);
    const core = $('.loader__core', el);
    const label = $('.loader__label', el);
    G.from(label, { opacity: 0, y: 8, duration: 0.3 });
    const to = G.quickTo(sheath, 'xPercent', { duration: 0.25, ease: 'power3.out' });
    let p = 0.3;
    const set = (v) => { p = Math.max(p, v); to(p * 74); };
    set(0.3);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      set(1);
      const glint = document.createElement('i');
      glint.style.cssText = 'position:absolute;top:38%;height:24%;width:80px;left:30%;background:linear-gradient(90deg,transparent,#fff,transparent);transform:skewX(-20deg);opacity:0';
      $('.loader__blade', el).append(glint);
      const tl = G.timeline({ delay: 0.22 });
      tl.fromTo(glint, { left: '28%', opacity: 1 }, { left: '96%', opacity: 0.2, duration: 0.12, ease: 'power1.in' });
      tl.call(() => {
        const a = $('.loader__half--a', el).getBoundingClientRect();
        trail([a.left, a.top + a.height * 0.69], [a.right, a.top + a.height * 0.31], { w: 22, dur: 0.12 });
        sound.play('swish');
      }, null, 0.12);
      tl.to(core, { scale: 0.92, opacity: 0, duration: 0.12, ease: 'power2.in' }, 0.22);
      tl.to('.loader__half--a', { x: '-40vw', y: '-20vh', duration: 0.42, ease: 'expo.out' }, 0.24);
      tl.to('.loader__half--b', { x: '40vw', y: '20vh', duration: 0.42, ease: 'expo.out' }, 0.24);
      tl.call(() => resolve(true), null, 0.26);
      tl.call(() => { el.classList.add('is-done'); store('session', 'axk-seen', '1'); }, null, 0.68);
    };
    document.fonts?.ready.then(() => { set(1); finish(); });
    setTimeout(finish, 450);
  });
}

/* ======================= Header ======================= */
export function initHeader(lenisRef) {
  const hdr = $('.hdr');
  const toc = $('.hdr__toc');
  const drawer = $('#drawer');
  let lastY = scrollY;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY;
      const d = y - lastY;
      const lock = !drawer.hidden || hdr.matches(':focus-within');
      hdr.classList.toggle('is-solid', y > 80);
      if (!lock && y > 120 && d > 8) hdr.classList.add('is-hidden');
      else if (d < -4 || y < 120) hdr.classList.remove('is-hidden');
      lastY = y;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  const close = () => {
    drawer.hidden = true;
    toc.setAttribute('aria-expanded', 'false');
  };
  toc.addEventListener('click', () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    toc.setAttribute('aria-expanded', String(open));
    if (open) drawer.querySelector('a')?.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) { close(); toc.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (!drawer.hidden && !hdr.contains(e.target)) close(); });
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });

  // anchor links through Lenis on desktop
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#' ? null : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const lenis = lenisRef();
    const off = -(parseFloat(getComputedStyle(h).getPropertyValue('--header-h')) || 64) * (id === '#cover' ? 0 : 1);
    if (lenis) lenis.scrollTo(target, { offset: off, duration: 1.2 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + off, behavior: env.calm ? 'auto' : 'smooth' });
    history.replaceState(history.state, '', id === '#cover' ? location.pathname + location.search : id);
    if (id !== '#cover') setTimeout(() => target.querySelector('h2, h3')?.setAttribute('tabindex', '-1'), 0);
  });
}

/* ======================= Toggles ======================= */
export function initToggles(onCalmChange) {
  const sync = () => {
    for (const b of $$('.sound-t')) {
      b.setAttribute('aria-pressed', String(sound.on));
    }
    for (const b of $$('.calm-t')) {
      b.setAttribute('aria-pressed', String(env.calm));
      if (env.systemCalm) {
        b.disabled = true;
        const s = b.querySelector('[data-i18n]');
        if (s) s.textContent = env.lang === 'en' ? 'Calm mode · set by your system' : 'Спокойный режим · включено системой';
      }
    }
  };
  for (const b of $$('.sound-t')) b.addEventListener('click', () => { sound.set(!sound.on); sync(); if (sound.on) sound.play('chin'); });
  for (const b of $$('.calm-t')) b.addEventListener('click', () => {
    if (env.systemCalm) return;
    const on = !env.calm;
    h.classList.toggle('calm', on);
    store('local', 'axk-calm', on ? '1' : null);
    sync();
    onCalmChange(on);
  });
  onLang(sync);
  sync();
}

/* ======================= Cursor tag + ink click ======================= */
export function initPointer(G) {
  const tag = $('.cursor-tag');
  const xTo = G.quickTo(tag, 'x', { duration: 0.25, ease: 'power3' });
  const yTo = G.quickTo(tag, 'y', { duration: 0.25, ease: 'power3' });
  const move = (e) => { xTo(e.clientX); yTo(e.clientY); };
  addEventListener('pointermove', move, { passive: true });
  const pairs = [];
  for (const el of $$('[data-cursor-label]')) {
    const en = () => G.to(tag, { opacity: 1, scale: 1, duration: 0.15 });
    const le = () => G.to(tag, { opacity: 0, scale: 0.8, duration: 0.15 });
    el.addEventListener('pointerenter', en);
    el.addEventListener('pointerleave', le);
    pairs.push([el, en, le]);
  }
  return () => {
    removeEventListener('pointermove', move);
    pairs.forEach(([el, en, le]) => { el.removeEventListener('pointerenter', en); el.removeEventListener('pointerleave', le); });
    G.set(tag, { opacity: 0 });
  };
}

/* ======================= Progress katana + HUD ======================= */
export function initProgress(G, ST) {
  const pk = $('.progress-katana');
  const svg = $('.progress-katana__track svg');
  const hud = $('.hud');
  const tEl = $('.hud__t');
  const chEl = $('.hud__ch');
  const epEl = $('.hud__ep');
  const triggers = [];
  if (getComputedStyle(pk).display !== 'none') {
    const to = G.quickSetter(svg, 'yPercent');
    to(100);
    triggers.push(ST.create({
      start: 0, end: 'max', onUpdate: (s) => to(100 - s.progress * 100),
    }));
    triggers.push(ST.create({
      trigger: '#process', start: 'top 70%', end: 'bottom 30%',
      onToggle: (s) => pk.classList.toggle('is-off', s.isActive),
    }));
  }
  if (hud && getComputedStyle(hud).display !== 'none') {
    const anchors = () => {
      const top = (sel, f = 0) => { const e = $(sel); if (!e) return 0; const r = e.getBoundingClientRect(); return r.top + scrollY + r.height * f - innerHeight * 0.5; };
      return [
        [0, 0], [top('#works'), 180], [top('.eyecatch', 0.5), 720], [top('#finale'), 1200],
        [document.documentElement.scrollHeight - innerHeight, 1420],
      ];
    };
    let A = anchors();
    let lastS = -1;
    const map = (y) => {
      for (let i = 1; i < A.length; i++) {
        if (y <= A[i][0] || i === A.length - 1) {
          const [y0, t0] = A[i - 1], [y1, t1] = A[i];
          const k = Math.max(0, Math.min(1, (y - y0) / Math.max(1, y1 - y0)));
          return t0 + (t1 - t0) * k;
        }
      }
      return 0;
    };
    triggers.push(ST.create({
      start: 0, end: 'max', onRefresh: () => { A = anchors(); },
      onUpdate: () => {
        const s = Math.floor(map(scrollY));
        if (s === lastS) return;
        lastS = s;
        tEl.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      },
    }));
    const names = { cover: 'toc.cover', about: 'toc.about', works: 'toc.works', prices: 'toc.prices', process: 'toc.process', faq: 'toc.faq', finale: 'toc.finale', contacts: 'toc.contacts' };
    const ru = { cover: 'Пролог', finale: 'Финал' };
    const eps = { cover: '01', contents: '01', about: '01', works: '02', prices: '03', process: '04', faq: '05', finale: '06', contacts: '06' };
    let cur = 'cover';
    const label = () => {
      const k = names[cur];
      chEl.textContent = env.lang === 'ru' && ru[cur] ? ru[cur] : textOf(k);
      epEl.textContent = `第${'〇一二三四五六'[+eps[cur]]}話`;
    };
    for (const id of Object.keys(names)) {
      const el = document.getElementById(id);
      if (!el) continue;
      triggers.push(ST.create({ trigger: el, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => { if (s.isActive) { cur = id; label(); } } }));
    }
    onLang(label);
    label();
  }
  return () => triggers.forEach((tr) => tr.kill());
}

/* ======================= Phone sheet ======================= */
export function initSheet(lenisRef) {
  const dlg = $('.sheet');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = $('.sheet__img', dlg);
  const hEl = $('.sheet__h', dlg);
  const open = $('.sheet__open', dlg);
  let opener = null;
  const show = (key, from) => {
    const w = WORKS.find((x) => x.key === key);
    if (!w) return;
    opener = from;
    hEl.textContent = w.title;
    img.src = `assets/shots/${key}-long.webp`;
    img.alt = env.lang === 'en' ? `The full ${w.title} page` : `Сайт ${w.title} целиком`;
    open.href = w.url;
    $('.sheet__body', dlg).scrollTop = 0;
    dlg.showModal();
    document.documentElement.style.overflow = 'hidden';
    lenisRef()?.stop();
  };
  dlg.addEventListener('close', () => { document.documentElement.style.overflow = ''; lenisRef()?.start(); opener?.focus({ preventScroll: true }); });
  $('.sheet__close', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  for (const b of $$('.work__full')) b.addEventListener('click', () => show(b.dataset.full, b));
  for (const a of $$('.work__art')) {
    a.addEventListener('click', (e) => {
      const full = a.closest('.work').querySelector('.work__full');
      if (env.desktop || !full) return;
      e.preventDefault();
      show(a.closest('.work').dataset.key, full);
    });
  }
}

/* ======================= Paper grain ======================= */
export function paperGrain() {
  const run = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    const g2 = document.querySelector('.grain');
    if (g2) g2.style.setProperty('--grain', `url(${c.toDataURL('image/png')})`);
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(run);
}

export { t };
