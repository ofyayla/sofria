import { beforeEach, describe, expect, it } from "vitest";
import { useRulesProfileStore } from "../../stores/rulesProfile.store";

describe("useRulesProfileStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useRulesProfileStore.setState({
      dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
      equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: false },
    });
  });

  it("setDietary değişikliği anında LocalStorage'a yazar (SDD §5.1: ayrı Kaydet butonu yok)", () => {
    useRulesProfileStore.getState().setDietary({ glutenFree: true });

    const raw = localStorage.getItem("sofria:v1:rulesProfile");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.dietary.glutenFree).toBe(true);
  });

  it("addAvoidedIngredient malzemeyi ekler, aynısını tekrar eklemez (dedupe)", () => {
    useRulesProfileStore.getState().addAvoidedIngredient("mantar");
    useRulesProfileStore.getState().addAvoidedIngredient("mantar");
    expect(useRulesProfileStore.getState().dietary.avoidedIngredients).toEqual(["mantar"]);
  });

  it("removeAvoidedIngredient malzemeyi çıkarır", () => {
    useRulesProfileStore.getState().addAvoidedIngredient("mantar");
    useRulesProfileStore.getState().removeAvoidedIngredient("mantar");
    expect(useRulesProfileStore.getState().dietary.avoidedIngredients).toEqual([]);
  });

  // SDD §4.3: sayfa yenilemede LocalStorage'dan gerçekten geri yükleniyor mu?
  it("rehydrate() sonrası LocalStorage'daki veri state'e geri yüklenir", async () => {
    useRulesProfileStore.getState().setDietary({ glutenFree: true, avoidedIngredients: ["mantar"] });

    // Gerçek bir sayfa yenilemesinde LocalStorage AYNEN kalır, yalnızca JS
    // modülü bellekteki state'i sıfırdan başlatır. Bu yüzden storage'ı önce
    // yedekleyip, bellek sıfırlama (setState) storage'ı da ezdiği için
    // (persist middleware her setState'i storage'a yazar) sonra geri koyuyoruz.
    const persistedRaw = localStorage.getItem("sofria:v1:rulesProfile");
    useRulesProfileStore.setState({
      dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
      equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: false },
    });
    localStorage.setItem("sofria:v1:rulesProfile", persistedRaw!);

    await useRulesProfileStore.persist.rehydrate();

    expect(useRulesProfileStore.getState().dietary.glutenFree).toBe(true);
    expect(useRulesProfileStore.getState().dietary.avoidedIngredients).toEqual(["mantar"]);
  });
});
