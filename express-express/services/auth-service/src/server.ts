import { app, logger } from "./app";
import { validateEnv } from "@notepad/common-core";
import { authEnvSchema } from "./config/env.schema";
import connect from "./utils/connect";
import dotenv from "dotenv";

dotenv.config();

const env = validateEnv(authEnvSchema);

process.env.SERVICE_NAME = env.SERVICE_NAME;

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 ${env.SERVICE_NAME} running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  await connect(env.MONGO_AUTH_URI);
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
