# Multiplayer AI — Build Plan v1

**Codename:** (working) *Atrium* — one room, one repo, one agent, many people.
**Owner:** OurAI
**Date:** 2026-07-23
**Scope of this document:** Strategy + architecture plan only (no code written). YC Class of '26 theme #1 of 3 (*Multiplayer AI*). Themes #2 (*Cloud for Small Software*) and #3 (*Self-Maintaining APIs*) are explicitly deferred and layer on top of this foundation later.

---

## 1. Recommendation up front

Build one thing first and make it undeniable: **a live, shared agent transcript.** One project backed by one GitHub repo, N humans logged in, a single low-cost AI agent working the repo, and every event it emits streaming to everyone in real time — with any human able to inject a message into the running transcript to steer it.

Everything else you described — the six departments, Slack-style channels, role-based permissions, full GitHub PR automation — is real and worth building, but it is *Phase 2+*. None of it proves value until the core "we are all watching and steering the same agent, live" loop is real. You already chose this narrowing; this plan commits to it.

The single most important architectural decision: **decouple the agent runtime from the sync fabric.** The agent runs on its own always-on worker and only ever *writes events to a shared log*; the clients only ever *read that log*. That one decision is what makes "polling or streaming for N users" trivial instead of a distributed-systems project.

---

## 2. What we are (and are not) building in Phase 1

| In scope (Phase 1) | Deferred (Phase 2+) |
|---|---|
| One project → one GitHub repo | Many repos / repo switching |
| Email/OAuth login, join a project room | Org/workspace management, billing |
| Roles as **cosmetic labels + presence color** (Product/Dev/QA/DevOps/Sales/PM) | Roles as **permissions** (RBAC, approvals, gates) |
| One shared agent per session | Multiple concurrent agents, per-department agent personas |
| Live streaming transcript (append-only event log) | Slack-style multi-channel chat |
| Humans inject messages into the live transcript | Threading, reactions, @-mentions, DMs |
| GitHub: clone/read/write files, commit to a branch | Full PR open/review/merge automation |
| Pluggable persistence (Supabase default) + pluggable model | Self-hosting, enterprise SSO |

**Honest pushback (raised once, then I commit):**
- *Roles as permissions is premature.* You don't yet know how these six functions actually collaborate around a live agent. Ship roles as cosmetic first; earn the right to build RBAC by watching real usage. Building the permission matrix now is weeks of work defending a workflow that doesn't exist yet.
- *"Rip Claude Code's interface" is the wrong place to spend design energy.* The transcript UI is table stakes and a weekend of work. Your actual differentiator is the **shared append-only event log + presence** — that everyone sees the same thing, in order, with late-joiners getting full history for free. Spend the design budget there.
- *The agent runner breaks the "just Vercel + Supabase" simplicity, and that's fine.* Accept one always-on worker host. Do not try to run the agent loop inside a Vercel serverless function — it will time out and you'll fight the platform for a week.

---

## 3. Architecture

Five parts. Only one of them is stateful and long-running (the runner); everything else is either a static/edge web app or managed infrastructure.

| # | Component | Runs on | Job | Why it's separate |
|---|---|---|---|---|
| 1 | **Web client** | Next.js on **Vercel** | The Claude-Code-style transcript UI: render the event stream, message composer, presence, role labels | Stateless, edge-friendly, instant deploys |
| 2 | **Sync fabric** | **Supabase** (Postgres + Realtime) *by default* — pluggable | The shared state: events, messages, presence, session status. Fans out inserts to all clients | Managed Realtime = multi-user live updates with **no custom websocket server** |
| 3 | **Agent runner** | **Always-on worker** (Fly.io / Railway / Render) | Executes the agentic loop (LLM calls + tool execution against a repo workspace); writes every event to the sync fabric | Long-lived + stateful → cannot live in serverless |
| 4 | **Model gateway** | Library inside the runner | Routes LLM calls to a swappable provider (Kimi / DeepSeek / Anthropic / OpenAI) via one interface | Same "feature-flag the vendor" philosophy you asked for on the DB, applied to the model |
| 5 | **GitHub integration** | Library inside the runner | Clone/pull the repo into the runner's workspace; read/write files; commit to a branch | Keeps repo state next to the agent's tools |

### 3.1 The core loop (why fan-out is free)

```
        ┌────────────┐   writes events    ┌─────────────────────┐
        │  Agent      │ ─────────────────► │  Sync fabric        │
        │  runner     │   (append-only)    │  (Supabase:         │
        │  + tools    │                    │   events table +    │
        │  + model    │ ◄───────────────── │   Realtime broadcast)│
        └────────────┘   reads injected    └─────────┬───────────┘
                         human messages               │ push (websocket)
                                                       │ or poll (?since=cursor)
                         ┌─────────────┬───────────────┼───────────────┐
                         ▼             ▼               ▼               ▼
                     Product        Dev             QA            Sales/PM…
                   (browser tab) (browser tab)  (browser tab)   (browser tabs)
```

The runner never talks to browsers directly. It appends to an ordered `events` log. Supabase Realtime broadcasts each insert to every connected client, and a late-joiner simply queries the log for history, then subscribes. **Late-joiner backfill is free because the transcript is just rows.** This is the whole trick.

### 3.2 Streaming vs. polling (support both, one interface)

You asked for "polling or streaming." Do both behind a single data-access interface:
- **Default = push:** Supabase Realtime (websockets). Zero server code.
- **Fallback = poll:** client hits `events?since=<cursor>` on an interval. Same data shape. Needed when websockets are blocked or when a swapped-in persistence provider lacks push.
- Toggle via `SYNC_MODE=realtime|polling`.

### 3.3 The one non-obvious design point: token streaming

LLM token streams are high-frequency (tens of events/sec). Writing every token as a durable DB row is wasteful and will hammer Postgres. Split the stream:

| Stream | Mechanism | Persisted? | Who consumes |
|---|---|---|---|
| **Live tokens** (in-flight, cosmetic) | Supabase Realtime **Broadcast** (ephemeral pub/sub) | No | Currently-connected clients, for the "typing live" effect |
| **Committed events** (final message, tool call, tool result, diff, status) | Row inserted into `events` | Yes | Everyone, including late joiners (via history query) |

A late-joiner gets all committed rows, then subscribes to broadcast to see the block that's currently streaming. This keeps the durable log clean and the DB cheap while still feeling live.

### 3.4 Pluggability (your feature-flag requirement, generalized)

Two vendor boundaries, both behind interfaces, both env-flagged:

```
PERSISTENCE_PROVIDER = supabase (default) | convex | postgres-custom | …
MODEL_PROVIDER       = kimi (default) | deepseek | anthropic | openai | openrouter
MODEL_ID             = moonshotai/kimi-k2.6 (default)
SYNC_MODE            = realtime (default) | polling
GITHUB_MODE          = readonly | branch (default) | pr
```

Define `PersistenceAdapter` and `ModelProvider` TypeScript interfaces; ship the Supabase and Kimi implementations first. Anyone can add another adapter without touching the app.

---

## 4. Data model (Phase 1)

Append-only event log is the heart of the system — it's the shared transcript, the audit trail, and the replay mechanism all at once.

| Table | Key columns | Notes |
|---|---|---|
| `users` | (Supabase Auth) | Managed by Supabase Auth |
| `projects` | id, name, github_repo, default_branch, created_by, created_at | One project = one repo (Phase 1) |
| `project_members` | project_id, user_id, role, color | `role` ∈ {product, dev, qa, devops, sales, pm} — **cosmetic in Phase 1** |
| `sessions` | id, project_id, status, agent_model, created_by, started_at, ended_at | `status` ∈ {idle, running, paused, error}; one agent run |
| `events` | id, session_id, **seq**, type, author_type, author_id, content (jsonb), created_at | Append-only, ordered by `seq`; the transcript |
| `presence` | (Realtime Presence, ephemeral) | Who's connected, cursor, typing — not a table |

`events.type` ∈ {message, tool_call, tool_result, diff, status, system}.
`events.author_type` ∈ {human, agent, system}.

Everything a viewer sees is a projection of `events` ordered by `seq`. Steering the agent = inserting a `{type: message, author_type: human}` row that the runner is watching for.

---

## 5. Repo layout ("extrapolate the repo")

Monorepo, Turborepo + pnpm. This is the blueprint to `git init` against — I interpreted "extrapolate the repo" as *lay out the exact structure and Day-1 commands so a follow-up build session can scaffold it directly.*

```
atrium/
├─ apps/
│  ├─ web/                 # Next.js (Vercel): UI, auth, data hooks
│  └─ runner/              # Long-running agent worker (Fly/Railway)
├─ packages/
│  ├─ persistence/         # PersistenceAdapter interface + supabase adapter (default)
│  ├─ model-gateway/       # ModelProvider interface + kimi/deepseek/anthropic adapters
│  ├─ agent-core/          # agentic loop: plan → act → observe; tool registry
│  ├─ tools/               # fs read/write, git, shell, github tools
│  └─ shared/              # event schema, zod validators, shared types
├─ infra/
│  ├─ supabase/migrations/ # SQL for the tables in §4
│  └─ env/                 # .env.example templates per app
├─ docs/
│  ├─ PLAN_Multiplayer_AI_v1.md   # this file
│  └─ adr/                 # architecture decision records
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

**Day-1 commands (for the follow-up scaffold session):**
```bash
pnpm dlx create-turbo@latest atrium
cd atrium
pnpm add -w -D turbo
# apps/web
pnpm create next-app apps/web --ts --tailwind --app
# supabase
pnpm dlx supabase init && pnpm dlx supabase start
# packages
mkdir -p packages/{persistence,model-gateway,agent-core,tools,shared}
# runner
mkdir -p apps/runner && cd apps/runner && pnpm init
```

---

## 6. Phasing & timeline

Phase 1 target: **demo-ready by 2026-08-13 (Wed)** — three focused weeks. Each week ends with a thing that visibly works.

| Phase | Window | Milestone (acceptance = "this visibly works") | Primary owner |
|---|---|---|---|
| **0 — Plan** | done 2026-07-23 | This document | You |
| **1a — Multiplayer skeleton** | 2026-07-23 → 2026-07-30 | Repo scaffold; `PersistenceAdapter` + Supabase adapter; auth; empty transcript room where **two logged-in tabs see each other's presence and each other's messages live**. *No agent yet.* | Dev |
| **1b — Live agent transcript** | 2026-07-31 → 2026-08-06 | Runner service + `agent-core` loop + model gateway on a cheap model; **agent events stream runner → events log → all clients**; humans can inject a steering message | Dev |
| **1c — GitHub + polish + deploy** | 2026-08-07 → 2026-08-13 | GitHub clone + file tools + branch commit; token-streaming split (broadcast vs. durable); polling fallback; deployed to Vercel + Fly | Dev / DevOps |
| **2 — Roles & channels** | 2026-08-14 → TBD | Role permissions, Slack-style channels, full PR flow | — |
| **3 — Multi-agent** | TBD | Concurrent agents, department personas | — |

**Phase 1 demo acceptance test (the bar):** *Two people open two browser tabs, log into the same project, kick off the agent on a real repo, both watch tokens stream in real time, and either person types a message that visibly redirects what the agent does next.* If that works, the wedge is proven.

---

## 7. Cost math

The economic story is the pitch, so here's the math. **Key point: cost scales with agent-compute, not with seats.** Six people watching one shared agent cost the same as one person watching it — that's the multiplayer advantage in dollars.

**Assumptions (stated so they can be argued):** one "agent-hour" ≈ 1.5M input tokens + 0.15M output tokens (agentic coding is input-heavy because context is re-sent each turn). Prices below are list, no caching, for apples-to-apples; caching cuts the input models materially further (DeepSeek cache-hit ≈ $0.02/M → up to ~90% off repeated input).

| Model | Input $/M | Output $/M | Cost / agent-hour | Cost / team-month* |
|---|---|---|---|---|
| **DeepSeek V3.2** | $0.214 | $0.322 | **$0.37** | **~$49** |
| DeepSeek V3.1 | $0.25 | $0.95 | $0.52 | ~$68 |
| Kimi K2.5 | $0.60 | $3.00 | $1.35 | ~$178 |
| **Kimi K2.6** (recommended default) | $0.95 | $4.00 | **$2.03** | **~$268** |
| Frontier (Claude-class, ~$3/$15, reference) | ~$3 | ~$15 | ~$6.75 | ~$891 |

\* *team-month = one shared agent running ~6 active hours/day × 22 working days = 132 agent-hours.*

**Infra on top of model cost (MVP scale):** Vercel Pro ~$20, Supabase Pro ~$25, runner host (Fly/Railway) ~$5–20. Call it **~$50/month** of fixed infra.

**Bottom line:** a full cross-functional team's shared AI pair costs roughly **$100–320/month all-in** on Kimi K2.6, or **~$100/month all-in** on DeepSeek V3.2 — versus ~$900+/month of model compute alone on a frontier model. That ~10–18× spread is the wedge.

### Model recommendation

Default to **Kimi K2.6** for agentic/tool-use quality; expose **DeepSeek V3.2 as a "cost mode" toggle** through the same model gateway. Both speak an OpenAI-compatible API, so route through the gateway (direct or via OpenRouter) and let `MODEL_ID` swap them. Note: you referenced "Kimi3" — as of July 2026 the current line is **K2.5 / K2.6** (plus a K2.7 *Code* variant with a published cache-hit rate ~$0.19/M); there is no K2.3/Kimi3, so I defaulted to K2.6.

---

## 8. Top risks & how the design handles them

| Risk | Mitigation baked into this plan |
|---|---|
| Agent loop times out in serverless | Runner is a dedicated always-on worker; serverless never runs the loop |
| Token stream hammers the DB | Ephemeral Broadcast for live tokens; only committed events are durable rows |
| Late joiners see a broken/partial transcript | Append-only ordered `events` log = free history replay |
| Vendor lock-in (DB or model) | `PersistenceAdapter` + `ModelProvider` interfaces, env-flagged |
| Scope creep back into the full 6-dept vision | Roles cosmetic in Phase 1; RBAC gated behind proven usage |
| Two people edit/steer at once → chaos | Single ordered log + `seq` gives deterministic ordering; last-writer-wins on injected messages, agent reads them in `seq` order |
| GitHub write access is scary | Phase 1 commits to a **branch** only (`GITHUB_MODE=branch`); PR/merge automation is Phase 2 |

---

## 9. How this sets up YC themes #2 and #3

This isn't a throwaway MVP — it's the substrate for the other two themes:
- **Cloud for Small Software (#2):** once a team can spin up a shared agent against a repo, "the cloud" becomes *the runner + persistence you already built*, offered per-project. The agent runner is literally a small-software host.
- **Self-Maintaining APIs (#3):** the same agent loop, pointed at a repo on a schedule with a maintenance goal, *is* a self-maintaining service. Phase 3's "multiple concurrent agents" is the on-ramp.

Build the shared transcript well and the next two themes are configurations of it, not new products.

---

## 10. Immediate next actions

1. Approve the codename / naming (or keep *Atrium* as placeholder).
2. Confirm runner host preference (Fly.io vs. Railway vs. Render) — I recommend **Fly.io** for always-on containers with cheap scale-to-a-few.
3. Green-light a follow-up build session to execute the **Day-1 scaffold (§5)** and **Phase 1a (§6)** — I can generate the repo, migrations, adapters, and the multiplayer skeleton in one pass.
4. Decide GitHub auth model: **GitHub App** (cleaner, scoped) vs. **PAT** (faster to start). Recommend PAT for Phase 1a, App by Phase 1c.

---

*Sources for pricing: Kimi K2.6/K2.5 rates via benchlm.ai and pricepertoken.com (Jul 2026); DeepSeek V3.1/V3.2 rates via pricepertoken.com (Jul 2026). List prices; verify at contract time.*
