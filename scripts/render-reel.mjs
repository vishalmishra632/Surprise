/* eslint-disable no-console */
/*
 * Renders the journey to public/reel.mp4 — the file that the mobile
 * "Download reel video" button serves.
 *
 * What it does:
 *   1. Probes public/audio/satranga.mp3 to get the song's exact length.
 *   2. Spins up a headless Chromium at 1080×1920.
 *   3. Loads the production URL (or http://localhost:5173 if dev=1).
 *   4. Clicks "Walk the road" so audio is unlocked + the scene is up.
 *   5. Auto-scrolls top-to-bottom over `song length − proposal budget`
 *      using a constant linear pace (matches the in-app auto-scroll).
 *   6. At the proposal scene, taps NO twice (the dodge animation) and
 *      then YES (heart fireworks reveal).
 *   7. Stops Playwright video recording.
 *   8. Muxes the recorded WebM with the original MP3 via ffmpeg, writes
 *      H.264/AAC public/reel.mp4 of exactly the song's length.
 *
 * Run:
 *   npm install --save-dev playwright fluent-ffmpeg ffmpeg-static ffprobe-static
 *   npx playwright install chromium
 *   npm run render-reel              (renders against the live URL)
 *   npm run render-reel -- --dev     (renders against localhost:5173)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const USE_DEV = args.has('--dev');
const DEV_PORT = process.env.VITE_PORT || '5174';
const TARGET_URL = USE_DEV
  ? `http://localhost:${DEV_PORT}`
  : 'https://surprise-nine-chi.vercel.app';

const TMP_DIR = path.join(ROOT, 'tmp/render');
const FINAL_PATH = path.join(ROOT, 'public/reel.mp4');

// Hard-coded 60s output for Instagram Reels. The user uploads the
// silent video and Instagram's editor adds whatever song they pick.
const TARGET_DURATION_S = 60;
// Time spent on the proposal moment after scroll completes — enough
// to see NO dodge twice + the YES fireworks beat.
const PROPOSAL_BUDGET_S = 5;
const SCROLL_FPS = 30;

// ----- helpers -----
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobeStatic.path);

function probeDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, data) => {
      if (err) return reject(err);
      const dur = data?.format?.duration;
      if (typeof dur !== 'number') {
        return reject(new Error('Could not read duration from ' + file));
      }
      resolve(dur);
    });
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clearDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

async function render() {
  const totalDuration = TARGET_DURATION_S;
  const scrollDuration = Math.max(20, totalDuration - PROPOSAL_BUDGET_S);
  console.log(
    `Target: ${totalDuration}s · Scroll: ${scrollDuration.toFixed(1)}s · Proposal beat: ${PROPOSAL_BUDGET_S}s · audio: silent`,
  );

  clearDir(TMP_DIR);

  console.log(`Launching headless Chromium → ${TARGET_URL}`);
  const browser = await chromium.launch({
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-blink-features=AutomationControlled',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: TMP_DIR,
      size: { width: 1080, height: 1920 },
    },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.warn('  [page error]', msg.text());
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60_000 });
  console.log('Page loaded — waiting for the gate…');

  // The Gate button is "Walk the road" — that click both dismisses
  // the gate and unlocks audio playback.
  await page.waitForSelector('button.gate-enter', { timeout: 30_000 });
  await page.click('button.gate-enter');
  console.log('Gate dismissed.');

  // Brief settle for scene first paint.
  await page.waitForTimeout(900);

  // Linear scroll over `scrollDuration`. We tick at 30fps because
  // Playwright's recordVideo runs around that and there's no benefit
  // to going higher.
  console.log('Auto-scrolling…');
  const tickMs = 1000 / SCROLL_FPS;
  const startedAt = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const elapsed = (Date.now() - startedAt) / 1000;
    const t = Math.min(1, elapsed / scrollDuration);
    await page.evaluate((frac) => {
      const max =
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
        window.innerHeight;
      window.scrollTo(0, frac * max);
    }, t);
    if (t >= 1) break;
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(tickMs);
  }
  console.log('Scroll complete.');

  // Brief settle so the proposal scene reaches full opacity.
  await page.waitForTimeout(900);

  // The NO button moves on every interaction (mouseenter / focus /
  // touchstart / click) via dodgeNo. Tapping it twice produces two
  // visible jumps before the YES tap. Tighter cadence so the whole
  // beat fits the 5s proposal budget.
  console.log('Tapping NO twice, then YES…');
  await page.waitForSelector('.proposal-btn-no', { timeout: 8000 });
  await page.click('.proposal-btn-no', { force: true });
  await page.waitForTimeout(550);
  await page.click('.proposal-btn-no', { force: true });
  await page.waitForTimeout(550);
  await page.click('.proposal-btn-yes', { force: true });
  // Heart fireworks + "She said yes" reveal — soak the rest of the
  // proposal budget, but never more than ~3s so the file doesn't run
  // long after YES.
  const proposalUsedSoFar = 0.9 + 0.55 + 0.55 + 0.1;
  const fireworksLeft = Math.max(1.5, PROPOSAL_BUDGET_S - proposalUsedSoFar);
  await page.waitForTimeout(Math.min(3, fireworksLeft) * 1000);

  console.log('Closing browser to flush the recording…');
  const videoHandle = page.video();
  await context.close();
  await browser.close();

  if (!videoHandle) throw new Error('Playwright did not produce a video.');
  const rawVideoPath = await videoHandle.path();
  console.log(`Recorded ${path.basename(rawVideoPath)}.`);

  // Encode the recorded WebM to a silent H.264 MP4 trimmed to exactly
  // TARGET_DURATION_S. No audio — the user adds a song in Instagram's
  // editor on upload.
  console.log(`Encoding final ${path.relative(ROOT, FINAL_PATH)} (silent, ${TARGET_DURATION_S}s)…`);
  ensureDir(path.dirname(FINAL_PATH));
  if (fs.existsSync(FINAL_PATH)) fs.unlinkSync(FINAL_PATH);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(rawVideoPath)
      .outputOptions([
        '-map', '0:v:0',
        '-an',           // no audio
        '-c:v', 'libx264',
        '-preset', 'medium',
        // 60s clip can run a touch higher quality than the 270s one and
        // still fit GitHub's 100 MB cap easily — bumped maxrate so the
        // moving road and photo edges stay crisp.
        '-crf', '24',
        '-maxrate', '4500k',
        '-bufsize', '9000k',
        '-pix_fmt', 'yuv420p',
        '-r', String(SCROLL_FPS),
        '-movflags', '+faststart',
        '-t', TARGET_DURATION_S.toFixed(3),
      ])
      .output(FINAL_PATH)
      .on('start', (cmd) => console.log('  ffmpeg:', cmd.split(' ').slice(0, 8).join(' '), '…'))
      .on('progress', (p) => {
        if (p.percent != null) {
          process.stdout.write(`  encoding ${p.percent.toFixed(0)}%\r`);
        }
      })
      .on('end', () => {
        process.stdout.write('\n');
        resolve();
      })
      .on('error', reject)
      .run();
  });

  const sizeMb = (fs.statSync(FINAL_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Done. ${path.relative(ROOT, FINAL_PATH)} · ${sizeMb} MB`);
}

render().catch((err) => {
  console.error('render-reel failed:', err);
  process.exit(1);
});
