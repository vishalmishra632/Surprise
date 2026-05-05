# Surprise — A Road Through Us

A scrolling 3D engagement journey for Vanshika, built with **Vite + React + React Three Fiber + Three.js**.

## Run locally

```bash
npm install
npm run dev          # Vite dev server on :5173
npm run build        # static production build → dist/
```

## Deploy to Vercel

This project ships with a [vercel.json](vercel.json) that pins the framework, build command, and output directory. Two ways to deploy:

**a. From the Vercel dashboard (recommended)**

1. Go to <https://vercel.com/new>.
2. Click **Import Git Repository** and pick `vishalmishra632/Surprise`.
3. Accept the auto-detected Vite framework. Click **Deploy**. Done in ~1 min.

**b. From the CLI**

```bash
npm i -g vercel       # one-time
vercel                # first run prompts you to log in via browser
vercel --prod         # publishes to the production URL
```

## Reel mode

The bottom-left gear icon opens a panel with:

- **Aspect-ratio picker** — Native, 9:16 Reel (1080×1920), 16:9, 1:1, 4:3.
- **Auto-scroll pace** — 1 / 2 / 3 / 4 / 6 minutes.
- **Auto-scroll the journey** — smoothly scrolls top to bottom over the chosen pace. Works on the outer page (phone) or inside the iframe (desktop reel preview).
- **Record** *(desktop only)* — Region-Capture-cropped MP4/H.264 (or WebM fallback) of the iframe contents. Auto-scroll variant or manual-scroll variant.

## Phone screen-record workflow

1. Deploy to Vercel.
2. Open the URL on your phone in portrait Safari / Chrome.
3. Tap **Begin** (so audio is unlocked).
4. Tap the gear, pick a pace, tap **Auto-scroll the journey**.
5. Start your phone's screen recorder. Wait for the scroll to finish, stop the recording.
6. Native MP4 at the phone's full resolution, ready for Instagram.
