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
  role: 'Frontend Developer',
  subRole: 'Moving into Full Stack',
  tagline: 'I build fast, responsive websites for business.',
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
  { label: 'Telegram', handle: '@kamron.devx', url: 'https://t.me/kamron.devx', icon: 'telegram' },
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
  "I'm Kamron Fazilov — a frontend developer from Tashkent. I build modern, fast and responsive websites for business: landing pages, corporate sites, online stores and admin panels.",
  'I work with React, Next.js and TypeScript, and I care about the parts that are usually skipped: the site has to load quickly, work on every phone and bring the client real enquiries.',
  "I'm learning backend and moving toward full stack, which is why Node.js, Express, Prisma and PostgreSQL sit in my stack next to the frontend tools.",
  'Beyond development I find my own clients, sell my work and build my personal brand. My goal: become a strong full stack developer, start my own IT company and work with international clients.',
];

export type SkillGroup = { title: string; items: string[] };

export const SKILLS: SkillGroup[] = [
  {
    title: 'Frontend',
    items: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind CSS'],
  },
  { title: 'Backend & Data', items: ['Node.js', 'Express.js', 'Prisma ORM', 'PostgreSQL', 'MongoDB', 'REST API'] },
  { title: 'Tools & Cloud', items: ['Git / GitHub', 'VS Code', 'Figma', 'Postman', 'Vercel', 'Render', 'Railway'] },
];

// Услуги: тексты переводятся в i18n.ts по индексу.
export const SERVICES_COUNT = 6;

export type Project = {
  name: string;
  description: string;
  tags: string[];
  href: string;
  featured?: boolean;
  meta?: string;
};

// TODO: заменить href на реальные ссылки на живые сайты, где они есть.
const GH = 'https://github.com/Kamron5505';

export const PROJECTS: Project[] = [
  {
    name: 'StarPayUzAuto',
    description:
      'Car payment and service platform for the Uzbek market: client flow, admin panel and a typed API on top of PostgreSQL.',
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    href: GH,
    featured: true,
    meta: 'Commercial · 2025',
  },
  {
    name: 'AI SEO Rank Tracker Dashboard',
    description:
      'Dashboard that tracks keyword positions and turns raw ranking data into a readable weekly picture.',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    href: GH,
    featured: true,
    meta: 'Product · 2025',
  },
  {
    name: 'UMAL Store',
    description: 'Online store with a catalogue, filters, cart and an order flow wired into a REST API.',
    tags: ['Next.js', 'Tailwind CSS', 'REST API'],
    href: GH,
    meta: 'E-commerce · 2025',
  },
  {
    name: 'Belora Tashkent',
    description:
      'Site for a Tashkent beauty studio: services, pricing and a booking request that lands straight in Telegram.',
    tags: ['Next.js', 'Tailwind CSS'],
    href: GH,
    meta: 'Commercial · 2025',
  },
  {
    name: 'RED Series',
    description: 'Film and series catalogue with search, filtering and detail pages, built on a public REST API.',
    tags: ['React', 'Vite', 'REST API'],
    href: GH,
    meta: 'Product · 2024',
  },
  {
    name: 'Spotify Clone',
    description: 'Spotify interface rebuilt from scratch: player state, playlists and responsive layout down to 320px.',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    href: GH,
    meta: 'Practice · 2024',
  },
  {
    name: 'Perfume Landing',
    description: 'Perfume landing page built on typography and product photography, with no template underneath.',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    href: GH,
    meta: 'Landing · 2024',
  },
  {
    name: 'Starbucks Landing',
    description: 'Starbucks-style landing page: full responsive markup and scroll motion, written by hand.',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    href: GH,
    meta: 'Landing · 2024',
  },
  {
    name: 'Weather App',
    description: 'Weather app on a public API: geolocation, forecast and clear error and loading states.',
    tags: ['JavaScript', 'REST API'],
    href: GH,
    meta: 'Practice · 2024',
  },
];

export const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];
