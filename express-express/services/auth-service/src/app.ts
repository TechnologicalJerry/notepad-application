import express from "express";
import { correlationIdMiddleware, createErrorHandler, createLogger } from "@notepad/common-core";

const app = express();
const logger = createLogger(process.env.SERVICE_NAME || "auth-service");

app.use(express.json());
app.use(correlationIdMiddleware);

// Health check routes
app.get("/healthz", (req, res) => {
  res.status(200).json({ success: true, status: "UP" });
});

app.get("/readyz", (req, res) => {
  res.status(200).json({ success: true, status: "READY" });
});

// Base API route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `Welcome to ${process.env.SERVICE_NAME || "auth-service"}`,
  });
});

// Register common error handler
app.use(createErrorHandler(logger as any));

export { app, logger };
