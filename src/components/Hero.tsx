import { FiArrowUpRight, FiDownload, FiMapPin } from 'react-icons/fi';
import type { SiteInfo, SocialItem, UiText } from '@/lib/content';
import SocialIcon from './SocialIcon';
import Avatar from './Avatar';
import HeroObject from './HeroObject';

export default function Hero({
  site,
  ui,
  socials,
}: {
  site: SiteInfo;
  ui: UiText;
  socials: SocialItem[];
}) {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg" />

      {/* Интерактивный 3D-кристалл: на широких экранах уходит вправо, под
          текстовой колонкой остаётся только рассеянное свечение, поэтому
          заголовок не теряет контраст. */}
      <HeroObject className="absolute inset-0 opacity-45 sm:opacity-60 lg:opacity-100" />

      <div className="wrap relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_0.9fr]">
          {/* Left: intro (появление оркестрирует GsapEffects) */}
          <div>
            <p
              data-hero-item
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 font-mono text-xs text-muted"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
              </span>
              {ui.hero.available}
            </p>

            <h1
              data-hero-title
              className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
            >
              {site.name}
            </h1>

            <p data-hero-item className="mt-4 font-mono text-base text-accent sm:text-lg">
              {ui.role} <span className="text-faint">·</span> {ui.subRole}
            </p>

            <p data-hero-item className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {ui.tagline} {ui.hero.intro}
            </p>

            <div data-hero-item className="mt-7 flex items-center gap-2 font-mono text-sm text-faint">
              <FiMapPin size={15} aria-hidden="true" /> {ui.location}
            </div>

            <div data-hero-item className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-medium text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
              >
                {ui.hero.getInTouch} <FiArrowUpRight aria-hidden="true" />
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface/60 px-5 py-3 font-medium text-ink transition-colors hover:border-accent/40 hover:bg-surface-2"
              >
                {ui.hero.viewWork} <FiArrowUpRight aria-hidden="true" />
              </a>
              {site.cv && (
                <a
                  href={site.cv}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface/60 px-5 py-3 font-medium text-ink transition-colors hover:border-accent-2/40 hover:bg-surface-2"
                >
                  {ui.hero.downloadCv} <FiDownload size={16} aria-hidden="true" />
                </a>
              )}
            </div>

            <ul data-hero-item className="mt-8 flex flex-wrap items-center gap-3">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface/60 text-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: avatar with terminal frame + initials fallback */}
          <div data-hero-item className="relative mx-auto w-full max-w-[320px] lg:mx-0">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-accent/25 via-transparent to-accent-2/20 blur-2xl" />
            <div className="card overflow-hidden p-2">
              <div className="flex items-center gap-1.5 px-2 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 font-mono text-[11px] text-faint">
                  {site.firstName.toLowerCase()}.jpg
                </span>
              </div>
              <Avatar src={site.avatar} alt={`${site.name} — ${ui.role}`} initials={site.initials} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
