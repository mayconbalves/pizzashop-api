import { z } from "zod";

const envSchema = z.object({
  AUTH_REDIRECT_URL: z.string().min(1),
  API_BASE_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
