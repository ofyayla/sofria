import type { DietaryConstraints } from "@sofria/shared";

/**
 * SDD §1: prompt yalnızca bir talimattır, %100 garanti değildir —
 * bu yüzden PlanPostCheck (F5) aynı kısıtları deterministik kodla da denetler.
 * Bu fragment "ilk savunma hattı"dır.
 */
export function buildDietaryFragment(dietary: DietaryConstraints): string {
  const lines: string[] = [];

  if (dietary.glutenFree) {
    lines.push(
      "- GLUTENSİZ: Hiçbir tarifte buğday unu, arpa, çavdar kullanma. Çorbalarda " +
        "bağlayıcı olarak un yerine mısır nişastası kullan. Köfte/hamur işlerinde " +
        "glutensiz un karışımı veya patates bazlı bağlayıcı kullan."
    );
  }
  if (dietary.lactoseFree) {
    lines.push("- LAKTOZSUZ: Süt, yoğurt, krema gibi laktoz içeren ürünleri laktozsuz alternatiflerle değiştir.");
  }
  if (dietary.vegetarian) {
    lines.push("- VEJETARYEN: Hiçbir tarifte et, tavuk veya balık kullanma.");
  }
  if (dietary.vegan) {
    lines.push("- VEGAN: Et, süt ürünü, yumurta ve bal dahil hiçbir hayvansal ürün kullanma.");
  }

  // GÜVENLİK: alerji, kaçınılan malzemeden farklı bir sertlikte vurgulanır.
  if (dietary.allergies.length > 0) {
    lines.push(
      `- ALERJEN UYARISI (KRİTİK, İSTİSNASIZ): Şu malzemeler hiçbir tarifte, hiçbir ` +
        `miktarda, hiçbir türev formda (un, ekstrakt, aroma dahil) bulunmamalı: ${dietary.allergies.join(", ")}.`
    );
  }
  if (dietary.avoidedIngredients.length > 0) {
    lines.push(`- Şu malzemelerden kaçın: ${dietary.avoidedIngredients.join(", ")}.`);
  }

  return lines.length > 0 ? lines.join("\n") : "- Özel bir diyet kısıtı yok.";
}
