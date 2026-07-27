'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualityTier } from '@/lib/device-tier';
import { usePointerTarget } from './usePointerTarget';

/**
 * Центральный объект героя: гранёный низкополигональный кристалл в стеклянной
 * оболочке, светящееся ядро внутри, мягкое голубое гало и орбитальные кольца.
 *
 * Вся анимация идёт из одного useFrame на компонент — никакого React-стейта в
 * кадре, только мутации three-объектов через ref.
 */

// Детерминированный псевдослучай из координаты вершины: форма кристалла должна
// быть одинаковой при любом монтировании, иначе объект «дрожит» между заходами.
function hash3(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Икосаэдр (20 граней, detail 0) с разбросом вершин по радиусу — получается
 * не «мячик», а огранённый камень.
 *
 * IcosahedronGeometry неиндексирована: одна и та же вершина лежит в буфере
 * трижды, по разу на грань. Смещение кешируем по координате, иначе грани
 * разойдутся по швам и в модели появятся щели.
 */
function makeCrystalGeometry(radius: number, jitter: number) {
  const geometry = new THREE.IcosahedronGeometry(radius, 0);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const moved = new Map<string, THREE.Vector3>();
  const v = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const key = `${v.x.toFixed(4)}|${v.y.toFixed(4)}|${v.z.toFixed(4)}`;

    let next = moved.get(key);
    if (!next) {
      const n = hash3(v.x, v.y, v.z);
      next = v.clone().multiplyScalar(1 + (n - 0.5) * jitter);
      moved.set(key, next);
    }

    position.setXYZ(i, next.x, next.y, next.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/* ---------------------------------------------------------------- гало --- */

const GLOW_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

// Френель по нормали: в центре сферы прозрачно, к краю разгорается — на
// backside-сфере это читается как мягкое свечение вокруг кристалла.
const GLOW_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float rim = 1.0 - abs(dot(normalize(vNormal), normalize(vView)));
    float a = pow(rim, 2.6) * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

function Glow() {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#4d7bff') },
      uIntensity: { value: 0.55 },
    }),
    [],
  );

  useFrame((state) => {
    // Медленное «дыхание» ореола, не синхронное с покачиванием объекта.
    uniforms.uIntensity.value = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
  });

  return (
    <mesh scale={1.8} raycast={() => null}>
      <sphereGeometry args={[1, 32, 24]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={GLOW_VERTEX}
        fragmentShader={GLOW_FRAGMENT}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------- кольца --- */

type RingSpec = {
  radius: number;
  tube: number;
  tilt: [number, number, number];
  speed: number;
  color: string;
  opacity: number;
};

const RINGS: RingSpec[] = [
  { radius: 1.75, tube: 0.013, tilt: [1.42, 0, 0.22], speed: 0.34, color: '#7c9cff', opacity: 0.85 },
  { radius: 2.15, tube: 0.008, tilt: [1.05, 0.42, -0.55], speed: -0.23, color: '#22d3ee', opacity: 0.5 },
  { radius: 2.55, tube: 0.005, tilt: [1.62, -0.3, 0.85], speed: 0.15, color: '#a5b8ff', opacity: 0.28 },
];

function Ring({
  spec,
  segments,
  children,
}: {
  spec: RingSpec;
  segments: [number, number];
  children?: ReactNode;
}) {
  const group = useRef<THREE.Group>(null!);
  // Фаза от радиуса, а не от Math.random: кольца должны качаться вразнобой,
  // но одинаково при каждом монтировании.
  const phase = spec.radius * 2.7;

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Тор лежит в плоскости XY, поэтому «вращение по орбите» — это Z.
    group.current.rotation.z += spec.speed * d;
    // Наклон плоскости орбиты медленно плывёт — кольца не выглядят приклеенными.
    group.current.rotation.x = spec.tilt[0] + Math.sin(t * 0.25 + phase) * 0.09;
    group.current.rotation.y = spec.tilt[1] + Math.cos(t * 0.2 + phase) * 0.07;
  });

  return (
    <group ref={group} rotation={spec.tilt}>
      <mesh raycast={() => null}>
        <torusGeometry args={[spec.radius, spec.tube, segments[0], segments[1]]} />
        <meshStandardMaterial
          color={spec.color}
          emissive={spec.color}
          emissiveIntensity={1.5}
          roughness={0.25}
          metalness={0.65}
          transparent
          opacity={spec.opacity}
          // Мимо тонмаппинга — иначе тонкая линия тускнеет и bloom её не видит.
          toneMapped={false}
        />
      </mesh>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------- кристалл --- */

export default function Crystal({ tier }: { tier: QualityTier }) {
  const high = tier === 'high';

  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const coreMaterial = useRef<THREE.MeshStandardMaterial>(null!);

  const pointer = usePointerTarget();
  const eased = useRef({ x: 0, y: 0 });

  const { viewport } = useThree();

  // Геометрию оболочки делят два меша (стекло и каркас), поэтому R3F её
  // автоматически не освобождает — убираем руками при размонтировании.
  const shellGeometry = useMemo(() => makeCrystalGeometry(1.15, 0.3), []);
  useEffect(() => () => shellGeometry.dispose(), [shellGeometry]);

  // Канвас растянут на всю секцию героя, объект стоит ровно по центру — за
  // контентом, а не за карточкой с фото. Масштаб считаем от меньшей стороны
  // вьюпорта, иначе на вытянутых экранах кольца вылезают за границы секции.
  const scale = useMemo(
    () =>
      THREE.MathUtils.clamp(
        Math.min(viewport.width, viewport.height) / (viewport.aspect > 1.15 ? 8.7 : 7.8),
        0.45,
        1.1,
      ),
    [viewport],
  );

  useFrame((state, delta) => {
    // Клампим dt: после возврата на вкладку первый кадр приходит с огромной
    // дельтой и объект телепортируется.
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const k = Math.min(d * 2.5, 1);

    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;

    const g = group.current;

    // Непрерывное вращение + доворот за курсором.
    g.rotation.y = t * 0.16 + eased.current.x * 0.4;
    g.rotation.x = Math.sin(t * 0.22) * 0.07 + eased.current.y * 0.26;
    g.rotation.z = Math.sin(t * 0.17) * 0.04;

    // Левитация: вертикальный синус + лёгкий боковой снос за курсором.
    g.position.y = Math.sin(t * 0.55) * 0.16;
    g.position.x = eased.current.x * 0.18;

    // Пульс ядра — «сердцебиение» под стеклом.
    const pulse = Math.sin(t * 1.3);
    core.current.scale.setScalar(0.52 + pulse * 0.018);
    coreMaterial.current.emissiveIntensity = 2.4 + pulse * 0.5;
  });

  return (
    <group ref={group} scale={scale}>
      <Glow />

      {/* Внешняя оболочка. На high — стекло с преломлением и иридесценцией,
          на low — металл: transmission рендерит сцену во второй буфер, для
          слабых устройств это самая дорогая строчка во всей сцене. */}
      <mesh geometry={shellGeometry} raycast={() => null}>
        {high ? (
          <meshPhysicalMaterial
            color="#dbe4ff"
            transmission={0.92}
            thickness={1.4}
            ior={1.7}
            roughness={0.06}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.08}
            iridescence={0.8}
            iridescenceIOR={1.35}
            iridescenceThicknessRange={[100, 520]}
            attenuationColor="#4f6bff"
            attenuationDistance={2.4}
            emissive="#2b6bff"
            emissiveIntensity={0.12}
            envMapIntensity={1.5}
            flatShading
          />
        ) : (
          <meshPhysicalMaterial
            color="#9fb4ff"
            metalness={0.95}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.15}
            emissive="#1e4fd6"
            emissiveIntensity={0.35}
            envMapIntensity={1.2}
            flatShading
          />
        )}
      </mesh>

      {/* Светящееся ядро — источник «синего эмиссивного свечения» и главный
          донор яркости для bloom. */}
      <mesh ref={core} scale={0.52} raycast={() => null}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          ref={coreMaterial}
          color="#0b1230"
          emissive="#3b7dff"
          emissiveIntensity={2.4}
          roughness={0.4}
          metalness={0.2}
          flatShading
          toneMapped={false}
        />
      </mesh>

      {/* Каркас поверх оболочки — техничная «сетка огранки». */}
      {high && (
        <mesh geometry={shellGeometry} scale={1.008} raycast={() => null}>
          <meshBasicMaterial
            color="#8fb0ff"
            wireframe
            transparent
            opacity={0.22}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {(high ? RINGS : RINGS.slice(0, 2)).map((spec, i) => (
        <Ring key={spec.radius} spec={spec} segments={high ? [8, 160] : [6, 96]}>
          {/* Спутник на первом кольце: лежит в системе координат кольца,
              поэтому катится по орбите вместе с ним без своей анимации. */}
          {high && i === 0 && (
            <mesh position={[spec.radius, 0, 0]} raycast={() => null}>
              <sphereGeometry args={[0.05, 16, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#9cc0ff"
                emissiveIntensity={3}
                toneMapped={false}
              />
            </mesh>
          )}
        </Ring>
      ))}
    </group>
  );
}
