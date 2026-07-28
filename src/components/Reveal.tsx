import type { ReactNode } from 'react';

// Маркер скролл-ревила: рендерит контент в SSR-HTML (виден без JS, хорошо
// для SEO), а анимацию вешает GsapEffects по data-reveal (GSAP ScrollTrigger).
// Проп delay сохранён для совместимости с существующими вызовами — стаггер
// теперь считает ScrollTrigger.batch, поэтому значение не используется.
//
// as="li": прямым потомком <ul> обязан быть <li>. Обёртка-<div> внутри списка
// ломала бы разметку, и скринридер перестал бы объявлять список списком.
export default function Reveal({
  children,
  delay: _delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li';
}) {
  if (as === 'li') {
    return (
      <li data-reveal className={className}>
        {children}
      </li>
    );
  }

  return (
    <div data-reveal className={className}>
      {children}
    </div>
  );
}
