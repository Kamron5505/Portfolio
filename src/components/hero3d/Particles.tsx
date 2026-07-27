'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Пылинки вокруг кристалла: сферическая оболочка из точек, каждая дрейфует по
 * своей траектории и мерцает.
 *
 * Дрейф и мерцание считает вершинный шейдер по uTime — с тысячей частиц
 * пересчитывать позиции в JS каждый кадр значило бы гонять буфер на GPU 60
 * раз в секунду. Здесь на кадр уходит один uniform.
 */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSeed;
  attribute float aSize;

  varying float vAlpha;
  varying float vMix;

  void main() {
    float s = aSeed * 6.2831853;

    vec3 p = position;
    p.x += sin(uTime * 0.18 + s) * 0.24;
    p.y += cos(uTime * 0.15 + s * 1.7) * 0.3;
    p.z += sin(uTime * 0.12 + s * 2.3) * 0.2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // Перспективное затухание размера: дальние пылинки мельче.
    gl_PointSize = aSize * uPixelRatio * (9.0 / max(-mv.z, 0.001));

    vAlpha = 0.3 + 0.7 * pow(abs(sin(uTime * 0.6 + s)), 2.0);
    vMix = aSeed;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vAlpha;
  varying float vMix;

  void main() {
    // gl_PointCoord — квадрат; вырезаем из него мягкий круг.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a * a * vAlpha);
  }
`;

export default function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null!);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Равномерная выборка направления по сфере: если брать угол theta
      // линейно, точки сбиваются на полюсах.
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      // Оболочка, а не шар: внутри пусто, там живёт сам кристалл.
      const radius = 3 + Math.pow(Math.random(), 0.6) * 4.5;

      positions[i * 3] = Math.cos(theta) * r * radius;
      positions[i * 3 + 1] = u * radius * 0.7;
      positions[i * 3 + 2] = Math.sin(theta) * r * radius;

      seeds[i] = Math.random();
      sizes[i] = 1.2 + Math.random() * 2.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color('#6366f1') },
      uColorB: { value: new THREE.Color('#22d3ee') },
    }),
    [],
  );

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = state.viewport.dpr;
    // Очень медленный общий поворот поля добавляет параллакс к дрейфу частиц.
    points.current.rotation.y += Math.min(delta, 0.05) * 0.02;
  });

  return (
    <points ref={points} geometry={geometry} raycast={() => null}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
