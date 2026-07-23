# Roadmap

Derived from [`PLAN_Multiplayer_AI_v2.md`](./PLAN_Multiplayer_AI_v2.md). The
current repo is the **Phase 0 scaffold** — structure, interfaces, migrations,
and community layer, with typed stubs. Everything below builds on it.

## Phase 1 — the wedge (demo-ready target ~2026-08-20)

| Phase | Milestone (acceptance = "this visibly works") |
| ----- | --------------------------------------------- |
| **1a — Multiplayer skeleton** | Supabase auth; join a company room; **two tabs see each other's presence + messages live**; "act as" dropdown sets label. No agent yet. |
| **1b — Live single agent** | Orchestrator + `agent-core` loop + DeepSeek gateway; **one agent streams events → log → all clients**; humans inject a steering message. |
| **1c — Multi-agent + branches** | Worktree-per-agent, concurrency cap + queue, `work_items` state machine, **branch/outstanding-work view + diff preview**. |
| **1d — Merge + budget + deploy** | **Human-approved merge** (branch/PR), **budget cap guard**, polling fallback, deploy to Vercel + Fly. |

**Phase 1 demo acceptance test:** three people log into one company, each
submits a request "as" a different role; three agents run in parallel on three
branches while a fourth queues; everyone watches all transcripts stream live; a
reviewer opens the branch view, previews a diff, and clicks merge — and the main
branch updates only then.

## Phase 2+ (deferred)

- **Roles & channels** — real per-role permissions (RBAC), Slack-style channels.
- **Personas & scale** — department agent personas, higher concurrency, merge-queue.
- **Enterprise** (`packages/ee`) — SSO/SAML, audit logs, org management.

## How this sets up YC themes #2 and #3

- **Cloud for Small Software** — the orchestrator + worktree-per-agent *is* a
  small-software host; offer it per-company.
- **Self-Maintaining APIs** — point the same agent loop at a repo on a schedule
  with a maintenance goal; the multi-agent pool is the on-ramp.

## Launch sequence (open-source rollout)

Tailored to how recent open-source YC companies launched (Supabase, Cal.com,
Twenty, Continue, E2B, Trigger.dev):

1. Ship public with README, **demo GIF**, Docker Compose, and **20–30 seeded
   issues** (~10 `good first issue` / `help wanted`).
2. **Show HN / Launch HN** — Tue–Thu, ~8–10am PT; founder comment in the first
   few minutes.
3. **Product Hunt** the same week; carry the badge back into the README.
4. **Awesome-list PRs** (awesome-selfhosted, awesome-ai-agents, awesome-devtools).
5. **Discord** from day one + mirror support into **GitHub Discussions**.
6. **Docs site** on Mintlify.
7. **Star-history** embed + milestone re-shares.
8. **Changesets** releases with Conventional Commits.
