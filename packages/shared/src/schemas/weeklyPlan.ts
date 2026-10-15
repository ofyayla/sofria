import { z } from "zod";
import { aisleSchema, cuisineTypeSchema, ingredientSchema, instructionStepSchema, schemaVersionSchema } from "./common.js";
import { dietaryConstraintsSchema, equipmentConstraintsSchema } from "./constraints.js";

export const mealComplexitySchema = z.enum(["tek_cesit", "iki_cesit", "tam_menu"]);
export type MealComplexity = z.infer<typeof mealComplexitySchema>;

// SDD §3.3: çeşit → subRecipes uzunluğu eşlemesi. PlanPostCheck (F5) bu eşlemeyi
// deterministik olarak denetler; burada yalnızca sözleşme tutarlılığı için not düşülüyor.
export const MEAL_COMPLEXITY_SUBRECIPE_COUNT: Record<MealComplexity, number> = {
  tek_cesit: 1,
  iki_cesit: 2,
  tam_menu: 3,
};

export const mealTypeSchema = z.enum(["kahvalti", "ogle", "aksam"]);
export type MealType = z.infer<typeof mealTypeSchema>;

// ——— REQUEST ———
export const userPreferencesPayloadSchema = z.object({
  schemaVersion: schemaVersionSchema,
  householdSize: z.number().int().min(1).max(12),
  // Gerçek kullanıcı talebi: çocukların porsiyonu yetişkinlerden küçük
  // olmalı — LLM'e hane kompozisyonunu (kaç yetişkin, kaç çocuk) bildirmek
  // için. Opsiyonel: eski istemciler/testler bu alan olmadan da geçerli.
  householdAges: z.array(z.number().int().min(0).max(120)).max(12).optional(),
  cookingSkill: z.enum(["baslangic", "orta", "ileri"]),
  maxPrepMinutes: z.number().int().min(15).max(180),
  dietary: dietaryConstraintsSchema,
  equipment: equipmentConstraintsSchema,
  mealComplexity: z.object({
    lunch: mealComplexitySchema,
    dinner: mealComplexitySchema,
  }),
  includedMeals: z.array(mealTypeSchema).min(1),
  // SDD §3.3: çoklu seçim, en az 1 mutfak zorunlu.
  cuisinePreferences: z.array(cuisineTypeSchema).min(1),
  daysCount: z.literal(7),
});
export type UserPreferencesPayload = z.infer<typeof userPreferencesPayloadSchema>;

// ——— RESPONSE ———
export const subRecipeSchema = z.object({
  subRecipeId: z.string(),
  name: z.string().min(1),
  role: z.enum(["corba", "ana_yemek", "yan_lezzet", "salata", "pilav_makarna", "tatli"]),
  servings: z.number().int().positive(),
  prepMinutes: z.number().int().nonnegative(),
  cookMinutes: z.number().int().nonnegative(),
  difficulty: z.enum(["kolay", "orta", "zor"]),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(instructionStepSchema).min(1),
  requiredEquipment: z.array(z.string()),
  tips: z.array(z.string()).optional(),
  // Sağlık profili özelliği (bkz. domain/calorie.ts): LLM'in tahmini,
  // tıbbi/etiket hassasiyetinde değildir. Eski/önbelleklenmiş planlarda
  // olmayabilir — bu yüzden optional; eksikse porsiyon önerisi gösterilmez.
  estimatedKcalPerServing: z.number().int().positive().optional(),
  /**
   * Gerçek kullanıcı talebi: tarif kartlarında ikon yerine gerçek tarif
   * görseli gösterilsin. Katalogdaki (bkz. recipeCatalog.ts) `imageSlug`
   * alanının aynısı — dosya adı `apps/web/public/dish-images/<imageSlug>.jpg`
   * ve `apps/mobile/assets/images/dishes/<imageSlug>.jpg` ile eşleşir.
   * Eski/kaydedilmiş planlarda olmayabilir (bu alan eklenmeden önce
   * üretilmiş) — bu yüzden optional; eksikse istemci ikona düşer.
   */
  imageSlug: z.string().optional(),
});
export type SubRecipe = z.infer<typeof subRecipeSchema>;

export const mealSchema = z.object({
  mealId: z.string(),
  type: mealTypeSchema,
  title: z.string().min(1),
  complexity: mealComplexitySchema,
  // SDD §3.3: bilgilendirici — LLM'in kendi işaretlediği etiket, sıkı doğrulama kapısı değil.
  cuisineTag: cuisineTypeSchema,
  totalPrepMinutes: z.number().int().nonnegative(),
  subRecipes: z.array(subRecipeSchema).min(1).max(3),
});
export type Meal = z.infer<typeof mealSchema>;

export const dayPlanSchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  dayName: z.string(),
  meals: z.array(mealSchema).min(1),
});
export type DayPlan = z.infer<typeof dayPlanSchema>;

/**
 * Gerçek kullanıcı talebi: plan her zaman OLUŞTURULDUĞU günün ERTESİ
 * gününden başlamalı (artık sabit "Pazartesi" değil), ve gün şeridinde
 * gerçek takvim tarihi görünmeli. Bu `date` alanı LLM'den ASLA istenmez —
 * LLM'in tarih aritmetiği güvenilmez; API kendi kod tarafında deterministik
 * hesaplayıp enjekte eder (bkz. plan.service.ts / domain/weekDates.ts).
 * Bu yüzden `dayPlanSchema`'dan AYRI: LLM ham çıktısı (weeklyPlanLlmOutputSchema)
 * hâlâ tarihsiz `dayPlanSchema`'yı kullanır, yalnızca NİHAİ istemci yanıtı
 * bu genişletilmiş şemayı kullanır.
 */
export const dayPlanWithDateSchema = dayPlanSchema.extend({
  /** ISO "YYYY-MM-DD". */
  date: z.string(),
});
export type DayPlanWithDate = z.infer<typeof dayPlanWithDateSchema>;

export const shoppingItemSchema = z.object({
  slug: z.string(),
  displayName: z.string(),
  totalAmount: z.number().positive(),
  unit: ingredientSchema.shape.unit,
  usedIn: z.array(
    z.object({ mealId: z.string(), subRecipeId: z.string(), amount: z.number().positive() })
  ),
  isPantryStaple: z.boolean(),
  estimatedPriceTRY: z.number().positive().optional(),
});
export type ShoppingItem = z.infer<typeof shoppingItemSchema>;

export const aisleGroupSchema = z.object({
  aisle: aisleSchema,
  displayName: z.string(),
  order: z.number().int().nonnegative(),
  items: z.array(shoppingItemSchema),
});
export type AisleGroup = z.infer<typeof aisleGroupSchema>;

export const shoppingListSchema = z.object({
  aisles: z.array(aisleGroupSchema),
  estimatedTotalTRY: z.number().positive().optional(),
  itemCount: z.number().int().nonnegative(),
});
export type ShoppingList = z.infer<typeof shoppingListSchema>;

export const planSummarySchema = z.object({
  totalMeals: z.number().int().nonnegative(),
  distinctIngredients: z.number().int().nonnegative(),
  constraintsApplied: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type PlanSummary = z.infer<typeof planSummarySchema>;

export const weeklyPlanResponseSchema = z.object({
  planId: z.string(),
  days: z.array(dayPlanWithDateSchema).length(7),
  shoppingList: shoppingListSchema,
  summary: planSummarySchema,
});
export type WeeklyPlanResponse = z.infer<typeof weeklyPlanResponseSchema>;
