import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/token", authController.login);
router.get("/user", authController.getUser);
router.post("/logout", authController.logout);

export default router;
