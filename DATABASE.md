# Aurelle local PostgreSQL lifecycle

Use Node.js 20.12+ for the local seed runner and PostgreSQL 15+. No database is required to view the current synthetic dashboard. Never use a production URL for development migration or fixtures.

## Fresh isolated setup

1. Start your local PostgreSQL service. Create an empty database named `aurelle_dev`, owned by a local development role. Use your own local password; keep it in ignored `.env` only.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to that role's loopback URL, database `aurelle_dev`, schema `public`. Configure password encoding correctly; do not paste credentials into logs or PRs.
3. Run `npm ci`, `npm run db:validate` and `npm run db:generate`.
4. Review `prisma/migrations/202610280001_initial/migration.sql`, then run `npm run db:deploy` against the empty local database. Run `npm run db:status` and confirm no pending migrations.
5. Run `npm run db:seed` twice. It upserts one reserved-domain fictional client and one 30-minute, 4500-cent service in a transaction, preserves existing matching records and creates no real appointment or message. Confirm the counts are unchanged on the second run.

Seed refuses non-loopback hosts, other database names/protocols and unexpected connection options. The guard is a mistake-prevention measure, not authorization for any remote change. The `.env` file is loaded by Node only for the seed; Prisma CLI loads its own environment. Application connection/client code stays server-side.

## Migration review and recovery

The checked-in initial migration was generated from an empty schema without contacting a database. It creates Client, Service and Appointment, unique client email, time/status and client indexes, and foreign keys. Client deletion currently cascades appointments; service deletion is restricted. Review history/retention before implementing client deletion. Prices are integer cents; duration, chronology and overlap validation remain scheduled product rules, not guarantees supplied by this baseline schema. Timestamps represent UTC instants in Prisma; timezone display/availability remains future work.

Use `npm run db:migrate -- --name <meaningful-change>` only for a later reviewed schema change in a disposable development database; inspect SQL and commit the migration. `db:push` is an unversioned experiment command and must not replace tracked migrations. For an existing database, inspect drift/history before baselining; never apply an empty-database migration blindly.

No automatic reset or drop command is provided. To rehearse from scratch, create a new empty local disposable database with the required name after explicitly deciding what existing data can be discarded. Do not reset, truncate or delete another database. Back up useful data first; use a new corrective migration instead of editing an applied migration. Production deployment/backup changes require separate authorization.

## Verification on 2026-10-28

Schema validation, client generation and offline SQL generation are separate from database execution. No local PostgreSQL tools/service or port-5432 listener were found; `db:status` against explicit loopback development settings exited 1 with a schema-engine error. Migration application and twice-run seed verification are blocked until that local service exists. No database success is claimed. Browser access was disabled during the initial local pass; PR #4 was later reviewed in the GitHub panel. It remains Draft until the isolated local database acceptance is complete.
