import type { SkillGroupItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Skills({ ui, skills }: { ui: UiText; skills: SkillGroupItem[] }) {
  return (
    <section id="skills" className="scroll-mt-24 border-y border-line bg-surface-2/35 py-20 sm:py-28">
      <div className="wrap">
        <SectionHeading index="03" eyebrow={ui.skills.eyebrow} title={ui.skills.title} />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.id} delay={i * 0.06}>
              <div className="h-full border-l-2 border-accent pl-5">
                <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-accent">
                  {group.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
