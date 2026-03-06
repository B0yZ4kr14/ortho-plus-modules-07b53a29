import { Router } from "express";
import {
  manageFinanceiroJobs,
  sincronizarExtratoBancario,
  sugerirSangriaIa,
} from "../controllers/financeiroController";

const router = Router();

router.post("/extratos/sync", sincronizarExtratoBancario);
router.post("/caixa/sugerir-sangria-ia", sugerirSangriaIa);
router.post("/jobs/execute", manageFinanceiroJobs);

export default router;
