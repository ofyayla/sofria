"use client";

import type { Meal, WeeklyPlanResponse } from "@sofria/shared";
import Image from "next/image";
import { RecipeRatingForm } from "../../shared/RecipeRatingForm";
import { SubRecipeAccordion } from "./SubRecipeAccordion";

// Gerçek kullanıcı talebi: bir öğünün İKİ alt yemeği (örn. ana yemek + salata)
// meal.title'ı PAYLAŞIR (bkz. catalogPlanBuilder.ts — meal başlığı ana
// yemeğin adından türetilir). Salatayı açınca üstte hâlâ ana yemeğin adının
// görünmesi kafa karıştırıyordu. Eyebrow artık öğün TÜRÜNÜ ("Akşam")
// gösteriyor — bu her zaman doğru ve tarif adıyla asla çakışmıyor.
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
    <div className="fixed inset-0 z-50 bg-ink/30 flex justify-end" style={{ animation: "fade-in 200ms ease-out" }} onClick={onClose}>
      <div
        className="w-full sm:max-w-md h-full min-h-0 bg-surface shadow-xl overflow-y-auto p-6 sm:p-8 rounded-l-panel"
        style={{ animation: "slide-in-right 250ms ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gerçek kullanıcı talebi: tarif açılınca malzemeler kısmının
            ÜSTÜNDE gerçek tarif görseli olsun — negatif margin ile panelin
            kenar boşluğunu iptal edip tam genişlikte en üste yaslanıyor. */}
        {found.sub.imageSlug && (
          <div className="relative h-48 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6">
            <Image src={`/dish-images/${found.sub.imageSlug}.jpg`} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[13px] font-medium text-ink-muted mb-1">{MEAL_TYPE_LABELS[found.mealType]}</p>
            <h3 className="font-display font-bold text-[22px] text-ink">{found.sub.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
        <SubRecipeAccordion subRecipe={found.sub} />
        <RecipeRatingForm
          source="weekly_plan"
          sourceMealId={found.mealId}
          sourceSubRecipeId={found.sub.subRecipeId}
          recipeName={found.sub.name}
          cuisineTag={found.cuisineTag}
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
        />
      </div>
    </div>
  );
}
