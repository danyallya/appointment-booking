# Aurelle Appointment Studio

Aurelle is an appointment and client workspace for independent beauty and care studios. It gives studio owners a considered daily view of bookings, client relationships, capacity and revenue.

## Product direction

The interface centers the decisions a studio owner makes each morning: what is booked, which requests need attention, where time remains available and how the business is performing. The foundation includes a responsive dashboard, client search, day filters, booking dialog, light/dark appearance, offline shell and PostgreSQL data model. Dashboard figures are presentation fixtures until database-backed workflows are delivered.

## Stack and setup

Next.js App Router, TypeScript, Tailwind CSS with shadcn-inspired local primitives, Prisma/PostgreSQL, React Icons, Recharts/Chart.js and planned jsPDF/SheetJS exports.

Use Node.js 20 or newer and PostgreSQL. Copy .env.example to .env and set DATABASE_URL. Install dependencies, run npm run db:generate, npm run db:push, then npm run dev. Before delivery run npm run lint, npm run typecheck and npm run build.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

The initial schema separates clients, services and appointments, stores prices as integer cents, and indexes appointment time/status. Before real client data is used, add authentication, access controls, retention rules, consent, backups and deployment secret management. See BACKLOG.md and DAILY_WORKFLOW.md for the 30-day release plan and daily review/test/implementation/docs/debug/handoff cycle. Day 00 is the foundation; day 01 begins product behavior.

## Day 01 baseline and route map

- The current product preview is `/`; the existing operational route is `GET /api/health`, and `/offline` is the static offline fallback. Appointment, client, service and reporting routes are not implemented yet.
- The dashboard calendar and metrics use illustrative records. The “New appointment” dialog is a local interaction preview and does not persist a booking or contact a client.
- Browser baseline: opened the dashboard at about 727 CSS pixels wide, checked its responsive shell and current appointment list, toggled light/dark themes, and opened/closed the appointment dialog. The dark theme initially inherited the light text color for the page heading; `.shell` now applies its active theme color. The displayed fixture date was one day behind the run date and is now Tuesday, 27 October 2026.
- PWA cache boundary: the service worker pre-caches only `/offline`, the manifest and icon; it caches only `/_next/static/` assets and those public metadata files. API requests bypass the worker and navigation stays network-only with the offline page as fallback. Cache version `aurelle-shell-v2` clears the prior broad cache on activation.
- Verification tools are Vitest, ESLint, strict TypeScript, Next.js production build and Prisma Client generation. Day 01 passed `npm test` (2 files, 4 tests), `npm run lint`, `npm run typecheck`, `npm run db:generate`, and `npm run build`. No database migration or real client data was used.

## Delivery and review

Aurelle review checks service duration, timezone interpretation and booking overlaps together with customer privacy, accessible appointment dialogs and safe API cache boundaries. Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md) from Day 02 for sequential execution, scope-driven commits and this repository's separate branch/PR with GitHub panel review and merge.

## Contributions and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for reproducible reports, genuine collaboration and product examples such as a booking/setup walkthrough using PostgreSQL and fictitious customers. Contributions follow the product backlog and reviewed PR workflow.
