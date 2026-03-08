import { Router } from "express";
import { MarketingController } from "./controller";

const controller = new MarketingController();
const router = Router();

// Campanhas
router.get("/campanhas", (req, res) => controller.listCampanhas(req, res));
router.get("/campanhas/:id", (req, res) => controller.getCampanhaById(req, res));
router.post("/campanhas", (req, res) => controller.createCampanha(req, res));
router.patch("/campanhas/:id", (req, res) => controller.updateCampanha(req, res));

// Envios
router.get("/envios", (req, res) => controller.listEnvios(req, res));
router.post("/envios", (req, res) => controller.createEnvio(req, res));

// Recalls
router.get("/recalls", (req, res) => controller.listRecalls(req, res));
router.post("/recalls", (req, res) => controller.createRecall(req, res));

export default router;
