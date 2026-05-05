import { useEffect, useState } from 'react';
import { useJourneyStore } from '../store';

const SHOW_DELAY_MS = 800;
const BOB_AT_MS = 4000;
const PULSE_AT_MS = 10000;

export function Prompt() {
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  const [shown, setShown] = useState(false);
  const [bob, setBob] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (gateOpen) {
      setShown(false);
      setBob(false);
      setPulse(false);
      return;
    }
    const t = window.setTimeout(() => setShown(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [gateOpen]);

  useEffect(() => {
    if (!shown) return;
    const bobTimer = window.setTimeout(() => setBob(true), BOB_AT_MS);
    const pulseTimer = window.setTimeout(() => setPulse(true), PULSE_AT_MS);
    return () => {
      window.clearTimeout(bobTimer);
      window.clearTimeout(pulseTimer);
    };
  }, [shown]);

  useEffect(() => {
    if (!shown) return;
    return useJourneyStore.subscribe((state) => {
      if (state.progress > 0.01) {
        setShown(false);
        setBob(false);
        setPulse(false);
      }
    });
  }, [shown]);

  const className =
    'prompt' +
    (shown ? ' show' : '') +
    (bob ? ' bob' : '') +
    (pulse ? ' pulse' : '');

  return <div className={className}>scroll to walk</div>;
}
