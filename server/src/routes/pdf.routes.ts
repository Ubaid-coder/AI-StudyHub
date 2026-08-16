import { Router } from "express";

import {
  uploadPdfController,
  getUserPdfsController,
  getPdfByIdController,
  askPdfTutorController,
} from "../controllers/pdf.controller";

import { protect } from "../middleware/auth.middleware";

import { uploadPdf } from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/",
  protect,
  uploadPdf.single("pdf"),
  uploadPdfController
);

router.get(
  "/",
  protect,
  getUserPdfsController
);
router.post(
  "/:id/ask",
  protect,
  askPdfTutorController
);

router.get(
  "/:id",
  protect,
  getPdfByIdController
);


export default router;