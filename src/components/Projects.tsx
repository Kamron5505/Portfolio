import Image from 'next/image';
import { FiArrowUpRight } from 'react-icons/fi';
import type { ProjectItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

/**
 * Короткая подпись для бейджа «Live»: посетитель должен видеть, куда ведёт
 * карточка, до клика. Домен читается лучше полного адреса, а телеграм-бота
 * узнают по хэндлу, а не по хосту t.me.
 */
function linkLabel(href: string): string {
  try {
    const url = new URL(href);
    if (url.hostname === 't.me') return `@${url.pathname.replace(/^\//, '')}`;
    return url.hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}

export default function Projects({ ui, projects }: { ui: UiText; projects: ProjectItem[] }) {
  return (
    <section id="projects" className="editorial-section project-field scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading index="04" eyebrow={ui.projects.eyebrow} title={ui.projects.title} />

        <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
          {projects.map((project, i) => {
            // Ссылка есть не у каждого проекта. Раньше пустой href превращался
            // в «#» — клик по карточке дёргал страницу вверх, а краулер видел
            // ссылку в никуда. Без адреса карточка просто не кликабельна.
            const Card = project.href ? 'a' : 'div';
            const linkProps = project.href
              ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
            <Reveal
              as="li"
              key={project.id}
              delay={i * 0.06}
              className={project.featured ? 'md:col-span-2' : ''}
            >
              <Card
                {...linkProps}
                className={`card card-hover group flex h-full overflow-hidden ${
                  // Карточка на всю ширину с обложкой 16:9 занимала бы почти
                  // весь экран по высоте. На десктопе раскладываем её в строку:
                  // обложка слева, текст справа — высоту задаёт текст.
                  project.featured ? 'flex-col md:flex-row' : 'flex-col'
                }`}
              >
                {/* Обложка есть не у каждого проекта; без неё карточка просто плотнее. */}
                {project.cover && (
                  <div
                    className={`relative w-full shrink-0 overflow-hidden border-line bg-surface-2 ${
                      project.featured
                        ? 'aspect-[16/9] border-b md:aspect-auto md:min-h-[19rem] md:w-[55%] md:border-b-0 md:border-r'
                        : 'aspect-[16/9] border-b'
                    }`}
                  >
                    <Image
                      src={project.cover}
                      alt={`${project.name}${project.meta ? ` — ${project.meta}` : ''}`}
                      fill
                      sizes={project.featured ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 100vw, 50vw'}
                      // Секция всегда ниже первого экрана — обложки лениво.
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-3 font-display text-xl font-bold text-ink">{project.name}</h3>

                  {project.meta && (
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-accent-2">
                      {project.meta}
                    </p>
                  )}

                  {/* Бейдж живой ссылки. Карточка целиком уже <a>, поэтому это
                      span, а не вложенная ссылка — иначе была бы невалидная
                      вёрстка и два разных таргета клика. */}
                  {project.href && (
                    <span className="mb-4 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-line bg-surface-2/60 py-1 pl-2.5 pr-3 font-mono text-[11px] text-muted transition-colors group-hover:border-accent/40 group-hover:text-ink">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
                      </span>
                      <span className="shrink-0 uppercase tracking-wider">Live</span>
                      <span aria-hidden="true" className="shrink-0 text-faint">
                        ·
                      </span>
                      <span className="truncate">{linkLabel(project.href)}</span>
                      <FiArrowUpRight
                        aria-hidden="true"
                        className="shrink-0 text-faint transition-colors group-hover:text-accent"
                        size={14}
                      />
                    </span>
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
              </Card>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
