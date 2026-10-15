import { describe, expect, it } from "vitest";
import type { UserPreferencesPayload } from "@sofria/shared";
import { buildWeeklyPlanPrompt } from "../../src/prompts/weeklyPlan.prompt.js";

function basePayload(overrides: Partial<UserPreferencesPayload> = {}): UserPreferencesPayload {
  return {
    schemaVersion: 1,
    householdSize: 3,
    cookingSkill: "orta",
    maxPrepMinutes: 60,
    dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
    equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: false },
    mealComplexity: { lunch: "iki_cesit", dinner: "tam_menu" },
    includedMeals: ["ogle", "aksam"],
    cuisinePreferences: ["kirmizi_et"],
    daysCount: 7,
    ...overrides,
  };
}

describe("buildWeeklyPlanPrompt — householdAges", () => {
  it("householdAges verilmemişse yaş satırı hiç eklenmez", () => {
    const { userPrompt } = buildWeeklyPlanPrompt(basePayload());
    expect(userPrompt).not.toContain("yaşları");
  });

  it("householdAges'te çocuk (12 yaş altı) varsa küçük porsiyon talimatı eklenir", () => {
    const { userPrompt } = buildWeeklyPlanPrompt(basePayload({ householdAges: [35, 33, 8] }));
    expect(userPrompt).toContain("Hane üyelerinin yaşları: 35, 33, 8.");
    expect(userPrompt).toContain("8 yaşındaki çocuklar için porsiyon miktarlarını");
    expect(userPrompt).toContain("yetişkin porsiyonuna göre belirgin şekilde küçük tut");
  });

  it("householdAges'te sadece yetişkinler varsa çocuk talimatı eklenmez", () => {
    const { userPrompt } = buildWeeklyPlanPrompt(basePayload({ householdAges: [35, 33, 30] }));
    expect(userPrompt).toContain("Hane üyelerinin yaşları: 35, 33, 30.");
    expect(userPrompt).not.toContain("çocuklar için porsiyon");
  });
});
