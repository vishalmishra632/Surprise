import { motion } from 'framer-motion';
import BackgroundMedia from '../components/BackgroundMedia';
import SceneWrapper from '../components/SceneWrapper';
import { bootLines, bootStatus, identity, memoryAssets } from '../data/loveStory';

type HeroIntroSceneProps = {
  active: boolean;
};

export default function HeroIntroScene({ active }: HeroIntroSceneProps) {
  // Use a calm hero image as ambient backdrop; if missing, the gradient fallback shows.
  const heroImage = memoryAssets.final.images[0];

  return (
    <SceneWrapper id="hero" ariaLabel="Hero intro">
      <BackgroundMedia
        imageSrc={heroImage}
        label="Hero"
        overlayOpacity={0.78}
        overlayTint="ink"
        active={active}
      />

      <div className="relative z-10 flex h-screen w-full items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <motion.div
            className="font-mono uppercase mb-8 inline-flex items-center gap-3"
            style={{
              fontSize: 11,
              letterSpacing: 5,
              color: 'rgba(244,235,216,0.55)',
            }}
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ width: 28, height: 1, background: 'var(--gold)' }} />
            <span>{identity.appName} · BOOT SEQUENCE</span>
          </motion.div>

          <div
            className="font-mono"
            style={{
              fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)',
              lineHeight: 1.85,
              color: 'rgba(244,235,216,0.82)',
            }}
          >
            {bootLines.map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: 0.5 + i * 0.45,
                  ease: 'linear',
                }}
              >
                <span style={{ color: 'var(--gold)', marginRight: 12 }}>{'>'}</span>
                {line}
              </motion.div>
            ))}
            <motion.div
              className="mt-6 text-gradient-gold font-display italic"
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                lineHeight: 1.1,
              }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.9,
                delay: 0.5 + bootLines.length * 0.45 + 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {bootStatus}
            </motion.div>
          </div>

          <motion.div
            className="mt-12 font-mono uppercase flex items-center gap-3"
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: 'rgba(244,235,216,0.55)',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.5 + bootLines.length * 0.45 + 1.0,
            }}
          >
            <span>scroll to explore</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </div>
    </SceneWrapper>
  );
}
