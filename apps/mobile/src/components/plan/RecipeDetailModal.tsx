import type { Meal, WeeklyPlanResponse } from "@sofria/shared";
import { RecipeDetailSheet } from "../shared/RecipeDetailSheet";

// Gerçek kullanıcı talebi: bir öğünün İKİ alt yemeği (örn. ana yemek + salata)
// meal.title'ı PAYLAŞIR (bkz. catalogPlanBuilder.ts — meal başlığı ana
// yemeğin adından türetilir). Salatayı açınca üstte hâlâ ana yemeğin adının
// ("Etsiz Musakka") görünmesi kafa karıştırıyordu ("kalmış" gibi algılandı,
// aslında veri doğruydu). Eyebrow artık öğün TÜRÜNÜ ("Akşam") gösteriyor —
// bu her zaman doğru ve tarif adıyla asla çakışmıyor.
const MEAL_TYPE_LABELS: Record<Meal["type"], string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };

export function RecipeDetailModal({
  plan,
  openSubRecipeId,
  onClose,
}: {
  plan: WeeklyPlanResponse;
  openSubRecipeId: string;
  onClose: () => void;
}) {
  const found = plan.days
    .flatMap((day) => day.meals)
    .flatMap((meal) => meal.subRecipes.map((sub) => ({ sub, mealType: meal.type, mealId: meal.mealId, cuisineTag: meal.cuisineTag })))
    .find(({ sub }) => sub.subRecipeId === openSubRecipeId);

  if (!found) return null;

  return (
    <RecipeDetailSheet
      mealTitle={MEAL_TYPE_LABELS[found.mealType]}
      recipeName={found.sub.name}
      servings={found.sub.servings}
      prepMinutes={found.sub.prepMinutes}
      cookMinutes={found.sub.cookMinutes}
      difficulty={found.sub.difficulty}
      ingredients={found.sub.ingredients}
      instructions={found.sub.instructions}
      cuisineTag={found.cuisineTag}
      imageSlug={found.sub.imageSlug}
      source="weekly_plan"
      sourceMealId={found.mealId}
      sourceSubRecipeId={found.sub.subRecipeId}
      recipeSnapshot={{
        servings: found.sub.servings,
        prepMinutes: found.sub.prepMinutes,
        cookMinutes: found.sub.cookMinutes,
        difficulty: found.sub.difficulty,
        ingredients: found.sub.ingredients,
        instructions: found.sub.instructions,
        requiredEquipment: found.sub.requiredEquipment,
        imageSlug: found.sub.imageSlug,
      }}
      onClose={onClose}
    />
  );
}
