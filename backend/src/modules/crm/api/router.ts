import { Router } from "express";
import { CRMController } from "./controller";

const controller = new CRMController();
const router = Router();

router.get("/leads", (req, res) => controller.listLeads(req, res));
router.get("/leads/:id", (req, res) => controller.getLeadById(req, res));
router.post("/leads", (req, res) => controller.createLead(req, res));
router.patch("/leads/:id", (req, res) => controller.updateLead(req, res));
router.delete("/leads/:id", (req, res) => controller.deleteLead(req, res));

export default router;
