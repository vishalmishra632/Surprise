import { useMemo, useRef } from 'react';
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
const tmpForward = new Vector3();
const tmpToAnchor = new Vector3();

// How far before its anchor the camera has to scroll back before we'll
// let a "passed" billboard reappear. Anything within this band stays
// hidden so a scroll-wobble (Lenis lerp settling, mouse-wheel bounce,
// touch-scroll deceleration) can't re-flash a card that's already gone.
const PASS_RESET_PROGRESS = 0.005;

export function BillboardProjector() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  // Per-anchor latched maxPassDelta so the fade-out is monotonic.
  const maxPassDeltaRef = useRef<Map<string, number>>(new Map());

  const { width: viewportW, height: viewportH } = size;
  const anchors: BillboardWorld[] = useMemo(() => {
    const curve = createRoadCurve();
    // On portrait viewports the horizontal field of view is much
    // narrower (Three.js fov is vertical), so a billboard at the same
    // world side-offset projects much closer to the screen edge.
    // Pull side billboards inward to ~world-x 2.94 (just outside the
    // 2.6-unit road half-width) so a 46vw card fits cleanly at peak
    // distance instead of needing the X clamp to fight it.
    const aspect = viewportW / Math.max(1, viewportH);
    const offMul = aspect >= 1 ? 1 : Math.max(0.42, aspect * 0.7);
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

    // Compute camera-forward once per frame so the dot-product check
    // below is cheap.
    camera.getWorldDirection(tmpForward);

    for (const anchor of anchors) {
      const el = registry.get(anchor.id);
      if (!el) continue;

      // Robust "behind" check via dot product with the camera's forward
      // vector. Three.js's project() can flip the sign of the NDC x for
      // points behind the camera, which used to make passed left-side
      // billboards briefly flash on the right edge before the next
      // frame's tmp.z > 1 check caught them. The dot product catches
      // it the moment the anchor crosses the camera plane, before any
      // projection wraparound can happen.
      tmpCam.copy(camera.position);
      tmpToAnchor.copy(anchor.world).sub(tmpCam);
      const inFrontDot = tmpToAnchor.dot(tmpForward);
      if (inFrontDot <= 0) {
        // Behind the camera — make sure the latch is still keeping
        // pace with progress so the card stays gone afterwards.
        const passDeltaForLatch =
          Math.min(useJourneyStore.getState().progress, 0.98) - anchor.progress;
        const latched = maxPassDeltaRef.current;
        const prevMax = latched.get(anchor.id) ?? -Infinity;
        if (passDeltaForLatch > prevMax) latched.set(anchor.id, passDeltaForLatch);
        if (el.style.opacity !== '0.000') {
          el.style.opacity = '0.000';
          el.style.pointerEvents = 'none';
        }
        if (el.dataset.peak === '1') {
          el.dataset.peak = '0';
          el.dispatchEvent(new CustomEvent('peak-change'));
        }
        continue;
      }

      tmp.copy(anchor.world).project(camera);
      let x = (tmp.x * 0.5 + 0.5) * width;
      let y = (-tmp.y * 0.5 + 0.5) * height;

      // tmp.z > 1 still acts as a secondary safety net for points just
      // grazing the near plane.
      const behind = tmp.z > 1;
      // distance in world space — fade in as the camera approaches the sign,
      // fade out gently after the camera passes it instead of an abrupt cut.
      const distance = anchor.world.distanceTo(tmpCam);

      // Visibility windows. On the 60-second portrait reel the camera
      // moves about 2.5 world units per second, with each billboard ~2
      // units apart. So each card has ~0.7s of "screen time" budget —
      // the fade window has to be tight enough that one card has
      // visibly cleared before the next reaches peak. Landscape stays
      // generous because the wide screen carries multiple cards
      // comfortably and the user scrolls at their own pace.
      const isBig = anchor.big;
      const isSpecial = anchor.special;
      const isPortrait = height > width;
      const fullStart = isBig ? 4 : 2;
      const fullEnd = isBig
        ? isPortrait ? 4 : 8
        : isSpecial
          ? isPortrait ? 6 : 18
          : isPortrait ? 2.5 : 16;
      const fadeEnd = isBig
        ? isPortrait ? 7 : 16
        : isSpecial
          ? isPortrait ? 10 : 28
          : isPortrait ? 5 : 26;

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
      // Latch the largest passDelta we've ever seen for this anchor so
      // the fade-out is monotonic. If the camera scrolls back slightly
      // (Lenis lerp settle, mouse-wheel bounce, touch-scroll inertia),
      // a card that already faded out won't briefly re-appear.
      // Reset only if the camera goes back well *before* the anchor.
      const latched = maxPassDeltaRef.current;
      const prevMax = latched.get(anchor.id) ?? -Infinity;
      let effectivePassDelta: number;
      if (passDelta < -PASS_RESET_PROGRESS) {
        latched.delete(anchor.id);
        effectivePassDelta = passDelta;
      } else if (passDelta > prevMax) {
        latched.set(anchor.id, passDelta);
        effectivePassDelta = passDelta;
      } else {
        effectivePassDelta = prevMax;
      }
      if (effectivePassDelta > 0) {
        // Pass-out fade: tight enough that the next card claims the
        // focal seat alone, but not so tight that the previous card
        // disappears in a flash. Portrait gets the snappier value
        // because portrait viewports stack cards vertically and the
        // overlap risk is higher; landscape lingers a bit longer.
        const passWindow = isBig
          ? isPortrait ? 0.003 : 0.005
          : isSpecial
            ? isPortrait ? 0.0025 : 0.004
            : isPortrait ? 0.0014 : 0.0035;
        const passOpacity = Math.max(0, 1 - effectivePassDelta / passWindow);
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
      // clamp() rule on .board so this stays in sync. Portrait viewports
      // get wider cards (matching the @media (max-aspect-ratio:1/1)
      // override in index.css).
      const cssCardWidth = isPortrait
        ? (isBig
          ? Math.min(540, Math.max(300, width * 0.50))
          : isSpecial
            ? Math.min(560, Math.max(310, width * 0.52))
            : Math.min(500, Math.max(280, width * 0.46)))
        : (isBig
          ? Math.min(500, Math.max(280, width * 0.35))
          : isSpecial
            ? Math.min(500, Math.max(290, width * 0.36))
            : Math.min(460, Math.max(260, width * 0.32)));
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
