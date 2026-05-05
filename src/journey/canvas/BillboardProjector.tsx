import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { createRoadCurve, sideNormalAt } from '../curve';
import { CHAPTERS } from '../billboards';
import { getRegisteredBillboards } from '../billboardRegistry';
import { useJourneyStore } from '../store';

type BillboardWorld = {
  id: string;
  progress: number;
  world: Vector3;
  big: boolean;
  special: boolean;
};

const tmp = new Vector3();
const tmpCam = new Vector3();

export function BillboardProjector() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const { width: viewportW, height: viewportH } = size;
  const anchors: BillboardWorld[] = useMemo(() => {
    const curve = createRoadCurve();
    // On portrait viewports the horizontal field of view is much
    // narrower (Three.js fov is vertical), so a billboard at the same
    // world side-offset projects much closer to the screen edge.
    // Pull side billboards inward enough that they survive the visible
    // window without the X clamp constantly fighting them — and so the
    // forward-motion arc resembles the landscape view's transition.
    const aspect = viewportW / Math.max(1, viewportH);
    const offMul = aspect >= 1 ? 1 : Math.max(0.42, aspect * 0.9);
    return CHAPTERS.map((spec) => {
      const pt = curve.getPoint(spec.progress);
      const normal = sideNormalAt(spec.progress === undefined ? curve : curve, spec.progress);
      const off = (spec.side === 0 ? 0 : spec.big ? 8 : 7) * offMul;
      const yOff = spec.specialMoment ? -1.0 : spec.big ? 0.2 : -0.4;
      const world = new Vector3(
        pt.x + normal.x * off * spec.side,
        pt.y + yOff,
        pt.z + normal.z * off * spec.side,
      );
      return {
        id: spec.id,
        progress: spec.progress,
        world,
        big: spec.big,
        special: !!spec.specialMoment,
      };
    });
  }, [viewportW, viewportH]);

  useFrame(() => {
    const registry = getRegisteredBillboards();
    if (registry.size === 0) return;
    const { width, height } = size;
    // Camera follows headProgress = min(progress, 0.98) along the curve.
    // Mirror that here so we can tell whether the camera has rolled past
    // a billboard's anchor and clamp its opacity accordingly.
    const cameraProgress = Math.min(useJourneyStore.getState().progress, 0.98);

    for (const anchor of anchors) {
      const el = registry.get(anchor.id);
      if (!el) continue;

      tmp.copy(anchor.world).project(camera);
      let x = (tmp.x * 0.5 + 0.5) * width;
      let y = (-tmp.y * 0.5 + 0.5) * height;

      const behind = tmp.z > 1;
      // distance in world space — fade in as the camera approaches the sign,
      // fade out gently after the camera passes it instead of an abrupt cut.
      tmpCam.copy(camera.position);
      const distance = anchor.world.distanceTo(tmpCam);

      // Big chapter intros hold a generous reading window. Small per-photo
      // billboards use a tight window so only one card is in focus at a
      // time. The proposal-video billboard is special — wider window so
      // the moment doesn't slip past the camera like every other photo.
      const isBig = anchor.big;
      const isSpecial = anchor.special;
      const fullStart = isBig ? 4 : 2;
      const fullEnd = isBig ? 50 : isSpecial ? 28 : 22;
      const fadeEnd = isBig ? 90 : isSpecial ? 46 : 38;

      let opacity = 0;
      if (!behind) {
        if (distance < fullStart) opacity = distance / fullStart;
        else if (distance < fullEnd) opacity = 1;
        else if (distance < fadeEnd)
          opacity = 1 - (distance - fullEnd) / (fadeEnd - fullEnd);
      }

      // Once the scroll position has rolled past this billboard's anchor,
      // collapse opacity over a tight progress window. Otherwise the sign
      // can keep rendering at full clarity at the top of the viewport
      // because perspective math keeps it "in front" until the NDC z check
      // finally trips — the user sees half a passed billboard hanging in air.
      // Special billboards hold longer here too so they don't vanish
      // a beat after the camera meets them.
      const passDelta = cameraProgress - anchor.progress;
      if (passDelta > 0) {
        const passWindow = isBig ? 0.006 : isSpecial ? 0.005 : 0.0035;
        const passOpacity = Math.max(0, 1 - passDelta / passWindow);
        opacity = Math.min(opacity, passOpacity);
      }

      // Perspective scale — distance-driven only. No fit-fallback here:
      // a Y-based scale clamp would make the card stutter mid-scroll
      // every time the projected y crossed the threshold. The lower
      // world yOff above already gives the card enough headroom.
      // Special billboards may grow a touch larger so the proposal
      // moment reads bigger than the chapter's other photo cards.
      const scaleCap = isSpecial ? 1.1 : 1.0;
      const scale = Math.max(0.6, Math.min(scaleCap, 28 / Math.max(distance, 10)));

      // Defensive horizontal clamp — even after FOV + side-offset
      // adjustments, a card scaled up near a viewport edge can still
      // overhang. Keep its rendered half-width inside the viewport with
      // a small visible margin. Approximated card width matches the CSS
      // clamp() rule on .board so this stays in sync.
      const cssCardWidth = isBig
        ? Math.min(500, Math.max(280, width * 0.35))
        : isSpecial
          ? Math.min(500, Math.max(290, width * 0.36))
          : Math.min(460, Math.max(260, width * 0.32));
      const halfRendered = (cssCardWidth * scale) / 2;
      const margin = 8;
      const minX = halfRendered + margin;
      const maxX = width - halfRendered - margin;
      if (x < minX) x = minX;
      else if (x > maxX) x = maxX;

      el.style.opacity = opacity.toFixed(3);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      // A tiny perspective tilt so the sign doesn't look like a flat
      // pasted card. Bottom-anchored, so rotateX leans the top away
      // from the camera by ~3°.
      el.style.transform = `translate(-50%, -100%) perspective(900px) rotateX(3deg) scale(${scale.toFixed(3)})`;
      el.style.pointerEvents = opacity > 0.4 && !behind ? 'auto' : 'none';

      // Tell the cover when the sign is the focal piece on screen so it
      // can fade its image into video. Edge-trigger only — we don't fire
      // an event every frame.
      const wasPeak = el.dataset.peak === '1';
      const isPeak = opacity > 0.85 && !behind;
      if (isPeak !== wasPeak) {
        el.dataset.peak = isPeak ? '1' : '0';
        el.dispatchEvent(new CustomEvent('peak-change'));
      }
    }
  });

  return null;
}
