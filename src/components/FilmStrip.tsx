import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import MediaFallback from './MediaFallback';

type FilmStripProps = {
  images: string[];
  /** Pause when scene is not active. */
  active: boolean;
};

const FRAME_WIDTH = 280;
const FRAME_HEIGHT = 360;
const FRAME_GAP = 14;

function FilmFrame({ src, index }: { src?: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const yOffset = (index % 2 === 0 ? 0 : 14) + (index % 3 === 0 ? -6 : 0);
  const rotate = ((index % 5) - 2) * 0.6;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        marginRight: FRAME_GAP,
        marginTop: yOffset,
        transform: `rotate(${rotate}deg)`,
        background: '#13131c',
        padding: 12,
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.42), 0 0 0 1px rgba(244,235,216,0.10)',
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: '#0a0a12' }}
      >
        {src && !failed ? (
          <img
            src={src}
            alt={`memory ${index + 1}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full"
            style={{
              objectFit: 'cover',
              filter: 'contrast(1.02) saturate(0.92) brightness(0.96) sepia(0.04)',
            }}
          />
        ) : (
          <MediaFallback />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.18)' }}
        />
      </div>
      <div
        className="mt-2 flex items-center justify-between font-mono uppercase"
        style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(244,235,216,0.55)' }}
      >
        <span>{String(index + 1).padStart(2, '0')} / {String(FRAME_HEIGHT)[0]}8</span>
        <span style={{ color: 'var(--champagne)' }}>us</span>
      </div>
    </div>
  );
}

export default function FilmStrip({ images, active }: FilmStripProps) {
  const controls = useAnimationControls();

  const frames = useMemo(
    () => (images.length > 0 ? images : Array.from<string | undefined>({ length: 8 })),
    [images],
  );
  const doubled = useMemo(() => [...frames, ...frames], [frames]);

  useEffect(() => {
    if (!active) {
      controls.stop();
      return;
    }
    void controls.start({
      x: '-50%',
      transition: { duration: 60, ease: 'linear', repeat: Infinity },
    });
  }, [controls, active]);

  return (
    <div className="relative w-full overflow-hidden py-10">
      <motion.div
        className="flex w-max items-start"
        animate={controls}
        initial={{ x: '0%' }}
      >
        {doubled.map((src, index) => (
          <FilmFrame key={`${src ?? 'fallback'}-${index}`} src={src} index={index} />
        ))}
      </motion.div>

      {/* Edge fades — sells the cinema feel */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-32"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-32"
        style={{
          background:
            'linear-gradient(270deg, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0) 100%)',
        }}
      />
    </div>
  );
}
