// pisir-ai-design-system.md §2 — birebir port.
import { colors } from "./colors";

export const fonts = {
  display: "Figtree_700Bold",
  displayXBold: "Figtree_800ExtraBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
} as const;

export const type = {
  screenTitle: { font: fonts.display, size: 34, lineHeight: 40, letterSpacing: -0.8, color: colors.ink },
  question: { font: fonts.display, size: 26, lineHeight: 32, letterSpacing: -0.4, color: colors.ink },
  hero: { font: fonts.displayXBold, size: 64, lineHeight: 68, letterSpacing: -2.0, color: colors.brand },
  cardTitle: { font: fonts.bodySemi, size: 17, lineHeight: 22, color: colors.ink },
  cardSub: { font: fonts.body, size: 14, lineHeight: 19, color: colors.inkMuted },
  body: { font: fonts.body, size: 16, lineHeight: 23, color: colors.inkSecondary },
  helper: { font: fonts.body, size: 15, lineHeight: 21, color: colors.inkSecondary },
  label: { font: fonts.bodyMedium, size: 13, lineHeight: 17, color: colors.inkSecondary },
  button: { font: fonts.bodySemi, size: 18, lineHeight: 22, color: colors.onCta },
  chip: { font: fonts.bodyMedium, size: 16, lineHeight: 20 },
} as const;

/**
 * SDD/design-system §2 kuralları: rakamlar (bütçe, porsiyon, süre,
 * matchRate) tabular-nums ile yazılır; Türkçe büyük harfe kod içinde
 * ASLA `toUpperCase()` ile çevrilmez (İ/ı hatası üretir).
 */
export const tabularNums: { fontVariant: ("tabular-nums" | "lining-nums")[] } = { fontVariant: ["tabular-nums"] };
