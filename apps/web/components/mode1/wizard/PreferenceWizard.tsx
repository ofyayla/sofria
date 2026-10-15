"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserPreferencesPayload } from "@sofria/shared";
import { useGeneratePlan } from "../../../hooks/useGeneratePlan";
import { mergeDietary, mergeEquipment } from "../../../lib/mergeConstraints";
import { usePlanStore } from "../../../stores/plan.store";
import { usePreferencesStore } from "../../../stores/preferences.store";
import { useRulesProfileStore } from "../../../stores/rulesProfile.store";
import { Button } from "../../ui/Button";
import { ComplexityStep } from "./ComplexityStep";
import { CuisineStep } from "./CuisineStep";
import { DietaryOverrideStep } from "./DietaryOverrideStep";
import { EquipmentOverrideStep } from "./EquipmentOverrideStep";
import { HouseholdBudgetStep } from "./HouseholdBudgetStep";
import { MealSelectionStep } from "./MealSelectionStep";
import { StepIndicator } from "./StepIndicator";
import { SummaryStep } from "./SummaryStep";

// Gerçek kullanıcı talebi: "hangi öğünler dahil olsun?" kendi bağımsız
// sayfası — hane seçiminden hemen sonra, 2. adım.
const STEP_LABELS = ["Hane", "Öğünler", "Mutfak", "Diyet", "Ekipman", "Çeşit", "Özet"];
const TOTAL_STEPS = STEP_LABELS.length;

/**
 * Gerçek kullanıcı talebi: pişirme becerisi ve öğün başına hazırlık süresi
 * artık kullanıcıya SORULMUYOR. Beceri her zaman "orta" kabul edilir; süre
 * genelde ~1 saatte hazırlanabilecek tarifleri hedefler (bkz.
 * catalogPlanBuilder.ts filterByTime — prepMinutes+cookMinutes ≤ 60).
 */
const FIXED_COOKING_SKILL = "orta" as const;
const FIXED_MAX_PREP_MINUTES = 60;

export function PreferenceWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const prefs = usePreferencesStore();
  const rulesProfile = useRulesProfileStore();
  const setPlan = usePlanStore((s) => s.setPlan);
  const generatePlan = useGeneratePlan();

  const effectiveDietary = mergeDietary(rulesProfile.dietary, prefs.sessionDietaryOverrides);
  const effectiveEquipment = mergeEquipment(rulesProfile.equipment, prefs.sessionEquipmentOverrides);

  /**
   * Gerçek kullanıcı testinde bulundu: hiçbir alanın varsayılan bir seçimi
   * olmamalı ve kullanıcı zorunlu alanları doldurmadan "İleri"ye basarsa
   * SESSİZCE engellemek yerine HANGİ alan(lar)ın eksik olduğunu söylemeli.
   */
  function missingFieldsForStep(currentStep: number): string[] {
    const missing: string[] = [];
    if (currentStep === 1) {
      // Not: LocalStorage'dan JSON round-trip sonrası doldurulmamış yaş
      // slotları `undefined` değil `null` olarak geri gelir — ikisini de yakala.
      if (prefs.childAges.slice(0, prefs.householdChildren).some((age) => age == null)) {
        missing.push("Çocukların yaşları");
      }
    }
    if (currentStep === 2 && prefs.includedMeals.length === 0) {
      missing.push("En az bir öğün");
    }
    if (currentStep === 3 && prefs.cuisinePreferences.length === 0) {
      missing.push("En az bir mutfak");
    }
    if (currentStep === 5) {
      const hasAnyEquipment =
        effectiveEquipment.hasOven ||
        effectiveEquipment.hasAirFryer ||
        effectiveEquipment.hasPressureCooker ||
        effectiveEquipment.hasBlender ||
        effectiveEquipment.stovetopOnly;
      if (!hasAnyEquipment) missing.push("En az bir mutfak ekipmanı");
    }
    if (currentStep === 6) {
      if (prefs.includedMeals.includes("ogle") && !prefs.mealComplexity.lunch) missing.push("Öğle yemeği çeşidi");
      if (prefs.includedMeals.includes("aksam") && !prefs.mealComplexity.dinner) missing.push("Akşam yemeği çeşidi");
    }
    return missing;
  }

  function goNext() {
    const missing = missingFieldsForStep(step);
    if (missing.length > 0) {
      setValidationError(`Lütfen şunu seçin: ${missing.join(", ")}`);
      return;
    }
    setValidationError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setValidationError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleGenerate() {
    // SDD §1.2: effectiveConstraints = merge(rulesProfile, sessionOverrides) — sunucuya giden HER ZAMAN bu.
    const payload: UserPreferencesPayload = {
      schemaVersion: 1,
      householdSize: prefs.householdAdults + prefs.householdChildren,
      householdAges: prefs.childAges.filter((age): age is number => age != null),
      cookingSkill: FIXED_COOKING_SKILL,
      maxPrepMinutes: FIXED_MAX_PREP_MINUTES,
      dietary: effectiveDietary,
      equipment: effectiveEquipment,
      mealComplexity: {
        lunch: prefs.mealComplexity.lunch ?? "iki_cesit",
        dinner: prefs.mealComplexity.dinner ?? "iki_cesit",
      },
      includedMeals: prefs.includedMeals,
      cuisinePreferences: prefs.cuisinePreferences,
      daysCount: 7,
    };

    const response = await generatePlan.mutateAsync(payload);
    if (response.ok) {
      setPlan(response.data);
      prefs.clearSessionOverrides();
      router.push(`/plan/${response.data.planId}`);
    }
  }

  return (
    <div>
      <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      {validationError && (
        <div className="flex items-center gap-3 px-4 py-3.5 mt-4 rounded-panel bg-danger-soft">
          <span className="text-[14px] text-danger">{validationError}</span>
        </div>
      )}

      {step === 1 && (
        <HouseholdBudgetStep
          householdAdults={prefs.householdAdults}
          householdChildren={prefs.householdChildren}
          childAges={prefs.childAges}
          onHouseholdAdultsChange={prefs.setHouseholdAdults}
          onHouseholdChildrenChange={prefs.setHouseholdChildren}
          onChildAgeChange={prefs.setChildAge}
        />
      )}
      {step === 2 && <MealSelectionStep includedMeals={prefs.includedMeals} onToggleMeal={prefs.toggleIncludedMeal} />}
      {step === 3 && <CuisineStep selected={prefs.cuisinePreferences} onToggle={prefs.toggleCuisine} />}
      {step === 4 && (
        <DietaryOverrideStep effectiveDietary={effectiveDietary} onOverride={prefs.setSessionDietaryOverride} />
      )}
      {step === 5 && (
        <EquipmentOverrideStep
          effectiveEquipment={effectiveEquipment}
          onOverride={prefs.setSessionEquipmentOverride}
        />
      )}
      {step === 6 && (
        <ComplexityStep
          includedMeals={prefs.includedMeals}
          lunch={prefs.mealComplexity.lunch}
          dinner={prefs.mealComplexity.dinner}
          onChange={prefs.setMealComplexity}
        />
      )}
      {step === 7 && (
        <SummaryStep
          householdAdults={prefs.householdAdults}
          householdChildren={prefs.householdChildren}
          childAges={prefs.childAges}
          includedMeals={prefs.includedMeals}
          cuisinePreferences={prefs.cuisinePreferences}
          effectiveDietary={effectiveDietary}
          effectiveEquipment={effectiveEquipment}
          mealComplexity={prefs.mealComplexity}
          isPending={generatePlan.isPending}
          errorMessage={
            generatePlan.isError ? "Planı oluştururken bir hata oluştu. Lütfen tekrar deneyin." : undefined
          }
          onGenerate={handleGenerate}
        />
      )}

      {step < TOTAL_STEPS && (
        <div className="flex justify-between mt-10">
          <Button variant="ghost" onClick={goBack} disabled={step === 1}>
            Geri
          </Button>
          <Button variant="primary" onClick={goNext}>
            İleri
          </Button>
        </div>
      )}
      {step === TOTAL_STEPS && (
        <div className="flex justify-between mt-10">
          <Button variant="ghost" onClick={goBack}>
            Geri
          </Button>
        </div>
      )}
    </div>
  );
}
