# Aurelle daily delivery cycle — effective Day 02

Follow [DELIVERY-POLICY.md](DELIVERY-POLICY.md). Complete Aurelle before the next portfolio repository, or record a concrete external blocker and next action.

1. Read AGENTS.md, DELIVERY-POLICY.md, BACKLOG.md, README.md, DAILY-LOG.md and Git state/history. Preserve user changes and reconcile the previous PR receipt.
2. Work only on the manually requested day. If already complete, review/reconcile its result and report that state; do not automatically advance to a later day.
3. Fetch the remote and start a descriptive `day-NN/<booking-scope>` branch from current `origin/main`.
4. Review prior booking code for duration/overlap rules, integer-cent pricing, timezone interpretation, client privacy and service-worker exclusions. Fix relevant regressions first.
5. Add meaningful tests for changed behavior and error paths, implement the scoped booking feature and debug the affected flows. Check appointment keyboard/focus behavior, phone/tablet layouts and both themes when touched.
6. Run relevant tests, lint, typecheck and production build. Record actual commands and limitations; a different project's result does not count here.
7. Update product/API/setup guidance and BACKLOG.md with discoveries, acceptance evidence and the next day's exact criteria.
8. Choose commit count, boundaries and wording from Aurelle's actual changes. Keep coherent code/tests/docs together; avoid fixed quotas, copied messages and activity-only commits.
9. Push this branch and open its own PR to this repository's `main`. Inspect every changed file, the final pushed head, Checks and the conversation in GitHub. Resolve findings and repeat affected validation after new commits.
10. Merge through the GitHub panel only when its gates pass. An author review is not an independent approval; record missing required reviewers as blockers and never bypass protection.
11. Confirm Merged, fetch and fast-forward local `main` to `origin/main`, retain the pushed branch and confirm a clean worktree. Then proceed to the next portfolio repository.
12. DAILY-LOG.md records the actual pre-merge scope, commands, known commits, branch/PR status and next day. Record the final panel merge SHA and sync receipt in the workspace DELIVERY-RECEIPTS.md and reconcile it at the next authorized log update.
