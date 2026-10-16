import type { WeeklyPlanResponse } from "@sofria/shared";
import { dishIcon } from "../../lib/dishIcon";
import { MEAL_TYPE_LABELS, ROLE_LABELS } from "../../lib/planDisplay";
import { RecipeDetailSheet } from "../shared/RecipeDetailSheet";

// Gerçek kullanıcı talebi: bir öğünün İKİ alt yemeği (örn. ana yemek + salata)
// meal.title'ı PAYLAŞIR (bkz. catalogPlanBuilder.ts — meal başlığı ana
// yemeğin adından türetilir). Salatayı açınca üstte hâlâ ana yemeğin adının
// ("Etsiz Musakka") görünmesi kafa karıştırıyordu ("kalmış" gibi algılandı,
// aslında veri doğruydu). Eyebrow artık öğün TÜRÜNÜ ve yemeğin rolünü
// ("Akşam · Salata") gösteriyor — her zaman doğru, tarif adıyla asla çakışmıyor.

export function RecipeDetailModal({
  plan,
  openSubRecipeId,
  onClose,
  onSwap,
}: {
  plan: WeeklyPlanResponse;
  openSubRecipeId: string;
  onClose: () => void;
  /** Verilirse tarif detayında "Değiştir" çıkar; argümanlar öğün ve yemek kimliği. */
  onSwap?: (mealId: string, subRecipeId: string) => void;
}) {
  const found = plan.days
    .flatMap((day) => day.meals)
    .flatMap((meal) => meal.subRecipes.map((sub) => ({ sub, mealType: meal.type, mealId: meal.mealId, cuisineTag: meal.cuisineTag })))
    .find(({ sub }) => sub.subRecipeId === openSubRecipeId);

  if (!found) return null;

  return (
    <RecipeDetailSheet
      mealTitle={`${MEAL_TYPE_LABELS[found.mealType]} · ${ROLE_LABELS[found.sub.role]}`}
      recipeName={found.sub.name}
      servings={found.sub.servings}
      prepMinutes={found.sub.prepMinutes}
      cookMinutes={found.sub.cookMinutes}
      difficulty={found.sub.difficulty}
      ingredients={found.sub.ingredients}
      instructions={found.sub.instructions}
      cuisineTag={found.cuisineTag}
      imageSlug={found.sub.imageSlug}
      fallbackIcon={dishIcon(found.sub.role, found.mealType)}
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
      {...(onSwap ? { onSwap: () => onSwap(found.mealId, found.sub.subRecipeId) } : {})}
    />
  );
}
