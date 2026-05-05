import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Fog } from 'three';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';

const INITIAL_FOG_NEAR = 30;
const INITIAL_FOG_FAR = 140;
const BG_EPSILON = 0.004;

export function PaletteDriver() {
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new Fog(0xf3e7d3, INITIAL_FOG_NEAR, INITIAL_FOG_FAR), []);
  const lastBgHash = useRef(-1);

  useEffect(() => {
    scene.fog = fog;
    return () => {
      if (scene.fog === fog) scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(() => {
    const progress = useJourneyStore.getState().progress;
    const palette = interpolatePalette(progress);
    fog.color.copy(palette.fog);

    if (typeof document === 'undefined') return;

    const hash =
      palette.bg.r + palette.bg.g * 3.1 + palette.bg.b * 5.7 +
      palette.bgDeep.r * 7.3 + palette.bgDeep.g * 11.1 + palette.bgDeep.b * 13.9 +
      palette.accent.r * 17.4 + palette.accent.g * 19.2 + palette.accent.b * 23.1;
    if (Math.abs(hash - lastBgHash.current) < BG_EPSILON) return;
    lastBgHash.current = hash;

    const bgTop = palette.bg.getHexString();
    const bgMid = palette.fog.getHexString();
    const bgBottom = palette.bgDeep.getHexString();
    const accent = palette.accent.getHexString();
    const rim = palette.rim.getHexString();
    // Layered sky: a warm radial sun-glow up high, a soft accent wash
    // off-centre, and a 4-stop vertical gradient underneath so the
    // horizon never reads as a flat colour band.
    document.body.style.background = `
      radial-gradient(ellipse 70% 50% at 50% 18%, rgba(255, 245, 232, 0.55) 0%, transparent 70%),
      radial-gradient(ellipse 55% 45% at 78% 28%, #${rim}33 0%, transparent 70%),
      linear-gradient(180deg, #${bgTop} 0%, #${bgMid} 38%, #${bgMid} 58%, #${bgBottom} 100%)
    `;
    document.body.style.setProperty('--section-accent', `#${accent}`);
    document.body.style.setProperty('--section-rim', `#${rim}`);
  });

  return null;
}
