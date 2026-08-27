import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DEFAULT_AI_PROVIDER: z.enum(['gemini', 'openai', 'claude', 'azure']).default('gemini'),
  GEMINI_MODEL: z.string().default('gemini-3.6-flash'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_SCHEME_GUIDANCE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  SARVAM_API_KEY: z.string().optional(),
  STORAGE_PROVIDER: z.enum(['supabase', 's3', 'local']).default('local'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_BUCKET_NAME: z.string().default('benefitos-documents'),
  DIGILOCKER_CLIENT_ID: z.string().optional(),
  DIGILOCKER_CLIENT_SECRET: z.string().optional(),
  SECURITY_STATE_MODE: z.enum(['local', 'distributed']).default('local'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation error:', result.error.format());
    throw new Error('Invalid environment variables config');
  }
  return result.data;
}
