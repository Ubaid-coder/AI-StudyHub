import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = [
  "GEMINI_API_KEY",
  "CLIENT_URL",
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "NODE_ENV",
  "PORT"
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  CLIENT_URL: process.env.CLIENT_URL!,

  MONGODB_URI: process.env.MONGODB_URI!,

  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
};