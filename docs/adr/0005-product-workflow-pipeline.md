# ADR 0005 — Product workflow pipeline (Request → KPI → Design → Dev/QA/Staging)

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

ADR 0004 made **Company → Idea → Work item → Session** the spine and idea intake
the front door. Ideas are deliberately lightweight — a kanban backlog. But the
product actually needs a heavier, first-class flow that carries a single request
from submission all the way to shipped, with **agentic steps that a human reviews
before anything advances**: propose product KPIs, then a design, then build/QA/
staging against a connected repo. Modeling that on the `ideas` board would
overload it; the stages, per-stage agent runs, and human-approval gates need
their own tables and state machine.

We also had two blockers: the model providers were stubs (`chat()` threw), and
there was no working company-creation path in the web app (companies had RLS
gaps that organizations had already fixed in later migrations).

## Decision

1. **A `Request` is a new company-scoped pipeline spine**, distinct from `ideas`.
   It moves through a stage state machine
   (`intake → kpi_review → design → build → qa → staging → done`, plus
   `rejected`), defined in `@ourai/shared` alongside the existing idea/work-item
   machines.

2. **Agentic stages run server-side in the web app**, not in the orchestrator. A
   Next.js route calls `@ourai/model-gateway` with a key resolved from the BYOK
   vault. Each run writes a `request_stage_runs` row (progress + status) modeled
   on `context_jobs`; `status='proposed'` is the human-in-the-loop gate, and a
   human approval is what calls `assertRequestTransition` to advance the stage.
   This unblocked `OpenAICompatibleProvider.chat()` (DeepSeek + Kimi); Anthropic's
   native provider stays a stub for now, so KPI generation prefers DeepSeek/Kimi.

3. **Build now, design the rest.** Stage 1 (Add a Request) and stage 2 (Product
   KPI Assignment — agent proposes, human edits inline or one-click approves) are
   built end-to-end behind the dark-launched `product-workflow` flag. Design,
   Dev/QA/Staging, and Repo Connect are fully diagrammed in
   [`ARCHITECTURE.md`](../ARCHITECTURE.md) but not yet implemented.

4. **Repo Connect/Disconnect (designed only) is PAT-based** — validate
   `owner/repo` against the vault `GITHUB_TOKEN`, record a company-scoped
   connection, and gate it behind a new company/org "can connect/disconnect repo"
   role permission. The connected repo *is* the company's build workspace; the
   later build stages reuse the worktree-per-agent orchestrator (ADR 0002).

5. **Fix the companies RLS gaps in the same migration (`0009`).** Companies were
   scaffolded in 0001/0002 but never received the fixes organizations later got:
   the `insert().select()` creator-visibility broadening (as 0008 did for
   `orgs_select`) and a `company_members` INSERT policy (as 0005 did with
   `org_members_insert`). Without both, `createCompany` — the foundation the whole
   pipeline sits on — fails under the user-scoped client.

## Consequences

- New tables `requests`, `request_stage_runs`, `request_kpis` (schema `ourai`,
  RLS by `is_company_member`); stage-run/KPI policies join through `requests`.
- The model gateway is now load-bearing: `OpenAICompatibleProvider.chat()` is a
  real implementation with cost accounting via the gateway's `COST_TABLE`.
- The web app gains a `companies` store + `/api/companies`, wiring the previously
  stubbed `CompanyCreateForm` to real persistence.
- KPI/Design need no orchestrator or worktree — they are ordinary request-scoped
  server calls, which keeps the human-reviewed stages cheap and stateless.
- The pipeline is invisible until the `product-workflow` flag is enabled per user
  (dark launch), so it ships without affecting existing surfaces.
- Deferred: `repo_connections` + the repo role-permission, the Design agent, and
  the Build/QA/Staging orchestration — captured here and in the diagrams so the
  path is set before code.
