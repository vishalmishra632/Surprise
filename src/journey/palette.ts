import { Color } from 'three';

export type PaletteSection = {
  at: number;
  bg: number;
  bgDeep: number;
  fog: number;
  ambient: number;
  key: number;
  rim: number;
  accent: number;
};

/**
 * Dreamy romantic palette — warm beige base, blush pink mids, dusty
 * lavender deep tones, soft gold finale. Each chapter shifts a notch so
 * the sky breathes without ever losing the warm-pastel register.
 */
export const SECTIONS: PaletteSection[] = [
  // Delhi — dawn-cream sky, warm blush horizon
  {
    at: 0.0,
    bg: 0xfff2e8,
    bgDeep: 0xf6c8d2,
    fog: 0xfae0d8,
    ambient: 0xfde2d4,
    key: 0xfff1d6,
    rim: 0xe8a8b9,
    accent: 0xe8a8b9,
  },
  // In-between — warmer blush above, lavender-tinted ground
  {
    at: 0.18,
    bg: 0xffe2e2,
    bgDeep: 0xd4b8d4,
    fog: 0xf0c8d4,
    ambient: 0xfdd8c8,
    key: 0xffe6c8,
    rim: 0xc7a4c4,
    accent: 0xc7a4c4,
  },
  // Udaipur — peach-pink air, dusty mauve floor, soft gold rim
  {
    at: 0.4,
    bg: 0xffd8e0,
    bgDeep: 0xc4b0d4,
    fog: 0xe0c4d4,
    ambient: 0xfdd0c0,
    key: 0xffe0c0,
    rim: 0xd4a13a,
    accent: 0xc89cba,
  },
  // Roka — soft mauve sky, deeper lavender ground
  {
    at: 0.56,
    bg: 0xe8c8d8,
    bgDeep: 0x9a8cb6,
    fog: 0xc8b0c8,
    ambient: 0xf0d8d8,
    key: 0xf6e0d0,
    rim: 0xb09cc9,
    accent: 0xb09cc9,
  },
  // Varanasi — warm mauve light, twilight lavender below
  {
    at: 0.72,
    bg: 0xe8b8c8,
    bgDeep: 0x8a7aa6,
    fog: 0xc8a0b6,
    ambient: 0xf0c8c8,
    key: 0xffe0d0,
    rim: 0xc7869b,
    accent: 0xc7869b,
  },
  // Engagement — dusty rose evening, pink-gold rim
  {
    at: 0.86,
    bg: 0xf6c8d4,
    bgDeep: 0xc7869b,
    fog: 0xe8a8b9,
    ambient: 0xf6c8c8,
    key: 0xffe0d0,
    rim: 0xe8a8b9,
    accent: 0xc7869b,
  },
  // Forever — golden-cream finale, soft gold accents
  {
    at: 1.0,
    bg: 0xfff0e0,
    bgDeep: 0xe8c895,
    fog: 0xf6dcb6,
    ambient: 0xffe6c4,
    key: 0xfff0d0,
    rim: 0xd6a15c,
    accent: 0xd6a15c,
  },
];

export type InterpolatedPalette = {
  bg: Color;
  bgDeep: Color;
  fog: Color;
  ambient: Color;
  key: Color;
  rim: Color;
  accent: Color;
};

const CHANNELS = ['bg', 'bgDeep', 'fog', 'ambient', 'key', 'rim', 'accent'] as const;

export function interpolatePalette(progress: number): InterpolatedPalette {
  for (let i = 0; i < SECTIONS.length - 1; i++) {
    const a = SECTIONS[i];
    const b = SECTIONS[i + 1];
    if (progress >= a.at && progress <= b.at) {
      const t = b.at === a.at ? 0 : (progress - a.at) / (b.at - a.at);
      const out = {} as InterpolatedPalette;
      for (const channel of CHANNELS) {
        out[channel] = new Color(a[channel]).lerp(new Color(b[channel]), t);
      }
      return out;
    }
  }
  const last = SECTIONS[SECTIONS.length - 1];
  const out = {} as InterpolatedPalette;
  for (const channel of CHANNELS) {
    out[channel] = new Color(last[channel]);
  }
  return out;
}
