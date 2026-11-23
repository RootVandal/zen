/* ==========================================================================
   Content: the single source of truth.
   Facts about the studio are the same as on axioma.codes: prices, contacts,
   process and FAQ are copied from Axioma word for word. Change them here and
   on Axioma together, then run `node tools/build.mjs` to refresh index.html.
   ========================================================================== */

export const LINKS = {
  telegram: 'https://t.me/nonexxxist',
  telegramHandle: '@nonexxxist',
  axioma: 'https://axioma.codes/',
  request: { ru: 'https://axioma.codes/?lang=ru#request', en: 'https://axioma.codes/?lang=en#request' },
  prices: { ru: 'https://axioma.codes/services/', en: 'https://axioma.codes/en/services/' },
};

/* Price tiers: exactly as on axioma.codes/services
   ($ and ₽ at the National Bank of Kazakhstan rate of 4 November 2026). */
export const PRICES = [
  {
    id: 'landing', seal: '壱', blade: 0.42, from: false,
    price: { ru: '12 000', en: '12,000' },
    approx: { ru: '≈ $27 · ≈ 2 150 ₽', en: '≈ $27 · ≈ 2,150 RUB' },
    name: { ru: 'Лендинг', en: 'Landing page' },
    items: {
      ru: ['Одна страница под продукт или услугу', 'Адаптация под телефон', 'Форма заявки'],
      en: ['One page for a product or service', 'Works on phones', 'Request form'],
    },
    examples: ['coffee'],
  },
  {
    id: '3d', seal: '弐', blade: 0.62, from: true,
    price: { ru: '30 000', en: '30,000' },
    approx: { ru: '≈ $66 · ≈ 5 380 ₽', en: '≈ $66 · ≈ 5,380 RUB' },
    name: { ru: '3D-сайт', en: '3D website' },
    items: {
      ru: ['3D-сцена или анимация на первом экране', 'Адаптация под телефон', 'Форма заявки'],
      en: ['3D scene or animation on the first screen', 'Works on phones', 'Request form'],
    },
    examples: ['axioma', 'planet'],
  },
  {
    id: 'business', seal: '参', blade: 0.82, from: true,
    price: { ru: '40 000', en: '40,000' },
    approx: { ru: '≈ $88 · ≈ 7 170 ₽', en: '≈ $88 · ≈ 7,170 RUB' },
    name: { ru: 'Бизнес-сайт', en: 'Business website' },
    items: {
      ru: ['Несколько страниц: услуги, о компании, контакты', 'Адаптация под телефон', 'Базовая настройка для поиска'],
      en: ['Several pages: services, about, contacts', 'Works on phones', 'Basic search setup'],
    },
    examples: ['build', 'noir'],
  },
  {
    id: 'complex', seal: '肆', blade: 1, from: false, complex: true,
    name: { ru: 'Сложный проект', en: 'Complex project' },
    priceText: { ru: 'Цена обсуждается индивидуально', en: 'The price is agreed individually' },
    lead: {
      ru: 'Интернет-магазин, приложение или что-то особенное? Напишите в Telegram или оставьте заявку.',
      en: 'An online store, an app or something unusual? Message us on Telegram or send a request.',
    },
    examples: ['lumen'],
  },
];

export const HONESTY = {
  own: { ru: 'Наш проект', en: 'Our own project' },
  demo: { ru: 'Демо · компания вымышлена', en: 'Demo · fictional company' },
  concept: { ru: 'Концепт', en: 'Concept' },
  wip: { ru: 'Наш проект · в работе', en: 'Our project · in progress' },
};

/* Works, in page order. cut: 'ink' (an ink proof is sliced away) or 'noren'
   (a red curtain is cut). sfx: Japanese onomatopoeia + RU/EN twins. */
export const WORKS = [
  {
    key: 'axioma', tier: '3d', honesty: 'own', kanji: '公理', tour: false,
    cut: { type: 'ink', angle: -24 },
    sfx: { jp: 'キラッ', ru: 'ВЖУХ', en: 'SHING' },
    title: 'Axioma',
    url: 'https://axioma.codes/', host: 'axioma.codes',
    kind: { ru: '3D-сайт веб-студии', en: 'Web studio 3D website' },
    desc: {
      ru: 'Девять сцен, которые рождаются прямо в браузере на WebGL2, и музыка, которая сочиняется на ходу. Ни одной картинки или видео — всё генерируется в реальном времени.',
      en: 'Nine scenes generated right in the browser with WebGL2, and music composed on the fly. Not a single image or video file: everything is rendered in real time.',
    },
  },
  {
    key: 'planet', tier: '3d', honesty: 'wip', kanji: '惑星', tour: false,
    cut: { type: 'noren', kanji: '惑星' },
    title: 'PLANET',
    url: 'https://kenyfn.github.io/planet-preview/', host: 'planet-preview',
    kind: { ru: 'Сайт веб-студии', en: 'Web studio website' },
    desc: {
      ru: 'Живая сцена с вишнёвым деревом, которая растёт и меняется при прокрутке — без сторонних библиотек анимации. Услуги с ценами, этапы работы, кейсы, вопросы, форма заявки и две языковые версии.',
      en: 'A living scene with a cherry tree that grows and changes as you scroll, with no third-party animation libraries. Services with prices, work stages, case studies, FAQ, a request form and two language versions.',
    },
  },
  {
    key: 'noir', tier: 'business', honesty: 'concept', kanji: '黒',
    cut: { type: 'ink', angle: 18 },
    sfx: { jp: 'シャーッ', ru: 'ПШШШ', en: 'FSSHH' },
    title: 'NOIR DETAILING',
    url: 'https://rootvandal.github.io/noir-detailing/', host: 'noir-detailing',
    kind: { ru: 'Детейлинг-студия', en: 'Car detailing studio' },
    desc: {
      ru: 'Премиальная студия в стиле автомобильного журнала: строгий чёрно-белый язык, калькулятор стоимости, слайдер «до / после» и запись в WhatsApp.',
      en: 'A premium studio in the style of a car magazine: strict black and white, a price calculator, a before/after slider and booking via WhatsApp.',
    },
  },
  {
    key: 'coffee', tier: 'landing', honesty: 'demo', kanji: '珈琲',
    cut: { type: 'noren', kanji: '珈琲' },
    sfx: { jp: 'トポポ', ru: 'БУЛЬ', en: 'GLUG' },
    title: 'Bloom Coffee',
    url: 'https://rootvandal.github.io/axioma-demos/coffee/', host: 'axioma-demos/coffee',
    kind: { ru: 'Лендинг кофейни', en: 'Coffee shop landing page' },
    desc: {
      ru: 'Одна страница, которая пахнет кофе: тёплый первый экран, меню с фильтром, часы работы и «как нас найти» — всё, чтобы гость пришёл утром.',
      en: 'One page that smells of coffee: a warm first screen, a filterable menu, opening hours and directions, everything to bring a guest in the morning.',
    },
  },
  {
    key: 'lumen', tier: 'complex', honesty: 'demo', kanji: '宝石',
    cut: { type: 'ink', angle: -28 },
    sfx: { jp: 'キラキラ', ru: 'ДЗИНЬ', en: 'TWINKLE' },
    title: 'Lumen',
    url: 'https://rootvandal.github.io/axioma-demos/lumen/', host: 'axioma-demos/lumen',
    kind: { ru: 'Интернет-магазин украшений', en: 'Online jewelry store' },
    desc: {
      ru: 'Ювелирная мастерская из Алматы: спокойная редакционная типографика, золото на тёплом фоне, каталог по категориям, корзина и рассказ о мастерской.',
      en: 'A jewelry workshop from Almaty: calm editorial typography, gold on a warm background, a catalog by category, a cart and the workshop story.',
    },
  },
  {
    key: 'build', tier: 'business', honesty: 'demo', kanji: '建',
    cut: { type: 'noren', kanji: '建' },
    sfx: { jp: 'ドドド', ru: 'БУМ', en: 'THOOM' },
    title: 'Qala Build',
    url: 'https://rootvandal.github.io/axioma-demos/build/', host: 'axioma-demos/build',
    kind: { ru: 'Сайт строительной компании', en: 'Construction company website' },
    desc: {
      ru: 'Частные дома под ключ: услуги с ценами за метр, сданные объекты, этапы работы и заявка на смету. Цифры доверия прямо на первом экране.',
      en: 'Turnkey private houses: services priced per square metre, finished projects, work stages and an estimate request. Trust numbers right on the first screen.',
    },
  },
];


/* The studio's three principles, word for word from axioma.codes. */
export const CODE = [
  { kanji: '技',
    k: { ru: 'Разработка', en: 'Engineering' },
    h: { ru: 'Ваш сайт — это машина.', en: 'Your website is a machine.' },
    t: { ru: 'Каждая деталь работает на результат: быстрая загрузка, чистый код и стабильная работа на любом устройстве.',
         en: 'Every part does a job: pages that load fast, clean code and steady work on any device.' } },
  { kanji: '目',
    k: { ru: 'Заметность', en: 'Visibility' },
    h: { ru: 'Больше миллиарда сайтов. Заметят ваш.', en: 'Over a billion websites. Yours gets noticed.' },
    t: { ru: 'Поисковое продвижение, скорость и запоминающийся образ выделяют вас среди всех в вашей нише.',
         en: 'Search optimisation, speed and a memorable look set you apart from everyone else in your niche.' } },
  { kanji: '心',
    k: { ru: 'Внимание', en: 'Attention' },
    h: { ru: 'Сайт, от которого не оторваться.', en: 'A site people can’t pull away from.' },
    t: { ru: 'Гравитация работает и в интернете. Сильный первый экран притягивает посетителя и удерживает его до конца.',
         en: 'Gravity works online too. A strong first screen draws the visitor in and keeps them to the end.' } },
];

export const STEPS = [
  { seal: '一', sfx: { jp: 'シュッ', ru: 'ФЬЮТЬ', en: 'WHOOSH' },
    ru: 'Вы оставляете <a href="{request}">заявку</a> или пишете в <a href="{telegram}">Telegram</a>.',
    en: 'You send a <a href="{request}">request</a> or message us on <a href="{telegram}">Telegram</a>.' },
  { seal: '二', sfx: { jp: 'ズズッ', ru: 'ХЛЮП', en: 'SLURP' },
    ru: 'Мы обсуждаем задачу и цену.', en: 'We discuss the task and the price.' },
  { seal: '三', sfx: { jp: 'カキカキ', ru: 'ЧИРК-ЧИРК', en: 'SCRIBBLE' },
    ru: 'Создаём дизайн и разрабатываем сайт.', en: 'We design and build the site.' },
  { seal: '四', sfx: { jp: 'ドーン', ru: 'БАБАХ', en: 'BOOM' },
    ru: 'Запускаем сайт.', en: 'We launch it.' },
];

export const FAQ = [
  {
    q: { ru: 'Сколько стоит сайт?', en: 'How much does a website cost?' },
    a: {
      ru: 'Лендинг стоит 12 000 ₸ (около $27 или 2 150 ₽), 3D-сайт от 30 000 ₸, бизнес-сайт от 40 000 ₸. Сложные проекты обсуждаются индивидуально.',
      en: 'A landing page costs 12,000 KZT (about $27 or 2,150 RUB), a 3D site starts from 30,000 KZT and a business site from 40,000 KZT. Complex projects are priced individually.',
    },
  },
  {
    q: { ru: 'Вы работаете только в Алматы?', en: 'Do you only work in Almaty?' },
    a: {
      ru: 'Нет. Мы находимся в Алматы, но принимаем заказы со всего Казахстана, из стран СНГ и других стран.',
      en: 'No. We are based in Almaty and take orders from across Kazakhstan, the CIS and other countries.',
    },
  },
  {
    q: { ru: 'Как заказать сайт?', en: 'How do I order a website?' },
    a: {
      ru: 'Оставьте <a href="{request}">заявку на сайте</a> или напишите в Telegram <a href="{telegram}">@nonexxxist</a>.',
      en: 'Send a <a href="{request}">request on the site</a> or message us on Telegram at <a href="{telegram}">@nonexxxist</a>.',
    },
  },
];

/* SFX used by sections (Japanese + RU/EN twins). */
export const SFX = {
  shing: { jp: 'シャキーン', ru: 'ДЗЕНЬ', en: 'SHING' },
  slash: { jp: 'ズバッ!', ru: 'ВЖИХ!', en: 'SLASH!' },
  tada: { jp: 'ドン', ru: 'ТАДАМ', en: 'TA-DA' },
  bam: { jp: 'ドン', ru: 'БАМ', en: 'BAM' },
  snip: { jp: 'スパッ', ru: 'ЧИК', en: 'SNIP' },
  done: { jp: 'シャキーン', ru: 'ВЖЖИК', en: 'SHHING' },
  pop: { jp: 'ポン', ru: 'ЧПОК', en: 'POP' },
  zan: { jp: 'ザンッ', ru: 'ВЖЖЖ', en: 'ZAN' },
  chin: { jp: 'チン', ru: 'КЛАЦ', en: 'CHING' },
  xcut: { jp: 'ズバババッ', ru: 'ХРЯСЬ', en: 'SHRAK' },
  thud: { jp: 'ドスッ', ru: 'ТУК', en: 'THUD' },
};
