import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import { createRoadCurve } from '../curve';
import { useJourneyStore } from '../store';
import { useMousePointer } from '../hooks/useMousePointer';
import { useReducedMotion } from '../hooks/useReducedMotion';

const tmpCamPos = new Vector3();
const tmpLookAt = new Vector3();

const MOUSE_X_LIMIT = 0.45;
const MOUSE_Y_LIMIT = 0.35;
const POS_X_GAIN = 0.5;
const POS_Y_GAIN = 0.55;
const LOOK_X_GAIN = 1.0;
const LOOK_Y_GAIN = 0.85;
const SMOOTHING = 0.08;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function CameraRig() {
  const curve = useMemo(() => createRoadCurve(), []);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const mouse = useMousePointer();
  const reducedMotion = useReducedMotion();
  const smoothed = useRef({ x: 0, y: 0 });

  // Three.js fov is *vertical*. On a portrait viewport (e.g. the 9:16
  // reel) the resulting horizontal FOV is much narrower than landscape,
  // which pushes side-of-road billboards almost off-frame. Slightly
  // widen the vertical FOV when the viewport gets tall — but only just
  // enough that the screen-Y of each billboard tracks the same arc the
  // landscape view shows (so the rise-from-horizon feel is preserved
  // instead of the cards sitting noticeably higher and "going down" as
  // the camera approaches).
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const aspect = size.width / size.height;
    const targetFov = aspect < 0.95 ? 50 : 45;
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  useFrame(() => {
    const progress = useJourneyStore.getState().progress;
    const headProgress = Math.min(progress, 0.98);
    const targetProgress = Math.min(progress + 0.01, 1);

    curve.getPoint(headProgress, tmpCamPos);
    curve.getPoint(targetProgress, tmpLookAt);

    const t = performance.now() * 0.001;
    const bobAmplitude = reducedMotion ? 0.01 : 0.05;
    const bob = Math.sin(t * 0.6) * bobAmplitude;

    // Lerp the cursor toward the camera's smoothed offset so even fast
    // mouse flicks ease into a cinematic tilt instead of snapping.
    const targetX = reducedMotion ? 0 : clamp(mouse.current.x, -MOUSE_X_LIMIT, MOUSE_X_LIMIT);
    const targetY = reducedMotion ? 0 : clamp(mouse.current.y, -MOUSE_Y_LIMIT, MOUSE_Y_LIMIT);
    smoothed.current.x += (targetX - smoothed.current.x) * SMOOTHING;
    smoothed.current.y += (targetY - smoothed.current.y) * SMOOTHING;

    const mx = smoothed.current.x;
    // Cursor at the top of the screen reports y < 0; we negate so cursor-up
    // raises the camera and reveals more sky / billboard top.
    const myUp = -smoothed.current.y;

    camera.position.set(
      tmpCamPos.x + mx * POS_X_GAIN,
      tmpCamPos.y + bob + myUp * POS_Y_GAIN,
      tmpCamPos.z,
    );
    camera.lookAt(
      tmpLookAt.x + mx * LOOK_X_GAIN,
      tmpLookAt.y + myUp * LOOK_Y_GAIN,
      tmpLookAt.z,
    );
  });

  return null;
}
