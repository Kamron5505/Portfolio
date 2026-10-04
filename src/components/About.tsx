import type { UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

const principles = [
  ['01', 'Read the business', 'Positioning, audience and the one action the site needs to earn.'],
  ['02', 'Make it legible', 'A clear interface, sharp copy and a path that works on a phone.'],
  ['03', 'Leave leverage', 'Automations and AI where they remove repetitive work after launch.'],
];

export default function About({ ui }: { ui: UiText }) {
  return (
    <section id="about" className="scroll-mt-24 border-b border-line py-20 sm:py-28">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
          <SectionHeading index="01" eyebrow={ui.about.eyebrow} title="A site is a business tool, not a poster." />
          <Reveal>
            <p className="max-w-3xl font-display text-3xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
              I connect strategy, interface and automation so a business can be understood faster and run with less friction.
            </p>
            <div className="mt-8 max-w-2xl space-y-4 text-base leading-relaxed text-muted">
              {ui.about.paragraphs.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-12 grid border-y border-line sm:grid-cols-3">
              {principles.map(([number, title, description]) => (
                <div key={number} className="border-b border-line py-5 last:border-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
                  <p className="font-mono text-xs text-accent">{number}</p>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
