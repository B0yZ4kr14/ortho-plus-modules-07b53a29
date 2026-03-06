import { Router } from "express";
import { NotificationController } from "./notificationController";

const router = Router();
const controller = new NotificationController();

// Create new notification explicitly
router.post("/create", controller.createNotification.bind(controller));

// Automated background checks (cron jobs or triggered events)
router.post("/auto", controller.runAutoNotifications.bind(controller));
router.post(
  "/check-volatility",
  controller.checkVolatilityAlerts.bind(controller),
);
router.post(
  "/check-crypto-price",
  controller.checkCryptoPriceAlerts.bind(controller),
);
router.post(
  "/send-replenishment",
  controller.sendReplenishmentAlerts.bind(controller),
);
router.post("/send-stock", controller.sendStockAlerts.bind(controller));

export default router;
