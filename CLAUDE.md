# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

```bash
# Install dependencies
npm install

# Run development server with hot reload (port 4010)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run type checking
npm run type-check

# Run type checking in watch mode
npm run type-check:watch
```

### Testing

```bash
# Run all unit/integration tests (Jest)
npm test

# Run tests in watch mode
npm run test:watch

# Run a single test file
npm test -- user.service.spec.ts

# Run tests related to specific files (used by pre-commit hook)
npm run test:related -- src/services/user.service.ts

# Run E2E tests with Playwright (port 4010)
npm run test:e2e

# Show E2E test report
npm run test:e2e:report
```

### Docker Development

```bash
# Start all services (app on port 3001, postgres, mongo, redis)
docker-compose up

# Run E2E tests in Docker
docker-compose run playwright-tests npm run test:e2e

# Rebuild containers
docker-compose build
```

### Database & Development Utilities

```bash
# Seed database with initial data
npm run seed

# Generate test data
npm run generate:test-data

# Setup development environment
npm run setup:dev

# Check API health
npm run health

# Clean build artifacts
npm run clean

# Reset project (clean + reinstall + seed)
npm run reset
```

### Prisma Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations (development)
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:migrate:prod

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database with Prisma
npm run prisma:seed

# Reset database and apply all migrations
npx prisma migrate reset

# Enable Prisma instead of Mongoose
export USE_PRISMA=true
```

### Component Generation

```bash
# Generate a new component with all required files
npm run generate:component

# Generate test file for existing code
npm run generate:test src/services/example.service.ts
```

### Mock API Server

```bash
# Start mock API server using OpenAPI spec (port 4011)
npm run mock:api
```

## Architecture Overview

This is a production-grade Express.js microservice template with TypeScript, featuring component-based architecture, real-time capabilities, advanced security, and microservices patterns.

### Core Technology Stack

- **Express.js 5.1** with TypeScript 5.8+ (strict mode)
- **Multi-Database**: MongoDB (Mongoose), PostgreSQL (pg/Prisma), Redis
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT + OAuth 2.0 (Google, GitHub, Facebook) + 2FA (TOTP)
- **Testing**: Jest (unit), Supertest (integration), Playwright (E2E)
- **API Documentation**: Swagger/OpenAPI at `/api-docs`

### Component-Based Architecture

The project uses auto-discovery component pattern. Each component in `src/components/` extends `BaseComponent` and is self-contained:

```
src/components/[feature]/
├── index.ts              # Component definition & auto-discovery
├── [feature].controller.ts    # HTTP request/response handling
├── [feature].service.ts       # Business logic
├── [feature].routes.ts        # Route definitions
├── [feature].types.ts         # TypeScript interfaces
├── [feature].validation.ts    # Zod validation schemas
└── [feature].spec.ts          # Unit tests
```

### Legacy Module Organization

Older modules in `src/api/` follow a similar pattern:

- `*.controller.ts` - Express route handlers
- `*.routes.ts` - Route definitions with middleware
- `*.service.ts` - Business logic, database operations
- `*.validation.ts` - Zod schemas for request validation
- `*.types.ts` - TypeScript interfaces and types
- `*.spec.ts` - Unit tests for the module

### Request Flow

1. Request → Express Router
2. Rate Limiting (general: 100/15min, auth: 5/15min)
3. Validation Middleware (Zod schemas)
4. Auth Middleware (JWT verification if needed)
5. Controller (HTTP handling)
6. Service (business logic)
7. Repository/Model (database operations)
8. Response (with error middleware for failures)

### Database Architecture

- **MongoDB**: User authentication, document-based data (via Mongoose)
- **PostgreSQL**: Relational data (Prisma ORM or raw queries with `pg`)
- **Redis**: Session storage, caching, real-time data

### Advanced Features

- **WebSocket Server**: Real-time notifications, presence tracking, room-based messaging
- **Event System**: Event-driven architecture with persistence and replay
- **Service Discovery**: Dynamic service registration and health monitoring
- **API Gateway**: Request routing, load balancing, circuit breaking
- **Two-Factor Auth**: TOTP implementation with QR codes and backup codes

### Error Handling

- Custom `ApiError` class in `src/utils/ApiError.ts`
- Global error middleware in `src/middleware/error.middleware.ts`
- Structured logging with Winston logger (`src/utils/logger.ts`)
- Graceful shutdown handling

## Key Development Patterns

### Creating New Components

1. Run `npm run generate:component` to scaffold a new component
2. Or manually create in `src/components/[feature]/`
3. Extend `BaseComponent` class
4. Define metadata with name, version, dependencies
5. Component will be auto-discovered on server start

### Creating New API Endpoints (Legacy)

1. Create module folder in `src/api/[feature]/`
2. Define Zod validation schemas
3. Implement service with business logic
4. Create controller with route handlers
5. Register routes in `src/api/index.ts`

### Authentication

- JWT tokens stored in Authorization header: `Bearer <token>`
- User ID extracted via `authMiddleware`
- Protected routes use `authMiddleware` in route definition
- OAuth providers: Google, GitHub, Facebook
- 2FA support with TOTP (authenticator apps)

### Environment Configuration

- All env vars validated in `src/config/index.ts` using Zod
- Required vars will fail fast on startup
- Access via `import config from '@/config'`
- Copy `.env.example` to `.env` for initial setup
- Default seed passwords in `.env.example` (development only)

### Testing Patterns

- Mock services using `jest.mock()`
- Use `supertest` for API integration tests
- Test utilities in `src/common/test/`
- Test database connections are mocked
- E2E tests run against real Docker containers

## Important Considerations

### Port Configuration

- **Development server**: Port 4010 (`npm run dev`)
- **Docker Compose app**: Port 3001 (`docker-compose up`)
- **E2E tests**: Expect app on port 4010 (when running locally)

### Database Connections

- All databases must be running before starting the app
- Use Docker Compose for easy local development
- Connection singletons prevent multiple connections
- Prisma client must be generated after schema changes

### TypeScript Configuration

- Strict mode enabled - all strict checks active
- Module resolution: NodeNext for modern Node.js
- Path aliases:
  - `@/*` maps to `src/*`
  - `@components/*` maps to `src/components/*`
  - `@common/*` maps to `src/common/*`
- Build excludes test files (`*.spec.ts`)

### Testing Strategy

- Unit tests: Jest with ts-jest, mocked dependencies
- Integration tests: Supertest for API testing
- E2E tests: Playwright on port 4010 (locally) or 3001 (Docker)
- Test files excluded from production build
- Run tests before committing with Husky pre-commit hooks

### Service Architecture

- Services use singleton pattern for shared instances
- Event service for async communication between modules
- Service discovery for microservices registration
- API gateway handles routing to registered services
- WebSocket server for real-time features

### Security Considerations

- Never commit `.env` file (use `.env.example` as template)
- JWT secrets must be strong and unique in production
- Enable CORS restrictions for production
- Rate limiting enabled by default
- Input validation on all endpoints with Zod
- Helmet for security headers

### Pre-commit Hooks

Husky runs automated checks before each commit:
1. Lints and formats staged files with lint-staged
2. Runs type checking on the entire codebase
3. Runs Jest tests related to staged files only
4. Scans for console.log in non-test files (use logger instead)
5. Exits early if no TypeScript/JavaScript files are staged
