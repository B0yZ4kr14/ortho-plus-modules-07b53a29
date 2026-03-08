import { Router } from "express";
import multer from "multer";

// Configure multer storage (for local testing/uploads)
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/"); // Assumes an existing 'uploads' repo dir
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

import { FilesController } from "./filesController";
import { ReportController } from "./reportController";

const router = Router();
const filesController = new FilesController();
const reportController = new ReportController();

// ----------------------------------------
// generic File Upload routes
// ----------------------------------------
// Handles basic file uploads using local storage
router.post(
  "/upload",
  upload.single("file"),
  filesController.uploadFile.bind(filesController),
);
router.post(
  "/upload-cloud",
  filesController.uploadBackupToCloud.bind(filesController),
);

// ----------------------------------------
// Report & Document routes
// ----------------------------------------
router.post(
  "/report/export",
  reportController.exportClinicData.bind(reportController),
);
router.post(
  "/report/import",
  reportController.importClinicData.bind(reportController),
);
router.post(
  "/report/pdf",
  reportController.createDocumentPdf.bind(reportController),
);

export default router;
