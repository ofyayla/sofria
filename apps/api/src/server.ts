import { NodeCacheProvider } from "./cache/nodeCache.provider.js";
import { InflightRegistry } from "./cache/inflight.registry.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { GeminiProvider } from "./services/llm/gemini.provider.js";
import { PlanService } from "./services/plan/plan.service.js";

const geminiProvider = new GeminiProvider({ apiKey: env.GEMINI_API_KEY, modelId: env.MODEL_ID });
const cache = new NodeCacheProvider({ maxKeys: env.CACHE_MAX_KEYS });
// SDD §1.4 "mezarlık" haritası — ayrı bir NodeCacheProvider örneği, çok daha uzun TTL.
const staleCache = new NodeCacheProvider({ maxKeys: env.CACHE_MAX_KEYS });
const inflight = new InflightRegistry();

const planService = new PlanService({
  provider: geminiProvider,
  cache,
  staleCache,
  inflight,
  cacheTtlSeconds: env.CACHE_TTL_WEEKLY_PLAN_SECONDS,
  staleCacheTtlSeconds: env.STALE_CACHE_TTL_SECONDS,
});

const app = createApp({
  planService,
  cache,
  rateLimit: { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX_REQUESTS },
});

const server = app.listen(env.PORT, () => {
  console.warn(`✅ Sofria API çalışıyor — http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: string) {
  console.warn(`\n${signal} alındı, sunucu kapatılıyor...`);
  server.close(() => {
    console.warn("Sunucu kapandı.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
