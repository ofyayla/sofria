export const AISLES = [
  "meyve",
  "sebze",
  "bakliyat",
  "unlu_mamuller",
  "yumurta",
  "sut_urunleri",
  "kirmizi_et",
  "beyaz_et",
  "balik",
  "konserve_salca",
  "yag_sirke_sos",
  "baharat",
  "temel_gida",
  "dondurulmus",
  "icecek",
  "diger",
] as const;

export type Aisle = (typeof AISLES)[number];
