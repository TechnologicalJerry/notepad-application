import { z } from "zod";
import { baseEnvSchema, createPortSchema } from "@notepad/common-core";

export const authEnvSchema = baseEnvSchema.extend({
  PORT: createPortSchema(5010),
  MONGO_AUTH_URI: z.string().url().default("mongodb://localhost:27017/notepad-auth-service"),
  ACCESS_TOKEN_PRIVATE_KEY: z.string(),
  ACCESS_TOKEN_PUBLIC_KEY: z.string(),
  REFRESH_PRIVATE_KEY: z.string(),
  REFRESH_PUBLIC_KEY: z.string(),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("1y"),
  SALT_WORK_FACTOR: z.preprocess((val) => Number(val), z.number().default(10)),
  SERVICE_NAME: z.string().default("auth-service"),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;
