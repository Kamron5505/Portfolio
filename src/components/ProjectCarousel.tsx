'use client';

import { animate, motion, useAnimationFrame, useMotionValue } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import type { ProjectItem } from '@/lib/content';

const SPEED = 40; // пикселей в секунду

// Карусель проектов на Motion: сама плавно едет вправо по кругу, при
// наведении замедляется, её можно тянуть мышью/пальцем, стрелки листают на
// одну карточку. Список продублирован — перемотка на ширину копии бесшовна.
export default function ProjectCarousel({
  projects,
  prev,
  next,
}: {
  projects: ProjectItem[];
  prev: string;
  next: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const half = useRef(0);
  const factor = useRef(1);
  const busy = useRef(false); // перетаскивание или анимация стрелки
  const dragged = useRef(false);

  const wrap = (v: number) => {
    const h = half.current;
    if (!h) return v;
    while (v > 0) v -= h;
    while (v <= -h) v += h;
    return v;
  };

  useEffect(() => {
    const measure = () => {
      half.current = (trackRef.current?.scrollWidth ?? 0) / 2;
      x.set(wrap(x.get() || -half.current));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // wrap читает только ref — пересоздавать эффект не нужно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x]);

  useAnimationFrame((_, delta) => {
    if (busy.current || !half.current) return;
    x.set(wrap(x.get() + (SPEED * factor.current * delta) / 1000));
  });

  const step = (dir: 1 | -1) => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null;
    const width = card?.offsetWidth ?? 340;
    busy.current = true;
    animate(x, x.get() - dir * width, { type: 'spring', stiffness: 220, damping: 30 }).then(() => {
      x.set(wrap(x.get()));
      busy.current = false;
    });
  };

  const items = [...projects, ...projects];

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        {([[-1, prev, FiArrowLeft], [1, next, FiArrowRight]] as const).map(([dir, label, Icon]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => step(dir)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:bg-accent hover:text-bg"
          >
            <Icon aria-hidden="true" />
          </button>
        ))}
      </div>

      <div
        className="fade-x mr-[calc(50%-50vw)] ml-[calc(50%-50vw)] overflow-hidden"
        onMouseEnter={() => (factor.current = 0.2)}
        onMouseLeave={() => (factor.current = 1)}
      >
        <motion.ul
          ref={trackRef}
          drag="x"
          dragMomentum={false}
          style={{ x }}
          onDragStart={() => {
            busy.current = true;
            dragged.current = true;
          }}
          onDragEnd={() => {
            x.set(wrap(x.get()));
            busy.current = false;
            setTimeout(() => (dragged.current = false), 0);
          }}
          className="flex w-max cursor-grab active:cursor-grabbing"
        >
          {items.map((project, i) => {
            const copy = i >= projects.length;
            return (
              <li
                key={`${project.id}-${copy ? 'b' : 'a'}`}
                aria-hidden={copy || undefined}
                className={`mr-4 shrink-0 ${project.featured ? 'w-[86vw] sm:w-[520px]' : 'w-[72vw] sm:w-[340px]'}`}
              >
                <a
                  href={project.href || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  tabIndex={copy ? -1 : undefined}
                  // Отпускание после перетаскивания не должно открывать ссылку.
                  onClick={(e) => dragged.current && e.preventDefault()}
                  className="group relative block h-[340px] overflow-hidden rounded-xl border border-white/10 bg-surface-2 sm:h-[380px]"
                >
                  {project.cover && (
                    <Image
                      src={project.cover}
                      alt={copy ? '' : project.name}
                      fill
                      draggable={false}
                      sizes={project.featured ? '520px' : '340px'}
                      className="pointer-events-none object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{project.meta ?? 'Selected work'}</p>
                    <h3 className={`mt-1.5 display-type leading-none text-ink ${project.featured ? 'text-4xl' : 'text-2xl'}`}>
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 max-w-md text-xs leading-relaxed text-muted">{project.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag) => (
                        <li key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-ink/80">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {project.href && (
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-accent text-bg opacity-0 transition-opacity group-hover:opacity-100">
                      <FiArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
}
