import { z } from "zod";

/**
 * SDD §3.2: `avoidedIngredients` bir TERCİH — ihlalde hedefli düzeltme turu
 * atılır (bkz. SDD §1.2). `allergies` bir GÜVENLİK meselesi — ihlalde yanıt
 * tümden reddedilir (BUSINESS_RULE_VIOLATION). İkisini asla birleştirme.
 *
 * İkisi de PantryTagInput ile aynı chip mekaniğini kullanır (SDD §4.4):
 * her öğe zaten normalize edilmiş bir slug olarak buraya gelir, serbest
 * metin/virgül ayrıştırması burada YAPILMAZ.
 */
export const dietaryConstraintsSchema = z.object({
  glutenFree: z.boolean(),
  lactoseFree: z.boolean(),
  vegetarian: z.boolean(),
  vegan: z.boolean(),
  avoidedIngredients: z.array(z.string().min(1)).max(50),
  allergies: z.array(z.string().min(1)).max(20),
});
export type DietaryConstraints = z.infer<typeof dietaryConstraintsSchema>;

export const equipmentConstraintsSchema = z
  .object({
    hasOven: z.boolean(),
    hasAirFryer: z.boolean(),
    hasPressureCooker: z.boolean(),
    hasBlender: z.boolean(),
    stovetopOnly: z.boolean(),
  })
  // SDD §3.2: stovetopOnly=true → hasOven=false türetilmiş kuralı burada zorlanır.
  .refine((eq) => !eq.stovetopOnly || !eq.hasOven, {
    message: "stovetopOnly true iken hasOven true olamaz.",
    path: ["hasOven"],
  });
export type EquipmentConstraints = z.infer<typeof equipmentConstraintsSchema>;
