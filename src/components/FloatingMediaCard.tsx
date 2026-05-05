import { motion } from 'framer-motion';
import { useState } from 'react';
import MediaFallback from './MediaFallback';

type FloatingMediaCardProps = {
  src?: string;
  caption?: string;
  rotate?: number;
  width?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * A glassy media card for floating in scenes (Varanasi, Jaipur, etc.).
 * Slow float on a sine, hover lift, accent inner ring.
 */
export default function FloatingMediaCard({
  src,
  caption,
  rotate = 0,
  width = 240,
  delay = 0,
  className = '',
  style,
}: FloatingMediaCardProps) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.figure
      className={`relative ${className}`}
      style={{
        width,
        background: '#13131c',
        padding: 10,
        borderRadius: 4,
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.42), 0 0 0 1px rgba(244,235,216,0.10)',
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{ y: -8, scale: 1.04, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18,
        delay,
      }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 7 + (delay % 2),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: '4 / 3',
            background: '#0a0a12',
            borderRadius: 2,
          }}
        >
          {src && !failed ? (
            <img
              src={src}
              alt={caption ?? 'memory'}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
              className="h-full w-full"
              style={{
                objectFit: 'cover',
                filter: 'contrast(0.98) saturate(0.95)',
              }}
            />
          ) : (
            <MediaFallback label={caption ?? 'Memory'} />
          )}
          {/* gold inner rim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.18)' }}
          />
        </div>
        {caption ? (
          <figcaption
            className="mt-3 text-center font-display italic"
            style={{
              fontSize: 14,
              color: 'rgba(244,235,216,0.78)',
            }}
          >
            {caption}
          </figcaption>
        ) : null}
      </motion.div>
    </motion.figure>
  );
}
