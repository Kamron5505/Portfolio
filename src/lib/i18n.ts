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
    headline: string;
    auditCta: string;
    intro: string;
    getInTouch: string;
    viewWork: string;
    downloadCv: string;
  };
  about: { eyebrow: string; title: string; paragraphs: string[]; principles: [string, string][] };
  quizCards: [string, string][];
  services: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string }[];
    funnel: { title: string; note: string; stages: string[] };
  };
  carousel: { prev: string; next: string };
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
    description: `${SITE.name} — AI agent developer in ${SITE.location}. AI agents, Telegram bots and websites for business, built with Claude, GPT and open-source LLMs.`,
    ogLocale: 'en_US',
  },
  role: 'AI agents for business',
  subRole: 'AI agent developer · Telegram bots · websites',
  tagline: 'I build AI agents, Telegram bots and websites that take routine work off a business.',
  location: SITE.location,
  skipToContent: 'Skip to content',
  nav: NAV,
  hero: {
    available: 'Available for freelance & remote work',
    headline: 'AI agents that answer clients, catch leads and run routine work — while you run the business.',
    auditCta: 'Start an AI audit',
    intro: 'Claude, GPT and open-source LLMs wired into Telegram bots and websites.',
    getInTouch: 'Get in touch',
    viewWork: 'View projects',
    downloadCv: 'Download CV',
  },
  about: { eyebrow: 'about', title: 'Who I am', paragraphs: ABOUT, principles: [
      ['Business first', 'I map how clients arrive and where requests get lost before writing a line of code.'],
      ['The right model', 'Claude, GPT, Gemini or an open-source LLM — picked for the task and the budget.'],
      ['Agents that ship', 'The agent lives in your Telegram bot or site and works every day, not just in a demo.'],
    ] },
  services: {
    eyebrow: 'services',
    title: 'What I build',
    items: [
      {
        title: 'Websites',
        description:
          'Landing pages, corporate sites and online stores that load fast, work on every phone and turn visitors into requests.',
      },
      {
        title: 'Telegram bots',
        description:
          'Bots for orders, bookings, payments and support — with an admin panel, a database and a clean flow for the user.',
      },
      {
        title: 'AI agent in your Telegram bot',
        description:
          'An AI agent talks to clients like a manager and fills in the request form with them — the moment a request is submitted, you get a Telegram notification with all the details.',
      },
    ],
    funnel: {
      title: 'How the AI agent turns a chat into a request',
      note: 'Illustrative example: out of 1,000 visitors',
      stages: ['Visitors', 'Talked to the agent', 'Filled the form', 'You got it in Telegram'],
    },
  },
  carousel: { prev: 'Previous', next: 'Next' },
  skills: {
    eyebrow: 'models & stack',
    title: 'AI toolkit',
    groupTitles: ['AI & LLM', 'Bots & Backend', 'Web'],
  },
  quizCards: [
    ['Your business', 'Niche, clients and how requests come in today'],
    ['Where AI fits', 'Which routine tasks an agent can take over'],
    ['Plan & cost', 'Bot, site or agent — and a rough budget'],
  ],
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
    title: `${SITE.name} — Toshkentda biznes uchun AI agentlar`,
    description: `${SITE.name} — Toshkentdagi AI agent dasturchi. Biznes uchun AI agentlar, Telegram botlar va saytlar.`,
    ogLocale: 'uz_UZ',
  },
  role: 'Biznes uchun AI agentlar',
  subRole: 'AI agent dasturchi · Telegram botlar · saytlar',
  tagline: 'Biznesdan kundalik ishni oladigan AI agentlar, Telegram botlar va saytlar yarataman.',
  location: "Toshkent, O'zbekiston",
  skipToContent: "Kontentga o'tish",
  nav: [
    { label: 'Men haqimda', href: '#about' },
    { label: 'Xizmatlar', href: '#services' },
    { label: "Ko'nikmalar", href: '#skills' },
    { label: 'Loyihalar', href: '#projects' },
    { label: 'Kviz', href: '#quiz' },
    { label: 'Aloqa', href: '#contact' },
  ],
  hero: {
    available: 'Frilans va masofaviy ishlar uchun ochiqman',
    headline: 'Mijozlarga javob beradigan, arizalarni ushlaydigan va kundalik ishni bajaradigan AI agentlar — siz esa biznes bilan shug\'ullanasiz.',
    auditCta: 'AI tahlilni boshlash',
    intro: 'Claude, GPT va open-source LLM\'lar Telegram botlar va saytlarga ulanadi.',
    getInTouch: "Bog'lanish",
    viewWork: "Loyihalarni ko'rish",
    downloadCv: 'CV yuklab olish',
  },
  about: {
    eyebrow: 'men haqimda',
    title: 'Men kimman',
    paragraphs: [
      'Men Kamron Fazilov, Toshkentdanman. Biznes uchun AI agentlar yarataman: mijozlarga javob beradigan, arizalarni saralaydigan va Telegram hamda saytlarda kundalik ishni bajaradigan yordamchilar.',
      'Koddan emas, biznesdan boshlayman: mijozlar qanday keladi, arizalar qayerda yo\'qoladi va jamoaning vaqtini qaysi vazifalar oladi. Keyin haqiqatan mos model va vositani tanlayman — Claude, GPT, Gemini yoki open-source LLM.',
      'Har kuni Claude Code va Codex bilan ishlayman, Node.js, Python, Next.js va Telegram Bot API\'da ishga tushiraman — agent demoda qolmay, haqiqiy mahsulotga aylanadi.',
      'Maqsadim — O\'zbekiston va xorijdagi bizneslarga AI\'dan maksimal foyda olishga yordam berish va o\'z AI studiyamni qurish.',
    ],
    principles: [
      ['Avval biznes', 'Kod yozishdan oldin mijozlar qanday kelishi va arizalar qayerda yo\'qolishini aniqlayman.'],
      ['To\'g\'ri model', 'Claude, GPT, Gemini yoki open-source LLM — vazifa va byudjetga qarab tanlanadi.'],
      ['Ishlaydigan agentlar', 'Agent Telegram botingiz yoki saytingizda har kuni ishlaydi, faqat demoda emas.'],
    ],
  },
  services: {
    eyebrow: 'xizmatlar',
    title: 'Nimalarni quraman',
    items: [
      {
        title: 'Saytlar',
        description:
          'Tez ochiladigan, har qanday telefonda ishlaydigan va tashrifchini arizaga aylantiradigan landing, korporativ saytlar va onlayn do\'konlar.',
      },
      {
        title: 'Telegram botlar',
        description:
          'Buyurtma, bron, to\'lov va qo\'llab-quvvatlash uchun botlar — admin panel, ma\'lumotlar bazasi va foydalanuvchi uchun qulay jarayon bilan.',
      },
      {
        title: 'Telegram botga AI agent',
        description:
          'AI agent mijoz bilan menejer kabi gaplashadi va u bilan birga ariza formasini to\'ldiradi — ariza yuborilishi bilan sizga Telegram\'da barcha ma\'lumotlar bilan xabar keladi.',
      },
    ],
    funnel: {
      title: 'AI agent suhbatni qanday arizaga aylantiradi',
      note: 'Taxminiy misol: 1 000 tashrifchidan',
      stages: ['Tashrifchilar', 'Agent bilan gaplashdi', 'Formani to\'ldirdi', 'Sizga Telegram\'da keldi'],
    },
  },
  carousel: { prev: 'Oldingi', next: 'Keyingi' },
  skills: {
    eyebrow: 'modellar va stek',
    title: 'AI asboblari',
    groupTitles: ['AI va LLM', 'Botlar va backend', 'Web'],
  },
  quizCards: [
    ['Biznesingiz', 'Soha, mijozlar va arizalar hozir qanday kelishi'],
    ['AI qayerda kerak', 'Qaysi kundalik ishlarni agent o\'z zimmasiga oladi'],
    ['Reja va narx', 'Bot, sayt yoki agent — va taxminiy byudjet'],
  ],
  projects: {
    eyebrow: 'tanlangan ishlar',
    title: 'Loyihalar',
    items: [
      {
        description:
          "O'zbek tilida dasturlash va IT kurslari onlayn maktabi: kurslar katalogi, dars oqimi va o'quvchi progressi.",
        meta: 'Tijorat · 2026',
      },
      {
        description:
          "Coca-Cola mahsulotlari eksporti kompaniyasi sayti: mahsulot qatori, eksport geografiyasi va ulgurji xaridorlar uchun ariza formasi.",
        meta: 'Tijorat · 2026',
      },
      {
        description:
          "Stars va Premium sotib olish uchun Telegram mini ilovasi: balans, buyurtma oqimi, sovg'alar va bot ichidagi reyting.",
        meta: 'Tijorat · 2025',
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
          "Marketplace front-end'i: kategoriyalar katalogi, promo bloklar, qidiruv va yetkazib berish hamda narxi ko'rsatilgan mahsulot kartasi.",
        meta: 'E-commerce · 2025',
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
        description:
          "Ro'yxatlar, muddatlar va progressi bor vazifalar menejeri: hamma narsa telefonda qoladi, offlayn ham ishlaydi.",
        meta: 'Mahsulot · 2026',
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
    title: `Камрон Фазилов (${SITE.name}) — ИИ-агенты для бизнеса в Ташкенте`,
    description:
      'Камрон Фазилов — разработчик ИИ-агентов в Ташкенте. ИИ-агенты, Telegram-боты и сайты для бизнеса на Claude, GPT и open-source LLM.',
    ogLocale: 'ru_RU',
  },
  role: 'ИИ-агенты для бизнеса',
  subRole: 'Разработчик ИИ-агентов · Telegram-боты · сайты',
  tagline: 'Создаю ИИ-агентов, Telegram-ботов и сайты, которые снимают с бизнеса рутину.',
  location: 'Ташкент, Узбекистан',
  skipToContent: 'К содержимому',
  nav: [
    { label: 'Обо мне', href: '#about' },
    { label: 'Услуги', href: '#services' },
    { label: 'Навыки', href: '#skills' },
    { label: 'Проекты', href: '#projects' },
    { label: 'Квиз', href: '#quiz' },
    { label: 'Контакты', href: '#contact' },
  ],
  hero: {
    available: 'Открыт к фрилансу и удалённой работе',
    headline: 'ИИ-агенты, которые отвечают клиентам, ловят заявки и делают рутину — пока вы занимаетесь бизнесом.',
    auditCta: 'Начать ИИ-аудит',
    intro: 'Claude, GPT и open-source LLM, встроенные в Telegram-ботов и сайты.',
    getInTouch: 'Связаться',
    viewWork: 'Смотреть проекты',
    downloadCv: 'Скачать CV',
  },
  about: {
    eyebrow: 'обо мне',
    title: 'Кто я',
    paragraphs: [
      'Я Камрон Фазилов из Ташкента. Создаю ИИ-агентов для бизнеса: ассистентов, которые отвечают клиентам, квалифицируют заявки и берут на себя рутину в Telegram и на сайтах.',
      'Начинаю с бизнеса, а не с кода: как приходят клиенты, где теряются заявки и какие задачи съедают время команды. Затем подбираю модель и инструмент, которые реально подходят, — Claude, GPT, Gemini или open-source LLM.',
      'Каждый день работаю с Claude Code и Codex, а в прод выкатываю на Node.js, Python, Next.js и Telegram Bot API — агент попадает в реальный продукт, а не остаётся демкой.',
      'Моя цель — помочь бизнесу в Узбекистане и за его пределами взять от ИИ максимум и вырасти в собственную ИИ-студию.',
    ],
    principles: [
      ['Сначала бизнес', 'До первой строки кода разбираюсь, откуда приходят клиенты и где теряются заявки.'],
      ['Правильная модель', 'Claude, GPT, Gemini или open-source LLM — под задачу и бюджет.'],
      ['Агенты в работе', 'Агент живёт в вашем Telegram-боте или на сайте и работает каждый день, а не только в демо.'],
    ],
  },
  services: {
    eyebrow: 'услуги',
    title: 'Что я делаю',
    items: [
      {
        title: 'Сайты',
        description:
          'Лендинги, корпоративные сайты и интернет-магазины, которые быстро грузятся, работают на любом телефоне и превращают посетителей в заявки.',
      },
      {
        title: 'Telegram-боты',
        description:
          'Боты для заказов, записи, оплаты и поддержки — с админ-панелью, базой данных и понятным сценарием для пользователя.',
      },
      {
        title: 'ИИ-агент в Telegram-боте',
        description:
          'ИИ-агент общается с клиентом как менеджер и вместе с ним заполняет форму заявки — как только заявка отправлена, вам в Telegram приходит уведомление со всеми данными.',
      },
    ],
    funnel: {
      title: 'Как ИИ-агент превращает переписку в заявку',
      note: 'Условный пример: из 1 000 посетителей',
      stages: ['Посетители', 'Пообщались с агентом', 'Заполнили форму', 'Пришло вам в Telegram'],
    },
  },
  carousel: { prev: 'Назад', next: 'Вперёд' },
  skills: {
    eyebrow: 'модели и стек',
    title: 'ИИ-инструменты',
    groupTitles: ['ИИ и LLM', 'Боты и бэкенд', 'Веб'],
  },
  quizCards: [
    ['Ваш бизнес', 'Ниша, клиенты и как сейчас приходят заявки'],
    ['Где поможет ИИ', 'Какую рутину агент может забрать на себя'],
    ['План и цена', 'Бот, сайт или агент — и примерный бюджет'],
  ],
  projects: {
    eyebrow: 'избранные работы',
    title: 'Проекты',
    items: [
      {
        description:
          'Онлайн-школа программирования и IT-курсов на узбекском языке: каталог курсов, поток уроков и прогресс ученика.',
        meta: 'Коммерция · 2026',
      },
      {
        description:
          'Сайт компании-экспортёра продукции Coca-Cola: продуктовая линейка, география экспорта и форма заявки для оптовых покупателей.',
        meta: 'Коммерция · 2026',
      },
      {
        description:
          'Telegram mini app для покупки Stars и Premium: баланс, оформление заказа, подарки и рейтинг пользователей внутри бота.',
        meta: 'Коммерция · 2025',
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
        description:
          'Фронтенд маркетплейса: каталог категорий, промо-блоки, поиск и карточка товара с доставкой и ценой.',
        meta: 'E-commerce · 2025',
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
        description:
          'Менеджер задач со списками, дедлайнами и прогрессом: всё хранится на телефоне, работает и офлайн.',
        meta: 'Продукт · 2026',
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
