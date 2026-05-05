import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial, Vector3 } from 'three';
import { createRoadCurve } from '../curve';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';

const PETAL_COUNT = 1800;

/**
 * A red-rose carpet covering the road, with two distinct response paths:
 *
 * 1. **Smoothed wind** (`uWind`) — eased over multiple frames, drives a
 *    slow lift toward each petal's float-offset target. This is the
 *    background breeze that's always alive.
 * 2. **Raw burst** (`uBurst`) — the unsmoothed scroll velocity. Snaps in
 *    instantly when the user scrolls and decays fast. Drives a unified
 *    directional gust + a brief upward kick. This is what makes the
 *    petals visibly *blow* when you scroll.
 *
 * A slowly-rotating wind direction vector keeps the gusts coherent —
 * petals all blow the same way at the same time, like a real breeze.
 */
const petalVertex = /* glsl */ `
  attribute float aSize;
  attribute float aRotation;
  attribute float aLift;
  attribute vec3 aFloatOffset;
  attribute float aPhase;
  attribute float aColorIdx;
  uniform float uTime;
  uniform float uWind;
  uniform float uBurst;
  uniform vec3 uWindDir;
  varying float vRotation;
  varying float vColorIdx;
  varying float vDist;
  varying float vLift;

  void main() {
    vec3 pos = position;

    // Smoothed wind lifts each petal toward its individual float-offset.
    float liftAmt = aLift * uWind;
    pos += aFloatOffset * liftAmt;

    // Raw scroll burst applies a unified directional gust on top —
    // every petal blows the same way the same moment. This is what
    // makes the carpet visibly react to scrolling.
    float gust = uBurst * (0.4 + aLift * 0.9);
    pos += uWindDir * gust * 1.6;
    pos.y += uBurst * (0.2 + aLift * 0.6);

    // Continuous airborne bob + sway so airborne petals never feel static
    float air = clamp(liftAmt + uBurst * 0.6 + aLift * 0.25, 0.0, 1.4);
    pos.y += sin(uTime * 0.7 + aPhase) * 0.22 * air;
    pos.x += cos(uTime * 0.5 + aPhase * 1.3) * 0.20 * air;

    // Tumble — slow when calm, faster when blowing
    vRotation = aRotation + uTime * 0.25 * air + uBurst * aPhase * 0.6;
    vColorIdx = aColorIdx;
    vLift = clamp(air, 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDist = -mvPosition.z;
    gl_PointSize = aSize * (320.0 / max(vDist, 4.0));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const petalFragment = /* glsl */ `
  uniform vec3 uBlush;
  uniform vec3 uRose;
  uniform vec3 uLavender;
  uniform vec3 uFog;
  varying float vRotation;
  varying float vColorIdx;
  varying float vDist;
  varying float vLift;

  void main() {
    vec2 p = gl_PointCoord - 0.5;

    float c = cos(vRotation);
    float s = sin(vRotation);
    vec2 rp = vec2(c * p.x - s * p.y, s * p.x + c * p.y);

    // Petal SDF — elongated ellipse with a subtle tip taper
    float r = length(vec2(rp.x * 2.05, rp.y * 0.95));
    r += 0.05 * smoothstep(-0.2, 0.5, rp.y);

    float alpha = 1.0 - smoothstep(0.36, 0.46, r);
    if (alpha < 0.01) discard;

    vec3 col;
    if (vColorIdx < 0.45) col = uBlush;
    else if (vColorIdx < 0.78) col = uRose;
    else col = uLavender;

    // Warm pink core highlight so the petal still reads as a red rose
    // catching light from above
    float core = 1.0 - smoothstep(0.0, 0.28, r);
    col = mix(col, vec3(1.0, 0.78, 0.78), core * 0.14);

    float fogFactor = smoothstep(40.0, 180.0, vDist);
    col = mix(col, uFog, fogFactor);

    float opacity = mix(0.55, 0.82, vLift);

    gl_FragColor = vec4(col, alpha * opacity * (1.0 - fogFactor * 0.45));
  }
`;

export function RosePetals() {
  const geometry = useMemo(() => {
    const curve = createRoadCurve();
    const positions = new Float32Array(PETAL_COUNT * 3);
    const floatOffsets = new Float32Array(PETAL_COUNT * 3);
    const sizes = new Float32Array(PETAL_COUNT);
    const rotations = new Float32Array(PETAL_COUNT);
    const lifts = new Float32Array(PETAL_COUNT);
    const phases = new Float32Array(PETAL_COUNT);
    const colorIdxs = new Float32Array(PETAL_COUNT);

    for (let i = 0; i < PETAL_COUNT; i++) {
      const t = Math.random();
      const pt = curve.getPoint(t);

      // 84% carpet the road, 12% mid-air, 4% high-air
      const tier = Math.random();
      const isOnRoad = tier < 0.84;
      const isHighAir = tier > 0.96;

      let restY: number;
      let lift: number;
      let sizeMin: number;
      if (isOnRoad) {
        // Sit lightly on the road surface
        restY = pt.y - 0.52 + Math.random() * 0.04;
        // Even grounded petals get a real lift coefficient now so they
        // visibly rise when the wind picks up.
        lift = 0.18 + Math.random() * 0.5;
        sizeMin = 0.07;
      } else if (!isHighAir) {
        restY = pt.y - 0.2 + Math.random() * 0.9;
        lift = 0.5 + Math.random() * 0.4;
        sizeMin = 0.08;
      } else {
        restY = pt.y + 1.2 + Math.random() * 1.6;
        lift = 0.75 + Math.random() * 0.25;
        sizeMin = 0.09;
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = isOnRoad
        ? Math.pow(Math.random(), 0.5) * 2.7
        : 4.2 + Math.pow(Math.random(), 0.55) * 14;

      positions[i * 3] = pt.x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = restY;
      positions[i * 3 + 2] = pt.z + Math.sin(angle) * radius;

      // Where the wind takes a petal at full lift — wider lateral spread,
      // higher rise, more forward drift than before.
      floatOffsets[i * 3] = (Math.random() - 0.5) * 3.0;
      floatOffsets[i * 3 + 1] = 0.8 + Math.random() * 2.2;
      floatOffsets[i * 3 + 2] = -0.5 - Math.random() * 2.5;

      sizes[i] = sizeMin + Math.random() * 0.16;
      rotations[i] = Math.random() * Math.PI * 2;
      lifts[i] = lift;
      phases[i] = Math.random() * Math.PI * 2;
      colorIdxs[i] = Math.random();
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('aFloatOffset', new BufferAttribute(floatOffsets, 3));
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geo.setAttribute('aRotation', new BufferAttribute(rotations, 1));
    geo.setAttribute('aLift', new BufferAttribute(lifts, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phases, 1));
    geo.setAttribute('aColorIdx', new BufferAttribute(colorIdxs, 1));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uWind: { value: 0.05 },
          uBurst: { value: 0 },
          uWindDir: { value: new Vector3(0.4, 0.5, -0.6).normalize() },
          uBlush: { value: new Color(0xa8243a) },
          uRose: { value: new Color(0xc8384e) },
          uLavender: { value: new Color(0xe35a72) },
          uFog: { value: new Color(0xfae0d8) },
        },
        vertexShader: petalVertex,
        fragmentShader: petalFragment,
      }),
    [],
  );

  const windRef = useRef(0.05);
  const burstRef = useRef(0);
  const prevProgressRef = useRef(0);

  useFrame(({ clock }) => {
    const progress = useJourneyStore.getState().progress;
    const delta = Math.abs(progress - prevProgressRef.current);
    prevProgressRef.current = progress;

    // Smoothed wind — slow build-up + gentle decay for ambient drift.
    const targetWind = Math.min(delta * 180 + 0.05, 0.95);
    windRef.current = windRef.current * 0.9 + targetWind * 0.1;

    // Raw scroll burst — instant response, fast decay, drives the gust.
    const targetBurst = Math.min(delta * 260, 1.6);
    burstRef.current =
      targetBurst > burstRef.current
        ? burstRef.current * 0.5 + targetBurst * 0.5 // snap up quickly
        : burstRef.current * 0.84; // ease down

    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;
    material.uniforms.uWind.value = windRef.current;
    material.uniforms.uBurst.value = burstRef.current;

    // Wind direction drifts slowly so the carpet doesn't always blow the
    // same way — adds a touch of organic variation.
    material.uniforms.uWindDir.value
      .set(
        Math.sin(t * 0.07) * 0.5 + 0.3,
        0.45,
        Math.cos(t * 0.09) * 0.3 - 0.55,
      )
      .normalize();

    const palette = interpolatePalette(progress);
    // Only fog tracks the chapter — petals stay red roses throughout.
    material.uniforms.uFog.value.copy(palette.fog);
  });

  return <points geometry={geometry} material={material} />;
}
