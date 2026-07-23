# ADR 0002 — One agent = one branch = one git worktree

- **Status:** Accepted
- **Date:** 2026-07-23

## Context

Any team member can submit a request, and several may submit at once. Each
submission runs its own agent that reads and writes files in the repo. Parallel
agents sharing a single working copy would clobber each other.

## Decision

The orchestrator keeps a single clone and creates a **git worktree per active
agent session**, each on its own `ourai/<slug>` branch. Worktrees let many
branches be checked out simultaneously from one clone, cheaply. Concurrency is
capped (`MAX_CONCURRENT_AGENTS`, default 3); submissions beyond the cap queue.

## Consequences

- Parallel submissions never collide — isolation is physical.
- **Branches outstanding ≠ agents running.** Many branches can sit in the review
  queue while only a few agents burn tokens — this is also the cost control
  (see [ADR 0003](./0003-open-core-license-split.md) is separate; cost detail in
  the plan §7).
- Nothing reaches the default branch without a human clicking merge (no
  auto-merge in Phase 1).
- The orchestrator is stateful and long-running — it runs on an always-on host
  (Fly.io / Railway), never serverless.
