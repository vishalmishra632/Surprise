import { CatmullRomCurve3, Vector3 } from 'three';
import type { PathPoint } from './types';

/**
 * Long, gently winding road. Length quadrupled so we can give every
 * photo and every clip its own billboard with comfortable spacing.
 * Same curve shape as before — every z is just scaled 4× so segments
 * are longer and the road feels like a stretch instead of a sketch.
 */
export const PATH_POINTS: PathPoint[] = [
  [0, 2, 0],
  [2, 2.1, -112],
  [-3, 2.6, -232],
  [4, 2.2, -360],
  [-2, 2.8, -488],
  [3, 2.4, -624],
  [-4, 2.7, -768],
  [2, 2.2, -912],
  [-3, 2.5, -1064],
  [3, 2.4, -1216],
  [-2, 2.6, -1360],
  [1, 2.3, -1512],
  [-1, 2.5, -1664],
  [2, 2.2, -1816],
  [-2, 2.6, -1968],
  [0, 2.4, -2112],
  [0, 2.8, -2240],
];

export function createRoadCurve(): CatmullRomCurve3 {
  const points = PATH_POINTS.map(([x, y, z]) => new Vector3(x, y, z));
  const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  curve.arcLengthDivisions = 2000;
  return curve;
}

export function sideNormalAt(curve: CatmullRomCurve3, t: number): Vector3 {
  const tangent = curve.getTangent(t);
  return new Vector3(-tangent.z, 0, tangent.x).normalize();
}
