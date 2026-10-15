/**
 * SDD §1.4: Bu arayüz sağlayıcıdan bağımsızdır. node-cache tek instance için
 * yeterlidir; birden fazla instance'a çıkıldığında bu arayüzü implemente eden
 * bir RedisCacheProvider yazılır — çağıran servis kodu (PlanService, F5)
 * hiç değişmez.
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | undefined>;
  /** @returns Kayıt gerçekten yazıldıysa true; bellek sınırı gibi bir sebeple atlandıysa false. */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<boolean>;
  del(key: string): Promise<void>;
  stats(): CacheProviderStats;
}

export interface CacheProviderStats {
  keyCount: number;
  hits: number;
  misses: number;
}
