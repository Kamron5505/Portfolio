'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { QualityTier } from '@/lib/device-tier';
import Crystal from './Crystal';
import Lighting from './Lighting';
import Particles from './Particles';

/**
 * Канвас сцены героя. Модуль тянет за собой three + R3F + postprocessing,
 * поэтому грузится только динамическим импортом (см. HeroObject).
 *
 * За 60 FPS отвечают три механизма:
 *  1. frameloop='never', пока герой вне экрана или вкладка скрыта —
 *     невидимая сцена не должна жечь батарею;
 *  2. PerformanceMonitor: если кадры просели, срезаем dpr, потом bloom;
 *  3. исходные настройки качества выбираются по классу устройства.
 */
export default function HeroCanvas({
  tier,
  active,
  onReady,
}: {
  tier: QualityTier;
  active: boolean;
  onReady?: () => void;
}) {
  const high = tier === 'high';
  const [dpr, setDpr] = useState(high ? 1.5 : 1);
  const [bloom, setBloom] = useState(high);

  const degrade = () => {
    setDpr(1);
    setBloom(false);
  };

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: [0, 0, 7], fov: 40, near: 0.1, far: 60 }}
      gl={{
        alpha: true,
        // На high сглаживание берёт на себя multisampling композера, второй
        // MSAA на дефолтном фреймбуфере был бы платой ни за что.
        antialias: !high,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        onReady?.();
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerformanceMonitor flipflops={3} onDecline={degrade} onFallback={degrade} />

      <Suspense fallback={null}>
        <Lighting tier={tier} />
        <Crystal tier={tier} />
        <Particles count={high ? 900 : 260} />
      </Suspense>

      {bloom && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          {/* Порог высокий, интенсивность низкая: светятся только ядро,
              кольца и спутник — остальная сцена остаётся чистой. */}
          <Bloom
            mipmapBlur
            intensity={0.45}
            luminanceThreshold={0.72}
            luminanceSmoothing={0.22}
            radius={0.7}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
