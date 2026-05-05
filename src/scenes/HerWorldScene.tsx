import { motion } from 'framer-motion';
import BackgroundMedia from '../components/BackgroundMedia';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { herWorld, memoryAssets } from '../data/loveStory';

type Props = { active: boolean };

const orbitPositions = [
  { left: '8%', top: '24%' },
  { left: '24%', top: '14%' },
  { right: '22%', top: '20%' },
  { right: '8%', top: '38%' },
  { left: '14%', bottom: '22%' },
  { right: '18%', bottom: '18%' },
];

export default function HerWorldScene({ active }: Props) {
  const ambientImage = memoryAssets.noida.images[0] ?? memoryAssets.sister.images[0];

  return (
    <SceneWrapper id="her-world" ariaLabel="Her World">
      <BackgroundMedia
        imageSrc={ambientImage}
        label="Her World"
        overlayOpacity={0.85}
        overlayTint="rose"
        active={active}
      />

      <div className="relative z-10 mx-auto flex h-screen max-w-7xl items-center px-8 py-10 sm:px-14">
        <MemoryPanel
          eyebrow="Chapter II · Her World"
          title="Her World"
          scriptTitle="her gravity"
          body={herWorld.quote}
          align="left"
          className="self-center"
        />

        {/* floating personality cards on the right (lg+) */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          aria-hidden="true"
        >
          {herWorld.cards.map((card, i) => {
            const pos = orbitPositions[i] ?? orbitPositions[0];
            return (
              <motion.div
                key={card.label}
                className="pointer-events-auto absolute"
                style={{ ...pos }}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.85,
                  delay: 0.2 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  className="glass-panel inline-flex flex-col gap-1 px-5 py-3"
                  style={{ borderRadius: 999, minWidth: 220 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 6 + (i % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                >
                  <span
                    className="font-display italic"
                    style={{
                      fontSize: 16,
                      color: 'var(--cream)',
                      lineHeight: 1.05,
                    }}
                  >
                    {card.label}
                  </span>
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color: 'rgba(244,235,216,0.55)',
                    }}
                  >
                    {card.caption}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* mobile / tablet: stack the cards under the panel */}
        <div className="absolute inset-x-8 bottom-10 flex flex-wrap justify-center gap-3 lg:hidden">
          {herWorld.cards.map((card) => (
            <div
              key={card.label}
              className="glass-panel px-4 py-2"
              style={{ borderRadius: 999 }}
            >
              <span
                className="font-display italic"
                style={{ fontSize: 14, color: 'var(--cream)' }}
              >
                {card.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SceneWrapper>
  );
}
