# Daily delivery cycle

1. Read AGENTS.md, BACKLOG.md, README.md, recent commits and branch. Note unfinished work, bugs and user changes.
2. Review yesterday's code for correctness, accessibility, security, responsive behavior and missed edge cases; fix findings before adding work.
3. Select the scheduled backlog day. If complete, use handoff notes and continue the next unfinished item without duplication.
4. Write or update focused tests for prior behavior and today's feature, including validation, errors and accessible/responsive states where practical.
5. Implement today's slice end to end. Check touched screens in light and dark themes.
6. Debug affected flows. Run lint, typecheck, focused tests and production build; inspect phone, tablet and desktop where possible.
7. Update README, API/data notes and backlog; add discoveries with priority and testable acceptance criteria.
8. Leave files, dependencies and acceptance criteria for tomorrow. Commit reviewed changes; push the daily branch only after its remote and authentication are configured.

Daily log: date/day; previous code reviewed; tests updated; delivered behavior; bug fixes; command outcomes; docs/backlog; blockers; next-day criteria.