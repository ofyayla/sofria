import { describe, expect, it } from "vitest";
import { buildCacheKey } from "../../src/cache/cacheKey.builder.js";
import { InflightRegistry } from "../../src/cache/inflight.registry.js";
import { NodeCacheProvider } from "../../src/cache/nodeCache.provider.js";

describe("Cache entegrasyonu: hit / miss / TTL", () => {
  it("henüz set edilmemiş bir key için cache-miss (undefined) döner", async () => {
    const cache = new NodeCacheProvider();
    const key = buildCacheKey({
      schemaVersion: 1,
      promptVersion: "1.0.0",
      mode: "weekly_plan",
      payload: { a: 1 },
    });
    expect(await cache.get(key)).toBeUndefined();
  });

  it("set edilen bir kayıt sonraki get'te cache-hit olarak döner", async () => {
    const cache = new NodeCacheProvider();
    const key = buildCacheKey({
      schemaVersion: 1,
      promptVersion: "1.0.0",
      mode: "weekly_plan",
      payload: { householdSize: 3 },
    });

    expect(await cache.get(key)).toBeUndefined(); // miss
    await cache.set(key, { planId: "p-123" }, 60);
    expect(await cache.get(key)).toEqual({ planId: "p-123" }); // hit
  });

  it("TTL süresi dolunca kayıt tekrar cache-miss'e döner", async () => {
    const cache = new NodeCacheProvider({ checkperiod: 1 });
    await cache.set("ttl-test-key", { x: 1 }, 1); // 1 saniyelik TTL

    expect(await cache.get("ttl-test-key")).toEqual({ x: 1 });

    await new Promise((resolve) => setTimeout(resolve, 1300));

    expect(await cache.get("ttl-test-key")).toBeUndefined();
  }, 3000);

  it("stats() hit/miss sayaçlarını doğru tutar", async () => {
    const cache = new NodeCacheProvider();
    await cache.get("yok"); // miss
    await cache.set("var", "değer", 60);
    await cache.get("var"); // hit

    const stats = cache.stats();
    expect(stats.misses).toBeGreaterThanOrEqual(1);
    expect(stats.hits).toBeGreaterThanOrEqual(1);
    expect(stats.keyCount).toBe(1);
  });

  // SDD §1.2 sekans diyagramının üçlü dalını (hit / in-flight / miss) burada
  // Cache + InflightRegistry birlikte simüle ediyor — PlanService henüz yok (F5)
  // ama mimarinin doğru çalıştığı bu seviyede kanıtlanabilir.
  it("cache-miss → in-flight → cache-hit tam döngüsü", async () => {
    const cache = new NodeCacheProvider();
    const registry = new InflightRegistry();
    const key = buildCacheKey({
      schemaVersion: 1,
      promptVersion: "1.0.0",
      mode: "weekly_plan",
      payload: { householdSize: 2 },
    });

    let generationCount = 0;
    async function getPlan() {
      const cached = await cache.get<{ planId: string }>(key);
      if (cached) return { data: cached, source: "cache" as const };

      const generated = await registry.getOrCreate(key, async () => {
        generationCount++;
        await new Promise((r) => setTimeout(r, 30));
        return { planId: `p-${generationCount}` };
      });
      await cache.set(key, generated, 60);
      return { data: generated, source: "ai" as const };
    }

    // 3 eşzamanlı istek: hepsi cache boşken gelir → in-flight'a düşmeli, 1 üretim olmalı
    const [r1, r2, r3] = await Promise.all([getPlan(), getPlan(), getPlan()]);
    expect(generationCount).toBe(1);
    expect(r1.data).toEqual(r2.data);
    expect(r2.data).toEqual(r3.data);

    // Üretim bitip cache'e yazıldıktan sonra gelen 4. istek artık cache-hit olmalı
    const r4 = await getPlan();
    expect(r4.source).toBe("cache");
    expect(generationCount).toBe(1); // yeni üretim tetiklenmedi
  });
});
