import type { MealComplexity, MealType } from "@sofria/shared";

const COMPLEXITY_INSTRUCTION: Record<MealComplexity, string> = {
  tek_cesit: "TEK ÇEŞİT: subRecipes dizisi tam olarak 1 eleman içermeli — tek kap pratik bir yemek veya çorba.",
  iki_cesit:
    "İKİ ÇEŞİT: subRecipes dizisi tam olarak 2 eleman içermeli — bir ana yemek + bir yan lezzet/pilav/salata.",
  tam_menu: "TAM MENÜ: subRecipes dizisi tam olarak 3 eleman içermeli — çorba + ana yemek + yan lezzet.",
};

/**
 * Yalnızca kullanıcının GERÇEKTEN dahil ettiği öğün türleri için çeşit
 * talimatı üretilir. Daha önce lunch/dinner her zaman koşulsuz üretiliyordu
 * — bu, "Dahil edilecek öğünler: kahvalti, aksam" satırıyla ÇELİŞEN, daha
 * güçlü/detaylı bir KISIT olarak okunuyordu, LLM'in kullanıcı öğle
 * seçmediği hâlde öğle yemeği üretmesine yol açıyordu (gerçek kullanıcı
 * testinde bulundu).
 */
export function buildComplexityFragment(params: {
  lunch: MealComplexity;
  dinner: MealComplexity;
  includedMeals: MealType[];
}): string {
  const lines: string[] = [];
  if (params.includedMeals.includes("ogle")) {
    lines.push(`- Öğle yemeği için: ${COMPLEXITY_INSTRUCTION[params.lunch]}`);
    // Gerçek kullanıcı talebi: öğle yemeği genelde iş/okul arası sınırlı
    // vakitte hazırlanır — tek/iki çeşit seçiliyken uzun/zahmetli bir tarif
    // ATANMAMALI.
    if (params.lunch === "tek_cesit" || params.lunch === "iki_cesit") {
      lines.push(
        "- Öğle yemeği PRATİK ve KOLAY hazırlanabilir olmalı (kısa hazırlık/pişirme süresi, az adım) — genellikle iş/okul arası sınırlı vakitte hazırlanır."
      );
    }
    // Gerçek kullanıcı talebi: Balık Ürünleri seçili olsa bile öğle yemeğine
    // balık/deniz ürünü ağırlıklı bir ana yemek atanmasın — bu tür tarifler
    // akşam yemeğine ayrılsın.
    lines.push(
      "- Öğle yemeğinde balık veya deniz ürünü ağırlıklı bir ana yemek KULLANMA — Balık Ürünleri seçili olsa bile böyle bir tarifi akşam yemeğine ayır, öğleye atama."
    );
  }
  if (params.includedMeals.includes("aksam")) {
    lines.push(`- Akşam yemeği için: ${COMPLEXITY_INSTRUCTION[params.dinner]}`);
  }
  return lines.join("\n");
}
