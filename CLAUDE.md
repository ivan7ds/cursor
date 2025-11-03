# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **CPO (Charge Point Operator) application implementing the OCPI 2.2 protocol** for managing EV charging infrastructure across Spain and Portugal. The application manages 10,000+ EVSEs (Electric Vehicle Supply Equipment) distributed across 400+ locations and includes dual CPO/eMSP functionality with a web-based dashboard for monitoring and management.

**Stack**: Node.js 18+, Express, PostgreSQL, Redis, Sequelize ORM, Docker

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development with hot-reload
npm run dev

# Production start
npm start

# Testing
npm test                    # Run all tests
npm run test:watch         # Watch mode for development

# Linting
npm run lint               # Check code style
npm run lint:fix          # Auto-fix linting issues

# Database setup
npm run setup              # Run setup.js (database + seed data)
npm run migrate            # Run migrations
npm run seed              # Seed database
./scripts/setup_database.sh  # Alternative database setup

# OCPI token management
node scripts/generate-ocpi-token.js generate --party-id EFI --country-code ES
node scripts/generate-ocpi-token.js list
node scripts/generate-ocpi-token.js deactivate --token OCPI_XXXXX

# Log monitoring
./scripts/logs 5           # Last 5 minutes
./scripts/logs api        # API requests
./scripts/logs errors     # Error logs
./scripts/logs follow     # Real-time tail
node scripts/view-logs.js  # Interactive menu

# Docker operations
docker-compose up -d       # Start all services
docker-compose logs -f app # Follow app logs
docker-compose restart app # Restart application
docker exec -it cursor-app-1 node scripts/generate-ocpi-token.js list
```

## Architecture & Key Patterns

### Directory Structure

- **`src/api/`**: Express route handlers for all OCPI 2.2 endpoints (credentials, locations, evses, sessions, cdrs, tariffs, tokens, commands, emsp actions)
- **`src/services/`**: Business logic services including authorization, notifications, and sync operations
- **`src/models/`**: Sequelize models (Location, EVSE, Session, CDR, Tariff, Token, Credentials, EmspEVSE, EmspSession, EmspToken)
- **`src/middleware/`**: Authentication (auth.js, tempTokenAuth.js), rate limiting, request logging, error handling
- **`src/database/`**: Database connection (Sequelize + Redis client initialization)
- **`src/utils/`**: Shared utilities (logger.js)
- **`src/public/`**: Frontend dashboard (index.html, app.js, styles.css)
- **`scripts/`**: Database migrations, seed scripts, token generation, log viewing utilities

### Core OCPI 2.2 Implementation

The application implements the full OCPI 2.2 specification with these key endpoints:

- **Versions & Credentials**: `/ocpi/2.2/versions`, `/ocpi/2.2/details`, `/ocpi/2.2/credentials` (POST/PUT)
- **CPO Modules**: `/ocpi/cpo/2.2/locations`, `/ocpi/cpo/2.2/evses`, `/ocpi/cpo/2.2/tariffs`, `/ocpi/cpo/2.2/tokens`, `/ocpi/cpo/2.2/sessions`, `/ocpi/cpo/2.2/cdrs`
- **eMSP Modules**: `/ocpi/emsp/2.2/locations`, `/ocpi/emsp/2.2/evses`, `/ocpi/emsp/2.2/tariffs`
- **Real-time Authorization**: `POST /ocpi/cpo/2.2/tokens/{token_uid}/authorize` (OCPI 2.2.1)
- **Commands**: `POST /ocpi/cpo/2.2/commands/START_SESSION`, `POST /ocpi/cpo/2.2/commands/STOP_SESSION`

### Dynamic Configuration Pattern

The application uses environment variables for multi-tenant/multi-country support:

```javascript
// Always use these variables, never hardcode values:
process.env.OCPI_PARTY_ID        // e.g., "IPD", "IVN"
process.env.OCPI_COUNTRY_CODE    // e.g., "ES", "PT"
process.env.OCPI_VERSION         // e.g., "2.2"
process.env.OCPI_BASE_URL        // Base URL for notifications
```

**Pattern**: All OCPI responses, URLs, headers (User-Agent), EVSE IDs, and database filters MUST use these environment variables dynamically. Never hardcode party_id or country_code in SQL queries or API responses.

### Authentication & Security

- **OCPI Token Auth**: Middleware in `src/middleware/auth.js` validates tokens from `ocpi_tokens` table
- **Temporary Token Auth**: `src/middleware/tempTokenAuth.js` for dashboard access
- **Rate Limiting**: Configurable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`
- **Token Management**: Use `scripts/generate-ocpi-token.js` to create/list/deactivate tokens

### Database Patterns

- **Sequelize without auto-sync**: Database schema is managed via explicit SQL scripts in `scripts/init_database.sql`
- **Migrations**: All schema changes go through `scripts/migrate_*.sql` files
- **Data seeding**: Use `scripts/complete_database_setup.sql` for full dataset (locations, EVSEs, tariffs, tokens)
- **JSONB fields**: Connectors, capabilities, and other complex structures use JSONB columns

### Service Layer Patterns

Key background services that run on intervals:

- **evseNotificationService**: Sends EVSE status updates to connected eMSPs
- **chargingNotificationService**: Notifies eMSPs of charging session updates
- **emspLocationsSyncService**: Syncs locations from external CPOs
- **emspTariffsSyncService**: Syncs tariffs from external CPOs
- **emspTokensSyncService**: Syncs tokens from external CPOs

These services use intervals configured via `*_INTERVAL_MS` environment variables.

### Logging Standards

Always use the Winston logger from `src/utils/logger.js`:

```javascript
const logger = require('./utils/logger');
logger.info('Message');
logger.error('Error', { error });
logger.debug('Debug details', { data });
```

Logs are streamed to the dashboard via Server-Sent Events (SSE) at `/logs/stream`.

## Testing Approach

- **Jest + Supertest**: API integration tests
- **Test Location**: Colocate tests near features (`src/api/__tests__/*.spec.js`)
- **Coverage Focus**: OCPI token handling, database/Redis coordination, authentication flows
- **Test Utilities**: Use `scripts/test-monitoring.js` for monitoring payload generation

## Common Development Tasks

### Adding a New OCPI Endpoint

1. Create route handler in `src/api/` (follow existing patterns in `locations.js`, `evses.js`)
2. Add authentication middleware: `authMiddleware` for OCPI token validation
3. Use dynamic configuration variables (OCPI_PARTY_ID, OCPI_COUNTRY_CODE)
4. Add proper OCPI 2.2 response format with status_code, data, timestamp
5. Include Swagger JSDoc comments for API documentation
6. Register route in `src/server.js`

### Modifying Database Schema

1. Create migration file: `scripts/migrate_description.sql`
2. Test migration on local database
3. Update corresponding Sequelize model in `src/models/`
4. Document changes in commit message

### Adding a Background Service

1. Create service file in `src/services/` (follow pattern from `evseNotificationService.js`)
2. Add interval configuration in `.env`
3. Initialize service in `src/server.js` after database connection
4. Add graceful shutdown logic in server shutdown handler

### Working with eMSP/CPO Connections

- **CPO Mode**: Serving data to external eMSPs via `/ocpi/cpo/2.2/*` endpoints
- **eMSP Mode**: Receiving data from external CPOs, storing in `emsp_*` tables
- **Credentials Exchange**: Use `POST /ocpi/2.2/credentials` for initial handshake
- **Dashboard Actions**: Frontend provides "Get CPO Locations" button to fetch external data

## Environment Variables

Key required variables (see `.env` for full list):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cpo_ocpi
DB_USER=cpo_user
DB_PASSWORD=cpo_password

# OCPI Configuration (CRITICAL - used everywhere)
OCPI_PARTY_ID=IVN           # Change per operator
OCPI_COUNTRY_CODE=ES        # Change per country
OCPI_VERSION=2.2
OCPI_BASE_URL=https://your-domain.com
OCPI_TOKEN=ocpi_token_xxx   # Default token

# Services
EVSE_NOTIFICATION_INTERVAL_MS=60000
EMSP_LOCATIONS_SYNC_INTERVAL_MS=60000
```

## Code Style

- **StandardJS** enforced via ESLint (2-space indent, no semicolons, single quotes)
- **Naming**: camelCase (variables/functions), PascalCase (classes), UPPER_SNAKE_CASE (env vars)
- **SQL files**: lowercase with underscores
- **Async/Await**: Preferred over callbacks/promises chains
- **Error Handling**: Always use try-catch with proper error logging

## Commit Conventions

Follow conventional commits (as seen in git history):

```
feat: Add START_SESSION and STOP_SESSION endpoints
fix: Correct country_code filtering in locations query
chore: Update database migration scripts
```

Commit messages are in Spanish in this repository. Include context about affected files and motivation.

## Important Gotchas

1. **Never hardcode OCPI_PARTY_ID or OCPI_COUNTRY_CODE** - always use env variables
2. **Sequelize sync is disabled** - all schema changes via SQL scripts
3. **EVSE IDs format**: `{COUNTRY_CODE}*{PARTY_ID}*E{UID}` (dynamically generated)
4. **Pagination**: OCPI 2.2 standard pagination with offset/limit in headers
5. **Token whitelist logic**: ALWAYS, ALLOWED, ALLOWED_OFFLINE, NEVER (see `authorizationService.js`)
6. **Connectors**: Stored as JSONB array in EVSEs, each with tariff_ids array
7. **Dashboard authentication**: Uses temporary tokens, not OCPI tokens

## Database Setup Notes

The database must be initialized in this order:

1. Start containers: `docker-compose up -d`
2. Wait for PostgreSQL readiness
3. Run setup: `docker exec -it cursor-app-1 ./scripts/setup_database.sh`
4. Or manually: Load `init_database.sql`, then `complete_database_setup.sql`

**Backup/Restore**:
```bash
PGPASSWORD=cpo_password pg_dump -h localhost -U cpo_user -d cpo_ocpi > backup.sql
PGPASSWORD=cpo_password psql -h localhost -U cpo_user -d cpo_ocpi < backup.sql
```

## Troubleshooting

- **Dashboard not loading**: Check app logs, verify port 3000, restart app container
- **Logs not streaming**: Verify SSE connection at `/logs/stream`, check browser console
- **OCPI auth failures**: Verify token in `ocpi_tokens` table, check `is_active=true`
- **Database connection errors**: Ensure PostgreSQL is running, verify credentials in `.env`
- **eMSP data not syncing**: Check credentials in `credentials` table, verify external CPO connectivity
