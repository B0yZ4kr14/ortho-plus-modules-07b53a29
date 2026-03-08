import { Router } from "express";
import { FidelidadeController } from "./controller";

const controller = new FidelidadeController();
const router = Router();

// Pontos
router.get("/pontos", (req, res) => controller.getPoints(req, res));
router.post("/pontos", (req, res) => controller.addPoints(req, res));

// Badges
router.get("/badges", (req, res) => controller.listBadges(req, res));
router.post("/badges", (req, res) => controller.createBadge(req, res));

// Recompensas
router.get("/recompensas", (req, res) => controller.listRecompensas(req, res));
router.post("/recompensas", (req, res) => controller.createRecompensa(req, res));

// Indicações
router.get("/indicacoes", (req, res) => controller.listIndicacoes(req, res));
router.post("/indicacoes", (req, res) => controller.createIndicacao(req, res));

export default router;
