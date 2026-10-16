import { UNIT_LABELS, type SubRecipe, type UserPreferencesPayload, type WeeklyPlanResponse } from "@sofria/shared";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwapSheet } from "../components/plan/SwapSheet";
import { shoppingItemKey } from "../components/ui";
import { findCatalogRecipe, swapSubRecipeInPlan } from "../engine";
import { dislikedSlugSet, useDislikedRecipesStore } from "../stores/dislikedRecipes.store";
import { usePlanStore } from "../stores/plan.store";
import { useRulesProfileStore } from "../stores/rulesProfile.store";
import { useShoppingStore, type OrphanedItem } from "../stores/shopping.store";
import { colors, gutter, radius, shadow, size, space, textStyle, type } from "../theme";

const UNDO_MS = 6000;

interface UndoState {
  prevPlan: WeeklyPlanResponse;
  prevChecks: Record<string, boolean>;
  prevOrphans: OrphanedItem[];
  dislikedSlug?: string;
  message: string;
}

/**
 * Bu özellikten ÖNCE üretilmiş planlar tercihleri saklamıyor — alternatifler
 * için Kurallarım'daki güncel diyet/ekipman ve plandaki porsiyon kullanılır.
 * Sihirbazda yalnızca o plan için açılan fırın Kurallarım'da görünmez; plan
 * zaten fırınlı yemek içeriyorsa fırın var sayılır (yoksa fırınlı
 * alternatiflerin hepsi gereksiz yere elenir).
 */
function fallbackPayload(plan: WeeklyPlanResponse, rules: ReturnType<typeof useRulesProfileStore.getState>): UserPreferencesPayload {
  const anySub = plan.days[0]?.meals[0]?.subRecipes[0];
  const meals = new Set(plan.days.flatMap((d) => d.meals.map((m) => m.type)));
  const planUsesOven = plan.days
    .flatMap((d) => d.meals)
    .flatMap((m) => m.subRecipes)
    .some((s) => s.requiredEquipment.some((e) => /fırın|firin/i.test(e)));
  return {
    schemaVersion: 1,
    householdSize: anySub?.servings ?? 2,
    cookingSkill: "orta",
    maxPrepMinutes: 60,
    dietary: rules.dietary,
    equipment: planUsesOven ? { ...rules.equipment, hasOven: true, stovetopOnly: false } : rules.equipment,
    mealComplexity: { lunch: "iki_cesit", dinner: "iki_cesit" },
    includedMeals: [...meals],
    cuisinePreferences: [...new Set(plan.days.flatMap((d) => d.meals.map((m) => m.cuisineTag)))],
    daysCount: 7,
  };
}

/**
 * Planda yemek değiştirme akışı: "Bunun yerine…" paneli, plana uygulama,
 * market listesinin senkronu ve "Geri al" bildirimi. Ekranlar yalnızca
 * `requestSwap` çağırır ve `element`'i render eder.
 */
export function usePlanSwap(options: { bottomOffset?: number } = {}): {
  requestSwap: (mealId: string, subRecipeId: string, delayMs?: number) => void;
  element: ReactNode;
} {
  const insets = useSafeAreaInsets();
  const plan = usePlanStore((s) => s.currentPlan);
  const storedPayload = usePlanStore((s) => s.currentPayload);
  const updatePlan = usePlanStore((s) => s.updatePlan);
  const disliked = useDislikedRecipesStore((s) => s.items);
  const addDisliked = useDislikedRecipesStore((s) => s.add);
  const removeDisliked = useDislikedRecipesStore((s) => s.remove);

  const [target, setTarget] = useState<{ mealId: string; subRecipeId: string } | null>(null);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!undo) return;
    timer.current = setTimeout(() => setUndo(null), UNDO_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [undo]);

  function requestSwap(mealId: string, subRecipeId: string, delayMs = 0) {
    // Tarif detayı (Modal) kapanırken ikinci bir Modal açmak iOS'ta yutuluyor —
    // çağıran taraf kapanma animasyonu kadar bekletebilir.
    if (delayMs > 0) setTimeout(() => setTarget({ mealId, subRecipeId }), delayMs);
    else setTarget({ mealId, subRecipeId });
  }

  const payload = plan ? (storedPayload ?? fallbackPayload(plan, useRulesProfileStore.getState())) : null;

  function apply(replacement: SubRecipe, dislikeCurrent: boolean) {
    if (!plan || !payload || !target) return;
    const meal = plan.days.flatMap((d) => d.meals).find((m) => m.mealId === target.mealId);
    const current = meal?.subRecipes.find((s) => s.subRecipeId === target.subRecipeId);
    if (!current) return;

    const shopping = useShoppingStore.getState();
    const prevChecks = { ...(shopping.checkedByPlan[plan.planId] ?? {}) };
    const prevOrphans = [...(shopping.orphansByPlan[plan.planId] ?? [])];

    const next = swapSubRecipeInPlan(plan, payload, target.mealId, target.subRecipeId, replacement);
    updatePlan(next);
    shopping.syncOrphans(plan.planId, plan.shoppingList, next.shoppingList, shoppingItemKey, (i) => `${i.totalAmount} ${UNIT_LABELS[i.unit]}`);

    let dislikedSlug: string | undefined;
    if (dislikeCurrent) {
      const slug = findCatalogRecipe(current)?.slug;
      if (slug && !disliked.some((d) => d.slug === slug)) {
        addDisliked(slug, current.name);
        dislikedSlug = slug;
      }
    }

    setTarget(null);
    setUndo({
      prevPlan: plan,
      prevChecks,
      prevOrphans,
      ...(dislikedSlug ? { dislikedSlug } : {}),
      message: `${current.name} yerine ${replacement.name}`,
    });
  }

  function revert() {
    if (!undo) return;
    updatePlan(undo.prevPlan);
    useShoppingStore.getState().restore(undo.prevPlan.planId, undo.prevChecks, undo.prevOrphans);
    if (undo.dislikedSlug) removeDisliked(undo.dislikedSlug);
    setUndo(null);
  }

  const toastBottom = options.bottomOffset ?? (insets.bottom > 0 ? insets.bottom : space.xl) + size.tabBar + space.md;

  const element = (
    <>
      {target && plan && payload && (
        <SwapSheet
          plan={plan}
          payload={payload}
          mealId={target.mealId}
          subRecipeId={target.subRecipeId}
          dislikedSlugs={dislikedSlugSet(disliked)}
          onPick={apply}
          onClose={() => setTarget(null)}
        />
      )}
      {undo && (
        <View style={[styles.toastWrap, { bottom: toastBottom }]} pointerEvents="box-none">
          <View style={[styles.toast, shadow.floating]} accessibilityLiveRegion="polite">
            <Text style={styles.toastText} numberOfLines={2}>
              {undo.message}
            </Text>
            <Pressable onPress={revert} accessibilityRole="button" accessibilityLabel="Değişikliği geri al" hitSlop={8} style={styles.undoButton}>
              <Text style={styles.undoText}>Geri al</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  return { requestSwap, element };
}

const styles = StyleSheet.create({
  toastWrap: { position: "absolute", left: gutter, right: gutter },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 56,
    paddingLeft: space.xl - 4,
    paddingRight: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.nightRaised,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  toastText: { ...textStyle(type.helper), color: colors.onNight, flex: 1 },
  undoButton: { height: 40, paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: colors.accent, justifyContent: "center" },
  undoText: { ...textStyle(type.button), fontSize: 14, color: colors.onAccent },
});
