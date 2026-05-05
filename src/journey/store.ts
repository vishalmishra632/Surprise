import { create } from 'zustand';

export type JourneyState = {
  progress: number;
  targetProgress: number;
  setProgress: (p: number) => void;
  setTargetProgress: (p: number) => void;

  gateOpen: boolean;
  openGate: () => void;

  /** id of the chapter currently expanded into a detail view, null when closed */
  detailChapterId: string | null;
  detailMediaIndex: number;
  openDetail: (chapterId: string) => void;
  closeDetail: () => void;
  stepDetailMedia: (direction: 1 | -1, length: number) => void;

  /** True while the outer page is showing the reel-format iframe — the
   *  outer Journey is hidden, so its audio + scroll listeners stand down. */
  reelActive: boolean;
  setReelActive: (v: boolean) => void;
};

export const useJourneyStore = create<JourneyState>((set) => ({
  progress: 0,
  targetProgress: 0,
  setProgress: (p) => set({ progress: p }),
  setTargetProgress: (p) => set({ targetProgress: p }),

  gateOpen: true,
  openGate: () => set({ gateOpen: false }),

  detailChapterId: null,
  detailMediaIndex: 0,
  openDetail: (chapterId) => set({ detailChapterId: chapterId, detailMediaIndex: 0 }),
  closeDetail: () => set({ detailChapterId: null }),
  stepDetailMedia: (direction, length) =>
    set((state) => {
      if (length === 0) return state;
      const next = (state.detailMediaIndex + direction + length) % length;
      return { detailMediaIndex: next };
    }),

  reelActive: false,
  setReelActive: (v) => set({ reelActive: v }),
}));
