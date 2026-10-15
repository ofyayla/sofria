import type { Aisle } from "@sofria/shared";

/** Alışveriş listesindeki kategori sırası ve başlıkları (kullanıcı talebi). */
export const AISLE_DISPLAY: Record<Aisle, { displayName: string; order: number }> = {
  meyve: { displayName: "Meyve", order: 0 },
  sebze: { displayName: "Sebze", order: 1 },
  bakliyat: { displayName: "Bakliyat", order: 2 },
  unlu_mamuller: { displayName: "Unlu Mamuller", order: 3 },
  yumurta: { displayName: "Yumurta", order: 4 },
  sut_urunleri: { displayName: "Süt ve Süt Ürünleri", order: 5 },
  kirmizi_et: { displayName: "Kırmızı Et", order: 6 },
  beyaz_et: { displayName: "Beyaz Et", order: 7 },
  balik: { displayName: "Balık ve Deniz Ürünleri", order: 8 },
  konserve_salca: { displayName: "Konserve ve Salça", order: 9 },
  yag_sirke_sos: { displayName: "Yağ, Sirke ve Sos", order: 10 },
  baharat: { displayName: "Baharat", order: 11 },
  temel_gida: { displayName: "Temel Gıda", order: 12 },
  dondurulmus: { displayName: "Dondurulmuş", order: 13 },
  icecek: { displayName: "İçecek", order: 14 },
  diger: { displayName: "Diğer", order: 15 },
};

/**
 * Katalog malzemelerinin adları ("Nohut (ıslatılmış)", "Kuşbaşı et (dana)")
 * sözlük eş anlamlılarıyla eşleşmediği için listede "Diğer"e düşüyordu —
 * kategori, tarifteki SABİT slug'a göre belirlenir.
 */
const SLUG_AISLE: Record<string, Aisle> = {
  limon: "meyve", avokado: "meyve", elma: "meyve", muz: "meyve",

  sogan: "sebze", sogan_kirmizi: "sebze", sogan_yesil: "sebze", sarimsak: "sebze", domates: "sebze",
  domates_cherry: "sebze", salatalik: "sebze", biber_yesil: "sebze", biber_kirmizi: "sebze", biber_dolmalik: "sebze",
  patates: "sebze", havuc: "sebze", maydanoz: "sebze", dereotu: "sebze", patlican: "sebze", kabak: "sebze",
  ispanak: "sebze", mantar: "sebze", bamya: "sebze", bezelye: "sebze", brokoli: "sebze", enginar: "sebze",
  feslegen: "sebze", kereviz_sap: "sebze", marul: "sebze", roka: "sebze", taze_fasulye: "sebze",

  pirinc: "bakliyat", pirinc_risotto: "bakliyat", bulgur: "bakliyat", bulgur_ince: "bakliyat", bulgur_iri: "bakliyat",
  nohut: "bakliyat", kirmizi_mercimek: "bakliyat", yesil_mercimek: "bakliyat", kuru_fasulye: "bakliyat", tarhana: "bakliyat",

  un: "unlu_mamuller", misir_unu: "unlu_mamuller", galeta_unu: "unlu_mamuller", makarna: "unlu_mamuller",
  makarna_kucuk: "unlu_mamuller", spagetti: "unlu_mamuller", sehriye: "unlu_mamuller", yufka: "unlu_mamuller",
  ekmek: "unlu_mamuller", lavas: "unlu_mamuller",

  yumurta: "yumurta",

  sut: "sut_urunleri", yogurt: "sut_urunleri", beyaz_peynir: "sut_urunleri", kasar_rendesi: "sut_urunleri",
  mozzarella: "sut_urunleri", parmesan: "sut_urunleri", kremasi: "sut_urunleri", tereyagi: "sut_urunleri",

  kiyma: "kirmizi_et", kusbasi: "kirmizi_et", dana_kusbasi: "kirmizi_et", dana_incik: "kirmizi_et",
  kuzu_but: "kirmizi_et", kuzu_kusbasi: "kirmizi_et", sucuk: "kirmizi_et",

  tavuk_gogsu: "beyaz_et", tavuk_but: "beyaz_et", tavuk_kanat: "beyaz_et", hindi_gogsu: "beyaz_et", hindi_kusbasi: "beyaz_et",

  balik_fileto: "balik", balik_levrek: "balik", hamsi: "balik", somon_fileto: "balik",

  salca: "konserve_salca", domates_konserve: "konserve_salca", domates_sos: "konserve_salca",
  kuru_fasulye_konserve: "konserve_salca", misir: "konserve_salca", kapari: "konserve_salca",
  zeytin_siyah: "konserve_salca", asma_yapragi: "konserve_salca", ton_balik: "konserve_salca",

  zeytinyagi: "yag_sirke_sos", sivi_yag: "yag_sirke_sos", balzamik_sirke: "yag_sirke_sos", nar_eksisi: "yag_sirke_sos",

  tuz: "baharat", karabiber: "baharat", pul_biber: "baharat", kimyon: "baharat", tarcin: "baharat", kekik: "baharat",
  defne_yapragi: "baharat", sarimsak_tozu: "baharat", susam: "baharat", nane: "baharat",

  seker: "temel_gida", bal: "temel_gida", tahin: "temel_gida", kuru_maya: "temel_gida", ceviz: "temel_gida",
  tavuk_suyu: "temel_gida", balik_suyu: "temel_gida",

  su: "icecek",
};

export function aisleForIngredient(slug: string, displayName: string, fallback: Aisle): Aisle {
  // "Kuru nane" baharat, "Taze nane" yeşillik — aynı slug'ı paylaşıyorlar.
  if (slug === "nane" && /taze/i.test(displayName)) return "sebze";
  return SLUG_AISLE[slug] ?? fallback;
}

export function aisleDisplayName(aisle: Aisle): string {
  return AISLE_DISPLAY[aisle].displayName;
}

export function aisleOrder(aisle: Aisle): number {
  return AISLE_DISPLAY[aisle].order;
}
