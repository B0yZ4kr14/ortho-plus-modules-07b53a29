import { Router } from "express";
import { FaturamentoController } from "./FaturamentoController";
import { GamificationWorkerController } from "./gamificationWorker";

export function createFaturamentoRouter(): Router {
  const router = Router();
  const controller = new FaturamentoController();

  router.post("/nfes", (req, res) => controller.createNFe(req, res));
  router.get("/nfes", (req, res) => controller.listNFes(req, res));
  router.post("/nfes/:id/autorizar", (req, res) =>
    controller.autorizarNFe(req, res),
  );
  router.post("/nfes/:id/cancelar", (req, res) =>
    controller.cancelarNFe(req, res),
  );

  // Gamification Worker
  const gamificationWorker = new GamificationWorkerController();
  router.post("/gamification/process", (req, res) =>
    gamificationWorker.processGoalsAndRankings(req, res),
  );

  return router;
}
