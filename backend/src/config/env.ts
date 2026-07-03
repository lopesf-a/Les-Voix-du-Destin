import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12, 'JWT_SECRET doit contenir au moins 12 caractères'),
  MISTRAL_API_KEY: z.string().optional().default(''),
  MISTRAL_MODEL: z.string().default('mistral-small-latest'),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

export const env = envSchema.parse(process.env);
export const isDev = env.NODE_ENV === 'development';
