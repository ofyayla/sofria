import { beforeEach, describe, expect, it } from "vitest";
import { useRulesProfileStore } from "../../stores/rulesProfile.store";

const STORAGE_KEY = "sofria:v1:rulesProfile";

describe("useRulesProfileStore — göç (migration)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // SDD §4.3: "v1→v2 geçişinde... " — burada hayali v0→v1 geçişini gerçekten kanıtlıyoruz.
  it("eski (v0, düz şekilli) bir kayıt, yeni (v1, nested) şekle doğru dönüştürülür", async () => {
    const legacyV0Shape = {
      state: { glutenFree: true, avoidedIngredients: ["mantar"], hasOven: false },
      version: 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyV0Shape));

    await useRulesProfileStore.persist.rehydrate();

    const state = useRulesProfileStore.getState();
    expect(state.dietary.glutenFree).toBe(true);
    expect(state.dietary.avoidedIngredients).toEqual(["mantar"]);
    // v0'da olmayan alanlar (lactoseFree vb.) varsayılan değerleriyle dolmuş olmalı.
    expect(state.dietary.lactoseFree).toBe(false);
    expect(state.equipment.hasOven).toBe(false);
    expect(state.equipment.stovetopOnly).toBe(true); // migrate fonksiyonunun türettiği alan
  });

  // SDD §4.3: "bozuk kayıt sessizce sıfırlanır" — kullanıcı hataya düşmemeli.
  it("bozuk/beklenmeyen şekilli bir kayıt sessizce varsayılana döner, hata fırlatmaz", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: "bu bir obje değil, bozuk veri", version: 0 }));

    await expect(useRulesProfileStore.persist.rehydrate()).resolves.not.toThrow();

    const state = useRulesProfileStore.getState();
    expect(state.dietary.glutenFree).toBe(false); // varsayılana dönmüş
    expect(state.dietary.avoidedIngredients).toEqual([]);
  });

  it("tamamen geçersiz JSON içeren kayıt da sessizce varsayılana döner", async () => {
    localStorage.setItem(STORAGE_KEY, "{{{ geçersiz json");

    await expect(useRulesProfileStore.persist.rehydrate()).resolves.not.toThrow();
    expect(useRulesProfileStore.getState().dietary.glutenFree).toBe(false);
  });
});
