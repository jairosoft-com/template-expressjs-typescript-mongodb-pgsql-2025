# Configuration Documentation

This document describes the configuration system for the Express.js microservice template.

## Overview

The configuration system uses environment variables with Zod validation and provides a structured, immutable configuration object. Configuration is loaded at startup and validated against a schema to ensure all required values are present and valid.

## Environment Variables

### Required Variables

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `JWT_SECRET` | Secret key for JWT token signing | - | Must be at least 32 characters |
| `NODE_ENV` | Application environment | `development` | Must be one of: `development`, `production`, `test` |
| `PORT` | Server port | `4010` | Must be between 1-65535 |

### Optional Variables

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `LOG_LEVEL` | Logging level | `info` | Must be one of: `error`, `warn`, `info`, `debug` |
| `CORS_ORIGIN` | CORS allowed origin | `*` | String |
| `JWT_EXPIRES_IN` | JWT token expiration | `24h` | String (e.g., `1d`, `7d`, `1h`) |
| `API_PREFIX` | API route prefix | `/api` | String |
| `API_VERSION` | API version | `v1` | String |
| `REQUEST_TIMEOUT` | Request timeout in ms | `30000` | Number |
| `BODY_LIMIT` | Request body size limit | `10mb` | String |

### Database Configuration

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `POSTGRES_HOST` | PostgreSQL host | `localhost` | String |
| `POSTGRES_PORT` | PostgreSQL port | `5432` | Number |
| `POSTGRES_DB` | PostgreSQL database name | `express_template` | String |
| `POSTGRES_USER` | PostgreSQL username | `postgres` | String |
| `POSTGRES_PASSWORD` | PostgreSQL password | `password` | String |
| `REDIS_HOST` | Redis host | `localhost` | String |
| `REDIS_PORT` | Redis port | `6379` | Number |

### OAuth Configuration (Optional)

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | Optional string |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - | Optional string |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | - | Optional string |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | - | Optional string |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth client ID | - | Optional string |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth client secret | - | Optional string |
| `BASE_URL` | Base URL for OAuth callbacks | `http://localhost:4010` | String |

## Configuration Structure

The configuration object is organized into logical sections:

```typescript
{
  // Top-level configuration
  nodeEnv: string,
  port: number,
  logLevel: string,
  corsOrigin: string,
  baseUrl: string,
  apiPrefix: string,
  apiVersion: string,
  requestTimeout: number,
  bodyLimit: string,

  // JWT configuration
  jwt: {
    secret: string,
    expiresIn: string,
  },

  // Database configuration
  database: {
    postgres: {
      host: string,
      port: number,
      database: string,
      user: string,
      password: string,
    },
    redis: {
      host: string,
      port: number,
    },
  },

  // Security configuration
  security: {
    rateLimit: {
      windowMs: number,
      max: number,
    },
    cors: {
      origin: string,
      credentials: boolean,
    },
  },

  // Server configuration
  server: {
    host: string,
    port: number,
    env: string,
    apiPrefix: string,
    apiVersion: string,
    requestTimeout: number,
    bodyLimit: string,
  },

  // OAuth configuration
  oauth: {
    google: {
      clientId?: string,
      clientSecret?: string,
    },
    github: {
      clientId?: string,
      clientSecret?: string,
    },
    facebook: {
      clientId?: string,
      clientSecret?: string,
    },
  },
}
```

## Usage

### Basic Import

```typescript
import config from '@/config';

// Access configuration values
const port = config.port;
const dbHost = config.database.postgres.host;
const jwtSecret = config.jwt.secret;
```

### Configuration Validation

```typescript
import { validateConfig } from '@/config';

// Validate configuration at runtime
try {
  const validatedConfig = validateConfig();
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}
```

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=*
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your-super-secure-production-secret-key
```

### Testing

```bash
NODE_ENV=test
LOG_LEVEL=error
```

## Error Handling

The configuration system provides detailed error messages when validation fails:

```
❌ Invalid environment variables:
  JWT_SECRET: JWT secret must be at least 32 characters

💡 Please check your .env file and ensure all required variables are set correctly.
📖 See .env.example for a complete list of required variables.
```

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong, unique JWT secrets** in production
3. **Limit CORS origins** in production environments
4. **Use environment-specific configuration** for different deployment stages
5. **Rotate secrets regularly** in production

## Migration from Old Configuration

If you're migrating from an older configuration system:

1. Update your `.env` file to match the new variable names
2. Remove any MongoDB-related variables
3. Ensure `JWT_SECRET` is at least 32 characters
4. Test configuration validation with `npm run type-check`

## Troubleshooting

### Common Issues

1. **JWT_SECRET too short**: Ensure your JWT secret is at least 32 characters
2. **Invalid PORT**: Port must be between 1 and 65535
3. **Invalid NODE_ENV**: Must be one of: `development`, `production`, `test`
4. **Missing required variables**: Check that all required environment variables are set

### Debug Mode

Set `LOG_LEVEL=debug` to see detailed configuration information during startup.

## Examples

### Minimal .env file

```bash
JWT_SECRET=your-super-secret-jwt-key-that-is-long-and-random
NODE_ENV=development
```

### Production .env file

```bash
NODE_ENV=production
PORT=8080
LOG_LEVEL=warn
JWT_SECRET=your-production-jwt-secret-key-here
CORS_ORIGIN=https://yourdomain.com
POSTGRES_HOST=your-production-db-host
POSTGRES_DB=your-production-database
POSTGRES_USER=your-production-user
POSTGRES_PASSWORD=your-production-password
REDIS_HOST=your-production-redis-host
```
