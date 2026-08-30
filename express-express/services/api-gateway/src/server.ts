import { app, logger } from "./app";
import { validateEnv } from "@notepad/common-core";
import { gatewayEnvSchema } from "./config/env.schema";
import dotenv from "dotenv";

dotenv.config();

const env = validateEnv(gatewayEnvSchema);

// Set service name in env for Logger usage if not present
process.env.SERVICE_NAME = env.SERVICE_NAME;

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 ${env.SERVICE_NAME} running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const shutdown = () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Closed remaining connections.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
