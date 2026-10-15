import { describe, expect, it } from "vitest";
import { AISLE_DISPLAY, aisleDisplayName, aisleForIngredient, aisleOrder } from "../../src/domain/aisles.map.js";
import { INGREDIENT_DICTIONARY } from "../../src/domain/ingredients.dictionary.js";
import { RECIPE_CATALOG } from "../../src/domain/recipeCatalog.js";

describe("aisles.map", () => {
  it("meyve en düşük order'a sahip", () => {
    expect(aisleOrder("meyve")).toBe(0);
  });

  it("her reyonun order değeri benzersizdir", () => {
    const orders = Object.values(AISLE_DISPLAY).map((a) => a.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("aisleDisplayName Türkçe okunabilir isim döner", () => {
    expect(aisleDisplayName("sut_urunleri")).toBe("Süt ve Süt Ürünleri");
  });

  it("sözlükteki her malzemenin reyonu geçerli bir AISLE_DISPLAY girdisine sahip", () => {
    for (const entry of INGREDIENT_DICTIONARY) {
      expect(AISLE_DISPLAY[entry.aisle]).toBeDefined();
    }
  });

  it("katalogdaki hiçbir malzeme 'Diğer'e düşmez", () => {
    const uncategorized = RECIPE_CATALOG.flatMap((r) => r.ingredients)
      .filter((ing) => aisleForIngredient(ing.slug, ing.displayName, "diger") === "diger")
      .map((ing) => ing.slug);
    expect([...new Set(uncategorized)]).toEqual([]);
  });

  it("pirinç/bulgur bakliyatta, makarna/şehriye unlu mamullerde, yumurta kendi kategorisinde", () => {
    expect(aisleForIngredient("pirinc", "Pirinç", "diger")).toBe("bakliyat");
    expect(aisleForIngredient("bulgur_iri", "İri bulgur", "diger")).toBe("bakliyat");
    expect(aisleForIngredient("makarna", "Makarna (penne)", "diger")).toBe("unlu_mamuller");
    expect(aisleForIngredient("sehriye", "Şehriye", "diger")).toBe("unlu_mamuller");
    expect(aisleForIngredient("yumurta", "Yumurta", "diger")).toBe("yumurta");
    expect(aisleForIngredient("nane", "Taze nane", "diger")).toBe("sebze");
    expect(aisleForIngredient("nane", "Kuru nane", "diger")).toBe("baharat");
  });
});
