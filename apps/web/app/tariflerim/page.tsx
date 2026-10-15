"use client";

import { useState } from "react";
import type { CuisineType } from "@sofria/shared";
import { CuisineFilterTabs } from "../../components/shared/RecipeHistory/CuisineFilterTabs";
import { RatedRecipeCard } from "../../components/shared/RecipeHistory/RatedRecipeCard";
import { RatedRecipeModal } from "../../components/shared/RecipeHistory/RatedRecipeModal";
import { useRatingsStore } from "../../stores/ratings.store";

export default function TariflerimPage() {
  const ratings = useRatingsStore((s) => s.ratings);
  const [activeCuisine, setActiveCuisine] = useState<CuisineType | "hepsi">("hepsi");
  const [openRatingId, setOpenRatingId] = useState<string | null>(null);
  const openRating = ratings.find((r) => r.ratingId === openRatingId) ?? null;

  const presentCuisines = new Set(ratings.map((r) => r.cuisineTag));
  const visible = activeCuisine === "hepsi" ? ratings : ratings.filter((r) => r.cuisineTag === activeCuisine);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Tariflerim</h1>
        <p className="text-[15px] text-ink-secondary mt-1.5">Denediğiniz ve puanladığınız tarifler burada birikir.</p>
      </div>

      {ratings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 text-center py-16">
          <p className="text-[16px] font-medium text-ink">Henüz tarif kaydetmedin</p>
          <p className="text-[14px] text-ink-muted max-w-xs">
            Bir tarifi denedikten sonra "Denedim" ile puanlayın, burada birikmeye başlasın.
          </p>
        </div>
      ) : (
        <>
          <CuisineFilterTabs active={activeCuisine} onSelect={setActiveCuisine} presentCuisines={presentCuisines} />
          {visible.map((rating) => (
            <RatedRecipeCard key={rating.ratingId} rating={rating} onOpen={() => setOpenRatingId(rating.ratingId)} />
          ))}
        </>
      )}

      {openRating && <RatedRecipeModal rating={openRating} onClose={() => setOpenRatingId(null)} />}
    </div>
  );
}
