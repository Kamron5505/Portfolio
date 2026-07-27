/**
 * Определение «весовой категории» устройства перед запуском тяжёлой WebGL-сцены.
 *
 *  high — десктоп с дискретной/нормальной графикой: стекло с transmission,
 *         три орбитальных кольца, плотное поле частиц, bloom.
 *  low  — мобильные, слабые ноутбуки, мало ядер/памяти: металл вместо стекла,
 *         два кольца, разреженные частицы, без пост-обработки.
 *  off  — сцену не поднимаем вовсе (нет WebGL2, программный рендерер,
 *         экономия трафика или prefers-reduced-motion) — показываем
 *         статичную CSS-заглушку.
 *
 * Вызывать только на клиенте: детект опирается на WebGL-контекст и
 * navigator-подсказки, которых нет при SSR.
 */

export type QualityTier = 'high' | 'low' | 'off';

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

// Программные рендереры (CI, VM, машины без драйверов) тянут 3D на единицы
// кадров — там сцена вредна в любом качестве.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'off';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';

  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return 'off';

  const canvas = document.createElement('canvas');

  // Сначала просим контекст с запретом «серьёзных просадок»: так драйвер сам
  // откажет, если рисовать будет процессор. Если отказал — пробуем ещё раз без
  // флага, чтобы отличить реально софтовый рендер от ложного срабатывания.
  let strict = true;
  let gl = canvas.getContext('webgl2', {
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'high-performance',
  }) as WebGL2RenderingContext | null;

  if (!gl) {
    strict = false;
    gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  }
  if (!gl) return 'off';

  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debug
    ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? '')
    : '';

  // Пробный контекст больше не нужен — освобождаем слот сразу, их у браузера
  // всего ~16 на вкладку.
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  if (SOFTWARE_RENDERER.test(renderer)) return 'off';
  if (!strict) return 'low';

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 4 || memory <= 4) return 'low';

  // Тач-устройства и узкие экраны: даже флагманский телефон греется от
  // transmission + bloom, а сцена там всё равно вспомогательный фон.
  if (window.matchMedia('(pointer: coarse)').matches) return 'low';
  if (window.innerWidth < 1024) return 'low';

  return 'high';
}
