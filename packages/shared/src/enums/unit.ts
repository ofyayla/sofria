export const UNITS = [
  "gr",
  "kg",
  "ml",
  "lt",
  "adet",
  "demet",
  "diş",
  "dilim",
  "paket",
  "yemek_kasigi",
  "tatli_kasigi",
  "cay_kasigi",
  "su_bardagi",
  "cay_bardagi",
  "tutam",
] as const;

export type Unit = (typeof UNITS)[number];

/** Ham slug değerleri (ör. "yemek_kasigi") kullanıcıya hiçbir yerde gösterilmemeli. */
export const UNIT_LABELS: Record<Unit, string> = {
  gr: "gr",
  kg: "kg",
  ml: "ml",
  lt: "lt",
  adet: "adet",
  demet: "demet",
  diş: "diş",
  dilim: "dilim",
  paket: "paket",
  yemek_kasigi: "yemek kaşığı",
  tatli_kasigi: "tatlı kaşığı",
  cay_kasigi: "çay kaşığı",
  su_bardagi: "su bardağı",
  cay_bardagi: "çay bardağı",
  tutam: "tutam",
};
