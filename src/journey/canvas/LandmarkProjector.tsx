import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { createRoadCurve, sideNormalAt } from '../curve';
import { CHAPTERS } from '../billboards';
import { getRegisteredLandmarks } from '../landmarkRegistry';

type LandmarkAnchor = {
  id: string;
  world: Vector3;
};

const tmp = new Vector3();
const tmpCam = new Vector3();

export function LandmarkProjector() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const anchors: LandmarkAnchor[] = useMemo(() => {
    const curve = createRoadCurve();
    return CHAPTERS.filter((c) => !!c.landmark).map((spec) => {
      const pt = curve.getPoint(spec.progress);
      const normal = sideNormalAt(curve, spec.progress);
      // Plant the monument on the OPPOSITE shoulder from the billboard so
      // they never overlap on screen. Centered chapters drop the monument
      // on the right shoulder by default.
      const sideSign = spec.side === 0 ? 1 : ((-spec.side) as -1 | 1);
      const off = spec.big ? 9 : 8;
      const world = new Vector3(
        pt.x + normal.x * off * sideSign,
        pt.y - 0.45,
        pt.z + normal.z * off * sideSign,
      );
      return { id: spec.id, world };
    });
  }, []);

  useFrame(() => {
    const registry = getRegisteredLandmarks();
    if (registry.size === 0) return;
    const { width, height } = size;

    for (const anchor of anchors) {
      const el = registry.get(anchor.id);
      if (!el) continue;

      tmp.copy(anchor.world).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const behind = tmp.z > 1;
      tmpCam.copy(camera.position);
      const distance = anchor.world.distanceTo(tmpCam);

      let opacity = 0;
      if (!behind) {
        if (distance < 5) opacity = distance / 5;
        else if (distance < 60) opacity = 1;
        else if (distance < 110) opacity = 1 - (distance - 60) / 50;
      }

      const scale = Math.max(0.45, Math.min(1.2, 32 / Math.max(distance, 10)));

      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate(-50%, -100%) scale(${scale.toFixed(3)})`;
    }
  });

  return null;
}
