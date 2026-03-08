import { Router } from "express";
import { BIController } from "./controller";

const controller = new BIController();
const router = Router();

// Dashboards
router.get("/dashboards", (req, res) => controller.listDashboards(req, res));
router.get("/dashboards/:id", (req, res) => controller.getDashboardById(req, res));
router.post("/dashboards", (req, res) => controller.createDashboard(req, res));
router.patch("/dashboards/:id", (req, res) => controller.updateDashboard(req, res));

// Metricas
router.get("/metricas", (req, res) => controller.getMetricas(req, res));

// Widgets (nested under dashboards)
router.get("/dashboards/:dashboard_id/widgets", (req, res) => controller.listWidgets(req, res));
router.post("/dashboards/:dashboard_id/widgets", (req, res) => controller.createWidget(req, res));
router.patch("/widgets/:id", (req, res) => controller.updateWidget(req, res));
router.delete("/widgets/:id", (req, res) => controller.deleteWidget(req, res));

export default router;
