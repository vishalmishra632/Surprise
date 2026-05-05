import { motion } from 'framer-motion';
import { identity } from '../data/loveStory';

type EnterScreenProps = {
  onEnter: () => void;
};

export default function EnterScreen({ onEnter }: EnterScreenProps) {
  return (
    <motion.section
      className="fixed inset-0 z-[90] flex items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(ellipse at 50% 35%, #14141e 0%, #0a0a12 55%, #050509 100%)',
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
      role="dialog"
      aria-label="Welcome to Vanshika.exe"
    >
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 30%, rgba(212,175,55,0.18), transparent 70%), radial-gradient(ellipse 40% 30% at 50% 80%, rgba(232,168,185,0.14), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, transparent 70%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <div className="relative max-w-3xl text-center">
        <motion.div
          className="font-mono uppercase mb-6"
          style={{
            fontSize: 12,
            letterSpacing: 6,
            color: 'rgba(244,235,216,0.55)',
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          {identity.release}
        </motion.div>

        <motion.h1
          className="text-gradient-gold font-display"
          style={{
            fontSize: 'clamp(3.2rem, 9vw, 7rem)',
            lineHeight: 0.96,
            letterSpacing: '-0.02em',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          {identity.appName}
        </motion.h1>

        <motion.div
          className="font-mono uppercase mt-5"
          style={{
            fontSize: 13,
            letterSpacing: 5,
            color: 'var(--champagne)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
        >
          {identity.tagline}
        </motion.div>

        <motion.div
          className="mx-auto mt-8 h-px"
          style={{ width: 80, background: 'var(--gold)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        />

        <motion.p
          className="font-display italic mt-6"
          style={{
            fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
            color: 'rgba(244,235,216,0.78)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
        >
          {identity.builtBy}
        </motion.p>

        <motion.button
          type="button"
          onClick={onEnter}
          className="mt-12 inline-flex items-center gap-3 px-10 py-4 font-mono uppercase animate-glowPulse"
          style={{
            fontSize: 12,
            letterSpacing: 5,
            color: 'var(--ink)',
            background: 'linear-gradient(135deg, #f4ebd8 0%, #e5c68a 50%, #d4af37 100%)',
            border: '1px solid rgba(212,175,55,0.55)',
            borderRadius: 999,
            cursor: 'pointer',
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.25 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Enter</span>
          <span aria-hidden="true">→</span>
        </motion.button>
      </div>
    </motion.section>
  );
}
