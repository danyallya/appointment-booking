# Aurelle Appointment Studio

Aurelle is an appointment and client workspace for independent beauty and care studios. It gives studio owners a considered daily view of bookings, client relationships, capacity and revenue.

## Product direction

The interface centers the decisions a studio owner makes each morning: what is booked, which requests need attention, where time remains available and how the business is performing. The foundation includes a responsive dashboard, client search, day filters, booking dialog, light/dark appearance, offline shell and PostgreSQL data model. Dashboard figures are presentation fixtures until database-backed workflows are delivered.

## Stack and setup

Next.js App Router, TypeScript, Tailwind CSS with shadcn-inspired local primitives, Prisma/PostgreSQL, React Icons, Recharts/Chart.js and planned jsPDF/SheetJS exports.

Use Node.js 20.12 or newer and local PostgreSQL. Follow [DATABASE.md](DATABASE.md) for the isolated `aurelle_dev` database, tracked migration, validation and synthetic seed. Use `db:deploy` for the reviewed initial migration; `db:push` does not replace migration history. Run npm run dev for the preview, and lint/typecheck/tests/build before delivery.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

The initial schema separates clients, services and appointments, stores prices as integer cents, and indexes appointment time/status. Before real client data is used, add authentication, access controls, retention rules, consent, backups and deployment secret management. See BACKLOG.md and DAILY_WORKFLOW.md for the 30-day release plan and daily review/test/implementation/docs/debug/handoff cycle. Day 00 is the foundation; day 01 begins product behavior.

## Day 01 baseline and route map

- The product preview is `/`; operational routes include `GET /api/health` and the Day 03 public `GET /api/services` catalog. Day 04 adds `/clients` and `GET/POST /api/clients` for a local development preview only. Day 05 adds `POST /api/appointments` with the same development and loopback `aurelle_dev` guard. The appointment API requires a loopback URL/origin and an explicit timezone offset; it derives the end time from the current active service, checks active overlaps and stores a `REQUESTED` appointment. `/offline` is the static offline fallback. This endpoint is an unauthenticated local preview and must not be exposed to real clients before authentication and authorization (Days 16–17).
- The dashboard calendar and metrics use illustrative records. The “New appointment” dialog is a local interaction preview and does not persist a booking or contact a client.
- Browser baseline: opened the dashboard at about 727 CSS pixels wide, checked its responsive shell and current appointment list, toggled light/dark themes, and opened/closed the appointment dialog. The dark theme initially inherited the light text color for the page heading; `.shell` now applies its active theme color. The displayed fixture date was one day behind the run date and is now Tuesday, 27 October 2026.
- PWA cache boundary: the service worker pre-caches only `/offline`, the manifest and icon; it caches only `/_next/static/` assets and those public metadata files. API requests bypass the worker and navigation stays network-only with the offline page as fallback. Cache version `aurelle-shell-v2` clears the prior broad cache on activation.
- Verification tools are Vitest, ESLint, strict TypeScript, Next.js production build and Prisma Client generation. Day 01 passed `npm test` (2 files, 4 tests), `npm run lint`, `npm run typecheck`, `npm run db:generate`, and `npm run build`. No database migration or real client data was used.

## Day 02 PostgreSQL data foundation

The tracked initial Prisma migration creates Client, Service and Appointment with client/service relationships and schedule indexes. On 2026-11-01 it was applied to a separate `aurelle_dev` database on a temporary loopback PostgreSQL 18.6 cluster; `npm run db:status` reported no pending migrations. Repeated seed runs preserved the same synthetic totals (1 client, 1 service, 0 appointments). The sample dashboard still uses illustrative data; this database setup does not claim persistent booking workflows or use real client records.

## Day 03 service catalog

`GET /api/services` returns the active service catalog in name order, selecting only public service fields. The route validates non-empty IDs/names, integer non-negative prices in cents, positive integer durations and active state. If database rows violate those invariants or the database read fails, it returns a generic `503` with `Cache-Control: no-store`; database details are not sent to the caller. The tracked Day 03 migration enforces positive duration and non-negative price and adds an `(active, name)` index. The endpoint is read-only and exposes no client or appointment data; no service-management write route exists yet.

## Day 04 local client directory

`/clients` provides a responsive client list, search by name/email/phone, empty states, theme toggle and a small add-client form. `GET /api/clients` selects only directory fields and sorts by name/email; `POST /api/clients` trims names, lowercases email, normalizes optional phone numbers and returns generic validation/conflict/database errors with `Cache-Control: no-store`. A database migration checks normalized values and indexes client names.

This is a local synthetic-data preview, not an authenticated customer feature. Both the page and APIs return 404 unless `NODE_ENV=development` and `DATABASE_URL` passes the loopback `aurelle_dev` guard. Do not enter real client details. Authentication and authorization remain scheduled for Days 16–17 before this directory can be used with real records.

Day 04 verification passed 22 tests, lint, typecheck, Prisma validation/generation, production build, migration deploy/status and two seed runs (1 client, 1 service, 0 appointments). A local browser smoke created a fictional QA contact, searched it by phone and removed it afterward; production smoke requests to the page and both API methods returned 404.

## Delivery and review

Aurelle review checks service duration, timezone interpretation and booking overlaps together with customer privacy, accessible appointment dialogs and safe API cache boundaries. Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md) from Day 02 for sequential execution, scope-driven commits and this repository's separate branch/PR with GitHub panel review and merge.

## Day 05 booking rules

`POST /api/appointments` accepts only `clientId`, `serviceId` and an ISO start instant with an explicit `Z` or numeric offset. It verifies the client and active service, derives the end from the stored service duration (bounded to 12 hours), and returns generic validation, not-found, conflict or unavailable responses. Local wall-clock times without an offset and caller-supplied end times are not trusted. The stored timestamps are UTC instants.

The API rejects intersections with existing `REQUESTED` or `CONFIRMED` appointments; `[start, end)` intervals allow back-to-back bookings and cancelled bookings do not block a slot. A PostgreSQL GiST exclusion constraint enforces this across concurrent writers without an extension, and a check constraint rejects empty or reversed intervals. This product currently has a single studio calendar; if multiple rooms/resources are introduced, the exclusion key must include the selected resource. The endpoint remains hidden outside the loopback development preview until authentication and owner authorization are complete.

`npm run db:verify-booking-rules` is an opt-in local acceptance script for the PostgreSQL constraints. `npm run api:verify-booking-rules` smoke-tests the HTTP route against an already running local app at `127.0.0.1:3210` (override with `AURELLE_LOCAL_BASE_URL`). Both require the isolated loopback `aurelle_dev` database and use random `.invalid` synthetic records that they remove afterward. Day 05 verified overlapping active appointments are rejected, adjacent and cancelled overlaps are accepted, and invalid intervals are rejected.

## Contributions and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for reproducible reports, genuine collaboration and product examples such as a booking/setup walkthrough using PostgreSQL and fictitious customers. Contributions follow the product backlog and reviewed PR workflow.
