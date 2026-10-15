import type { NextFunction, Request, Response } from "express";

/**
 * SDD roadmap F11: "yapılandırılmış log". Serbest metin yerine tek satır
 * JSON — production'da log toplayıcıya (ör. CloudWatch, Datadog) doğrudan
 * parse edilebilir gider. requestId ile requestContextMiddleware'deki ile
 * eşleşir, tek bir isteği uçtan uca izlemeyi sağlar.
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    const entry = {
      level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      latencyMs: req.startTime ? Date.now() - req.startTime : undefined,
      timestamp: new Date().toISOString(),
    };
    console.warn(JSON.stringify(entry));
  });
  next();
}
