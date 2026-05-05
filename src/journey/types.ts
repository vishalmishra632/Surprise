import type { Vector3Tuple } from 'three';

export type PathPoint = Vector3Tuple;

export type ChapterMedia = {
  kind: 'image' | 'video';
  src: string;
  /**
   * Optional rotation in degrees applied at render time. Useful for phone
   * videos whose container metadata says landscape but whose pixels were
   * actually shot in portrait — the browser shows them sideways otherwise.
   */
  rotate?: 90 | 180 | 270;
};

export type LandmarkKind =
  | 'india-gate'
  | 'city-palace'
  | 'mandap'
  | 'ghat'
  | 'mahakal'
  | 'ring'
  | 'rings'
  | 'infinity'
  | 'home';

export type ChapterSpec = {
  id: string;
  /** Where on the road this billboard sits. 0 = start, 1 = end. */
  progress: number;
  /** -1 = left of road, 1 = right, 0 = centered ahead. */
  side: -1 | 0 | 1;
  /** Larger sign for chapter-defining moments. */
  big: boolean;
  /** Place name shown on the sign and detail header. */
  title: string;
  /** Date string shown under the title. */
  date: string;
  /** One-line caption shown on the sign and detail header. */
  caption: string;
  /** Longer narrative shown only in the detail view. */
  body?: string;
  /** All photos / videos for this chapter — first entry is the cover. */
  media: ChapterMedia[];
  /** Iconic monument silhouette to plant beside the billboard. */
  landmark?: LandmarkKind;
  /**
   * Treat this chapter as an emotional highlight. Cover does NOT auto-play.
   * Detail view shows a "click to reveal" overlay over the first video so the
   * viewer steps into it deliberately.
   */
  specialMoment?: boolean;
  /** Overlay copy shown on the cover for special-moment chapters. */
  coverHint?: string;
  /**
   * Apply cinematic treatment to videos in this chapter — slow zoom, soft
   * vignette, warm color overlay. Layered on top of the regular video frame.
   */
  cinematic?: boolean;
};

export type SkyLabelSpec = {
  id: string;
  label: string;
  from: number;
  to: number;
};
