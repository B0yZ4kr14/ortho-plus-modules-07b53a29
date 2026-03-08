import { Router } from "express";
import { SplitPagamentoController } from "./controller";

const controller = new SplitPagamentoController();
const router = Router();

// Config
router.get("/config", (req, res) => controller.getConfig(req, res));
router.put("/config", (req, res) => controller.upsertConfig(req, res));

// Comissões
router.get("/comissoes", (req, res) => controller.listComissoes(req, res));
router.post("/comissoes", (req, res) => controller.createComissao(req, res));

// Transações
router.get("/transacoes", (req, res) => controller.listTransacoes(req, res));

export default router;
