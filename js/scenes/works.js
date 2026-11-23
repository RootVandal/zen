/* Works: each colour plate is opened by a cut, then the live site scrolls in its frame. */
import { env, $, $$, near } from '../core/env.js?v=77de92fa';
import { createSlash, trail } from '../fx/slice.js?v=77de92fa';
import { stamp, impact, sound } from '../fx/fx.js?v=77de92fa';
import { WORKS } from '../data.js?v=77de92fa';

const gsap = () => window.gsap;
const byKey = Object.fromEntries(WORKS.map((w) => [w.key, w]));

function noren(art, kanji, desktop) {
  const chars = [...(kanji || '')];
  const count = desktop ? 4 : 3;
  const slots = chars.length === 1 ? [1] : desktop ? [1, 2] : [0, 1];
  const el = document.createElement('div');
  el.className = 'noren';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="noren__rod"></div><div class="noren__flaps">${
    Array.from({ length: count }, (_, i) => {
      const ci = slots.indexOf(i);
      return `<div class="noren__flap"><div class="noren__stub"></div><div class="noren__body">${ci >= 0 && chars[ci] ? `<span>${chars[ci]}</span>` : ''}</div></div>`;
    }).join('')
  }</div>`;
  art.append(el);
  return el;
}

function sizeNoren(el, art) {
  const view = $('.bframe', art).getBoundingClientRect();
  const stub = $('.noren__stub', el).offsetHeight;
  const h = view.height + 36 - 8 - stub + 4;
  for (const b of $$('.noren__body', el)) b.style.height = `${h}px`;
}

export function works({ desktop }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const kills = [];
  const injected = [];
  const handles = [];

  for (const art of $$('.work')) {
    const key = art.dataset.key;
    const w = byKey[key];
    if (!w) { console.warn('[works] no data for', key); continue; }
    const stage = $('.work__stage', art);
    const wart = $('.work__art', art);
    const frame = $('.bframe', art);
    const view = $('.bframe__view', art);
    const shot = $('.bframe__shot', art);
    const type = art.dataset.cut;
    let opened = false;

    /* ---------- the cover ---------- */
    let ink = null, nor = null, h = null;
    if (type === 'ink') {
      ink = document.createElement('img');
      ink.className = 'ink';
      ink.alt = '';
      ink.setAttribute('aria-hidden', 'true');
      ink.decoding = 'async';
      ink.width = 1280; ink.height = 800;
      view.append(ink);
      injected.push(ink);
      near(art, () => { ink.src = `assets/shots/${key}-ink.webp`; }, '150%');
      h = createSlash({
        layers: [{ el: ink, depth: 1 }],
        angle: Number(art.dataset.angle) || -24,
        through: [0.55, 0.45],
        remove: true,
        fall: 'time',
        slip: 10, hitStop: 0, slipDur: 0.35,
        timeFall: { dist: desktop ? '22vh' : '16vh', rot: 3, dur: 0.6, ease: 'power2.in' },
        trail: { w: 8, dur: 0.3 },
        onSwap: (hh) => { impact(view, hh.P, 'white'); sound.play('swish'); },
        trailRect: () => view.getBoundingClientRect(),
      });
      handles.push(h);
    } else {
      nor = noren(wart, '', desktop);
      injected.push(nor);
      const ro = new ResizeObserver(() => sizeNoren(nor, wart));
      ro.observe(frame);
      kills.push(() => ro.disconnect());
    }

    const open = () => {
      if (opened) return;
      opened = true;
      const finish = () => {
        G.fromTo(shot, { scale: 1.03 }, { scale: 1, duration: 0.22, ease: 'power2.out' });
      };
      if (type === 'ink') {
        if (!ink.getAttribute('src')) ink.src = `assets/shots/${key}-ink.webp`;
        if (!ink.complete || !ink.naturalWidth) {
          ink.addEventListener('load', () => h.cut().then(finish), { once: true });
          ink.addEventListener('error', () => { h.aftermath(); finish(); }, { once: true });
          return;
        }
        h.cut().then(finish);
      } else {
        const rod = $('.noren__rod', nor).getBoundingClientRect();
        const ang = (Math.random() * 6 - 3) * (Math.PI / 180);
        const y = rod.bottom + 36;
        const A = [rod.left - 30, y - Math.tan(ang) * (rod.width / 2 + 30)];
        const B = [rod.right + 30, y + Math.tan(ang) * (rod.width / 2 + 30)];
        trail(A, B, { w: 8, dur: 0.3 });
        sound.play('swish');
        const bodies = $$('.noren__body', nor);
        const stubs = $$('.noren__flap', nor);
        const tl = G.timeline({ delay: 0.3, onComplete: finish });
        tl.to(bodies, {
          y: () => innerHeight * 0.8, opacity: 0, rotation: () => G.utils.random(-8, 8), x: () => G.utils.random(-2, 2) * innerWidth / 100,
          duration: 0.7, ease: 'power2.in', stagger: 0.05,
        }, 0.04);
        tl.set(bodies, { visibility: 'hidden' });
        G.to(stubs, { rotation: (i) => (i % 2 ? 1.5 : -1.5), duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 3, delay: 0.3, onComplete: () => G.to(stubs, { rotation: 0, duration: 0.6 }) });
      }
    };
    kills.push(ST.create({
      trigger: desktop ? art : frame,
      start: desktop ? 'top 25%' : 'top 65%',
      once: true,
      onEnter: () => {
        if (frame.getBoundingClientRect().bottom < 0) {
          opened = true;
          if (h) h.aftermath();
          if (nor) $$('.noren__body', nor).forEach((b) => { b.style.visibility = 'hidden'; });
          return;
        }
        open();
      },
    }));

    /* ---------- connective ---------- */
    if (desktop) {
      kills.push(ST.create({
        trigger: art, start: 'top bottom', end: 'top top', scrub: 0.6,
        animation: G.timeline()
          .fromTo($('.work__text', art), { y: 40 }, { y: 0, ease: 'none' }, 0)
          .fromTo($('.pframe', art), { y: '14vh', rotation: art.classList.contains('work--flip') ? -4 : 4 }, { y: 0, rotation: 0, ease: 'none' }, 0)
    
      }));
    } else {
      kills.push(ST.create({
        trigger: art, start: 'top bottom', end: 'center center', scrub: true,
        animation: G.fromTo($('.pframe', art), { y: 40, rotation: 3 }, { y: 0, rotation: 0, ease: 'none' }),
      }));
    }

    /* ---------- the tour: the real page scrolls inside the frame ---------- */
    if (desktop && w.tour !== false) {
      const long = document.createElement('img');
      long.className = 'bframe__long';
      long.alt = '';
      long.setAttribute('aria-hidden', 'true');
      long.decoding = 'async';
      long.width = 960;
      view.append(long);
      injected.push(long);
      const load = () => { if (!long.src) long.src = `assets/shots/${key}-long.webp`; };
      near(art, load, '100%');
      frame.addEventListener('pointerenter', load, { once: true });
      let maxY = 0, scrollY0 = 0, hover = false, shown = false;
      const setY = G.quickSetter(long, 'y', 'px');
      const measure = () => { maxY = Math.max(0, long.offsetHeight - view.clientHeight); };
      long.addEventListener('load', measure);
      const state = { y: 0 };
      const render = () => setY(state.y);
      const showLong = (on) => {
        if (shown === on) return;
        shown = on;
        G.to(long, { opacity: on ? 1 : 0, duration: 0.2, overwrite: 'auto' });
      };
      kills.push(ST.create({
        trigger: art, start: 'top top', end: 'bottom bottom', scrub: false,
        onRefresh: measure,
        onUpdate: (s) => {
          scrollY0 = -maxY * Math.min(1, Math.max(0, (s.progress - 0.04) / 0.96));
          if (!hover && opened) {
            showLong(s.progress > 0.04 && long.complete && long.naturalHeight > 0);
            G.to(state, { y: scrollY0, duration: 0.8, ease: 'power3.out', overwrite: true, onUpdate: render });
          }
        },
      }));
      let tour = null;
      const enter = () => {
        if (!opened || !long.complete || !maxY) return;
        hover = true;
        showLong(true);
        tour?.kill();
        tour = G.to(state, { y: -maxY, duration: Math.max(0.4, (maxY + state.y) / 260), ease: 'none', overwrite: true, onUpdate: render });
      };
      const leave = () => {
        if (!hover) return;
        hover = false;
        tour?.kill();
        G.to(state, { y: scrollY0, duration: 0.6, ease: 'power2.inOut', overwrite: true, onUpdate: render, onComplete: () => { if (scrollY0 === 0) showLong(false); } });
      };
      frame.addEventListener('pointerenter', enter);
      frame.addEventListener('pointerleave', leave);
      const cta = $('.work__btns .btn--red', art);
      cta.addEventListener('focus', enter);
      cta.addEventListener('blur', leave);
      kills.push(() => {
        frame.removeEventListener('pointerenter', enter);
        frame.removeEventListener('pointerleave', leave);
        cta.removeEventListener('focus', enter);
        cta.removeEventListener('blur', leave);
        tour?.kill();
      });
    }
  }

  /* ---------- splash ---------- */
  kills.push(ST.create({
    trigger: '.works__splash', start: 'top bottom', end: 'bottom top', scrub: true,
    animation: G.fromTo('.works__h', { yPercent: 10 }, { yPercent: -10, ease: 'none' }),
  }));
  kills.push(ST.create({
    trigger: '.works__splash', start: 'top 60%', once: true,
    onEnter: () => {
      G.from('.works__h', { yPercent: 30, opacity: 0, duration: 1, ease: 'power3.out' });
      G.from(['.works__head .kicker', '.works__sub'], { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.2, ease: 'power3.out' });
    },
  }));

  return () => {
    kills.forEach((k) => (typeof k === 'function' ? k() : k.kill()));
    handles.forEach((h) => h.reset());
    injected.forEach((n) => n.remove());
    G.set($$('.bframe__shot, .pframe, .work__text'), { clearProps: 'all' });
  };
}
