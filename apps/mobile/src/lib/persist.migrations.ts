/**
 * SDD §4.3: "Şema göçü: persist middleware `version` + `migrate` ile;
 * v1→v2 geçişinde bozuk kayıt sessizce sıfırlanır."
 *
 * Her store kendi `migrations` haritasını tanımlar: anahtar, KAYNAK sürüm
 * (persisted state'in geldiği sürüm), değer ise onu bir sonraki sürüme
 * taşıyan dönüşüm fonksiyonudur. Zincir, hedef sürüme ulaşana kadar
 * otomatik ilerler (v0→v1→v2...). Web'deki persist.migrations.ts ile
 * birebir aynı — mobil kendi AsyncStorage kayıtları için de bu deseni kullanır.
 */
export type MigrationMap = Record<number, (oldState: unknown) => unknown>;

export function createMigrate<T>(migrations: MigrationMap, fallback: T) {
  return (persistedState: unknown, fromVersion: number): T => {
    try {
      let state = persistedState;
      let version = fromVersion;

      while (migrations[version]) {
        state = migrations[version]!(state);
        version++;
      }

      if (state === null || state === undefined || typeof state !== "object") {
        return fallback;
      }
      return state as T;
    } catch (err) {
      // Bozuk/beklenmeyen şekilli kayıt — kullanıcıya hata göstermek yerine
      // sessizce temiz bir başlangıç durumuna dön (SDD §4.3).
      console.warn(`Store göçü başarısız (kaynak sürüm: v${fromVersion}), varsayılana dönülüyor:`, err);
      return fallback;
    }
  };
}
