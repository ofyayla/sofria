export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = {
  pill: 999,
  card: 32,
  sheet: 36,
  row: 22,
  input: 24,
  tile: 24,
} as const;

/** Yatay kenar boşluğu — referans tasarımdaki gibi 20pt. */
export const gutter = 20;

/** Dokunma hedefleri — daire butonlar ve haplar. */
export const size = {
  circleLg: 64,
  circleMd: 56,
  circleSm: 44,
  pill: 52,
  cta: 64,
  tabBar: 76,
} as const;

/** Yüzen alt barın kapladığı alan (bar + alt boşluk) — içerik bunun altında kesilmez. */
export const TAB_BAR_CLEARANCE = size.tabBar + space.xl + space.lg;

/**
 * Bir kabı tamamen kaplayan görsel. Yalnızca `absoluteFill` yetmez: web'de
 * (react-native-web) boyutsuz Image, kaynağın doğal boyutunu (1024×1024) alıyor.
 */
export const fillImage = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" } as const;
