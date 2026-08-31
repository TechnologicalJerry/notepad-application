import { z } from "zod";
import { baseEnvSchema, createPortSchema } from "@notepad/common-core";

export const noteEnvSchema = baseEnvSchema.extend({
  PORT: createPortSchema(5020),
  MONGO_NOTE_URI: z.string().url().default("mongodb://localhost:27017/notepad-note-service"),
  ACCESS_TOKEN_PUBLIC_KEY: z.string().optional(),
  AUTH_SERVICE_URL: z.string().url().default("http://localhost:5010"),
  INTERNAL_SERVICE_KEY: z.string().default("notepad-internal-service-secret"),
  SERVICE_NAME: z.string().default("note-service"),
});

export type NoteEnv = z.infer<typeof noteEnvSchema>;
