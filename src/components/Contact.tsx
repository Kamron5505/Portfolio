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
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading index="07" eyebrow={ui.contact.eyebrow} title={ui.contact.title} />

        <Reveal>
          <div className="border-y-2 border-ink py-8 sm:py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted">{ui.contact.blurb}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <a
                  href={`mailto:${site.email}`}
                    className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 font-medium text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30"
                >
                  <FiMail aria-hidden="true" /> {site.email}
                </a>
                {site.cv && (
                  <a
                    href={site.cv}
                    download
                    className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-6 py-3.5 font-medium text-ink transition-colors hover:border-accent-2/40 hover:bg-surface-2"
                  >
                    <FiDownload aria-hidden="true" /> {ui.contact.downloadCv}
                  </a>
                )}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-ink"
                  >
                    <SocialIcon name={s.icon} size={16} /> {s.label}
                    <FiArrowUpRight size={13} aria-hidden="true" className="text-faint" />
                  </a>
                ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
