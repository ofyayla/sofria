// pisir-ai-design-system.md §3 — birebir port.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = {
  chip: 999,
  card: 18,
  panel: 20,
  button: 999,
  input: 16,
  image: 24,
} as const;

/** Yatay kenar boşluğu (gutter) — ekrandaki her şey bu hizada başlar/biter. */
export const gutter = space.xl;
