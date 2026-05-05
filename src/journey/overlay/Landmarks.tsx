import { useEffect, useRef } from 'react';
import { CHAPTERS } from '../billboards';
import { registerLandmark, unregisterLandmark } from '../landmarkRegistry';
import { useJourneyStore } from '../store';
import { LandmarkSvg } from './LandmarkSvgs';
import type { ChapterSpec } from '../types';

function Landmark({ spec }: { spec: ChapterSpec }) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    registerLandmark(spec.id, el);
    return () => unregisterLandmark(spec.id);
  }, [spec.id]);

  if (!spec.landmark) return null;

  return (
    <div ref={elRef} className={`landmark landmark--${spec.landmark}`} aria-hidden="true">
      <LandmarkSvg kind={spec.landmark} />
    </div>
  );
}

export function Landmarks() {
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  if (gateOpen) return null;
  return (
    <>
      {CHAPTERS.filter((c) => !!c.landmark).map((spec) => (
        <Landmark key={spec.id} spec={spec} />
      ))}
    </>
  );
}
