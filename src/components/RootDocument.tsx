import '@/app/globals.css';
import ChatWidget from '@/components/ChatWidget';
import DevSwCleanup from '@/components/DevSwCleanup';
import GsapEffects from '@/components/GsapEffects';
import SmoothScroll from '@/components/SmoothScroll';
import VisitTracker from '@/components/VisitTracker';
import { fontVariables } from '@/lib/fonts';
import { getContent } from '@/lib/content';
import { type Locale } from '@/lib/i18n';
import { buildSchemas } from '@/lib/schema';

// Общая оболочка <html> для обоих корневых layout — (en) и (intl)/[locale] —
// чтобы структура документа, шрифты и JSON-LD совпадали на всех языках.
export default async function RootDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { site, ui, socials } = await getContent(locale);

  return (
    <html lang={locale} className={`dark ${fontVariables}`}>
      <body className="antialiased">
        {/* JSON-LD лежит в <body> — для Google/Яндекса это равнозначно, зато не
            приходится вручную собирать <head> внутри компонента. */}
        {buildSchemas(site, ui, socials, locale).map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
        >
          {ui.skipToContent}
        </a>
        {children}
        <ChatWidget locale={locale} />
        <SmoothScroll />
        <VisitTracker locale={locale} />
        <GsapEffects />
        {process.env.NODE_ENV === 'development' && <DevSwCleanup />}
      </body>
    </html>
  );
}
