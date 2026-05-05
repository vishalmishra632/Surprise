import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChapterMedia, ChapterSpec } from '../types';

type Props = {
  chapter: ChapterSpec;
  /** True only when this billboard is the focal sign on screen. */
  visible: boolean;
};

/**
 * Smart cover for a billboard. Three modes:
 *
 *   image+video  → image fades into a sequenced muted video on focus
 *                  (parent chapters with both media kinds; cinematic)
 *   image-only   → just the still image (most sub-billboards)
 *   video-only   → single video element that plays on focus, paused
 *                  on still; or, if specialMoment, stays paused with
 *                  the hint overlay (proposal clip, Varanasi InShot)
 */
export function BillboardCover({ chapter, visible }: Props) {
  const firstImage = useMemo(
    () => chapter.media.find((m) => m.kind === 'image'),
    [chapter.media],
  );
  const videos = useMemo(
    () => chapter.media.filter((m) => m.kind === 'video'),
    [chapter.media],
  );

  const isSpecial = !!chapter.specialMoment;
  const cover = chapter.media[0];

  if (!cover) return null;

  // VIDEO-ONLY MODE — single video paused/played based on focus
  if (!firstImage && videos.length > 0) {
    return (
      <VideoOnlyCover
        chapter={chapter}
        video={videos[0]}
        visible={visible}
        isSpecial={isSpecial}
      />
    );
  }

  // IMAGE+VIDEO or IMAGE-ONLY MODE
  return (
    <ImageWithSequenceCover
      chapter={chapter}
      firstImage={firstImage!}
      videos={videos}
      visible={visible}
      isSpecial={isSpecial}
    />
  );
}

// -----------------------------------------------------------------
// Video-only cover (sub-billboards whose single media is a video)
// -----------------------------------------------------------------
function VideoOnlyCover({
  chapter,
  video,
  visible,
  isSpecial,
}: {
  chapter: ChapterSpec;
  video: ChapterMedia;
  visible: boolean;
  isSpecial: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rotated videos (Varanasi InShot) play sideways on the small cover —
  // for those we still mount the element so we get a poster frame, but
  // we never autoplay them. The detail view handles the rotation.
  const rotated = !!video.rotate;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // The proposal-video cover plays muted on the road so it doesn't
    // glide past as a static thumbnail. Rotated clips stay paused —
    // sideways playback on a portrait cover frame looks wrong.
    const canAutoplay = visible && !rotated;
    if (canAutoplay) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [visible, rotated]);

  // Hide the "something changed here…" hint once the cover is actually
  // playing — the live video itself is the moment, no overlay needed.
  const isAutoplaying = visible && !rotated;
  const showHint = isSpecial && !!chapter.coverHint && !isAutoplaying;
  const totalCount = chapter.media.length;

  return (
    <span className={`cover ${chapter.cinematic ? 'is-cinematic' : ''}`}>
      <video
        ref={videoRef}
        className="cover-img"
        src={video.src}
        muted
        playsInline
        loop
        preload="metadata"
        // poster a few ms in so the element renders something instead of
        // a black square while metadata loads
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (!visible || isSpecial || rotated) v.currentTime = 0.05;
        }}
      />
      {chapter.cinematic && <span className="cover-warm" />}
      {showHint && (
        <span className="cover-hint">
          <span className="cover-hint-text">{chapter.coverHint}</span>
        </span>
      )}
      <span className="board-frame-corner board-frame-corner--tl" />
      <span className="board-frame-corner board-frame-corner--tr" />
      <span className="board-frame-corner board-frame-corner--bl" />
      <span className="board-frame-corner board-frame-corner--br" />
      {totalCount > 1 && (
        <span className="board-count">+{totalCount - 1}</span>
      )}
    </span>
  );
}

// -----------------------------------------------------------------
// Image + (optional) video sequence cover
// -----------------------------------------------------------------
function ImageWithSequenceCover({
  chapter,
  firstImage,
  videos,
  visible,
  isSpecial,
}: {
  chapter: ChapterSpec;
  firstImage: ChapterMedia;
  videos: ChapterMedia[];
  visible: boolean;
  isSpecial: boolean;
}) {
  // Only autoplay sequenced videos when the chapter has any AND it is
  // not a special-moment chapter. Rotated videos are also skipped
  // because their sideways playback on the small cover looks wrong.
  const playableVideos = useMemo(
    () => videos.filter((v) => !v.rotate),
    [videos],
  );
  const enableSequence = playableVideos.length > 0 && !isSpecial;

  const [showVideo, setShowVideo] = useState(false);
  const [videoIdx, setVideoIdx] = useState(0);
  const fadeTimer = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!enableSequence) return;
    if (visible) {
      fadeTimer.current = window.setTimeout(() => setShowVideo(true), 1100);
    } else {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      setShowVideo(false);
      setVideoIdx(0);
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    }
    return () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, [visible, enableSequence]);

  const advance = () => {
    if (playableVideos.length <= 1) return;
    setVideoIdx((idx) => (idx + 1) % playableVideos.length);
  };

  const showHint = isSpecial && chapter.coverHint;
  const totalCount = chapter.media.length;

  return (
    <span className={`cover ${chapter.cinematic ? 'is-cinematic' : ''}`}>
      <img
        className={`cover-img ${showVideo ? 'is-fading' : ''}`}
        src={firstImage.src}
        alt={chapter.title}
        loading="lazy"
        decoding="async"
      />
      {enableSequence && showVideo && playableVideos[videoIdx] && (
        <video
          key={`${chapter.id}-${videoIdx}`}
          ref={videoRef}
          className="cover-video"
          src={playableVideos[videoIdx].src}
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={advance}
        />
      )}
      {chapter.cinematic && <span className="cover-warm" />}
      {showHint && (
        <span className="cover-hint">
          <span className="cover-hint-text">{chapter.coverHint}</span>
        </span>
      )}
      <span className="board-frame-corner board-frame-corner--tl" />
      <span className="board-frame-corner board-frame-corner--tr" />
      <span className="board-frame-corner board-frame-corner--bl" />
      <span className="board-frame-corner board-frame-corner--br" />
      {totalCount > 1 && (
        <span className="board-count">+{totalCount - 1}</span>
      )}
    </span>
  );
}
