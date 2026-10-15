/**
 * SDD §1.4 "Stampede koruması": Aynı cacheKey için eşzamanlı gelen istekler,
 * ilk isteğin ürettiği TEK Promise'e abone olur. Beş kullanıcı aynı anda
 * aynı tercihlerle istek atarsa, beşi de aynı üretimin sonucunu bekler —
 * beş ayrı Gemini çağrısı gitmez.
 */
export class InflightRegistry {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  async getOrCreate<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = factory().finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, promise);
    return promise;
  }

  /** Bir isteğin meta.source'unu "ai" mı "inflight" mi diye etiketlemek için — bkz. PlanService. */
  has(key: string): boolean {
    return this.inFlight.has(key);
  }

  get size(): number {
    return this.inFlight.size;
  }
}
