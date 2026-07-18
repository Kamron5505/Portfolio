'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Единственная точка подключения GSAP: интро hero, скролл-ревилы секций,
 * hover карточек проектов и плавный скролл по якорям. Компонент не рендерит
 * разметку — только вешает анимации на существующий DOM по data-атрибутам.
 *
 * Элементы до старта прячет CSS-гейт в globals.css (только при включённом JS
 * и без prefers-reduced-motion), поэтому SSR-контент не мигает перед интро.
 * GSAP пишет inline-стили, которые перекрывают этот гейт.
 */
export default function GsapEffects() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const ease = 'power3.out';

      /* 1. Hero: имя по словам + каскад остальных элементов. */
      const title = document.querySelector<HTMLElement>('[data-hero-title]');
      let words: HTMLElement[] = [];
      if (title) {
        // Разбивка на слова выполняется один раз (guard на повторный запуск
        // эффекта в StrictMode), но собрать словá и показать контейнер нужно
        // при каждом запуске — иначе заголовок останется скрыт CSS-гейтом.
        if (!title.dataset.split) {
          const text = title.textContent ?? '';
          title.setAttribute('aria-label', text);
          title.dataset.split = '1';
          title.innerHTML = text
            .split(/\s+/)
            .filter(Boolean)
            .map(
              (w) =>
                `<span aria-hidden="true" style="display:inline-block;white-space:pre">${w} </span>`,
            )
            .join('');
        }
        words = Array.from(title.querySelectorAll<HTMLElement>('span'));
        gsap.set(title, { opacity: 1 });
      }
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]');
      const intro = gsap.timeline({ defaults: { ease } });
      if (words.length) {
        intro.from(words, { yPercent: 60, opacity: 0, duration: 0.7, stagger: 0.09 });
      }
      if (heroItems.length) {
        intro.fromTo(
          heroItems,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.09 },
          words.length ? '-=0.35' : 0,
        );
      }

      /* 2. Скролл-ревилы: всё, что обёрнуто в <Reveal> (data-reveal).
            Начальное скрытие делает CSS-гейт, GSAP доводит до видимого. */
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 26, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease, stagger: 0.08 },
          ),
      });

      /* 3. Hover карточек проектов: подъём + лёгкий scale на transform,
            цветовые hover-переходы остаются на CSS. */
      const cards = gsap.utils.toArray<HTMLElement>('#projects a.card');
      const listeners: Array<[HTMLElement, () => void, () => void]> = [];
      cards.forEach((card) => {
        const lift = () =>
          gsap.to(card, { y: -6, scale: 1.015, duration: 0.35, ease: 'power2.out' });
        const drop = () => gsap.to(card, { y: 0, scale: 1, duration: 0.45, ease: 'power2.out' });
        card.addEventListener('mouseenter', lift);
        card.addEventListener('mouseleave', drop);
        listeners.push([card, lift, drop]);
      });

      /* 4. Плавный скролл по внутренним якорям (навбар, CTA hero). */
      const onClick = (e: MouseEvent) => {
        const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href') ?? '';
        // '#' у карточек-заглушек и '#main' (skip-link, важен фокус) не трогаем.
        if (id.length < 2 || id === '#main') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        gsap.to(window, {
          scrollTo: { y: target, offsetY: id === '#top' ? 0 : 88 },
          duration: 0.85,
          ease: 'power3.inOut',
        });
        history.pushState(null, '', id);
      };
      document.addEventListener('click', onClick);

      return () => {
        document.removeEventListener('click', onClick);
        listeners.forEach(([card, lift, drop]) => {
          card.removeEventListener('mouseenter', lift);
          card.removeEventListener('mouseleave', drop);
        });
      };
    });

    return () => ctx.revert();
  }, []);

  return null;
}
