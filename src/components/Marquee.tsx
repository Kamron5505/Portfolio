'use client';

import { motion, useAnimationFrame, useMotionValue } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

// Бесконечная лента на Motion: контент дублируется, лента едет вправо и
// бесшовно «перематывается» на ширину одной копии. При наведении замедляется.
export default function Marquee({
  children,
  speed = 30,
  className = '',
}: {
  children: ReactNode;
  /** пикселей в секунду */
  speed?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const half = useRef(0);
  const factor = useRef(1);
  const x = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      half.current = (trackRef.current?.scrollWidth ?? 0) / 2;
      x.set(-half.current);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [x]);

  useAnimationFrame((_, delta) => {
    if (!half.current) return;
    let next = x.get() + (speed * factor.current * delta) / 1000;
    if (next >= 0) next -= half.current;
    x.set(next);
  });

  return (
    <div
      className={`fade-x overflow-hidden ${className}`}
      onMouseEnter={() => (factor.current = 0.25)}
      onMouseLeave={() => (factor.current = 1)}
    >
      <motion.div ref={trackRef} style={{ x }} className="flex w-max">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true" inert>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
