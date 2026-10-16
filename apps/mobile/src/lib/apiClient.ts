import type { ApiResponse, UserPreferencesPayload, WeeklyPlanResponse } from "@sofria/shared";
import { generatePlanOnDevice } from "../engine";

/**
 * Plan üretimi tamamen cihazda yapılır (src/engine) — ağ/backend gerekmez.
 * Çağıran taraf (useGeneratePlan) hâlâ Promise<ApiResponse> bekliyor; imza korunuyor.
 */
export async function generatePlan(
  payload: UserPreferencesPayload,
  options: { excludedSlugs?: ReadonlySet<string> } = {}
): Promise<ApiResponse<WeeklyPlanResponse>> {
  // Sihirbazın "hazırlanıyor" animasyonu için UI thread'ine nefes aldır.
  await new Promise((resolve) => setTimeout(resolve, 600));
  const { data, meta } = generatePlanOnDevice(payload, options);
  return { ok: true, data, meta };
}
