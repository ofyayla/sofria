import { describe, expect, it } from "vitest";
import { InflightRegistry } from "../../src/cache/inflight.registry.js";

describe("InflightRegistry", () => {
  // SDD §1.4 çıkış kriteri: "5 eşzamanlı istek → 1 üretim"
  it("aynı key için 5 eşzamanlı çağrı yalnızca 1 kez üretim tetikler", async () => {
    const registry = new InflightRegistry();
    let generationCount = 0;

    const generate = async () => {
      generationCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { plan: "üretildi", generationId: generationCount };
    };

    const results = await Promise.all(
      Array.from({ length: 5 }, () => registry.getOrCreate("same-key", generate))
    );

    expect(generationCount).toBe(1);
    expect(results).toHaveLength(5);
    for (const result of results) {
      expect(result).toEqual({ plan: "üretildi", generationId: 1 });
    }
  });

  it("farklı key'ler için ayrı ayrı üretim tetiklenir", async () => {
    const registry = new InflightRegistry();
    let generationCount = 0;
    const generate = async () => {
      generationCount++;
      return generationCount;
    };

    await Promise.all([
      registry.getOrCreate("key-a", generate),
      registry.getOrCreate("key-b", generate),
    ]);

    expect(generationCount).toBe(2);
  });

  it("üretim tamamlanınca registry'den temizlenir (TTL sonrası yeniden üretilebilir)", async () => {
    const registry = new InflightRegistry();
    await registry.getOrCreate("key-x", async () => "sonuç");
    expect(registry.size).toBe(0);
  });

  it("üretim hata verirse registry yine temizlenir, kilitlenmez", async () => {
    const registry = new InflightRegistry();
    await expect(
      registry.getOrCreate("key-fail", async () => {
        throw new Error("Gemini timeout");
      })
    ).rejects.toThrow("Gemini timeout");
    expect(registry.size).toBe(0);

    // Aynı key ile ikinci deneme yeni bir üretim başlatabilmeli (kilitli kalmamalı).
    const result = await registry.getOrCreate("key-fail", async () => "ikinci deneme başarılı");
    expect(result).toBe("ikinci deneme başarılı");
  });
});
