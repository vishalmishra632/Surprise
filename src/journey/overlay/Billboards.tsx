import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '../billboards';
import { registerBillboard, unregisterBillboard } from '../billboardRegistry';
import { useJourneyStore } from '../store';
import { BillboardCover } from './BillboardCover';
import type { ChapterSpec } from '../types';

function Billboard({ spec }: { spec: ChapterSpec }) {
  const elRef = useRef<HTMLButtonElement>(null);
  const openDetail = useJourneyStore((s) => s.openDetail);
  const [isPeak, setIsPeak] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    registerBillboard(spec.id, el);

    const sync = () => setIsPeak(el.dataset.peak === '1');
    el.addEventListener('peak-change', sync);
    sync();

    return () => {
      unregisterBillboard(spec.id);
      el.removeEventListener('peak-change', sync);
    };
  }, [spec.id]);

  const cover = spec.media[0];
  const hasCover = !!cover;
  const className = `board${spec.big ? ' big' : ''} board--${hasCover ? 'photo' : 'text'}${
    spec.specialMoment ? ' is-special' : ''
  }`;

  return (
    <button
      ref={elRef}
      type="button"
      id={spec.id}
      className={className}
      onClick={() => openDetail(spec.id)}
    >
      <span className="board-post" aria-hidden="true">
        <span className="board-post-line" />
        <span className="board-post-line" />
      </span>

      {hasCover && (
        <span className="board-frame">
          <BillboardCover chapter={spec} visible={isPeak} />
        </span>
      )}

      <span className="board-plate">
        <span className="board-title">{spec.title}</span>
        {spec.date && <span className="board-date">{spec.date}</span>}
        {spec.caption && <span className="board-caption">{spec.caption}</span>}
        <span className="board-cta">Open ↗</span>
      </span>
    </button>
  );
}

export function Billboards() {
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  if (gateOpen) return null;
  return (
    <>
      {CHAPTERS.map((spec) => (
        <Billboard key={spec.id} spec={spec} />
      ))}
    </>
  );
}
