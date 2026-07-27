'use client';

import { useEffect, useRef } from 'react';

/**
 * Нормализованная позиция курсора в диапазоне [-1, 1] по обеим осям.
 *
 * Слушаем window, а не канвас: канвас лежит под контентом героя и с
 * `pointer-events: none`, своих указательных событий он не получает.
 * Значение отдаём через ref — курсор двигается сотни раз в секунду, и
 * перерисовывать на это React-дерево не нужно, кадр всё равно читает ref.
 */
export function usePointerTarget() {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // На тач-устройствах «следования за курсором» не бывает: единственный
    // pointermove — это тап, от которого объект дёрнулся бы и замер.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return target;
}
