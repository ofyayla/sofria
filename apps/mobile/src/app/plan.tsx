import type { UserPreferencesPayload } from "@sofria/shared";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { HouseholdStep } from "../components/wizard/HouseholdStep";
import { MenuStep } from "../components/wizard/MenuStep";
import { SummaryStep } from "../components/wizard/SummaryStep";
import { PrimaryButton, WizardScreen } from "../components/ui";
import { useGeneratePlan } from "../hooks/useGeneratePlan";
import { mergeDietary, mergeEquipment } from "../lib/mergeConstraints";
import { usePlanStore } from "../stores/plan.store";
import { usePreferencesStore } from "../stores/preferences.store";
import { useRulesProfileStore } from "../stores/rulesProfile.store";

const STEPS = [
  { muted: "Kim", strong: "yiyor?", caption: "Porsiyonlar\nbuna göre" },
  { muted: "Ne", strong: "yiyelim?", caption: "Birden fazla\nseçebilirsin" },
  { muted: "Son", strong: "kontrol", caption: "Hazırsan\noluşturalım" },
] as const;
const TOTAL_STEPS = STEPS.length;

/**
 * Gerçek kullanıcı talebi: pişirme becerisi ve öğün başına hazırlık süresi
 * kullanıcıya SORULMUYOR. Beceri her zaman "orta"; süre ~1 saatte
 * hazırlanabilecek tarifleri hedefler (bkz. catalogPlanBuilder.ts filterByTime).
 */
const FIXED_COOKING_SKILL = "orta" as const;
const FIXED_MAX_PREP_MINUTES = 60;

/**
 * Plan sihirbazı — 3 adım: Kim yiyor? → Ne yiyelim? → Son kontrol.
 * (Eskiden 7 adımdı; diyet ve ekipman "Kurallarım"dan geldiği için son
 * adıma katlandı, öğün/çeşit/mutfak tek ekranda.)
 */
export default function PlanWizardScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const prefs = usePreferencesStore();
  const rulesProfile = useRulesProfileStore();
  const setPlan = usePlanStore((s) => s.setPlan);
  const generatePlan = useGeneratePlan();

  const effectiveDietary = mergeDietary(rulesProfile.dietary, prefs.sessionDietaryOverrides);
  const effectiveEquipment = mergeEquipment(rulesProfile.equipment, prefs.sessionEquipmentOverrides);

  /**
   * Gerçek kullanıcı testi: "İleri" sessizce engellenmemeli, HANGİ alanın
   * eksik olduğunu söylemeli. Eksik olan şey artık doğrudan CTA etiketinde.
   */
  function missingForStep(currentStep: number): string | null {
    if (currentStep === 0) {
      // AsyncStorage JSON round-trip'inden sonra boş yaş slotları `null` gelir.
      if (prefs.childAges.slice(0, prefs.householdChildren).some((age) => age == null)) return "Çocukların yaşını seç";
    }
    if (currentStep === 1) {
      if (prefs.includedMeals.length === 0) return "En az 1 öğün seç";
      if (prefs.includedMeals.includes("ogle") && !prefs.mealComplexity.lunch) return "Öğle için çeşit seç";
      if (prefs.includedMeals.includes("aksam") && !prefs.mealComplexity.dinner) return "Akşam için çeşit seç";
      if (prefs.cuisinePreferences.length === 0) return "En az 1 mutfak seç";
    }
    if (currentStep === 2) {
      const e = effectiveEquipment;
      if (!(e.hasOven || e.hasAirFryer || e.hasPressureCooker || e.hasBlender || e.stovetopOnly)) return "En az 1 ekipman seç";
    }
    return null;
  }

  function close() {
    router.back();
  }

  function goBack() {
    if (step === 0) {
      close();
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
      // Sihirbaz sekmelerin üstünde modal: kapat ve Plan sekmesine geç.
      if (router.canDismiss()) router.dismissTo("/haftam");
      else router.replace("/haftam");
    }
  }

  const missing = missingForStep(step);
  const isLastStep = step === TOTAL_STEPS - 1;
  const cta = isLastStep ? (
    <PrimaryButton
      label={missing ?? (generatePlan.isPending ? "Plan hazırlanıyor…" : "Planımı oluştur")}
      disabled={Boolean(missing)}
      loading={generatePlan.isPending}
      {...(missing ? {} : { icon: Sparkles })}
      onPress={() => void handleGenerate()}
    />
  ) : (
    <PrimaryButton label={missing ?? "Devam"} disabled={Boolean(missing)} showArrow onPress={() => setStep((s) => s + 1)} />
  );

  return (
    <WizardScreen stepIndex={step} totalSteps={TOTAL_STEPS} headline={STEPS[step]!} onBack={goBack} onClose={close} cta={cta}>
      {step === 0 && (
        <HouseholdStep
          householdAdults={prefs.householdAdults}
          householdChildren={prefs.householdChildren}
          childAges={prefs.childAges}
          onHouseholdAdultsChange={prefs.setHouseholdAdults}
          onHouseholdChildrenChange={prefs.setHouseholdChildren}
          onChildAgeChange={prefs.setChildAge}
        />
      )}
      {step === 1 && (
        <MenuStep
          includedMeals={prefs.includedMeals}
          onToggleMeal={prefs.toggleIncludedMeal}
          lunch={prefs.mealComplexity.lunch}
          dinner={prefs.mealComplexity.dinner}
          onComplexityChange={prefs.setMealComplexity}
          cuisines={prefs.cuisinePreferences}
          onToggleCuisine={prefs.toggleCuisine}
        />
      )}
      {step === 2 && (
        <SummaryStep
          householdAdults={prefs.householdAdults}
          householdChildren={prefs.householdChildren}
          childAges={prefs.childAges}
          includedMeals={prefs.includedMeals}
          cuisinePreferences={prefs.cuisinePreferences}
          mealComplexity={prefs.mealComplexity}
          effectiveDietary={effectiveDietary}
          effectiveEquipment={effectiveEquipment}
          onDietaryOverride={prefs.setSessionDietaryOverride}
          onEquipmentOverride={prefs.setSessionEquipmentOverride}
          onEditStep={setStep}
          isPending={generatePlan.isPending}
          errorMessage={generatePlan.isError ? "Lütfen tekrar deneyin." : undefined}
        />
      )}
    </WizardScreen>
  );
}
