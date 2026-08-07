import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY! || "YOUR_API_KEY_HERE",
});

async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: "Say hello",
  });

  console.log(response.text);
}

test().catch(console.error);