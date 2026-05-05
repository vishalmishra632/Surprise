import type {
  ChapterMedia,
  ChapterSpec,
  LandmarkKind,
  SkyLabelSpec,
} from './types';
import { captionFor } from './captions';

// ----------------------------------------------------------------
// Folder-based asset loader (Vite glob, build-time)
// ----------------------------------------------------------------
const allImages = import.meta.glob<string>(
  '../assets/memories/**/*.{png,jpg,jpeg,JPG,JPEG,PNG}',
  { eager: true, query: '?url', import: 'default' },
);

const allVideos = import.meta.glob<string>(
  '../assets/memories/**/*.{mp4,mov,webm,MP4,MOV,WEBM}',
  { eager: true, query: '?url', import: 'default' },
);

function fromFolder(folder: string, modules: Record<string, string>): string[] {
  const matches = Object.entries(modules)
    .filter(([path]) =>
      path.toLowerCase().includes(`/memories/${folder.toLowerCase()}/`),
    )
    .map(([path, url]) => ({ path, url }));
  matches.sort((a, b) =>
    a.path.localeCompare(b.path, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
  return matches.map((m) => m.url);
}

function splitByYear(images: string[]): { early: string[]; late: string[] } {
  const early: string[] = [];
  const late: string[] = [];
  for (const url of images) {
    if (url.includes('2026') || url.includes('2027')) late.push(url);
    else early.push(url);
  }
  return { early, late };
}

function asMedia(
  images: string[],
  videos: string[] = [],
  videoRotate?: 90 | 180 | 270,
): ChapterMedia[] {
  return [
    ...images.map((src) => ({ kind: 'image' as const, src })),
    ...videos.map((src) => ({
      kind: 'video' as const,
      src,
      rotate: videoRotate,
    })),
  ];
}

function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

const delhi = fromFolder('Delhi', allImages);
const chandigarh = fromFolder('Chandigarh', allImages);
const ambala = fromFolder('Ambala', allImages);
const udaipurImages = fromFolder('Udaipur', allImages);
const udaipurVideos = fromFolder('Udaipur', allVideos);
const varanasiImages = fromFolder('Varansai', allImages);
const varanasiVideos = fromFolder('Varansai', allVideos);
const proposalImages = fromFolder('proposal', allImages);
const proposalVideos = fromFolder('proposal', allVideos);
const roka = fromFolder('roka', allImages);
const engagementImages = fromFolder('engagement', allImages);

const chandigarhSplit = splitByYear(chandigarh);
const ambalaSplit = splitByYear(ambala);

const earlyEverydayImages = interleave(
  chandigarhSplit.early,
  ambalaSplit.early,
);
const lateEverydayImages = interleave(
  chandigarhSplit.late,
  ambalaSplit.late,
);

// Varanasi InShot clip needs 90° rotation; proposal video is normal landscape.
const varanasiAndProposalMedia: ChapterMedia[] = [
  ...asMedia(varanasiImages, varanasiVideos, 90),
  ...asMedia(proposalImages, proposalVideos),
];

// ----------------------------------------------------------------
// Chapter templates — every photo + clip will be exploded into its
// own small billboard, distributed evenly across each chapter's
// progress span. The intro billboard at fromP is text-only and acts
// as the section heading.
// ----------------------------------------------------------------
type ChapterTemplate = {
  id: string;
  title: string;
  date: string;
  caption: string;
  body: string;
  introP: number;
  toP: number;
  introSide: -1 | 0 | 1;
  landmark?: LandmarkKind;
  cinematic?: boolean;
  media: ChapterMedia[];
};

const TEMPLATES: ChapterTemplate[] = [
  {
    id: 'delhi',
    introP: 0.018,
    toP: 0.07,
    introSide: 0,
    title: 'Delhi',
    date: '14 February 2025',
    caption: 'where two strangers stopped being strangers',
    body:
      'A Valentine\'s Day in Delhi that wasn\'t supposed to mean anything ended up meaning ' +
      'everything. Her smile redirected my life that evening.',
    landmark: 'india-gate',
    media: asMedia(delhi),
  },
  {
    id: 'together-early',
    introP: 0.085,
    toP: 0.30,
    introSide: -1,
    title: 'In between everything',
    date: 'spring – autumn 2025',
    caption: 'the days no calendar marks but every memory keeps',
    body:
      'Chandigarh streets, Ambala drives, every weekend we could steal. Unposed, unedited, ours.',
    landmark: 'home',
    media: asMedia(earlyEverydayImages),
  },
  {
    id: 'udaipur',
    introP: 0.31,
    toP: 0.58,
    introSide: 1,
    title: 'Udaipur',
    date: '7 November 2025',
    caption: 'her birthday · palaces, pichola, and her',
    body:
      'I took you to a city of lakes for your birthday and the lakes did the easy part. ' +
      'Watching you light up at every palace, every boat ride, every sunset.',
    landmark: 'city-palace',
    cinematic: true,
    media: asMedia(udaipurImages, udaipurVideos),
  },
  {
    id: 'roka',
    introP: 0.60,
    toP: 0.65,
    introSide: -1,
    title: 'Roka',
    date: '24 January 2026',
    caption: 'two families · one yes',
    body:
      'We said it out loud, in front of everyone we love. Rings, light, the feeling of two ' +
      'families folding into one.',
    landmark: 'mandap',
    media: asMedia(roka),
  },
  {
    id: 'varanasi',
    introP: 0.66,
    toP: 0.82,
    introSide: 1,
    title: 'Varanasi',
    date: '27 February 2026',
    caption: 'she proposed · the loudest quiet moment of my life',
    body:
      'The ghats, the diyas, the river that has watched a million prayers. And in the middle ' +
      'of all of it, she asked.',
    landmark: 'ghat',
    cinematic: true,
    media: varanasiAndProposalMedia,
  },
  {
    id: 'together-late',
    introP: 0.83,
    toP: 0.87,
    introSide: 1,
    title: 'Counting down',
    date: 'March – April 2026',
    caption: 'the weeks before forever became official',
    body:
      'Late nights, last-minute plans, every "just one more weekend." The countdown was never ' +
      'quiet — every photo from these months has a smile that knew what was coming.',
    landmark: 'home',
    media: asMedia(lateEverydayImages),
  },
  {
    id: 'engagement',
    introP: 0.88,
    toP: 0.97,
    introSide: 1,
    title: 'Engagement',
    date: '26 April 2026 · Ujjain',
    caption: 'the loud yes, after a year of quiet ones',
    body:
      'Today is the chapter we have been writing for over a year, page by page, smile by smile. ' +
      'Mahakal\'s lamps were lit, our families were watching, and the world stood still for the loudest yes of my life.',
    landmark: 'mahakal',
    media: asMedia(engagementImages),
  },
  {
    id: 'marry',
    introP: 0.972,
    toP: 0.972,
    introSide: -1,
    title: "Can't wait",
    date: 'wedding · soon, my love',
    caption: 'I would marry you tomorrow',
    body:
      'Engagement first, wedding next. Then a home, a family, a lifetime of ordinary Wednesdays.',
    landmark: 'rings',
    media: [],
  },
  {
    id: 'forever',
    introP: 0.995,
    toP: 0.995,
    introSide: 0,
    title: 'Forever',
    date: 'us · always · everywhere',
    caption: 'I love you, today and every road after',
    body:
      'Vanshika — every billboard back there is a sentence. Read together, they spell a yes ' +
      'that is yours, and every yes I will ever say back.',
    landmark: 'infinity',
    media: [],
  },
];

function isProposalVideoSrc(src: string): boolean {
  return /proposal_video/i.test(src);
}

function generateChapters(): ChapterSpec[] {
  const out: ChapterSpec[] = [];

  for (const t of TEMPLATES) {
    // Chapter intro — text-only marker for the section
    out.push({
      id: t.id,
      progress: t.introP,
      side: t.introSide,
      big: true,
      title: t.title,
      date: t.date,
      caption: t.caption,
      body: t.body,
      media: [],
      landmark: t.landmark,
    });

    if (t.media.length === 0 || t.toP <= t.introP) continue;

    // One small sub-billboard per media item, distributed across the
    // chapter range with a small head-room gap after the intro.
    const span = t.toP - t.introP;
    const headGap = Math.min(0.012, span * 0.18);
    const subStart = t.introP + headGap;
    const subSpan = t.toP - subStart;
    const step = t.media.length > 1 ? subSpan / (t.media.length - 1) : 0;

    t.media.forEach((m, i) => {
      const progress = subStart + i * step;
      const side = (i % 2 === 0 ? -1 : 1) as -1 | 1;

      const isProposalVideo =
        m.kind === 'video' && isProposalVideoSrc(m.src);
      const isRotatedVideo = m.kind === 'video' && !!m.rotate;
      const isSpecialVideo = isProposalVideo || isRotatedVideo;

      out.push({
        id: `${t.id}-m${i}`,
        progress,
        side,
        big: false,
        title: t.title,
        date: t.date,
        caption: captionFor(t.id, i),
        media: [m],
        cinematic: t.cinematic,
        specialMoment: isSpecialVideo,
        coverHint: isProposalVideo
          ? 'something changed here…'
          : isRotatedVideo
            ? 'the river still remembers'
            : undefined,
      });
    });
  }

  return out.sort((a, b) => a.progress - b.progress);
}

export const CHAPTERS: ChapterSpec[] = generateChapters();

export const SKY_LABELS: SkyLabelSpec[] = [
  { id: 'sky1', label: 'delhi', from: 0.01, to: 0.07 },
  { id: 'sky2', label: 'in between', from: 0.085, to: 0.30 },
  { id: 'sky3', label: 'udaipur', from: 0.31, to: 0.58 },
  { id: 'sky4', label: 'roka', from: 0.60, to: 0.65 },
  { id: 'sky5', label: 'varanasi', from: 0.66, to: 0.82 },
  { id: 'sky6', label: 'still us', from: 0.83, to: 0.87 },
  { id: 'sky7', label: '26 April 2026', from: 0.88, to: 0.97 },
  { id: 'sky8', label: 'forever', from: 0.975, to: 0.999 },
];
