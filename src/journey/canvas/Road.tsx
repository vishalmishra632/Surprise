import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three';
import { createRoadCurve } from '../curve';
import { useJourneyStore } from '../store';
import { interpolatePalette } from '../palette';

const DEFAULT_PARTICLE_COUNT = 4000;

const roadVertex = /* glsl */ `
  attribute float aSize;
  attribute float aTintable;
  varying vec3 vColor;
  varying float vDist;
  varying float vTintable;
  void main() {
    vColor = color;
    vTintable = aTintable;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDist = -mvPosition.z;
    gl_PointSize = aSize * (300.0 / vDist);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const roadFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vDist;
  varying float vTintable;
  uniform vec3 uFog;
  uniform vec3 uAccent;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.2, d);
    float fogFactor = smoothstep(20.0, 140.0, vDist);
    vec3 base = mix(vColor, uAccent, vTintable);
    vec3 col = mix(base, uFog, fogFactor);
    gl_FragColor = vec4(col, alpha * (1.0 - fogFactor * 0.8));
  }
`;

type RoadProps = {
  particleCount?: number;
};

export function Road({ particleCount = DEFAULT_PARTICLE_COUNT }: RoadProps = {}) {
  const geometry = useMemo(() => {
    const curve = createRoadCurve();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const tintable = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const pt = curve.getPoint(t);
      const spread = 14 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.6) * spread;
      positions[i * 3] = pt.x + Math.cos(angle) * r;
      positions[i * 3 + 1] =
        pt.y - 0.8 + Math.random() * 0.3 - Math.abs(Math.sin(angle)) * 0.2;
      positions[i * 3 + 2] = pt.z + Math.sin(angle) * r + (Math.random() - 0.5) * 3;
      sizes[i] = Math.random() * 0.12 + 0.04;
      const roll = Math.random();
      let cr: number;
      let cg: number;
      let cb: number;
      let tint = 0;
      if (roll < 0.4) {
        const c = 0.14 + Math.random() * 0.18;
        cr = c * 1.15;
        cg = c * 0.7;
        cb = c * 0.4;
      } else if (roll < 0.65) {
        const c = 0.28 + Math.random() * 0.22;
        cr = c * 1.25;
        cg = c * 0.85;
        cb = c * 0.5;
      } else if (roll < 0.8) {
        const c = 0.45 + Math.random() * 0.2;
        cr = c * 1.1;
        cg = c * 0.9;
        cb = c * 0.55;
      } else {
        const c = 0.55 + Math.random() * 0.35;
        cr = c;
        cg = c;
        cb = c;
        tint = 1;
      }
      colors[i * 3] = cr;
      colors[i * 3 + 1] = cg;
      colors[i * 3 + 2] = cb;
      tintable[i] = tint;
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geo.setAttribute('aTintable', new BufferAttribute(tintable, 1));
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    return geo;
  }, [particleCount]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uFog: { value: new Color(0xf0e4d0) },
          uAccent: { value: new Color(0xd98b6e) },
        },
        vertexShader: roadVertex,
        fragmentShader: roadFragment,
      }),
    [],
  );

  const materialRef = useRef(material);

  useFrame(() => {
    const progress = useJourneyStore.getState().progress;
    const palette = interpolatePalette(progress);
    materialRef.current.uniforms.uFog.value.copy(palette.fog);
    materialRef.current.uniforms.uAccent.value.copy(palette.accent);
  });

  return <points geometry={geometry} material={material} />;
}
