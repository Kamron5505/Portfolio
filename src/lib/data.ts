// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the whole site. Edit values here — every section,
// the metadata and the JSON-LD schema read from this file.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  // TODO: заменить на реальный домен, когда он будет подключён.
  url: 'https://kamronfazilov.vercel.app',
  name: 'Kamron Fazilov',
  firstName: 'Kamron',
  lastName: 'Fazilov',
  initials: 'KF',
  role: 'Frontend Developer',
  subRole: 'Moving into Full Stack',
  tagline: 'I build fast, responsive websites for business.',
  location: 'Tashkent, Uzbekistan',
  email: 'kama58077@gmail.com',
  // Фото: положите квадратный снимок (~800x800) в public/kamron-fazilov.jpg.
  // Если файла нет, Avatar покажет инициалы «KF».
  avatar: '/kamron-fazilov.jpg',
  // Резюме: положите PDF в public/Kamron_Fazilov_CV.pdf. Пока файла нет,
  // кнопки «Скачать CV» ведут на 404.
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
