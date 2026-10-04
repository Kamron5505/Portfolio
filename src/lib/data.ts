// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the whole site. Edit values here — every section,
// the metadata and the JSON-LD schema read from this file.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Канонический домен сайта. Всё SEO (canonical, hreflang, og:url, sitemap,
// robots, JSON-LD) строится ровно от этого значения — второго места, где
// хранится адрес, быть не должно.
//
// Переопределяется переменной окружения NEXT_PUBLIC_SITE_URL (например, для
// staging-домена). Значение проходит через normalizeSiteUrl: мусор и адреса
// preview-деплоев отбрасываются, чтобы канонические ссылки никогда не уехали
// на технический домен хостинга.
// ─────────────────────────────────────────────────────────────────────────────
export const CANONICAL_SITE_URL = 'https://kamronfazilov.uz';

// Домены хостингов: сюда деплоятся preview-сборки, но канонический адрес сайта
// это никогда не они — иначе Google проиндексирует технический URL как основной.
const PREVIEW_HOSTS = /\.(vercel\.app|netlify\.app|pages\.dev|onrender\.com|railway\.app)$/i;

/**
 * Приводит адрес сайта к каноническому виду: https, без слэша в конце.
 * Возвращает null для пустых, некорректных и preview-адресов — вызывающий код
 * в этом случае берёт CANONICAL_SITE_URL.
 */
export function normalizeSiteUrl(value: string | undefined | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  if (PREVIEW_HOSTS.test(parsed.hostname)) return null;

  // localhost оставляем как есть (http, порт), остальное принудительно на https.
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  const origin = isLocal ? parsed.origin : `https://${parsed.host}`;
  return origin.replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? CANONICAL_SITE_URL;

export const SITE = {
  url: SITE_URL,
  name: 'Kamron Fazilov',
  firstName: 'Kamron',
  lastName: 'Fazilov',
  initials: 'KF',
  role: 'AI Agents for Business',
  subRole: 'AI agent developer · Telegram bots · websites',
  tagline: 'I build AI agents, Telegram bots and websites that take routine work off a business.',
  location: 'Tashkent, Uzbekistan',
  email: 'kama58077@gmail.com',
  // Фото по умолчанию — лежит в public/ и коммитится в репозиторий, поэтому
  // доступно на любом деплое. Если админка задала своё, оно перекроет это
  // значение; если файла нет вовсе, Avatar покажет инициалы «KF».
  avatar: '/fazilov-kamron.png',
  // Резюме: положите PDF в public/Kamron_Fazilov_CV.pdf.
  // Пока файла физически нет, content.ts обнуляет это поле: кнопки «Скачать CV»
  // не рендерятся, ссылка не попадает в sitemap и JSON-LD. Как только PDF
  // окажется в public/, всё включится само — менять код не нужно.
  cv: '/Kamron_Fazilov_CV.pdf',
  createdAt: '2026-07-14',
  updatedAt: '2026-07-14',
} as const;

export const SOCIALS = [
  { label: 'Telegram', handle: '@stonks_11', url: 'https://t.me/stonks_11', icon: 'telegram' },
  { label: 'GitHub', handle: 'Kamron5505', url: 'https://github.com/Kamron5505', icon: 'github' },
  {
    label: 'LinkedIn',
    handle: 'kamron-fazilov',
    url: 'https://www.linkedin.com/in/kamron-fazilov-5494a1419',
    icon: 'linkedin',
  },
  { label: 'Instagram', handle: '@kamron.devv', url: 'https://www.instagram.com/kamron.devv', icon: 'instagram' },
] as const;

// Все «это я» ссылки для sameAs.
export const SAME_AS = SOCIALS.map((s) => s.url);

export const ABOUT = [
  "I'm Kamron Fazilov from Tashkent. I build AI agents for business: assistants that answer clients, qualify leads and handle routine work inside Telegram and on websites.",
  "I start with the business, not the code: how clients arrive, where requests get lost and which tasks eat the team's time. Then I pick the model and the tool that actually fit — Claude, GPT, Gemini or an open-source LLM.",
  'I work with Claude Code and Codex every day, and ship with Node.js, Python, Next.js and the Telegram Bot API, so the agent ends up in a real product, not in a demo.',
  'My goal: help businesses in Uzbekistan and abroad get the most out of AI, and grow this into my own AI studio.',
];

export type SkillGroup = { title: string; items: string[] };

export const SKILLS: SkillGroup[] = [
  {
    title: 'AI & LLM',
    items: ['Claude', 'Claude Code', 'OpenAI Codex', 'GPT', 'Gemini', 'DeepSeek', 'Ollama', 'Prompt engineering', 'Hermes Agent', 'Tool use & agents'],
  },
  { title: 'Bots & Backend', items: ['Telegram Bot API', 'Node.js', 'Python', 'PostgreSQL', 'REST API', 'Webhooks'] },
  { title: 'Web', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'] },
];

// Услуги: тексты переводятся в i18n.ts по индексу.
export const SERVICES_COUNT = 3;

export type Project = {
  name: string;
  description: string;
  tags: string[];
  href: string;
  featured?: boolean;
  meta?: string;
  // Обложка карточки — файл в public/, 16:9. Есть не у каждого проекта:
  // без неё карточка рендерится без картинки, только текстом.
  cover?: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'Aidevix',
    description:
      'Online school for programming and IT courses in Uzbek: course catalogue, lesson flow and student progress.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    href: 'https://aidevix.uz',
    featured: true,
    meta: 'Commercial · 2026',
    cover: '/projects/aidevix.webp',
  },
  {
    name: 'ExpoBrokGroup',
    description:
      'Site for a Coca-Cola export company: product range, export geography and an enquiry form for wholesale buyers.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    href: 'https://expobrokgroup.uz',
    featured: true,
    meta: 'Commercial · 2026',
    cover: '/projects/expobrokgroup.webp',
  },
  {
    name: 'StarPayUz Bot',
    description:
      'Telegram mini app for buying Stars and Premium: balance, order flow, gifts and a user rating inside the bot.',
    tags: ['Telegram Mini App', 'React', 'TypeScript', 'Node.js'],
    href: 'https://t.me/starpayuzauto_bot',
    meta: 'Commercial · 2025',
    cover: '/projects/starpayuz-bot.webp',
  },
  {
    name: 'UMAL Store',
    description: 'Online store with a catalogue, filters, cart and an order flow wired into a REST API.',
    tags: ['Next.js', 'Tailwind CSS', 'REST API'],
    href: 'https://umal-store.vercel.app',
    meta: 'E-commerce · 2025',
    cover: '/projects/umal-store.webp',
  },
  {
    name: 'Belora Tashkent',
    description:
      'Site for a Tashkent beauty studio: services, pricing and a booking request that lands straight in Telegram.',
    tags: ['Next.js', 'Tailwind CSS'],
    href: 'https://belora-tashkent.vercel.app',
    meta: 'Commercial · 2025',
    cover: '/projects/belora.webp',
  },
  {
    name: 'Olcha',
    description:
      'Marketplace front-end: category catalogue, promo blocks, search and a product card with delivery and pricing.',
    tags: ['React', 'Vite', 'REST API'],
    href: 'https://olcha-omega.vercel.app',
    meta: 'E-commerce · 2025',
    cover: '/projects/olcha.webp',
  },
  {
    name: 'Spotify Clone',
    description: 'Spotify interface rebuilt from scratch: player state, playlists and responsive layout down to 320px.',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    href: 'https://spotify-clone-one-kohl.vercel.app',
    meta: 'Practice · 2024',
    cover: '/projects/spotify-clone.webp',
  },
  {
    name: 'Perfume Landing',
    description: 'Perfume landing page built on typography and product photography, with no template underneath.',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    href: 'https://perfumewebsite-tau.vercel.app',
    meta: 'Landing · 2024',
    cover: '/projects/perfume-landing.webp',
  },
  {
    name: 'Starbucks Landing',
    description: 'Starbucks-style landing page: full responsive markup and scroll motion, written by hand.',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    href: 'https://starbucks-landing-delta.vercel.app',
    meta: 'Landing · 2024',
    cover: '/projects/starbucks-landing.webp',
  },
  {
    name: 'Flow',
    description: 'Task manager with lists, deadlines and progress: everything stays on the phone, offline included.',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    href: 'https://todo-list-five-xi-88.vercel.app',
    meta: 'Product · 2026',
    cover: '/projects/flow.webp',
  },
];

export const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Quiz', href: '#quiz' },
  { label: 'Contact', href: '#contact' },
];
