import { describe, expect, it } from "vitest";
import { findForbiddenKeyword } from "../../src/domain/forbiddenIngredients.js";
import { RECIPE_CATALOG } from "../../src/domain/recipeCatalog.js";

describe("findForbiddenKeyword", () => {
  it("domuz ürünlerini (farklı isimlerle) yakalar", () => {
    expect(findForbiddenKeyword("Domuz Eti")).toBe("domuz");
    expect(findForbiddenKeyword("Domuz Pastırması")).toBe("domuz");
    expect(findForbiddenKeyword("Domuz Sucuğu")).toBe("domuz");
    expect(findForbiddenKeyword("Bacon")).toBe("bacon");
  });

  it("alkollü malzemeleri (farklı isimlerle) yakalar", () => {
    expect(findForbiddenKeyword("Kırmızı Şarap")).toBe("şarap");
    expect(findForbiddenKeyword("Beyaz Şarap Sosu")).toBe("şarap");
    expect(findForbiddenKeyword("Bira")).toBe("bira");
    expect(findForbiddenKeyword("Rakı")).toBe("rakı");
  });

  it("büyük/küçük harf farkını görmezden gelir", () => {
    expect(findForbiddenKeyword("DOMUZ ETİ")).toBe("domuz");
    expect(findForbiddenKeyword("ŞARAP SİRKESİ")).toBe("şarap");
  });

  it("yasaklı olmayan malzemeler için null döner", () => {
    expect(findForbiddenKeyword("Dana Kuşbaşı")).toBeNull();
    expect(findForbiddenKeyword("Tavuk Göğsü")).toBeNull();
    expect(findForbiddenKeyword("Elma Sirkesi")).toBeNull();
  });
});

/**
 * Domuz eti/ürünü ve alkol yasağı kataloğun KENDİSİ için de geçerli. Plan
 * oluşturucu bu tür tarifleri zaten eler (filterByDietary), ama bu sessizce
 * olur — yeni eklenen bir tarif yasaklı malzeme içerirse hiç önerilmez ve
 * kimse fark etmez. Bu test eklerken yakalar.
 */
describe("RECIPE_CATALOG — domuz/alkol yasağı", () => {
  it("hiçbir tarifin adında veya malzemesinde yasaklı anahtar kelime yok", () => {
    const hits: string[] = [];
    for (const recipe of RECIPE_CATALOG) {
      const keywordInName = findForbiddenKeyword(recipe.name);
      if (keywordInName) hits.push(`${recipe.slug}: ad (${keywordInName})`);
      for (const ing of recipe.ingredients) {
        const keyword = findForbiddenKeyword(ing.displayName);
        if (keyword) hits.push(`${recipe.slug}: ${ing.displayName} (${keyword})`);
      }
    }
    expect(hits).toEqual([]);
  });
});
