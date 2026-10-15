import { UNITS } from "@sofria/shared";

/**
 * Gerçek üretim hatası: LLM'e `unit` alanı için tek bir örnek değer
 * ("gr") gösteriliyordu, geçerli değerlerin TAM listesi hiç verilmiyordu.
 * Model bu yüzden diğer birimlerin deseninden (yemek_kasigi, cay_bardagi
 * gibi ASCII-katlanmış çok-kelimeli birimler) yola çıkıp "diş" birimini de
 * "dis" olarak üretiyordu — hem ilk denemede hem onarım turunda. Listeyi
 * açıkça vermek bu tür enum tahminlerini azaltır.
 */
export function buildUnitsFragment(): string {
  return `Her malzeme için "unit" alanında SADECE şu değerlerden birini kullan (birebir, harfi harfine): ${UNITS.join(", ")}.`;
}
