import Image from 'next/image';
import { FiDownload } from 'react-icons/fi';
import type { ServiceItem, SiteInfo, SocialItem, UiText } from '@/lib/content';
import TypewriterTitle from './kokonutui/type-writer';
import LogoCarousel from './LogoCarousel';
import SocialIcon from './SocialIcon';
import Slide from './Slide';

const YEAR = new Date().getFullYear();

// Обложка на весь экран: красный D-блок от левого края с фото, плакатное
// PORTFOLIO + год, печатающаяся строка с услугами, меню в стиле
// «START / OPTIONS / EXIT» и карусель моделей внизу.
export default function Hero({
  site,
  ui,
  socials,
  services,
}: {
  site: SiteInfo;
  ui: UiText;
  socials: SocialItem[];
  services: ServiceItem[];
}) {
  const menu = [
    { label: ui.hero.auditCta, href: '#quiz' },
    { label: ui.hero.viewWork, href: '#projects' },
    { label: ui.hero.getInTouch, href: '#contact' },
  ];

  return (
    <div id="top">
      <Slide id="cover" variant="cover" bare className="flex min-h-svh flex-col pt-16">
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-4">
          {/* Красный «D» прижат к левому краю экрана, как в референсе. */}
          <div
            data-hero-d
            className="relative h-[240px] w-[90%] rounded-r-full bg-accent-2 shadow-[0_30px_90px_rgba(200,16,46,0.3)] sm:h-[320px] lg:h-[380px] lg:w-full"
          >
            <div
              data-hero-avatar
              className="absolute inset-y-3 right-3 aspect-square overflow-hidden rounded-full border-4 border-accent-2"
            >
              <Image
                src={site.avatar}
                alt={`${site.name} — ${ui.role}`}
                fill
                priority
                sizes="(max-width: 640px) 240px, 380px"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="px-5 text-center sm:px-8 lg:pl-6 lg:pr-[max(2.5rem,calc((100vw-1240px)/2+2.5rem))] lg:text-left">
            <h1 data-hero-item className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {site.name}
            </h1>
            <div className="mt-3 flex items-end justify-center gap-4 lg:justify-start">
              <p data-hero-title className="display-type text-[clamp(3.6rem,11vw,9.5rem)] leading-[0.85] text-steel">
                Portfolio
              </p>
              <span
                data-hero-item
                className="pb-2 font-condensed text-[clamp(1.6rem,4vw,3.25rem)] font-light leading-none text-steel/90"
              >
                {YEAR}
              </span>
            </div>
            <p data-hero-item className="mt-5 font-condensed text-xl uppercase tracking-[0.06em] text-ink sm:text-2xl">
              <span aria-hidden="true" className="mr-2 text-accent-2">▸</span>
              <TypewriterTitle
                className="align-middle"
                sequences={services.map((s) => ({ text: s.title, deleteAfter: true, pauseAfter: 1600 }))}
                typingSpeed={55}
                deleteSpeed={28}
              />
            </p>
            <p data-hero-item className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted lg:mx-0">
              {ui.hero.headline}
            </p>
          </div>
        </div>

        <div className="wrap flex flex-col items-center gap-7 pb-6">
          <p data-hero-item className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            <span aria-hidden="true" className="h-3 w-3 border border-ink bg-ink" />
            {ui.role}
          </p>

          <ul data-hero-item className="flex flex-col items-center gap-3">
            {menu.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
                >
                  <span aria-hidden="true" className="opacity-0 transition-opacity group-hover:opacity-100">▸</span>
                  {item.label}
                  <span aria-hidden="true" className="opacity-0 transition-opacity group-hover:opacity-100">◂</span>
                </a>
              </li>
            ))}
            {site.cv && (
              <li>
                <a
                  href={site.cv}
                  download
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint transition-colors hover:text-accent"
                >
                  <FiDownload size={12} aria-hidden="true" /> {ui.hero.downloadCv}
                </a>
              </li>
            )}
          </ul>

          <ul data-hero-item className="flex items-center gap-4">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-faint transition-colors hover:text-accent">
                  <SocialIcon name={s.icon} size={15} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div data-hero-item className="border-t border-line">
          <LogoCarousel label={ui.skills.title} />
        </div>
      </Slide>
    </div>
  );
}
