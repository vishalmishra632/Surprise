import { motion } from 'framer-motion';
import { sceneOrder } from '../data/loveStory';

type ProgressIndicatorProps = {
  currentIndex: number;
  onSelect: (index: number) => void;
};

export default function ProgressIndicator({
  currentIndex,
  onSelect,
}: ProgressIndicatorProps) {
  return (
    <nav
      className="pointer-events-auto fixed right-7 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-3"
      aria-label="Scene progress"
    >
      {sceneOrder.map((scene, i) => {
        const isActive = i === currentIndex;
        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSelect(i)}
            className="group flex items-center gap-3 outline-none focus-visible:opacity-100"
            aria-label={`Go to ${scene.label}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span
              className="font-mono uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: isActive ? 'var(--champagne)' : 'rgba(244,235,216,0.55)',
                opacity: isActive ? 1 : undefined,
              }}
            >
              {scene.label}
            </span>
            <motion.span
              className="block rounded-full"
              style={{
                background: isActive ? 'var(--gold)' : 'rgba(244,235,216,0.30)',
              }}
              animate={{
                width: isActive ? 22 : 6,
                height: isActive ? 2 : 6,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            />
          </button>
        );
      })}
    </nav>
  );
}
