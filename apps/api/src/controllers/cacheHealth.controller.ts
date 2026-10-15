import type { Request, Response } from "express";
import { cacheStatsSchema, type CacheStats } from "@sofria/shared";
import type { CacheProvider } from "../cache/cacheProvider.interface.js";
import type { GenerationStatsTracker } from "../utils/generationStats.js";

/**
 * SDD §1.4 Gözlemlenebilirlik: hitRate, missCount, avgGenerationMs, keyCount.
 * NodeCacheProvider.stats() yalnızca ham hit/miss/keyCount döner — hitRate
 * ve memoryEstimateMB burada TÜRETİLİR (SDD'nin istediği tam CacheStats şekli).
 */
export function createCacheHealthController(cache: CacheProvider, staleCache: CacheProvider, generationStats: GenerationStatsTracker) {
  return function cacheHealthHandler(req: Request, res: Response): void {
    const main = cache.stats();
    const stale = staleCache.stats();

    const totalRequests = main.hits + main.misses;
    const stats: CacheStats = {
      keyCount: main.keyCount,
      hitRate: totalRequests === 0 ? 0 : Math.round((main.hits / totalRequests) * 1000) / 1000,
      missCount: main.misses,
      staleServeCount: stale.hits,
      avgGenerationMs: generationStats.getAverage(),
      // Gerçek bellek ölçümü yerine kaba bir tahmin: SDD §1.4 "plan nesnesi
      // ~40-80 KB" varsayımı — kesin değer değil, gözlemlenebilirlik amaçlı.
      memoryEstimateMB: Math.round(((main.keyCount * 60_000) / (1024 * 1024)) * 100) / 100,
    };

    const validated = cacheStatsSchema.parse(stats);

    res.status(200).json({
      ok: true,
      data: validated,
      meta: { requestId: req.requestId, source: "ai", latencyMs: 0, cacheKey: "", schemaVersion: 1, promptVersion: "n/a", generatedAt: new Date().toISOString() },
    });
  };
}
