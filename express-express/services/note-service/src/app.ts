import express from "express";
import {
  correlationIdMiddleware,
  createErrorHandler,
  createLogger,
  deserializeUser,
} from "@notepad/common-core";
import routes from "./routes";

const app = express();
const logger = createLogger(process.env.SERVICE_NAME || "note-service");

app.use(express.json());
app.use(correlationIdMiddleware);
app.use(deserializeUser);

// Health check routes
app.get("/healthz", (req, res) => {
  res.status(200).json({ success: true, status: "UP" });
});

app.get("/readyz", (req, res) => {
  res.status(200).json({ success: true, status: "READY" });
});

// Configure API routes
routes(app);

// Register common error handler
app.use(createErrorHandler(logger as any));

export { app, logger };
