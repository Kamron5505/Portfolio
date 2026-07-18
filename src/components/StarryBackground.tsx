'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const STAR_COUNT = 130;
const METEOR_COUNT = 4;

type Star = {
  left: number; // %
  top: number; // %
  size: number; // px
  opacity: number;
  twinkles: boolean;
};

/**
 * Фиксированный фон-«звёздное небо» позади всего контента: статичные точки,
 * мерцание части звёзд и редкие метеоры по диагонали. Слой прозрачный —
 * базовый цвет и радиальные градиенты остаются на body (globals.css),
 * поэтому существующее оформление не перекрывается.
 *
 * Анимируются только transform и opacity; при prefers-reduced-motion
 * GSAP не запускается вовсе — остаётся статичное небо (как в GsapEffects).
 */
export default function StarryBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);

  // Звёзды случайны на каждый визит, поэтому генерируются после маунта —
  // рендер на сервере дал бы hydration mismatch.
  useEffect(() => {
    setStars(
      Array.from({ length: STAR_COUNT }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        opacity: 0.25 + Math.random() * 0.65,
        twinkles: Math.random() < 0.55,
      })),
    );
  }, []);

  useEffect(() => {
    if (!stars.length || !containerRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      /* Мерцание: у каждой звезды свои длительность и задержка,
         чтобы пульсация не синхронизировалась. */
      gsap.utils.toArray<HTMLElement>('[data-twinkle]').forEach((star) => {
        gsap.to(star, {
          opacity: gsap.utils.random(0.05, 0.3),
          duration: gsap.utils.random(1.2, 2.6),
          delay: gsap.utils.random(0, 3),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      /* Метеоры: полёт по диагонали 45° (x и y растут одинаково, элемент
         повёрнут на те же 45°, так что хвост тянется строго позади).
         repeatRefresh пересчитывает случайную стартовую точку на каждом
         повторе, onRepeat — паузу между появлениями. */
      gsap.utils.toArray<HTMLElement>('[data-meteor]').forEach((meteor, i) => {
        const dist = gsap.utils.random(420, 680);
        const duration = gsap.utils.random(0.9, 1.4);

        const tl = gsap.timeline({
          repeat: -1,
          repeatRefresh: true,
          delay: 1 + i * gsap.utils.random(1.5, 3),
          repeatDelay: gsap.utils.random(3, 8),
        });
        tl.eventCallback('onRepeat', () => tl.repeatDelay(gsap.utils.random(3, 8)));

        tl.set(meteor, {
          x: () => gsap.utils.random(-0.1, 0.7) * window.innerWidth,
          y: () => gsap.utils.random(-0.05, 0.35) * window.innerHeight,
          rotation: 45,
          opacity: 0,
        })
          .to(meteor, { x: `+=${dist}`, y: `+=${dist}`, duration, ease: 'none' }, 0)
          .to(meteor, { opacity: 0.9, duration: duration * 0.2, ease: 'power1.in' }, 0)
          .to(meteor, { opacity: 0, duration: duration * 0.35, ease: 'power1.out' }, duration * 0.65);
      });
    }, containerRef);

    return () => ctx.revert();
  }, [stars]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          data-twinkle={s.twinkles ? '' : undefined}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {Array.from({ length: METEOR_COUNT }, (_, i) => (
        <span
          key={i}
          data-meteor
          className="absolute left-0 top-0 h-px w-36 rounded-full opacity-0"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9))',
            boxShadow: '0 0 6px rgba(255,255,255,0.3)',
          }}
        />
      ))}
    </div>
  );
}
