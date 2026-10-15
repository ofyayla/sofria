import {
  PROMPT_VERSION,
  SCHEMA_VERSION,
  weeklyPlanResponseSchema,
  type ApiMeta,
  type DayPlan,
  type UserPreferencesPayload,
  type WeeklyPlanResponse,
} from "@sofria/shared";
import { computePlanWeek } from "./domain/weekDates";
import { buildCatalogPlan } from "./plan/catalogPlanBuilder";
import { normalizePreferences } from "./plan/normalizer";
import { buildPlanSummary } from "./plan/planSummary";
import { buildShoppingList } from "./plan/shoppingList.builder";
import { randomUUID } from "./utils/uuid";

export { suggestIngredients } from "./domain/ingredientSuggest";

function withPlanDates(days: DayPlan[]): WeeklyPlanResponse["days"] {
  const week = computePlanWeek(days.length);
  const byIndex = new Map(week.map((w) => [w.dayIndex, w]));
  return days.map((day) => {
    const w = byIndex.get(day.dayIndex);
    return w ? { ...day, date: w.date, dayName: w.dayName } : { ...day, date: "" };
  });
}

/** Planı cihaz üzerinde, backend olmadan üretir (apps/api'deki PlanService ile aynı deterministik mantık). */
export function generatePlanOnDevice(payload: UserPreferencesPayload): { data: WeeklyPlanResponse; meta: ApiMeta } {
  const start = Date.now();
  const canonical = normalizePreferences(payload);
  const days = buildCatalogPlan(canonical);
  const plan: WeeklyPlanResponse = {
    planId: randomUUID(),
    days: withPlanDates(days),
    shoppingList: buildShoppingList(days),
    summary: buildPlanSummary(days, canonical),
  };
  const data = weeklyPlanResponseSchema.parse(plan);
  return {
    data,
    meta: {
      requestId: randomUUID(),
      source: "ai",
      latencyMs: Date.now() - start,
      cacheKey: "on-device",
      schemaVersion: SCHEMA_VERSION,
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date().toISOString(),
    },
  };
}
