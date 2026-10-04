import { FiCode, FiCpu, FiLayers } from 'react-icons/fi';
import type { SkillGroupItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

const icons = [FiCode, FiCpu, FiLayers];

export default function Skills({ ui, skills }: { ui: UiText; skills: SkillGroupItem[] }) {
  return (
    <section id="skills" className="scroll-mt-24 border-b border-line bg-surface/50 py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading index="03" eyebrow={ui.skills.eyebrow} title="A practical stack, chosen for shipping." />
        <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          {skills.map((group, i) => {
            const Icon = icons[i] ?? FiLayers;
            return (
              <Reveal key={group.id} delay={i * 0.07}>
                <div className="h-full bg-bg p-6 transition-colors hover:bg-surface-2 sm:p-8">
                  <div className="flex items-start justify-between">
                    <Icon className="text-accent" size={23} aria-hidden="true" />
                    <span className="font-mono text-xs text-faint">0{i + 1}</span>
                  </div>
                  <h3 className="mt-14 font-display text-xl font-bold text-ink">{group.title}</h3>
                  <ul className="mt-5 divide-y divide-line border-y border-line">
                    {group.items.map((item) => <li key={item} className="py-2.5 font-mono text-xs text-muted">{item}</li>)}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
