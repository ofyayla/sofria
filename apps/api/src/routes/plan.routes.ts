import { Router } from "express";
import { userPreferencesPayloadSchema } from "@sofria/shared";
import { createPlanController } from "../controllers/plan.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import type { PlanService } from "../services/plan/plan.service.js";

export function createPlanRouter(planService: PlanService): Router {
  const router = Router();
  router.post("/plan", validateBody(userPreferencesPayloadSchema), createPlanController(planService));
  return router;
}
