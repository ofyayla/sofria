"use client";

import { useState } from "react";
import type { CuisineType, RatedRecipeSnapshot } from "@sofria/shared";
import { useRatingsStore } from "../../stores/ratings.store";
import { RatingStars } from "./RatingStars";

export interface RecipeRatingFormProps {
  source: "weekly_plan" | "quick_meal";
  sourceMealId: string;
  sourceSubRecipeId?: string;
  recipeName: string;
  cuisineTag: CuisineType;
  /** Tarifin tamamı — Tariflerim'den kaynak plan gitse bile tekrar açılabilsin diye kayda gömülür. */
  recipeSnapshot?: RatedRecipeSnapshot;
}

/**
 * PRD §5.2 "Tariflerim": kullanıcı bir yemeği denedikten sonra tarif
 * detayında puanlar. Bu bileşen üç hâli yönetir: henüz denenmemiş
 * ("Denedim" butonu) → puanlama formu açık → zaten puanlanmış (salt-okunur).
 */
export function RecipeRatingForm(props: RecipeRatingFormProps) {
  const ratings = useRatingsStore((s) => s.ratings);
  const addRating = useRatingsStore((s) => s.addRating);
  const existing = ratings.find(
    (r) => r.sourceMealId === props.sourceMealId && r.sourceSubRecipeId === props.sourceSubRecipeId
  );

  const [expanded, setExpanded] = useState(false);
  const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");

  if (existing) {
    return (
      <div className="mt-6 pt-6 border-t border-divider">
        <p className="text-[13px] font-medium text-ink-secondary mb-2">Denediniz</p>
        <RatingStars value={existing.rating} size="sm" />
        {existing.comment && <p className="text-[14px] text-ink-secondary mt-2 italic">&ldquo;{existing.comment}&rdquo;</p>}
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="mt-6 pt-6 border-t border-divider">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full h-12 rounded-button bg-surface-muted text-[15px] font-medium text-ink-secondary"
        >
          Denedim
        </button>
      </div>
    );
  }

  function handleSubmit() {
    addRating({
      ratingId: crypto.randomUUID(),
      source: props.source,
      sourceMealId: props.sourceMealId,
      ...(props.sourceSubRecipeId !== undefined ? { sourceSubRecipeId: props.sourceSubRecipeId } : {}),
      recipeName: props.recipeName,
      cuisineTag: props.cuisineTag,
      rating: stars,
      ...(comment.trim().length > 0 ? { comment: comment.trim() } : {}),
      ratedAt: new Date().toISOString(),
      ...(props.recipeSnapshot !== undefined ? { recipeSnapshot: props.recipeSnapshot } : {}),
    });
    setExpanded(false);
  }

  return (
    <div className="mt-6 pt-6 border-t border-divider flex flex-col gap-3">
      <p className="text-[13px] font-medium text-ink-secondary">Bu tarifi nasıl buldunuz?</p>
      <RatingStars value={stars} onChange={setStars} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Yorumunuz (opsiyonel)"
        rows={2}
        className="w-full px-4 py-3 rounded-input bg-surface-muted text-[14px] outline-none placeholder:text-ink-muted resize-none focus:bg-surface transition-colors"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="h-11 rounded-button bg-accent hover:bg-accent-hover text-on-accent text-[15px] font-semibold"
      >
        Kaydet
      </button>
    </div>
  );
}
