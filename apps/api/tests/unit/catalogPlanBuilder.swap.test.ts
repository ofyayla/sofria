import { describe, expect, it } from "vitest";
import type { DayPlan, Meal, SubRecipe, UserPreferencesPayload } from "@sofria/shared";
import { RECIPE_CATALOG } from "../../src/domain/recipeCatalog.js";
import {
  buildCatalogPlan,
  findCatalogRecipe,
  replaceSubRecipe,
  suggestReplacements,
} from "../../src/services/plan/catalogPlanBuilder.js";

function payload(overrides: Partial<UserPreferencesPayload> = {}): UserPreferencesPayload {
  return {
    schemaVersion: 1,
    householdSize: 3,
    cookingSkill: "orta",
    maxPrepMinutes: 60,
    dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
    equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: true, stovetopOnly: false },
    mealComplexity: { lunch: "tek_cesit", dinner: "tam_menu" },
    includedMeals: ["kahvalti", "aksam"],
    cuisinePreferences: ["kirmizi_et"],
    daysCount: 7,
    ...overrides,
  };
}

function firstMeal(days: DayPlan[], type: Meal["type"]): { meal: Meal; day: DayPlan } {
  for (const day of days) {
    const meal = day.meals.find((m) => m.type === type);
    if (meal) return { meal, day };
  }
  throw new Error(`${type} öğünü yok`);
}

function subWithRole(meal: Meal, role: SubRecipe["role"]): SubRecipe {
  const sub = meal.subRecipes.find((s) => s.role === role);
  if (!sub) throw new Error(`${role} yok`);
  return sub;
}

describe("suggestReplacements", () => {
  it("aynı rol ve mutfaktan, öğünde zaten olmayan 3 alternatif önerir", () => {
    const p = payload();
    const days = buildCatalogPlan(p);
    const { meal } = firstMeal(days, "aksam");
    const corba = subWithRole(meal, "corba");
    const result = suggestReplacements({ days, mealId: meal.mealId, subRecipeId: corba.subRecipeId, payload: p });

    expect(result).toHaveLength(3);
    const mealNames = new Set(meal.subRecipes.map((s) => s.name));
    for (const alt of result) {
      const recipe = findCatalogRecipe(alt)!;
      expect(alt.role).toBe("corba");
      expect(recipe.cuisineTags).toContain(meal.cuisineTag);
      expect(mealNames.has(alt.name)).toBe(false);
      expect(alt.servings).toBe(3);
    }
  });

  it("diyet kısıtına uyar", () => {
    const p = payload({ dietary: { glutenFree: false, lactoseFree: false, vegetarian: true, vegan: false, avoidedIngredients: [], allergies: [] }, cuisinePreferences: ["sebze_yemekleri"] });
    const days = buildCatalogPlan(p);
    const { meal } = firstMeal(days, "aksam");
    for (const sub of meal.subRecipes) {
      for (const alt of suggestReplacements({ days, mealId: meal.mealId, subRecipeId: sub.subRecipeId, payload: p, count: 10 })) {
        expect(findCatalogRecipe(alt)!.dietary.vegetarian).toBe(true);
      }
    }
  });

  it("hariç tutulanları önermez; mutfakta kalmazsa yalnızca izin verilirse diğer mutfaklara bakar", () => {
    const p = payload({ cuisinePreferences: ["ortadogu_mutfagi"], includedMeals: ["aksam"] });
    const days = buildCatalogPlan(p);
    const { meal } = firstMeal(days, "aksam");
    const corba = subWithRole(meal, "corba");
    const allCuisineSoups = new Set(RECIPE_CATALOG.filter((r) => r.role === "corba" && r.cuisineTags.includes("ortadogu_mutfagi")).map((r) => r.slug));

    const none = suggestReplacements({ days, mealId: meal.mealId, subRecipeId: corba.subRecipeId, payload: p, excludedSlugs: allCuisineSoups });
    expect(none).toEqual([]);

    const other = suggestReplacements({ days, mealId: meal.mealId, subRecipeId: corba.subRecipeId, payload: p, excludedSlugs: allCuisineSoups, allowOtherCuisines: true });
    expect(other.length).toBeGreaterThan(0);
    for (const alt of other) {
      expect(alt.role).toBe("corba");
      expect(allCuisineSoups.has(findCatalogRecipe(alt)!.slug)).toBe(false);
    }
  });

  it("kahvaltı yerine yalnızca kahvaltılık önerir", () => {
    const p = payload();
    const days = buildCatalogPlan(p);
    const { meal } = firstMeal(days, "kahvalti");
    const result = suggestReplacements({ days, mealId: meal.mealId, subRecipeId: meal.subRecipes[0]!.subRecipeId, payload: p });
    expect(result.length).toBeGreaterThan(0);
    for (const alt of result) expect(findCatalogRecipe(alt)!.isBreakfast).toBe(true);
  });
});

describe("replaceSubRecipe", () => {
  it("yalnızca hedef yemeği değiştirir, ana yemek değişince öğün başlığını günceller", () => {
    const p = payload();
    const days = buildCatalogPlan(p);
    const { meal } = firstMeal(days, "aksam");
    const main = subWithRole(meal, "ana_yemek");
    const [alt] = suggestReplacements({ days, mealId: meal.mealId, subRecipeId: main.subRecipeId, payload: p });
    const next = replaceSubRecipe(days, meal.mealId, main.subRecipeId, alt!);
    const updated = next.flatMap((d) => d.meals).find((m) => m.mealId === meal.mealId)!;

    expect(updated.subRecipes).toHaveLength(meal.subRecipes.length);
    expect(updated.subRecipes.some((s) => s.subRecipeId === main.subRecipeId)).toBe(false);
    expect(updated.title).toBe(alt!.name);
    // Diğer öğünler aynen kalır.
    const othersBefore = days.flatMap((d) => d.meals).filter((m) => m.mealId !== meal.mealId);
    const othersAfter = next.flatMap((d) => d.meals).filter((m) => m.mealId !== meal.mealId);
    expect(othersAfter).toEqual(othersBefore);
  });
});

describe("buildCatalogPlan — bir daha önerme", () => {
  it("hariç tutulan tarifler hiçbir planda yer almaz", () => {
    const excluded = new Set(["mercimek_corbasi", "karniyarik", "izmir_kofte", "coban_salata", "menemen"]);
    for (let run = 0; run < 20; run++) {
      const days = buildCatalogPlan(payload(), { excludedSlugs: excluded });
      for (const sub of days.flatMap((d) => d.meals).flatMap((m) => m.subRecipes)) {
        expect(excluded.has(findCatalogRecipe(sub)!.slug)).toBe(false);
      }
    }
  });
});
