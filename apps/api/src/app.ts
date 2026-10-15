import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import type { CacheProvider } from "./cache/cacheProvider.interface.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.middleware.js";
import { createRateLimiter, type RateLimitOptions } from "./middleware/rateLimit.middleware.js";
import { requestContextMiddleware } from "./middleware/requestContext.middleware.js";
import { requestLoggerMiddleware } from "./middleware/requestLogger.middleware.js";
import { createHealthRouter } from "./routes/health.routes.js";
import { createIngredientsRouter } from "./routes/ingredients.routes.js";
import { createPlanRouter } from "./routes/plan.routes.js";
import type { PlanService } from "./services/plan/plan.service.js";

export interface AppDeps {
  planService: PlanService;
  /** F11: /health/cache paneli için — PlanService'in kullandığı AYNI cache örneği olmalı. */
  cache: CacheProvider;
  /** Test/geliştirme ortamında düşürülebilir; varsayılan SDD §1 env değerleriyle eşleşir. */
  rateLimit?: RateLimitOptions;
}

/**
 * Bağımlılık enjeksiyonu ile kurulur: testler gerçek env/ağ/Gemini'ye hiç
 * dokunmadan, MockLLMProvider ile oluşturulmuş servisleri enjekte ederek bu
 * fonksiyonu çağırabilir. Gerçek sunucu (server.ts) burayı gerçek
 * GeminiProvider ile çağırır.
 */
export function createApp(deps: AppDeps): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestContextMiddleware);
  app.use(requestLoggerMiddleware);

  app.get("/api/v1/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });
  app.use("/api/v1", createHealthRouter(deps.cache));

  const rateLimiter = createRateLimiter(deps.rateLimit ?? { windowMs: 60_000, max: 20 });
  app.use("/api/v1", rateLimiter);
  app.use("/api/v1", createIngredientsRouter());
  app.use("/api/v1", createPlanRouter(deps.planService));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      ok: false,
      error: { code: "NOT_FOUND", message: "İstenen kaynak bulunamadı.", retryable: false },
    });
  });

  app.use(errorHandlerMiddleware);

  return app;
}
