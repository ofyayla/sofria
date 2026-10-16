import { describe, expect, it } from "vitest";
import { CUISINE_TYPES, MEAL_COMPLEXITY_SUBRECIPE_COUNT, type MealComplexity, type UserPreferencesPayload } from "@sofria/shared";
import { aisleForIngredient } from "../../src/domain/aisles.map.js";
import { RECIPE_CATALOG } from "../../src/domain/recipeCatalog.js";
import { buildCatalogPlan } from "../../src/services/plan/catalogPlanBuilder.js";

const CUISINES_BY_NAME = new Map(RECIPE_CATALOG.map((r) => [r.name, r.cuisineTags]));

/**
 * Gerçek kullanıcı testinde bulundu: akşam "Tam menü" (3 çeşit) seçilince
 * bazı günler 2 çeşit geliyordu — o mutfakta uygun yan lezzet/çorba
 * bulunamayan rol sessizce atlanıyordu. Seçilen çeşit sayısı, kısıtlar
 * buna izin verdiği sürece HER öğünde tutulmalı.
 */
function payload(cuisine: (typeof CUISINE_TYPES)[number], dinner: MealComplexity, lunch: MealComplexity): UserPreferencesPayload {
  return {
    schemaVersion: 1,
    householdSize: 2,
    cookingSkill: "orta",
    maxPrepMinutes: 60,
    dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
    equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: false },
    mealComplexity: { lunch, dinner },
    includedMeals: ["ogle", "aksam"],
    cuisinePreferences: [cuisine],
    daysCount: 7,
  };
}

describe("buildCatalogPlan — seçilen çeşit sayısı", () => {
  for (const cuisine of CUISINE_TYPES) {
    for (const complexity of ["tam_menu", "iki_cesit"] as const) {
      it(`${cuisine}: her öğün ${complexity} (${MEAL_COMPLEXITY_SUBRECIPE_COUNT[complexity]} çeşit)`, () => {
        // Seçim rastgele — tek bir şanslı çalıştırma hatayı gizlemesin.
        for (let run = 0; run < 25; run++) {
          const days = buildCatalogPlan(payload(cuisine, complexity, complexity));
          for (const day of days) {
            for (const meal of day.meals) {
              expect(meal.subRecipes, `${day.dayIndex}. gün ${meal.type}`).toHaveLength(MEAL_COMPLEXITY_SUBRECIPE_COUNT[complexity]);
              expect(meal.complexity).toBe(complexity);
              const names = meal.subRecipes.map((s) => s.name);
              expect(new Set(names).size).toBe(names.length);
              // Kısıtsız (varsayılan) payload'da her çeşit SEÇİLEN mutfaktan
              // gelmeli — başka mutfaktan ödünç alma yalnızca son çare.
              for (const name of names) {
                expect(CUISINES_BY_NAME.get(name), `${cuisine} öğününde ${name}`).toContain(cuisine);
              }
            }
          }
        }
      });
    }
  }
});

describe("katalog", () => {
  it("her mutfakta her yan rol için en az 2 tarif var (tekrar aralığı tutabilsin)", () => {
    for (const cuisine of CUISINE_TYPES) {
      for (const role of ["corba", "yan_lezzet", "salata"] as const) {
        const count = RECIPE_CATALOG.filter(
          (r) => !r.isBreakfast && r.role === role && r.cuisineTags.includes(cuisine) && r.prepMinutes + r.cookMinutes <= 60
        ).length;
        expect(count, `${cuisine} / ${role}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("her malzemenin bir market reyonu var (\"Diğer\"e düşmez)", () => {
    const unmapped = new Set<string>();
    for (const r of RECIPE_CATALOG) {
      for (const ing of r.ingredients) {
        if (aisleForIngredient(ing.slug, ing.displayName, "diger") === "diger") unmapped.add(`${r.slug}:${ing.slug}`);
      }
    }
    expect([...unmapped]).toEqual([]);
  });
});
