import { Request, Response } from "express";
import { generateResponse } from "../services/gemini.service";

export const chatController = async (
  req: Request,
  res: Response
) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const reply = await generateResponse(message);

    return res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat Controller Error:", errorMessage);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};