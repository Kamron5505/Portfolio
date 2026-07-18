'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Interactive hero visual: a hollow sphere built from instanced voxels that
 * slowly rotates, floats, and tilts toward the pointer with a soft parallax.
 *
 * Three.js is loaded on demand (client-only chunk) so it never blocks the
 * initial bundle or runs during SSR. Rendering pauses while the section is
 * off-screen or the tab is hidden; `prefers-reduced-motion` gets one static
 * frame with no listeners.
 */

// Deterministic pseudo-random from a 3D grid cell, so the voxel dropout
// pattern is stable across renders and hydration.
function hash3(x: number, y: number, z: number): number {
  let h = x * 374761393 + y * 668265263 + z * 2147483647;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export default function VoxelSphere({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import('three');
      if (disposed || !hostRef.current) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        38,
        host.clientWidth / Math.max(host.clientHeight, 1),
        0.1,
        100
      );
      camera.position.set(0, 0, 33);

      scene.add(new THREE.AmbientLight(0x8b7cf6, 0.55));
      const key = new THREE.DirectionalLight(0xc4b5fd, 2.2);
      key.position.set(6, 10, 8);
      scene.add(key);
      const rim = new THREE.PointLight(0x6366f1, 60, 60);
      rim.position.set(-10, -6, 6);
      scene.add(rim);

      // Build the voxel shell: keep grid cells whose distance to the origin
      // falls inside a ~2-voxel-thick spherical band, with light dropout for
      // a digital, slightly eroded surface.
      const R = 7;
      const cells: { x: number; y: number; z: number; d: number }[] = [];
      for (let x = -R; x <= R; x++) {
        for (let y = -R; y <= R; y++) {
          for (let z = -R; z <= R; z++) {
            const d = Math.sqrt(x * x + y * y + z * z);
            if (d < R - 1.7 || d > R + 0.3) continue;
            if (hash3(x, y, z) < 0.12) continue;
            cells.push({ x, y, z, d });
          }
        }
      }

      const geometry = new THREE.BoxGeometry(0.78, 0.78, 0.78);
      const material = new THREE.MeshStandardMaterial({
        roughness: 0.35,
        metalness: 0.45,
      });
      const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      // Purple gradient across the sphere with rare cyan sparks that echo
      // the site's secondary accent.
      const deep = new THREE.Color('#4c3aad');
      const light = new THREE.Color('#a78bfa');
      const spark = new THREE.Color('#22d3ee');
      const tmpColor = new THREE.Color();
      const dummy = new THREE.Object3D();
      const phases = new Float32Array(cells.length);

      cells.forEach((c, i) => {
        dummy.position.set(c.x, c.y, c.z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        const n = hash3(c.z, c.x, c.y);
        if (n > 0.975) {
          mesh.setColorAt(i, spark);
        } else {
          const t = THREE.MathUtils.clamp((c.y + R) / (2 * R) * 0.7 + n * 0.3, 0, 1);
          mesh.setColorAt(i, tmpColor.copy(deep).lerp(light, t));
        }
        phases[i] = c.d * 0.9 + n * Math.PI * 2;
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      const group = new THREE.Group();
      group.add(mesh);
      group.rotation.set(0.35, -0.5, 0);
      scene.add(group);

      // Pointer parallax targets, eased in the render loop. Listening on
      // window (not the canvas) keeps the effect alive across the whole hero.
      let targetX = 0;
      let targetY = 0;
      let pointerX = 0;
      let pointerY = 0;
      const onPointerMove = (e: PointerEvent) => {
        targetX = (e.clientX / window.innerWidth) * 2 - 1;
        targetY = (e.clientY / window.innerHeight) * 2 - 1;
      };

      let raf = 0;
      let running = false;
      let last = performance.now();
      let elapsed = 0;

      const renderFrame = (dt: number) => {
        elapsed += dt;
        pointerX += (targetX - pointerX) * Math.min(dt * 4, 1);
        pointerY += (targetY - pointerY) * Math.min(dt * 4, 1);

        group.rotation.y = -0.5 + elapsed * 0.12 + pointerX * 0.3;
        group.rotation.x = 0.35 + pointerY * 0.22;
        group.position.y = Math.sin(elapsed * 0.7) * 0.5;

        camera.position.x = pointerX * 1.4;
        camera.position.y = -pointerY * 1.0;
        camera.lookAt(0, 0, 0);

        // Gentle surface "breathing": each voxel scales on its own phase.
        const pulse = elapsed * 1.3;
        for (let i = 0; i < cells.length; i++) {
          const c = cells[i];
          const s = 0.88 + 0.12 * Math.sin(pulse + phases[i]);
          dummy.position.set(c.x, c.y, c.z);
          dummy.scale.setScalar(s);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;

        renderer.render(scene, camera);
      };

      const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        renderFrame(dt);
        raf = requestAnimationFrame(loop);
      };

      const start = () => {
        if (running || reduceMotion) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      };
      const stop = () => {
        if (!running) return;
        running = false;
        cancelAnimationFrame(raf);
      };

      const onResize = () => {
        const w = host.clientWidth;
        const h = Math.max(host.clientHeight, 1);
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (reduceMotion) renderFrame(0);
      };
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(host);

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0.05 }
      );
      intersectionObserver.observe(host);

      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener('visibilitychange', onVisibility);
      if (!reduceMotion) window.addEventListener('pointermove', onPointerMove);

      renderFrame(0);
      setReady(true);

      cleanup = () => {
        stop();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pointermove', onPointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`pointer-events-none transition-opacity duration-700 ${className}`}
      style={ready ? undefined : { opacity: 0 }}
    />
  );
}
