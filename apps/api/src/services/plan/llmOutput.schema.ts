import { z } from "zod";
import { dayPlanSchema } from "@sofria/shared";

/**
 * MİMARİ KARAR: LLM'den yalnızca `days` istenir — `shoppingList` ve `summary`
 * İSTENMEZ. Sebep: LLM'in malzeme toplama aritmetiği yapması hataya açık ve
 * gereksiz (biz zaten F2'deki units.converter ile deterministik topluyoruz).
 * Tam WeeklyPlanResponse şeması (SDD §3.3) yalnızca istemciye giden NİHAİ
 * yanıtın sözleşmesidir — LLM'in ürettiği ham çıktının değil.
 */
export const weeklyPlanLlmOutputSchema = z.object({
  days: z.array(dayPlanSchema).length(7),
});
export type WeeklyPlanLlmOutput = z.infer<typeof weeklyPlanLlmOutputSchema>;
