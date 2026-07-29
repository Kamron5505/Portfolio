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
            Начальное скрытие делает CSS-гейт, GSAP доводит до видимого.

            Здесь именно gsap.to, а не fromTo: ScrollTrigger.refresh() (см. 2a)
            заново вызывает onEnter, и fromTo при каждом вызове возвращал бы
            элементы в стартовое состояние — секция гасла обратно уже после
            того, как проявилась. to идемпотентен: повторный вызов просто
            доводит до того же видимого состояния. */
      const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      // Сдвиг задаём один раз; прозрачность уже 0 из CSS-гейта в globals.css.
      gsap.set(reveals, { y: 26 });

      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease,
            stagger: 0.08,
            overwrite: 'auto',
          }),
      });

      /* 2a. Пересчёт позиций триггеров.
            ScrollTrigger запоминает координаты в момент создания, а высота
            страницы после этого ещё меняется: догружаются шрифты, монтируется
            3D-сцена, генерируется звёздный фон. Из-за устаревших координат
            секции ниже по странице оставались скрытыми (opacity: 0) — особенно
            заметно при заходе сразу по якорю вида /ru#quiz, когда браузер
            прыгает вниз ещё до инициализации. */
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh).catch(() => {});
      // Подстраховка для всего, что доезжает после шрифтов.
      const refreshTimer = window.setTimeout(refresh, 1200);

      /* 2c. Доводка позиции при заходе сразу по якорю (ссылкой вида
            /ru#quiz). Браузер прыгает к секции до того, как страница примет
            окончательную высоту, поэтому цель уезжает и заголовок оказывается
            подрезан. Возвращаем скролл на место — но только если посетитель
            ещё не тронул страницу сам: перехватывать чужой скролл нельзя. */
      let userScrolled = false;
      const markScrolled = () => {
        userScrolled = true;
      };
      ['wheel', 'touchstart', 'keydown'].forEach((evt) =>
        window.addEventListener(evt, markScrolled, { once: true, passive: true }),
      );

      const hashTimer = window.setTimeout(() => {
        if (userScrolled) return;
        const id = window.location.hash;
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (target) gsap.to(window, { scrollTo: { y: target, offsetY: 88 }, duration: 0.4 });
      }, 1300);

      /* 2b. Последний рубеж: если что-то всё равно осталось невидимым, но уже
            находится в кадре, показываем без анимации. Пустой экран вместо
            контента — цена, которую платить нельзя ни при каких спецэффектах. */
      const failsafeTimer = window.setTimeout(() => {
        const stuck = gsap.utils
          .toArray<HTMLElement>('[data-reveal]')
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const inView = r.top < window.innerHeight && r.bottom > 0;
            return inView && Number(getComputedStyle(el).opacity) < 0.05;
          });
        if (stuck.length) gsap.set(stuck, { opacity: 1, y: 0 });
      }, 2000);

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
        window.clearTimeout(refreshTimer);
        window.clearTimeout(failsafeTimer);
        window.clearTimeout(hashTimer);
        ['wheel', 'touchstart', 'keydown'].forEach((evt) =>
          window.removeEventListener(evt, markScrolled),
        );
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
