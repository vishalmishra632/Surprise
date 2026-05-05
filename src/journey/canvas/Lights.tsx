import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { AmbientLight, DirectionalLight, PointLight } from 'three';
import { Vector3 } from 'three';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';
import { createRoadCurve } from '../curve';

const RIM_AHEAD = 0.08;
const RIM_HEIGHT = 8;
const FILL_FORWARD = 3;

export function Lights() {
  const ambientRef = useRef<AmbientLight>(null);
  const keyRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<PointLight>(null);
  const rimRef = useRef<DirectionalLight>(null);
  const bounceRef = useRef<DirectionalLight>(null);
  const curve = useMemo(() => createRoadCurve(), []);
  const camera = useThree((s) => s.camera);

  const tmpFill = useMemo(() => new Vector3(), []);
  const tmpRim = useMemo(() => new Vector3(), []);
  const tmpForward = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const ambient = ambientRef.current;
    const key = keyRef.current;
    const fill = fillRef.current;
    const rim = rimRef.current;
    const bounce = bounceRef.current;
    if (!ambient || !key || !fill || !rim || !bounce) return;

    const progress = useJourneyStore.getState().progress;
    const palette = interpolatePalette(progress);

    ambient.color.copy(palette.ambient);
    key.color.copy(palette.key);
    rim.color.copy(palette.rim);
    const useAccentBounce = progress < 0.18 || progress > 0.92;
    bounce.color.copy(useAccentBounce ? palette.accent : palette.bgDeep);

    camera.getWorldDirection(tmpForward);
    tmpFill.copy(camera.position).addScaledVector(tmpForward, FILL_FORWARD);
    fill.position.copy(tmpFill);
    fill.color.copy(palette.accent);

    curve.getPoint(Math.min(progress + RIM_AHEAD, 1), tmpRim);
    tmpRim.y += RIM_HEIGHT;
    rim.position.copy(tmpRim);
    rim.target.position.copy(camera.position);
    rim.target.updateMatrixWorld();
  });

  return (
    <>
      <ambientLight ref={ambientRef} color={0xffd4a0} intensity={0.65} />
      <directionalLight
        ref={keyRef}
        color={0xfff1d0}
        intensity={1.6}
        position={[20, 40, 20]}
      />
      <directionalLight
        ref={bounceRef}
        color={0x6b4226}
        intensity={0.6}
        position={[-6, -4, -6]}
      />
      <pointLight
        ref={fillRef}
        color={0xffc080}
        intensity={3.4}
        distance={22}
        decay={2}
      />
      <directionalLight ref={rimRef} color={0xf8e4c8} intensity={2.0} />
    </>
  );
}
