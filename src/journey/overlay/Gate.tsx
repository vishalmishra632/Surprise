import { useJourneyStore } from '../store';

const BRAND = 'Vanshika';

export function Gate() {
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  const openGate = useJourneyStore((s) => s.openGate);

  return (
    <div
      className={`gate ${gateOpen ? '' : 'off'}`}
      role="dialog"
      aria-modal={gateOpen ? 'true' : 'false'}
      aria-label="A road for Vanshika"
      aria-hidden={gateOpen ? 'false' : 'true'}
    >
      <div className="gate-kicker">A road through us · since the first hello</div>
      <div className="gate-mark" aria-hidden="true">
        {BRAND.split('').map((letter, i) => (
          <span key={`${letter}-${i}`} style={{ animationDelay: `${i * 0.06}s` }}>
            {letter}
          </span>
        ))}
      </div>
      <div className="gate-line" />
      <button type="button" className="gate-enter" onClick={openGate}>
        Walk the road
      </button>
      <div className="gate-meta">
        <span>For Vanshika · with all of me</span>
        <span>scroll to walk · billboards remember</span>
      </div>
    </div>
  );
}
