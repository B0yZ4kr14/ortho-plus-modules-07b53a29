import { Router } from "express";
import { UsuariosController } from "./usuariosController";

const router = Router();
const controller = new UsuariosController();

router.get("/", (req, res) => controller.list(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.patch("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));
router.post("/:id/toggle-active", (req, res) =>
  controller.toggleActive(req, res),
);

// Endpoint for own profile
router.patch("/me/profile", (req, res) => controller.updateProfile(req, res));

export default router;
