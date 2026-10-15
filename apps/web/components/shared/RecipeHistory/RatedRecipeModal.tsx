"use client";

import type { RecipeRating } from "@sofria/shared";
import Image from "next/image";
import { SubRecipeAccordion } from "../../mode1/recipe/SubRecipeAccordion";
import { RecipeRatingForm } from "../RecipeRatingForm";

/**
 * Gerçek kullanıcı talebi: Tariflerim'de bir tarife tıklayınca açılmıyordu —
 * kart hiç tıklanabilir değildi ve puanlama kaydı zaten yalnızca ad/yıldız
 * tutuyordu. `recipeSnapshot` olan (bu düzeltmeden SONRA kaydedilmiş)
 * puanlamalar için tam tarif detayını gösterir, olmayanlar (eski kayıtlar)
 * için nazik bir bilgi mesajı gösterir.
 */
export function RatedRecipeModal({ rating, onClose }: { rating: RecipeRating; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/30 flex justify-end" style={{ animation: "fade-in 200ms ease-out" }} onClick={onClose}>
      <div
        className="w-full sm:max-w-md h-full min-h-0 bg-surface shadow-xl overflow-y-auto p-6 sm:p-8 rounded-l-panel"
        style={{ animation: "slide-in-right 250ms ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {rating.recipeSnapshot?.imageSlug && (
          <div className="relative h-48 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6">
            <Image src={`/dish-images/${rating.recipeSnapshot.imageSlug}.jpg`} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="flex items-start justify-between mb-6">
          <h3 className="font-display font-bold text-[22px] text-ink">{rating.recipeName}</h3>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {rating.recipeSnapshot ? (
          <>
            <SubRecipeAccordion subRecipe={rating.recipeSnapshot} />
            <RecipeRatingForm
              source={rating.source}
              sourceMealId={rating.sourceMealId}
              {...(rating.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: rating.sourceSubRecipeId } : {})}
              recipeName={rating.recipeName}
              cuisineTag={rating.cuisineTag}
            />
          </>
        ) : (
          <p className="text-[14px] text-ink-secondary leading-relaxed">
            Bu tarifin detayları bu cihaza kaydedilmemiş (eski bir puanlama). Yalnızca puanlama bilgisi saklı.
          </p>
        )}
      </div>
    </div>
  );
}
