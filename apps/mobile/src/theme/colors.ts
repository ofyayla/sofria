// Sofria tasarım dili v2 — "fotoğraf önde, cam yüzeyler, tek lime vurgu".
// Bu dosyanın dışında hiçbir yerde ham hex/rgba renk yazılmaz.
export const colors = {
  // — Vurgu —
  // Lime YALNIZCA dolgu olarak kullanılır (aktif hap, birincil CTA, seçili
  // rozet). Üstündeki metin/ikon her zaman `onAccent`. Açık zeminde metin
  // rengi olarak KULLANILMAZ — kontrast ~1.2:1.
  accent: "#C9F158",
  accentPress: "#B5DD45",
  onAccent: "#0F110E",

  // — Koyu (gece) yüzeyler: ana sayfa, sihirbaz, tarif detayı —
  night: "#0F110E",
  nightRaised: "#1A1D19",
  onNight: "#FFFFFF",
  onNightSecondary: "rgba(255,255,255,0.78)",
  onNightMuted: "rgba(255,255,255,0.6)",
  nightTrack: "rgba(255,255,255,0.08)", // segment zemini, pasif hap
  nightDivider: "rgba(255,255,255,0.12)",
  glassFill: "rgba(255,255,255,0.14)",
  glassBorder: "rgba(255,255,255,0.2)",
  /** Blur desteklenmeyen yerde (Android) camın yerine geçen opak dolgu. */
  glassFallback: "rgba(38,42,36,0.88)",

  // — Açık (gündüz) yüzeyler: plan, market, kurallar, tariflerim —
  canvas: "#E9EBE6",
  surface: "#FFFFFF",
  surfaceMuted: "#D3D6D0", // pasif hap, ikincil daire buton
  surfaceSunken: "#DFE2DB", // işaretlenmiş liste satırı
  divider: "#C9CCC5",

  // — Metin (açık zemin) —
  ink: "#0F110E",
  inkSecondary: "#3A3D38",
  inkMuted: "#5E625B", // canvas üstünde 4.5:1'i geçer

  // — Fotoğraf üstü karartma —
  scrim: "rgba(10,12,9,0.8)",
  scrimClear: "rgba(10,12,9,0)",
  backdrop: "rgba(10,12,9,0.5)",

  // — Durum —
  success: "#3E8E63", // eski marka yeşili — yalnızca "tamamlandı" anlamında
  successSoft: "#DDEEE0",
  warning: "#C98A16",
  warningSoft: "#FBF1DC",
  danger: "#C4483F",
  dangerSoft: "#FBEDEB",
} as const;

export type ThemeColors = typeof colors;

/** Ekran tonu — her ekran ya koyu ya açık; bileşenler buna göre renk seçer. */
export type Tone = "dark" | "light";
