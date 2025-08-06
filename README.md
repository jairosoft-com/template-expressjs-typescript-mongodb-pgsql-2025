# Express.js TypeScript Microservice Template

A production-grade template for Express.js microservices with TypeScript, featuring real-time capabilities, advanced security, and scalable microservices architecture. This template provides a solid foundation for building enterprise-level backend services with modern best practices.

## 🚀 Features

### Core Infrastructure
- **TypeScript 5.8+** - Full type safety with strict mode enabled
- **Express.js 5.1** - Latest version with modern middleware support
- **Multi-Database Architecture** - PostgreSQL, MongoDB, and Redis support
- **JWT Authentication** - Secure token-based authentication with bcrypt password hashing
- **Request Validation** - Zod schema validation for type-safe API inputs
- **Comprehensive Testing** - Unit tests (Jest), API tests (Supertest), E2E tests (Playwright)
- **Docker & Docker Compose** - Complete containerization with multi-service setup

### 🔄 Real-time Features (Phase 5)
- **WebSocket Server** - Socket.IO with authentication and real-time messaging
- **Event-Driven Architecture** - Event emission, logging, and replay capabilities
- **Real-time Notifications** - Live user notifications and system messages
- **User Presence Tracking** - Online/offline status and activity monitoring
- **Room-based Communication** - Group messaging and typing indicators

### 🔐 Advanced Security (Phase 5)
- **OAuth 2.0 Integration** - Google, GitHub, and Facebook authentication
- **Two-Factor Authentication** - TOTP with QR codes and backup codes
- **Account Security** - Brute force protection and account locking
- **Security Headers** - Helmet, CORS, rate limiting, and security headers
- **Input Validation** - Zod schema validation for all inputs

### 🏗️ Microservices Architecture (Phase 5)
- **Service Discovery** - Dynamic service registration and health monitoring
- **API Gateway** - Request routing, load balancing, and circuit breaking
- **Load Balancing** - Multiple strategies (round-robin, least-connections, random)
- **Service Communication** - Inter-service communication patterns
- **Health Monitoring** - Real-time service health checks

### Developer Experience
- **Structured Logging** - Winston logger with configurable log levels
- **Error Handling** - Centralized error handling with custom ApiError class
- **Code Quality** - ESLint + Prettier with TypeScript support
- **Hot Reload** - Development server with nodemon
- **API Documentation** - Swagger/OpenAPI with interactive docs
- **Development Tools** - Database seeding, test data generation, setup scripts

## 📋 Prerequisites

- **Node.js 18+** (for latest ES2022 features)
- **npm 10+** or **yarn**
- **Docker and Docker Compose** (for containerized development)
- **Git**

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd template-expressjs-typescript-mongodb-pgsql-2025
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
| `npm run seed` | Seed database with initial data |
| `npm run generate:test-data` | Generate test data for development |
| `npm run setup:dev` | Setup development environment |
| `npm run health` | Check API health status |
| `npm run docs` | View API documentation URL |
| `npm run clean` | Clean build artifacts and test results |
| `npm run reset` | Reset project to clean state |

## 🔄 Real-time Features

### WebSocket Server
- **URL**: `ws://localhost:4010`
- **Authentication**: JWT token required
- **Features**:
  - Real-time notifications
  - User presence tracking
  - Room-based messaging
  - Typing indicators
  - Activity broadcasting

### Event System
- **Event Types**: User, System, Data, Notification events
- **Features**:
  - Priority-based event handling
  - Event persistence and replay
  - Retry mechanism with exponential backoff
  - Event statistics and monitoring

## 🔐 Advanced Security

### OAuth Providers
- **Google OAuth**: Profile and email access
- **GitHub OAuth**: Repository and user data
- **Facebook OAuth**: Social profile integration
- **Features**:
  - Account linking and unlinking
  - Profile synchronization
  - Email verification
  - Provider-specific data handling

### Two-Factor Authentication
- **TOTP Implementation**: RFC 6238 compliant
- **QR Code Generation**: For authenticator apps
- **Backup Codes**: 10 secure backup codes
- **Features**:
  - Enable/disable 2FA
  - Backup code regeneration
  - Account recovery options
  - Security audit logging

## 🏗️ Microservices Architecture

### Service Discovery
- **Health Monitoring**: Real-time service health checks
- **Load Balancing**: Round-robin, least-connections, random
- **Features**:
  - Service registration/deregistration
  - Heartbeat monitoring
  - Automatic cleanup of expired services
  - Service statistics and metrics

### API Gateway
- **Routing**: Dynamic service routing
- **Authentication**: JWT token validation
- **Rate Limiting**: Per-service rate limiting
- **Features**:
  - Request/response transformation
  - Error handling and circuit breaking
  - Request logging and monitoring
  - Service endpoint management

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
docker build -t express-microservice .

# Run with environment file
docker run -p 4010:4010 --env-file .env express-microservice
```

### E2E Testing Container
```bash
# Run E2E tests in isolated container
docker-compose run playwright-tests npm run test:e2e
```

## 🔌 API Endpoints

### Health Check
- `GET /` - Returns API health status
- `GET /api/v1/health` - Comprehensive health check
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### User Authentication
- `POST /api/v1/users/register` - Register a new user
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

- `POST /api/v1/users/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

### OAuth Authentication
- `GET /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/github` - GitHub OAuth login
- `GET /api/v1/auth/facebook` - Facebook OAuth login

### Two-Factor Authentication
- `POST /api/v1/auth/2fa/setup` - Setup 2FA
- `POST /api/v1/auth/2fa/verify` - Verify 2FA token
- `POST /api/v1/auth/2fa/disable` - Disable 2FA
- `POST /api/v1/auth/2fa/backup-codes` - Generate backup codes

### Real-time Features
- `ws://localhost:4010` - WebSocket connection
- Real-time notifications and messaging
- User presence tracking

## 🏗️ Project Architecture

### Layered Architecture
This template follows a clean, layered architecture pattern:

- **Controller Layer** - HTTP request/response handling
- **Service Layer** - Business logic and data processing
- **Data Layer** - Database models and connections
- **Validation Layer** - Input validation with Zod schemas

### Microservices Architecture
- **API Gateway** - Request routing and load balancing
- **Service Discovery** - Dynamic service registration
- **Event-Driven Communication** - Asynchronous service communication
- **Circuit Breaker Pattern** - Fault tolerance and resilience

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
template-expressjs-typescript-mongodb-pgsql-2025/
├── src/                          # Main source code
│   ├── api/                      # API layer (feature-based)
│   │   ├── users/               # User feature module
│   │   │   ├── user.controller.ts    # Request/Response handling
│   │   │   ├── user.service.ts       # Business logic
│   │   │   ├── user.routes.ts        # Route definitions
│   │   │   ├── user.types.ts         # TypeScript interfaces
│   │   │   ├── user.validation.ts    # Zod validation schemas
│   │   │   └── user.service.spec.ts  # Unit tests
│   │   └── health/              # Health check endpoints
│   │       ├── health.controller.ts
│   │       └── health.routes.ts
│   ├── services/                # Business logic services
│   │   ├── socket.service.ts         # WebSocket & real-time
│   │   ├── event.service.ts          # Event-driven architecture
│   │   ├── oauth.service.ts          # OAuth authentication
│   │   ├── two-factor.service.ts     # 2FA implementation
│   │   ├── service-discovery.service.ts # Service registry
│   │   └── api-gateway.service.ts    # API routing & load balancing
│   ├── config/                   # Configuration management
│   │   ├── index.ts             # Environment config with Zod validation
│   │   └── swagger.ts           # Swagger/OpenAPI configuration
│   ├── database/                 # Database connections & models
│   │   ├── models/              # Database models
│   │   │   └── user.model.ts    # Enhanced user model with OAuth & 2FA
│   │   ├── repositories/        # Data access layer
│   │   ├── mongo.ts             # MongoDB connection
│   │   ├── postgres.ts          # PostgreSQL connection
│   │   └── redis.ts             # Redis connection
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── error.middleware.ts  # Error handling
│   │   ├── validation.middleware.ts # Request validation
│   │   ├── cache.middleware.ts  # Redis caching
│   │   └── logging.middleware.ts # Request/response logging
│   ├── utils/                   # Utility functions
│   │   ├── ApiError.ts          # Custom error class
│   │   └── logger.ts            # Winston logger setup
│   ├── types/                   # TypeScript type definitions
│   │   └── express/             # Express type extensions
│   └── server.ts                # Application entry point
├── scripts/                     # Development utilities
│   ├── seed-database.ts         # Database seeding
│   ├── generate-test-data.ts    # Test data generation
│   ├── setup-dev.ts             # Development environment setup
│   └── README.md                # Scripts documentation
├── e2e/                         # End-to-end tests (Playwright)
│   ├── pages/                   # Page Object Models
│   ├── api.e2e.spec.ts          # API E2E tests
│   └── register.spec.ts         # Registration flow tests
├── api-docs/                    # API documentation
│   └── openapi.yaml             # OpenAPI specification
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
PORT=4010
LOG_LEVEL=info
CORS_ORIGIN=*
BASE_URL=http://localhost:4010

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/express-template
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=express_template
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

### Environment Validation
The application uses Zod to validate all environment variables at startup, ensuring configuration integrity.

## 🔒 Security Features

- **Helmet** - Security headers for Express
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - API rate limiting protection
- **JWT Authentication** - Secure token-based auth
- **OAuth 2.0** - Google, GitHub, Facebook integration
- **Two-Factor Authentication** - TOTP with backup codes
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Zod schema validation
- **Account Protection** - Brute force prevention and account locking
- **Error Handling** - Secure error responses

## 🚀 Deployment

### Production Considerations
1. **Environment Variables** - Set all required environment variables
2. **Database Connections** - Use production database URLs
3. **Logging** - Configure appropriate log levels
4. **Security** - Use strong JWT secrets and HTTPS
5. **Monitoring** - Implement health checks and metrics
6. **OAuth Configuration** - Configure OAuth providers for production
7. **2FA Setup** - Ensure 2FA is properly configured
8. **Service Discovery** - Configure service discovery for production

### Docker Production
```bash
# Build optimized production image
docker build -t express-microservice:latest .

# Run with production environment
docker run -d \
  --name express-app \
  -p 4010:4010 \
  --env-file .env.production \
  express-microservice:latest
```

## 📊 Monitoring & Observability

### Health Checks
- **Root Health**: `GET /` - Basic API health
- **Comprehensive Health**: `GET /api/v1/health` - Full system health
- **Readiness Probe**: `GET /api/v1/health/ready` - Kubernetes readiness
- **Liveness Probe**: `GET /api/v1/health/live` - Kubernetes liveness

### Logging
- **Structured Logging** - Winston with JSON formatting
- **Request Logging** - All HTTP requests and responses
- **Performance Monitoring** - Response time tracking
- **Error Logging** - Comprehensive error tracking

### Metrics
- **Service Discovery** - Service health and statistics
- **API Gateway** - Request routing and performance metrics
- **Event System** - Event processing statistics
- **WebSocket** - Connection and message metrics

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

### 🎯 Key Features Summary

#### ✅ **Phase 1: Core Setup**
- Express.js server with TypeScript
- Multi-database support (MongoDB, PostgreSQL, Redis)
- JWT authentication system
- Security middleware (Helmet, CORS, Rate Limiting)
- Input validation with Zod

#### ✅ **Phase 2: Testing & Quality**
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- Test coverage reporting

#### ✅ **Phase 3: Production Readiness**
- Comprehensive error handling
- Structured logging with Winston
- Performance monitoring
- Docker containerization
- CI/CD pipeline

#### ✅ **Phase 4: Developer Experience**
- Swagger/OpenAPI documentation
- Database seeding scripts
- Test data generation
- Development environment setup
- Health check endpoints
- Request/response logging
- Performance monitoring

#### ✅ **Phase 5: Advanced Features**
- **Real-time Features**: WebSocket server with Socket.IO, event-driven architecture
- **Advanced Security**: OAuth 2.0 integration, two-factor authentication
- **Microservices Architecture**: Service discovery, API Gateway, load balancing

This template is now **enterprise-ready** with comprehensive features for building scalable, secure, and maintainable microservices.