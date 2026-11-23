/* Cover (the first cut), contents under-layer, chapter 1 gutter cut. */
import { env, $, $$ } from '../core/env.js?v=77de92fa';

import { sound } from '../fx/fx.js?v=77de92fa';
import { createPetals } from '../fx/petals.js?v=77de92fa';

const gsap = () => window.gsap;
let introPlayed = false;


export function cover({ desktop, loaderDone }) {
  const G = gsap();
  const ST = window.ScrollTrigger;
  const section = $('#cover');
  const fx = document.createElement('div');
  fx.className = 'cover__fx';
  fx.setAttribute('aria-hidden', 'true');
  section.append(fx);

  // a few petals drifting over the scene
  const pc = document.createElement('canvas');
  pc.className = 'cover__petals';
  pc.setAttribute('aria-hidden', 'true');
  fx.append(pc);
  const petals = createPetals(pc, { count: desktop ? 14 : 6, maxDpr: desktop ? 1.5 : 1.25 });
  petals.setWind(desktop ? 18 : 10);

  loaderDone.then(() => {
    if (introPlayed) return;
    introPlayed = true;
    G.from('.cover__sun', { opacity: 0, y: 40, duration: 1.6, ease: 'power2.out' });
    G.from('.cover__ronin', { opacity: 0, y: 24, duration: 1.4, ease: 'power2.out', delay: 0.2 });
    G.from(['.cover .kicker', '.masthead', '.cover__h1', '.cover__lead', '.cover__prices', '.cover__btns'], { y: 18, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power2.out', delay: 0.2 });
  });

  // calm parallax as the cover scrolls away
  const tl = G.timeline({ defaults: { ease: 'none' } });
  tl.to('.cover__sun', { yPercent: 35 }, 0)
    .to('.cover__ronin', { yPercent: 12 }, 0)
    .to('.cover__ridge', { yPercent: 8 }, 0)
    .to(desktop ? '.cover__text' : '.cover .kicker, .masthead, .cover__h1, .cover__lead, .cover__prices', { y: desktop ? -80 : -40, opacity: 0.2 }, 0);
  const st = ST.create({ trigger: section, start: 'top top', end: 'bottom top', scrub: true, animation: tl });

  return () => {
    st.kill();
    tl.kill();
    petals.destroy();
    fx.remove();
    G.set(['.cover__sun', '.cover__ronin', '.cover__ridge', '.cover__text', '.cover .kicker', '.masthead', '.cover__h1', '.cover__lead', '.cover__prices'], { clearProps: 'all' });
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
    start: 'top 55%',
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
