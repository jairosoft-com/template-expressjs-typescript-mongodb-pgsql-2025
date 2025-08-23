# Requirements: Update Project Specification Document

## Overview
Update the AI-Friendly Project Template specification document to align with the current PostgreSQL-only + Prisma architecture as documented in ARCHITECTURE.md.

## Requirements List

### High Priority Requirements
- **REQ-001**: Remove all MongoDB references from specification document
  - Remove MongoDB from infrastructure diagrams (lines 329, 486, 703)
  - Remove MongoDB service from docker-compose examples
  - Update technology stack tables to exclude MongoDB
  - Remove MongoDB-related configuration examples
  - Update data architecture section to reflect PostgreSQL-only approach

- **REQ-002**: Update infrastructure diagrams to reflect current architecture
  - Remove `MONGO[(MongoDB Replica Set)]` from service architecture diagram
  - Remove `DOCDB[(DocumentDB)]` from production deployment diagram
  - Update data flow diagrams to show PostgreSQL-only data persistence
  - Add Redis cache layer references where appropriate
  - Ensure all service connections point to PostgreSQL primary/replica setup

- **REQ-004**: Rewrite database architecture section (Section 4)
  - Remove Section 2.8 references to MongoDB integration
  - Update Prisma integration examples to match current file structure
  - Add note about 2025 refactoring and MongoDB removal
  - Update database connection examples to PostgreSQL-only
  - Include Redis caching strategy documentation

### Medium Priority Requirements
- **REQ-003**: Standardize port configuration to 4010 consistently
  - Update line 203: Change `'3001'` to `'4010'` in port configuration example
  - Update all localhost references from port 3000/3001 to 4010
  - Update Docker port mapping examples to use 4010
  - Update health check endpoint examples to use correct port

- **REQ-005**: Update configuration examples with Zod-based validation
  - Update `src/config/index.ts` example (line 192-232) to show Zod validation
  - Remove MongoDB connection string examples
  - Add environment variable validation examples
  - Update `.env.example` content to match current template
  - Include deep freeze configuration pattern

- **REQ-006**: Align component structure documentation with current implementation
  - Update component structure diagram to show separate `/repositories` directory
  - Clarify optional nature of `<name>s.repository.ts` files
  - Update file naming conventions to match plural naming standard
  - Include component auto-discovery documentation
  - Add ComponentRegistry integration examples

- **REQ-007**: Modernize Docker configuration examples
  - Remove MongoDB service from docker-compose.yml examples
  - Update multi-stage Dockerfile examples to match current implementation
  - Include wait-for-postgres patterns
  - Update health check configurations
  - Add Prisma migration deployment patterns

### Low Priority Requirements
- **REQ-008**: Update technology stack references to current versions
  - Update Node.js version references to 18+
  - Update TypeScript version to 5.8+
  - Update Express.js version to 5.1
  - Remove outdated package recommendations
  - Add current dependency versions where relevant

- **REQ-009**: Include current testing achievements and patterns
  - Reference 134 passing tests achievement
  - Update testing utility examples
  - Include Prisma testing patterns
  - Add test database setup examples
  - Document component testing approach

- **REQ-010**: Update performance and scaling sections for PostgreSQL-only
  - Update database performance section for PostgreSQL-only
  - Remove MongoDB sharding references
  - Update caching strategy to focus on Redis
  - Include PostgreSQL connection pooling recommendations
  - Update backup and recovery procedures

## Validation Checklist
- [ ] Document contains zero references to MongoDB
- [ ] Infrastructure diagrams show PostgreSQL-only architecture
- [ ] Docker examples exclude MongoDB services
- [ ] All port references use 4010 consistently
- [ ] Configuration examples use correct port
- [ ] Health check URLs use port 4010
- [ ] Database architecture section matches ARCHITECTURE.md
- [ ] Component structure matches current implementation
- [ ] Configuration patterns align with Zod validation
- [ ] All code examples are syntactically correct
- [ ] Version numbers match current package.json
- [ ] Docker configurations are valid and tested

## Success Criteria
1. Specification document accurately reflects PostgreSQL-only + Prisma architecture
2. All infrastructure diagrams show correct service relationships
3. Zero MongoDB references remain in the document
4. Port numbers are consistent throughout (4010)
5. Configuration examples match current implementation patterns
6. Document passes technical review against actual codebase
