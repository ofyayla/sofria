import { describe, expect, it } from "vitest";
import type { DayPlan, Ingredient } from "@sofria/shared";
import { buildShoppingList } from "../../src/services/plan/shoppingList.builder.js";

function makeDay(ingredientsBySubRecipe: Ingredient[][]): DayPlan {
  return {
    dayIndex: 0,
    dayName: "Pazartesi",
    meals: [
      {
        mealId: "m1",
        type: "aksam",
        title: "Test",
        complexity: ingredientsBySubRecipe.length === 1 ? "tek_cesit" : "iki_cesit",
        cuisineTag: "kirmizi_et",
        totalPrepMinutes: 30,
        subRecipes: ingredientsBySubRecipe.map((ingredients, i) => ({
          subRecipeId: `s${i}`,
          name: `Alt Yemek ${i}`,
          role: "ana_yemek",
          servings: 4,
          prepMinutes: 10,
          cookMinutes: 10,
          difficulty: "kolay",
          ingredients,
          instructions: [{ order: 1, text: "Pişir." }],
          requiredEquipment: [],
        })),
      },
    ],
  };
}

describe("buildShoppingList", () => {
  // SDD §3.3 kritik kural: aynı aile içinde (gr/kg) doğru toplanır.
  it("200 gr soğan + 1 kg soğan aynı ailede birleşip 1200 gr olur", () => {
    const day = makeDay([
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 200, unit: "gr", isPantryStaple: true }],
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "kg", isPantryStaple: true }],
    ]);
    const list = buildShoppingList([day]);
    const soganItems = list.aisles.flatMap((a) => a.items).filter((i) => i.slug === "sogan");
    expect(soganItems).toHaveLength(1);
    expect(soganItems[0]!.totalAmount).toBe(1200);
    expect(soganItems[0]!.unit).toBe("gr");
  });

  // SDD §3.3 KRİTİK kural: farklı aile (adet + gr) SESSİZCE birleştirilmez, ayrı satır kalır.
  it("2 adet soğan + 100 gr soğan SESSİZCE birleştirilmez, iki ayrı satır kalır", () => {
    const day = makeDay([
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 2, unit: "adet", isPantryStaple: true }],
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 100, unit: "gr", isPantryStaple: true }],
    ]);
    const list = buildShoppingList([day]);
    const soganItems = list.aisles.flatMap((a) => a.items).filter((i) => i.slug === "sogan");
    expect(soganItems).toHaveLength(2);
    const amounts = soganItems.map((i) => `${i.totalAmount}${i.unit}`).sort();
    expect(amounts).toEqual(["100gr", "2adet"]);
  });

  it("count ailesi (adet) aynı birimde tekrarlanınca TEK satırda toplanır", () => {
    const day = makeDay([
      [{ slug: "yumurta", displayName: "Yumurta", amount: 2, unit: "adet", isPantryStaple: true }],
      [{ slug: "yumurta", displayName: "Yumurta", amount: 3, unit: "adet", isPantryStaple: true }],
    ]);
    const list = buildShoppingList([day]);
    const items = list.aisles.flatMap((a) => a.items).filter((i) => i.slug === "yumurta");
    expect(items).toHaveLength(1);
    expect(items[0]!.totalAmount).toBe(5);
    expect(items[0]!.unit).toBe("adet");
  });

  it("sayılabilir toplamlar kayan nokta artığı bırakmadan YUKARI yuvarlanır (2.25 adet → 3)", () => {
    const day = makeDay([
      [{ slug: "domates", displayName: "Domates", amount: 0.75, unit: "adet", isPantryStaple: false }],
      [{ slug: "domates", displayName: "Domates", amount: 1.5, unit: "adet", isPantryStaple: false }],
      [{ slug: "maydanoz", displayName: "Maydanoz", amount: 0.38, unit: "demet", isPantryStaple: false }],
      [{ slug: "maydanoz", displayName: "Maydanoz", amount: 1.51, unit: "demet", isPantryStaple: false }],
    ]);
    const items = buildShoppingList([day]).aisles.flatMap((a) => a.items);
    expect(items.find((i) => i.slug === "domates")!.totalAmount).toBe(3);
    expect(items.find((i) => i.slug === "maydanoz")!.totalAmount).toBe(2);
  });

  it("ana aileyle birleşemeyen aynı birimli kayıtlar tek satırda toplanır (yinelenen satır yok)", () => {
    const day = makeDay([
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 100, unit: "gr", isPantryStaple: true }],
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "adet", isPantryStaple: true }],
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 2, unit: "adet", isPantryStaple: true }],
    ]);
    const soganItems = buildShoppingList([day]).aisles.flatMap((a) => a.items).filter((i) => i.slug === "sogan");
    expect(soganItems.map((i) => `${i.totalAmount}${i.unit}`).sort()).toEqual(["100gr", "3adet"]);
  });

  // Gerçek kullanıcı testinde bulundu: "yemek kaşığı tereyağı" gibi ölçümler
  // varsayılan olarak hacim (ml) ailesine düşüyor, alışveriş listesinde
  // "210 ml Tereyağı" gibi anlamsız satırlar oluşuyordu. Sözlükteki
  // unitClass="weight" sayesinde artık gram olarak toplanıyor.
  it("tereyağı gibi katı malzemeler yemek kaşığıyla ölçülse bile GRAM olarak toplanır (ml değil)", () => {
    const day = makeDay([
      [{ slug: "tereyagi", displayName: "Tereyağı", amount: 2, unit: "yemek_kasigi", isPantryStaple: true }],
      [{ slug: "tereyagi", displayName: "Tereyağı", amount: 1, unit: "su_bardagi", isPantryStaple: true }],
    ]);
    const list = buildShoppingList([day]);
    const items = list.aisles.flatMap((a) => a.items).filter((i) => i.slug === "tereyagi");
    expect(items).toHaveLength(1);
    expect(items[0]!.unit).toBe("gr");
    expect(items[0]!.totalAmount).toBe(175); // 2 yemek kaşığı (12g) + 1 su bardağı (150g) = 174 → 5'in katına
  });

  it("süt gibi gerçek sıvılar yemek kaşığıyla ölçülünce hâlâ ml olarak toplanır (değişmedi)", () => {
    const day = makeDay([[{ slug: "sut", displayName: "Süt", amount: 2, unit: "yemek_kasigi", isPantryStaple: false }]]);
    const list = buildShoppingList([day]);
    const items = list.aisles.flatMap((a) => a.items).filter((i) => i.slug === "sut");
    expect(items).toHaveLength(1);
    expect(items[0]!.unit).toBe("ml");
    expect(items[0]!.totalAmount).toBe(30); // 2 × 15ml
  });

  it("malzemeler doğru reyona (aisle) atanır", () => {
    const day = makeDay([[{ slug: "tavuk_gogsu", displayName: "tavuk göğsü", amount: 500, unit: "gr", isPantryStaple: false }]]);
    const list = buildShoppingList([day]);
    const group = list.aisles.find((a) => a.items.some((i) => i.slug === "tavuk_gogsu"));
    expect(group?.aisle).toBe("beyaz_et");
  });

  it("reyonlar order alanına göre sıralı döner", () => {
    const day = makeDay([
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "adet", isPantryStaple: true }], // sebze, order 1
      [{ slug: "tavuk_gogsu", displayName: "tavuk göğsü", amount: 500, unit: "gr", isPantryStaple: false }], // beyaz et, order 7
    ]);
    const list = buildShoppingList([day]);
    const orders = list.aisles.map((a) => a.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("usedIn bilgisi doğru mealId/subRecipeId ile izlenebilir", () => {
    const day = makeDay([[{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "adet", isPantryStaple: true }]]);
    const list = buildShoppingList([day]);
    const item = list.aisles.flatMap((a) => a.items).find((i) => i.slug === "sogan")!;
    expect(item.usedIn).toEqual([{ mealId: "m1", subRecipeId: "s0", amount: 1 }]);
  });

  it("itemCount tüm reyonlardaki toplam satır sayısına eşittir", () => {
    const day = makeDay([
      [{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "adet", isPantryStaple: true }],
      [{ slug: "tavuk_gogsu", displayName: "tavuk göğsü", amount: 500, unit: "gr", isPantryStaple: false }],
    ]);
    const list = buildShoppingList([day]);
    expect(list.itemCount).toBe(2);
  });
});
