import Image from 'next/image';
import { FiArrowUpRight, FiDownload, FiMapPin } from 'react-icons/fi';
import type { SiteInfo, SocialItem, UiText } from '@/lib/content';
import SocialIcon from './SocialIcon';

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
      <div className="wrap relative pb-14 sm:pb-20">
        <div className="mb-10 flex items-center justify-between border-b border-line pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-faint sm:mb-16">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> Available for selected projects</span>
          <span className="hidden sm:inline">Tashkent / Worldwide</span>
        </div>

        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <p data-hero-item className="eyebrow mb-5">Independent developer / AI systems</p>
            <h1 data-hero-title className="display-balance max-w-4xl font-display text-[clamp(4rem,10vw,9.5rem)] font-bold leading-[0.82] tracking-[-0.08em] text-ink">
              Kamron<br /><span className="text-accent">Fazilov</span>
            </h1>
            <div data-hero-item className="mt-8 grid max-w-2xl gap-5 border-l-2 border-accent pl-5 sm:grid-cols-[1fr_0.8fr] sm:gap-8">
              <p className="text-xl font-medium leading-tight text-ink sm:text-2xl">
                Websites and AI workflows that turn attention into action.
              </p>
              <p className="text-sm leading-relaxed text-muted">
                {ui.tagline} {ui.hero.intro}
              </p>
            </div>

            <div data-hero-item className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#quiz" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3.5 font-medium text-bg transition-transform hover:-translate-y-0.5">
                Run a business audit <FiArrowUpRight aria-hidden="true" />
              </a>
              <a href="#projects" className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-5 py-3.5 font-medium text-ink transition-colors hover:border-accent/60 hover:bg-surface-2">
                View selected work <FiArrowUpRight aria-hidden="true" />
              </a>
              {site.cv && (
                <a href={site.cv} download aria-label={ui.hero.downloadCv} className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-line bg-surface text-ink transition-colors hover:border-accent/60 hover:text-accent">
                  <FiDownload size={17} aria-hidden="true" />
                </a>
              )}
            </div>

            <div data-hero-item className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 font-mono text-[11px] text-faint">
              <span className="inline-flex items-center gap-2"><FiMapPin size={14} aria-hidden="true" /> {ui.location}</span>
              <span className="text-accent">{ui.role}</span>
              <ul className="flex items-center gap-3">
                {socials.map((s) => (
                  <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-faint transition-colors hover:text-accent"><SocialIcon name={s.icon} size={15} /></a></li>
                ))}
              </ul>
            </div>
          </div>

          <div data-hero-item className="relative mx-auto w-full max-w-[430px] lg:mx-0 lg:justify-self-end">
            <div className="absolute -left-4 top-8 z-10 hidden border border-line bg-bg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent sm:block">
              <span className="mr-2 text-faint">01</span> Strategy first
            </div>
            <div className="relative aspect-[0.82] overflow-hidden border border-line bg-surface">
              <Image src={site.avatar} alt={`${site.name} — ${ui.role}`} fill priority sizes="(max-width: 1024px) 80vw, 34vw" className="object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between border-t border-white/15 bg-bg/75 p-4 backdrop-blur-sm">
                <div>
                  <p className="font-display text-lg font-bold text-ink">From brief to build</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">audit / interface / launch</p>
                </div>
                <span className="font-mono text-xs text-accent">KF / 26</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              <span>Frontend / Full-stack path</span><span>Scroll to explore ↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
