import { app, logger } from "./app";
import { validateEnv, setPublicKey } from "@notepad/common-core";
import { noteEnvSchema } from "./config/env.schema";
import connect from "./utils/connect";
import dotenv from "dotenv";

dotenv.config();

const env = validateEnv(noteEnvSchema);

process.env.SERVICE_NAME = env.SERVICE_NAME;

// Seed public key if provided in environment
if (env.ACCESS_TOKEN_PUBLIC_KEY) {
  setPublicKey(env.ACCESS_TOKEN_PUBLIC_KEY);
}

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 ${env.SERVICE_NAME} running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  await connect(env.MONGO_NOTE_URI);
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
