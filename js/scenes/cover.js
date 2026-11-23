/* Cover (the first cut), contents under-layer, chapter 1 gutter cut. */
import { env, $, $$ } from '../core/env.js';
import { createSlash, trail } from '../fx/slice.js';
import { kanjiFlash, impact, shake, burst, sound } from '../fx/fx.js';
import { createPetals } from '../fx/petals.js';

const gsap = () => window.gsap;

function splitMasthead() {
  const m = $('.masthead__t');
  if (!m || m.dataset.split) return;
  m.dataset.split = '1';
  m.innerHTML = [...m.textContent].map((c) => `<span class="ch">${c}</span>`).join('');
}

export function cover({ desktop, loaderDone }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const section = $('#cover');
  const pin = $('.cover__pin');
  const stage = $('.cover__stage');
  const under = $('.cover__under');
  const contents = $('#contents');
  const plate = $('.cover__plate');
  const fig = $('.cover__fig');
  const type = $('.cover__type');
  const ronin = $('.cover__ronin');
  const fx = $('.cover__fx');
  const cleanups = [];

  // contents lives under the cover while the cut opens it
  const contentsHome = contents.parentElement;
  const contentsNext = contents.nextElementSibling;
  under.append(contents);
  cleanups.push(() => contentsHome.insertBefore(contents, contentsNext));

  // on phones the ronin joins the plate: two layers to cut instead of three
  if (!desktop) {
    plate.append(ronin);
    cleanups.push(() => fig.append(ronin));
  }

  splitMasthead();

  // sakura drifting over the cover (outside the cut layers)
  const pc = document.createElement('canvas');
  pc.className = 'cover__petals';
  pc.setAttribute('aria-hidden', 'true');
  fx.append(pc);
  const petals = createPetals(pc, { count: desktop ? 34 : 16 });
  petals.setWind(desktop ? 26 : 14);
  cleanups.push(() => { petals.destroy(); pc.parentNode?.removeChild(pc); });

  // intro after the loader
  loaderDone.then(() => {
    G.from('.masthead .ch', { yPercent: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'power3.out' });
    G.from('.cover__sun', { opacity: 0, duration: 1.4, ease: 'power2.out' });
    G.from('.cover .tag', { yPercent: -120, duration: 0.7, ease: 'power3.out', delay: 0.25 });
    G.from(['.cover .kicker', '.cover__h1', '.cover__lead', '.cover__btns'], { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.15 });
    G.from('.cover__ronin', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
  });

  const layers = desktop
    ? [{ el: plate, depth: 0.3 }, { el: fig, depth: 0.65 }, { el: type, depth: 1 }]
    : [{ el: plate, depth: 0.45 }, { el: type, depth: 1 }];
  const make = () => createSlash({
    layers,
    angle: desktop ? -26 : -22,
    through: () => {
      const a = $('.cover__type .cut-anchor');
      const r = (a || type).getBoundingClientRect();
      return [r.left + r.width * 0.55, r.top + r.height * 0.5];
    },
    trailRect: () => stage.getBoundingClientRect(),
    fall: 'scrub',
    slip: 24, hitStop: 70,
    gap: desktop ? { base: '3vh', k: '14vh', exit: '80vh' } : { base: '4vh', k: '10vh', exit: '75vh' },
    trail: { w: desktop ? 16 : 12, dur: 0.14 },
    onSwap: (h) => {
      section.classList.add('is-cut');
      const pr = pin.getBoundingClientRect();
      impact(pin, h.P, desktop ? 'impact' : 'white');
      kanjiFlash(fx, '斬', { x: pr.width * 0.5, y: pr.height * 0.46, size: Math.min(pr.height * 0.62, 560), hold: 0.25 });
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const k = i / 10;
        pts.push([h.seg[0][0] + (h.seg[1][0] - h.seg[0][0]) * k, h.seg[0][1] + (h.seg[1][1] - h.seg[0][1]) * k]);
      }
      burst(pin, { points: pts, count: 46, colors: ['#E5122A', '#9E0B1C', '#FF2A44', '#F4EFEA'], size: [1.5, 5] });
      sound.play('swish');
      shake(stage, 4);
    },
  });
  let h = make();
  let progress = 0;

  // connective motion + pin
  const tl = G.timeline({ defaults: { ease: 'none' } });
  tl.to(stage, { scale: 1.04, duration: 0.18 }, 0)
    .to(desktop ? '.cover__fig' : '.cover__ronin', { yPercent: -2, duration: 0.18 }, 0)
    .to('.cover__sun', { y: '4vh', duration: 0.18 }, 0)
    .fromTo(under, { scale: 1.06 }, { scale: 1, duration: 0.68 }, 0.22)
    .to({}, { duration: 0.1 }, 0.9);
  const glint = document.createElement('i');
  glint.className = 'cover__glint';
  glint.style.cssText = 'position:absolute;top:0;bottom:0;width:7%;left:0;background:rgba(255,255,255,.85);transform:skewX(-20deg);opacity:0;pointer-events:none;z-index:4';
  fx.append(glint);
  cleanups.push(() => glint.remove());
  tl.fromTo(glint, { xPercent: -200, opacity: 0.9 }, { xPercent: 1500, opacity: 0.9, duration: 0.08 }, 0.08)
    .set(glint, { opacity: 0 }, 0.17);

  let fallTween = null;
  const apply = (p) => {
    progress = p;
    if (p >= 0.2 && h.state() === 'idle') {
      h.cut();
    }
    if (p < 0.16 && h.state() !== 'idle') {
      fallTween?.kill();
      h.reset();
      h = make();
      section.classList.remove('is-cut');
    }
    if (h.fallTl) {
      const target = Math.max(0, Math.min(1, (p - 0.22) / 0.68));
      fallTween = G.to(h.fallTl, { progress: target, duration: 0.4, ease: 'power3.out', overwrite: true });
    }
  };

  const st = ST.create({
    trigger: section,
    start: 'top top',
    end: desktop ? '+=130%' : '+=100%',
    pin: pin,
    pinSpacing: true,
    anticipatePin: 1,
    animation: tl,
    scrub: desktop ? 0.4 : true,
    onUpdate: (s) => apply(s.progress),
    onRefresh: (s) => {
      // page loaded below the cover: show the aftermath straight away
      if (s.progress >= 0.2 && h.state() === 'idle') {
        h.prepare();
        section.classList.add('is-cut');
        for (const q of h.pieces) { q.fall.style.visibility = 'visible'; }
        for (const l of layers) l.el.style.visibility = 'hidden';
        h.fallTl?.progress(Math.min(1, (s.progress - 0.22) / 0.68));
      }
    },
  });

  return () => {
    st.kill();
    tl.kill();
    fallTween?.kill();
    h.reset();
    section.classList.remove('is-cut');
    G.set([stage, under, '.cover__sun', '.cover__fig', '.cover__ronin'], { clearProps: 'transform' });
    cleanups.forEach((f) => f());
  };
}

/* Chapter 1: one blade runs through the gutters and ink covers slide off. */
export function about({ desktop }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const page = $('.code__grid');
  const panels = $$('.code__item', page);
  const covers = panels.map((p) => {
    const c = document.createElement('div');
    c.className = 'ink-cover';
    c.setAttribute('aria-hidden', 'true');
    p.append(c);
    return c;
  });
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mpage-cut');
  svg.setAttribute('aria-hidden', 'true');
  page.style.position = 'relative';
  page.append(svg);
  const dirs = desktop
    ? [{ yPercent: -102 }, { yPercent: 102 }, { yPercent: -102 }]
    : [{ xPercent: 102 }, { xPercent: -102 }, { xPercent: 102 }];
  let done = false;

  const build = () => {
    const pr = page.getBoundingClientRect();
    const r = panels.map((p) => p.getBoundingClientRect());
    const rel = (x, y) => `${(x - pr.left).toFixed(1)},${(y - pr.top).toFixed(1)}`;
    svg.setAttribute('viewBox', `0 0 ${pr.width.toFixed(1)} ${pr.height.toFixed(1)}`);
    svg.setAttribute('width', pr.width);
    svg.setAttribute('height', pr.height);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:8';
    let pts;
    if (desktop) {
      const y = pr.top + pr.height * 0.42;
      pts = [rel(pr.left - 60, y + 14), rel(pr.right + 60, y - 14)];
    } else {
      pts = [rel(pr.left - 10, pr.top - 20)];
      for (let i = 0; i < r.length - 1; i++) {
        const y = (r[i].bottom + r[i + 1].top) / 2;
        pts.push(rel(i % 2 ? pr.left - 10 : pr.right + 10, y));
      }
      pts.push(rel(pr.left - 10, pr.bottom + 20));
    }
    svg.innerHTML = `<polyline points="${pts.join(' ')}" fill="none" stroke="#E5122A" stroke-opacity=".55" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${pts.join(' ')}" fill="none" stroke="#F4EFEA" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  };

  const st = ST.create({
    trigger: page,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      if (done) return;
      done = true;
      if (page.getBoundingClientRect().bottom < 0) { covers.forEach((c) => c.remove()); return; }
      build();
      const lines = svg.querySelectorAll('polyline');
      const tl = G.timeline();
      tl.fromTo(lines, { drawSVG: '0%' }, { drawSVG: '100%', duration: desktop ? 0.2 : 0.32, ease: 'power2.in' }, 0)
        .call(() => sound.play('swish'), null, 0)
        .to(covers, { duration: 0.26, ease: 'power3.in', stagger: 0.03,
          xPercent: (i) => dirs[i].xPercent || 0, yPercent: (i) => dirs[i].yPercent || 0 }, 0.14)
        .from($$('.code__h, .code__t, .code__label', page), { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.03 }, 0.3)
        .to(lines, { opacity: 0, duration: 0.25 }, 0.45)
        .from($$('.code__k', page), { scale: 1.3, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, 0.3)
        .call(() => covers.forEach((c) => c.remove()), null, 0.55);
    },
  });

  return () => {
    st.kill();
    covers.forEach((c) => c.remove());
    svg.remove();
    G.set($$('.code__k, .code__h, .code__t, .code__label', page), { clearProps: 'all' });
  };
}
