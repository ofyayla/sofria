import "dotenv/config";
import { z } from "zod";

/**
 * Tüm ortam değişkenleri burada, TEK yerde doğrulanır.
 * Uygulama başlarken bu şemaya uymayan bir .env ile process hemen çöker —
 * "üretimde yarı yapılandırılmış sunucu" durumu asla oluşmaz.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY zorunludur"),
  // Model kimliği koda gömülmez — bkz. SDD §1.6.
  MODEL_ID: z.string().min(1).default("gemini-3.6-flash"),

  CACHE_TTL_WEEKLY_PLAN_SECONDS: z.coerce.number().int().positive().default(86400),
  CACHE_MAX_KEYS: z.coerce.number().int().positive().default(5000),
  // SDD §1.4: "stale-while-error" mezarlık haritası — Gemini çökerse eldeki
  // son üretimi (bayat da olsa) servis edebilmek için, ana TTL'den çok daha uzun.
  STALE_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(604_800), // 7 gün

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Geçersiz ortam değişkenleri:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
