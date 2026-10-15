import { randomUUID } from "node:crypto";
import {
  PROMPT_VERSION,
  SCHEMA_VERSION,
  weeklyPlanResponseSchema,
  type ApiMeta,
  type DayPlan,
  type WeeklyPlanResponse,
  type UserPreferencesPayload,
} from "@sofria/shared";
import type { CacheProvider } from "../../cache/cacheProvider.interface.js";
import { buildCacheKey } from "../../cache/cacheKey.builder.js";
import type { InflightRegistry } from "../../cache/inflight.registry.js";
import { computePlanWeek } from "../../domain/weekDates.js";
import { AppError } from "../../errors/AppError.js";
import type { LLMProvider } from "../llm/llmProvider.interface.js";
import { buildCatalogPlan } from "./catalogPlanBuilder.js";
import { normalizePreferences } from "./normalizer.js";
import { buildPlanSummary } from "./planSummary.js";
import { buildShoppingList } from "./shoppingList.builder.js";
import { metrics } from "../../utils/metrics.js";
import type { GenerationStatsTracker } from "../../utils/generationStats.js";

export interface PlanServiceDeps {
  /**
   * Gerçek kullanıcı talebi: haftalık plan artık LLM'in serbestçe uydurduğu
   * tariflerden değil, sabit RECIPE_CATALOG'dan deterministik seçimle
   * oluşuyor (bkz. catalogPlanBuilder.ts) — bu yüzden `provider` artık
   * generateValidatedPlan içinde KULLANILMIYOR. Alan; server.ts/testlerdeki
   * mevcut kurulumu bozmamak için (ve olası ileride LLM destekli bir
   * özelliğe geri dönüş için) şimdilik korunuyor.
   */
  provider: LLMProvider;
  cache: CacheProvider;
  /** SDD §1.4 "stale-while-error" mezarlık haritası. */
  staleCache: CacheProvider;
  inflight: InflightRegistry;
  cacheTtlSeconds: number;
  staleCacheTtlSeconds: number;
  retry?: { maxAttempts: number; baseDelayMs: number };
  generationStats?: GenerationStatsTracker;
}

export interface GeneratePlanResult {
  data: WeeklyPlanResponse;
  meta: ApiMeta;
}

export class PlanService {
  constructor(private readonly deps: PlanServiceDeps) {}

  /**
   * normalize → cacheKey → cache-hit? → in-flight? → katalogdan deterministik
   * seçim (bkz. catalogPlanBuilder.ts) → shoppingList → cache'e yaz → döndür.
   * Kısıtlar (diyet/ekipman/süre) seçimden ÖNCE filtre olarak uygulandığı
   * için post-check/düzeltme turuna gerek YOK — ihlal üretilmesi mümkün değil.
   */
  async generatePlan(payload: UserPreferencesPayload, requestId: string): Promise<GeneratePlanResult> {
    const start = Date.now();
    const canonicalPayload = normalizePreferences(payload);
    const cacheKey = buildCacheKey({
      schemaVersion: SCHEMA_VERSION,
      promptVersion: PROMPT_VERSION,
      mode: "weekly_plan",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: canonicalPayload as any,
    });

    const cached = await this.deps.cache.get<WeeklyPlanResponse>(cacheKey);
    if (cached) {
      return { data: withFreshDates(cached), meta: this.buildMeta({ requestId, source: "cache", cacheKey, start }) };
    }

    // NOT: has() ile getOrCreate() arasında await yok — aynı senkron çağrı
    // yığınında çalıştığı için race condition oluşmaz (bkz. InflightRegistry).
    const wasAlreadyInFlight = this.deps.inflight.has(cacheKey);

    let plan: WeeklyPlanResponse;
    let degraded = false;

    try {
      plan = await this.deps.inflight.getOrCreate(cacheKey, () => this.generateValidatedPlan(canonicalPayload));
    } catch (err) {
      // SDD §1.2: "Hâlâ başarısız → stale-cache var mı? → var: degraded:true ile servis et."
      const stale = isRetryableUpstreamError(err) ? await this.deps.staleCache.get<WeeklyPlanResponse>(cacheKey) : undefined;
      if (!stale) throw err;
      plan = stale;
      degraded = true;
      metrics.recordStaleServe();
    }

    await this.deps.cache.set(cacheKey, plan, this.deps.cacheTtlSeconds);
    // Bayat kayıtla servis ederken mezarlığı YENİDEN YAZMIYORUZ — orası zaten
    // "son gerçek başarılı üretim" anlamına geliyor, bayat veriyle üzerine yazılmaz.
    if (!degraded) {
      await this.deps.staleCache.set(cacheKey, plan, this.deps.staleCacheTtlSeconds);
      if (!wasAlreadyInFlight) metrics.recordGeneration(Date.now() - start);
    }

    const source = degraded ? "stale" : wasAlreadyInFlight ? "inflight" : "ai";
    // SDD §1.4: yalnızca GERÇEK üretimlerde (source==="ai") süre kaydedilir.
    if (source === "ai") this.deps.generationStats?.record(Date.now() - start);

    return {
      // Cache/stale kaynaklı bir plan bile GÜNCEL tarihleri alır — dün
      // önbelleklenmiş bir plan bugün açılınca hâlâ dünün "yarın"ını
      // göstermesin diye her dönüşte yeniden damgalanır (bkz. weekDates.ts).
      data: withFreshDates(plan),
      meta: this.buildMeta({ requestId, source, cacheKey, start, degraded }),
    };
  }

  // async imza korunuyor: inflight.getOrCreate ve çağıranlar Promise bekliyor.
  private async generateValidatedPlan(payload: UserPreferencesPayload): Promise<WeeklyPlanResponse> {
    const days = buildCatalogPlan(payload);

    const shoppingList = buildShoppingList(days);
    const summary = buildPlanSummary(days, payload);

    const fullPlan: WeeklyPlanResponse = { planId: randomUUID(), days: withPlanDates(days), shoppingList, summary };

    // Son bir güvenlik ağı: bizim kendi kodumuzun bir araya getirdiği nihai
    // nesne bile SDD §3.3 sözleşmesine tam uyuyor mu, gerçekten kontrol et.
    const validated = weeklyPlanResponseSchema.safeParse(fullPlan);
    if (!validated.success) {
      throw new AppError(
        "INTERNAL_ERROR",
        `Sunucu tarafında birleştirilen plan kendi şemasına uymuyor: ${JSON.stringify(validated.error.flatten())}`,
        { retryable: false }
      );
    }

    return validated.data;
  }

  private buildMeta(params: {
    requestId: string;
    source: ApiMeta["source"];
    cacheKey: string;
    start: number;
    degraded?: boolean;
  }): ApiMeta {
    return {
      requestId: params.requestId,
      source: params.source,
      latencyMs: Date.now() - params.start,
      cacheKey: params.cacheKey,
      schemaVersion: SCHEMA_VERSION,
      promptVersion: PROMPT_VERSION,
      generatedAt: new Date().toISOString(),
      ...(params.degraded ? { degraded: true } : {}),
    };
  }
}

/** LLM'in ham `days` çıktısına gerçek takvim tarihi (ve dayIndex'e göre gerçek gün adı) enjekte eder. */
function withPlanDates(days: DayPlan[]): WeeklyPlanResponse["days"] {
  const week = computePlanWeek(days.length);
  const byIndex = new Map(week.map((w) => [w.dayIndex, w]));
  return days.map((day) => {
    const w = byIndex.get(day.dayIndex);
    return w ? { ...day, date: w.date, dayName: w.dayName } : { ...day, date: "" };
  });
}

/** Zaten oluşturulmuş bir plana (cache/stale dahil) ŞU ANA göre GÜNCEL tarihleri yeniden damgalar. */
function withFreshDates(plan: WeeklyPlanResponse): WeeklyPlanResponse {
  return { ...plan, days: withPlanDates(plan.days) };
}

/** UPSTREAM_TIMEOUT/UPSTREAM_UNAVAILABLE dışındaki hatalarda (örn. BUSINESS_RULE_VIOLATION) stale fallback denenmez. */
function isRetryableUpstreamError(err: unknown): boolean {
  return err instanceof AppError && (err.code === "UPSTREAM_TIMEOUT" || err.code === "UPSTREAM_UNAVAILABLE");
}
