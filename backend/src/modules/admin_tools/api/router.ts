import { Router } from "express";
import { AdminToolsController } from "./controller";

const controller = new AdminToolsController();
const router = Router();

// ADRs
router.get("/adrs", (req, res) => controller.listADRs(req, res));
router.post("/adrs", (req, res) => controller.createADR(req, res));

// Wiki
router.get("/wiki", (req, res) => controller.listWiki(req, res));
router.post("/wiki", (req, res) => controller.createWikiEntry(req, res));
router.patch("/wiki/:id", (req, res) => controller.updateWikiEntry(req, res));

export default router;
