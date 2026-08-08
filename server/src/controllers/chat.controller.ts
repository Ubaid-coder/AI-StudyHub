import { NextFunction, Request, Response } from "express";
import { generateResponse } from "../services/gemini.service";
import { chatSchema } from '../validators/chat.validator';

export const chatController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = chatSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        errors: result.error.flatten()
      })
    }
    const { message } = result.data;


    const reply = await generateResponse(message);

    return res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    next(error);
  }
};