import { Router } from "express";
import {
  applyModuleTemplate,
  getMyModules,
  suggestModules,
  toggleModuleState,
  recommendModuleSequence,
  importClinicData,
  exportClinicData
} from "../controllers/moduleController";

const modulesRouter = Router();

// Module Management Routes
modulesRouter.post("/apply-template", applyModuleTemplate);
modulesRouter.get("/my-modules", getMyModules);
modulesRouter.post("/suggest", suggestModules);
modulesRouter.post("/toggle", toggleModuleState);
modulesRouter.post("/recommend-sequence", recommendModuleSequence);

// Data Import/Export Routes
modulesRouter.post("/import-data", importClinicData);
modulesRouter.get("/export-data", exportClinicData);

export default modulesRouter;
