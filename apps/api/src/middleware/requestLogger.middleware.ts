import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

/** Yanıt gönderildiğinde (finish event) method/path/status/latency'yi tek satır JSON olarak loglar. */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    logger.info("http_request", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latencyMs: req.startTime ? Date.now() - req.startTime : undefined,
    });
  });
  next();
}
