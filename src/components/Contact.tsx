import { FiMail, FiArrowUpRight, FiDownload } from 'react-icons/fi';
import type { SiteInfo, SocialItem, UiText } from '@/lib/content';
import SocialIcon from './SocialIcon';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Contact({
  site,
  ui,
  socials,
}: {
  site: SiteInfo;
  ui: UiText;
  socials: SocialItem[];
}) {
  return (
    <section id="contact" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading index="06" eyebrow={ui.contact.eyebrow} title={ui.contact.title} />

        <Reveal>
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-48 rounded-full bg-accent/15 blur-3xl"
            />
            <div className="relative">
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted">{ui.contact.blurb}</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-medium text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
                >
                  <FiMail aria-hidden="true" /> {site.email}
                </a>
                {site.cv && (
                  <a
                    href={site.cv}
                    download
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-6 py-3.5 font-medium text-ink transition-colors hover:border-accent-2/40 hover:bg-surface-2"
                  >
                    <FiDownload aria-hidden="true" /> {ui.contact.downloadCv}
                  </a>
                )}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    <SocialIcon name={s.icon} size={16} /> {s.label}
                    <FiArrowUpRight size={13} aria-hidden="true" className="text-faint" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
