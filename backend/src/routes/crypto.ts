import { Router } from "express";
import {
  convertCryptoToBrl,
  createCryptoInvoice,
  getCryptoManagerStatus,
  getCryptoRates,
  handleCryptoWebhook,
  manageOfflineWallet,
  runCryptoJobs,
  syncCryptoWallet,
  validateXpub,
} from "../controllers/cryptoController";

const router = Router();

router.post("/convert", convertCryptoToBrl);
router.post("/invoice", createCryptoInvoice);
router.get("/manager/status", getCryptoManagerStatus);
router.get("/rates", getCryptoRates);
router.post("/wallet/sync", syncCryptoWallet);
router.post("/wallet/validate-xpub", validateXpub);
router.post("/webhook", handleCryptoWebhook);
router.post("/wallet/offline", manageOfflineWallet);
router.post("/jobs/execute", runCryptoJobs);

export default router;
