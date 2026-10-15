import type { CuisineType, RecipeRating } from "@sofria/shared";
import { Card } from "../../ui/Card";
import { RatingStars } from "../RatingStars";

const CUISINE_LABELS: Record<CuisineType, string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

export function RatedRecipeCard({ rating, onOpen }: { rating: RecipeRating; onOpen: () => void }) {
  const date = new Date(rating.ratedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Card className="flex flex-col gap-2.5 mb-3 cursor-pointer" onClick={onOpen}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-bold text-[17px] text-ink">{rating.recipeName}</h3>
        <RatingStars value={rating.rating} size="sm" />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex px-3 py-1 rounded-chip text-[12px] font-medium bg-brand-soft text-brand">
          {CUISINE_LABELS[rating.cuisineTag]}
        </span>
        <span className="text-[13px] text-ink-muted">{date}</span>
      </div>
      {rating.comment && <p className="text-[14px] text-ink-secondary italic">&ldquo;{rating.comment}&rdquo;</p>}
    </Card>
  );
}
