import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useJourneyStore } from '../store';

const HEART_COLOURS = [
  '#e8a8b9',
  '#c7869b',
  '#d4af37',
  '#f6c8c0',
  '#ff6b8a',
  '#fbd9cb',
];

function fireSmallHearts(): void {
  const heart = confetti.shapeFromText({ text: '♥', scalar: 2.5 });
  confetti({
    shapes: [heart],
    particleCount: 36,
    spread: 80,
    startVelocity: 38,
    decay: 0.92,
    colors: HEART_COLOURS,
    origin: { x: Math.random() * 0.4 + 0.3, y: 0.7 },
    gravity: 0.7,
    scalar: 2,
    ticks: 360,
  });
}

function fireBigBurst(): void {
  const heart = confetti.shapeFromText({ text: '♥', scalar: 3 });
  [0.18, 0.5, 0.82].forEach((x, i) => {
    window.setTimeout(() => {
      confetti({
        shapes: [heart],
        particleCount: 90,
        spread: 110,
        startVelocity: 55,
        decay: 0.9,
        colors: HEART_COLOURS,
        origin: { x, y: 0.85 },
        gravity: 0.7,
        scalar: 2.6,
        ticks: 380,
      });
    }, i * 220);
  });
}

function ProposalCloud({ className }: { className: string }) {
  return (
    <svg
      className={`proposal-cloud ${className}`}
      viewBox="0 0 120 70"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="proposal-cloud-fill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#fbeef0" />
          <stop offset="100%" stopColor="#e8c4cf" />
        </radialGradient>
      </defs>
      <g fill="url(#proposal-cloud-fill)">
        <ellipse cx="32" cy="42" rx="22" ry="18" />
        <ellipse cx="58" cy="30" rx="26" ry="22" />
        <ellipse cx="86" cy="40" rx="22" ry="18" />
        <ellipse cx="60" cy="50" rx="34" ry="14" />
      </g>
    </svg>
  );
}

function Billboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="proposal-billboard" aria-hidden="false">
      <div className="proposal-billboard-ghost">forever</div>
      <div className="proposal-billboard-board">{children}</div>
      <div className="proposal-billboard-poles">
        <span />
        <span />
      </div>
    </div>
  );
}


function VVLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`proposal-logo ${className}`}
      aria-label="Vishal and Vanshika monogram"
    >
      <defs>
        <linearGradient id="proposal-logo-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C0956C" />
          <stop offset="55%" stopColor="#E8A0B4" />
          <stop offset="100%" stopColor="#C0956C" />
        </linearGradient>
        <linearGradient id="proposal-logo-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDF6EC" />
          <stop offset="100%" stopColor="#F9C4D2" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="url(#proposal-logo-fill)"
        stroke="url(#proposal-logo-stroke)"
        strokeWidth="1.4"
        opacity="0.95"
      />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="url(#proposal-logo-stroke)"
        strokeWidth="0.6"
        opacity="0.55"
      />
      <path
        d="M100 138 C 70 118 56 106 58 88 C 60 76 70 68 80 70 C 88 71 94 76 100 84 C 106 76 112 71 120 70 C 130 68 140 76 142 88 C 144 106 130 118 100 138 Z"
        fill="url(#proposal-logo-stroke)"
        opacity="0.85"
      />
      <text
        x="100"
        y="56"
        textAnchor="middle"
        fontSize="22"
        letterSpacing="6"
        fill="#C0956C"
        opacity="0.85"
        fontFamily="'Playfair Display', Georgia, serif"
        fontStyle="italic"
      >
        V &amp; V
      </text>
      <text
        x="100"
        y="172"
        textAnchor="middle"
        fontSize="9"
        letterSpacing="6"
        fill="#C0956C"
        opacity="0.7"
        fontFamily="'Inter', sans-serif"
      >
        EST · 26 · 04 · 2026
      </text>
    </svg>
  );
}

export function ProposalScene() {
  const progress = useJourneyStore((s) => s.progress);
  const gateOpen = useJourneyStore((s) => s.gateOpen);
  const [accepted, setAccepted] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const burstTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!accepted) return;
    fireBigBurst();
    burstTimer.current = window.setInterval(fireSmallHearts, 1600);
    return () => {
      if (burstTimer.current !== null) window.clearInterval(burstTimer.current);
    };
  }, [accepted]);

  const fadeStart = 0.978;
  const fadeEnd = 0.992;
  const opacity =
    progress < fadeStart
      ? 0
      : progress >= fadeEnd
        ? 1
        : (progress - fadeStart) / (fadeEnd - fadeStart);

  if (gateOpen || opacity === 0) return null;

  const isInteractive = opacity > 0.7;

  const dodgeNo = (e?: React.SyntheticEvent) => {
    e?.preventDefault?.();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dx = (Math.random() - 0.5) * Math.min(w * 0.7, 720);
    const dy = (Math.random() - 0.5) * Math.min(h * 0.5, 360);
    setNoPos({ x: dx, y: dy });
  };

  return (
    <div
      className="proposal"
      style={{ opacity, pointerEvents: isInteractive ? 'auto' : 'none' }}
      role="dialog"
      aria-label="A question for Vanshika"
    >
      <div className="proposal-bg" aria-hidden="true">
        <div className="proposal-sky" />
        <div className="proposal-road" />
      </div>

      <ProposalCloud className="cloud-a" />
      <ProposalCloud className="cloud-b" />
      <ProposalCloud className="cloud-c" />
      <ProposalCloud className="cloud-d" />

      {!accepted ? (
        <div className="proposal-question">
          <div className="proposal-stage">
            <Billboard>
              <h1 className="proposal-text">
                Will you be my <em>Forever</em>?
              </h1>
              <span className="proposal-billboard-heart" aria-hidden="true">
                ♥
              </span>
            </Billboard>

            <div className="proposal-couple">
              <img
                src="/proposal/couple.png"
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </div>
          </div>

          <div className="proposal-buttons">
            <button
              type="button"
              className="proposal-btn proposal-btn-yes"
              onClick={() => setAccepted(true)}
              aria-label="Yes"
            >
              <span className="proposal-btn-heart">♥</span>
              <span>YES</span>
            </button>

            <button
              ref={noBtnRef}
              type="button"
              className="proposal-btn proposal-btn-no"
              style={{
                transform: `translate(${noPos.x.toFixed(0)}px, ${noPos.y.toFixed(0)}px)`,
              }}
              onMouseEnter={dodgeNo}
              onFocus={dodgeNo}
              onTouchStart={dodgeNo}
              onClick={dodgeNo}
              aria-label="No (good luck catching me)"
            >
              NO
            </button>
          </div>

          <VVLogo className="proposal-logo-mark" />
        </div>
      ) : (
        <div className="proposal-accepted">
          <VVLogo className="is-big" />
          <h1 className="proposal-yes-text">She said yes</h1>
          <div className="proposal-yes-sub">forever begins now · 26 · 04 · 2026</div>
        </div>
      )}
    </div>
  );
}
