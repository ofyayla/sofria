import { describe, expect, it } from "vitest";
import { findForbiddenKeyword } from "../../src/domain/forbiddenIngredients.js";

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
