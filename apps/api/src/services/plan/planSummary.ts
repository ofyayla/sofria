import type { DayPlan, PlanSummary, UserPreferencesPayload } from "@sofria/shared";

export function buildPlanSummary(days: DayPlan[], payload: UserPreferencesPayload): PlanSummary {
  const distinctSlugs = new Set<string>();
  let totalMeals = 0;

  for (const day of days) {
    for (const meal of day.meals) {
      totalMeals++;
      for (const sub of meal.subRecipes) {
        for (const ing of sub.ingredients) distinctSlugs.add(ing.slug);
      }
    }
  }

  const constraintsApplied: string[] = [];
  if (payload.dietary.glutenFree) constraintsApplied.push("Glutensiz");
  if (payload.dietary.lactoseFree) constraintsApplied.push("Laktozsuz");
  if (payload.dietary.vegetarian) constraintsApplied.push("Vejetaryen");
  if (payload.dietary.vegan) constraintsApplied.push("Vegan");
  if (payload.equipment.stovetopOnly) constraintsApplied.push("Sadece ocak");
  if (payload.dietary.avoidedIngredients.length > 0) {
    constraintsApplied.push(`${payload.dietary.avoidedIngredients.join(", ")} hariç`);
  }

  return {
    totalMeals,
    distinctIngredients: distinctSlugs.size,
    constraintsApplied,
    // Bütçe aşımı gibi uyarılar F5 kapsamında hesaplanmıyor — gelecek bir iyileştirme.
    warnings: [],
  };
}
