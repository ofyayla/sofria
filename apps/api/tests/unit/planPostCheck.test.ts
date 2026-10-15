import { describe, expect, it } from "vitest";
import type { DayPlan, MealType } from "@sofria/shared";
import { canonicalizePlanIngredients, checkPlanViolations } from "../../src/services/plan/planPostCheck.js";

function dayWithMeal(overrides: Partial<DayPlan["meals"][number]> = {}): DayPlan {
  return {
    dayIndex: 0,
    dayName: "Pazartesi",
    meals: [
      {
        mealId: "m1",
        type: "aksam",
        title: "Test Yemeği",
        complexity: "tek_cesit",
        cuisineTag: "kirmizi_et",
        totalPrepMinutes: 30,
        subRecipes: [
          {
            subRecipeId: "s1",
            name: "Test Alt Yemek",
            role: "ana_yemek",
            servings: 4,
            prepMinutes: 10,
            cookMinutes: 20,
            difficulty: "kolay",
            ingredients: [{ slug: "sogan", displayName: "Kuru soğan", amount: 1, unit: "adet", isPantryStaple: true }],
            instructions: [{ order: 1, text: "Pişir." }],
            requiredEquipment: ["tencere"],
          },
        ],
        ...overrides,
      },
    ],
  };
}

const noConstraints = {
  dietary: { glutenFree: false, lactoseFree: false, vegetarian: false, vegan: false, avoidedIngredients: [], allergies: [] },
  equipment: { hasOven: true, hasAirFryer: false, hasPressureCooker: false, hasBlender: false, stovetopOnly: false },
  mealComplexity: { lunch: "iki_cesit" as const, dinner: "tam_menu" as const },
  includedMeals: ["kahvalti", "ogle", "aksam"] as MealType[],
};

describe("checkPlanViolations", () => {
  it("hiçbir kısıt ihlal edilmemişse boş dizi döner", () => {
    const violations = checkPlanViolations([dayWithMeal()], noConstraints);
    expect(violations).toEqual([]);
  });

  it("kaçınılan malzeme kullanılmışsa ihlal raporlar", () => {
    const day = dayWithMeal();
    day.meals[0]!.subRecipes[0]!.ingredients = [
      { slug: "mantar", displayName: "Mantar", amount: 100, unit: "gr", isPantryStaple: false },
    ];
    const violations = checkPlanViolations(
      [day],
      { ...noConstraints, dietary: { ...noConstraints.dietary, avoidedIngredients: ["mantar"] } }
    );
    expect(violations.length).toBe(1);
    expect(violations[0]).toContain("Mantar");
  });

  // Gerçek kullanıcı talebi: domuz eti/ürünü ve alkol, kullanıcı hiçbir şey
  // seçmemiş olsa BİLE (noConstraints) her zaman yasak — bkz. forbiddenIngredients.ts.
  it("domuz eti/ürünü kullanıcı hiçbir kısıt belirtmese bile YASAK ifadesiyle ihlal raporlar", () => {
    const day = dayWithMeal();
    day.meals[0]!.subRecipes[0]!.ingredients = [
      { slug: "domuz_pastirmasi", displayName: "Domuz Pastırması", amount: 100, unit: "gr", isPantryStaple: false },
    ];
    const violations = checkPlanViolations([day], noConstraints);
    expect(violations.length).toBe(1);
    expect(violations[0]).toContain("YASAK");
  });

  it("alkol kullanıcı hiçbir kısıt belirtmese bile YASAK ifadesiyle ihlal raporlar", () => {
    const day = dayWithMeal();
    day.meals[0]!.subRecipes[0]!.ingredients = [
      { slug: "kirmizi_sarap", displayName: "Kırmızı Şarap", amount: 100, unit: "ml", isPantryStaple: false },
    ];
    const violations = checkPlanViolations([day], noConstraints);
    expect(violations.length).toBe(1);
    expect(violations[0]).toContain("YASAK");
  });

  // SDD §3.2: alerjen ihlali kaçınılan malzemeden farklı, daha sert bir mesajla raporlanmalı.
  it("alerjen kullanılmışsa 'ALERJEN' ifadesiyle ihlal raporlar", () => {
    const day = dayWithMeal();
    day.meals[0]!.subRecipes[0]!.ingredients = [
      { slug: "yumurta", displayName: "Yumurta", amount: 2, unit: "adet", isPantryStaple: true },
    ];
    const violations = checkPlanViolations(
      [day],
      { ...noConstraints, dietary: { ...noConstraints.dietary, allergies: ["yumurta"] } }
    );
    expect(violations[0]).toContain("ALERJEN");
  });

  it("çeşit sayısı complexity ile uyuşmuyorsa ihlal raporlar", () => {
    const day = dayWithMeal(); // tek_cesit ama 1 subRecipe var — uyumlu olmalı, şimdi bozalım
    day.meals[0]!.complexity = "tam_menu"; // 3 bekleniyor ama 1 var
    const violations = checkPlanViolations([day], noConstraints);
    expect(violations.length).toBe(1);
    expect(violations[0]).toContain("tam_menu");
  });

  it("stovetopOnly true iken fırın gerektiren tarif ihlal raporlar", () => {
    const day = dayWithMeal();
    day.meals[0]!.subRecipes[0]!.requiredEquipment = ["fırın"];
    const violations = checkPlanViolations(
      [day],
      { ...noConstraints, equipment: { ...noConstraints.equipment, stovetopOnly: true, hasOven: false } }
    );
    expect(violations.length).toBe(1);
    expect(violations[0]).toContain("fırın");
  });

  // Gerçek kullanıcı testinde bulundu: LLM, kullanıcı öğle yemeği dahil
  // etmediği hâlde öğle yemeği üretebiliyordu — post-check artık bunu yakalar.
  it("includedMeals'ta olmayan bir öğün türü üretilmişse ihlal raporlar", () => {
    const day = dayWithMeal({ type: "ogle" });
    const violations = checkPlanViolations([day], { ...noConstraints, includedMeals: ["kahvalti", "aksam"] as MealType[] });
    expect(violations.length).toBe(1);
    expect(violations[0]).toContain("ogle");
  });

  it("includedMeals'ta olan bir öğün türü için ihlal raporlamaz", () => {
    const day = dayWithMeal({ type: "aksam" });
    const violations = checkPlanViolations([day], { ...noConstraints, includedMeals: ["kahvalti", "aksam"] as MealType[] });
    expect(violations).toEqual([]);
  });

  // SDD §1.2: mutfak seçimi bir TERCİHTİR, post-check burada asla ihlal raporlamaz.
  it("cuisineTag hiçbir koşulda ihlal raporlamaz (tercih, kısıt değil)", () => {
    const day = dayWithMeal();
    day.meals[0]!.cuisineTag = "italyan_mutfagi"; // kullanıcı balik_urunleri istemiş olabilir, önemli değil
    const violations = checkPlanViolations([day], noConstraints);
    expect(violations).toEqual([]);
  });
});

describe("canonicalizePlanIngredients", () => {
  it("LLM'in ürettiği slug'ı görmezden gelip sözlükten yeniden çözer", () => {
    const day = dayWithMeal();
    // LLM yanlış/tutarsız bir slug üretmiş olsun ("tavuk_gogsu_eti"), displayName doğru
    day.meals[0]!.subRecipes[0]!.ingredients = [
      { slug: "tavuk_gogsu_eti", displayName: "tavuk gögsü", amount: 200, unit: "gr", isPantryStaple: false },
    ];
    const canonical = canonicalizePlanIngredients([day]);
    // sözlükten doğru slug'a düzeltilmiş olmalı
    expect(canonical[0]!.meals[0]!.subRecipes[0]!.ingredients[0]!.slug).toBe("tavuk_gogsu");
  });
});
