import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Encryption
  CREDENTIAL_ENCRYPTION_KEY: z.string().min(32),
  
  // Application
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  MAX_INPUT_CHARACTERS: z.string().transform(Number).default('50000'),
  
  // Feature Flags
  GRAMMAR_ENABLED: z.string().transform(v => v === 'true').default('true'),
  SUMMARIZER_ENABLED: z.string().transform(v => v === 'true').default('true'),
  TRANSLATOR_ENABLED: z.string().transform(v => v === 'true').default('true'),
  CITATIONS_ENABLED: z.string().transform(v => v === 'true').default('true'),
  AI_DETECTOR_ENABLED: z.string().transform(v => v === 'true').default('true'),
  PLAGIARISM_ENABLED: z.string().transform(v => v === 'true').default('false'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const config = {
  env: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  
  database: {
    url: parsed.data.DATABASE_URL,
  },
  
  redis: {
    url: parsed.data.REDIS_URL,
  },
  
  jwt: {
    secret: parsed.data.JWT_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },
  
  encryption: {
    key: parsed.data.CREDENTIAL_ENCRYPTION_KEY,
  },
  
  app: {
    url: parsed.data.APP_URL,
    apiUrl: parsed.data.API_URL,
    corsOrigin: parsed.data.CORS_ORIGIN,
  },
  
  rateLimit: {
    windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    maxRequests: parsed.data.RATE_LIMIT_MAX_REQUESTS,
  },
  
  upload: {
    maxFileSize: parsed.data.MAX_FILE_SIZE,
    maxInputCharacters: parsed.data.MAX_INPUT_CHARACTERS,
  },
  
  features: {
    grammar: parsed.data.GRAMMAR_ENABLED,
    summarizer: parsed.data.SUMMARIZER_ENABLED,
    translator: parsed.data.TRANSLATOR_ENABLED,
    citations: parsed.data.CITATIONS_ENABLED,
    aiDetector: parsed.data.AI_DETECTOR_ENABLED,
    plagiarism: parsed.data.PLAGIARISM_ENABLED,
  },
  
  logging: {
    level: parsed.data.LOG_LEVEL,
  },
} as const;
