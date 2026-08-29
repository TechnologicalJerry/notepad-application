import { app, logger } from "./app";
import { validateEnv, baseEnvSchema, createPortSchema } from "@notepad/common-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = baseEnvSchema.extend({
  PORT: createPortSchema(5001),
  SERVICE_NAME: z.string().default("auth-service"),
});

const env = validateEnv(envSchema);

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
