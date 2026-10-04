import Image from 'next/image';
import { FiDownload, FiMail } from 'react-icons/fi';
import type { SiteInfo, SocialItem, UiText } from '@/lib/content';
import SocialIcon from './SocialIcon';
import ShimmerText from './kokonutui/shimmer-text';
import Reveal from './Reveal';
import Slide from './Slide';

const YEAR = new Date().getFullYear();

// Финальный слайд «Contact Me»: круглое фото со столбиком соцсетей слева,
// плакатное THANK YOU + год справа, карточки почты/CV внизу.
export default function Contact({ site, ui, socials }: { site: SiteInfo; ui: UiText; socials: SocialItem[] }) {
  return (
    <Slide id="contact">
      <div className="slide-body">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="section-title text-center lg:text-left">{ui.contact.title}</h2>
            <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
              <div className="text-center">
                <div className="animate-float relative mx-auto h-44 w-44 overflow-hidden rounded-full border-2 border-white/10 shadow-[0_0_60px_rgba(37,120,210,0.35)] sm:h-52 sm:w-52">
                  <Image src={site.avatar} alt={site.name} fill sizes="208px" className="object-cover" />
                </div>
                <p className="mt-3 font-condensed text-sm font-medium uppercase tracking-[0.08em] text-ink">{site.name}</p>
              </div>
              <ul className="space-y-3">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-bg transition-colors group-hover:bg-accent">
                        <SocialIcon name={s.icon} size={16} />
                      </span>
                      <span className="transition-colors group-hover:text-accent">{s.handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="text-center">
            <p className="flex flex-col leading-[0.9]">
              <ShimmerText text="Thank you" className="display-type text-[clamp(3.5rem,9vw,7rem)]" />
              <ShimmerText text={String(YEAR)} className="display-type text-[clamp(3.5rem,9vw,7rem)]" />
            </p>
            <p className="body-caps mx-auto mt-6 max-w-md">{ui.contact.blurb}</p>
          </Reveal>
        </div>

        <Reveal className="mt-12 grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${site.email}`}
            className="group flex items-center gap-4 rounded-md border border-line bg-[linear-gradient(120deg,#0d2f52,#04070d)] p-5 transition-colors hover:border-accent/50"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-bg"><FiMail size={18} aria-hidden="true" /></span>
            <span>
              <span className="block display-type text-xl leading-none text-steel">Email</span>
              <span className="mt-1 block text-xs text-muted group-hover:text-ink">{site.email}</span>
            </span>
          </a>
          {site.cv && (
            <a
              href={site.cv}
              download
              className="group flex items-center gap-4 rounded-md border border-line bg-[linear-gradient(120deg,#3a0712,#04070d)] p-5 transition-colors hover:border-accent-2/70"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-2 text-ink"><FiDownload size={18} aria-hidden="true" /></span>
              <span>
                <span className="block display-type text-xl leading-none text-steel">CV</span>
                <span className="mt-1 block text-xs text-muted group-hover:text-ink">{ui.contact.downloadCv}</span>
              </span>
            </a>
          )}
        </Reveal>
      </div>
    </Slide>
  );
}
