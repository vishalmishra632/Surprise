import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const TARGETS = [
  'src/assets/memories/engagement',
  'src/assets/memories/Proposed',
  'src/assets/memories/Udaipur',
  'src/assets/memories/Varansai',
  'src/assets/memories/Chandigarh',
  'src/assets/memories/Ambala',
  'src/assets/memories/Delhi',
  'src/assets/memories/roka',
  'src/assets/memories/proposal',
  // duplicate copies that pre-date the src/assets layout
  'images',
  'public/media',
  'memories/Ambala',
  'memories/Chandigarh',
  'memories/Delhi',
  'memories/Udaipur',
  'memories/Varansai',
];

const MAX_DIM = 2400;
const QUALITY = 82;
const MIN_BYTES = 1.0 * 1024 * 1024; // skip files already under 1.0 MB

let savedTotal = 0;
let compressedCount = 0;

for (const dir of TARGETS) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    const p = path.join(dir, f);
    const before = fs.statSync(p).size;
    if (before < MIN_BYTES) continue;

    const tmp = p + '.tmp.jpg';
    await sharp(p, { failOn: 'none' })
      .rotate()
      .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toFile(tmp);
    fs.renameSync(tmp, p);
    const after = fs.statSync(p).size;
    savedTotal += before - after;
    compressedCount++;
    console.log(`${p}  ${(before / 1e6).toFixed(1)}M → ${(after / 1e6).toFixed(1)}M`);
  }
}

console.log('---');
console.log(`Compressed ${compressedCount} file(s). Saved ${(savedTotal / 1e6).toFixed(0)} MB.`);
