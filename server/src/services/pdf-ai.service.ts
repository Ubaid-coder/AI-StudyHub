import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

import { PdfAiAnalysis } from "../types/pdf-ai.types";
import { env } from "../config/env";

const apiKey = env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured."
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

export const analyzePdf = async (
  filePath: string
): Promise<PdfAiAnalysis> => {
  try {
    const fileBuffer = await fs.readFile(filePath);

    const base64Pdf = fileBuffer.toString("base64");

    const prompt = `
You are the AI learning engine of an application called AI StudyHub.

Analyze the uploaded study PDF carefully.

Your job is NOT simply to summarize it.

Extract structured educational information that AI StudyHub can use to help a student learn from this document.

Return ONLY valid JSON.

The JSON must follow this exact structure:

{
  "title": "string",
  "summary": "string",
  "difficulty": "beginner | intermediate | advanced",
  "topics": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "keyConcepts": [
    "string"
  ],
  "importantDefinitions": [
    {
      "term": "string",
      "definition": "string"
    }
  ]
}

Rules:

1. title:
   Identify the main subject/title of the document.

2. summary:
   Give a clear educational overview of the document.

3. difficulty:
   Estimate the educational difficulty based on the material itself.

4. topics:
   Identify the major topics or chapters.
   Do not create unnecessary tiny topics.

5. keyConcepts:
   Extract the concepts a student should remember.

6. importantDefinitions:
   Extract important terms and explain them using the document's context.

7. Do not invent information that is not supported by the PDF.

8. Do not include markdown.

9. Return ONLY the JSON object.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Pdf,
          },
        },
        {
          text: prompt,
        },
      ],
    });

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed: PdfAiAnalysis =
      JSON.parse(cleanedText);

    return parsed;
  } catch (error) {
    console.error(
      "PDF Gemini Analysis Error:",
      error
    );

    throw new Error(
      "Failed to analyze PDF with Gemini."
    );
  }
};