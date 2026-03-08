import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/token", authController.login);
router.post("/patient-auth", authController.patientAuth);
router.get("/user", authController.getUser);
router.get("/user/:id/metadata", authController.getUserMetadata);
router.get("/me", authController.getUser);
router.post("/logout", authController.logout);

export default router;
