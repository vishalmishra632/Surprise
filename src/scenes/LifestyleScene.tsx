import { motion } from 'framer-motion';
import { useState } from 'react';
import MediaFallback from '../components/MediaFallback';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { lifestyleScene, memoryAssets } from '../data/loveStory';
import type { LifestyleTile } from '../data/loveStory';

type Props = { active: boolean };

function Tile({ tile, index }: { tile: LifestyleTile; index: number }) {
  const [failed, setFailed] = useState(false);
  const image = memoryAssets[tile.folder].images[0];
  const hasImage = !!image && !failed;

  return (
    <motion.div
      className="group relative overflow-hidden"
      style={{
        borderRadius: 6,
        border: '1px solid rgba(244,235,216,0.10)',
        boxShadow:
          '0 24px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(244,235,216,0.04)',
        background: '#13131c',
        aspectRatio: '4 / 3',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.85,
        delay: 0.1 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      {hasImage ? (
        <img
          src={image}
          alt={tile.label}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full transition-transform duration-700"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <MediaFallback className="absolute inset-0" label={tile.label} />
      )}

      {/* readable overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,8,15,0.10) 0%, rgba(8,8,15,0.20) 50%, rgba(8,8,15,0.85) 100%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: 4,
            color: 'var(--champagne)',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div>
          <h3
            className="font-display italic"
            style={{
              fontSize: 'clamp(1.4rem, 2.4vw, 2rem)',
              color: 'var(--cream)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
            }}
          >
            {tile.label}
          </h3>
          <p
            className="mt-1 font-display italic"
            style={{
              fontSize: 14,
              color: 'rgba(244,235,216,0.72)',
            }}
          >
            {tile.caption}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LifestyleScene(_: Props) {
  void _;
  return (
    <SceneWrapper id="lifestyle" ariaLabel="Lifestyle">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, #14141e 0%, #0a0a12 60%, #050509 100%)',
        }}
      />

      <div className="relative z-10 mx-auto flex h-screen max-w-7xl flex-col px-8 py-10 sm:px-14">
        <MemoryPanel
          eyebrow="Chapter VI · The Life We Built"
          title={lifestyleScene.heading}
          scriptTitle="our shared world"
        />

        <div className="mt-8 grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {lifestyleScene.tiles.map((tile, i) => (
            <Tile key={tile.label} tile={tile} index={i} />
          ))}
        </div>

        <p
          className="mt-6 font-display italic"
          style={{
            fontSize: 'clamp(1.05rem, 1.7vw, 1.35rem)',
            color: 'rgba(244,235,216,0.78)',
            textAlign: 'center',
          }}
        >
          {lifestyleScene.quote}
        </p>
      </div>
    </SceneWrapper>
  );
}
