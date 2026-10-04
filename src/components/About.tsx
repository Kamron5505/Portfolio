import Image from 'next/image';
import type { SiteInfo, UiText } from '@/lib/content';
import Reveal from './Reveal';
import Slide from './Slide';

// Слайд «Profil»: портрет в синем свечении слева, About me и колонки справа.
export default function About({ site, ui }: { site: SiteInfo; ui: UiText }) {
  return (
    <Slide id="about">
      <div className="grid gap-10 slide-body lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal className="flex flex-col items-center text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{ui.subRole}</p>
          <p className="mt-1 display-type text-3xl leading-none text-steel">{site.name}</p>
          <div data-parallax className="relative mt-8 w-full max-w-[320px]">
            <div aria-hidden="true" className="animate-glow absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgba(37,120,210,0.75)_0%,rgba(13,47,82,0.4)_45%,transparent_70%)] blur-xl" />
            <div className="relative aspect-4/5 overflow-hidden rounded-t-full">
              <Image src={site.avatar} alt={site.name} fill sizes="320px" className="object-cover object-top" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#03050a] to-transparent" />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <h2 className="section-title">{ui.about.title}</h2>
          <div className="mt-5 max-w-2xl space-y-3">
            {ui.about.paragraphs.slice(0, 3).map((p, i) => (
              <p key={i} className="body-caps">{p}</p>
            ))}
          </div>

          <div className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
            {ui.about.principles.map(([title, description], i) => (
              <div key={title}>
                <p className="font-condensed text-sm font-medium uppercase tracking-[0.08em] text-ink">
                  <span className="mr-2 text-accent">0{i + 1}</span>
                  {title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Slide>
  );
}
