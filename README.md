# JairoJobs Express.js TypeScript Microservice Template

A production-grade template for Express.js microservices with TypeScript, layered architecture, multi-database support, and comprehensive testing. This template provides a solid foundation for building scalable backend services with modern best practices.

## 🚀 Features

- **TypeScript 5.8+** - Full type safety with strict mode enabled
- **Express.js 5.1** - Latest version with modern middleware support
- **Multi-Database Architecture** - PostgreSQL, MongoDB, and Redis support
- **JWT Authentication** - Secure token-based authentication with bcrypt password hashing
- **Request Validation** - Zod schema validation for type-safe API inputs
- **Comprehensive Testing** - Unit tests (Jest), API tests (Supertest), E2E tests (Playwright)
- **Docker & Docker Compose** - Complete containerization with multi-service setup
- **Security First** - Helmet, CORS, rate limiting, and security headers
- **Structured Logging** - Winston logger with configurable log levels
- **Error Handling** - Centralized error handling with custom ApiError class
- **Code Quality** - ESLint + Prettier with TypeScript support
- **Hot Reload** - Development server with nodemon
- **Cross-Browser E2E Testing** - Chrome, Firefox, and Safari support

## 📋 Prerequisites

- **Node.js 22+** (for latest ES2022 features)
- **npm 10+** or **yarn**
- **Docker and Docker Compose** (for containerized development)
- **Git**

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jairojobs-expressjs-typescript-mongodb-pgsql-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values (see Environment Variables section).

4. **Start development with Docker (recommended)**
   ```bash
   docker-compose up
   ```
   This starts the app with all databases (PostgreSQL, MongoDB, Redis).

5. **Or run locally**
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run unit and integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run test:e2e:report` | Show Playwright test report |
| `npm run lint` | Run ESLint for code quality |
| `npm run lint:fix` | Fix ESLint errors automatically |

## 🐳 Docker Setup

### Development Environment
```bash
# Start all services (app + databases)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Production Build
```bash
# Build production image
docker build -t jairojobs-microservice .

# Run with environment file
docker run -p 3001:3001 --env-file .env jairojobs-microservice
```

### E2E Testing Container
```bash
# Run E2E tests in isolated container
docker-compose run playwright-tests npm run test:e2e
```

## 🔌 API Endpoints

### Health Check
- `GET /` - Returns API health status
  ```json
  {
    "message": "API is healthy"
  }
  ```

### User Authentication
- `POST /api/v1/users/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
  **Response:**
  ```json
  {
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "jwt_token_here"
    }
  }
  ```

- `POST /api/v1/users/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
  **Response:**
  ```json
  {
    "message": "Login successful",
    "data": {
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "token": "jwt_token_here"
    }
  }
  ```

## 🏗️ Project Architecture

### Layered Architecture
This template follows a clean, layered architecture pattern:

- **Controller Layer** - HTTP request/response handling
- **Service Layer** - Business logic and data processing
- **Data Layer** - Database models and connections
- **Validation Layer** - Input validation with Zod schemas

### Feature-Based Organization
Each feature is self-contained with all related files:
```
src/api/users/
├── user.controller.ts    # Request/Response handling
├── user.service.ts       # Business logic
├── user.routes.ts        # Route definitions
├── user.types.ts         # TypeScript interfaces
├── user.validation.ts    # Zod validation schemas
└── user.service.spec.ts  # Unit tests
```

## 📁 Project Structure

```
jairojobs-expressjs-typescript-mongodb-pgsql-2025/
├── src/                          # Main source code
│   ├── api/                      # API layer (feature-based)
│   │   └── users/               # User feature module
│   │       ├── user.controller.ts    # Request/Response handling
│   │       ├── user.service.ts       # Business logic
│   │       ├── user.routes.ts        # Route definitions
│   │       ├── user.types.ts         # TypeScript interfaces
│   │       ├── user.validation.ts    # Zod validation schemas
│   │       └── user.service.spec.ts  # Unit tests
│   ├── config/                   # Configuration management
│   │   └── index.ts             # Environment config with Zod validation
│   ├── database/                 # Database connections & models
│   │   ├── models/              # Mongoose models
│   │   │   └── user.model.ts    # User data model
│   │   ├── mongo.ts             # MongoDB connection
│   │   ├── postgres.ts          # PostgreSQL connection
│   │   └── redis.ts             # Redis connection
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── error.middleware.ts  # Error handling
│   │   └── validation.middleware.ts # Request validation
│   ├── utils/                   # Utility functions
│   │   ├── ApiError.ts          # Custom error class
│   │   └── logger.ts            # Winston logger setup
│   ├── types/                   # TypeScript type definitions
│   │   └── express/             # Express type extensions
│   └── server.ts                # Application entry point
├── e2e/                         # End-to-end tests (Playwright)
│   ├── pages/                   # Page Object Models
│   ├── api.e2e.spec.ts          # API E2E tests
│   └── register.spec.ts         # Registration flow tests
├── dist/                        # Compiled JavaScript output
├── docker-compose.yml           # Multi-service Docker setup
├── Dockerfile                   # Production Docker image
├── Dockerfile.e2e               # E2E testing Docker image
├── jest.config.ts               # Jest unit testing config
├── playwright.config.ts         # Playwright E2E testing config
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

## 🧪 Testing Strategy

### Multi-Level Testing Approach

1. **Unit Tests** - Jest + ts-jest
   - Test individual functions and services
   - Mock external dependencies
   - Fast execution for development

2. **Integration Tests** - Supertest
   - Test API endpoints
   - Verify request/response handling
   - Test middleware integration

3. **E2E Tests** - Playwright
   - Test complete user workflows
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Real browser automation

### Running Tests
```bash
# Unit tests only
npm test

# Unit tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# E2E test report
npm run test:e2e:report
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
CORS_ORIGIN=*

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1d

# Database URLs
POSTGRES_URL=postgresql://postgres:password@localhost:5432/mydatabase
MONGO_URL=mongodb://localhost:27017/jairojobs
REDIS_URL=redis://localhost:6379
```

### Environment Validation
The application uses Zod to validate all environment variables at startup, ensuring configuration integrity.

## 🔒 Security Features

- **Helmet** - Security headers for Express
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - API rate limiting protection
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Zod schema validation
- **Error Handling** - Secure error responses

## 🚀 Deployment

### Production Considerations
1. **Environment Variables** - Set all required environment variables
2. **Database Connections** - Use production database URLs
3. **Logging** - Configure appropriate log levels
4. **Security** - Use strong JWT secrets and HTTPS
5. **Monitoring** - Implement health checks and metrics

### Docker Production
```bash
# Build optimized production image
docker build -t jairojobs-microservice:latest .

# Run with production environment
docker run -d \
  --name jairojobs-app \
  -p 3001:3001 \
  --env-file .env.production \
  jairojobs-microservice:latest
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Review the documentation
3. Create a new issue with detailed information

---

**Built with ❤️ using modern Node.js and TypeScript best practices**