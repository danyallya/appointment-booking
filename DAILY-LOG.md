# Daily work log

## Day 00 — foundation (2026-10-26, Asia/Tehran)

- Prepared the product-specific Next.js/TypeScript workspace, responsive interface, light/dark theme, React Icons, PWA shell, README, AGENTS.md and 30-day backlog.
- Review: inspected the starter page, tests, database schema/config, build, Git ignore rules and local registry setup; corrected issues found by checks before recording a passing result.
- Dependencies: generated package-lock.json and installed packages after Nexus 404s. The user approved npmjs fallback. Local .npmrc remains ignored, preserves Nexus as default and maps only required scopes. No private registry config is tracked.
- Checks: npm test passed (1/1), npm run lint passed, npm run typecheck passed, and npm run build passed. The production build emitted the PWA manifest/service-worker shell.
- Database setup: npm run db:generate generated Prisma Client from the local schema. No real database connection or data push was attempted.
- GitHub: Day 00 foundation commit af23b0a is pushed to both main and day-00-foundation: https://github.com/danyallya/appointment-booking. Day 01 has not started.
- Schedule: Day 01 has not started. The next task is Day 01 in BACKLOG.md; wait for the user to trigger that day.

## Day 01 — baseline quality (2026-10-27, Asia/Tehran)

- Review: inspected the dashboard, modal, Prisma schema, health/offline routes, theme variables, PWA worker and prior tests. Browser review at about 727 CSS pixels showed low-contrast heading text in dark mode and a stale fixture date; the service worker also cached every successful same-origin GET, including dynamic pages and future API responses.
- Implementation: the shell now applies its active theme text color, the fixture date matches Tuesday, 27 October 2026, and the worker caches only the offline shell plus public static assets. API requests bypass it, navigation stays network-only with an offline fallback, and cache version `aurelle-shell-v2` removes the older broad cache. Added cache-boundary tests and page-render checks.
- Browser: verified the dashboard, dark and light themes, appointment modal labels, and open/close behavior in the internal browser. Rechecked the dark theme after its contrast fix.
- Checks: `npm test` passed (2 files, 4 tests); `npm run lint`, `npm run typecheck`, `npm run db:generate`, `npm run build`, and `git diff --check` passed. No database migration or client data was used.
- GitHub: implementation/docs commit `da8e648` (`fix: protect appointment data from service-worker caching`) was pushed to `day-01/baseline-quality`, fast-forwarded to `main`, and `main` was pushed. This log entry will be included in the final sync.
- Next: Day 02 — validate the Prisma schema and document repeatable local PostgreSQL setup.

## Review workflow maintenance — 2026-10-27

- The user requested careful sequential project execution, commit content/counts suited to each product and an independent branch/PR per repository with panel review and merge.
- Aurelle review checks service duration, timezone interpretation and booking overlaps together with customer privacy, accessible appointment dialogs and safe API cache boundaries. Added a standalone delivery policy and entry points in AGENTS, README and BACKLOG.
- Documentation-only maintenance on `docs/aurelle-booking-review`; Markdown diff reviewed and `git diff --check` used. No application tests/build rerun for this process change. Next product work: Day 02 — Prisma schema validation and repeatable local PostgreSQL setup with migration guidance.
- This is the pre-merge log state. The portfolio workspace DELIVERY-RECEIPTS.md records the actual PR URL, checked head, panel gates, merge SHA and sync afterward; reconcile it here in the next authorized update.
- Commit boundary: `dae77d5` establishes the booking review policy. This follow-up repairs DAILY_WORKFLOW.md to stay on the manually requested day and require the complete PR/panel-merge/sync handoff rather than treating a branch push as delivery.

## Contribution guidance maintenance — 2026-10-27

- User request: integrate achievable GitHub profile goals naturally into future project work. Added Aurelle Appointment Studio contribution guidance around a synthetic timezone/overlap booking case with explicit duration and expected availability and useful documentation examples. Preserved the daily backlog and all delivery gates.
- Previous delivery-policy PR #1 is merged in origin/main; this maintenance starts from that merged history. No badge, collaborator, star or accepted answer is claimed.
- Documentation-only scope on docs/aurelle-booking-contributors; reviewed Markdown and git diff --check. App tests/build are not rerun because runtime behavior is unchanged.
- External blocker: local browser use is disabled in Work settings. PR creation, panel review and merge remain pending; resume from this branch when browser access is available, inspect existing PRs first, target main and follow all gates.
- Publication is pre-merge here; the final PR/head/panel/check/merge/sync evidence goes in the workspace DELIVERY-RECEIPTS.md after completion. Next: Day 02 — Prisma schema validation and repeatable local PostgreSQL setup with migration guidance. Wait for the user's day trigger.

## Day 02 — PostgreSQL setup — 2026-10-28

- Reconciled merged policy/contribution PRs #1/#2 at main befaa47. Reviewed schema, server-only client, prior cache-boundary tests and deletion/index rules. Added the generated additive initial PostgreSQL migration, migration status/deploy/dev commands and a guarded synthetic client/service seed. Existing client cascade history risk is documented before future deletion work.
- DATABASE.md explains fresh isolated setup, migration review, repeat seed verification and non-destructive recovery. Seed permits only loopback PostgreSQL database aurelle_dev, rejects unexpected options, preserves existing matching fixtures and creates no appointments/messages. Node 20.12+ loads ignored .env; no dependency versions changed.
- Prisma validate and generate passed. Offline migrate diff SQL generation passed; staged review caught an extra EOF blank line and fixed it. Six tests, lint, explicit typecheck passed; production build result is in the workspace receipt. All ten changed files read locally before this log; only the shareable .env.example template is included, never .env/.npmrc or output.
- Local prerequisites blocked: no PostgreSQL binaries/service or 5432 listener found. db:status with explicit loopback development URL exited 1, schema engine error. No migration/seed application or repeatability success claimed. Start local PostgreSQL/create aurelle_dev, review/apply db:deploy, run db:status and seed twice to finish acceptance.
- At the first local-only pass, Work browser access prevented panel review. It is now restored: PR #4 exists, explicitly targets `main`, and the then-current head `508a5dbad8ab28e7156880ecfbf1abe7c53b4195` was reviewed in GitHub across all 11 files; Checks showed 0 configured runs and conversation reported no conflicts. Author review [5678153507](https://github.com/danyallya/appointment-booking/pull/4#pullrequestreview-5678153507) is COMMENTED, not independent approval. The PR remains Draft because PostgreSQL migration apply and twice-run seed acceptance are still blocked by the absent local service. Day 01 retrospective review is [commit comment 206996170](https://github.com/danyallya/appointment-booking/commit/da8e648386ab3e5204f9b96506faff8acf8b9861#commitcomment-206996170); Issue #3 tracks the future booking interval/duration write constraints. Re-review any new pushed documentation head before merge; no CI, live DB or badge claim.
- Next: finish database/panel gates, then Day 03 service reads and price/duration/active validation on its manual trigger. No production or real-client change occurred.
