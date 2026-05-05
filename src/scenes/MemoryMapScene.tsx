import { motion } from 'framer-motion';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { memoryMap } from '../data/loveStory';

type Props = { active: boolean };

/**
 * Abstract orbit of memory nodes. Each node has an angle along an ellipse;
 * we map angle → CSS coordinates so the layout is deterministic and stable.
 */
export default function MemoryMapScene(_: Props) {
  void _;
  const cx = 50; // center x %
  const cy = 50; // center y %
  const rx = 36; // x radius %
  const ry = 30; // y radius %

  return (
    <SceneWrapper id="memory-map" ariaLabel="Memory Map">
      {/* ambient */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #14141e 0%, #0a0a12 60%, #050509 100%)',
        }}
      />
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(212,175,55,0.10), transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto h-screen max-w-7xl px-8 py-14 sm:px-14">
        <div className="absolute left-8 top-14 sm:left-14">
          <MemoryPanel
            eyebrow="Chapter III · Memory Map"
            title={memoryMap.heading}
            scriptTitle={memoryMap.subheading}
          />
        </div>

        {/* the orbit */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: '76vmin', height: '64vmin' }}>
            {/* faint ellipse rail */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke="rgba(212,175,55,0.22)"
                strokeWidth={0.18}
                strokeDasharray="0.6 1.6"
              />
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx + 6}
                ry={ry + 5}
                fill="none"
                stroke="rgba(244,235,216,0.06)"
                strokeWidth={0.12}
              />
            </svg>

            {/* center pulse */}
            <motion.div
              className="absolute"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  background: 'var(--gold)',
                  boxShadow:
                    '0 0 24px rgba(212,175,55,0.7), 0 0 60px rgba(212,175,55,0.42)',
                }}
              />
            </motion.div>

            {/* nodes */}
            {memoryMap.nodes.map((node, i) => {
              const theta = node.angle * Math.PI * 2;
              const x = cx + Math.cos(theta) * rx;
              const y = cy + Math.sin(theta) * ry;
              return (
                <motion.div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + i * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ scale: 1.08 }}
                >
                  <motion.div
                    className="group relative flex flex-col items-center"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 6 + (i % 4),
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                  >
                    <div
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: 12,
                        height: 12,
                        background: 'var(--champagne)',
                        boxShadow:
                          '0 0 14px rgba(229,198,138,0.7), 0 0 32px rgba(229,198,138,0.32)',
                      }}
                    />
                    <div
                      className="absolute top-full mt-3 whitespace-nowrap text-center"
                      style={{ transform: 'translateX(-50%)', left: '50%' }}
                    >
                      <div
                        className="font-display italic"
                        style={{
                          fontSize: 18,
                          color: 'var(--cream)',
                          lineHeight: 1.05,
                        }}
                      >
                        {node.name}
                      </div>
                      <div
                        className="font-mono uppercase mt-1"
                        style={{
                          fontSize: 9,
                          letterSpacing: 3,
                          color: 'rgba(244,235,216,0.52)',
                        }}
                      >
                        {node.caption}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
}
