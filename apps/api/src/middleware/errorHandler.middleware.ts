import type { NextFunction, Request, Response } from "express";
import type { ErrorCode } from "@sofria/shared";
import { isAppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

/** SDD §1.5 Hata Yönetimi Matrisi ile birebir eşleşir. */
const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  UPSTREAM_TIMEOUT: 504,
  UPSTREAM_UNAVAILABLE: 503,
  MALFORMED_AI_RESPONSE: 502,
  BUSINESS_RULE_VIOLATION: 422,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export function errorHandlerMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId ?? "unknown";
  const latencyMs = req.startTime ? Date.now() - req.startTime : 0;

  if (isAppError(err)) {
    const status = STATUS_BY_CODE[err.code];
    // 5xx'ler beklenmedik/altyapısal durumlar — sunucu logunda görünür kalmalı.
    // 4xx'ler (VALIDATION_ERROR, RATE_LIMITED, NOT_FOUND, BUSINESS_RULE_VIOLATION)
    // zaten kullanıcı hatası, gürültü yapmasın diye loglanmaz.
    if (status >= 500) {
      logger.error("request_failed", { requestId, code: err.code, message: err.message });
    }
    res.status(status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        retryable: err.retryable,
        ...(err.retryAfterSec !== undefined ? { retryAfterSec: err.retryAfterSec } : {}),
      },
      meta: { requestId, latencyMs },
    });
    return;
  }

  console.error("Beklenmeyen hata:", err);
  res.status(500).json({
    ok: false,
    error: { code: "INTERNAL_ERROR", message: "Beklenmeyen bir hata oluştu.", retryable: true },
    meta: { requestId, latencyMs },
  });
}
