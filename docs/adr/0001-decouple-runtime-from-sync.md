# ADR 0001 — Decouple the agent runtime from the sync fabric

- **Status:** Accepted
- **Date:** 2026-07-23

## Context

Multiple humans need to watch and steer a running agent in real time. The naive
approach — the agent process pushing to browsers directly — turns "live updates
for N users" into a bespoke distributed-systems problem (websocket servers,
backpressure, late-joiner replay).

## Decision

The agent runtime (orchestrator) only ever **writes events to a shared,
append-only log**. Clients only ever **read that log**. The sync fabric
(Supabase Postgres + Realtime) fans each insert out to connected clients, and a
late-joiner simply queries the log for history, then subscribes.

## Consequences

- Fan-out to N humans is free — the transcript is just rows.
- Late-joiner backfill is free — replay the ordered log.
- The orchestrator must be an always-on worker (it cannot run in a serverless
  function that times out); see [ADR 0002](./0002-worktree-per-agent.md).
- Persistence is behind a `PersistenceAdapter` interface, so the fabric is
  swappable (`PERSISTENCE_PROVIDER`).
