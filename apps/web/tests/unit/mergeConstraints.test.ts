import { describe, expect, it } from "vitest";
import { mergeDietary, mergeEquipment } from "../../lib/mergeConstraints";

describe("mergeConstraints", () => {
  // SDD §4.2: "effectiveConstraints = merge(rulesProfile.store, preferences.store.sessionOverrides)"
  it("kaydedilen (kalıcı) kural, hiç geçersiz kılma yokken olduğu gibi kullanılır", () => {
    const saved = { glutenFree: true, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: ["mantar"], allergies: [] };
    const result = mergeDietary(saved, {});
    expect(result).toEqual(saved);
  });

  it("tek seferlik oturum geçersiz kılması yalnızca o alanı değiştirir, kalıcı profili etkilemez", () => {
    const saved = { glutenFree: true, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: ["mantar"], allergies: [] };
    const effective = mergeDietary(saved, { avoidedIngredients: [] }); // "bu seferlik mantar olsun"

    expect(effective.avoidedIngredients).toEqual([]); // bu istek için mantar serbest
    expect(saved.avoidedIngredients).toEqual(["mantar"]); // kalıcı profil DEĞİŞMEDİ
  });

  it("ekipman kısıtları da aynı merge mantığıyla çalışır", () => {
    const saved = { hasOven: false, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: true };
    const effective = mergeEquipment(saved, {});
    expect(effective).toEqual(saved);
  });
});
