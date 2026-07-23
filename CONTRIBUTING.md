# Contributing to OurAI

Thanks for your interest in making OurAI better! This guide gets you from clone
to merged PR.

## Prerequisites

- **Node** ≥ 22 (`.nvmrc` pins the version — `nvm use`)
- **pnpm** 10 (`corepack enable`)

## Setup

```bash
pnpm install
pnpm build
pnpm dev
```

## Repository layout

This is a Turborepo + pnpm monorepo.

- `apps/web` — Next.js front end
- `apps/orchestrator` — the always-on agent worker
- `packages/*` — shared libraries (`shared`, `persistence`, `model-gateway`,
  `agent-core`, `tools`, `sdk`, `ee`, and the shared configs)

Package dependencies form a DAG: `shared → {persistence, model-gateway} →
agent-core → tools → orchestrator`. The web app depends only on `shared` and
`persistence`.

## Before you open a PR

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

## Commit & PR conventions

- We use **[Conventional Commits](https://www.conventionalcommits.org/)**
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`). PR **titles** are
  linted for this.
- Add a **changeset** for any user-facing package change:
  ```bash
  pnpm changeset
  ```
- Keep PRs focused. Link the issue you're addressing.
- New behavior needs a test; bug fixes need a regression test.

## Good first issues

Look for the [`good first issue`](https://github.com/MAKaminski/OurAI/labels/good%20first%20issue)
and [`help wanted`](https://github.com/MAKaminski/OurAI/labels/help%20wanted)
labels.

## Licensing of contributions

By contributing, you agree that your contributions to the AGPL/Apache parts of
the repo are licensed under those same licenses. Do not add code under
`packages/ee` unless directed — that directory is commercially licensed.

## Code of Conduct

Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md).
