/**
 * Per-chapter caption banks. The generator in billboards.ts assigns
 * captions[i] to the i-th media item of that chapter. Order matters —
 * captions land on whichever photo / clip happens to sit at that index.
 *
 * If a caption ends up on the "wrong" photo, just move it to the right
 * index in the array below. Vishal's two requested lines:
 *   • "These arms will always protect you."
 *   • "I will always look at you the same way, even after 50 years."
 * are placed in the In-between sequence at indices 4 and 8 — landing
 * on Chandigarh photos in the interleaved stream. Reorder freely.
 */

export type CaptionsByChapter = Record<string, string[]>;

export const CAPTIONS: CaptionsByChapter = {
  delhi: [
    'the day forever began',
    'you walked in and changed every road I had planned',
    "I haven't been the same since that evening",
  ],
  'together-early': [
    "the in-between that wasn't in-between at all", // 0
    'a wedding we attended, ours still ahead', // 1 — wedding venue
    'our first Chandigarh, together', // 2 — first Chandigarh trip
    'your first Ambala, my old roads new again', // 3 — first Ambala visit
    'ordinary day, extraordinary you', // 4
    'still my favourite person to find in a crowd', // 5
    'rooms get warmer when you walk in', // 6
    'we built a home in our weekends', // 7
    'any hallway is enough, with you in it', // 8 — corridor selfie
    'These arms will always protect you.', // 9 — gym photo
    'I will always look at you the same way, even after 50 years.', // 10
    'I keep falling, on schedule', // 11
    'you, untamed and unedited', // 12
    'every photograph is a love letter', // 13
    'the kind of love no one taught us', // 14
    "I'd choose you again, on any ordinary day", // 15
    'still you, every chapter', // 16
  ],
  udaipur: [
    'we found the city of lakes', // 0
    'your birthday, our chapter', // 1
    'Pichola at golden hour, you brighter', // 2
    'the lake remembered our names', // 3
    'the blue room we wandered into', // 4 — Mughal-tiled restaurant
    'you in palace light', // 5
    'our first candlelight, hours before your birthday', // 6
    'lantern light, the night becoming yours', // 7
    'Udaipur was made for this photo', // 8
    'candlelight, cake, the night before yours', // 9 — cake photo
    'Khamma Ghani — four hours from your birthday', // 10
    'you make even palaces look small', // 11
    'Karni Mata — all of Udaipur, below us', // 12 — Karni Mata Temple
    'blue arches, your laugh between them', // 13 — arched architecture
    "Jheel's Ginger — slow coffee, slower morning", // 14 — Jheel's Ginger Coffee
    'every mirror in Udaipur was jealous', // 15
    'the day I knew, again', // 16
    'a hundred candles, only one wish', // 17
    // Udaipur clips (videos)
    'Pichola, in motion', // 18
    'your smile, replayed', // 19
    'twilight, walking together', // 20
  ],
  roka: ['we said it out loud, in front of everyone'],
  varanasi: [
    // 14 Varanasi images
    'the river kept our secret',
    'diyas on the water, you and me',
    'the ghats remember us',
    'we sat where prayers begin',
    'your hand was warm, the river was old',
    'you wore Varanasi like a dress',
    'the city of light dimmed for you',
    'morning prayers, evening promises',
    'old stones, new hearts',
    'your face, lit by the river',
    'a million prayers, one was yours',
    'ghat steps and forever',
    'you, the brightest diya',
    "the bell hadn't rung yet",
    // Varanasi InShot clip (rotated, special-moment)
    'the river still remembers',
    // Proposal images (2)
    'before the question, breath held',
    'every cell of me, yes',
    // Proposal video (special-moment)
    'press play, hold your breath',
  ],
  'together-late': [
    'April was always the answer',
    'the weeks before forever',
    'every photograph already knew',
    'counting down, smiling more',
    'almost ours, officially',
  ],
  engagement: [
    'the room held its breath', // 0
    'rings, rangoli, and you', // 1
    'Mahakal heard the loudest yes', // 2
    'a temple of yes-es', // 3
    'you, in light, in laughter', // 4
    'every eye on us, ours on each other', // 5
    'his blessing, our beginning', // 6
    'the moment my hand met yours, officially', // 7
    'Ujjain knew before we said it out loud', // 8
    'one ring, one road, one us', // 9
    'sealed under Mahakal\'s lamp', // 10
    'today, forever started', // 11
  ],
};

/** Generic fallback if a chapter has more media than captions defined. */
const FALLBACK = [
  'a moment, kept',
  'us, again',
  'this frame, ours',
  'a quiet, held',
  'still you',
];

export function captionFor(chapterId: string, index: number): string {
  const list = CAPTIONS[chapterId];
  if (list && index < list.length) return list[index];
  return FALLBACK[index % FALLBACK.length];
}
