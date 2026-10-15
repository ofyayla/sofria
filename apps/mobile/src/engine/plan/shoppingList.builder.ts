import type { Aisle, AisleGroup, DayPlan, ShoppingItem, ShoppingList, Unit } from "@sofria/shared";
import { aisleDisplayName, aisleForIngredient, aisleOrder } from "../domain/aisles.map";
import { getPreferredUnitFamily, resolveIngredient } from "../domain/ingredients.dictionary";
import { roundForShopping, toBaseAmount, unitFamily } from "../domain/units.converter";

interface Bucket {
  slug: string;
  displayName: string;
  aisle: Aisle;
  isPantryStaple: boolean;
  /** Ağırlık/hacim ailesinden toplanabilen miktarlar, baz birime (gr/ml) çevrilip biriktirilir. */
  combinedBaseAmount: number | null;
  combinedBaseUnit: Unit | null;
  /**
   * Ana aileyle birleştirilemeyen kayıtlar — ana satıra SESSİZCE eklenmez, ayrı
   * satır olur; ama kendi aralarında aynı birimdekiler toplanır (aksi hâlde
   * aynı malzeme+birim birden çok satır ve istemcide yinelenen liste anahtarı
   * üretiyordu).
   */
  separateEntries: Map<Unit, number>;
  usedIn: { mealId: string; subRecipeId: string; amount: number }[];
}

function addSeparate(bucket: Bucket, amount: number, unit: Unit): void {
  bucket.separateEntries.set(unit, (bucket.separateEntries.get(unit) ?? 0) + amount);
}

/**
 * SDD §3.3 "Alışveriş listesi toplama kuralı": aynı slug'a sahip malzemeler
 * yalnızca AYNI ölçü ailesinde VE AYNI birimde ise birleştirilir. "2 adet
 * soğan" + "100 gr soğan" gibi farklı aileler SESSİZCE toplanmaz, iki ayrı
 * satır olarak kalır. Ama "2 adet soğan" + "3 adet soğan" gibi aynı birim
 * içindeki tekrarlar (özellikle "adet" — count ailesi, en sık rastlanan
 * durum) TEK satıra toplanır; aksi hâlde alışveriş listesinde aynı malzeme
 * onlarca kez ayrı satır olarak tekrarlanıyordu (gerçek kullanıcı testinde
 * bulundu — "Domates" 4 kez, "Kuru soğan" 11 kez ayrı satırdı).
 */
export function buildShoppingList(days: DayPlan[]): ShoppingList {
  const buckets = new Map<string, Bucket>();

  for (const day of days) {
    for (const meal of day.meals) {
      for (const sub of meal.subRecipes) {
        for (const ing of sub.ingredients) {
          let bucket = buckets.get(ing.slug);
          if (!bucket) {
            const resolved = resolveIngredient(ing.displayName);
            bucket = {
              slug: ing.slug,
              // Sözlük farklı bir malzemeye eşlediyse (örn. taze "Bezelye" → "Dondurulmuş bezelye") tarifteki adı koru.
              displayName: resolved.slug === ing.slug ? resolved.displayName : ing.displayName,
              aisle: aisleForIngredient(ing.slug, ing.displayName, resolved.aisle),
              isPantryStaple: ing.isPantryStaple,
              combinedBaseAmount: null,
              combinedBaseUnit: null,
              separateEntries: new Map(),
              usedIn: [],
            };
            buckets.set(ing.slug, bucket);
          }
          bucket.usedIn.push({ mealId: meal.mealId, subRecipeId: sub.subRecipeId, amount: ing.amount });

          // Gerçek kullanıcı testinde bulundu: tereyağı/un/salça/baharat gibi
          // katı malzemeler "yemek kaşığı" ile ölçülünce hacim (ml) ailesine
          // düşüyor, alışveriş listesinde "210 ml Tereyağı" gibi anlamsız
          // satırlar oluşuyordu — sözlükteki unitClass buna göre override eder.
          const preferredFamily = getPreferredUnitFamily(ing.slug);
          const family = unitFamily(ing.unit, preferredFamily);
          // "count" ailesinde (adet, dilim...) birimler arası dönüşüm yok —
          // birimin kendisi zaten "baz birim". Aynı birimdeki tekrarlar
          // (örn. iki ayrı "adet soğan" kaydı) burada birleştirilir.
          const baseUnit: Unit = family === "count" ? ing.unit : family === "weight" ? "gr" : "ml";
          const baseAmount = family === "count" ? ing.amount : toBaseAmount(ing.amount, ing.unit, preferredFamily);
          if (baseAmount === null) {
            addSeparate(bucket, ing.amount, ing.unit);
            continue;
          }

          if (bucket.combinedBaseUnit === null) {
            bucket.combinedBaseUnit = baseUnit;
            bucket.combinedBaseAmount = baseAmount;
          } else if (bucket.combinedBaseUnit === baseUnit) {
            bucket.combinedBaseAmount = (bucket.combinedBaseAmount ?? 0) + baseAmount;
          } else {
            // Farklı aile (örn. bir kayıt ağırlık, bir kayıt hacim) — birleştirilemez.
            addSeparate(bucket, ing.amount, ing.unit);
          }
        }
      }
    }
  }

  const aisleItems = new Map<Aisle, ShoppingItem[]>();
  for (const bucket of buckets.values()) {
    const items: ShoppingItem[] = [];

    if (bucket.combinedBaseAmount !== null && bucket.combinedBaseUnit !== null) {
      items.push({
        slug: bucket.slug,
        displayName: bucket.displayName,
        totalAmount: roundForShopping(bucket.combinedBaseAmount, bucket.combinedBaseUnit),
        unit: bucket.combinedBaseUnit,
        usedIn: bucket.usedIn,
        isPantryStaple: bucket.isPantryStaple,
      });
    }
    for (const [unit, amount] of bucket.separateEntries) {
      // Ana satırla aynı birimde ayrı kayıt oluşmaz (o durumda zaten birleştirilir).
      items.push({
        slug: bucket.slug,
        displayName: bucket.displayName,
        totalAmount: roundForShopping(amount, unit),
        unit,
        usedIn: bucket.usedIn,
        isPantryStaple: bucket.isPantryStaple,
      });
    }

    const list = aisleItems.get(bucket.aisle) ?? [];
    list.push(...items);
    aisleItems.set(bucket.aisle, list);
  }

  const aisles: AisleGroup[] = Array.from(aisleItems.entries())
    .map(([aisle, items]) => ({ aisle, displayName: aisleDisplayName(aisle), order: aisleOrder(aisle), items }))
    .sort((a, b) => a.order - b.order);

  const itemCount = aisles.reduce((sum, group) => sum + group.items.length, 0);

  return { aisles, itemCount };
}
