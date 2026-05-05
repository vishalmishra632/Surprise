import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'src/assets/memories/Proposed/proposed_ring.JPG';
const OUT_DIR = 'public/proposal';
const OUT_FILE = 'couple.png';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('Reading source…');
const inputBuffer = fs.readFileSync(SRC);

console.log('Pre-cropping source to the band containing the couple, then resizing…');
const srcMeta = await sharp(inputBuffer).rotate().metadata();
const cropTop = Math.round(srcMeta.height * 0.18);
const cropH = srcMeta.height - cropTop;

const downscaled = await sharp(inputBuffer)
  .rotate()
  .extract({ left: 0, top: cropTop, width: srcMeta.width, height: cropH })
  .resize({ width: 1300, withoutEnlargement: true, fit: 'inside' })
  .jpeg({ quality: 92 })
  .toBuffer();

console.log('Removing background (downloads ~50MB model on first run)…');
const inputBlob = new Blob([downscaled], { type: 'image/jpeg' });
const blob = await removeBackground(inputBlob, {
  model: 'medium',
  output: { format: 'image/png' },
});
const rawBuffer = Buffer.from(await blob.arrayBuffer());

console.log('Hard-thresholding alpha to drop faint floral / fabric halos…');
async function hardThreshold(buf) {
  const { data: rgba, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < rgba.length; i += 4) {
    rgba[i] = rgba[i] >= 190 ? 255 : 0;
  }
  return await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}
let cutoutBuffer = await hardThreshold(rawBuffer);

console.log('Zeroing the top alpha band so any straggling decoration vanishes…');
async function zeroAlphaAbove(buf, fraction) {
  const { data: rgba, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cutoff = Math.floor(info.height * fraction);
  for (let y = 0; y < cutoff; y++) {
    for (let x = 0; x < info.width; x++) {
      rgba[(y * info.width + x) * 4 + 3] = 0;
    }
  }
  return await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}
cutoutBuffer = await zeroAlphaAbove(cutoutBuffer, 0.05);

console.log('Flood-filling from torso seeds so only the couple blobs survive…');
async function floodFillOnly(buf, seeds) {
  const { data: rgba, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W2 = info.width, H2 = info.height;
  const visited = new Uint8Array(W2 * H2);
  const stack = [];
  for (const [sx, sy] of seeds) {
    const idx = sy * W2 + sx;
    if (rgba[idx * 4 + 3] > 200 && !visited[idx]) {
      visited[idx] = 1;
      stack.push(sx, sy);
    } else {
      console.warn('  seed (' + sx + ',' + sy + ') is not opaque — skipping');
    }
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    const neighbors = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= W2 || ny >= H2) continue;
      const ni = ny * W2 + nx;
      if (visited[ni]) continue;
      if (rgba[ni * 4 + 3] <= 200) continue;
      visited[ni] = 1;
      stack.push(nx, ny);
    }
  }
  for (let i = 0; i < W2 * H2; i++) {
    if (!visited[i]) rgba[i * 4 + 3] = 0;
  }
  return await sharp(rgba, { raw: { width: W2, height: H2, channels: 4 } })
    .png()
    .toBuffer();
}
const seedMeta = await sharp(cutoutBuffer).metadata();
const SW = seedMeta.width, SH = seedMeta.height;
cutoutBuffer = await floodFillOnly(cutoutBuffer, [
  [Math.floor(SW * 0.27), Math.floor(SH * 0.75)],
  [Math.floor(SW * 0.65), Math.floor(SH * 0.75)],
]);

console.log('Tight-cropping the combined couple silhouette…');
const { data, info } = await sharp(cutoutBuffer).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, ch = info.channels;
const ALPHA = 200;
let top = H, bottom = 0, leftMin = W, rightMax = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * ch + 3] > ALPHA) {
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < leftMin) leftMin = x;
      if (x > rightMax) rightMax = x;
    }
  }
}

const padX = 12, padY = 12;
const tightLeft = Math.max(0, leftMin - padX);
const tightTop = Math.max(0, top - padY);
const tightW = Math.min(W, rightMax + padX) - tightLeft;
const tightH = Math.min(H, bottom + padY) - tightTop;
console.log('  bbox:', leftMin + '..' + rightMax, '×', top + '..' + bottom, '→', tightW + 'x' + tightH);

const outPath = path.join(OUT_DIR, OUT_FILE);
await sharp(cutoutBuffer)
  .extract({ left: tightLeft, top: tightTop, width: tightW, height: tightH })
  .resize({ height: 1500, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(outPath);

const m = await sharp(outPath).metadata();
console.log('Saved', outPath, m.width + 'x' + m.height, '(' + (fs.statSync(outPath).size / 1024).toFixed(0) + ' KB)');
console.log('Done.');
