import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAPTERS } from '../billboards';
import { useJourneyStore } from '../store';

export function DetailView() {
  const chapterId = useJourneyStore((s) => s.detailChapterId);
  const mediaIndex = useJourneyStore((s) => s.detailMediaIndex);
  const closeDetail = useJourneyStore((s) => s.closeDetail);
  const stepDetailMedia = useJourneyStore((s) => s.stepDetailMedia);

  const chapter = useMemo(
    () => (chapterId ? CHAPTERS.find((c) => c.id === chapterId) ?? null : null),
    [chapterId],
  );
  const media = chapter ? chapter.media[mediaIndex] : undefined;

  // For special-moment chapters, the first time the viewer reaches a video
  // we show a "click to reveal" overlay so the moment lands deliberately
  // instead of the video just punching in.
  const [revealed, setRevealed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset reveal whenever the chapter changes or the user steps to a new media
  useEffect(() => {
    setRevealed(false);
  }, [chapterId, mediaIndex]);

  // If the current media isn't a video, the special overlay doesn't apply
  useEffect(() => {
    if (media?.kind !== 'video') setRevealed(true);
  }, [media]);

  useEffect(() => {
    if (!chapter) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [chapter]);

  useEffect(() => {
    if (!chapter) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDetail();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        stepDetailMedia(1, chapter.media.length);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        stepDetailMedia(-1, chapter.media.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chapter, closeDetail, stepDetailMedia]);

  if (!chapter) return null;

  const hasMultiple = chapter.media.length > 1;
  const showSpecialOverlay =
    !!chapter.specialMoment && media?.kind === 'video' && !revealed;
  const cinematic = !!chapter.cinematic;

  const reveal = () => {
    setRevealed(true);
    // Give the fade-out a tick before play so the overlay isn't ripped away
    window.setTimeout(() => videoRef.current?.play().catch(() => {}), 120);
  };

  return (
    <div
      className={`detail ${cinematic ? 'is-cinematic' : ''} ${
        chapter.specialMoment && revealed ? 'is-focusing' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={chapter.title}
    >
      <div className="detail-bg" />

      <button type="button" className="detail-back" onClick={closeDetail}>
        <span aria-hidden="true">←</span>
        <span>Back</span>
      </button>

      <div className="detail-inner">
        <div className="detail-text">
          <div className="detail-kicker">{chapter.date}</div>
          <h1 className="detail-title">{chapter.title}</h1>
          <p className="detail-caption">{chapter.caption}</p>
          {chapter.body && <p className="detail-body">{chapter.body}</p>}
          {chapter.media.length > 0 && (
            <div className="detail-counter">
              {mediaIndex + 1}{' '}
              <span className="detail-counter-divider">/</span>{' '}
              {chapter.media.length}
            </div>
          )}
        </div>

        <div className="detail-stage">
          {hasMultiple && (
            <button
              type="button"
              className="detail-arrow detail-arrow--up"
              onClick={() => stepDetailMedia(-1, chapter.media.length)}
              aria-label="Previous"
            >
              ↑
            </button>
          )}

          {media ? (
            <div
              className={`detail-frame ${cinematic ? 'is-cinematic' : ''}`}
              key={`${chapter.id}-${mediaIndex}`}
            >
              {media.kind === 'image' ? (
                <img src={media.src} alt={`${chapter.title} ${mediaIndex + 1}`} />
              ) : media.rotate ? (
                <div className="detail-video-rotate" data-rotate={media.rotate}>
                  <video
                    ref={videoRef}
                    src={media.src}
                    controls
                    autoPlay={!chapter.specialMoment}
                    playsInline
                    loop
                    muted
                  />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={media.src}
                  controls
                  autoPlay={!chapter.specialMoment}
                  playsInline
                  loop
                />
              )}

              {cinematic && (
                <>
                  <div className="cinematic-warm" aria-hidden="true" />
                  <div className="cinematic-vignette" aria-hidden="true" />
                </>
              )}

              {showSpecialOverlay && (
                <button
                  type="button"
                  className="moment-overlay"
                  onClick={reveal}
                  aria-label="Reveal this moment"
                >
                  <span className="moment-text">
                    {chapter.coverHint || 'something changed here…'}
                  </span>
                  <span className="moment-play" aria-hidden="true">
                    ▶
                  </span>
                  <span className="moment-sub">tap to step in</span>
                </button>
              )}
            </div>
          ) : (
            <div className="detail-frame detail-frame--empty">
              <div className="detail-frame-mark">{chapter.title}</div>
              <div className="detail-frame-sub">{chapter.date}</div>
            </div>
          )}

          {hasMultiple && (
            <button
              type="button"
              className="detail-arrow detail-arrow--down"
              onClick={() => stepDetailMedia(1, chapter.media.length)}
              aria-label="Next"
            >
              ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
