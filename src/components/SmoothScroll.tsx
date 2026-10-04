'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

let instance: Lenis | null = null;

/** Плавно прокрутить к элементу/позиции с отступом под фиксированный навбар. */
export function scrollToTarget(target: Element | number) {
  const offset = typeof target === 'number' ? 0 : -64;
  if (instance) instance.scrollTo(target as HTMLElement | number, { offset, duration: 1.2 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset });
}

// Инерционная плавная прокрутка всего сайта (Lenis) и переходы по якорям.
// Работает при любых системных настройках анимации — по просьбе владельца
// сайта; остальные эффекты (GsapEffects) по-прежнему уважают reduced motion.
// Тикает от GSAP, чтобы ScrollTrigger видел ту же позицию, что и посетитель.
export default function SmoothScroll() {
  useEffect(() => {
    // respectReducedMotion: false — иначе Lenis сам выключает плавность при
    // системной настройке «без анимаций».
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, respectReducedMotion: false });
    instance = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href') ?? '';
      // '#' у карточек-заглушек и '#main' (skip-link, важен фокус) не трогаем.
      if (id.length < 2 || id === '#main') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(id === '#top' ? 0 : target);
      history.pushState(null, '', id);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
