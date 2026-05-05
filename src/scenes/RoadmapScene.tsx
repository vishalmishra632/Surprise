import { motion } from 'framer-motion';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { roadmapScene } from '../data/loveStory';
import type { RoadmapItem } from '../data/loveStory';

type Props = { active: boolean };

const STATUS_LABEL: Record<RoadmapItem['status'], string> = {
  shipped: 'shipped',
  live: 'live · tonight',
  queued: 'queued',
  forever: 'forever',
};

const STATUS_COLOR: Record<RoadmapItem['status'], string> = {
  shipped: 'rgba(244,235,216,0.55)',
  live: 'var(--gold)',
  queued: 'var(--rose)',
  forever: 'var(--champagne)',
};

function Item({ item, index }: { item: RoadmapItem; index: number }) {
  const isLive = item.status === 'live';

  return (
    <motion.li
      className="relative pl-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.85,
        delay: 0.15 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* the dot on the rail */}
      <span
        className="absolute left-0 top-2 flex h-7 w-7 items-center justify-center rounded-full"
        style={{
          background: isLive ? 'var(--gold)' : 'var(--charcoal)',
          border: `1px solid ${isLive ? 'var(--gold)' : 'rgba(244,235,216,0.18)'}`,
          boxShadow: isLive
            ? '0 0 24px rgba(212,175,55,0.55), 0 0 60px rgba(212,175,55,0.32)'
            : 'none',
        }}
      >
        <span
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            background: isLive ? 'var(--ink)' : 'var(--champagne)',
          }}
        />
      </span>

      <div
        className="font-mono uppercase mb-1"
        style={{
          fontSize: 10,
          letterSpacing: 4,
          color: STATUS_COLOR[item.status],
        }}
      >
        {item.year} · {STATUS_LABEL[item.status]}
      </div>
      <div
        className="font-display italic"
        style={{
          fontSize: 'clamp(1.5rem, 2.6vw, 2.2rem)',
          color: 'var(--cream)',
          lineHeight: 1.05,
        }}
      >
        {item.title}
      </div>
      <div
        className="mt-2 font-display italic"
        style={{
          fontSize: 14,
          color: 'rgba(244,235,216,0.68)',
        }}
      >
        {item.caption}
      </div>
    </motion.li>
  );
}

export default function RoadmapScene(_: Props) {
  void _;
  return (
    <SceneWrapper id="roadmap" ariaLabel="Roadmap">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, rgba(212,175,55,0.10), transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(232,168,185,0.08), transparent 60%), linear-gradient(135deg, #0d0d14, #050509)',
        }}
      />

      <div className="relative z-10 mx-auto flex h-screen max-w-5xl items-center px-8 sm:px-12">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="self-center">
            <MemoryPanel
              eyebrow="Chapter VIII · The Roadmap"
              title={roadmapScene.heading}
              scriptTitle={roadmapScene.subheading}
              body="A product roadmap, but for forever. Versions ship. The story keeps writing."
            />
          </div>

          <ol
            className="relative self-center"
            style={{
              borderLeft: '1px solid rgba(244,235,216,0.18)',
              paddingLeft: 0,
              listStyle: 'none',
            }}
          >
            <div
              className="absolute left-0 top-0 h-full"
              aria-hidden="true"
              style={{
                width: 1,
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.5) 50%, transparent 100%)',
              }}
            />
            <div className="space-y-10">
              {roadmapScene.items.map((item, i) => (
                <Item key={item.title} item={item} index={i} />
              ))}
            </div>
          </ol>
        </div>
      </div>
    </SceneWrapper>
  );
}
