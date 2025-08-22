# Project Compliance Requirements

## To achieve 100% compliance with the ExpressJS + Prisma template specification:

### File Structure Requirements
- Create `src/app.ts` file for Express app configuration
- Move Express app setup from `server.ts` to `app.ts`
- Keep only server startup logic in `server.ts`

### Component Naming Convention
- Ensure all component files use plural naming (e.g., `users.*.ts`)
- Update any singular file references to match plural convention

### Database Architecture Simplification
- Remove MongoDB support completely for new builds
- Use Prisma exclusively as the single source of truth for data models
- Remove MongoDB-related environment variables and configuration
- Clean up unused dependencies (mongoose, MongoDB drivers)
- Simplify services to use Prisma repositories only
- Remove dual-database logic and feature flags

### Configuration Validation
- Enhance environment variable validation to match specification examples
- Ensure all required config variables are properly validated

### Component Registry
- Verify auto-discovery pattern is fully implemented
- Ensure components are automatically registered and mounted

### Testing Coverage
- Ensure all components have comprehensive test coverage
- Verify test utilities match specification requirements

### Documentation Updates
- Update any references to reflect the new file structure
- Ensure README matches the specification's architectural principles
