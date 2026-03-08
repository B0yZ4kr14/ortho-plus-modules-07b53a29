import { Router } from "express";
import { InadimplenciaController } from "./controller";

const controller = new InadimplenciaController();
const router = Router();

// Inadimplentes
router.get("/inadimplentes", (req, res) => controller.listInadimplentes(req, res));
router.get("/inadimplentes/:id", (req, res) => controller.getInadimplente(req, res));
router.patch("/inadimplentes/:id", (req, res) => controller.updateInadimplente(req, res));

// Campanhas de cobrança
router.get("/campanhas", (req, res) => controller.listCampanhasCobranca(req, res));
router.post("/campanhas", (req, res) => controller.createCampanhaCobranca(req, res));
router.patch("/campanhas/:id", (req, res) => controller.updateCampanhaCobranca(req, res));

export default router;
