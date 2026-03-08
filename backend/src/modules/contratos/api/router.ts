import { Router } from "express";
import { ContratosController } from "./controller";

const controller = new ContratosController();
const router = Router();

router.get("/", (req, res) => controller.list(req, res));
router.get("/templates", (req, res) => controller.listTemplates(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
