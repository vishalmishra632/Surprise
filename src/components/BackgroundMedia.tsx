import { useEffect, useState } from 'react';
import MediaFallback from './MediaFallback';

type BackgroundMediaProps = {
  videoSrc?: string;
  imageSrc?: string;
  label?: string;
  /** 0..1 — how dark the overlay should be on top. */
  overlayOpacity?: number;
  /** Tint the overlay (defaults to ink/midnight gradient). */
  overlayTint?: 'ink' | 'gold' | 'rose';
  active: boolean;
};

const TINTS: Record<NonNullable<BackgroundMediaProps['overlayTint']>, string> = {
  ink: 'linear-gradient(180deg, rgba(8,8,15,0.55) 0%, rgba(8,8,15,0.92) 100%)',
  gold:
    'linear-gradient(180deg, rgba(212,175,55,0.10) 0%, rgba(8,8,15,0.85) 70%, rgba(8,8,15,0.95) 100%)',
  rose:
    'linear-gradient(180deg, rgba(232,168,185,0.08) 0%, rgba(8,8,15,0.85) 70%, rgba(8,8,15,0.95) 100%)',
};

/**
 * Cinematic full-bleed background.
 * - Videos play muted and only when the scene is active (saves CPU on projector).
 * - Images use object-fit cover with a slow Ken-Burns scale.
 * - If both are missing, falls back to a luxe gradient placeholder.
 */
export default function BackgroundMedia({
  videoSrc,
  imageSrc,
  label = 'Memory',
  overlayOpacity = 0.6,
  overlayTint = 'ink',
  active,
}: BackgroundMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // We use a ref via callback so we don't re-render the video each tick.
  useEffect(() => {
    const v = document.querySelector<HTMLVideoElement>(
      `video[data-bg-id="${label}"]`,
    );
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, label]);

  const showVideo = !!videoSrc && !videoFailed;
  const showImage = !showVideo && !!imageSrc && !imageFailed;

  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      {showVideo ? (
        <video
          data-bg-id={label}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="h-full w-full"
          style={{
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
          }}
        />
      ) : showImage ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full"
          style={{
            objectFit: 'cover',
            transform: active ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 12s linear',
          }}
        />
      ) : (
        <MediaFallback className="absolute inset-0" label={label} />
      )}

      {/* dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: TINTS[overlayTint],
          opacity: overlayOpacity,
        }}
      />
      {/* a faint vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  );
}
