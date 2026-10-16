// Sofria tasarım dili v2 — tek aile: Figtree. Başlıklar büyük ve İNCE (400),
// vurgu ağırlıkla değil iki tonlu renkle yapılır ("Bu akşam" soluk +
// "Karnıyarık" tam renk).
export const fonts = {
  regular: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semibold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
} as const;

export const type = {
  display: { font: fonts.regular, size: 44, lineHeight: 46, letterSpacing: -1.5 },
  title: { font: fonts.regular, size: 38, lineHeight: 42, letterSpacing: -1.2 },
  heading: { font: fonts.medium, size: 26, lineHeight: 30, letterSpacing: -0.5 },
  cardTitle: { font: fonts.semibold, size: 17, lineHeight: 22, letterSpacing: 0 },
  body: { font: fonts.regular, size: 16, lineHeight: 23, letterSpacing: 0 },
  bodyMedium: { font: fonts.medium, size: 16, lineHeight: 22, letterSpacing: 0 },
  helper: { font: fonts.regular, size: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { font: fonts.regular, size: 13, lineHeight: 18, letterSpacing: 0 },
  /** Büyük harfli üst etiket — metin kaynağında zaten büyük yazılır (bkz. aşağı). */
  eyebrow: { font: fonts.semibold, size: 12, lineHeight: 16, letterSpacing: 1.2 },
  button: { font: fonts.semibold, size: 17, lineHeight: 22, letterSpacing: 0 },
  chip: { font: fonts.medium, size: 15, lineHeight: 20, letterSpacing: 0 },
  hero: { font: fonts.regular, size: 56, lineHeight: 60, letterSpacing: -2 },
} as const;

export type TypeToken = (typeof type)[keyof typeof type];

/** Bir type token'ını RN Text stiline çevirir. */
export function textStyle(token: TypeToken) {
  return {
    fontFamily: token.font,
    fontSize: token.size,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
  };
}

/**
 * Rakamlar (porsiyon, süre, miktar) tabular-nums ile yazılır. Türkçe büyük
 * harfe kod içinde ASLA `toUpperCase()` ile çevrilmez (İ/ı hatası) —
 * gerekiyorsa `toTurkishUpperCase` kullanılır.
 */
export const tabularNums: { fontVariant: ("tabular-nums" | "lining-nums")[] } = { fontVariant: ["tabular-nums"] };

export function toTurkishUpperCase(text: string): string {
  return text.replace(/i/g, "İ").toUpperCase();
}
