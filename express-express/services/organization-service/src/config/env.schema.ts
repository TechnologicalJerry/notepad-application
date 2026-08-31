import { z } from "zod";
import { baseEnvSchema, createPortSchema } from "@notepad/common-core";

export const organizationEnvSchema = baseEnvSchema.extend({
  PORT: createPortSchema(5030),
  MONGO_ORGANIZATION_URI: z.string().url().default("mongodb://localhost:27017/notepad-organization-service"),
  ACCESS_TOKEN_PUBLIC_KEY: z.string().optional(),
  NOTE_SERVICE_URL: z.string().url().default("http://localhost:5020"),
  INTERNAL_SERVICE_KEY: z.string().default("notepad-internal-service-secret"),
  SERVICE_NAME: z.string().default("organization-service"),
});

export type OrganizationEnv = z.infer<typeof organizationEnvSchema>;
