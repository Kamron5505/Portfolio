import { FiArrowUpRight, FiCheck, FiDownload, FiMapPin, FiZap } from 'react-icons/fi';
import type { SiteInfo, SocialItem, UiText } from '@/lib/content';
import SocialIcon from './SocialIcon';
import Avatar from './Avatar';

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
    <section id="top" className="relative overflow-hidden border-b border-line pt-24 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg" />

      <div className="wrap relative pb-20 sm:pb-28">
        <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p data-hero-item className="eyebrow mb-7 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-accent-2" />
              {ui.hero.available}
            </p>

            <h1
              data-hero-title
              className="max-w-3xl font-display text-[clamp(3.4rem,9vw,7.7rem)] font-bold leading-[0.88] tracking-[-0.07em]"
            >
              {site.name}
            </h1>

            <p data-hero-item className="mt-7 max-w-2xl text-xl font-medium leading-snug text-ink sm:text-2xl">
              Websites that make a business clearer, more credible and easier to buy from.
            </p>

            <p data-hero-item className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {ui.tagline} {ui.hero.intro}
            </p>

            <div data-hero-item className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-faint">
              <span className="inline-flex items-center gap-2">
                <FiMapPin size={14} aria-hidden="true" /> {ui.location}
              </span>
              <span className="text-accent">{ui.role}</span>
              <span>{ui.subRole}</span>
            </div>

            <div data-hero-item className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#quiz"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3.5 font-medium text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25"
              >
                Start an AI audit <FiArrowUpRight aria-hidden="true" />
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-5 py-3.5 font-medium text-ink transition-colors hover:border-accent/50 hover:bg-surface-2"
              >
                {ui.hero.viewWork} <FiArrowUpRight aria-hidden="true" />
              </a>
              {site.cv && (
                <a
                  href={site.cv}
                  download
                  aria-label={ui.hero.downloadCv}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-line bg-surface text-ink transition-colors hover:border-accent/50 hover:bg-surface-2"
                >
                  <FiDownload size={17} aria-hidden="true" />
                </a>
              )}
            </div>

            <ul data-hero-item className="mt-8 flex flex-wrap items-center gap-2">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <SocialIcon name={s.icon} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div data-hero-item className="relative mx-auto w-full max-w-[470px] lg:mx-0 lg:justify-self-end">
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
              <span>AI business audit</span>
              <span className="text-accent-2">Live brief</span>
            </div>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-surface-2">
                    <Avatar src={site.avatar} alt={`${site.name} — ${ui.role}`} initials={site.initials} />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-ink">From brief to build</p>
                    <p className="font-mono text-[11px] text-faint">strategy / design / code</p>
                  </div>
                </div>
                <FiZap className="text-accent" size={21} aria-hidden="true" />
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  The audit finds the gaps between what a business offers and what a new customer needs to trust it.
                </p>
                <ul className="space-y-3 border-l-2 border-accent pl-4">
                  {['Offer and positioning', 'Customer journey', 'Site structure and content', 'AI and automation fit'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-ink">
                      <FiCheck className="shrink-0 text-accent-2" size={15} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-3 gap-2 border-t border-line pt-5">
                  {[
                    ['01', 'Discover'],
                    ['02', 'Design'],
                    ['03', 'Launch'],
                  ].map(([number, label]) => (
                    <div key={number}>
                      <p className="font-mono text-xs text-accent">{number}</p>
                      <p className="mt-1 text-sm font-medium text-ink">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
