import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Scene } from './canvas/Scene';
import { Gate } from './overlay/Gate';
// (sceneMounted gating was removed — Scene now mounts immediately so
// it's already drawing the road behind the gate when the user clicks.)
import { Prompt } from './overlay/Prompt';
import { Billboards } from './overlay/Billboards';
import { Clouds } from './overlay/Clouds';
import { Landmarks } from './overlay/Landmarks';
import { SkyLabels } from './overlay/SkyLabels';
import { ProposalScene } from './overlay/ProposalScene';
import { ScrollDriver } from './overlay/ScrollDriver';
import { Outro } from './overlay/Outro';
import { DetailView } from './overlay/DetailView';
import { JourneyAudio } from './overlay/JourneyAudio';

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    let rafId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}

function useJourneyHeight(): number {
  const [h, setH] = useState(900);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      // Driver scaled up for the per-photo road: ~85 billboards now,
      // each gets its own moment. Slow, deliberate walk.
      if (w < 720) setH(3700);
      else if (w < 1100) setH(5200);
      else setH(6700);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return h;
}

export function Journey() {
  const heightVh = useJourneyHeight();

  useLenis();

  return (
    <>
      <Gate />
      <main aria-label="A road through us">
        <Scene />
        <Prompt />
        <Clouds />
        <Landmarks />
        <Billboards />
        <SkyLabels />
        <ScrollDriver heightVh={heightVh} />
        <Outro />
      </main>
      <ProposalScene />
      <DetailView />
      <JourneyAudio />
    </>
  );
}
