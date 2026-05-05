import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { ProgressDriver } from './ProgressDriver';
import { PaletteDriver } from './PaletteDriver';
import { RoadSurface } from './RoadSurface';
import { Footsteps } from './Footsteps';
import { RosePetals } from './RosePetals';
import { BillboardProjector } from './BillboardProjector';
import { LandmarkProjector } from './LandmarkProjector';

const SCENE_STYLE = {
  position: 'fixed' as const,
  inset: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 1,
  touchAction: 'pan-y' as const,
};

export function Scene() {
  return (
    <Canvas
      style={SCENE_STYLE}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 45, near: 0.1, far: 500, position: [0, 2, 0] }}
    >
      <Suspense fallback={null}>
        <Lights />
        <ProgressDriver />
        <PaletteDriver />
        <CameraRig />
        <RoadSurface />
        <Footsteps />
        <RosePetals />
        <LandmarkProjector />
        <BillboardProjector />
      </Suspense>
    </Canvas>
  );
}
