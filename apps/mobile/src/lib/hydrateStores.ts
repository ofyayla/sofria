import { weeklyPlanResponseSchema } from "@sofria/shared";
import { useEffect } from "react";
import { usePlanStore } from "../stores/plan.store";
import { usePreferencesStore } from "../stores/preferences.store";
import { useRatingsStore } from "../stores/ratings.store";
import { useRulesProfileStore } from "../stores/rulesProfile.store";
import { useShoppingStore } from "../stores/shopping.store";

/**
 * Web'deki hydrateStores.ts ile aynı desen (SDD §4.3). RN'de sunucu tarafı
 * render yok ama AsyncStorage okuması ASENKRON olduğu için aynı ilke geçerli:
 * store'lar `skipHydration` ile başlar, gerçek veri yalnızca mount SONRASI,
 * bu hook ile yüklenir.
 */
export function useHydrateStores(): void {
  useEffect(() => {
    void useRulesProfileStore.persist.rehydrate();
    void usePreferencesStore.persist.rehydrate();
    // Gerçek kullanıcı testinde bulundu: `weeklyPlanResponseSchema`'ya yeni
    // bir zorunlu alan (date) eklendiğinde, cihazda bu değişiklikten ÖNCE
    // kaydedilmiş bir plan hâlâ AsyncStorage'da duruyorsa TypeScript'i
    // atlatıp runtime'da crash yaratıyordu ("split of undefined"). Rehydrate
    // sonrası planı kendi şemasına karşı doğrula, uymuyorsa temizle — kullanıcı
    // "Bu plan artık burada değil" boş durumunu görür, çökme yaşamaz.
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
