import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial, DoubleSide } from 'three';
import { createRoadCurve, sideNormalAt } from '../curve';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';

const SEGMENTS = 800;
const HALF_WIDTH = 2.6;
const Y_OFFSET = -0.55;
const STRIPE_REPEAT = 70;

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDist = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const surfaceFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vDist;
  uniform vec3 uFog;
  uniform vec3 uAccent;
  uniform vec3 uRoadCenter;
  uniform vec3 uRoadEdge;
  uniform vec3 uEdgeLine;
  uniform float uTime;

  void main() {
    // Romantic gradient: blush pink down the spine of the road, fading
    // to dusty lavender toward each shoulder.
    float distFromCenter = abs(vUv.x - 0.5) * 2.0;
    vec3 base = mix(uRoadCenter, uRoadEdge, smoothstep(0.0, 1.0, distFromCenter));

    // Soft shimmer — a slow-moving sheen down the road, brighter near
    // the centre, almost invisible at the edges.
    float wave = sin(vUv.y * 14.0 - uTime * 0.6) * 0.5 + 0.5;
    float sheen = smoothstep(0.62, 1.0, wave) * (1.0 - distFromCenter * 0.7);
    base += vec3(0.06, 0.04, 0.07) * sheen;

    // Subtle centre reflection — a faint bright halo down the middle.
    float centerHalo = 1.0 - smoothstep(0.0, 0.42, distFromCenter);
    base += vec3(0.05, 0.03, 0.06) * centerHalo * 0.6;

    // Dashed centre line — section accent, gentle so it doesn't fight
    // with the gradient.
    float center = step(0.487, vUv.x) * step(vUv.x, 0.513);
    float dash = step(fract(vUv.y), 0.5);
    base = mix(base, uAccent, center * dash * 0.55);

    // Hairline cream stripes at both shoulders
    float lineL = smoothstep(0.018, 0.0, vUv.x);
    float lineR = smoothstep(0.982, 1.0, vUv.x);
    base = mix(base, uEdgeLine, max(lineL, lineR) * 0.85);

    // Distance fog blends the road into the sky horizon
    float fogFactor = smoothstep(36.0, 200.0, vDist);
    vec3 col = mix(base, uFog, fogFactor);

    gl_FragColor = vec4(col, 1.0 - fogFactor * 0.4);
  }
`;

export function RoadSurface() {
  const geometry = useMemo(() => {
    const curve = createRoadCurve();
    const positionCount = (SEGMENTS + 1) * 2;
    const positions = new Float32Array(positionCount * 3);
    const uvs = new Float32Array(positionCount * 2);
    const indices: number[] = [];

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const point = curve.getPoint(t);
      const normal = sideNormalAt(curve, t);
      const baseIdx = i * 2;

      positions[baseIdx * 3 + 0] = point.x + normal.x * HALF_WIDTH;
      positions[baseIdx * 3 + 1] = point.y + Y_OFFSET;
      positions[baseIdx * 3 + 2] = point.z + normal.z * HALF_WIDTH;

      positions[baseIdx * 3 + 3] = point.x - normal.x * HALF_WIDTH;
      positions[baseIdx * 3 + 4] = point.y + Y_OFFSET;
      positions[baseIdx * 3 + 5] = point.z - normal.z * HALF_WIDTH;

      const v = t * STRIPE_REPEAT;
      uvs[baseIdx * 2 + 0] = 0;
      uvs[baseIdx * 2 + 1] = v;
      uvs[baseIdx * 2 + 2] = 1;
      uvs[baseIdx * 2 + 3] = v;
    }

    for (let i = 0; i < SEGMENTS; i++) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2);
      indices.push(a + 1, a + 3, a + 2);
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('uv', new BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeBoundingSphere();
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        side: DoubleSide,
        depthWrite: true,
        uniforms: {
          uFog: { value: new Color(0xfae0d8) },
          uAccent: { value: new Color(0xc7869b) },
          uRoadCenter: { value: new Color(0xf6c8d4) },
          uRoadEdge: { value: new Color(0xd4c0e0) },
          uEdgeLine: { value: new Color(0xfff5e8) },
          uTime: { value: 0 },
        },
        vertexShader: surfaceVertex,
        fragmentShader: surfaceFragment,
      }),
    [],
  );

  const materialRef = useRef(material);

  useFrame(({ clock }) => {
    const progress = useJourneyStore.getState().progress;
    const palette = interpolatePalette(progress);
    materialRef.current.uniforms.uFog.value.copy(palette.fog);
    materialRef.current.uniforms.uAccent.value.copy(palette.accent);
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return <mesh geometry={geometry} material={material} renderOrder={-1} />;
}
