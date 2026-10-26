# Aurelle | 30-day product backlog

## Goal and daily gate
Deliver a polished appointment workspace for a boutique care studio: client booking, owner calendar, services, reports and support docs. Every day follows DAILY_WORKFLOW.md: review previous code/issues, add/update tests, implement today's item, debug the affected product, update docs/backlog and define tomorrow. A day is complete only when criteria and checks pass. Add new discoveries with priority, target day and verifiable acceptance.

## Day 00 foundation prepared
Next.js App Router, strict TypeScript, Tailwind, responsive Aurelle dashboard, client search, day filters, booking dialog, theme switch, health route, PWA shell, PostgreSQL Prisma schema, Git ignore rules, README and daily cycle are prepared. Dashboard data is illustrative.

## Day-by-day
### Day 00 validation
Nexus returned 404 for packages used by this project. Following the user's approval, dependencies were installed with npmjs fallback. The ignored local .npmrc preserves Nexus as default and contains only required scope overrides. Tests, lint, typecheck and production build passed; Day 01 has not started.

| Day | Focus | Acceptance |
|---|---|---|
| 01 | Baseline quality | Review foundation; install from approved registry; lint/types/build pass; record browser baseline. |
| 02 | Prisma setup | Validate schema and repeatable local DB setup; document migrations. |
| 03 | Service catalog | Add service reads and validation for price, duration and active state. |
| 04 | Client directory | Persist clients with normalized email/phone; add search and empty states. |
| 05 | Booking rules | Validate duration and prevent overlaps server-side. |
| 06 | Public booking | Build service, date and slot selection for clients. |
| 07 | Confirmation | Persist requests and show reference and next steps. |
| 08 | Calendar data | Replace fixture rows with date queries and timezone-safe formatting. |
| 09 | Calendar interaction | Add day/week navigation and accessible booking details. |
| 10 | Reschedule/cancel | Add safe state transitions, confirmation and audit timestamps. |
| 11 | Request inbox | Let owners accept/decline requests and explain each state. |
| 12 | Service management | Create/edit/archive services with server validation. |
| 13 | Availability | Add business hours, breaks, exceptions and blocked time. |
| 14 | Slot engine | Derive availability from duration and bookings; cover boundaries. |
| 15 | Client profiles | Add history, notes and preferences with privacy boundaries. |
| 16 | Authentication | Add secure owner sign-in, sessions and protected routes. |
| 17 | Authorization | Enforce owner scoping; document access and retention. |
| 18 | Email notifications | Add templates and delivery abstraction with local preview. |
| 19 | Reminders | Add configurable, idempotent appointment reminders. |
| 20 | Analytics | Add weekly booking, utilization and revenue charts with date filters. |
| 21 | CSV/XLSX | Export filtered appointments and revenue with correct time formats. |
| 22 | PDF reports | Add branded reports and verify totals and page breaks. |
| 23 | PWA | Validate installation, updates, offline fallback and cache boundaries. |
| 24 | Responsive QA | Audit phone/tablet/desktop; fix overflow, touch targets and focus. |
| 25 | Accessibility/locale | Keyboard/screen-reader review; standardize locale/timezone display. |
| 26 | Reliability | Add structured errors, health/readiness behavior and safe logs. |
| 27 | Security | Review validation, rate limits, sessions, backups and destructive actions. |
| 28 | Performance/SEO | Measure bundle/rendering, improve metadata and reduce client work. |
| 29 | Release candidate | Run full checks and manual critical, accessibility and responsive review. |
| 30 | Release handoff | Complete deployment guide, env reference, screenshots and release notes. |

Record new issues with priority/day/acceptance; explain moved work in the daily log. Split broad tasks. Completion includes UI, validation, tests, docs and error states.
