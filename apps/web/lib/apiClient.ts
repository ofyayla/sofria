import {
  apiResponseSchema,
  weeklyPlanResponseSchema,
  type ApiResponse,
  type UserPreferencesPayload,
  type WeeklyPlanResponse,
} from "@sofria/shared";
import type { z } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

/**
 * Yanıt yalnızca backend'in Zod şemasına değil, İSTEMCİNİN de aynı
 * `@sofria/shared` şemasına karşı doğrulanır — SDD §2.2'nin "tek doğruluk
 * kaynağı" ilkesinin üçüncü kullanım yeri (backend doğrulama, LLM şeması,
 * frontend doğrulama).
 */
async function postJson<TReq, TRes>(
  path: string,
  body: TReq,
  responseSchema: z.ZodType<TRes>
): Promise<ApiResponse<TRes>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // Sunucu (veya araya giren bir proxy) JSON olmayan bir gövde döndürebilir
  // (ör. sunucu tamamen erişilemezken ham bir hata metni) — bu durumda ham
  // JSON.parse hatasını kullanıcıya sızdırmak yerine anlaşılır bir mesaj ver.
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Sunucudan geçerli bir yanıt alınamadı. Lütfen tekrar deneyin.");
  }
  const parsed = apiResponseSchema(responseSchema).safeParse(json);

  if (!parsed.success) {
    throw new Error(`API yanıtı beklenen şemaya uymuyor: ${parsed.error.message}`);
  }

  // NOT: apiResponseSchema<T> dinamik bir factory olduğu için Zod'un jenerik
  // çıkarımı burada tam netleşmiyor (bilinen bir Zod sınırlaması) — bu yüzden
  // cast'i erken uyguluyoruz, aşağıdaki `data.ok` daralması ancak böyle doğru çalışıyor.
  const data = parsed.data as ApiResponse<TRes>;

  // KRİTİK DÜZELTME: sunucu {ok:false, error:...} döndürdüğünde (VALIDATION_ERROR,
  // BUSINESS_RULE_VIOLATION, UPSTREAM_UNAVAILABLE vb.) bu şema açısından geçerli
  // bir yanıttır — fırlatılmazsa react-query bunu "başarılı" sanır ve sayfa
  // sessizce boş sonuç gösterir, kullanıcı hiçbir hata görmez.
  if (!data.ok) {
    throw new Error(data.error.message);
  }

  return data;
}

export function generatePlan(payload: UserPreferencesPayload): Promise<ApiResponse<WeeklyPlanResponse>> {
  return postJson("/plan", payload, weeklyPlanResponseSchema);
}
