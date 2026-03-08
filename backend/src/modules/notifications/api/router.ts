import { Request, Response, Router } from "express";
import { NotificationController } from "./notificationController";

const router = Router();
const controller = new NotificationController();

// GET / - List notifications (used by useNotifications hook)
router.get("/", (_req: Request, res: Response) => {
  res.json({ notifications: [] });
});

// PATCH /:id/read - Mark single notification as read
router.patch("/:id/read", (req: Request, res: Response) => {
  res.json({ success: true, id: req.params.id });
});

// POST /mark-all-read - Mark all notifications as read
router.post("/mark-all-read", (_req: Request, res: Response) => {
  res.json({ success: true });
});

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
