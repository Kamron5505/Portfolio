'use client';

import { animate } from 'animejs';
import { useEffect, useRef } from 'react';
import { AI_TOOLS } from '@/lib/ai-tools';

// Бесконечная карусель моделей (anime.js): первый ряд едет влево, второй —
// вправо, при наведении ряд замедляется. Список продублирован, сдвиг на -50% даёт
// бесшовную петлю.
function Row({ offset = false, duration }: { offset?: boolean; duration: number }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    // Медленная лента — основной элемент обложки, крутится при любых
    // системных настройках анимации (просьба владельца сайта).
    if (!track) return;
    const anim = animate(track, {
      translateX: offset ? ['-50%', '0%'] : ['0%', '-50%'],
      duration,
      ease: 'linear',
      loop: true,
    });
    const slow = () => {
      anim.speed = 0.25;
    };
    const fast = () => {
      anim.speed = 1;
    };
    track.addEventListener('mouseenter', slow);
    track.addEventListener('mouseleave', fast);
    return () => {
      track.removeEventListener('mouseenter', slow);
      track.removeEventListener('mouseleave', fast);
      anim.revert();
    };
  }, [offset, duration]);

  // Второй ряд начинается с середины списка, чтобы ряды не дублировали друг друга.
  const half = Math.ceil(AI_TOOLS.length / 2);
  const tools = offset ? [...AI_TOOLS.slice(half), ...AI_TOOLS.slice(0, half)] : AI_TOOLS;

  return (
    <div ref={trackRef} className="flex w-max">
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-3 pr-3">
          {tools.map(({ label, Icon, color }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-full border border-line bg-bg/50 py-2 pl-2 pr-4 backdrop-blur-sm"
            >
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-[15px]"
                style={{ color, background: `${color}1f` }}
              >
                <Icon aria-hidden="true" />
              </span>
              <span className="font-condensed text-sm uppercase tracking-[0.12em] text-ink/85">{label}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default function LogoCarousel({ label }: { label: string }) {
  return (
    <div className="fade-x space-y-3 overflow-hidden py-6" role="region" aria-label={label}>
      <Row duration={26000} />
      <Row offset duration={34000} />
    </div>
  );
}
