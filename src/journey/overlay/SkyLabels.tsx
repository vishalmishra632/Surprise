import { useEffect, useRef } from 'react';
import { SKY_LABELS } from '../billboards';
import { useJourneyStore } from '../store';

export function SkyLabels() {
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    return useJourneyStore.subscribe((state) => {
      const p = state.progress;
      for (const label of SKY_LABELS) {
        const el = refs.current.get(label.id);
        if (!el) continue;
        const visible = p >= label.from && p <= label.to;
        el.classList.toggle('on', visible);
      }
    });
  }, []);

  return (
    <>
      {SKY_LABELS.map((label) => (
        <div
          key={label.id}
          ref={(el) => {
            if (el) refs.current.set(label.id, el);
            else refs.current.delete(label.id);
          }}
          className="skylabel"
          style={{ left: '50%', top: '24%' }}
        >
          {label.label}
        </div>
      ))}
    </>
  );
}
