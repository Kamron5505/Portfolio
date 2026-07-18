import Image from 'next/image';
import type { HighlightItem, UiText } from '@/lib/content';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';

export default function Highlights({ ui, highlights }: { ui: UiText; highlights: HighlightItem[] }) {
  // Пусто — секцию не показываем вовсе, чтобы не зиял голый заголовок.
  if (highlights.length === 0) return null;

  return (
    <section id="highlights" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading index="05" eyebrow={ui.highlights.eyebrow} title={ui.highlights.title} />

        {/* Плитка в стиле masonry: колонки CSS, элементы не рвутся по высоте. */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {highlights.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 0.06}>
              <figure className="card group overflow-hidden break-inside-avoid">
                <div className="relative overflow-hidden bg-surface-2">
                  {item.kind === 'video' ? (
                    <video
                      src={item.src}
                      controls
                      preload="metadata"
                      playsInline
                      className="h-auto w-full"
                    />
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.caption || 'Highlight'}
                      width={800}
                      height={800}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                {item.caption && (
                  <figcaption className="px-4 py-3 text-sm leading-relaxed text-muted">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
