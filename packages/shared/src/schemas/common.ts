import { z } from "zod";
import { AISLES } from "../enums/aisle.js";
import { CUISINE_TYPES } from "../enums/cuisine.js";
import { ERROR_CODES } from "../enums/errorCode.js";
import { UNITS } from "../enums/unit.js";
import { SCHEMA_VERSION } from "../constants/versions.js";

export const unitSchema = z.enum(UNITS);
export const cuisineTypeSchema = z.enum(CUISINE_TYPES);
export const aisleSchema = z.enum(AISLES);
export const errorCodeSchema = z.enum(ERROR_CODES);

// SDD §3.1 — z.literal ile şema sürümü kilitlenir; eski bir istemci yanlışlıkla
// güncel bir endpoint'e istek atarsa hemen VALIDATION_ERROR alır.
export const schemaVersionSchema = z.literal(SCHEMA_VERSION);

export const ingredientSchema = z.object({
  slug: z.string().min(1),
  displayName: z.string().min(1),
  amount: z.number().positive(),
  unit: unitSchema,
  isPantryStaple: z.boolean(),
  note: z.string().optional(),
});
export type Ingredient = z.infer<typeof ingredientSchema>;

export const instructionStepSchema = z.object({
  order: z.number().int().nonnegative(),
  text: z.string().min(1),
  durationMinutes: z.number().int().positive().optional(),
});
export type InstructionStep = z.infer<typeof instructionStepSchema>;

export const apiMetaSchema = z.object({
  requestId: z.string(),
  source: z.enum(["cache", "inflight", "ai", "stale"]),
  latencyMs: z.number().nonnegative(),
  cacheKey: z.string(),
  schemaVersion: schemaVersionSchema,
  promptVersion: z.string(),
  degraded: z.boolean().optional(),
  generatedAt: z.string().datetime(),
});
export type ApiMeta = z.infer<typeof apiMetaSchema>;

export const apiErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
  retryable: z.boolean(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
  retryAfterSec: z.number().int().positive().optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * SDD §3.1 — discriminated union. İstemci `ok` alanına göre dallanır,
 * `data` ve `error` asla aynı anda mevcut olmaz.
 */
export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion("ok", [
    z.object({ ok: z.literal(true), data: dataSchema, meta: apiMetaSchema }),
    z.object({
      ok: z.literal(false),
      error: apiErrorSchema,
      meta: apiMetaSchema.pick({ requestId: true, latencyMs: true }),
    }),
  ]);
}
export type ApiResponse<T> =
  | { ok: true; data: T; meta: ApiMeta }
  | { ok: false; error: ApiError; meta: Pick<ApiMeta, "requestId" | "latencyMs"> };
