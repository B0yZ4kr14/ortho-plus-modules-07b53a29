import { Router } from "express";
import { AnalyticsController } from "./analyticsController";

const router = Router();
const controller = new AnalyticsController();

// Relatórios consolidados
router.get(
  "/dashboard-overview",
  controller.getDashboardOverview.bind(controller),
);
router.get("/unified-metrics", controller.getUnifiedMetrics.bind(controller));
router.get("/marketing-roi", controller.getMarketingROI.bind(controller));

// Ponto unificado de processamento de analises e background events
router.post("/processor", controller.processAnalytics.bind(controller));

export default router;
