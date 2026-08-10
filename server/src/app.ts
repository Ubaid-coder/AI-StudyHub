import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";

import { errorMiddleware } from "./middlewares/error.middlewar";

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



// Health Check
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "AI StudyHub API is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Must be LAST
app.use(errorMiddleware);

export default app;