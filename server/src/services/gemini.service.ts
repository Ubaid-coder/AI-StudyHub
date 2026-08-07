import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

const ai = new GoogleGenAI({
  apiKey:env.GEMINI_API_KEY,
});

export const generateResponse = async (
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return response.text as string;
  } catch (error) {
    console.error("Gemini Error:", error);

    throw new Error("Failed to generate AI response.");
  }
};