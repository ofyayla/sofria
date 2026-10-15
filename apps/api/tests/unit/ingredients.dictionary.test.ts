import { describe, expect, it } from "vitest";
import { INGREDIENT_DICTIONARY, resolveIngredient } from "../../src/domain/ingredients.dictionary.js";

describe("ingredients.dictionary", () => {
  it("en az 50 malzeme içerir (SDD F2 çıkış kriteri)", () => {
    expect(INGREDIENT_DICTIONARY.length).toBeGreaterThanOrEqual(50);
  });

  it("her malzemenin en az bir eşanlamlısı vardır", () => {
    for (const entry of INGREDIENT_DICTIONARY) {
      expect(entry.synonyms.length).toBeGreaterThan(0);
    }
  });

  it("aynı slug birden fazla malzemede tekrar etmez", () => {
    const slugs = INGREDIENT_DICTIONARY.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  // SDD §4.4: "tavuk göğsü", "tavuk gögsü", "göğüs eti" hepsi aynı slug'a düşmeli.
  it.each([
    ["tavuk göğsü", "tavuk_gogsu"],
    ["tavuk gögsü", "tavuk_gogsu"],
    ["Tavuk Gögsü", "tavuk_gogsu"],
    ["göğüs eti", "tavuk_gogsu"],
    ["  tavuk göğsü  ", "tavuk_gogsu"],
    ["YOĞURT", "yogurt"],
    ["yougurt", "yogurt"],
    ["salça", "domates_salcasi"],
    ["kırmızı mercimek", "kirmizi_mercimek"],
    ["hıyar", "salatalik"],
  ])("'%s' → slug '%s'", (raw, expectedSlug) => {
    expect(resolveIngredient(raw).slug).toBe(expectedSlug);
    expect(resolveIngredient(raw).resolved).toBe(true);
  });

  it("çözülemeyen malzeme resolved:false döner ve sistemi durdurmaz", () => {
    const result = resolveIngredient("uzaylı meyvesi");
    expect(result.resolved).toBe(false);
    expect(result.slug).toBe("uzaylı_meyvesi");
    expect(result.aisle).toBe("diger");
  });

  it("her malzeme geçerli bir reyona atanmış", () => {
    const validAisles = new Set([
      "meyve", "sebze", "bakliyat", "unlu_mamuller", "yumurta", "sut_urunleri", "kirmizi_et", "beyaz_et",
      "balik", "konserve_salca", "yag_sirke_sos", "baharat", "temel_gida", "dondurulmus", "icecek", "diger",
    ]);
    for (const entry of INGREDIENT_DICTIONARY) {
      expect(validAisles.has(entry.aisle)).toBe(true);
    }
  });
});
