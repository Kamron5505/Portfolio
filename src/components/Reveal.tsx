import type { ReactNode } from 'react';

// Маркер скролл-ревила: рендерит контент в SSR-HTML (виден без JS, хорошо
// для SEO), а анимацию вешает GsapEffects по data-reveal (GSAP ScrollTrigger).
// Проп delay сохранён для совместимости с существующими вызовами — стаггер
// теперь считает ScrollTrigger.batch, поэтому значение не используется.
export default function Reveal({
  children,
  delay: _delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div data-reveal className={className}>
      {children}
    </div>
  );
}
