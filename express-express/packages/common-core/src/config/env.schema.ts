import { z } from "zod";

export const createPortSchema = (defaultPort: number) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const parsed = Number(val);
    return isNaN(parsed) ? undefined : parsed;
  }, z.number().default(defaultPort));

export const baseEnvSchema = z.object({
  PORT: createPortSchema(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  MONGO_URI: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  SERVICE_NAME: z.string().default("unknown-service"),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function validateEnv<T extends z.ZodRawShape>(schema: z.ZodObject<T>): z.infer<z.ZodObject<T>> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error(`❌ [${process.env.SERVICE_NAME || "service"}] Environment validation failed:`);
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
}
