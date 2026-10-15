import { z } from "zod";
import { schemaVersionSchema } from "./common.js";

export function cacheEntrySchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    key: z.string(),
    payloadHash: z.string(),
    mode: z.enum(["weekly_plan", "quick_meal"]),
    data: dataSchema,
    meta: z.object({
      createdAt: z.string().datetime(),
      expiresAt: z.string().datetime(),
      schemaVersion: schemaVersionSchema,
      promptVersion: z.string(),
      // Teşhis amaçlı — SDD §1.6: cacheKey'e DAHİL EDİLMEZ.
      modelId: z.string(),
      generationMs: z.number().nonnegative(),
      hitCount: z.number().int().nonnegative(),
      repairAttempts: z.number().int().nonnegative(),
    }),
  });
}

export const cacheStatsSchema = z.object({
  keyCount: z.number().int().nonnegative(),
  hitRate: z.number().min(0).max(1),
  missCount: z.number().int().nonnegative(),
  staleServeCount: z.number().int().nonnegative(),
  avgGenerationMs: z.number().nonnegative(),
  memoryEstimateMB: z.number().nonnegative(),
});
export type CacheStats = z.infer<typeof cacheStatsSchema>;
