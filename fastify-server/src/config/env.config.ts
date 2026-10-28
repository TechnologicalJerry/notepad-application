import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  MONGO_URI: z.string().default("mongodb://localhost:27017/notepad-application"),
  ACCESS_TOKEN_SECRET: z.string().default("notepad_access_token_super_secret_key_12345"),
  REFRESH_TOKEN_SECRET: z.string().default("notepad_refresh_token_super_secret_key_12345"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:4200,http://localhost:5173"),
  RATE_LIMIT_MAX: z.coerce.number().default(1000),
  RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(60000), // 1 minute
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
export type EnvConfig = z.infer<typeof envSchema>;
