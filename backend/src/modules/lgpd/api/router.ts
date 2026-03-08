import { Router } from "express";
import { LGPDController } from "./controller";

const controller = new LGPDController();
const router = Router();

// Consentimentos
router.get("/consentimentos", (req, res) => controller.listConsentimentos(req, res));
router.post("/consentimentos", (req, res) => controller.createConsentimento(req, res));

// Solicitações
router.get("/solicitacoes", (req, res) => controller.listSolicitacoes(req, res));
router.post("/solicitacoes", (req, res) => controller.createSolicitacao(req, res));
router.patch("/solicitacoes/:id", (req, res) => controller.updateSolicitacao(req, res));

export default router;
