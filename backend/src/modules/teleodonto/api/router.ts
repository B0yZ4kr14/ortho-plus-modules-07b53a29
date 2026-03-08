import { Router } from "express";
import { TeleodontoController } from "./controller";

const controller = new TeleodontoController();
const router = Router();

router.get("/teleconsultas", (req, res) => controller.listTeleconsultas(req, res));
router.get("/teleconsultas/:id", (req, res) => controller.getById(req, res));
router.post("/teleconsultas", (req, res) => controller.create(req, res));
router.patch("/teleconsultas/:id", (req, res) => controller.update(req, res));

export default router;
