'use client';

import { Environment, Lightformer } from '@react-three/drei';
import type { QualityTier } from '@/lib/device-tier';

/**
 * Свет сцены: ambient + два направленных источника + HDR-окружение.
 *
 * Окружение собираем из lightformer-панелей, а не из .hdr-файла: drei
 * рендерит их в HalfFloat-кубмапу (то есть это настоящее HDR-IBL, с которого
 * и живут отражения на стекле), но при этом ничего не качается по сети —
 * важно и для веса страницы, и для оффлайн-режима PWA. `frames={1}` печёт
 * кубмапу один раз при монтировании, дальше она стоит бесплатно.
 */
export default function Lighting({ tier }: { tier: QualityTier }) {
  const high = tier === 'high';

  return (
    <>
      <ambientLight intensity={0.5} color="#93a6ff" />

      {/* Ключевой свет сверху-справа — он лепит грани кристалла. */}
      <directionalLight position={[5, 6.5, 4]} intensity={2.3} color="#eef2ff" />

      {/* Контровой холодный: подсвечивает силуэт и кольца с обратной стороны. */}
      <directionalLight position={[-6, -3, -4]} intensity={1.1} color="#22d3ee" />

      <Environment resolution={high ? 256 : 128} frames={1} background={false}>
        {/* Фон виртуальной сцены задаёт «цвет темноты» в отражениях —
            без него грани ловят чистый чёрный и стекло выглядит мёртвым. */}
        <color attach="background" args={['#05060d']} />

        {/* Широкая мягкая панель сверху — главный блик на фасках. */}
        <Lightformer
          form="rect"
          intensity={4}
          color="#ffffff"
          position={[0, 5, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[10, 6, 1]}
        />

        {/* Индиго-кольцо позади объекта: даёт «keynote»-ореол в отражениях. */}
        <Lightformer
          form="ring"
          intensity={3.2}
          color="#6366f1"
          position={[0, 0.5, -6]}
          scale={7}
        />

        {/* Голубой рефлектор слева — вторичный акцент палитры сайта. */}
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#22d3ee"
          position={[-6, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 5, 1]}
        />

        {high && (
          <Lightformer
            form="circle"
            intensity={1.8}
            color="#c7d2fe"
            position={[5, -3, 3]}
            rotation={[0, -Math.PI / 3, 0]}
            scale={4}
          />
        )}
      </Environment>
    </>
  );
}
