'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { detectQualityTier, type QualityTier } from '@/lib/device-tier';

// three + R3F + postprocessing весят больше всего остального клиентского кода
// вместе взятого. Отдельный чанк без SSR: initial bundle не растёт, сервер не
// пытается рендерить WebGL.
const HeroCanvas = dynamic(() => import('./hero3d/HeroCanvas'), { ssr: false });

function idle(cb: () => void): () => void {
  // requestIdleCallback до сих пор нет в старых Safari — там просто ждём
  // следующий тик после первой отрисовки.
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}

/**
 * Статичная заглушка: тот же силуэт — светящееся ядро и две орбиты — но
 * чистым CSS. Показывается на устройствах без 3D (tier 'off', в том числе
 * при prefers-reduced-motion) и как подложка, пока грузится чанк сцены.
 */
function StaticOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Позиция повторяет раскладку 3D-сцены (Crystal.tsx) — центр секции. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[220px] w-[220px] sm:h-[280px] sm:w-[280px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 38% 32%, rgba(155,178,255,0.24), rgba(79,107,255,0.13) 34%, rgba(34,211,238,0.05) 54%, transparent 66%)',
            }}
          />
          <div
            className="absolute inset-[16%] rounded-full border border-accent/25"
            style={{ transform: 'rotateX(72deg) rotateZ(12deg)' }}
          />
          <div
            className="absolute inset-[4%] rounded-full border border-accent-2/15"
            style={{ transform: 'rotateX(64deg) rotateZ(-28deg)' }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * `className` должен задавать позиционирование и размер контейнера
 * (`absolute inset-0` у секции героя): содержимое внутри выложено
 * абсолютно, а канвасу R3F нужен родитель с ненулевой высотой — иначе
 * он схлопнется до дефолтных 300×150.
 */
export default function HeroObject({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  const [tier, setTier] = useState<QualityTier | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);

  // Класс устройства считаем после гидрации: детект смотрит на WebGL и
  // navigator, на сервере их нет — разметка должна совпасть.
  useEffect(() => setTier(detectQualityTier()), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !tier || tier === 'off') return;

    let cancelIdle: (() => void) | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        // Чанк запрашиваем в первый простой браузера после того, как герой
        // попал в кадр — LCP успевает отрисоваться раньше загрузки three.
        if (entry.isIntersecting && !cancelIdle) {
          cancelIdle = idle(() => setMounted(true));
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(host);

    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      cancelIdle?.();
    };
  }, [tier]);

  const showCanvas = tier !== null && tier !== 'off' && mounted;

  return (
    <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`}>
      {/* Заглушка гаснет ровно тогда, когда сцена дала первый кадр. */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <StaticOrb />
      </div>

      {showCanvas && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <HeroCanvas
            tier={tier}
            active={inView && pageVisible}
            onReady={() => setReady(true)}
          />
        </div>
      )}
    </div>
  );
}
