import { Request, Response } from "express";

import Pdf from "../models/pdf.model";
import { analyzePdf } from "../services/pdf-ai.service";

export const uploadPdfController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const pdf = await Pdf.create({
      user: req.user._id,

      originalName: req.file.originalname,

      storedName: req.file.filename,

      filePath: req.file.path,

      mimeType: req.file.mimetype,

      size: req.file.size,

      status: "processing",
    });

    try {
      const analysis = await analyzePdf(
        req.file.path
      );

      pdf.title = analysis.title;

      pdf.summary = analysis.summary;

      pdf.difficulty = analysis.difficulty;

      pdf.topics = analysis.topics;

      pdf.keyConcepts = analysis.keyConcepts;

      pdf.importantDefinitions =
        analysis.importantDefinitions;

      pdf.status = "completed";

      await pdf.save();

      return res.status(201).json({
        success: true,

        message:
          "PDF uploaded and analyzed successfully.",

        data: {
          pdf,
        },
      });
    } catch (aiError) {
      console.error(
        "AI PDF Processing Error:",
        aiError
      );

      pdf.status = "failed";

      await pdf.save();

      return res.status(500).json({
        success: false,
        message:
          "PDF uploaded, but AI analysis failed.",
        data: {
          pdfId: pdf._id,
        },
      });
    }
  } catch (error) {
    console.error(
      "Upload PDF Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process PDF.",
    });
  }
};