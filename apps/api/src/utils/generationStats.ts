/**
 * SDD §1.4 CacheStats.avgGenerationMs için: yalnızca GERÇEK üretimlerde
 * (source==="ai") kaydedilir — cache-hit/inflight/stale süreleri buraya
 * karışmaz, aksi halde ortalama yanıltıcı olurdu.
 */
export class GenerationStatsTracker {
  private totalMs = 0;
  private count = 0;

  record(ms: number): void {
    this.totalMs += ms;
    this.count++;
  }

  getAverage(): number {
    return this.count === 0 ? 0 : Math.round(this.totalMs / this.count);
  }

  get sampleCount(): number {
    return this.count;
  }
}
