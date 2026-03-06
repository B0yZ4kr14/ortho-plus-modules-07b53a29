import { Router } from "express";
import { manageAutomation } from "../controllers/estoqueController";

const router = Router();

// Single entry point mapped matching Edge Function structure and encompassing 8 variants
router.post("/automation", manageAutomation);

// Individual legacy fallback points for specific manual requests if unmigrated
router.post("/gerar-pedidos-automaticos", (req, res) => {
  req.body.action = "gerar-pedidos-automaticos";
  manageAutomation(req, res);
});

router.post("/prever-reposicao", (req, res) => {
  req.body.action = "prever-reposicao";
  manageAutomation(req, res);
});

router.post("/send-stock-alerts", (req, res) => {
  req.body.action = "send-stock-alerts";
  manageAutomation(req, res);
});

router.post("/processar-retry-pedidos", (req, res) => {
  req.body.action = "processar-retry-pedidos";
  manageAutomation(req, res);
});

router.post("/enviar-pedido-automatico-api", (req, res) => {
  req.body.action = "enviar-pedido-automatico-api";
  manageAutomation(req, res);
});

router.post("/webhook-confirmacao-pedido", (req, res) => {
  req.body.action = "webhook-confirmacao-pedido";
  manageAutomation(req, res);
});

export default router;
