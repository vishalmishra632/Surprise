/** Returns the first image url for a memory folder, or undefined. */
export function firstImageOf(images: string[]): string | undefined {
  return images.length > 0 ? images[0] : undefined;
}

/** Slice a unique image set with a max length and stable order. */
export function pickImages(images: string[], max: number): string[] {
  return images.slice(0, max);
}

/** Detect mobile by viewport width. The experience is desktop-first. */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 820;
}
