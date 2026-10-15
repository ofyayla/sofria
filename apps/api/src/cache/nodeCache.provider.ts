import NodeCache from "node-cache";
import type { CacheProvider, CacheProviderStats } from "./cacheProvider.interface.js";

export class NodeCacheProvider implements CacheProvider {
  private readonly cache: NodeCache;

  constructor(options?: { maxKeys?: number; checkperiod?: number }) {
    this.cache = new NodeCache({
      checkperiod: options?.checkperiod ?? 120,
      maxKeys: options?.maxKeys ?? -1,
      // SDD ~50ms cache-hit hedefi: gereksiz derin klonlamayı atlıyoruz.
      // Riski: dönen nesne çağıran tarafta mutasyona uğratılmamalı (salt-okunur kullanılmalı).
      useClones: false,
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    try {
      return this.cache.set(key, value, ttlSeconds);
    } catch (err) {
      // SDD §1.4: maxKeys aşıldığında node-cache ECACHEFULL fırlatır.
      // Burada sistemi çökertmek yerine bu isteği sessizce cache'siz servis ediyoruz.
      console.warn("⚠️  Cache set başarısız (muhtemelen ECACHEFULL):", (err as Error).message);
      return false;
    }
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  stats(): CacheProviderStats {
    const s = this.cache.getStats();
    return { keyCount: s.keys, hits: s.hits, misses: s.misses };
  }
}
