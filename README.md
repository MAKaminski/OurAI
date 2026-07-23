<div align="center">

# OurAI

### One repo. Many people. Many agents. Watched and steered together, live.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Made with Turborepo](https://img.shields.io/badge/built%20with-Turborepo-1a1a1a.svg)](https://turbo.build/)

[Website](#) · [Docs](./docs) · [Roadmap](./docs/ROADMAP.md) · [Discord](#) · [Architecture](./docs/ARCHITECTURE.md)

</div>

---

> **Demo:** _<!-- TODO: replace with a GIF/video of a live multiplayer agent session — the single highest-leverage asset for launch. -->_
> A short screen capture of three teammates submitting ideas, three agents building on three branches, and a reviewer clicking **merge**.

## What is OurAI?

OurAI is a **multiplayer AI workspace** over one GitHub repo. You start with a
**company**, intake **ideas**, and each promoted idea spins up its own AI coding
agent on its own isolated branch. Everyone on the team watches every agent
stream live, anyone can inject a message to steer it, and a human reviews the
diff and clicks **merge** — nothing touches your main branch without approval.

The core insight: **cost scales with agent-compute, not with seats.** Six people
watching one shared agent cost the same as one — that's the multiplayer
advantage in dollars.

## Why OurAI?

- 🧑‍🤝‍🧑 **Truly multiplayer** — a shared, append-only transcript. Late-joiners get
  full history for free; everyone sees the same thing, in order.
- 🌿 **One agent = one branch = one worktree** — parallel submissions never
  collide. Run many; merge deliberately.
- 🗂️ **Idea intake is the front door** — company → ideas → work items → agents.
  Project management first, code second.
- 💸 **Predictable cost** — a concurrency cap + a hard monthly budget guard keep
  spend flat. DeepSeek by default; swap the model with one env var.
- 🔌 **No lock-in** — persistence and model are both behind interfaces. Supabase
  and DeepSeek ship first; add an adapter without touching the app.

## Features

- [x] Company / idea-intake data model (`companies → ideas → work_items → sessions → events`)
- [x] Append-only event log as the shared transcript (typed `Event` union)
- [x] `PersistenceAdapter` interface (Supabase + in-memory)
- [x] `ModelProvider` gateway (DeepSeek / Kimi / Anthropic)
- [x] Orchestrator skeleton: capped agent pool, work queue, worktree-per-agent, budget guard
- [x] Next.js app shell: idea board, transcript room, outstanding-work view, diff + merge
- [ ] Live auth + presence (Phase 1a)
- [ ] Streaming agent loop (Phase 1b)
- [ ] Multi-agent + branch view + diff preview wired (Phase 1c)
- [ ] Human-approved merge + budget enforcement + deploy (Phase 1d)

See the [roadmap](./docs/ROADMAP.md) for the full plan.

## Quickstart

```bash
# prerequisites: Node >= 22, pnpm 10
pnpm install
pnpm build        # builds every package in dependency order
pnpm dev          # runs the web app + orchestrator in watch mode
```

Local database (optional, for when live wiring lands):

```bash
docker compose up -d           # a bare Postgres, or:
pnpm dlx supabase start        # full local Supabase (Auth + Realtime + Studio)
pnpm dlx supabase db reset     # applies infra/supabase/migrations
```

Copy the env templates from [`infra/env/`](./infra/env) into `apps/web/.env.local`
and `apps/orchestrator/.env`.

## Architecture

Five parts; only the orchestrator is stateful and long-running.

| Component        | Runs on            | Job                                                            |
| ---------------- | ------------------ | ------------------------------------------------------------- |
| **web**          | Next.js / Vercel   | Transcript UI, presence, idea board, branch view, diff, merge |
| **sync fabric**  | Supabase           | Append-only `events` log + Realtime fan-out                   |
| **orchestrator** | always-on worker   | Capped agent pool, worktree-per-agent, queue, budget guard    |
| **model-gateway**| lib in orchestrator| Swappable `ModelProvider` (DeepSeek default)                  |
| **tools**        | lib in orchestrator| fs / git / shell / github tools bound to a worktree           |

The runner never talks to browsers directly: it appends events to an ordered
log; clients only read it. Fan-out to N humans is free because the transcript is
just rows. Full detail in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and
the [ADRs](./docs/adr).

## Monorepo layout

```
apps/         web (Next.js)  ·  orchestrator (agent worker)
packages/     shared · persistence · model-gateway · agent-core · tools · sdk · ee · configs
infra/        supabase/migrations · env templates
docs/         plan, architecture, roadmap, ADRs
```

## Contributing

PRs and issues are welcome — start with a
[`good first issue`](https://github.com/MAKaminski/OurAI/labels/good%20first%20issue).
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our
[Code of Conduct](./CODE_OF_CONDUCT.md). We use Conventional Commits and
changesets.

## Open source vs. paid

OurAI is **open core**:

- The app, realtime/collab engine, and orchestrator are **AGPL-3.0** — you can
  self-host the whole thing.
- Embeddable pieces — the [`@ourai/sdk`](./packages/sdk) — are **Apache-2.0** so
  you can build on OurAI freely.
- Enterprise features (SSO/SAML, RBAC, audit logs) live in
  [`packages/ee`](./packages/ee) under a **commercial license**.

See [ADR-0003](./docs/adr/0003-open-core-license-split.md) for the reasoning.

## Security

Found a vulnerability? Please follow [SECURITY.md](./SECURITY.md) — do not open a
public issue.

## License

[AGPL-3.0](./LICENSE) for the core, [Apache-2.0](./packages/sdk/LICENSE) for the
SDK, and a [commercial license](./packages/ee/LICENSE) for `packages/ee`.
