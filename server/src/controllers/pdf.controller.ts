import { Request, Response } from "express";
import mongoose from "mongoose";
import Pdf from "../models/pdf.model";
import { analyzePdf } from "../services/pdf-ai.service";
import { askPdfTutor } from "../services/pdf-tutor.service";

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

export const getUserPdfsController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const pdfs = await Pdf.find({
      user: req.user._id,
    })
      .select(
        "_id originalName size status title difficulty topics createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: {
        pdfs,
      },
    });
  } catch (error) {
    console.error(
      "Get User PDFs Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PDFs.",
    });
  }
};

export const getPdfByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF ID.",
      });
    }

    const pdf = await Pdf.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        pdf,
      },
    });
  } catch (error) {
    console.error(
      "Get PDF By ID Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PDF.",
    });
  }
};

export const askPdfTutorController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const { id } = req.params;

    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return res.status(400).json({
        success: false,
        message: "Question cannot be empty.",
      });
    }

    if (trimmedQuestion.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Question cannot exceed 2000 characters.",
      });
    }

    const pdf = await Pdf.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "Study material not found.",
      });
    }

    if (pdf.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "This study material has not finished processing yet.",
      });
    }

    const answer = await askPdfTutor({
      pdf,
      question: trimmedQuestion,
    });

    return res.status(200).json({
      success: true,
      data: {
        question: trimmedQuestion,
        answer,
      },
    });
  } catch (error) {
    console.error(
      "Ask PDF Tutor Controller Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate tutor response.",
    });
  }
};