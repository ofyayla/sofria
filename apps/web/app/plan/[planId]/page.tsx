"use client";

import Link from "next/link";
import { use } from "react";
import { DayTabs } from "../../../components/mode1/dashboard/DayTabs";
import { MealCard } from "../../../components/mode1/dashboard/MealCard";
import { RecipeDetailModal } from "../../../components/mode1/recipe/RecipeDetailModal";
import { Button } from "../../../components/ui/Button";
import { usePlanStore } from "../../../stores/plan.store";
import { useUiStore } from "../../../stores/ui.store";

export default function PlanDashboardPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const plan = usePlanStore((s) => s.currentPlan);
  const activeDayIndex = useUiStore((s) => s.activeDayIndex);
  const setActiveDayIndex = useUiStore((s) => s.setActiveDayIndex);
  const openRecipeModalId = useUiStore((s) => s.openRecipeModalId);
  const openRecipeModal = useUiStore((s) => s.openRecipeModal);
  const closeRecipeModal = useUiStore((s) => s.closeRecipeModal);

  if (!plan || plan.planId !== planId) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-16">
        <h2 className="font-display font-bold text-[20px] text-ink">Bu plan artık burada değil</h2>
        <p className="text-[15px] text-ink-secondary max-w-xs">
          Cihazda yalnızca en son üretilen plan tutulur. Yeni bir plan oluşturabilirsiniz.
        </p>
        <Link href="/plan">
          <Button variant="primary">Yeni plan oluştur</Button>
        </Link>
      </div>
    );
  }

  const activeDay = plan.days[activeDayIndex];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Haftalık planınız</h1>
        <Link href={`/plan/${plan.planId}/market`}>
          <Button variant="secondary">Alışveriş listesi ({plan.shoppingList.itemCount})</Button>
        </Link>
      </div>

      <DayTabs
        dayNames={plan.days.map((d) => d.dayName)}
        activeIndex={activeDayIndex}
        onSelect={setActiveDayIndex}
      />

      {activeDay?.meals.map((meal) => <MealCard key={meal.mealId} meal={meal} onOpenRecipe={openRecipeModal} />)}

      {openRecipeModalId && (
        <RecipeDetailModal plan={plan} openSubRecipeId={openRecipeModalId} onClose={closeRecipeModal} />
      )}
    </div>
  );
}
