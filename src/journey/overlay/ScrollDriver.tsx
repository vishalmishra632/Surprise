import { useEffect, useRef } from 'react';
import { useJourneyStore } from '../store';

type ScrollDriverProps = {
  heightVh?: number;
};

export function ScrollDriver({ heightVh = 900 }: ScrollDriverProps = {}) {
  const driverRef = useRef<HTMLDivElement>(null);
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);

  useEffect(() => {
    const driver = driverRef.current;
    if (!driver) return;

    const recompute = () => {
      const maxScroll = driver.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setTargetProgress(0);
        return;
      }
      const top = driver.offsetTop;
      const sy = window.scrollY;
      if (sy <= top) {
        setTargetProgress(0);
        return;
      }
      if (sy >= top + maxScroll) {
        setTargetProgress(1);
        return;
      }
      setTargetProgress((sy - top) / maxScroll);
    };

    recompute();
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [setTargetProgress]);

  return <div ref={driverRef} className="driver" style={{ height: `${heightVh}vh` }} />;
}
