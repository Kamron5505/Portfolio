import type { ServiceItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Services({ ui, services }: { ui: UiText; services: ServiceItem[] }) {
  return (
    <section id="services" className="scroll-mt-24 py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading index="02" eyebrow={ui.services.eyebrow} title={ui.services.title} />

        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06}>
              <div className="h-full bg-bg p-6 transition-colors hover:bg-surface sm:p-7">
                <span className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-8 font-display text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
