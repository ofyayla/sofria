// pisir-ai-design-system.md §7 "Hareket" — süre sabitleri.
export const motion = {
  stepTransitionMs: 280,
  progressFillMs: 300,
  pressScaleMs: 100,
  breathingCycleMs: 1400,
  listItemMs: 240,
  listItemStaggerMs: 40,
} as const;

export const pressScale = { from: 1, to: 0.96 } as const;
