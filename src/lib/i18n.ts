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

// ── Квиз-консультация ────────────────────────────────────────────────────────

/** Формы множественного числа. `{n}` подставляется числом. */
export type PluralForms = { one: string; few: string; many: string };

export type QuizQuestion = { title: string; hint: string; options: string[] };

export type QuizText = {
  eyebrow: string;
  title: string;
  /** Бейдж над сообщениями ассистента. */
  badge: string;
  intro: string;
  quickLabel: string;
  placeholder: string;
  send: string;
  /** «Осталось N вопросов» в шапке карточки. */
  remaining: PluralForms;
  questions: QuizQuestion[];
  done: { badge: string; title: string; text: string; recapLabel: string; cta: string; restart: string };
  /** Состояния запроса консультации у модели. */
  result: { loading: string; title: string; error: string; retry: string };
};

/**
 * Выбирает форму множественного числа и подставляет число.
 *
 * Русский требует три формы (1 вопрос / 2 вопроса / 5 вопросов), английский —
 * две, узбекский — одну: после числительного существительное там не
 * согласуется, поэтому берётся `many` при любом N.
 */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  let form: string;

  if (locale === 'ru') {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) form = forms.one;
    else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) form = forms.few;
    else form = forms.many;
  } else if (locale === 'en') {
    form = n === 1 ? forms.one : forms.many;
  } else {
    form = forms.many;
  }

  return form.replace('{n}', String(n));
}

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
  quiz: QuizText;
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
  quiz: {
    eyebrow: 'consultation',
    title: 'Answer a few questions and the agent will map out your funnel and the cost of the build',
    badge: 'AI agent',
    intro:
      "I'll draft the site strategy, estimate the cost and suggest which package gives the best result. Answer freely or pick a quick option.",
    quickLabel: 'Quick options',
    placeholder: 'Type your niche or pick a quick option…',
    send: 'Send',
    remaining: { one: '{n} question left', few: '{n} questions left', many: '{n} questions left' },
    questions: [
      {
        title: 'What niche is the business in?',
        hint: 'Start with the market. The niche drives the offer, the visual level, trust and the enquiry flow.',
        options: [
          'Services',
          'Expert / personal brand',
          'E-commerce',
          'Restaurant / delivery',
          'Real estate',
          'Medical / dental',
          'Education',
          'Fitness / beauty',
          'B2B / manufacturing',
        ],
      },
      {
        title: 'What should the site bring in?',
        hint: 'The goal shapes the structure: a site built for enquiries, for sales or for trust is a different site.',
        options: [
          'Enquiries and calls',
          'Online sales',
          'Bookings',
          'Catalogue and presentation',
          'Portfolio / CV',
          'Leads from ads',
        ],
      },
      {
        title: 'Do you already have a site?',
        hint: 'This decides whether we build from scratch or keep and rework what already performs.',
        options: ['No, from scratch', 'Yes, needs a redesign', 'Yes, needs fixes', 'Only social media'],
      },
      {
        title: 'How many pages do you need?',
        hint: 'A rough size is enough to estimate the timeline and the cost.',
        options: ['One-page landing', '2–5 pages', '6–15 pages', 'Catalogue, 15+ pages', 'Not sure yet'],
      },
      {
        title: 'Which integrations do you need?',
        hint: 'Forms, payments and CRM affect the backend far more than the layout does.',
        options: [
          'Enquiry form',
          'Telegram / WhatsApp',
          'Online payments',
          'CRM',
          'Map and locations',
          'User accounts',
          'None for now',
        ],
      },
      {
        title: 'Who prepares the content?',
        hint: 'Copy and photos are the most common reason a launch slips.',
        options: ['Everything is ready', 'Partly ready', 'Need copywriting', 'Need photos', 'Need all of it'],
      },
      {
        title: 'Which languages should the site speak?',
        hint: 'Multilingual support is designed into the structure up front — retrofitting it costs more.',
        options: ['English', 'Russian', 'Uzbek', 'RU + UZ', 'RU + UZ + EN'],
      },
      {
        title: 'When do you need to launch?',
        hint: 'The deadline decides the scope: what ships first and what lands in the second iteration.',
        options: ['Yesterday', 'Within 2 weeks', 'About a month', '2–3 months', 'Flexible'],
      },
      {
        title: 'What budget are you working with?',
        hint: 'A range lets me propose an honest package instead of selling you extras.',
        options: ['Under $300', '$300–700', '$700–1500', '$1500+', 'Need advice on this'],
      },
    ],
    done: {
      badge: 'Done',
      title: 'That’s all the questions',
      text: 'Thanks — the picture is clear. Message me on Telegram and I’ll come back with the funnel, the scope of work and a price range for your case.',
      recapLabel: 'Your answers',
      cta: 'Discuss the project',
      restart: 'Start over',
    },
    result: {
      loading: 'Reading your answers…',
      title: 'Here is what I would do',
      error: 'Could not reach the agent. Your answers are saved — try again, or just message me on Telegram.',
      retry: 'Try again',
    },
  },
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
  quiz: {
    eyebrow: 'konsultatsiya',
    title: "Savollarga javob bering — agent voronka va ishlab chiqish narxini baholab beradi",
    badge: 'AI agent',
    intro:
      "Sayt strategiyasini tuzaman, narxini chamalayman va qaysi paket eng yaxshi natija berishini aytaman. Erkin javob bering yoki tayyor variantni tanlang.",
    quickLabel: 'Tezkor variantlar',
    placeholder: "Nishani yozing yoki tayyor variantni tanlang…",
    send: 'Yuborish',
    remaining: { one: 'Yana {n} ta savol', few: 'Yana {n} ta savol', many: 'Yana {n} ta savol' },
    questions: [
      {
        title: 'Biznes qaysi sohada ishlaydi?',
        hint: "Bozordan boshlaymiz. Soha oferta, vizual daraja, ishonch va ariza stsenariysini belgilaydi.",
        options: [
          'Xizmatlar',
          'Ekspert / shaxsiy brend',
          'E-commerce',
          'Restoran / yetkazib berish',
          "Ko'chmas mulk",
          'Tibbiyot / stomatologiya',
          "Ta'lim",
          'Fitnes / go‘zallik',
          'B2B / ishlab chiqarish',
        ],
      },
      {
        title: 'Sayt nima olib kelishi kerak?',
        hint: "Maqsad tuzilmani belgilaydi: ariza uchun, sotuv uchun va ishonch uchun butunlay boshqa sayt yig'iladi.",
        options: [
          'Arizalar va qo‘ng‘iroqlar',
          'Onlayn sotuv',
          'Xizmatga yozilish',
          'Katalog va taqdimot',
          'Portfolio / rezyume',
          'Reklamadan arizalar',
        ],
      },
      {
        title: 'Saytingiz bormi?',
        hint: "Shunga qarab noldan quramiz yoki ishlayotgan qismini saqlab qayta ishlaymiz.",
        options: ["Yo'q, noldan", 'Bor, redizayn kerak', 'Bor, tuzatish kerak', 'Faqat ijtimoiy tarmoqlar'],
      },
      {
        title: 'Nechta sahifa kerak?',
        hint: "Taxminiy hajm yetarli — muddat va narxni chamalash uchun shuning o'zi kifoya.",
        options: ['Bir sahifali landing', '2–5 sahifa', '6–15 sahifa', 'Katalog, 15+ sahifa', 'Hali bilmayman'],
      },
      {
        title: 'Qanday integratsiyalar kerak?',
        hint: "Formalar, to'lov va CRM backend qismiga verstkadan ko'ra kuchliroq ta'sir qiladi.",
        options: [
          'Ariza formasi',
          'Telegram / WhatsApp',
          "Onlayn to'lov",
          'CRM',
          'Xarita va manzillar',
          'Shaxsiy kabinet',
          'Hozircha kerak emas',
        ],
      },
      {
        title: 'Kontentni kim tayyorlaydi?',
        hint: "Matn va suratlar — ishga tushirish kechikishining eng keng tarqalgan sababi.",
        options: ['Hammasi tayyor', 'Qisman tayyor', 'Matn kerak', 'Surat kerak', "Hammasi kerak"],
      },
      {
        title: 'Sayt qaysi tillarda bo‘lsin?',
        hint: "Ko'p tillilik tuzilmaga darhol qo'yiladi — keyin qo'shish qimmatroq tushadi.",
        options: ["O'zbekcha", 'Ruscha', 'Inglizcha', 'RU + UZ', 'RU + UZ + EN'],
      },
      {
        title: 'Qachon ishga tushirish kerak?',
        hint: "Muddat ish hajmini belgilaydi: nimani darhol, nimani ikkinchi bosqichda qilamiz.",
        options: ['Kecha', '2 hafta ichida', 'Bir oy', '2–3 oy', 'Muddat erkin'],
      },
      {
        title: 'Qanday byudjetga mo‘ljallayapsiz?',
        hint: "Oralig'i kerak — ortiqchasini sotmasdan, halol paket taklif qilish uchun.",
        options: ['$300 gacha', '$300–700', '$700–1500', '$1500 dan', 'Maslahat kerak'],
      },
    ],
    done: {
      badge: 'Tayyor',
      title: 'Savollar tugadi',
      text: "Rahmat — manzara aniq. Telegramda yozing, men voronka, ish tarkibi va sizning holatingiz uchun narx oralig'i bilan qaytaman.",
      recapLabel: 'Sizning javoblaringiz',
      cta: 'Loyihani muhokama qilish',
      restart: 'Qaytadan boshlash',
    },
    result: {
      loading: 'Javoblaringizni o‘qiyapman…',
      title: 'Men shunday qilgan bo‘lardim',
      error:
        "Agentga ulanib bo'lmadi. Javoblaringiz saqlandi — qayta urinib ko'ring yoki Telegramda yozing.",
      retry: 'Qayta urinish',
    },
  },
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
  quiz: {
    eyebrow: 'консультация',
    title: 'Ответьте на вопросы и агент проконсультирует по воронке и стоимости разработки',
    badge: 'AI агент',
    intro:
      'Построю стратегию сайта, прикину стоимость и подскажу, какой пакет даст лучший результат. Отвечайте свободно или выбирайте быстрые варианты.',
    quickLabel: 'Быстрые варианты',
    placeholder: 'Напишите нишу или выберите быстрый вариант…',
    send: 'Отправить',
    remaining: { one: 'Остался {n} вопрос', few: 'Осталось {n} вопроса', many: 'Осталось {n} вопросов' },
    questions: [
      {
        title: 'В какой нише работает бизнес?',
        hint: 'Начнём с рынка. От ниши зависит оффер, визуальный уровень, доверие и сценарий заявки.',
        options: [
          'Услуги',
          'Эксперт / личный бренд',
          'E-commerce',
          'Ресторан / доставка',
          'Недвижимость',
          'Медицина / стоматология',
          'Образование',
          'Фитнес / бьюти',
          'B2B / производство',
        ],
      },
      {
        title: 'Что сайт должен приносить?',
        hint: 'Цель определяет структуру: под заявку, под продажу и под доверие собираются разные сайты.',
        options: [
          'Заявки и звонки',
          'Продажи онлайн',
          'Запись на услугу',
          'Каталог и презентация',
          'Портфолио / резюме',
          'Заявки из рекламы',
        ],
      },
      {
        title: 'Сайт уже есть?',
        hint: 'От этого зависит, делаем с нуля или сохраняем и переделываем то, что уже работает.',
        options: ['Нет, с нуля', 'Есть, нужен редизайн', 'Есть, нужны доработки', 'Только соцсети'],
      },
      {
        title: 'Какой объём страниц нужен?',
        hint: 'Грубой оценки объёма достаточно, чтобы прикинуть срок и стоимость.',
        options: ['Одностраничный лендинг', '2–5 страниц', '6–15 страниц', 'Каталог от 15 страниц', 'Пока не знаю'],
      },
      {
        title: 'Какие интеграции нужны?',
        hint: 'Формы, оплата и CRM влияют на бэкенд сильнее, чем сама вёрстка.',
        options: [
          'Форма заявки',
          'Telegram / WhatsApp',
          'Онлайн-оплата',
          'CRM',
          'Карта и адреса',
          'Личный кабинет',
          'Пока ничего',
        ],
      },
      {
        title: 'Кто готовит контент?',
        hint: 'Тексты и фото — самая частая причина, по которой запуск сдвигается.',
        options: ['Всё готово', 'Готово частично', 'Нужны тексты', 'Нужны фото', 'Нужно всё'],
      },
      {
        title: 'На каких языках сайт?',
        hint: 'Мультиязычность закладывается в структуру сразу — добавлять её потом дороже.',
        options: ['Русский', 'Узбекский', 'Английский', 'RU + UZ', 'RU + UZ + EN'],
      },
      {
        title: 'Когда нужен запуск?',
        hint: 'Срок определяет состав работ: что делаем сразу, а что во второй итерации.',
        options: ['Вчера', 'До 2 недель', 'Около месяца', '2–3 месяца', 'Сроки гибкие'],
      },
      {
        title: 'На какой бюджет ориентируетесь?',
        hint: 'Вилка нужна, чтобы предложить честный пакет, а не продать лишнее.',
        options: ['До $300', '$300–700', '$700–1500', 'От $1500', 'Нужна консультация'],
      },
    ],
    done: {
      badge: 'Готово',
      title: 'Вопросы закончились',
      text: 'Спасибо — картина ясна. Напишите мне в Telegram, и я вернусь с воронкой, составом работ и вилкой стоимости под ваш случай.',
      recapLabel: 'Ваши ответы',
      cta: 'Обсудить проект',
      restart: 'Пройти заново',
    },
    result: {
      loading: 'Читаю ваши ответы…',
      title: 'Вот что я бы сделал',
      error:
        'Не получилось связаться с агентом. Ответы сохранены — попробуйте ещё раз или просто напишите мне в Telegram.',
      retry: 'Попробовать снова',
    },
  },
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
