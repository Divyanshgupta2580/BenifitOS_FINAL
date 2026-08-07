"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('4000').transform((v) => parseInt(v, 10)),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    API_PREFIX: zod_1.z.string().default('api/v1'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
    JWT_EXPIRATION: zod_1.z.string().default('15m'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long'),
    JWT_REFRESH_EXPIRATION: zod_1.z.string().default('7d'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    DEFAULT_AI_PROVIDER: zod_1.z.enum(['gemini', 'openai', 'claude', 'azure']).default('gemini'),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    OPENAI_API_KEY: zod_1.z.string().optional(),
    SARVAM_API_KEY: zod_1.z.string().optional(),
    STORAGE_PROVIDER: zod_1.z.enum(['supabase', 's3', 'local']).default('local'),
    SUPABASE_URL: zod_1.z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    STORAGE_BUCKET_NAME: zod_1.z.string().default('benefitos-documents'),
    DIGILOCKER_CLIENT_ID: zod_1.z.string().optional(),
    DIGILOCKER_CLIENT_SECRET: zod_1.z.string().optional(),
    DIGILOCKER_REDIRECT_URI: zod_1.z.string().optional(),
    AADHAAR_MOCK_MODE: zod_1.z.string().default('true').transform((v) => v === 'true'),
});
function validateEnv() {
    const result = exports.envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Environment validation error:', result.error.format());
        throw new Error('Invalid environment variables config');
    }
    return result.data;
}
//# sourceMappingURL=env.config.js.map