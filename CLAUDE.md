# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run type checking
npm run type-check
```

### Testing
```bash
# Run all unit/integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (requires built app)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Docker Development
```bash
# Start all services (app, postgres, mongo, redis)
docker-compose up

# Run E2E tests in Docker
docker-compose run e2e-tests

# Rebuild containers
docker-compose build
```

## Architecture Overview

This is a layered Express.js microservice using TypeScript with the following structure:

### Module Organization
Each feature module (e.g., `src/api/users/`) contains:
- `*.controller.ts` - Express route handlers, handles HTTP concerns
- `*.routes.ts` - Route definitions with middleware
- `*.service.ts` - Business logic, database operations
- `*.validation.ts` - Zod schemas for request validation

### Request Flow
1. Request → Express Router
2. Validation Middleware (Zod schemas)
3. Auth Middleware (JWT verification if needed)
4. Controller (HTTP handling)
5. Service (business logic)
6. Database Models (Mongoose/PostgreSQL)
7. Response (with error middleware for failures)

### Database Architecture
- **MongoDB**: User authentication, document-based data (via Mongoose)
- **PostgreSQL**: Relational data (raw queries with `pg` library)
- **Redis**: Session storage, caching

### Error Handling
- Custom `ApiError` class in `src/utils/ApiError.ts`
- Global error middleware in `src/middleware/error.middleware.ts`
- Async errors automatically caught via `express-async-handler`

## Key Development Patterns

### Creating New API Endpoints
1. Create module folder in `src/api/[feature]/`
2. Define Zod validation schemas
3. Implement service with business logic
4. Create controller with route handlers
5. Register routes in `src/api/index.ts`

### Authentication
- JWT tokens stored in Authorization header
- User ID extracted via `authMiddleware`
- Protected routes use `authMiddleware` in route definition

### Environment Configuration
- All env vars validated in `src/config/env.ts` using Zod
- Required vars will fail fast on startup
- Access via `import { env } from '@/config/env'`

### Testing Patterns
- Mock services using `jest.mock()`
- Use `supertest` for API integration tests
- Test database connections are mocked
- E2E tests run against real Docker containers

## Important Considerations

### Database Migrations
Currently no migration system - PostgreSQL schemas must be managed manually or a migration tool should be added.

### Type Safety
- Strict TypeScript enabled
- Avoid `any` types (ESLint will warn)
- Use Zod schemas for runtime validation

### Module Imports
Use `@/` prefix for absolute imports from `src/` directory.