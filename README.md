# Aurelle Appointment Studio

Aurelle is an appointment and client workspace for independent beauty and care studios. It gives studio owners a considered daily view of bookings, client relationships, capacity and revenue.

## Product direction

The interface centers the decisions a studio owner makes each morning: what is booked, which requests need attention, where time remains available and how the business is performing. The foundation includes a responsive dashboard, client search, day filters, booking dialog, light/dark appearance, offline shell and PostgreSQL data model. Dashboard figures are presentation fixtures until database-backed workflows are delivered.

## Stack and setup

Next.js App Router, TypeScript, Tailwind CSS with shadcn-inspired local primitives, Prisma/PostgreSQL, React Icons, Recharts/Chart.js and planned jsPDF/SheetJS exports.

Use Node.js 20 or newer and PostgreSQL. Copy .env.example to .env and set DATABASE_URL. Install dependencies, run npm run db:generate, npm run db:push, then npm run dev. Before delivery run npm run lint, npm run typecheck and npm run build.

The project-local `.npmrc` is intentionally ignored by Git because registry configuration is machine-specific. Run `npm ci` with your configured registry. If the configured mirror does not provide a dependency, npmjs is an approved fallback for dependency installation.

The initial schema separates clients, services and appointments, stores prices as integer cents, and indexes appointment time/status. Before real client data is used, add authentication, access controls, retention rules, consent, backups and deployment secret management. See BACKLOG.md and DAILY_WORKFLOW.md for the 30-day release plan and daily review/test/implementation/docs/debug/handoff cycle. Day 00 is the foundation; day 01 begins product behavior.
