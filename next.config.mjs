import withSerwistInit from '@serwist/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // PGlite (встроенная локальная БД) тянет WASM-бинарь — его нельзя бандлить,
  // пакет должен грузиться из node_modules как есть.
  serverExternalPackages: ['@electric-sql/pglite'],
  experimental: {
    // Загрузки через Server Actions по умолчанию режутся на 1 МБ — мало даже для
    // фото. На своём сервере это снимает потолок; на Vercel всё равно действует
    // платформенный лимит ~4.5 МБ, поэтому крупные видео даём внешней ссылкой.
    serverActions: { bodySizeLimit: '48mb' },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Фото и обложки, загруженные через админку, лежат в Vercel Blob.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      {
        // Базовые security-заголовки для всех маршрутов.
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Долгий кеш для неизменяемой статики.
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Service worker не кешируем: иначе браузер неделями держал бы старый
        // воркер и обновления сайта не доезжали бы до установленного PWA.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // В dev service worker только мешает: кеширует и прячет свежие правки.
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
});

export default withSerwist(nextConfig);
