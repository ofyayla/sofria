import type { Unit } from "@sofria/shared";

export type UnitFamily = "weight" | "volume" | "count";

/**
 * SDD §3.3 "Alışveriş listesi toplama kuralı": yalnızca AYNI ölçü ailesi
 * içinde dönüştürme yapılır. "2 adet soğan" + "100 gr soğan" gibi farklı
 * aile kombinasyonları burada SESSİZCE toplanmaz — çağıran taraf (F5'te
 * shoppingList.builder.ts) bunu ayrı satır olarak göstermek zorunda kalır.
 */
const UNIT_FAMILY: Record<Unit, UnitFamily> = {
  gr: "weight",
  kg: "weight",
  ml: "volume",
  lt: "volume",
  su_bardagi: "volume",
  cay_bardagi: "volume",
  yemek_kasigi: "volume",
  tatli_kasigi: "volume",
  cay_kasigi: "volume",
  adet: "count",
  demet: "count",
  diş: "count",
  dilim: "count",
  paket: "count",
  tutam: "count",
};

/** Her ailenin baz birimine (gr / ml) kaç katı geldiği. count ailesi dönüştürülemez. */
const TO_BASE_FACTOR: Partial<Record<Unit, number>> = {
  gr: 1,
  kg: 1000,
  ml: 1,
  lt: 1000,
  su_bardagi: 200,
  cay_bardagi: 65,
  yemek_kasigi: 15,
  tatli_kasigi: 8,
  cay_kasigi: 5,
};

/**
 * Gerçek kullanıcı testinde bulundu: "yemek kaşığı"/"su bardağı" gibi
 * birimler DOĞADA İKİRCİKLİ — sıvı bir malzeme için (süt, yağ) hacim (ml)
 * ifade eder, ama katı/toz bir malzeme için (tereyağı, un, tuz, salça)
 * kaşıkla ölçülse bile GERÇEKTE AĞIRLIK ifade eder. Alışveriş listesi "210 ml
 * Tereyağı" gibi anlamsız satırlar üretiyordu. Bu tablo, ingredients.dictionary.ts
 * bir malzemeyi "weight" tercihli işaretlediğinde kaşık/bardak birimlerini
 * gram karşılığına çevirir (yaklaşık değerler — malzemeye özel yoğunluk
 * farkı göz ardı edilir, alışveriş listesi için yeterli hassasiyettir).
 */
const WEIGHT_PREFERRED_FACTOR: Partial<Record<Unit, number>> = {
  gr: 1,
  kg: 1000,
  ml: 1, // katı/toz malzemede ml görülmesi nadir; 1:1 kabul edilir
  lt: 1000,
  su_bardagi: 150,
  cay_bardagi: 50,
  yemek_kasigi: 12,
  tatli_kasigi: 7,
  cay_kasigi: 4,
};

/** Bölünemeyen, tane tane alınan birimler (tutam bir ölçü olduğu için hariç). */
const WHOLE_PURCHASE_UNITS = new Set<Unit>(["adet", "demet", "diş", "dilim", "paket"]);

/**
 * Gerçek kullanıcı testinde bulundu: hane büyüklüğüne göre ölçeklenen tarif
 * miktarları "2.25 adet domates", "0.38 demet maydanoz" gibi görünüyordu.
 * Mutfak diline uygun adımlara yuvarlanır: sayılabilir/kaşık birimleri
 * yarımlık adımlara (en az 0.5), gram/ml 20'den büyükse 5'in katlarına.
 */
export function roundForRecipe(amount: number, unit: Unit): number {
  const family = UNIT_FAMILY[unit];
  if (family === "count" || (family === "volume" && unit !== "ml" && unit !== "lt")) {
    return Math.max(0.5, Math.round(amount * 2) / 2);
  }
  if (unit === "kg" || unit === "lt") return Math.round(amount * 100) / 100;
  return amount >= 20 ? Math.round(amount / 5) * 5 : Math.max(1, Math.round(amount));
}

/**
 * Alışveriş listesi SATIN ALMA miktarıdır: toplamlar kayan nokta artığıyla
 * ("1.8899999999999997 demet") ve alınamayacak kesirlerle ("2.25 adet")
 * görünüyordu. Tane tane alınan birimler yukarı yuvarlanır, gram/ml 5'in
 * katlarına, kaşık/bardak gibi ölçüler yarımlık adımlara.
 */
export function roundForShopping(amount: number, unit: Unit): number {
  if (WHOLE_PURCHASE_UNITS.has(unit)) return Math.max(1, Math.ceil(amount - 1e-9));
  return roundForRecipe(amount, unit);
}

export function unitFamily(unit: Unit, preferredFamily?: UnitFamily): UnitFamily {
  if (preferredFamily === "weight" && WEIGHT_PREFERRED_FACTOR[unit] !== undefined) return "weight";
  return UNIT_FAMILY[unit];
}

export function canCombine(a: Unit, b: Unit): boolean {
  const familyA = UNIT_FAMILY[a];
  return familyA !== "count" && familyA === UNIT_FAMILY[b];
}

/**
 * `unit` cinsinden bir miktarı ailenin baz birimine (gr veya ml) çevirir.
 * `count` ailesi (adet, dilim, diş...) dönüştürülemez — `null` döner,
 * çağıran taraf bu durumda birleştirmeyi denememelidir. `preferredFamily`
 * "weight" verilirse kaşık/bardak birimleri gram karşılığına çevrilir
 * (bkz. WEIGHT_PREFERRED_FACTOR).
 */
export function toBaseAmount(amount: number, unit: Unit, preferredFamily?: UnitFamily): number | null {
  if (preferredFamily === "weight") {
    const weightFactor = WEIGHT_PREFERRED_FACTOR[unit];
    return weightFactor === undefined ? null : amount * weightFactor;
  }
  const factor = TO_BASE_FACTOR[unit];
  if (factor === undefined) return null;
  return amount * factor;
}

/**
 * İki miktarı, ikisi de aynı ailedeyse toplar ve `toUnit` cinsinden döner.
 * Aileler farklıysa veya ikisi de `count` ise `null` döner — sessiz yanlış
 * toplama yapmak yerine, çağıran taraf ayrı satır göstermeyi seçer.
 */
export function sumInUnit(
  a: { amount: number; unit: Unit },
  b: { amount: number; unit: Unit },
  toUnit: Unit
): number | null {
  if (!canCombine(a.unit, toUnit) || !canCombine(b.unit, toUnit)) return null;
  const baseA = toBaseAmount(a.amount, a.unit);
  const baseB = toBaseAmount(b.amount, b.unit);
  const baseTarget = TO_BASE_FACTOR[toUnit];
  if (baseA === null || baseB === null || baseTarget === undefined) return null;
  return (baseA + baseB) / baseTarget;
}
