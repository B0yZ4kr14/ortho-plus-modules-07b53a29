import { Router } from "express";
import {
  enviarCobranca,
  processarPagamento,
  processarPagamentoTef,
  processarSplitPagamento,
} from "../controllers/paymentController";

const router = Router();

router.post("/cobranca/enviar", enviarCobranca);
router.post("/processar", processarPagamento);
router.post("/processar/tef", processarPagamentoTef);
router.post("/processar/split", processarSplitPagamento);

export default router;
