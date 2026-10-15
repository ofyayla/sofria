import { describe, expect, it } from "vitest";
import { suggestIngredients } from "../../src/domain/ingredientSuggest.js";

describe("suggestIngredients", () => {
  it("kısmi yazımla eşleşen malzemeleri döner", () => {
    const results = suggestIngredients("tavuk gö");
    expect(results.some((r) => r.slug === "tavuk_gogsu")).toBe(true);
  });

  it("boş sorguda boş dizi döner", () => {
    expect(suggestIngredients("")).toEqual([]);
  });

  it("eşleşme yoksa boş dizi döner", () => {
    expect(suggestIngredients("xyzabc123")).toEqual([]);
  });

  it("aynı slug birden fazla eşanlamlıdan eşleşse bile bir kez döner", () => {
    const results = suggestIngredients("soğan");
    const soganCount = results.filter((r) => r.slug === "sogan").length;
    expect(soganCount).toBeLessThanOrEqual(1);
  });

  it("limit parametresine uyar", () => {
    const results = suggestIngredients("a", 3); // "a" birçok malzemede geçer
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
