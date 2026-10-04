import { FiArrowUpRight } from 'react-icons/fi';
import type { ServiceItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Services({ ui, services }: { ui: UiText; services: ServiceItem[] }) {
  return (
    <section id="services" className="scroll-mt-24 border-b border-line py-20 sm:py-28">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading index="02" eyebrow={ui.services.eyebrow} title="One partner from the first question to the final deploy." />
          <p className="max-w-xs pb-10 text-sm leading-relaxed text-muted md:pb-0">A compact service system for businesses that need clarity, momentum and a site that earns its place.</p>
        </div>

        <ol className="mt-2 border-t border-line">
          {services.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <li className="group grid gap-4 border-b border-line py-6 transition-colors hover:bg-surface/70 sm:grid-cols-[5rem_0.8fr_1fr_auto] sm:items-center sm:px-4">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{item.title}</h3>
                <p className="max-w-md text-sm leading-relaxed text-muted">{item.description}</p>
                <FiArrowUpRight className="hidden text-faint transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent sm:block" size={22} aria-hidden="true" />
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
