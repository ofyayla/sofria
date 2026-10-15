import type { DietaryConstraints, EquipmentConstraints, MealComplexity, MealType, DayPlan } from "@sofria/shared";
import { MEAL_COMPLEXITY_SUBRECIPE_COUNT } from "@sofria/shared";
import { mentionsOven } from "../../domain/equipmentCheck.js";
import { findForbiddenKeyword } from "../../domain/forbiddenIngredients.js";
import { resolveIngredient } from "../../domain/ingredients.dictionary.js";

/**
 * SDD §1.2: LLM'in ürettiği ing.slug'a GÜVENİLMEZ — sözlükten (F2) yeniden
 * çözülür. Post-check'in avoided/allergy karşılaştırması, normalizer'ın
 * (F5) ürettiği canonical slug'larla aynı kaynaktan geçmezse yanlış negatif
 * (kaçan bir ihlal) üretebilir. Bu fonksiyon o riski kapatır.
 */
export function canonicalizePlanIngredients(days: DayPlan[]): DayPlan[] {
  return days.map((day) => ({
    ...day,
    meals: day.meals.map((meal) => ({
      ...meal,
      subRecipes: meal.subRecipes.map((sub) => ({
        ...sub,
        ingredients: sub.ingredients.map((ing) => {
          const resolved = resolveIngredient(ing.displayName);
          return { ...ing, slug: resolved.slug, isPantryStaple: resolved.isPantryStaple };
        }),
      })),
    })),
  }));
}

export interface PlanConstraints {
  dietary: DietaryConstraints;
  equipment: EquipmentConstraints;
  mealComplexity: { lunch: MealComplexity; dinner: MealComplexity };
  includedMeals: MealType[];
}

/**
 * SDD §1.2: kaçınılan malzeme / alerji / ekipman / çeşit sayısı denetimi.
 * Mutfak seçimi (cuisineTag) BİLEREK burada denetlenmez — SDD §1.2 notu:
 * bu bir tercihtir, kısıt değildir.
 *
 * @returns İnsan-okunabilir ihlal açıklamaları — boşsa plan temiz demektir.
 */
export function checkPlanViolations(days: DayPlan[], constraints: PlanConstraints): string[] {
  const violations: string[] = [];
  const avoidedSet = new Set(constraints.dietary.avoidedIngredients);
  const allergySet = new Set(constraints.dietary.allergies);
  const equipmentBansOven = constraints.equipment.stovetopOnly || !constraints.equipment.hasOven;
  const includedMealsSet = new Set(constraints.includedMeals);

  for (const day of days) {
    for (const meal of day.meals) {
      if (!includedMealsSet.has(meal.type)) {
        violations.push(
          `${day.dayName} - ${meal.title}: "${meal.type}" öğünü üretilmiş, ancak kullanıcı bu öğün türünü dahil etmemişti (dahil edilenler: ${constraints.includedMeals.join(", ")}).`
        );
      }

      const expectedCount = MEAL_COMPLEXITY_SUBRECIPE_COUNT[meal.complexity];
      if (meal.subRecipes.length !== expectedCount) {
        violations.push(
          `${day.dayName} - ${meal.title}: "${meal.complexity}" için ${expectedCount} alt yemek beklenirken ${meal.subRecipes.length} bulundu.`
        );
      }

      for (const sub of meal.subRecipes) {
        for (const ing of sub.ingredients) {
          const forbiddenKeyword = findForbiddenKeyword(ing.displayName);
          if (forbiddenKeyword) {
            violations.push(
              `${day.dayName} - ${sub.name}: YASAK malzeme kullanılmış (${ing.displayName}, "${forbiddenKeyword}") — domuz eti/ürünü ve alkol kullanıcı tercihinden bağımsız, HİÇBİR ZAMAN kullanılmamalı.`
            );
          } else if (allergySet.has(ing.slug)) {
            violations.push(
              `${day.dayName} - ${sub.name}: ALERJEN malzeme kullanılmış (${ing.displayName}) — kesinlikle bulunmamalıydı.`
            );
          } else if (avoidedSet.has(ing.slug)) {
            violations.push(`${day.dayName} - ${sub.name}: kaçınılması istenen malzeme kullanılmış (${ing.displayName}).`);
          }
        }

        if (equipmentBansOven && mentionsOven(sub.requiredEquipment)) {
          violations.push(`${day.dayName} - ${sub.name}: fırın gerektiriyor, ancak kullanıcının fırını yok/istemiyor.`);
        }
      }
    }
  }

  return violations;
}
