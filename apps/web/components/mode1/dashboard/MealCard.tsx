import type { Meal } from "@sofria/shared";
import Image from "next/image";
import { Card } from "../../ui/Card";

const MEAL_TYPE_LABELS: Record<Meal["type"], string> = { kahvalti: "Kahvaltı", ogle: "Öğle", aksam: "Akşam" };
const CUISINE_LABELS: Record<Meal["cuisineTag"], string> = {
  kirmizi_et: "Kırmızı Et",
  beyaz_et: "Beyaz Et (Tavuk ve Hindi)",
  balik_urunleri: "Balık Ürünleri",
  sebze_yemekleri: "Sebze Yemekleri",
  ortadogu_mutfagi: "Ortadoğu Mutfağı",
  italyan_mutfagi: "İtalyan Mutfağı",
};

export function MealCard({ meal, onOpenRecipe }: { meal: Meal; onOpenRecipe: (subRecipeId: string) => void }) {
  return (
    <Card className="flex flex-col gap-3 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-muted">{MEAL_TYPE_LABELS[meal.type]}</span>
        <span className="text-[13px] tabular-nums text-ink-muted">{meal.totalPrepMinutes} dk</span>
      </div>

      <h3 className="font-display font-bold text-[20px] text-ink">{meal.title}</h3>

      {meal.type !== "kahvalti" && (
        <span className="inline-flex w-fit px-3 py-1 rounded-chip text-[13px] font-medium bg-brand-soft text-brand">
          {CUISINE_LABELS[meal.cuisineTag]}
        </span>
      )}

      <div className="flex flex-col gap-2 mt-1">
        {meal.subRecipes.map((sub) => (
          <button
            key={sub.subRecipeId}
            onClick={() => onOpenRecipe(sub.subRecipeId)}
            className="flex items-center gap-3 px-[14px] py-2.5 rounded-chip bg-surface-muted text-left transition-all duration-100"
          >
            {sub.imageSlug && (
              <Image
                src={`/dish-images/${sub.imageSlug}.jpg`}
                alt=""
                width={48}
                height={48}
                className="rounded-card object-cover shrink-0"
              />
            )}
            <span className="flex-1">
              <span className="block text-[15px] font-medium text-ink-secondary">{sub.name}</span>
              {sub.estimatedKcalPerServing && (
                <span className="block text-[12px] text-ink-muted mt-0.5">~{sub.estimatedKcalPerServing} kcal (1 porsiyon)</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
