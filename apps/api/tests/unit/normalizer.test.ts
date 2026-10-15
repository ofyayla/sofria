import { describe, expect, it } from "vitest";
import type { UserPreferencesPayload } from "@sofria/shared";
import { normalizePreferences } from "../../src/services/plan/normalizer.js";

function basePayload(overrides: Partial<UserPreferencesPayload> = {}): UserPreferencesPayload {
  return {
    schemaVersion: 1,
    householdSize: 3,
    cookingSkill: "orta",
    maxPrepMinutes: 60,
    dietary: {
      glutenFree: false,
      lactoseFree: false,
      vegetarian: false,
      vegan: false,
      avoidedIngredients: [],
      allergies: [],
    },
    equipment: {
      hasOven: true,
      hasAirFryer: false,
      hasPressureCooker: false,
      hasBlender: false,
      stovetopOnly: false,
    },
    mealComplexity: { lunch: "iki_cesit", dinner: "tam_menu" },
    includedMeals: ["ogle", "aksam"],
    cuisinePreferences: ["kirmizi_et"],
    daysCount: 7,
    ...overrides,
  };
}

describe("normalizePreferences", () => {
  it("avoidedIngredients farklı yazımları aynı slug'a normalize eder", () => {
    const payload = basePayload({
      dietary: {
        glutenFree: false,
        lactoseFree: false,
        vegetarian: false,
        vegan: false,
        avoidedIngredients: ["  Tavuk Göğsü  ", "tavuk gögsü"], // aynı malzemenin iki yazımı
        allergies: [],
      },
    });
    const normalized = normalizePreferences(payload);
    expect(normalized.dietary.avoidedIngredients).toEqual(["tavuk_gogsu"]); // dedupe edilmiş
  });

  it("cuisinePreferences sırası fark etmeksizin aynı normalize sonucu üretir", () => {
    const a = normalizePreferences(basePayload({ cuisinePreferences: ["balik_urunleri", "italyan_mutfagi"] }));
    const b = normalizePreferences(basePayload({ cuisinePreferences: ["italyan_mutfagi", "balik_urunleri"] }));
    expect(a.cuisinePreferences).toEqual(b.cuisinePreferences);
  });

  it("includedMeals de sıradan bağımsız normalize edilir", () => {
    const a = normalizePreferences(basePayload({ includedMeals: ["aksam", "ogle"] }));
    const b = normalizePreferences(basePayload({ includedMeals: ["ogle", "aksam"] }));
    expect(a.includedMeals).toEqual(b.includedMeals);
  });
});
