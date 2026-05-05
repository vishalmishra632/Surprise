import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';
import { createRoadCurve, sideNormalAt } from '../curve';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';

const STEPS_PER_TRAIL = 90;
const TOTAL = STEPS_PER_TRAIL * 2;
const STEP_WIDTH_FEMALE = 0.28;
const STEP_LENGTH_FEMALE = 0.46;
const STEP_WIDTH_MALE = 0.36;
const STEP_LENGTH_MALE = 0.58;
const Y_OFFSET = -0.535;

const footVertex = /* glsl */ `
  attribute float aPersonProgress;
  varying vec2 vUv;
  varying float vReveal;
  uniform float uProgress;
  void main() {
    vUv = uv;
    // Trail behaviour: each footprint fades in just before the camera
    // reaches it, holds at peak through a short window, then fades out
    // gradually as the camera leaves it behind. Older prints disappear,
    // newer ones bloom into view — a romantic trail, not a stamped path.
    float diff = uProgress - aPersonProgress;
    float fadeIn = smoothstep(-0.026, 0.004, diff);
    float fadeOut = 1.0 - smoothstep(0.024, 0.090, diff);
    vReveal = clamp(fadeIn * fadeOut, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const footFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vReveal;
  uniform vec3 uColor;
  void main() {
    vec2 p = vUv - 0.5;

    // Two overlapping ovals — heel + ball — read as a footprint.
    vec2 heel = p - vec2(0.0, -0.18);
    float dHeel = length(vec2(heel.x * 2.2, heel.y * 1.4)) - 0.16;

    vec2 ball = p - vec2(0.0, 0.10);
    float dBall = length(vec2(ball.x * 2.0, ball.y * 1.2)) - 0.18;

    float d = min(dHeel, dBall);
    float mask = 1.0 - smoothstep(0.0, 0.045, d);
    if (mask < 0.02) discard;

    // Soft, semi-transparent imprints — never harsh. The couple's
    // presence is shown only through these prints, so we keep them
    // visible enough to read as a trail without crowding the road.
    gl_FragColor = vec4(uColor, mask * 0.42 * vReveal);
  }
`;

export function Footsteps() {
  const meshRef = useRef<InstancedMesh>(null);

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(1, 1);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: footVertex,
        fragmentShader: footFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uProgress: { value: 0 },
          uColor: { value: new Color(0x4a2a1a) },
        },
      }),
    [],
  );

  const personProgress = useMemo(() => new Float32Array(TOTAL), []);

  const matrices = useMemo(() => {
    const curve = createRoadCurve();
    const dummy = new Object3D();
    const result: Matrix4[] = [];

    for (let i = 0; i < TOTAL; i++) {
      const isFemale = i < STEPS_PER_TRAIL;
      const stepIndex = isFemale ? i : i - STEPS_PER_TRAIL;
      const t = (stepIndex + 0.5) / STEPS_PER_TRAIL;

      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const normal = sideNormalAt(curve, t);

      // Each trail walks slightly off-center, alternating left/right foot.
      const trailOffset = isFemale ? -0.55 : 0.55;
      const altSign = stepIndex % 2 === 0 ? 1 : -1;
      const footAlt = altSign * 0.18;
      const offset = trailOffset + footAlt;

      // Stagger so the female prints sit between male prints chronologically.
      const phaseShift = isFemale ? 0 : 0.5 / STEPS_PER_TRAIL;
      personProgress[i] = Math.max(0, Math.min(1, t + phaseShift));

      dummy.position.set(
        point.x + normal.x * offset,
        point.y + Y_OFFSET,
        point.z + normal.z * offset,
      );

      // Yaw the flat plane to align its long axis with the road's tangent.
      const yaw = Math.atan2(tangent.x, tangent.z);
      dummy.rotation.set(0, yaw, 0);

      const w = isFemale ? STEP_WIDTH_FEMALE : STEP_WIDTH_MALE;
      const l = isFemale ? STEP_LENGTH_FEMALE : STEP_LENGTH_MALE;
      dummy.scale.set(w, 1, l);

      dummy.updateMatrix();
      result.push(dummy.matrix.clone());
    }
    return result;
  }, [personProgress]);

  // Wire up instance matrices once on mount.
  const init = useRef(false);
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!init.current) {
      for (let i = 0; i < TOTAL; i++) {
        mesh.setMatrixAt(i, matrices[i]);
      }
      mesh.instanceMatrix.needsUpdate = true;

      if (!mesh.geometry.getAttribute('aPersonProgress')) {
        mesh.geometry.setAttribute(
          'aPersonProgress',
          new InstancedBufferAttribute(personProgress, 1),
        );
      }
      init.current = true;
    }

    const progress = useJourneyStore.getState().progress;
    material.uniforms.uProgress.value = progress;
    const palette = interpolatePalette(progress);
    // Soft dusty-rose footprints — accent colour mixed with cream so they
    // feel like footprints in pink chalk, not stamped ink.
    material.uniforms.uColor.value
      .copy(palette.accent)
      .lerp(new Color(0xfff0e8), 0.35)
      .multiplyScalar(0.85);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, TOTAL]}
      frustumCulled={false}
      renderOrder={0}
    />
  );
}
