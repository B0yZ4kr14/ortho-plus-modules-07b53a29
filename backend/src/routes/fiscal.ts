import { Router } from "express";
import {
  autorizarNfceSefaz,
  cartaCorrecaoNfce,
  emitirNfce,
  enviarDadosContabilidade,
  gerarSpedFiscal,
  imprimirCupomSat,
  inutilizarNumeracaoNfce,
  sincronizarNfceContingencia,
  validateFiscalXml,
} from "../controllers/fiscalController";

const router = Router();

router.post("/nfce/autorizar", autorizarNfceSefaz);
router.post("/nfce/carta-correcao", cartaCorrecaoNfce);
router.post("/nfce/emitir", emitirNfce);
router.post("/nfce/inutilizar", inutilizarNumeracaoNfce);
router.post("/nfce/contingencia", sincronizarNfceContingencia);

router.post("/validate-xml", validateFiscalXml);
router.post("/sat/imprimir", imprimirCupomSat);
router.post("/sped", gerarSpedFiscal);
router.post("/contabilidade/enviar", enviarDadosContabilidade);

export default router;
