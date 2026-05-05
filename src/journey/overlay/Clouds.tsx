import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useJourneyStore } from '../store';

type CloudSpec = {
  id: string;
  x: number;
  y: number;
  scale: number;
  drift: number;
  parallax: number;
  delay: number;
  message: string;
};

const CLOUDS: CloudSpec[] = [
  { id: 'c1', x: 14, y: 14, scale: 1.0, drift: 8, parallax: 24, delay: 0, message: 'every road feels lighter with you' },
  { id: 'c2', x: 78, y: 9, scale: 1.3, drift: 11, parallax: 18, delay: 1.2, message: 'I would choose you again, in every life' },
  { id: 'c3', x: 38, y: 22, scale: 0.85, drift: 6, parallax: 32, delay: 2.4, message: 'you are my favourite road' },
  { id: 'c4', x: 64, y: 28, scale: 1.1, drift: 9, parallax: 22, delay: 3.6, message: 'I love your laugh, today and always' },
  { id: 'c5', x: 22, y: 32, scale: 0.95, drift: 7, parallax: 28, delay: 4.8, message: 'every yes I will ever say is yours' },
];

const HEART_COLOURS = ['#e8a8b9', '#c7869b', '#d4af37', '#f6c8c0', '#fbd9cb'];

function CloudSvg() {
  return (
    <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
          <stop offset="60%" stopColor="rgba(255,235,240,0.9)" />
          <stop offset="100%" stopColor="rgba(232,212,232,0.7)" />
        </linearGradient>
      </defs>
      <g fill="url(#cloudGrad)">
        <ellipse cx="36" cy="44" rx="26" ry="20" />
        <ellipse cx="68" cy="34" rx="32" ry="24" />
        <ellipse cx="100" cy="42" rx="24" ry="18" />
        <ellipse cx="54" cy="48" rx="22" ry="15" />
        <ellipse cx="86" cy="48" rx="20" ry="13" />
      </g>
    </svg>
  );
}

function Cloud({ cloud, scrollOffset }: { cloud: CloudSpec; scrollOffset: number }) {
  const [showMessage, setShowMessage] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);

  const triggerHearts = () => {
    const heart = confetti.shapeFromText({ text: '♥', scalar: 2 });
    confetti({
      shapes: [heart],
      particleCount: 24,
      spread: 65,
      startVelocity: 22,
      decay: 0.92,
      scalar: 1.4,
      colors: HEART_COLOURS,
      origin: {
        x: cloud.x / 100,
        y: Math.max(0.05, cloud.y / 100 + 0.02),
      },
      gravity: 0.55,
      ticks: 240,
    });
    setShowMessage(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowMessage(false), 4200);
  };

  return (
    <button
      type="button"
      className="cloud"
      style={{
        left: `${cloud.x}%`,
        top: `calc(${cloud.y}% - ${(scrollOffset * cloud.parallax).toFixed(1)}px)`,
        // CSS custom properties feed the float keyframes so each cloud
        // bobs at its own amplitude / phase
        ['--cloud-scale' as string]: cloud.scale,
        ['--cloud-drift' as string]: `${cloud.drift}px`,
        ['--cloud-delay' as string]: `${cloud.delay}s`,
      }}
      onClick={triggerHearts}
      aria-label="A small note"
    >
      <span className="cloud-svg">
        <CloudSvg />
      </span>
      {showMessage && (
        <span className="cloud-message" role="status">
          {cloud.message}
        </span>
      )}
    </button>
  );
}

export function Clouds() {
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  const progress = useJourneyStore((s) => s.progress);
  if (gateOpen) return null;
  return (
    <div className="cloud-layer" aria-hidden="false">
      {CLOUDS.map((cloud) => (
        <Cloud key={cloud.id} cloud={cloud} scrollOffset={progress} />
      ))}
    </div>
  );
}
