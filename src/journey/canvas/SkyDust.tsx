import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three';
import { createRoadCurve } from '../curve';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';

const PARTICLE_COUNT = 280;

const dustVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vDist;
  void main() {
    vec3 p = position;
    // gentle bob + horizontal drift so the dust feels suspended in air
    p.y += sin(uTime * 0.45 + aPhase) * 0.55;
    p.x += cos(uTime * 0.35 + aPhase * 1.7) * 0.35;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    vDist = -mvPosition.z;
    gl_PointSize = aSize * (260.0 / max(vDist, 4.0));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHalo;
  varying float vDist;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    // soft glow with a hot core
    float core = smoothstep(0.5, 0.0, d);
    float halo = smoothstep(0.5, 0.18, d);
    vec3 col = mix(uHalo, uColor, halo);
    float fogFade = 1.0 - smoothstep(40.0, 180.0, vDist);
    gl_FragColor = vec4(col, core * 0.45 * fogFade);
  }
`;

export function SkyDust() {
  const geometry = useMemo(() => {
    const curve = createRoadCurve();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      const pt = curve.getPoint(t);
      const angle = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 22;
      positions[i * 3] = pt.x + Math.cos(angle) * r;
      // suspended in the air above the road
      positions[i * 3 + 1] = pt.y + 2.5 + Math.random() * 9;
      positions[i * 3 + 2] = pt.z + Math.sin(angle) * r + (Math.random() - 0.5) * 6;
      sizes[i] = 0.06 + Math.random() * 0.18;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phases, 1));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: new Color(0xffe6cc) },
          uHalo: { value: new Color(0xffd6e0) },
          uTime: { value: 0 },
        },
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
      }),
    [],
  );

  const materialRef = useRef(material);

  useFrame(({ clock }) => {
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    const progress = useJourneyStore.getState().progress;
    const palette = interpolatePalette(progress);
    // Dust takes its colour cue from the ambient + accent — warm core,
    // rose halo — so it shifts mood with the chapter.
    materialRef.current.uniforms.uColor.value.copy(palette.ambient);
    materialRef.current.uniforms.uHalo.value.copy(palette.accent);
  });

  return <points geometry={geometry} material={material} />;
}
