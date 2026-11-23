/* Environment flags shared by all modules. */
const h = document.documentElement;
const qDesktop = matchMedia('(min-width: 1024px) and (pointer: fine)');

export const env = {
  get calm() { return h.classList.contains('calm'); },
  get lang() { return h.lang === 'en' ? 'en' : 'ru'; },
  get desktop() { return qDesktop.matches; },
  get phone() { return !qDesktop.matches; },
  systemCalm: matchMedia('(prefers-reduced-motion: reduce)').matches,
};

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function store(kind, key, val) {
  try {
    const s = kind === 'session' ? sessionStorage : localStorage;
    if (val === undefined) return s.getItem(key);
    if (val === null) s.removeItem(key);
    else s.setItem(key, val);
  } catch (e) { return null; }
  return val;
}

/* Fire once when el is within rootMargin of the viewport. */
export function near(el, fn, margin = '50%') {
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { rootMargin: `${margin} 0px` });
  io.observe(el);
  return io;
}
