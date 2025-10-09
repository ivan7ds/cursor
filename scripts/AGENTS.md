# Repository Guidelines

## Project Structure & Module Organization
The runtime lives in `src/`, with Express route handlers under `src/api/`, domain services in `src/services/`, and shared helpers inside `src/utils/` and `src/middleware/`. Database adapters live in `src/database/` and expose Sequelize and Redis clients used by `setup.js` and the API. Operational tooling is grouped in `scripts/`, where you will find SQL migrations (`migrate_*.sql`), dataset loaders like `complete_database_setup.sql`, and Node utilities (`generate-ocpi-token.js`, `test-monitoring.js`). Reference documentation resides in `docs/`, while `backups/` stores database snapshots. The deployment entry points are `docker-compose.yml`, `Dockerfile`, and `config.example.js`.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies. Use `npm run dev` for a hot-reloaded server, or `npm start` for production parity. Provision data with `npm run setup`, which wraps `scripts/setup.js`; database-only bootstrapping can be done through `./scripts/setup_database.sh`. Schema adjustments belong in targeted Node drivers such as `npm run migrate` or SQL files executed via `psql`. Execute the Jest suite with `npm test`, keep it running during development with `npm run test:watch`, and lint the codebase using `npm run lint` (add `:fix` to auto-correct).

## Coding Style & Naming Conventions
We target Node.js ≥ 18 and enforce StandardJS via ESLint, so default to 2-space indentation, semicolon-less statements, and single quotes. Favor `camelCase` for variables/functions, `PascalCase` for classes, and `UPPER_SNAKE_CASE` for environment variables. SQL assets remain lowercase with underscores (e.g., `migrate_add_external_party_id.sql`). Wrap new logging through `src/utils/logger` and reuse existing service patterns before introducing fresh modules.

## Testing Guidelines
Jest with Supertest backs our API checks; colocate new specs near the feature (for example `src/api/__tests__/locations.spec.js`) and mirror the route or service name. Aim to cover happy-path flows plus failure modes, especially around OCPI token handling and database/Redis coordination. Trigger suites with `npm test`; if you need mocked monitoring payloads, reuse `scripts/test-monitoring.js` against a local server.

## Commit & Pull Request Guidelines
Follow the conventional commit prefixes found in history (`feat:`, `fix:`, `chore:`), keep the summary in Spanish, and provide concise context after the colon. Body text should explain motivation and key files touched. Pull requests must describe user-visible impact, reference related issues, and include screenshots or curl logs when altering endpoints. Always note any database or environment changes and ensure migrations are reversible before requesting review.

## Environment & Data Setup
Duplicate `env.example` to `.env`, customizing OCPI credentials, database endpoints, and Redis URLs. For sandbox spins, `docker-compose up` provisions Postgres and Redis with sane defaults. Sample datasets load via `psql -f scripts/complete_database_setup.sql` or the `npm run seed` workflow; prefer disposable databases when iterating on SQL to avoid polluting production-like instances.
