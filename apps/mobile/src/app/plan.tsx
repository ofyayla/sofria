import type { UserPreferencesPayload } from "@sofria/shared";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ComplexityStep } from "../components/wizard/ComplexityStep";
import { CuisineStep } from "../components/wizard/CuisineStep";
import { DietaryOverrideStep } from "../components/wizard/DietaryOverrideStep";
import { EquipmentOverrideStep } from "../components/wizard/EquipmentOverrideStep";
import { HouseholdBudgetStep } from "../components/wizard/HouseholdBudgetStep";
import { MealSelectionStep } from "../components/wizard/MealSelectionStep";
import { SummaryStep } from "../components/wizard/SummaryStep";
import { PrimaryButton, WizardScreen } from "../components/ui";
import { useGeneratePlan } from "../hooks/useGeneratePlan";
import { mergeDietary, mergeEquipment } from "../lib/mergeConstraints";
import { colors, radius, space, type as textType } from "../theme";
import { usePlanStore } from "../stores/plan.store";
import { usePreferencesStore } from "../stores/preferences.store";
import { useRulesProfileStore } from "../stores/rulesProfile.store";

// Gerçek kullanıcı talebi: "hangi öğünler dahil olsun?" kendi bağımsız
// sayfası — hane seçiminden hemen sonra, 2. adım (index 1).
const STEP_TITLES = ["Hane", "Öğünler", "Mutfak seçimi", "Diyet & alerji", "Mutfak ekipmanı", "Öğün çeşidi", "Özet"];
const TOTAL_STEPS = STEP_TITLES.length;

/**
 * Gerçek kullanıcı talebi: pişirme becerisi ve öğün başına hazırlık süresi
 * artık kullanıcıya SORULMUYOR. Beceri her zaman "orta" kabul edilir; süre
 * genelde ~1 saatte hazırlanabilecek tarifleri hedefler (bkz.
 * catalogPlanBuilder.ts filterByTime — prepMinutes+cookMinutes ≤ 60).
 */
const FIXED_COOKING_SKILL = "orta" as const;
const FIXED_MAX_PREP_MINUTES = 60;

/**
 * design-system.md §11.4 — sihirbaz WizardScreen üzerinden kuruldu.
 * F9.5'teki tek-ekranlık form dosyası burada tamamen yeniden yazıldı
 * (silinip yerine eklenmedi) — web'in 6 adımlı yapısıyla birebir aynı
 * alan/mantık (bkz. PreferenceWizard.tsx), yalnızca görsel bileşenler ayrı.
 */
export default function PlanWizardScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const prefs = usePreferencesStore();
  const rulesProfile = useRulesProfileStore();
  const setPlan = usePlanStore((s) => s.setPlan);
  const generatePlan = useGeneratePlan();

  const effectiveDietary = mergeDietary(rulesProfile.dietary, prefs.sessionDietaryOverrides);
  const effectiveEquipment = mergeEquipment(rulesProfile.equipment, prefs.sessionEquipmentOverrides);

  /**
   * Gerçek kullanıcı testinde bulundu (web tarafında): hiçbir alanın
   * varsayılan bir seçimi olmamalı ve "İleri"ye basınca sessizce
   * engellemek yerine HANGİ alan(lar)ın eksik olduğunu söylemeli.
   * Adımlar burada 0-indexli: 0=hane, 1=öğünler, 2=mutfak, 3=diyet, 4=ekipman, 5=çeşit, 6=özet.
   */
  function missingFieldsForStep(currentStep: number): string[] {
    const missing: string[] = [];
    if (currentStep === 0) {
      // Not: AsyncStorage'dan JSON round-trip sonrası doldurulmamış yaş
      // slotları `undefined` değil `null` olarak geri gelir — ikisini de yakala.
      if (prefs.childAges.slice(0, prefs.householdChildren).some((age) => age == null)) {
        missing.push("Çocukların yaşları");
      }
    }
    if (currentStep === 1 && prefs.includedMeals.length === 0) {
      missing.push("En az bir öğün");
    }
    if (currentStep === 2 && prefs.cuisinePreferences.length === 0) {
      missing.push("En az bir mutfak");
    }
    if (currentStep === 4) {
      const hasAnyEquipment =
        effectiveEquipment.hasOven ||
        effectiveEquipment.hasAirFryer ||
        effectiveEquipment.hasPressureCooker ||
        effectiveEquipment.hasBlender ||
        effectiveEquipment.stovetopOnly;
      if (!hasAnyEquipment) missing.push("En az bir mutfak ekipmanı");
    }
    if (currentStep === 5) {
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
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function goBack() {
    setValidationError(null);
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  async function handleGenerate() {
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
      router.replace(`/plan/${response.data.planId}`);
    }
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <WizardScreen
      title={STEP_TITLES[step]!}
      stepIndex={step}
      totalSteps={TOTAL_STEPS}
      onBack={goBack}
      cta={isLastStep ? undefined : <PrimaryButton label="İleri" onPress={goNext} showArrow={false} />}
    >
      {validationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      )}

      {step === 0 && (
        <HouseholdBudgetStep
          householdAdults={prefs.householdAdults}
          householdChildren={prefs.householdChildren}
          childAges={prefs.childAges}
          onHouseholdAdultsChange={prefs.setHouseholdAdults}
          onHouseholdChildrenChange={prefs.setHouseholdChildren}
          onChildAgeChange={prefs.setChildAge}
        />
      )}
      {step === 1 && <MealSelectionStep includedMeals={prefs.includedMeals} onToggleMeal={prefs.toggleIncludedMeal} />}
      {step === 2 && <CuisineStep selected={prefs.cuisinePreferences} onToggle={prefs.toggleCuisine} />}
      {step === 3 && <DietaryOverrideStep effectiveDietary={effectiveDietary} onOverride={prefs.setSessionDietaryOverride} />}
      {step === 4 && <EquipmentOverrideStep effectiveEquipment={effectiveEquipment} onOverride={prefs.setSessionEquipmentOverride} />}
      {step === 5 && (
        <ComplexityStep
          includedMeals={prefs.includedMeals}
          lunch={prefs.mealComplexity.lunch}
          dinner={prefs.mealComplexity.dinner}
          onChange={prefs.setMealComplexity}
        />
      )}
      {step === 6 && (
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
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.panel,
    backgroundColor: colors.dangerSoft,
    marginBottom: space.lg,
  },
  errorText: { fontFamily: textType.helper.font, fontSize: textType.helper.size, color: colors.danger },
});
