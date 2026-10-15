/**
 * SDD §1.4 CacheStats: staleServeCount ve avgGenerationMs, NodeCacheProvider'ın
 * kendi stats()'ından çıkarılamaz (o yalnızca hit/miss/keyCount bilir) — bu
 * modül o iki metriği ayrıca tutar. Süreç yeniden başlayınca sıfırlanır,
 * kalıcı bir metrik deposu değildir — F11 kapsamında bu kadarı yeterli.
 */
class Metrics {
  private staleServeCount = 0;
  private totalGenerationMs = 0;
  private generationCount = 0;

  recordStaleServe(): void {
    this.staleServeCount++;
  }

  recordGeneration(latencyMs: number): void {
    this.totalGenerationMs += latencyMs;
    this.generationCount++;
  }

  get staleServes(): number {
    return this.staleServeCount;
  }

  get avgGenerationMs(): number {
    return this.generationCount === 0 ? 0 : Math.round(this.totalGenerationMs / this.generationCount);
  }
}

export const metrics = new Metrics();
