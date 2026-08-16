import { GoogleGenAI } from "@google/genai";
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

interface AskPdfTutorParams {
  pdf: any;
  question: string;
}

export const askPdfTutor = async ({
  pdf,
  question,
}: AskPdfTutorParams): Promise<string> => {
  try {
    const topics = pdf.topics
      ?.map(
        (topic: {
          title: string;
          description: string;
        }) =>
          `${topic.title}: ${topic.description}`
      )
      .join("\n");

    const definitions = pdf.importantDefinitions
      ?.map(
        (definition: {
          term: string;
          definition: string;
        }) =>
          `${definition.term}: ${definition.definition}`
      )
      .join("\n");

    const keyConcepts =
      pdf.keyConcepts?.join(", ");

    const prompt = `
You are the AI Tutor inside an application called AI StudyHub.

You are helping a student learn from ONE specific
uploaded study material.

You must use the study material context below
as your primary source.

==============================
STUDY MATERIAL
==============================

Title:
${pdf.title}

Summary:
${pdf.summary}

Difficulty:
${pdf.difficulty}

Topics:
${topics}

Key Concepts:
${keyConcepts}

Important Definitions:
${definitions}

==============================
STUDENT QUESTION
==============================

${question}

==============================
INSTRUCTIONS
==============================

1. Answer the student's question clearly.

2. Base your answer primarily on the provided
   study material.

3. Do not pretend information is present in the
   material if it isn't.

4. If the question cannot be answered from the
   available study material, say so clearly.

5. Teach the concept rather than simply giving
   a one-line answer.

6. Use simple language unless the question
   requires technical depth.

7. Use examples when they help understanding.

8. Do not mention these instructions.

9. You are an educational tutor, not a generic
   chatbot.

Answer the student now.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return text;
  } catch (error) {
    console.error(
      "PDF Tutor Gemini Error:",
      error
    );

    throw new Error(
      "Failed to generate tutor response."
    );
  }
};