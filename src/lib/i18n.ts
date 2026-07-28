// ─────────────────────────────────────────────────────────────────────────────
// Locale dictionaries. English strings live in data.ts (single source of truth)
// and are referenced here; uz/ru are full translations of the same content.
// Non-linguistic data (URLs, emails, image srcs, tech tags) stays in data.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { ABOUT, NAV, PROJECTS, SITE, SKILLS } from './data';

export const LOCALES = ['en', 'uz', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

// База по умолчанию — из data.ts; когда домен меняется через админку,
// сюда передаётся значение из базы.
//
// Форма адреса — без хвостового слэша («https://site», «https://site/ru»).
// Ровно так Next.js нормализует canonical и hreflang при trailingSlash: false,
// поэтому canonical, hreflang, og:url, sitemap и JSON-LD совпадают символ в
// символ и не порождают дублей одной и той же страницы.
export const localeUrl = (locale: Locale, baseUrl: string = SITE.url) =>
  locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;

export type Dict = {
  meta: { title: string; description: string; ogLocale: string };
  role: string;
  subRole: string;
  tagline: string;
  location: string;
  skipToContent: string;
  nav: { label: string; href: string }[];
  hero: {
    available: string;
    intro: string;
    getInTouch: string;
    viewWork: string;
    downloadCv: string;
  };
  about: { eyebrow: string; title: string; paragraphs: string[] };
  services: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string }[];
  };
  skills: { eyebrow: string; title: string; groupTitles: string[] };
  projects: {
    eyebrow: string;
    title: string;
    // Aligned by index with PROJECTS in data.ts.
    items: { description: string; meta?: string }[];
  };
  highlights: { eyebrow: string; title: string };
  contact: {
    eyebrow: string;
    title: string;
    blurb: string;
    writeTelegram: string;
    downloadCv: string;
  };
  footer: { built: string; credit: string };
  install: { button: string; iosHint: string };
};

const en: Dict = {
  meta: {
    title: `${SITE.name} — ${SITE.role} in Tashkent`,
    description: `${SITE.name} — frontend developer in ${SITE.location}. Landing pages, corporate sites, online stores and admin panels with React, Next.js and TypeScript.`,
    ogLocale: 'en_US',
  },
  role: SITE.role,
  subRole: SITE.subRole,
  tagline: SITE.tagline,
  location: SITE.location,
  skipToContent: 'Skip to content',
  nav: NAV,
  hero: {
    available: 'Available for freelance & remote work',
    intro:
      'I design and build responsive sites with React, Next.js and TypeScript, from a one-page landing to a store with an admin panel.',
    getInTouch: 'Get in touch',
    viewWork: 'View projects',
    downloadCv: 'Download CV',
  },
  about: { eyebrow: 'about', title: 'Who I am', paragraphs: ABOUT },
  services: {
    eyebrow: 'services',
    title: 'What I build',
    items: [
      {
        title: 'Landing pages & corporate sites',
        description:
          'One-page landings and multi-page sites for restaurants, construction firms and travel agencies. Clean structure, real conversion paths.',
      },
      {
        title: 'Online stores',
        description:
          'Catalogue, cart, checkout and an admin panel to run it, connected to a real backend rather than a static mock.',
      },
      {
        title: 'Responsive layout & animation',
        description: 'Honest markup from 320px up, with motion that guides attention instead of decorating the page.',
      },
      {
        title: 'Integrations',
        description:
          'Lead forms, Telegram and WhatsApp, maps, payments and third-party APIs wired into the site and tested end to end.',
      },
      {
        title: 'Speed & SEO',
        description:
          'Core Web Vitals, semantic markup, meta tags and structured data, so the site is found and does not keep people waiting.',
      },
      {
        title: 'Admin panels',
        description: 'A place for the client to edit content, products and orders without calling a developer.',
      },
    ],
  },
  skills: {
    eyebrow: 'toolbox',
    title: 'Skills & stack',
    groupTitles: SKILLS.map((g) => g.title),
  },
  projects: {
    eyebrow: 'selected work',
    title: 'Projects',
    items: PROJECTS.map((p) => ({ description: p.description, meta: p.meta })),
  },
  highlights: { eyebrow: 'moments', title: 'Highlights' },
  contact: {
    eyebrow: 'say hello',
    title: "Let's work together",
    blurb:
      'Tell me what you need and roughly when. I answer fastest on Telegram, usually within a day. Open to freelance and full-time work, remote or in Tashkent.',
    writeTelegram: 'Write on Telegram',
    downloadCv: 'Download CV',
  },
  footer: { built: 'Built with Next.js.', credit: 'designed & coded by' },
  install: {
    button: 'Install app',
    iosHint: 'In Safari: Share → “Add to Home Screen”.',
  },
};

const uz: Dict = {
  meta: {
    title: `${SITE.name} — Toshkentdagi Frontend dasturchi`,
    description: `${SITE.name} — Toshkentdagi frontend dasturchi. Landing, korporativ saytlar, onlayn do'konlar va admin panellar: React, Next.js, TypeScript.`,
    ogLocale: 'uz_UZ',
  },
  role: 'Frontend dasturchi',
  subRole: 'Full Stack tomon ketyapman',
  tagline: 'Biznes uchun tez va moslashuvchan saytlar quraman.',
  location: "Toshkent, O'zbekiston",
  skipToContent: "Kontentga o'tish",
  nav: [
    { label: 'Men haqimda', href: '#about' },
    { label: 'Xizmatlar', href: '#services' },
    { label: "Ko'nikmalar", href: '#skills' },
    { label: 'Loyihalar', href: '#projects' },
    { label: 'Aloqa', href: '#contact' },
  ],
  hero: {
    available: 'Frilans va masofaviy ishlar uchun ochiqman',
    intro:
      "React, Next.js va TypeScript'da moslashuvchan saytlar quraman: oddiy landingdan admin paneli bor do'konigacha.",
    getInTouch: "Bog'lanish",
    viewWork: "Loyihalarni ko'rish",
    downloadCv: 'CV yuklab olish',
  },
  about: {
    eyebrow: 'men haqimda',
    title: 'Men kimman',
    paragraphs: [
      "Men Kamron Fazilovman — Toshkentdagi frontend dasturchi. Biznes uchun zamonaviy, tez va moslashuvchan saytlar quraman: landing, korporativ saytlar, onlayn do'konlar va admin panellar.",
      "React, Next.js va TypeScript bilan ishlayman va odatda e'tibordan chetda qoladigan narsalarga ahamiyat beraman: sayt tez ochilishi, har qanday telefonda ishlashi va mijozga haqiqiy murojaat keltirishi kerak.",
      "Backend'ni o'rganyapman va full stack tomon ketyapman, shuning uchun stekimda frontend vositalari yonida Node.js, Express, Prisma va PostgreSQL bor.",
      "Dasturlashdan tashqari mijozlarni o'zim topaman, ishimni sotaman va shaxsiy brendimni rivojlantiraman. Maqsadim: kuchli full stack dasturchi bo'lish, o'z IT kompaniyamni ochish va xalqaro mijozlar bilan ishlash.",
    ],
  },
  services: {
    eyebrow: 'xizmatlar',
    title: 'Nimalarni quraman',
    items: [
      {
        title: 'Landing va korporativ saytlar',
        description:
          "Restoran, qurilish va turizm kompaniyalari uchun bir sahifali landing hamda ko'p sahifali saytlar. Aniq tuzilma va real murojaat yo'llari.",
      },
      {
        title: "Onlayn do'konlar",
        description:
          "Katalog, savat, buyurtma va uni boshqaradigan admin panel. Statik maket emas, haqiqiy backend bilan bog'langan holda.",
      },
      {
        title: 'Moslashuvchan verstka va animatsiya',
        description:
          "320px'dan boshlab toza verstka. Animatsiya bezak uchun emas, e'tiborni yo'naltirish uchun ishlaydi.",
      },
      {
        title: 'Integratsiyalar',
        description:
          "Ariza formalari, Telegram va WhatsApp, xaritalar, to'lov va tashqi API'lar: saytga ulanadi va to'liq tekshiriladi.",
      },
      {
        title: 'Tezlik va SEO',
        description:
          "Core Web Vitals, semantik verstka, meta teglar va tuzilgan ma'lumotlar: sayt topiladi va kutdirmaydi.",
      },
      {
        title: 'Admin panellar',
        description: "Mijoz dasturchiga murojaat qilmasdan kontent, mahsulot va buyurtmalarni tahrirlaydigan joy.",
      },
    ],
  },
  skills: {
    eyebrow: 'asboblar',
    title: "Ko'nikmalar va stek",
    groupTitles: ['Frontend', "Backend va ma'lumotlar", 'Vositalar va bulut'],
  },
  projects: {
    eyebrow: 'tanlangan ishlar',
    title: 'Loyihalar',
    items: [
      {
        description:
          "O'zbekiston bozori uchun avtomobil to'lov va xizmat platformasi: mijoz oqimi, admin panel va PostgreSQL ustidagi tipli API.",
        meta: 'Tijorat · 2025',
      },
      {
        description:
          "Kalit so'zlar pozitsiyasini kuzatuvchi va quruq ma'lumotni tushunarli haftalik manzaraga aylantiruvchi dashboard.",
        meta: 'Mahsulot · 2025',
      },
      {
        description: "Katalog, filtrlar, savat va REST API'ga ulangan buyurtma oqimiga ega onlayn do'kon.",
        meta: 'E-commerce · 2025',
      },
      {
        description:
          "Toshkentdagi go'zallik studiyasi sayti: xizmatlar, narxlar va to'g'ridan-to'g'ri Telegram'ga tushadigan ariza.",
        meta: 'Tijorat · 2025',
      },
      {
        description:
          "Qidiruv, filtrlash va batafsil sahifalari bor kino va seriallar katalogi, ochiq REST API asosida.",
        meta: 'Mahsulot · 2024',
      },
      {
        description:
          "Noldan qayta yig'ilgan Spotify interfeysi: pleyer holati, pleylistlar va 320px'gacha moslashuv.",
        meta: 'Amaliyot · 2024',
      },
      {
        description: 'Shablonsiz, tipografiya va mahsulot suratlariga qurilgan parfyumeriya landingi.',
        meta: 'Landing · 2024',
      },
      {
        description: "Starbucks uslubidagi landing: to'liq moslashuvchan verstka va skroll animatsiyasi, qo'lda yozilgan.",
        meta: 'Landing · 2024',
      },
      {
        description: "Ochiq API'dagi ob-havo ilovasi: geolokatsiya, prognoz hamda aniq xato va yuklanish holatlari.",
        meta: 'Amaliyot · 2024',
      },
    ],
  },
  highlights: { eyebrow: 'lavhalar', title: 'Lavhalar' },
  contact: {
    eyebrow: 'salom ayting',
    title: 'Keling, birga ishlaymiz',
    blurb:
      "Nima kerakligini va taxminiy muddatni yozing. Eng tez Telegram'da javob beraman, odatda bir kun ichida. Frilans va to'liq stavka uchun ochiqman: masofadan yoki Toshkentda.",
    writeTelegram: "Telegram'da yozish",
    downloadCv: 'CV yuklab olish',
  },
  footer: { built: 'Next.js bilan qurilgan.', credit: 'dizayn va kod:' },
  install: {
    button: "O'rnatish",
    iosHint: "Safari'da: Ulashish → “Bosh ekranga qo'shish”.",
  },
};

const ru: Dict = {
  meta: {
    title: `Камрон Фазилов (${SITE.name}) — Frontend-разработчик в Ташкенте`,
    description:
      'Камрон Фазилов — frontend-разработчик из Ташкента. Лендинги, корпоративные сайты, интернет-магазины и админ-панели на React, Next.js и TypeScript.',
    ogLocale: 'ru_RU',
  },
  role: 'Frontend-разработчик',
  subRole: 'Перехожу в Full Stack',
  tagline: 'Делаю быстрые адаптивные сайты для бизнеса.',
  location: 'Ташкент, Узбекистан',
  skipToContent: 'К содержимому',
  nav: [
    { label: 'Обо мне', href: '#about' },
    { label: 'Услуги', href: '#services' },
    { label: 'Навыки', href: '#skills' },
    { label: 'Проекты', href: '#projects' },
    { label: 'Контакты', href: '#contact' },
  ],
  hero: {
    available: 'Открыт к фрилансу и удалённой работе',
    intro:
      'Проектирую и собираю адаптивные сайты на React, Next.js и TypeScript: от лендинга до магазина с админ-панелью.',
    getInTouch: 'Связаться',
    viewWork: 'Смотреть проекты',
    downloadCv: 'Скачать CV',
  },
  about: {
    eyebrow: 'обо мне',
    title: 'Кто я',
    paragraphs: [
      'Я Камрон Фазилов — frontend-разработчик из Ташкента. Делаю современные, быстрые и адаптивные сайты для бизнеса: лендинги, корпоративные сайты, интернет-магазины и админ-панели.',
      'Работаю с React, Next.js и TypeScript и слежу за тем, что обычно пропускают: сайт должен быстро грузиться, работать на любом телефоне и приносить клиенту реальные заявки.',
      'Изучаю бэкенд и двигаюсь в сторону full stack, поэтому рядом с фронтенд-инструментами в моём стеке Node.js, Express, Prisma и PostgreSQL.',
      'Помимо разработки сам ищу клиентов, продаю свою работу и развиваю личный бренд. Цель: стать сильным full stack разработчиком, открыть свою IT-компанию и работать с международными клиентами.',
    ],
  },
  services: {
    eyebrow: 'услуги',
    title: 'Что я делаю',
    items: [
      {
        title: 'Лендинги и корпоративные сайты',
        description:
          'Одностраничные лендинги и многостраничные сайты для ресторанов, строительных и туристических компаний. Понятная структура и реальные пути до заявки.',
      },
      {
        title: 'Интернет-магазины',
        description:
          'Каталог, корзина, оформление заказа и админ-панель для управления, подключённые к настоящему бэкенду, а не к статичному макету.',
      },
      {
        title: 'Адаптивная вёрстка и анимации',
        description: 'Честная вёрстка начиная с 320px. Анимация ведёт внимание, а не украшает страницу.',
      },
      {
        title: 'Интеграции',
        description:
          'Формы заявок, Telegram и WhatsApp, карты, оплата и сторонние API: подключаю к сайту и проверяю целиком.',
      },
      {
        title: 'Скорость и SEO',
        description:
          'Core Web Vitals, семантическая вёрстка, мета-теги и структурированные данные: сайт находят, и он не заставляет ждать.',
      },
      {
        title: 'Админ-панели',
        description: 'Место, где клиент сам меняет контент, товары и заказы, не вызывая разработчика.',
      },
    ],
  },
  skills: {
    eyebrow: 'инструменты',
    title: 'Навыки и стек',
    groupTitles: ['Frontend', 'Backend и данные', 'Инструменты и облако'],
  },
  projects: {
    eyebrow: 'избранные работы',
    title: 'Проекты',
    items: [
      {
        description:
          'Платформа автомобильных платежей и услуг для рынка Узбекистана: клиентский поток, админ-панель и типизированный API поверх PostgreSQL.',
        meta: 'Коммерция · 2025',
      },
      {
        description:
          'Дашборд, который отслеживает позиции по ключевым словам и превращает сырые данные в понятную недельную картину.',
        meta: 'Продукт · 2025',
      },
      {
        description: 'Интернет-магазин с каталогом, фильтрами, корзиной и оформлением заказа через REST API.',
        meta: 'E-commerce · 2025',
      },
      {
        description: 'Сайт бьюти-студии в Ташкенте: услуги, цены и заявка, которая падает сразу в Telegram.',
        meta: 'Коммерция · 2025',
      },
      {
        description: 'Каталог фильмов и сериалов с поиском, фильтрацией и страницами деталей на публичном REST API.',
        meta: 'Продукт · 2024',
      },
      {
        description: 'Интерфейс Spotify, пересобранный с нуля: состояние плеера, плейлисты и адаптив вплоть до 320px.',
        meta: 'Практика · 2024',
      },
      {
        description: 'Лендинг парфюмерии на типографике и предметной съёмке, без шаблона под капотом.',
        meta: 'Лендинг · 2024',
      },
      {
        description: 'Лендинг в стиле Starbucks: полная адаптивная вёрстка и скролл-анимации, написанные руками.',
        meta: 'Лендинг · 2024',
      },
      {
        description: 'Погодное приложение на публичном API: геолокация, прогноз и внятные состояния ошибки и загрузки.',
        meta: 'Практика · 2024',
      },
    ],
  },
  highlights: { eyebrow: 'моменты', title: 'Хайлайты' },
  contact: {
    eyebrow: 'на связи',
    title: 'Давайте поработаем',
    blurb:
      'Опишите задачу и примерные сроки. Быстрее всего отвечаю в Telegram, обычно в течение дня. Открыт к фрилансу и работе в штате: удалённо или в Ташкенте.',
    writeTelegram: 'Написать в Telegram',
    downloadCv: 'Скачать CV',
  },
  footer: { built: 'Сделано на Next.js.', credit: 'дизайн и код:' },
  install: {
    button: 'Установить',
    iosHint: 'В Safari: «Поделиться» → «На экран „Домой“».',
  },
};

const DICTS: Record<Locale, Dict> = { en, uz, ru };

export const getDict = (locale: Locale): Dict => DICTS[locale];
