/* AXIOMA · Vol. 1 — boot. Content is readable without any of this. */
import { env, $ } from './core/env.js';
import { initI18n, onLang } from './core/i18n.js';
import { refreshSfx } from './fx/fx.js';
import { runLoader, initHeader, initToggles, initPointer, initProgress, initSheet } from './ui/ui.js';
import { cover, about } from './scenes/cover.js';
import { works } from './scenes/works.js';
import { prices, process, faq, duel, back } from './scenes/rest.js';

const G = window.gsap;
const ST = window.ScrollTrigger;
let lenis = null;
const lenisRef = () => lenis;
if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) window.__axk = { lenis: lenisRef };

initI18n();
initHeader(lenisRef);
initSheet(lenisRef);
initToggles(() => location.reload());

if (!G || !ST) {
  // libraries did not load: the page stays fully static and readable
  $('.loader')?.classList.add('is-done');
  document.documentElement.classList.add('calm');
} else {
  if (window.DrawSVGPlugin) G.registerPlugin(ST, window.DrawSVGPlugin);
  else G.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });


  const loaderDone = env.calm ? Promise.resolve(false) : runLoader();
  if (env.calm) $('.loader')?.classList.add('is-done');

  onLang(() => {
    refreshSfx();
    ST.refresh();
  });

  const mm = G.matchMedia();
  mm.add({
    desktop: '(min-width: 1024px) and (pointer: fine)',
    phone: 'not all and (min-width: 1024px) and (pointer: fine)',
  }, (ctx) => {
    const desktop = !!ctx.conditions.desktop;
    if (env.calm) {
      // calm mode: static aftermath frames, only the FAQ pop remains (and it is skipped too)
      return () => {};
    }
    const kills = [];
    if (desktop && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1 });
      lenis.on('scroll', ST.update);
      const tick = (t) => lenis?.raf(t * 1000);
      G.ticker.add(tick);
      G.ticker.lagSmoothing(0);
      kills.push(() => { G.ticker.remove(tick); lenis?.destroy(); lenis = null; });
    }
    const opts = { desktop, loaderDone };
    const scenes = [cover, about, works, prices, process, faq, duel, back];
    for (const s of scenes) {
      try { kills.push(s(opts)); } catch (e) { console.error(`[scene ${s.name}]`, e); }
    }
    if (desktop) {
      kills.push(initPointer(G));
      kills.push(initProgress(G, ST));
    }
    // fonts change text metrics: refresh once they are in
    document.fonts?.ready.then(() => ST.refresh());
    return () => kills.forEach((k) => { try { k?.(); } catch (e) { console.error(e); } });
  });

  // a resize ends the in-flight cuts cleanly
  let rT = 0;
  addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => ST.refresh(), 200);
  });
}
