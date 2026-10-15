import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

/**
 * SDD §1.5: RATE_LIMITED → 429, retryAfterSec ile. express-rate-limit'in
 * varsayılan JSON formatı yerine kendi ApiResponse sözleşmemize uyan bir
 * yanıt döndürür.
 */
export function createRateLimiter(options: RateLimitOptions) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
          retryable: true,
          retryAfterSec: Math.ceil(options.windowMs / 1000),
        },
        meta: { requestId: req.requestId ?? "unknown", latencyMs: 0 },
      });
    },
  });
}
