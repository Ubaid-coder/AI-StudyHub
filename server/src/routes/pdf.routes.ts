import { Router } from "express";

import {
  uploadPdfController,
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

export default router;