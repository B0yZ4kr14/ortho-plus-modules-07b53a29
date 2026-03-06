/**
 * Comm Router - Communications API (Agora)
 *
 * Defines HTTP routes and integrates with the controller.
 */

import { Router } from "express";
import { CommController } from "./CommController";

const controller = new CommController();
const router = Router();

// POST /api/comm/agora/token - Generate Video Token (from 'generate-video-token')
router.post("/agora/token", (req, res) =>
  controller.generateVideoToken(req, res),
);

// POST /api/comm/agora/recording - Manage Recording (from 'agora-recording')
router.post("/agora/recording", (req, res) =>
  controller.agoraRecording(req, res),
);

export { router as commRouter };
