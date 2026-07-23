# Multiplayer AI — Build Plan v2

**Codename:** (working) *Atrium* — one room, one repo, many people, many agents.
**Owner:** Michael Kaminski / Modular Equity
**Date:** 2026-07-23
**Scope:** Strategy + architecture plan only (no code written). YC Class of '26 theme #1 of 3 (*Multiplayer AI*).

**Changelog from v1 → v2 (this revision):**
1. Roles stay cosmetic in Phase 1, but add an **"act as" role dropdown** (impersonate a role now; wired for real permissions later).
2. **Multiple concurrent agents + branch-per-submission isolation** promoted into Phase 1, plus a **branch / outstanding-work view** to see and preview un-merged work, and a **preview → human-approved merge** flow.
3. **Cost model rebuilt** around DeepSeek V3.2 API with a hard **budget cap + concurrency cap** to hold ≤ $50/month. The rent-a-GPU idea is explicitly rejected with the math.

---

## 1. Recommendation up front

Same wedge, sharpened: **a live, shared, multi-agent workspace over one repo.** Any team member submits a request; each submission spins up its own agent on its own isolated branch; everyone watches all of it stream live; a branch view shows all outstanding (un-merged) work; a human reviews a diff and clicks merge. Nothing touches the main branch without a human approving it.

Two decisions carry the whole design:
- **Decouple the agent runtime from the sync fabric.** Agents only *write events to a shared log*; clients only *read it*. That makes live updates for N users trivial.
- **One agent = one branch = one isolated git worktree.** Parallel submissions never collide because each works in its own checkout. This is what makes "15-20 branches in flight" safe.

And the cost rule that makes it affordable: **branches outstanding ≠ agents running.** You can have 20 branches sitting in the review queue while only 3 agents actually run at once. Cost scales with *running* agents, which you cap.

---

## 2. What we are (and are not) building in Phase 1

| In scope (Phase 1) | Deferred (Phase 2+) |
|---|---|
| One project → one GitHub repo | Many repos / repo switching |
| Login, join a project room | Org/workspace management, billing |
| Roles cosmetic **+ "act as" dropdown** (label, presence color, tags your messages/submissions) | Roles as **permissions** (RBAC, approval gates per role) |
| **Multiple concurrent agents**, capped (default 3 running) | Unlimited concurrency, per-department agent personas |
| **Branch-per-submission isolation** (git worktree per agent) | Cross-branch conflict auto-resolution |
| **Branch / outstanding-work view** + diff preview | Rich review tooling (inline comments, suggestions) |
| **Preview → human-clicks-merge** (branch or PR) | Auto-merge, merge-queue automation |
| Live streaming transcript per work item + a global feed | Slack-style multi-channel chat, threads, DMs |
| Pluggable persistence (Supabase default) + pluggable model | Self-hosting the model, enterprise SSO |

**Honest pushback (raised once, then I commit):**
- *Promoting multi-agent into Phase 1 grows the build by ~a week.* Worth it — it's central to your value model (parallel submissions → preview branches → merge), and retrofitting single-agent code into multi-agent later is more expensive than doing it right now. Timeline below reflects the added week.
- *Roles still stay cosmetic.* The "act as" dropdown is cheap (it just sets a label + tags submissions). Real per-role permissions are weeks of work defending a workflow you haven't watched yet — keep them out of Phase 1. The dropdown gives you the demo feel without the RBAC cost.
- *Never auto-merge.* Keep a human on the merge button in Phase 1. It's safer, it's a better demo ("watch me approve the agent's work"), and it matches how you actually want to operate.

---

## 3. Architecture

Same five parts as v1; the **runner is now an orchestrator** that manages a *pool* of agents, each in its own isolated branch/worktree.

| # | Component | Runs on | Job |
|---|---|---|---|
| 1 | **Web client** | Next.js on **Vercel** | Transcript UI, presence, "act as" dropdown, **branch/outstanding-work view**, diff preview, merge button |
| 2 | **Sync fabric** | **Supabase** (Postgres + Realtime), pluggable | Shared state: events, work items, presence, session/branch status; fans out to all clients |
| 3 | **Agent orchestrator + workers** | One always-on **worker host** (Fly.io / Railway) | Manages a capped pool of agent sessions; each session runs the agentic loop in its **own git worktree on its own branch**; writes events to the sync fabric |
| 4 | **Model gateway** | Library inside the orchestrator | Swappable provider; **default DeepSeek V3.2** via OpenAI-compatible API; budget-aware |
| 5 | **GitHub integration** | Library inside the orchestrator | Clone once; **git worktree per agent**; commit to `agent/<id>` branch; open PR or merge on human approval |

### 3.1 One agent = one branch = one worktree

The orchestrator keeps a single clone of the repo and creates a **git worktree per active agent session**. Worktrees let many branches be checked out simultaneously from one clone, cheaply — exactly the isolation you want when six people submit at once.

```
repo clone (bare-ish, on the worker host)
├─ worktree: agent/abc  →  branch agent/abc   ← agent 1 (running)
├─ worktree: agent/def  →  branch agent/def   ← agent 2 (running)
├─ worktree: agent/ghi  →  branch agent/ghi   ← agent 3 (running)
└─ (queued: jkl, mno, …  ← branches not yet created; work items waiting for a slot)
```

Concurrency is capped (default **3 running**). Submissions beyond the cap **queue**. This is both a resource control and the cost control (see §7). A branch is only created when a queued item gets a slot.

### 3.2 The shared log + fan-out (unchanged, still the trick)

Agents append to an ordered `events` log (scoped per work item, plus a global project feed). Supabase Realtime broadcasts inserts to every client; late joiners query history then subscribe. Fan-out to N humans is free because the transcript is just rows.

### 3.3 Branch / outstanding-work view

A first-class screen listing every work item and its state, so nobody loses track of un-integrated work:

| Column | Meaning |
|---|---|
| **Queued** | Submitted, waiting for an agent slot |
| **Running** | Agent actively working the branch (live transcript) |
| **Needs review** | Agent finished; diff ready to preview |
| **Merged** | Human approved; merged to main / PR merged |
| **Abandoned** | Discarded without merging |

Each row links to its live transcript and a **diff preview**. Merge is a human click → git merge or PR merge. This is your "scroll through what people created, see outstanding work, preview then merge" requirement, made concrete.

### 3.4 Streaming vs. polling, and token streaming

Unchanged from v1: default push via Supabase Realtime, polling fallback (`events?since=cursor`) behind one interface (`SYNC_MODE`). Live tokens go over ephemeral Realtime **Broadcast** (not persisted); only committed events (message / tool_call / tool_result / diff / status) become durable rows. Late joiners get durable history + subscribe to the in-flight block.

### 3.5 Pluggability (feature flags)

```
PERSISTENCE_PROVIDER = supabase (default) | convex | postgres-custom | …
MODEL_PROVIDER       = deepseek (default) | kimi | anthropic | openai | openrouter | self-hosted
MODEL_ID             = deepseek-chat-v3.2 (default)
SYNC_MODE            = realtime (default) | polling
GITHUB_MODE          = branch (default) | pr | readonly
MAX_CONCURRENT_AGENTS = 3          # the cost + resource cap
MONTHLY_BUDGET_USD   = 40          # model spend ceiling; pauses new spawns when hit
```

`PersistenceAdapter` and `ModelProvider` are interfaces; ship Supabase + DeepSeek first. Swapping either is a config change, not a rewrite — including a future self-hosted model, if the economics ever justify it (§7).

---

## 4. Data model (Phase 1)

| Table | Key columns | Notes |
|---|---|---|
| `users` | (Supabase Auth) | Managed |
| `projects` | id, name, github_repo, default_branch, created_by | One project = one repo |
| `project_members` | project_id, user_id, role, color | `role` cosmetic; drives "act as" label + submission tags |
| `work_items` | id, project_id, title, submitted_by, **acting_role**, **status**, **branch_name**, session_id, created_at | A submission → branch → agent session; `status` drives the branch view |
| `sessions` | id, work_item_id, status, agent_model, started_at, ended_at | One agent run, bound to a work item + branch |
| `events` | id, session_id, **seq**, type, author_type, author_id, content (jsonb), created_at | Append-only transcript, ordered by `seq` |
| `presence` | (Realtime Presence, ephemeral) | Who's connected, cursor, typing, current "acting" role |

`work_items.status` ∈ {queued, running, needs_review, merged, abandoned}.
`work_items.acting_role` records who the submitter was "acting as" — cosmetic now, the hook for real per-role routing later.

---

## 5. Repo layout ("extrapolate the repo")

Monorepo, Turborepo + pnpm.

```
atrium/
├─ apps/
│  ├─ web/                 # Next.js (Vercel): transcript, act-as dropdown, branch view, diff preview, merge
│  └─ orchestrator/        # always-on worker: agent pool, worktree manager, queue, budget guard
├─ packages/
│  ├─ persistence/         # PersistenceAdapter + supabase adapter (default)
│  ├─ model-gateway/       # ModelProvider + deepseek (default) / kimi / anthropic adapters + budget hooks
│  ├─ agent-core/          # agentic loop: plan → act → observe; tool registry
│  ├─ tools/               # fs, git (worktree + branch + merge), shell, github (PR)
│  └─ shared/              # event schema, work-item state machine, zod validators, types
├─ infra/
│  ├─ supabase/migrations/ # SQL for §4
│  └─ env/                 # .env.example per app (incl. cap + budget flags)
├─ docs/
│  ├─ PLAN_Multiplayer_AI_v2.md
│  └─ adr/
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

---

## 6. Phasing & timeline

Phase 1 target: **demo-ready by 2026-08-20 (Wed)** — four focused weeks (one more than v1, to absorb multi-agent + branch view).

| Phase | Window | Milestone (acceptance = "this visibly works") |
|---|---|---|
| **0 — Plan** | done 2026-07-23 | This document |
| **1a — Multiplayer skeleton** | 2026-07-23 → 2026-07-30 | Repo scaffold; `PersistenceAdapter` + Supabase; auth; **two tabs see each other's presence + messages live**; "act as" dropdown sets label. No agent yet. |
| **1b — Live single agent** | 2026-07-31 → 2026-08-06 | Orchestrator + `agent-core` + DeepSeek gateway; **one agent streams events → log → all clients**; humans inject a steering message |
| **1c — Multi-agent + branches** | 2026-08-07 → 2026-08-13 | **Worktree-per-agent**, concurrency cap + queue, `work_items` state machine, **branch/outstanding-work view + diff preview** |
| **1d — Merge + budget + deploy** | 2026-08-14 → 2026-08-20 | **Human-approved merge** (branch/PR), **budget cap guard**, polling fallback, deploy to Vercel + Fly |
| **2 — Roles & channels** | 2026-08-21 → TBD | Role permissions, Slack-style channels |
| **3 — Personas & scale** | TBD | Department agent personas, higher concurrency, merge-queue |

**Phase 1 demo acceptance test:** *Three people log into one project, each submits a request "as" a different role; three agents run in parallel on three branches while a fourth submission queues; everyone watches all transcripts stream live; a reviewer opens the branch view, previews a diff, and clicks merge — and the main branch updates only then.* If that works, the wedge is proven.

---

## 7. Cost — how we hold ≤ $50/month (and why NOT to rent a GPU)

You want flat, predictable, ≤ $50/month. The right way to get there is **metered DeepSeek V3.2 API + a hard budget cap + a concurrency cap** — "flat" enforced by a ceiling, not a hardware lease. Here's the reasoning, with the math.

### 7.1 Why a rented/local GPU is the wrong move here

| Option | Real monthly cost (24/7) | Can it run DeepSeek V3.2? | Verdict |
|---|---|---|---|
| Self-host DeepSeek V3.2 | **~$2,500** (from ~$3.44/hr, multi-GPU) | Yes (it's a ~671B MoE — needs big multi-GPU) | 50× over budget |
| Cheap single 24GB GPU (RTX 4090) | **~$248** (from ~$0.34/hr community) | **No** — only fits a weaker 7–32B model | 5× over budget AND weaker model |
| Your target: flat ≤ $50/mo, 24/7 | = **$0.068/hr** | Below any usable coding GPU | Not physically available |

The trap: a dedicated GPU is only "flat and cheap" if you'd otherwise be spending *more* than the lease on tokens. At MVP usage you won't be — and the cheap GPU can't even host the model you want. Renting a GPU here would cost **5–50× more** than metered API for a **worse** result.

### 7.2 What ≤ $50/month actually buys on DeepSeek V3.2 API

Assumption: one "agent-hour" ≈ 1.5M input + 0.15M output tokens (agentic coding is input-heavy). DeepSeek V3.2 list = $0.214/M in, $0.322/M out; cache-hit input ≈ $0.02/M (agent loops re-send context → cache-friendly).

| Scenario | $/agent-hour | Agent-hours per $40 model budget |
|---|---|---|
| No caching | $0.37 | ~108 |
| ~60% cache-hit (realistic for agent loops) | ~$0.16 | ~250 |

So a **$40/month model budget = roughly 108–250 agent-hours**. With the **3-agent concurrency cap**, that's ~5–11 *wall-clock* hours/day of three-agents-running — plenty for an early team. The cap is what makes it predictable: 20 branches can exist, but only 3 burn tokens at once.

### 7.3 The ≤ $50/month build

| Line item | Choice | Monthly |
|---|---|---|
| Web hosting | Vercel Hobby (MVP) → Pro later | $0 (→ $20) |
| Sync fabric | Supabase Free (MVP) → Pro later | $0 (→ $25) |
| Orchestrator host | One small always-on box (Fly/Railway) | ~$5–10 |
| Model | DeepSeek V3.2 API, **capped at $40** | ≤ $40 |
| **Total (MVP tiers)** | | **≈ $45–50** |

The budget guard (`MONTHLY_BUDGET_USD`) tracks spend and **pauses new agent spawns** (queue-only) when the ceiling is hit, so you never get surprised. That's your "flat cost," implemented in software.

### 7.4 Model recommendation

Default **DeepSeek V3.2** through the model gateway (best cost/quality for agentic coding right now, and the cheapest credible option). Keep the gateway abstraction so you can A/B **Kimi K2.6** (stronger tool-use, ~5–6× the token cost) on demanding tasks, or route to a **self-hosted small model** (e.g. a Qwen-Coder-class 32B on *scale-to-zero* serverless GPU, paying only while agents run) *if and when* sustained usage ever exceeds a dedicated-GPU breakeven (~$150+/month). Not now. Note: you referenced "Kimi3" — current line is K2.5/K2.6; no K2.3/Kimi3 exists.

---

## 8. Top risks & mitigations

| Risk | Mitigation |
|---|---|
| Parallel submissions collide | One worktree + one branch per agent; merge only on human approval |
| 15–20 branches → runaway cost | Concurrency cap (3 running) + budget guard; cost tracks *running* agents, not branch count |
| Agent loop times out in serverless | Orchestrator is an always-on worker; serverless never runs the loop |
| Token stream hammers the DB | Ephemeral Broadcast for live tokens; only committed events are durable rows |
| Auto-merge breaks main | No auto-merge in Phase 1 — human clicks merge; branch-only writes |
| Vendor lock-in (DB or model) | `PersistenceAdapter` + `ModelProvider` interfaces, env-flagged |
| Budget surprise | `MONTHLY_BUDGET_USD` pauses new spawns at the ceiling |
| Scope creep back to full vision | Roles cosmetic; RBAC + channels gated to Phase 2 |

---

## 9. How this sets up YC themes #2 and #3

- **Cloud for Small Software (#2):** the orchestrator + worktree-per-agent *is* a small-software host — offer it per-project.
- **Self-Maintaining APIs (#3):** point the same agent loop at a repo on a schedule with a maintenance goal and it becomes a self-maintaining service; the multi-agent pool is the on-ramp.

Build the multi-agent shared workspace well and the next two themes are configurations of it.

---

## 10. Immediate next actions

1. Confirm the **concurrency cap (default 3)** and **monthly budget (default $40 model)** — these two numbers define your cost ceiling.
2. Confirm runner host: **Fly.io** (recommended) vs. Railway vs. Render.
3. Confirm GitHub auth for Phase 1: **PAT** (fast) now, **GitHub App** by 1d.
4. Green-light a follow-up build session to execute the **Day-1 scaffold + Phase 1a**. I can generate the repo, migrations, adapters, and the multiplayer skeleton (incl. the "act as" dropdown) in one pass.

---

*Pricing sources (Jul 2026): DeepSeek V3.2 API rates — pricepertoken.com; DeepSeek V3.2 self-host cost — spheron.network; RTX 4090 rental — synpixcloud.com / runpod.io; Kimi K2.6 — benchlm.ai. List prices; verify at contract time.*
