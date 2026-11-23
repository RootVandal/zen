/* Prices, process, FAQ, the duel, the back cover and the credits. */
import { env, $, $$ } from '../core/env.js';
import { createSlash, trail } from '../fx/slice.js';
import { kanjiFlash, impact, shake, burst, sound } from '../fx/fx.js';
import { createPetals } from '../fx/petals.js';

const gsap = () => window.gsap;
const NS = 'http://www.w3.org/2000/svg';

/* ======================= PRICES ======================= */
export function prices({ desktop }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const kills = [];
  const injected = [];
  const cards = $$('.price');

  kills.push(ST.create({
    trigger: '.eyecatch', start: 'top bottom', end: 'center center', scrub: true,
    animation: G.fromTo('.eyecatch__art', { scale: 1.08, rotation: -30 }, { scale: 1, rotation: 0, ease: 'none' }),
  }));
  kills.push(ST.create({
    trigger: '.eyecatch', start: 'top 70%', once: true,
    onEnter: () => {
      G.from('.eyecatch__enso', { rotation: -120, opacity: 0, scale: 0.8, duration: 1.2, ease: 'expo.out', transformOrigin: '50% 50%' });
      G.from('.eyecatch__k', { opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 });
      G.from(['.eyecatch .kicker', '.eyecatch .ch-head__h', '.eyecatch__line'], { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
    },
  }));

  // obi bands seal the feature lists
  const obis = [];
  for (const c of cards) {
    const list = $('.price__list', c);
    if (!list) continue;
    const obi = document.createElement('div');
    obi.className = 'obi';
    obi.setAttribute('aria-hidden', 'true');
    const band = '<div class="obi__band"><span>ZEN</span></div>';
    obi.innerHTML = `<div class="obi__half" style="clip-path:polygon(0 0,58% 0,42% 100%,0 100%)">${band}</div><div class="obi__half" style="clip-path:polygon(58% 0,100% 0,100% 100%,42% 100%)">${band}</div>`;
    list.append(obi);
    injected.push(obi);
    obis.push({ card: c, obi });
  }

  G.set(cards, { y: 40, opacity: 0 });
  kills.push(ST.create({
    trigger: '.prices__grid', start: 'top 85%', once: true,
    onEnter: () => G.to(cards, { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'power2.out' }),
  }));
  kills.push(ST.create({
    trigger: '.prices__grid', start: 'top bottom', end: 'center center', scrub: true,
    animation: G.fromTo('.price__blade svg', { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none' }),
  }));

  kills.push(ST.create({
    trigger: '.prices__grid', start: desktop ? 'top 62%' : 'top 70%', once: true,
    onEnter: () => {
      obis.forEach(({ card, obi }, i) => {
        const r = obi.getBoundingClientRect();
        const delay = i * 0.14;
        const [a, b] = $$('.obi__half', obi);
        const tl = G.timeline({ delay });
        tl.call(() => {
          trail([r.left + r.width * 0.6, r.top - 16], [r.left + r.width * 0.4, r.bottom + 16], { w: 10, dur: 0.12 });
          sound.play('swish');
        }, null, 0);
        tl.to(a, { x: -24, y: 18, rotation: -6, duration: 0.14, ease: 'power2.out' }, 0.12)
          .to(b, { x: 24, y: -18, rotation: 6, duration: 0.14, ease: 'power2.out' }, 0.12)
          .to(a, { x: -60, y: () => innerHeight * 0.9, rotation: -22, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.3)
          .to(b, { x: 60, y: () => innerHeight * 0.9, rotation: 26, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.3)
          .fromTo($('.price__sum', card), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.2)
          .call(() => obi.remove(), null, 1.1);
        if (i === 0) tl.call(() => sound.play('thud'), null, 0.2);
      });
    },
  }));

  return () => {
    kills.forEach((k) => k.kill());
    injected.forEach((n) => n.remove());
    G.set([...cards, ...$$('.price__sum'), ...$$('.price__blade svg'), '.eyecatch__art', '.eyecatch__enso', '.eyecatch__k'], { clearProps: 'all' });
  };
}

/* ======================= PROCESS ======================= */
export function process({ desktop }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const kills = [];
  const steps = $$('.step');
  const blade = $('.process__blade-track svg');
  const track = $('.process__blade-track');

  if (desktop) {
    kills.push(ST.create({
      trigger: '.steps', start: 'top 60%', end: 'bottom 60%', scrub: 0.5,
      animation: G.fromTo(blade, { yPercent: -100 }, { yPercent: 0, ease: 'none' }),
      onLeave: () => sound.play('chin'),
    }));
  } else {
    kills.push(ST.create({
      trigger: '.steps', start: 'top 60%', end: 'bottom 60%', scrub: true,
      onUpdate: (s) => track.style.setProperty('--p', s.progress.toFixed(3)),
    }));
    track.style.setProperty('--p', '0');
  }

  steps.forEach((st, i) => {
    const num = $('.step__num', st);
    const txt = $$('.step__label, .step__line', st);
    G.set(num, { opacity: 0.12, scale: 0.92 });
    G.set(txt, { opacity: 0, y: 26 });
    kills.push(ST.create({
      trigger: st, start: 'top 72%', once: true,
      onEnter: () => {
        G.to(num, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' });
        G.to(txt, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
        const r = num.getBoundingClientRect();
        if (i === 3) {
          burst(st, { points: [[r.left + r.width / 2, r.top + r.height / 2]], count: 30, colors: ['#FF8FB1', '#FFC2D3', '#F4EFEA', '#E5122A'], gravity: 260, speed: [100, 340], size: [2, 5], life: 1.4 });
        }
      },
    }));
  });

  return () => {
    kills.forEach((k) => k.kill());
    G.set([blade, ...$$('.step__num'), ...$$('.step__label'), ...$$('.step__line')], { clearProps: 'all' });
  };
}

/* ======================= FAQ ======================= */
export function faq() {
  const G = gsap();
  const on = (e) => {
    const d = e.target;
    if (!d.open || env.calm) return;
    const a = $('.qa__a', d);
    G.fromTo(a, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
  };
  const list = $$('.qa');
  list.forEach((d) => d.addEventListener('toggle', on));
  return () => list.forEach((d) => d.removeEventListener('toggle', on));
}

/* ======================= DUEL ======================= */
export function duel({ desktop }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const section = $('#finale');
  const pin = $('.duel__pin');
  const panel = $('.duel__panel');
  const hero = $('.duel__hero');
  const smear = document.createElement('div');
  smear.className = 'duel__smear';
  smear.setAttribute('aria-hidden', 'true');
  panel.append(smear);
  const enemy = $('.duel__enemy');
  const enemyWrap = $('.duel__enemy-wrap');
  const insert = $('.duel__insert');
  const bladeEl = $('.duel__blade');
  const lines = $('.duel__lines');
  const capA = $('.duel__cap-a'), capB = $('.duel__cap-b'), capC = $('.duel__cap-c');
  const kills = [];
  G.set(hero, { xPercent: -50, x: 0 });

  const makeCut = (second) => createSlash({
    layers: [{ el: enemy, depth: 1 }],
    angle: -28,
    second: null,
    through: [0.5, 470 / 900],
    remove: true,
    fall: 'time',
    slip: 10, hitStop: 0, slipDur: 0.4,
    timeFall: { dist: desktop ? '14vh' : '10vh', rot: desktop ? 10 : 7, dur: 0.9, ease: 'power2.in', gravity: 0 },
    trail: { w: 9, dur: 0.3 },
    onSwap: (h) => {
      impact(panel, h.P, desktop ? 'impact' : 'white');
      shake(panel, 4);
      const pr = panel.getBoundingClientRect();
      const pts = [];
      for (let i = 0; i <= 12; i++) pts.push([h.seg[0][0] + (h.seg[1][0] - h.seg[0][0]) * i / 12, h.seg[0][1] + (h.seg[1][1] - h.seg[0][1]) * i / 12]);
      burst(panel, { points: pts, count: desktop ? 90 : 40, colors: ['#0B0A0C', '#9E0B1C', '#F4EFEA'], life: 1.1, gravity: 700, speed: [60, 320], size: [1.5, 4] });
    },
  });

  if (desktop) {
    let h = makeCut(true);
    let dashed = false;
    G.set(insert, { xPercent: -50, yPercent: 160, x: 0, y: 0 });
    G.set(bladeEl, { xPercent: -58 });
    const tl = G.timeline({ defaults: { ease: 'none' } });
    tl.to('.duel__bar', { scaleY: 1, duration: 0.1 }, 0)
      .fromTo('.duel__wind i', { x: -40 }, { x: 40, duration: 1 }, 0)
      .fromTo(capA, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.06 }, 0.14)
      .to(capA, { opacity: 0, duration: 0.04 }, 0.32)
      .fromTo(capB, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.36)
      .to(insert, { yPercent: 0, duration: 0.06, ease: 'power2.out' }, 0.36)
      .to(bladeEl, { xPercent: 0, duration: 0.24, ease: 'power2.in' }, 0.42)
      .to(insert, { yPercent: 160, duration: 0.05, ease: 'power2.in' }, 0.7)
      .to(capB, { opacity: 0, duration: 0.02 }, 0.7)
      .fromTo(capC, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.72)
      .to('.duel__bar', { scaleY: 0, duration: 0.1 }, 0.88)
      .to({}, { duration: 0.02 }, 0.98);

    const dash = (forward) => {
      const W = panel.clientWidth;
      if (forward) {
        sound.play('swish');
        const d = G.timeline();
        d.set(smear, { opacity: 1, x: 0, scaleX: 0.3 }, 0)
          .set(hero, { opacity: 0 }, 0.06)
          .to(smear, { x: W * 0.4, scaleX: 1, duration: 0.23, ease: 'power4.inOut' }, 0)
          .to(hero, { x: W * 0.58, duration: 0.35, ease: 'power4.inOut' }, 0)
          .set(hero, { opacity: 1 }, 0.29)
          .to(smear, { opacity: 0, duration: 0.1 }, 0.27)
          .set(hero, { scaleX: -1 }, 0.35);
      } else {
        G.to(hero, { x: 0, scaleX: 1, opacity: 1, duration: 0.2, ease: 'power2.out', overwrite: true });
        G.set([smear, lines], { opacity: 0 });
      }
    };

    let cutDone = false;
    let dc = null;
    kills.push(() => dc?.kill());
    kills.push(ST.create({
      trigger: section, start: 'top top', end: '+=100%', pin, pinSpacing: true, anticipatePin: 1,
      animation: tl, scrub: 0.5,
      onUpdate: (s) => {
        const p = s.progress;
        if (p >= 0.32 && !dashed) { dashed = true; dash(true); }
        if (p < 0.3 && dashed) { dashed = false; dash(false); }
        if (p >= 0.68 && !cutDone) {
          cutDone = true;
          sound.play('chin');
          const hh = h;
          dc = G.delayedCall(0.12, () => hh.cut());
        }
        if (p < 0.66 && cutDone) {
          cutDone = false;
          dc?.kill();
          h.reset();
          h = makeCut(true);
        }
      },
    }));
    kills.push(() => h.reset());
    kills.push(() => G.set([hero, smear, lines, insert, bladeEl, capA, capB, capC, '.duel__bar', '.duel__wind i'], { clearProps: 'all' }));
  } else {
    const h = makeCut(false);
    G.set(insert, { xPercent: -50, yPercent: 160, x: 0, y: 0, autoAlpha: 0 });
    G.set(bladeEl, { xPercent: -58 });
    kills.push(ST.create({
      trigger: panel, start: 'top 60%', once: true,
      onEnter: () => {
        const W = panel.clientWidth;
        const tl = G.timeline();
        tl.fromTo(capA, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
          .call(() => sound.play('swish'), null, 0.3)
          .set(smear, { opacity: 1, x: 0, scaleX: 0.3 }, 0.3)
          .to(smear, { x: W * 0.3, scaleX: 1, duration: 0.25, ease: 'power4.inOut' }, 0.3)
          .to(hero, { x: W * 0.5, duration: 0.35, ease: 'power4.inOut' }, 0.3)
          .to(smear, { opacity: 0, duration: 0.1 }, 0.58)
          .set(hero, { scaleX: -1 }, 0.66)
          .to(capA, { opacity: 0, duration: 0.15 }, 0.7)
          .to(insert, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0.7)
          .to(bladeEl, { xPercent: 0, duration: 0.8, ease: 'power2.in' }, 0.9)
          .call(() => sound.play('chin'), null, 1.7)
          .to(insert, { yPercent: 160, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 1.75)
          .call(() => h.cut(), null, 1.82)
          .fromTo(capC, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, 2.2);
      },
    }));
    kills.push(() => h.reset());
    kills.push(() => G.set([hero, smear, insert, bladeEl, capA, capB, capC], { clearProps: 'all' }));
  }

  return () => {
    kills.forEach((k) => (typeof k === 'function' ? k() : k.kill()));
    enemy.style.visibility = '';
  };
}

/* ======================= BACK COVER ======================= */
export function back({ desktop }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const card = $('.back__card');
  const seal = $('.back__seal');
  const tz = $('.back__tsuzuku .tsuzuku');
  const canvas = $('.back__petals');
  const kills = [];
  let petals = null;
  let backCut = null;

  // つづく writes itself through a mask of centre-line strokes
  let strokes = [];
  const src = document.getElementById('tsuzuku-strokes');
  if (false && tz && src) {
    const defs = document.createElementNS(NS, 'defs');
    const mask = document.createElementNS(NS, 'mask');
    mask.id = 'tz-mask';
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', '-20'); mask.setAttribute('y', '-20');
    mask.setAttribute('width', '340'); mask.setAttribute('height', '160');
    for (const n of src.querySelectorAll('path, line, polyline')) {
      const c = n.cloneNode(true);
      c.setAttribute('stroke', '#fff');
      c.setAttribute('fill', 'none');
      mask.append(c);
      strokes.push(c);
    }
    defs.append(mask);
    tz.prepend(defs);
    tz.querySelector('use')?.setAttribute('mask', 'url(#tz-mask)');
    G.set(strokes, { drawSVG: '0%' });
    kills.push(() => { defs.remove(); tz.querySelector('use')?.removeAttribute('mask'); });
  }

  const finish = (instant) => {
    if (strokes.length) G.to(strokes, { drawSVG: '100%', duration: instant ? 0 : 1.2 / strokes.length, stagger: instant ? 0 : 1.2 / strokes.length, ease: 'power1.inOut' });
    if (!petals && canvas) petals = createPetals(canvas, { count: desktop ? 14 : 6, maxDpr: desktop ? 1.5 : 1.25 });
  };

  kills.push(ST.create({
    trigger: card, start: 'top 80%', once: true,
    onEnter: () => {
      const r = card.getBoundingClientRect();
      if (r.bottom < 0 || r.top < innerHeight * 0.2) {
        finish(true);
        return;
      }
      const h = backCut = createSlash({ layers: [{ el: card, depth: 1 }], angle: 90, through: [0.52, 0.5], fall: 'none' });
      h.prepare();
      const vw = innerWidth / 100;
      for (const q of h.pieces) {
        G.set(q.fall, { x: q.dir[0] * 8 * vw, rotation: q.dir[0] * 2, visibility: 'visible' });
      }
      card.style.visibility = 'hidden';
      G.to(h.pieces.map((q) => q.fall), {
        x: 0, rotation: 0, duration: 0.42, ease: 'power3.out',
        onComplete: () => {
          h.reset();
          sound.play('clap');
          finish(false);
        },
      });
    },
  }));

  if (desktop) {
    kills.push(ST.create({
      trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true,
      animation: G.fromTo('.credits', { y: 24 }, { y: -24, ease: 'none' }),
    }));
  }

  return () => {
    kills.forEach((k) => (typeof k === 'function' ? k() : k.kill()));
    backCut?.reset();
    petals?.destroy();
    petals = null;
    card.style.visibility = '';
    G.set(['.credits', ...strokes], { clearProps: 'all' });
  };
}
