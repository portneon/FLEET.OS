# Backend architecture

The active backend uses strict TypeScript, Express, and MySQL through `mysql2`. Business scope is currently limited to staff drivers; the former auth, fleet, finance, transit, trip, and analytics implementations were removed in the earlier scaffold cleanup.

## Staff driver flow

`DriverService -> IDriverRepository <- DriverRepository -> Database -> MySQL`

- `domain/Driver.ts` defines driver inputs and read models without Express or MySQL types.
- `application/DriverService.ts` owns driver use-case validation and tenant context requirements.
- `application/IDriverRepository.ts` is the application boundary for persistence.
- `repositories/DriverRepository.ts` implements that contract with parameterized SQL and transaction boundaries.
- SQL schemas live in `src/database/schemas` for shared tables and `src/modules/<module>/schemas` for module-owned tables.
- `container.ts` is the composition root. Controllers and routes are not yet implemented because there is no active authenticated principal from which to obtain a trusted tenant ID.

Every staff repository operation takes `organizationId` separately from the payload and filters by it. HTTP routes must obtain that ID from an authenticated principal; do not trust an organization ID from a body or arbitrary header.

## Database setup

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in the process environment. `.env.example` documents the expected values but is not loaded automatically.

`npm run db:schema` applies the SQL files in dependency order to an empty database. It is not a versioned migration and is not safe to rerun against an existing database. The old SQLite file in `prisma/dev.db` remains unused data; the Prisma schemas and runtime were removed.

## Commands

- `npm run dev` starts the TypeScript source.
- `npm run build` compiles into `dist/`.
- `npm start` runs the compiled server.
- `npm run db:schema` creates the current staff schema in an empty MySQL database.

The HTTP server currently exposes only `/health`. The previous frontend API contracts are not implemented in this staff-only scaffold.
