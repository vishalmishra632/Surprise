import { useEffect, useRef } from 'react';

export type MousePointer = { x: number; y: number; clientX: number; clientY: number };

const sharedRef: { current: MousePointer } = {
  current: { x: 0, y: 0, clientX: 0, clientY: 0 },
};
let listenerAttached = false;

function ensureListener(): void {
  if (listenerAttached || typeof window === 'undefined') return;
  listenerAttached = true;
  window.addEventListener('pointermove', (e) => {
    sharedRef.current = {
      x: e.clientX / window.innerWidth - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
      clientX: e.clientX,
      clientY: e.clientY,
    };
  });
}

export function useMousePointer(): { current: MousePointer } {
  const ref = useRef(sharedRef.current);
  useEffect(() => {
    ensureListener();
  }, []);
  ref.current = sharedRef.current;
  return sharedRef;
}
