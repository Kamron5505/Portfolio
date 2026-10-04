import Image from 'next/image';
import { FiArrowUpRight } from 'react-icons/fi';
import type { ProjectItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

function linkLabel(href: string) {
  try {
    const url = new URL(href);
    return url.hostname === 't.me' ? `@${url.pathname.replace(/^\//, '')}` : url.hostname.replace(/^www\./, '');
  } catch { return href; }
}

export default function Projects({ ui, projects }: { ui: UiText; projects: ProjectItem[] }) {
  return (
    <section id="projects" className="scroll-mt-24 py-20 sm:py-28">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading index="04" eyebrow={ui.projects.eyebrow} title="Selected work with a job to do." />
          <p className="max-w-xs pb-10 text-sm leading-relaxed text-muted md:pb-0">Interfaces, commerce and automation shipped for real products and real people.</p>
        </div>

        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
          {projects.map((project, i) => {
            const Wrapper = project.href ? 'a' : 'div';
            const props = project.href ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <Reveal as="li" key={project.id} delay={i * 0.04} className={project.featured ? 'sm:col-span-2' : ''}>
                <Wrapper {...props} className="group block h-full border-t border-line pt-4">
                  {project.cover && (
                    <div className={`relative mb-5 overflow-hidden border border-line bg-surface-2 ${project.featured ? 'aspect-[2.2/1]' : 'aspect-[1.55/1]'}`}>
                      <Image src={project.cover} alt={project.name} fill sizes={project.featured ? '(max-width: 640px) 100vw, 100vw' : '(max-width: 640px) 100vw, 50vw'} loading="lazy" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center bg-bg/85 text-ink opacity-0 transition-opacity group-hover:opacity-100"><FiArrowUpRight size={17} aria-hidden="true" /></span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{project.meta ?? 'Selected work'}</p>
                      <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">{project.name}</h3>
                    </div>
                    {project.href && <span className="mt-1 hidden font-mono text-[10px] text-faint sm:block">{linkLabel(project.href)}</span>}
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{project.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">{project.tags.map((tag) => <li key={tag} className="chip">{tag}</li>)}</ul>
                </Wrapper>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
