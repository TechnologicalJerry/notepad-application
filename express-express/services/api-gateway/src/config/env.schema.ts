import { z } from "zod";
import { baseEnvSchema, createPortSchema } from "@notepad/common-core";

export const gatewayEnvSchema = baseEnvSchema.extend({
  PORT: createPortSchema(5000),
  CORS_ORIGIN: z.string().default("http://localhost:4200"),
  AUTH_SERVICE_URL: z.string().url().default("http://localhost:5010"),
  NOTE_SERVICE_URL: z.string().url().default("http://localhost:5020"),
  ORGANIZATION_SERVICE_URL: z.string().url().default("http://localhost:5030"),
  COLLABORATION_SERVICE_URL: z.string().url().default("http://localhost:5040"),
  REDIS_URL: z.string().optional(),
  SERVICE_NAME: z.string().default("api-gateway"),
});

export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;
