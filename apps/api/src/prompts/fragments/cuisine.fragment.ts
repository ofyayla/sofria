import type { CuisineType } from "@sofria/shared";

const CUISINE_DISPLAY: Record<CuisineType, string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

/**
 * SDD §1.2: Mutfak seçimi bir KISIT değil TERCİHTİR — post-check ile sıkı
 * denetlenmez (bkz. PlanPostCheck, F5). Burada yalnızca dağıtım yönergesi
 * veriliyor; LLM'in kendi işaretlediği cuisineTag bilgilendiricidir.
 *
 * Gerçek kullanıcı talebi: mutfak seçimi bölgesel kategorilerden (Türk/Ege/
 * Karadeniz vb.) protein/yemek türü + iki dünya mutfağı kategorisine
 * (Kırmızı Et, Beyaz Et, Balık Ürünleri, Sebze Yemekleri, Ortadoğu Mutfağı,
 * İtalyan Mutfağı) geçirildi. Kahvaltı bu kategorilerin HİÇBİRİNE anlamlı
 * şekilde oturmuyor (peynir-zeytin-domates bir "protein türü" değildir) —
 * bu yüzden kahvaltı dağıtım kısıtının tamamen DIŞINDA tutuluyor.
 */
const BREAKFAST_NOTE =
  '- Kahvaltı öğünleri seçilen mutfak tercihlerinden BAĞIMSIZDIR ve dağıtım kısıtına dahil değildir; kahvaltı öğününde cuisineTag alanını içeriğe en yakın kategoriyle (genelde "sebze_yemekleri") işaretle.';

/**
 * Gerçek kullanıcı talebi: Balık Ürünleri öğünlerinde çorba, deniz ürünü
 * (ana yemekle örtüşüp tekrar hissi yaratıyor) veya yoğurtlu/sütlü olmasın.
 */
const FISH_SOUP_NOTE =
  "- Balık Ürünleri öğününde çorba (role: corba) varsa, bu çorba deniz ürünü (balık, karides, midye vb.) İÇERMESİN ve yoğurtlu/sütlü bir çorba OLMASIN — sebze veya et suyu bazlı bir çorba tercih et.";

/**
 * Gerçek kullanıcı talebi: bir öğündeki alt tarifler (çorba+ana yemek+yan
 * lezzet vb.) rastgele bir araya getirilmiş gibi hissettirmemeli, birbirine
 * YAKIŞMALI. Kırmızı Et/Beyaz Et/Balık Ürünleri/Sebze Yemekleri kategorileri
 * genelde Türk ev yemeği tarzındadır ve birbiriyle rahatça harmanlanabilir;
 * Ortadoğu ve İtalyan Mutfağı ise kendi belirgin mutfak kimliğine sahiptir —
 * bunlar seçiliyken bir öğün baştan sona o mutfağın tarzında kalmalı.
 */
const COHESION_NOTE =
  "- Bir öğündeki alt tarifler (çorba, ana yemek, yan lezzet vb.) LEZZET/TARZ olarak birbirine YAKIŞMALI — rastgele bir araya getirilmiş hissi vermemeli. Kırmızı Et, Beyaz Et, Balık Ürünleri ve Sebze Yemekleri kategorileri genelde Türk ev yemeği tarzındadır ve birbiriyle rahatça harmanlanabilir; Ortadoğu Mutfağı ve İtalyan Mutfağı ise kendi mutfak kimliğini korumalı — bu ikisi seçiliyse bir öğün baştan sona o mutfağın tarzında kalmalı, rastgele karıştırılmamalı.";

export function buildCuisineFragment(cuisines: CuisineType[]): string {
  const names = cuisines.map((c) => CUISINE_DISPLAY[c]).join(", ");
  const fishNote = cuisines.includes("balik_urunleri") ? FISH_SOUP_NOTE : "";

  if (cuisines.length === 1) {
    return [`- Mutfak: Hafta boyunca öğle ve akşam yemekleri ${names} tarzında olmalı.`, COHESION_NOTE, BREAKFAST_NOTE, fishNote]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `- Mutfaklar: ${names}.`,
    "- Bu mutfakları haftadaki ÖĞLE ve AKŞAM öğünleri arasında ÖĞÜN bazında DENGELİ dağıt (gün bazında DEĞİL) — aynı günün öğle ve akşam yemeği farklı mutfaklardan olabilir, bu istenen bir şeydir.",
    "- Aynı mutfak art arda 3 öğünden fazla tekrarlanmasın.",
    "- Her öğle/akşam öğünü için hangi mutfaktan olduğunu cuisineTag alanında belirt.",
    COHESION_NOTE,
    BREAKFAST_NOTE,
    fishNote,
  ]
    .filter(Boolean)
    .join("\n");
}
