/**
 * Vanshika.exe — single source of truth.
 * All editable copy, captions, names, dates, and media paths live here.
 * Components import from here only.
 */

// ----------------------------------------------------------------
// Media glob — all photos and videos under src/assets/memories/<folder>
// ----------------------------------------------------------------
const imageModules = import.meta.glob(
  '../assets/memories/**/*.{png,jpg,jpeg,JPG,JPEG}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

const videoModules = import.meta.glob(
  '../assets/memories/**/*.{mp4,webm,mov,MOV}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

const naturalSort = (entries: string[]) =>
  [...entries].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );

const fromFolder = (folder: string, modules: Record<string, string>) =>
  naturalSort(
    Object.entries(modules)
      .filter(([path]) => path.includes(`/memories/${folder}/`))
      .map(([, url]) => url),
  );

export type MemoryFolder =
  | 'varanasi'
  | 'jaipur'
  | 'noida'
  | 'food'
  | 'shopping'
  | 'travel'
  | 'bikes'
  | 'movies'
  | 'songs-dance'
  | 'baking'
  | 'sister'
  | 'final';

export const memoryAssets: Record<MemoryFolder, { images: string[]; videos: string[] }> = {
  varanasi: { images: fromFolder('varanasi', imageModules), videos: fromFolder('varanasi', videoModules) },
  jaipur: { images: fromFolder('jaipur', imageModules), videos: fromFolder('jaipur', videoModules) },
  noida: { images: fromFolder('noida', imageModules), videos: fromFolder('noida', videoModules) },
  food: { images: fromFolder('food', imageModules), videos: fromFolder('food', videoModules) },
  shopping: { images: fromFolder('shopping', imageModules), videos: fromFolder('shopping', videoModules) },
  travel: { images: fromFolder('travel', imageModules), videos: fromFolder('travel', videoModules) },
  bikes: { images: fromFolder('bikes', imageModules), videos: fromFolder('bikes', videoModules) },
  movies: { images: fromFolder('movies', imageModules), videos: fromFolder('movies', videoModules) },
  'songs-dance': { images: fromFolder('songs-dance', imageModules), videos: fromFolder('songs-dance', videoModules) },
  baking: { images: fromFolder('baking', imageModules), videos: fromFolder('baking', videoModules) },
  sister: { images: fromFolder('sister', imageModules), videos: fromFolder('sister', videoModules) },
  final: { images: fromFolder('final', imageModules), videos: fromFolder('final', videoModules) },
};

// ----------------------------------------------------------------
// Identity
// ----------------------------------------------------------------
export const identity = {
  him: 'Vishal',
  her: 'Vanshika',
  appName: 'VANSHIKA.EXE',
  tagline: 'THE MEMORY DEPLOYMENT EXPERIENCE',
  builtBy: 'Built by Vishal',
  release: 'Engagement Release — 26 April 2026',
  eventDate: '26 April 2026',
};

// ----------------------------------------------------------------
// Hero intro — boot lines
// ----------------------------------------------------------------
export const bootLines: string[] = [
  'Initializing Vishal ❤ Vanshika...',
  'Loading memories...',
  'Loading journeys...',
  'Loading laughter...',
  'Loading forever...',
];

export const bootStatus = 'Status: Ready for Forever';

// ----------------------------------------------------------------
// Her World — personality cards
// ----------------------------------------------------------------
export type HerWorldCard = {
  label: string;
  caption: string;
};

export const herWorld = {
  heading: 'Her World',
  quote:
    'She does not just enter a room. She changes its energy.',
  cards: [
    { label: 'She loves songs', caption: 'her playlist runs the room' },
    { label: 'She loves to dance', caption: 'every floor becomes hers' },
    { label: 'She loves to bake', caption: 'flour, sugar, magic' },
    { label: 'She loves to sleep', caption: 'her favorite hobby, daily' },
    { label: 'Hangs with my sister', caption: 'a tribe of two became three' },
    { label: 'Lights up in Noida', caption: 'when I show up at her door' },
  ] as HerWorldCard[],
};

// ----------------------------------------------------------------
// Memory Map — abstract memory locations
// ----------------------------------------------------------------
export type MemoryNode = {
  id: string;
  name: string;
  caption: string;
  folder: MemoryFolder;
  // 0..1 angle around an abstract orbit
  angle: number;
};

export const memoryMap = {
  heading: 'Every place became a chapter.',
  subheading: 'Every chapter became us.',
  nodes: [
    { id: 'varanasi', name: 'Varanasi', caption: 'where forever stopped feeling far', folder: 'varanasi', angle: 0.05 },
    { id: 'jaipur', name: 'Jaipur', caption: 'her birthday, our chapter', folder: 'jaipur', angle: 0.18 },
    { id: 'noida', name: 'Noida', caption: 'her doorstep, our beginning', folder: 'noida', angle: 0.32 },
    { id: 'food', name: 'Food', caption: 'every flavor, shared', folder: 'food', angle: 0.46 },
    { id: 'shopping', name: 'Shopping', caption: 'her hand, our cart', folder: 'shopping', angle: 0.58 },
    { id: 'bikes', name: 'Bikes', caption: 'engines and her arms around me', folder: 'bikes', angle: 0.7 },
    { id: 'movies', name: 'Movies', caption: 'two seats, one armrest', folder: 'movies', angle: 0.82 },
    { id: 'travel', name: 'Travel', caption: 'every road we owned', folder: 'travel', angle: 0.92 },
  ] as MemoryNode[],
};

// ----------------------------------------------------------------
// Varanasi — emotional climax 1
// ----------------------------------------------------------------
export const varanasiScene = {
  heading: 'Varanasi',
  scriptHeading: 'where forever arrived',
  lines: [
    'Varanasi gave us more than a trip.',
    'It gave me one of the most unforgettable moments of my life.',
    'That was the moment forever stopped feeling far away.',
  ],
  closing: 'Some cities hold stories. Varanasi holds ours.',
  videoSrc: memoryAssets.varanasi.videos[0],
  imageSrcs: memoryAssets.varanasi.images.slice(0, 5),
  imageCaptions: [
    'the trip that stayed',
    'forever felt close',
    'golden hour, us',
    'a city of blessings',
    'our quiet miracle',
  ],
};

// ----------------------------------------------------------------
// Jaipur — emotional climax 2
// ----------------------------------------------------------------
export const jaipurScene = {
  heading: 'Jaipur',
  scriptHeading: 'her birthday, our chapter',
  lines: [
    'Jaipur looked beautiful.',
    'But watching her smile there was the real celebration.',
    'Some birthdays become memories. This one became a chapter.',
  ],
  closing: 'Some places stay with you. Jaipur held us first.',
  videoSrc: memoryAssets.jaipur.videos[0],
  imageSrcs: memoryAssets.jaipur.images.slice(0, 5),
  imageCaptions: [
    'birthday sparkle',
    'her smile won the city',
    'a movie kind of day',
    'pink walls, warm us',
    'celebration mode',
  ],
};

// ----------------------------------------------------------------
// Lifestyle — Things We Became Together
// ----------------------------------------------------------------
export type LifestyleTile = {
  label: string;
  caption: string;
  folder: MemoryFolder;
};

export const lifestyleScene = {
  heading: 'Things We Became Together',
  quote: 'We did not just spend time together. We built our own world.',
  tiles: [
    { label: 'Travelling', caption: 'every road, ours', folder: 'travel' },
    { label: 'New Food', caption: 'every flavor, shared', folder: 'food' },
    { label: 'Shopping', caption: 'two carts, one heart', folder: 'shopping' },
    { label: 'Bikes', caption: 'engines and her grip', folder: 'bikes' },
    { label: 'Movies', caption: 'two seats, one story', folder: 'movies' },
    { label: 'Songs', caption: 'her voice, our soundtrack', folder: 'songs-dance' },
    { label: 'Dancing', caption: 'any floor she chose', folder: 'songs-dance' },
    { label: 'Baking', caption: 'flour, sugar, joy', folder: 'baking' },
  ] as LifestyleTile[],
};

// ----------------------------------------------------------------
// Film Reel — best-of horizontal strip
// ----------------------------------------------------------------
const allReelImages = [
  ...memoryAssets.final.images,
  ...memoryAssets.varanasi.images,
  ...memoryAssets.jaipur.images,
  ...memoryAssets.noida.images,
  ...memoryAssets.travel.images,
];

export const filmReelScene = {
  topLine: 'Some stories are not planned.',
  bottomLine: 'They slowly become home.',
  closing: 'Every frame · A favorite memory',
  images: Array.from(new Set(allReelImages)).slice(0, 18),
};

// ----------------------------------------------------------------
// Roadmap — the love product roadmap
// ----------------------------------------------------------------
export type RoadmapItem = {
  year: string;
  title: string;
  caption: string;
  status: 'shipped' | 'live' | 'queued' | 'forever';
};

export const roadmapScene = {
  heading: 'The Roadmap',
  subheading: 'Versioning forever.',
  items: [
    { year: '2025', title: 'The story began', caption: 'Valentine\'s Day. The day everything changed.', status: 'shipped' },
    { year: '2026', title: 'Engagement', caption: 'tonight, in front of everyone we love', status: 'live' },
    { year: '2027', title: 'Wedding', caption: 'the loud yes after the quiet one', status: 'queued' },
    { year: '50+ years', title: 'A home, a family, a life', caption: 'every chapter not yet written', status: 'forever' },
  ] as RoadmapItem[],
};

// ----------------------------------------------------------------
// Final Deploy
// ----------------------------------------------------------------
export const finalScene = {
  pendingHeading: 'Vanshika, one final deployment is pending...',
  pendingSubtitle: 'Awaiting final authorization.',
  buttonLabel: 'Press Enter to Deploy Forever',
  successHeadline: 'FOREVER DEPLOYED SUCCESSFULLY ❤',
  coupleName: 'Vishal + Vanshika',
  successSubtitle: 'Version 1.0 of Forever is now live.',
  successFooter: 'Build time: a lifetime of waiting · Status: absolutely worth it',
};

// ----------------------------------------------------------------
// Scene index — drives the navigation order
// ----------------------------------------------------------------
export const sceneOrder = [
  { id: 'hero', label: 'Boot' },
  { id: 'her-world', label: 'Her World' },
  { id: 'memory-map', label: 'Memory Map' },
  { id: 'varanasi', label: 'Varanasi' },
  { id: 'jaipur', label: 'Jaipur' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'film-reel', label: 'Film Reel' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'final-deploy', label: 'Deploy' },
] as const;

export type SceneId = (typeof sceneOrder)[number]['id'];
