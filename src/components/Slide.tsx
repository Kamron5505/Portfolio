import type { ReactNode } from 'react';

// Полноширинная секция в стиле слайдов референса: фон и свечение тянутся на
// весь экран, контент центрирует .wrap. bare — без .wrap (обложка сама
// раскладывает элементы от края экрана).
export default function Slide({
  id,
  variant = 'right',
  className = '',
  bare = false,
  children,
}: {
  id: string;
  variant?: 'right' | 'left' | 'cover';
  className?: string;
  bare?: boolean;
  children: ReactNode;
}) {
  const tone = variant === 'left' ? 'slide-left' : variant === 'cover' ? 'slide-cover' : '';
  return (
    <section id={id} className={`slide ${tone} ${className}`}>
      {bare ? children : <div className="wrap">{children}</div>}
    </section>
  );
}
