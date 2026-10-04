import { FiArrowUpRight, FiDownload, FiMail } from 'react-icons/fi';
import type { SiteInfo, SocialItem, UiText } from '@/lib/content';
import SocialIcon from './SocialIcon';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Contact({ site, ui, socials }: { site: SiteInfo; ui: UiText; socials: SocialItem[] }) {
  return (
    <section id="contact" className="scroll-mt-24 border-t border-line bg-surface py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading index="07" eyebrow={ui.contact.eyebrow} title="Have a business problem worth solving?" />
        <Reveal>
          <div className="grid gap-10 border-y border-line py-8 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="max-w-2xl font-display text-3xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">Bring the rough version. We will find the sharp one.</p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{ui.contact.blurb}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3.5 font-medium text-bg transition-transform hover:-translate-y-0.5"><FiMail aria-hidden="true" /> {site.email}</a>
              {site.cv && <a href={site.cv} download className="inline-flex items-center gap-2 rounded-md border border-line px-5 py-3.5 font-medium text-ink transition-colors hover:border-accent hover:text-accent"><FiDownload aria-hidden="true" /> {ui.contact.downloadCv}</a>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-b border-line py-5">
            {socials.map((s) => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-accent"><SocialIcon name={s.icon} size={15} /> {s.label} <FiArrowUpRight size={13} aria-hidden="true" /></a>)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
