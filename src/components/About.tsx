import type { UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function About({ ui }: { ui: UiText }) {
  return (
    <section id="about" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading index="01" eyebrow={ui.about.eyebrow} title={ui.about.title} />

        <Reveal className="max-w-3xl space-y-5">
          {ui.about.paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-muted">
              {p}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
