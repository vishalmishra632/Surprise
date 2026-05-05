import { useEffect, useRef, useState } from 'react';
import { useJourneyStore } from '../store';

type AspectKey = 'native' | '9:16' | '16:9' | '1:1' | '4:3';

type AspectSpec = {
  width: number;
  height: number;
  label: string;
  hint: string;
};

const ASPECTS: Record<Exclude<AspectKey, 'native'>, AspectSpec> = {
  '9:16': { width: 1080, height: 1920, label: '9 : 16', hint: 'Reel · 1080 × 1920' },
  '16:9': { width: 1920, height: 1080, label: '16 : 9', hint: 'Wide · 1920 × 1080' },
  '1:1':  { width: 1080, height: 1080, label: '1 : 1',  hint: 'Square · 1080 × 1080' },
  '4:3':  { width: 1440, height: 1080, label: '4 : 3',  hint: 'Classic · 1440 × 1080' },
};

// Default to a slow, cinematic 3 minutes for the auto-scroll, with the
// user able to pick a longer/shorter pace. 60s is too quick on the
// engagement-length journey — billboards blur past.
const DEFAULT_DURATION_MS = 180_000;
const RECORD_TAIL_MS = 1_500;

const DURATION_PRESETS: Array<{ ms: number; label: string }> = [
  { ms: 60_000,  label: '1 min' },
  { ms: 120_000, label: '2 min' },
  { ms: 180_000, label: '3 min' },
  { ms: 240_000, label: '4 min' },
  { ms: 360_000, label: '6 min' },
];

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatMins(ms: number): string {
  const total = Math.round(ms / 1000);
  if (total < 60) return `${total} s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}

type MimeChoice = { mime: string; ext: 'mp4' | 'webm' };

function pickRecorderMime(): MimeChoice | undefined {
  // Prefer MP4 (H.264 + AAC) so the file plays everywhere — Instagram,
  // QuickTime, the Photos app, Windows. Browsers that can record MP4
  // directly (Chrome/Edge 134+, Safari 16.4+) take this path. Falls
  // back to WebM (VP9 / VP8) when MP4 is unsupported.
  const candidates: MimeChoice[] = [
    { mime: 'video/mp4;codecs=avc1.640034,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4;codecs=avc1.640033,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4;codecs=avc1.640028,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4;codecs=h264,aac', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' },
  ];
  for (const choice of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(choice.mime)) {
      return choice;
    }
  }
  return undefined;
}

export function ReelMode() {
  const setReelActive = useJourneyStore((s) => s.setReelActive);

  const [aspect, setAspect] = useState<AspectKey>('native');
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [scrolling, setScrolling] = useState(false);
  const [recording, setRecording] = useState<false | 'auto' | 'manual'>(false);
  const [progressPct, setProgressPct] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [scrollDurationMs, setScrollDurationMs] = useState<number>(DEFAULT_DURATION_MS);
  const [status, setStatus] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const discardOnStopRef = useRef(false);

  // Sync the global reel flag (mutes outer audio + lets Journey know to hide).
  useEffect(() => {
    setReelActive(aspect !== 'native');
  }, [aspect, setReelActive]);

  // Re-fit the inner frame on viewport change.
  useEffect(() => {
    if (aspect === 'native') return;
    const dims = ASPECTS[aspect];
    const recompute = () => {
      const padX = 96;
      const padY = 160;
      const sw = window.innerWidth - padX;
      const sh = window.innerHeight - padY;
      const next = Math.min(sw / dims.width, sh / dims.height, 1);
      setScale(Number.isFinite(next) && next > 0 ? next : 0.3);
    };
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [aspect]);

  const cancelScrollLoop = () => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  };

  const stopRecorder = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === 'recording') recorder.stop();
    const stream = recorderStreamRef.current;
    stream?.getTracks().forEach((t) => t.stop());
    recorderStreamRef.current = null;
    recorderRef.current = null;
  };

  const stopElapsedTimer = () => {
    if (elapsedTimerRef.current !== null) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  };

  // Drive a smooth top-to-bottom scroll over `durationMs`. When a reel
  // iframe is mounted (desktop layout-preview / record), drive its
  // contentWindow; otherwise drive the outer window (phone screen-record
  // workflow — open the page on a phone, tap auto-scroll, hit the OS
  // screen-recorder). Lenis sees each scrollTo as a native scroll event
  // and catches up — no need to disable it.
  const runAutoScroll = (durationMs: number = DEFAULT_DURATION_MS) =>
    new Promise<void>((resolve) => {
      const iframe = iframeRef.current;
      const useIframe = !!(iframe && iframe.contentWindow && iframe.contentDocument);
      const win = useIframe ? (iframe!.contentWindow as Window) : window;
      const doc = useIframe ? (iframe!.contentDocument as Document) : document;

      win.scrollTo(0, 0);
      setScrolling(true);
      setProgressPct(0);

      // Brief settle period so the gate has time to render before scroll starts.
      const startDelay = 600;
      const t0 = performance.now() + startDelay;

      const tick = (now: number) => {
        if (now < t0) {
          scrollRafRef.current = requestAnimationFrame(tick);
          return;
        }
        const elapsed = now - t0;
        const t = Math.min(1, elapsed / durationMs);
        // ease in-out cubic — gentle ramp at both ends, steady through middle
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const maxScroll = Math.max(
          0,
          (doc.documentElement.scrollHeight || doc.body.scrollHeight) - win.innerHeight,
        );
        win.scrollTo(0, eased * maxScroll);
        setProgressPct(t * 100);

        if (t < 1) {
          scrollRafRef.current = requestAnimationFrame(tick);
        } else {
          scrollRafRef.current = null;
          setScrolling(false);
          setProgressPct(100);
          resolve();
        }
      };
      scrollRafRef.current = requestAnimationFrame(tick);
    });

  const startAutoScroll = async () => {
    if (scrolling || recording) return;
    setStatus(`auto-scrolling · ${formatMins(scrollDurationMs)} · keep this tab focused`);
    await runAutoScroll(scrollDurationMs);
    setStatus('auto-scroll done');
    window.setTimeout(() => setStatus(''), 2400);
  };

  const startRecord = async (mode: 'auto' | 'manual') => {
    if (recording || scrolling) return;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setStatus('this browser cannot record the tab');
      return;
    }

    setStatus('pick this tab in the share dialog…');

    // Ask getDisplayMedia for the current tab specifically — required so
    // Region Capture (CropTarget + cropTo) can crop the stream to the
    // iframe afterwards. Resolution constraints aim for 4K-class output;
    // the browser caps to whatever the source surface can actually
    // produce (typically the iframe's rendered pixels times DPR).
    const captureRequest: MediaStreamConstraints & Record<string, unknown> = {
      video: {
        frameRate: { ideal: 60, max: 60 },
        width: { ideal: 3840 },
        height: { ideal: 3840 },
      },
      audio: true,
      preferCurrentTab: true,
      selfBrowserSurface: 'include',
      surfaceSwitching: 'exclude',
      systemAudio: 'exclude',
    };

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia(captureRequest);
    } catch (err) {
      console.warn('display capture cancelled', err);
      setStatus('recording cancelled');
      window.setTimeout(() => setStatus(''), 2400);
      return;
    }

    // Region Capture: crop the captured stream to just the iframe
    // element so the panel chrome / dark backdrop stay out of the file.
    // Chromium 104+; falls through silently on Safari / Firefox.
    const iframeEl = iframeRef.current;
    const CropTargetCtor = (window as unknown as {
      CropTarget?: { fromElement: (el: Element) => Promise<unknown> };
    }).CropTarget;
    const videoTrack = stream.getVideoTracks()[0] as MediaStreamTrack & {
      cropTo?: (target: unknown) => Promise<void>;
    };
    let cropped = false;
    if (iframeEl && CropTargetCtor && typeof videoTrack?.cropTo === 'function') {
      try {
        const target = await CropTargetCtor.fromElement(iframeEl);
        await videoTrack.cropTo(target);
        cropped = true;
      } catch (cropErr) {
        console.warn('region-capture crop failed', cropErr);
      }
    }

    const choice = pickRecorderMime();
    if (!choice) {
      stream.getTracks().forEach((t) => t.stop());
      setStatus('no supported video codec in this browser');
      return;
    }
    const { mime, ext } = choice;

    const chunks: Blob[] = [];
    // Push the video bitrate up so the reel reads sharp at higher
    // capture resolutions. 25 Mbps for H.264 (MP4) is broadcast-grade
    // for 1080p and still fine for 4K-ish clips; VP9 holds detail at
    // 18 Mbps because of its better compression.
    const videoBitsPerSecond = ext === 'mp4'
      ? 25_000_000
      : mime.includes('vp9')
        ? 18_000_000
        : 12_000_000;
    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond,
      audioBitsPerSecond: 192_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      if (discardOnStopRef.current) {
        // The user pressed Cancel — drop the chunks instead of saving.
        discardOnStopRef.current = false;
        chunks.length = 0;
        return;
      }
      const blob = new Blob(chunks, { type: mime.split(';')[0] });
      downloadBlob(blob, `journey-${aspect.replace(':', 'x')}-${mode}-${Date.now()}.${ext}`);
      setStatus(`recording saved · .${ext}`);
      window.setTimeout(() => setStatus(''), 3000);
    };
    // If the user revokes the share via the browser's stop-sharing UI,
    // tear everything down cleanly.
    stream.getVideoTracks()[0]?.addEventListener('ended', () => {
      cancelScrollLoop();
      stopRecorder();
      stopElapsedTimer();
      setRecording(false);
      setScrolling(false);
    });

    recorderRef.current = recorder;
    recorderStreamRef.current = stream;
    setRecording(mode);
    setElapsedMs(0);
    recorder.start(250);

    if (mode === 'auto') {
      try {
        await runAutoScroll(scrollDurationMs);
      } finally {
        // Tail buffer so the final frame renders into the recorder.
        await new Promise((r) => window.setTimeout(r, RECORD_TAIL_MS));
        stopRecorder();
        setRecording(false);
      }
    } else {
      // Manual mode: keep recording until the user clicks ■ Stop. Reset
      // the iframe scroll to top so the user starts at the gate, then
      // run an elapsed-time clock while the recorder runs.
      iframeRef.current?.contentWindow?.scrollTo(0, 0);
      setStatus(
        cropped
          ? 'recording reel only · scroll inside the iframe, press ■ Stop when done'
          : 'recording (full tab — your browser doesn\'t support iframe-only crop) · ■ Stop when done',
      );
      const startedAt = performance.now();
      elapsedTimerRef.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startedAt);
      }, 200);
    }
  };

  const stopManualRecord = async () => {
    if (recording !== 'manual') return;
    setStatus('saving recording…');
    stopElapsedTimer();
    // Brief tail so the last frame the user scrolled to lands in the file.
    await new Promise((r) => window.setTimeout(r, RECORD_TAIL_MS));
    stopRecorder();
    setRecording(false);
  };

  const cancelAll = () => {
    discardOnStopRef.current = true;
    cancelScrollLoop();
    stopElapsedTimer();
    stopRecorder();
    setRecording(false);
    setScrolling(false);
    setStatus('cancelled — recording discarded');
    window.setTimeout(() => setStatus(''), 2000);
  };

  // ESC closes panel, also cancels in-flight recording.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (recording || scrolling) cancelAll();
      else if (open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, scrolling, open]);

  const isReel = aspect !== 'native';
  const dims = isReel ? ASPECTS[aspect as Exclude<AspectKey, 'native'>] : null;

  return (
    <>
      {isReel && dims && (
        <div className="reel-stage" data-recording={recording ? '1' : '0'}>
          <div
            className="reel-frame"
            style={{
              width: dims.width,
              height: dims.height,
              transform: `translate(-50%, -50%) scale(${scale})`,
            }}
          >
            <iframe
              ref={iframeRef}
              src="/?reel=1"
              title="Journey reel preview"
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        className={`reel-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open reel layout & recording panel"
        title="Reel layout & recording"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      {open && (
        <div className="reel-panel" role="dialog" aria-label="Reel layout & recording">
          <header className="reel-panel-header">
            <span>Reel mode</span>
            <button
              type="button"
              className="reel-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close panel"
            >
              ×
            </button>
          </header>

          <div className="reel-panel-section">
            <div className="reel-panel-label">Aspect ratio</div>
            <div className="reel-aspect-grid">
              <button
                type="button"
                className={`reel-aspect ${aspect === 'native' ? 'is-active' : ''}`}
                onClick={() => setAspect('native')}
              >
                <span className="reel-aspect-label">Native</span>
                <span className="reel-aspect-hint">your full browser window</span>
              </button>
              {(Object.keys(ASPECTS) as Array<Exclude<AspectKey, 'native'>>).map((key) => {
                const spec = ASPECTS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`reel-aspect ${aspect === key ? 'is-active' : ''}`}
                    onClick={() => setAspect(key)}
                  >
                    <span className="reel-aspect-label">{spec.label}</span>
                    <span className="reel-aspect-hint">{spec.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="reel-panel-section">
            <div className="reel-panel-label">Auto-scroll pace</div>
            <div className="reel-duration-grid">
              {DURATION_PRESETS.map(({ ms, label }) => (
                <button
                  key={ms}
                  type="button"
                  className={`reel-duration ${scrollDurationMs === ms ? 'is-active' : ''}`}
                  onClick={() => setScrollDurationMs(ms)}
                  disabled={!!scrolling || !!recording}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="reel-panel-section">
            <div className="reel-panel-label">
              {isReel ? 'Auto-scroll & record (in iframe)' : 'Auto-scroll the page'}
            </div>
            <div className="reel-actions">
              <button
                type="button"
                className="reel-action"
                onClick={startAutoScroll}
                disabled={!!scrolling || !!recording}
                title={
                  isReel
                    ? 'Smoothly scrolls the iframe from top to bottom over the chosen duration.'
                    : 'Smoothly scrolls the whole page from top to bottom — open this on your phone, hit auto-scroll, and use the OS screen recorder for the cleanest reel.'
                }
              >
                Auto-scroll the journey ({formatMins(scrollDurationMs)})
              </button>
              {isReel && (
                <>
                  <button
                    type="button"
                    className="reel-action is-record"
                    onClick={() => startRecord('auto')}
                    disabled={!!scrolling || !!recording}
                    title={`Records the iframe while it auto-scrolls top-to-bottom over ${formatMins(scrollDurationMs)}.`}
                  >
                    ● Record · auto-scroll ({formatMins(scrollDurationMs)})
                  </button>
                  <button
                    type="button"
                    className="reel-action is-record-manual"
                    onClick={() => startRecord('manual')}
                    disabled={!!scrolling || !!recording}
                    title="Starts recording immediately — scroll inside the reel yourself, then press ■ Stop when done."
                  >
                    ● Record · manual scroll
                  </button>
                </>
              )}
              {recording === 'manual' && (
                <button
                  type="button"
                  className="reel-action is-stop"
                  onClick={stopManualRecord}
                >
                  ■ Stop &amp; save
                </button>
              )}
              {(scrolling || recording === 'auto') && (
                <button type="button" className="reel-action is-cancel" onClick={cancelAll}>
                  Cancel (discard)
                </button>
              )}
            </div>
            <p className="reel-panel-tip">
              {isReel ? (
                <>
                  Pick <em>this tab</em> in the share dialog. On Chrome / Edge / Safari only the reel iframe is in
                  the file (panel + backdrop stay out) via Region Capture, and the recorder writes a high-bitrate
                  <em> .mp4</em> (H.264 + AAC, 25 Mbps) when the browser supports it — otherwise it falls back to
                  <em> .webm</em>.
                </>
              ) : (
                <>
                  For the cleanest 1080×1920 reel, deploy this page (Vercel works in one click), open the URL on
                  your phone in portrait, tap <em>Begin</em>, then tap <em>Auto-scroll the journey</em> and start
                  the phone's screen recorder — the OS captures at native resolution with audio, and you can share
                  straight to Instagram.
                </>
              )}
            </p>
          </div>

          {(scrolling || recording === 'auto') && (
            <div className="reel-progress">
              <div className="reel-progress-bar" style={{ width: `${progressPct.toFixed(1)}%` }} />
              <span className="reel-progress-label">
                {recording === 'auto' ? 'Recording · auto-scroll' : 'Scrolling'} · {Math.round(progressPct)}%
              </span>
            </div>
          )}

          {recording === 'manual' && (
            <div className="reel-progress is-manual">
              <span className="reel-progress-label is-manual">
                ● Recording · manual · {formatElapsed(elapsedMs)}
              </span>
            </div>
          )}

          {status && <div className="reel-status">{status}</div>}
        </div>
      )}
    </>
  );
}
