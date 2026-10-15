import { usePlanStore } from "../stores/plan.store";
import { useShoppingStore } from "../stores/shopping.store";

export interface ShoppingProgress {
  checked: number;
  total: number;
  percent: number;
}

/** SDD §4.4 ProgressBar bileşeninin veri kaynağı — plan.store + shopping.store'dan türetilir. */
export function useShoppingProgress(): ShoppingProgress {
  const plan = usePlanStore((s) => s.currentPlan);
  const checkedByPlan = useShoppingStore((s) => s.checkedByPlan);

  if (!plan) return { checked: 0, total: 0, percent: 0 };

  const planChecks = checkedByPlan[plan.planId] ?? {};
  const total = plan.shoppingList.itemCount;
  const checked = Object.values(planChecks).filter(Boolean).length;

  return { checked, total, percent: total === 0 ? 0 : Math.round((checked / total) * 100) };
}
