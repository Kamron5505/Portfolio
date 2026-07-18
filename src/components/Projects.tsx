import Image from 'next/image';
import { FiArrowUpRight } from 'react-icons/fi';
import type { ProjectItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Projects({ ui, projects }: { ui: UiText; projects: ProjectItem[] }) {
  return (
    <section id="projects" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading index="04" eyebrow={ui.projects.eyebrow} title={ui.projects.title} />

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.06} className={project.featured ? 'md:col-span-2' : ''}>
              <a
                href={project.href || '#'}
                target={project.href ? '_blank' : undefined}
                rel={project.href ? 'noopener noreferrer' : undefined}
                className="card card-hover group flex h-full flex-col overflow-hidden"
              >
                {/* Обложка загружается в админке; без неё карточка просто плотнее. */}
                {project.cover && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line bg-surface-2">
                    <Image
                      src={project.cover}
                      alt={project.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-bold text-ink">{project.name}</h3>
                    <FiArrowUpRight
                      className="shrink-0 text-faint transition-colors group-hover:text-accent"
                      size={20}
                    />
                  </div>

                  {project.meta && (
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-accent-2">
                      {project.meta}
                    </p>
                  )}

                  <p className="mb-5 flex-1 leading-relaxed text-muted">{project.description}</p>

                  <ul className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
