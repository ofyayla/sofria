import { weeklyPlanResponseSchema } from "@sofria/shared";
import { useEffect } from "react";
import { usePlanStore } from "../stores/plan.store";
import { usePreferencesStore } from "../stores/preferences.store";
import { useRatingsStore } from "../stores/ratings.store";
import { useRulesProfileStore } from "../stores/rulesProfile.store";
import { useShoppingStore } from "../stores/shopping.store";

/**
 * SDD §4.3: "Store'lar `skipHydration` ile yüklenir; hydration mismatch
 * önlenir." Sunucu tarafında render edilen HTML ile istemcinin ilk
 * render'ı aynı (boş/varsayılan) durumu göstermeli; LocalStorage'daki
 * gerçek veri yalnızca mount SONRASI, bu hook ile yüklenir.
 */
export function useHydrateStores(): void {
  useEffect(() => {
    void useRulesProfileStore.persist.rehydrate();
    void usePreferencesStore.persist.rehydrate();
    // Gerçek kullanıcı testinde bulundu (mobil taraf): `weeklyPlanResponseSchema`'ya
    // yeni bir zorunlu alan (date) eklendiğinde, bu değişiklikten ÖNCE
    // kaydedilmiş bir plan hâlâ localStorage'da duruyorsa runtime'da crash
    // yaratabiliyordu. Rehydrate sonrası planı kendi şemasına karşı doğrula,
    // uymuyorsa temizle.
    void Promise.resolve(usePlanStore.persist.rehydrate()).then(() => {
      const plan = usePlanStore.getState().currentPlan;
      if (plan && !weeklyPlanResponseSchema.safeParse(plan).success) {
        usePlanStore.getState().clearPlan();
      }
    });
    void useShoppingStore.persist.rehydrate();
    void useRatingsStore.persist.rehydrate();
  }, []);
}
