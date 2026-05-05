import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import FinalDeployButton from '../components/FinalDeployButton';
import SceneWrapper from '../components/SceneWrapper';
import { finalScene, identity } from '../data/loveStory';

type Props = {
  active: boolean;
  onLockNavigation: () => void;
};

const CONFETTI_COLORS = [
  '#D4AF37',
  '#E5C68A',
  '#F4EBD8',
  '#E8A8B9',
  '#C7869B',
];

export default function FinalDeployScene({ active, onLockNavigation }: Props) {
  const [deployed, setDeployed] = useState(false);
  const fired = useRef(false);

  const deploy = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setDeployed(true);
    onLockNavigation();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bursts: Array<{ x: number; angle: number }> = reduced
      ? [{ x: 0.5, angle: 90 }]
      : [
          { x: 0.5, angle: 90 },
          { x: 0.2, angle: 60 },
          { x: 0.8, angle: 120 },
        ];
    bursts.forEach((b, i) => {
      window.setTimeout(() => {
        void confetti({
          particleCount: i === 0 ? 160 : 80,
          spread: i === 0 ? 110 : 80,
          startVelocity: 50,
          origin: { x: b.x, y: 0.6 },
          angle: b.angle,
          colors: CONFETTI_COLORS,
          scalar: 1.05,
          ticks: 220,
        });
      }, i * 380);
    });
  }, [onLockNavigation]);

  // Listen for the global "vanshika:deploy" event dispatched by App.tsx on Enter.
  useEffect(() => {
    const onTrigger = () => {
      if (active) deploy();
    };
    window.addEventListener('vanshika:deploy', onTrigger);
    return () => window.removeEventListener('vanshika:deploy', onTrigger);
  }, [active, deploy]);

  return (
    <SceneWrapper id="final-deploy" ariaLabel="Final Deploy">
      {/* deep ambient backdrop with violet glow */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, #2a0e3a 0%, #11061d 50%, #050309 100%)',
        }}
      />
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 50%, rgba(212,175,55,0.18), transparent 70%), radial-gradient(ellipse 40% 30% at 50% 50%, rgba(232,168,185,0.16), transparent 70%)',
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex h-screen items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {!deployed ? (
            <motion.div
              key="pre"
              className="max-w-3xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.65 }}
            >
              <div
                className="font-mono uppercase mb-8"
                style={{
                  fontSize: 11,
                  letterSpacing: 6,
                  color: 'rgba(244,235,216,0.6)',
                }}
              >
                {identity.appName} · v1.0.0
              </div>
              <h1
                className="text-gradient-gold font-display italic"
                style={{
                  fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                {finalScene.pendingHeading}
              </h1>
              <p
                className="mt-6 font-mono"
                style={{
                  fontSize: 14,
                  color: 'rgba(244,235,216,0.55)',
                }}
              >
                {finalScene.pendingSubtitle}
              </p>
              <div className="mt-12">
                <FinalDeployButton onDeploy={deploy} label={finalScene.buttonLabel} />
              </div>
              <p
                className="mt-8 font-mono uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: 4,
                  color: 'rgba(244,235,216,0.42)',
                }}
              >
                Press Enter or click to deploy
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="post"
              className="max-w-4xl"
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 130, damping: 18, delay: 0.2 }}
            >
              <motion.div
                className="mx-auto mb-8"
                style={{
                  width: 110,
                  height: 100,
                  position: 'relative',
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    left: 50,
                    width: 56,
                    height: 90,
                    borderRadius: '56px 56px 0 0',
                    background: 'linear-gradient(135deg, #E8A8B9 0%, #C7869B 100%)',
                    transform: 'rotate(-45deg)',
                    transformOrigin: '0 100%',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    top: 0,
                    left: 0,
                    width: 56,
                    height: 90,
                    borderRadius: '56px 56px 0 0',
                    background: 'linear-gradient(135deg, #E8A8B9 0%, #C7869B 100%)',
                    transform: 'rotate(45deg)',
                    transformOrigin: '100% 100%',
                  }}
                />
              </motion.div>

              <p
                className="font-mono uppercase"
                style={{
                  fontSize: 14,
                  letterSpacing: 6,
                  color: 'var(--gold)',
                  textShadow: '0 0 20px rgba(212,175,55,0.55)',
                }}
              >
                {finalScene.successHeadline}
              </p>

              <h2
                className="text-gradient-gold font-display italic mt-6"
                style={{
                  fontSize: 'clamp(3rem, 9vw, 6.4rem)',
                  lineHeight: 1.0,
                  letterSpacing: '-0.02em',
                }}
              >
                {finalScene.coupleName}
              </h2>

              <p
                className="mt-6 font-mono"
                style={{
                  fontSize: 14,
                  color: 'rgba(244,235,216,0.6)',
                }}
              >
                {finalScene.successSubtitle}
              </p>
              <p
                className="mt-3 font-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: 1,
                  color: 'rgba(244,235,216,0.42)',
                }}
              >
                {finalScene.successFooter}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneWrapper>
  );
}
