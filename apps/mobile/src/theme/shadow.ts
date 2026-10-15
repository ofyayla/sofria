// pisir-ai-design-system.md §3 — birebir port. Gölge yeşile çalar, asla
// siyah değil — siyah gölge pastel zemini griye çevirir (bkz. §12 Yasaklılar).
export const shadow = {
  card: {
    shadowColor: "#3E6B4E",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cta: {
    shadowColor: "#3E8E63",
    shadowOpacity: 0.26,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
