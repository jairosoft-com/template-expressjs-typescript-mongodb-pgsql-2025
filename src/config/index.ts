import { z } from 'zod';
import dotenv from 'dotenv';

// Only load .env file in non-production environments
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4010').transform(Number),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CORS_ORIGIN: z.string().default('*'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // Database Configuration
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.string().default('5432').transform(Number),
  POSTGRES_DB: z.string().default('express_template'),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('password'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Base URL for OAuth callbacks
  BASE_URL: z.string().default('http://localhost:4010'),

  // Additional Configuration
  API_PREFIX: z.string().default('/api'),
  API_VERSION: z.string().default('v1'),
  REQUEST_TIMEOUT: z.string().default('30000').transform(Number),
  BODY_LIMIT: z.string().default('10mb'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  console.error('❌ Invalid environment variables:');
  
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    if (fieldErrors) {
      console.error(`  ${field}: ${fieldErrors.join(', ')}`);
    }
  });
  
  console.error('\n💡 Please check your .env file and ensure all required variables are set correctly.');
  console.error('📖 See .env.example for a complete list of required variables.');
  process.exit(1);
}

const config = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  logLevel: parsedEnv.data.LOG_LEVEL,
  corsOrigin: parsedEnv.data.CORS_ORIGIN,
  baseUrl: parsedEnv.data.BASE_URL,
  apiPrefix: parsedEnv.data.API_PREFIX,
  apiVersion: parsedEnv.data.API_VERSION,
  requestTimeout: parsedEnv.data.REQUEST_TIMEOUT,
  bodyLimit: parsedEnv.data.BODY_LIMIT,

  jwt: {
    secret: parsedEnv.data.JWT_SECRET,
    expiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  },

  postgres: {
    host: parsedEnv.data.POSTGRES_HOST,
    port: parsedEnv.data.POSTGRES_PORT,
    database: parsedEnv.data.POSTGRES_DB,
    user: parsedEnv.data.POSTGRES_USER,
    password: parsedEnv.data.POSTGRES_PASSWORD,
  },

  redis: {
    host: parsedEnv.data.REDIS_HOST,
    port: parsedEnv.data.REDIS_PORT,
  },

  oauth: {
    google: {
      clientId: parsedEnv.data.GOOGLE_CLIENT_ID,
      clientSecret: parsedEnv.data.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: parsedEnv.data.GITHUB_CLIENT_ID,
      clientSecret: parsedEnv.data.GITHUB_CLIENT_SECRET,
    },
    facebook: {
      clientId: parsedEnv.data.FACEBOOK_CLIENT_ID,
      clientSecret: parsedEnv.data.FACEBOOK_CLIENT_SECRET,
    },
  },

  // Security configuration
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: parsedEnv.data.CORS_ORIGIN,
      credentials: true,
    },
  },

  // Server configuration
  server: {
    host: '0.0.0.0',
    port: parsedEnv.data.PORT,
    env: parsedEnv.data.NODE_ENV,
    apiPrefix: parsedEnv.data.API_PREFIX,
    apiVersion: parsedEnv.data.API_VERSION,
    requestTimeout: parsedEnv.data.REQUEST_TIMEOUT,
    bodyLimit: parsedEnv.data.BODY_LIMIT,
  },

  // Database configuration
  database: {
    postgres: {
      host: parsedEnv.data.POSTGRES_HOST,
      port: parsedEnv.data.POSTGRES_PORT,
      database: parsedEnv.data.POSTGRES_DB,
      user: parsedEnv.data.POSTGRES_USER,
      password: parsedEnv.data.POSTGRES_PASSWORD,
    },
    redis: {
      host: parsedEnv.data.REDIS_HOST,
      port: parsedEnv.data.REDIS_PORT,
    },
  },
};

// Make configuration immutable
const frozenConfig = Object.freeze(config);

// Configuration validation function
export const validateConfig = () => {
  // Validate JWT secret length
  if (frozenConfig.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate port range
  if (frozenConfig.port < 1 || frozenConfig.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }

  // Validate environment
  if (!['development', 'production', 'test'].includes(frozenConfig.nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  return frozenConfig;
};

export default frozenConfig;
