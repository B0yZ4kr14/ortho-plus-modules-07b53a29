import { Router } from "express";
import { DatabaseAdminController } from "./DatabaseAdminController";

const router = Router();
const databaseAdminController = new DatabaseAdminController();

// /api/db/maintenance
router.post("/maintenance", databaseAdminController.runMaintenance);

// /api/db/health
router.get("/health", databaseAdminController.getHealth);

// /api/db/audit_logs
router.get("/audit_logs", databaseAdminController.getAuditLogs);

export default router;
