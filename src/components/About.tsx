import type { UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function About({ ui }: { ui: UiText }) {
  return (
    <section id="about" className="scroll-mt-24 border-b border-line py-20 sm:py-28">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <SectionHeading index="01" eyebrow={ui.about.eyebrow} title={ui.about.title} />
          <Reveal className="space-y-5">
            {ui.about.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-2xl font-medium leading-tight text-ink sm:text-3xl' : 'max-w-2xl text-base leading-relaxed text-muted'}>
                {p}
              </p>
            ))}
            <div className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
              {[
                ['01', 'Audit'],
                ['02', 'Structure'],
                ['03', 'Interface'],
                ['04', 'Launch'],
              ].map(([number, label]) => (
                <div key={number}>
                  <p className="font-mono text-xs text-accent">{number}</p>
                  <p className="mt-1 text-sm font-medium text-ink">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
