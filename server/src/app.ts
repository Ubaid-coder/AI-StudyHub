import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import chatRoutes from "./routes/chat.routes";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Middleware
app.use(express.json());

app.use(morgan("dev"));

app.use("/api/chat", chatRoutes);

// Health Check
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "AI StudyHub API is running 🚀",
  });
});

export default app;