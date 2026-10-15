import {
  userPreferencesPayloadSchema,
  weeklyPlanResponseSchema,
  recipeRatingSchema,
  equipmentConstraintsSchema,
} from "./src/index.ts";

let failed = 0;
function check(name: string, ok: boolean) {
  console.log(`${ok ? "✅" : "❌"} ${name}`);
  if (!ok) failed++;
}

const validPrefs = {
  schemaVersion: 1,
  householdSize: 3,
  budgetLevel: "orta",
  cookingSkill: "orta",
  maxPrepMinutes: 60,
  dietary: {
    glutenFree: true,
    lactoseFree: false,
    vegetarian: false,
    vegan: false,
    avoidedIngredients: ["mantar"],
    allergies: [],
  },
  equipment: {
    hasOven: false,
    hasAirFryer: false,
    hasPressureCooker: true,
    hasBlender: true,
    stovetopOnly: true,
  },
  mealComplexity: { lunch: "iki_cesit", dinner: "tam_menu" },
  includedMeals: ["ogle", "aksam"],
  cuisinePreferences: ["balik_urunleri", "italyan_mutfagi"],
  daysCount: 7,
};
check("Geçerli UserPreferencesPayload kabul edilir", userPreferencesPayloadSchema.safeParse(validPrefs).success);

const conflictingEquipment = { ...validPrefs.equipment, hasOven: true };
check(
  "stovetopOnly + hasOven çakışması reddedilir",
  !equipmentConstraintsSchema.safeParse(conflictingEquipment).success
);

const noCuisine = { ...validPrefs, cuisinePreferences: [] };
check("Boş cuisinePreferences reddedilir", !userPreferencesPayloadSchema.safeParse(noCuisine).success);

const wrongDays = { ...validPrefs, daysCount: 5 };
check("daysCount != 7 reddedilir", !userPreferencesPayloadSchema.safeParse(wrongDays).success);

const invalidRating = {
  ratingId: "r1",
  source: "weekly_plan",
  sourceMealId: "m1",
  recipeName: "Tavuklu Sote",
  cuisineTag: "beyaz_et",
  rating: 6,
  ratedAt: new Date().toISOString(),
};
check("Geçersiz rating (6) reddedilir", !recipeRatingSchema.safeParse(invalidRating).success);

const shortPlan = {
  planId: "p1",
  days: [],
  shoppingList: { aisles: [], itemCount: 0 },
  summary: { totalMeals: 0, distinctIngredients: 0, constraintsApplied: [], warnings: [] },
};
check("7 günden az DayPlan reddedilir", !weeklyPlanResponseSchema.safeParse(shortPlan).success);

console.log(failed === 0 ? "\n🎉 Tüm testler geçti" : `\n💥 ${failed} test başarısız`);
process.exit(failed === 0 ? 0 : 1);
