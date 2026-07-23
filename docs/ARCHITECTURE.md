# Architecture

OurAI is five parts. Only the orchestrator is stateful and long-running;
everything else is a static/edge web app or managed infrastructure.

```
        ┌────────────┐   writes events    ┌─────────────────────┐
        │ orchestrator│ ─────────────────►│  sync fabric        │
        │  + agents   │   (append-only)    │  (Supabase:         │
        │  + tools    │                    │   events table +    │
        │  + model    │ ◄───────────────── │   Realtime)         │
        └────────────┘   reads injected    └─────────┬───────────┘
                         human messages               │ push / poll
                         ┌─────────────┬───────────────┼───────────────┐
                         ▼             ▼               ▼               ▼
                     Product        Dev             QA            Sales/PM…
                   (browser tab) (browser tab)  (browser tab)   (browser tabs)
```

## The core loop (why fan-out is free)

The orchestrator never talks to browsers directly. It appends to an ordered
`events` log. Supabase Realtime broadcasts each insert to every connected
client; a late-joiner queries the log for history, then subscribes.
**Late-joiner backfill is free because the transcript is just rows.**

## Components

| # | Component        | Package / app             | Responsibility |
|---|------------------|---------------------------|----------------|
| 1 | Web client       | `apps/web`                | Transcript UI, presence, idea board, branch view, diff + merge |
| 2 | Sync fabric      | `@ourai/persistence`      | `events` log + Realtime fan-out; pluggable behind `PersistenceAdapter` |
| 3 | Orchestrator     | `apps/orchestrator`       | Capped agent pool, worktree-per-agent, queue, budget guard |
| 4 | Model gateway    | `@ourai/model-gateway`    | Swappable `ModelProvider` (DeepSeek default), streaming, budget hooks |
| 5 | Tools            | `@ourai/tools`            | fs / git / shell / github tools bound to a worktree |
|   | Agent loop       | `@ourai/agent-core`       | plan → act → observe; tool registry (persistence-agnostic) |
|   | Shared           | `@ourai/shared`           | Event schema, state machines, branded ids, types |

## Data model

`Company (= 1 GitHub repo) → Idea backlog → Work item (= 1 branch + 1 agent) →
Session (= 1 run) → Events (append-only transcript)`.

DDL lives in [`infra/supabase/migrations`](../infra/supabase/migrations). The
`events` table carries a per-session monotonic `seq` assigned in-DB — the live
cursor for `getEvents(sinceSeq)` and realtime replay.

## Streaming vs. polling

Default push via Supabase Realtime; polling fallback (`events?since=cursor`)
behind one interface (`SYNC_MODE`). Live tokens go over ephemeral Realtime
Broadcast (not persisted); only committed events become durable rows.

## Isolation & concurrency

One agent = one branch = one git worktree from a single clone. Concurrency is
capped (`MAX_CONCURRENT_AGENTS`, default 3); submissions beyond the cap queue.
Cost tracks *running* agents, not branch count. A `BudgetGuard`
(`MONTHLY_BUDGET_USD`) pauses new spawns at the ceiling.

## Pluggability

`PersistenceAdapter` and `ModelProvider` are interfaces; Supabase + DeepSeek
ship first. Swapping either is a config change (`PERSISTENCE_PROVIDER`,
`MODEL_PROVIDER`), not a rewrite.

See the [ADRs](./adr) for the decisions behind this design and the original
[plan](./PLAN_Multiplayer_AI_v2.md).
