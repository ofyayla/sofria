import { z } from "zod";
import { cuisineTypeSchema, ingredientSchema, instructionStepSchema } from "./common.js";

/**
 * Gerçek kullanıcı talebi: Tariflerim'den bir tarifi tekrar açmak istediğinde
 * tarif açılmıyordu — çünkü yalnızca ad/mutfak/yıldız saklanıyordu, kaynak
 * plan (cihazda tek plan tutulur) değiştiğinde malzeme/talimat verisi geri
 * getirilemiyordu. Bu yüzden puanlama ANINDA tarifin TAMAMI (malzemeler,
 * talimatlar) da kayda gömülüyor — kaynak plan silinse bile tarif detayı
 * kendi başına açılabilir kalıyor. Eski (bu alan olmadan kaydedilmiş)
 * puanlamalarla geriye dönük uyum için optional.
 */
export const ratedRecipeSnapshotSchema = z.object({
  servings: z.number().int().positive(),
  prepMinutes: z.number().int().nonnegative(),
  cookMinutes: z.number().int().nonnegative(),
  difficulty: z.enum(["kolay", "orta", "zor"]),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(instructionStepSchema).min(1),
  requiredEquipment: z.array(z.string()),
  /** bkz. weeklyPlan.ts subRecipeSchema.imageSlug — aynı görsel eşleşmesi. */
  imageSlug: z.string().optional(),
});
export type RatedRecipeSnapshot = z.infer<typeof ratedRecipeSnapshotSchema>;

/**
 * SDD §3.7: v1'de yalnızca cihazda tutulur (hesap sistemi yok).
 * recipeName/cuisineTag BİLEREK denormalize saklanır — kaynak plan
 * silinse bile puanlama kaydı kendi başına anlamlı kalır.
 */
export const recipeRatingSchema = z.object({
  ratingId: z.string(),
  source: z.enum(["weekly_plan", "quick_meal"]),
  sourceMealId: z.string(),
  sourceSubRecipeId: z.string().optional(),
  recipeName: z.string().min(1),
  cuisineTag: cuisineTypeSchema,
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  comment: z.string().max(500).optional(),
  ratedAt: z.string().datetime(),
  recipeSnapshot: ratedRecipeSnapshotSchema.optional(),
});
export type RecipeRating = z.infer<typeof recipeRatingSchema>;
