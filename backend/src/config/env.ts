import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env file from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/bizgrowth?schema=public'),
  JWT_SECRET: z.string().min(8).default('supersecretjwtaccesskey123456!'),
  JWT_REFRESH_SECRET: z.string().min(8).default('supersecretjwtrefreshkey123456!'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
