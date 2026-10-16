import { useMutation } from "@tanstack/react-query";
import type { UserPreferencesPayload } from "@sofria/shared";
import { generatePlan } from "../lib/apiClient";

export function useGeneratePlan() {
  return useMutation({
    mutationFn: ({ payload, excludedSlugs }: { payload: UserPreferencesPayload; excludedSlugs?: ReadonlySet<string> }) =>
      generatePlan(payload, excludedSlugs ? { excludedSlugs } : {}),
    // Kullanıcıya her zaman jenerik bir mesaj gösteriliyor (bkz. plan.tsx),
    // teknik detay yalnızca burada, geliştirici konsolunda kalır.
    onError: (error) => console.error("Plan oluşturma hatası:", error),
  });
}
