import { useEffect, useRef, useState } from 'react';
import { useJourneyStore } from '../store';

const SONG_SRC = '/audio/satranga.mp3';
const PEAK_VOLUME = 0.55;
const MUTE_KEY = 'journey-muted';

function readPersistedMute(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistMute(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // localStorage is best-effort — ignore quota / privacy errors
  }
}

export function JourneyAudio() {
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  const detailChapterId = useJourneyStore((s) => s.detailChapterId);
  const reelActive = useJourneyStore((s) => s.reelActive);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRafRef = useRef<number | null>(null);
  const [muted, setMuted] = useState<boolean>(readPersistedMute);

  useEffect(() => persistMute(muted), [muted]);

  const shouldPlay = !gateOpen && !detailChapterId && !muted && !reelActive;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const target = shouldPlay ? PEAK_VOLUME : 0;

    if (shouldPlay && audio.paused) {
      audio.play().catch(() => {
        // The browser may still block playback if the user hasn't tapped
        // anything. The Gate's "Begin" click counts as a gesture, so this
        // usually only fails on the very first hot-reload.
      });
    }

    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }

    const stepPerFrame = 0.025;
    const tick = () => {
      const current = audio.volume;
      const diff = target - current;
      if (Math.abs(diff) <= stepPerFrame) {
        audio.volume = target;
        if (target === 0) audio.pause();
        fadeRafRef.current = null;
        return;
      }
      audio.volume = Math.min(1, Math.max(0, current + Math.sign(diff) * stepPerFrame));
      fadeRafRef.current = requestAnimationFrame(tick);
    };
    fadeRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (fadeRafRef.current !== null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
    };
  }, [shouldPlay]);

  const toggleMute = () => setMuted((current) => !current);

  return (
    <>
      <audio ref={audioRef} src={SONG_SRC} preload="auto" loop />
      {!gateOpen && !reelActive && (
        <button
          type="button"
          className={`journey-mute ${muted ? 'is-muted' : ''}`}
          onClick={toggleMute}
          aria-label={muted ? 'Unmute song' : 'Mute song'}
          aria-pressed={muted}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 9v6h4l5 4V5L9 9H5z"
              fill="currentColor"
            />
            {muted ? (
              <path
                d="M16 9l5 6M21 9l-5 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M16 8.5c1.4 1 2.2 2.2 2.2 3.5s-.8 2.5-2.2 3.5M19 6c2.4 1.6 3.8 3.6 3.8 6s-1.4 4.4-3.8 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </button>
      )}
    </>
  );
}
