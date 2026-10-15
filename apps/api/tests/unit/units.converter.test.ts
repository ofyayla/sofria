import { describe, expect, it } from "vitest";
import { canCombine, roundForRecipe, roundForShopping, sumInUnit, toBaseAmount, unitFamily } from "../../src/domain/units.converter.js";

describe("roundForRecipe / roundForShopping", () => {
  it("tarifte sayılabilir birimler yarımlık adımlara yuvarlanır (en az 0.5)", () => {
    expect(roundForRecipe(2.25, "adet")).toBe(2.5);
    expect(roundForRecipe(0.38, "demet")).toBe(0.5);
    expect(roundForRecipe(0.1, "diş")).toBe(0.5);
    expect(roundForRecipe(1.5, "yemek_kasigi")).toBe(1.5);
  });

  it("tarifte gram/ml 20'den büyükse 5'in katına yuvarlanır", () => {
    expect(roundForRecipe(337.5, "gr")).toBe(340);
    expect(roundForRecipe(12.4, "gr")).toBe(12);
    expect(roundForRecipe(1.8899999999999997, "ml")).toBe(2);
  });

  it("alışverişte tane tane alınan birimler yukarı yuvarlanır, kayan nokta artığı kalmaz", () => {
    expect(roundForShopping(2.25, "adet")).toBe(3);
    expect(roundForShopping(1.8899999999999997, "demet")).toBe(2);
    expect(roundForShopping(3.0000000000000004, "adet")).toBe(3);
    expect(roundForShopping(0.2, "paket")).toBe(1);
    expect(roundForShopping(1012.5, "gr")).toBe(1015);
  });
});

describe("units.converter", () => {
  it("aynı ailedeki birimler birleştirilebilir", () => {
    expect(canCombine("gr", "kg")).toBe(true);
    expect(canCombine("ml", "su_bardagi")).toBe(true);
  });

  it("farklı ailedeki birimler birleştirilemez", () => {
    expect(canCombine("gr", "ml")).toBe(false);
    expect(canCombine("gr", "adet")).toBe(false);
  });

  // SDD §3.3: "count" ailesi (adet, dilim, diş...) hiçbir şeyle birleştirilemez.
  it("count ailesi kendi içinde bile birleştirilemez", () => {
    expect(canCombine("adet", "adet")).toBe(false);
    expect(canCombine("dilim", "adet")).toBe(false);
  });

  it("1 su bardağı = 200 ml olarak baz birime çevrilir", () => {
    expect(toBaseAmount(1, "su_bardagi")).toBe(200);
  });

  it("1 kg = 1000 gr olarak baz birime çevrilir", () => {
    expect(toBaseAmount(1, "kg")).toBe(1000);
  });

  it("count birimi baz birime çevrilemez (null döner)", () => {
    expect(toBaseAmount(3, "adet")).toBeNull();
  });

  it("aynı aileden iki miktar doğru toplanır: 200 gr + 1 kg = 1200 gr", () => {
    const result = sumInUnit({ amount: 200, unit: "gr" }, { amount: 1, unit: "kg" }, "gr");
    expect(result).toBe(1200);
  });

  it("1 yemek kaşığı + 1 su bardağı ml cinsinden doğru toplanır", () => {
    const result = sumInUnit(
      { amount: 1, unit: "yemek_kasigi" },
      { amount: 1, unit: "su_bardagi" },
      "ml"
    );
    expect(result).toBe(215); // 15 ml + 200 ml
  });

  // SDD §3.3 kritik kural: "2 adet soğan" + "100 gr soğan" SESSİZCE toplanmaz.
  it("farklı aileler (adet + gr) toplanamaz, null döner", () => {
    const result = sumInUnit({ amount: 2, unit: "adet" }, { amount: 100, unit: "gr" }, "gr");
    expect(result).toBeNull();
  });

  it("unitFamily doğru aileyi döner", () => {
    expect(unitFamily("kg")).toBe("weight");
    expect(unitFamily("lt")).toBe("volume");
    expect(unitFamily("adet")).toBe("count");
  });

  // Gerçek kullanıcı testinde bulundu: "yemek kaşığı" doğada ikircikli —
  // preferredFamily="weight" verilince (tereyağı, un, tuz gibi katı
  // malzemeler için) hacim değil ağırlık ailesine düşmeli.
  describe("preferredFamily='weight' override (katı malzemeler)", () => {
    it("yemek kaşığı, preferredFamily olmadan 'volume' ailesine düşer", () => {
      expect(unitFamily("yemek_kasigi")).toBe("volume");
    });

    it("yemek kaşığı, preferredFamily='weight' ile 'weight' ailesine düşer", () => {
      expect(unitFamily("yemek_kasigi", "weight")).toBe("weight");
    });

    it("preferredFamily='weight' iken kaşık/bardak birimleri GRAM karşılığına çevrilir (ml değil)", () => {
      expect(toBaseAmount(1, "yemek_kasigi", "weight")).toBe(12);
      expect(toBaseAmount(1, "su_bardagi", "weight")).toBe(150);
      // preferredFamily olmadan aynı birim ml karşılığına çevrilir — farklı sayı.
      expect(toBaseAmount(1, "yemek_kasigi")).toBe(15);
    });

    it("preferredFamily='weight' iken gr/kg zaten doğru davranır (değişmez)", () => {
      expect(toBaseAmount(1, "kg", "weight")).toBe(1000);
    });
  });
});
