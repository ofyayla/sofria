// pisir-ai-design-system.md §1 — birebir port. Bu dosyanın dışında hiçbir
// yerde ham hex renk yazılmaz.
export const colors = {
  // — Marka —
  brand: "#3E8E63", // seçili kart kenarlığı, ikon, vurgu sayı, aktif çip zemini
  brandPress: "#2F7250", // basılı hâl
  brandSoft: "#DDEEE0", // seçili kart zemini, ikon dairesi, olumlu banner
  brandTint: "#A8D5B5", // pastel dolgu: slider dolu ray, toggle açık

  // — Birincil buton (pastel zemin + koyu metin) —
  ctaFrom: "#B8DFC2",
  ctaTo: "#8FCBA4",
  onCta: "#173D2A", // buton metni — kontrast 6.5:1

  // — Zemin gradyanı (yukarıdan aşağıya) —
  bgTop: "#FAFCF9",
  bgBottom: "#F0F6EC",

  // — Yüzeyler —
  surface: "#FFFFFF", // kart
  surfaceMuted: "#EFF4EC", // pasif çip, input zemini
  divider: "#DDE7D9", // ilerleme çubuğu boşluğu, ince ayırıcı

  // — Metin —
  ink: "#12211A", // başlık, kart başlığı
  inkSecondary: "#3D5147", // yardımcı metin, adım etiketi
  inkMuted: "#7C8E84", // kart alt metni, placeholder
  onBrand: "#FFFFFF", // koyu yeşil (#3E8E63) zemin üstü metin

  // — Durum —
  // Olumlu = markanın kendisi. İkinci bir yeşil eklenmez.
  warning: "#C98A16",
  warningSoft: "#FBF1DC",
  danger: "#C4483F",
  dangerSoft: "#FBEDEB",
} as const;

export type ThemeColors = typeof colors;
