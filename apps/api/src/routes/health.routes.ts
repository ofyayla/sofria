import { Router, type Request, type Response } from "express";
import { cacheStatsSchema, type CacheStats } from "@sofria/shared";
import type { CacheProvider } from "../cache/cacheProvider.interface.js";
import { metrics } from "../utils/metrics.js";

/** Ortalama plan/tarif nesnesi boyutuna kabaca dayalı bellek tahmini — kesin değil, gözlemlenebilirlik amaçlı. */
const ESTIMATED_BYTES_PER_KEY = 60_000; // ~60KB — ortalama bir haftalık plan JSON boyutu

export function createHealthRouter(cache: CacheProvider): Router {
  const router = Router();

  router.get("/health/cache", (req: Request, res: Response) => {
    const stats = cache.stats();
    const totalRequests = stats.hits + stats.misses;
    const hitRate = totalRequests === 0 ? 0 : Math.round((stats.hits / totalRequests) * 100) / 100;

    const data: CacheStats = {
      keyCount: stats.keyCount,
      hitRate,
      missCount: stats.misses,
      staleServeCount: metrics.staleServes,
      avgGenerationMs: metrics.avgGenerationMs,
      memoryEstimateMB: Math.round((stats.keyCount * ESTIMATED_BYTES_PER_KEY) / 1_000_000),
    };

    // Kendi ürettiğimiz nesnenin bile CacheStats şemasına uyduğunu doğruluyoruz.
    const validated = cacheStatsSchema.parse(data);

    // BASİTLEŞTİRME NOTU: SDD §3.6 bu endpoint'i ApiResponse<CacheStats> olarak
    // tanımlar, ama tam ApiMeta (cacheKey/source/promptVersion) belirli bir
    // üretim olayına bağlıdır — bu operasyonel/gözlemlenebilirlik endpoint'i
    // için anlamsız. Bu yüzden yalnızca requestId + latencyMs taşıyan
    // hafifletilmiş bir meta kullanılıyor.
    res.json({
      ok: true,
      data: validated,
      meta: { requestId: req.requestId ?? "n/a", latencyMs: 0 },
    });
  });

  return router;
}
