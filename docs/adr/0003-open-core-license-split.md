# ADR 0003 — Open-core license split (AGPL + Apache + commercial EE)

- **Status:** Accepted
- **Date:** 2026-07-23

## Context

We are launching open-source-first to earn developer trust and adoption, but the
hosted, real-time multiplayer workspace *is* the business — we need to deter a
hyperscaler or competitor from reselling a hosted clone, without sacrificing the
"developers build on us" flywheel. We surveyed how recent open-source YC
companies license their code (Supabase, Cal.com, Twenty, Infisical, Continue,
E2B, Trigger.dev, Dify).

## Decision

Adopt an **open-core split**:

- **AGPL-3.0** for the app, realtime/collab engine, and orchestrator (`apps/*`
  and most `packages/*`). Strong copyleft closes the SaaS loophole.
- **Apache-2.0** for embeddable pieces — the public SDK
  (`packages/sdk`), and a future CLI. Permissive + patent grant maximizes
  third-party adoption, following Continue/E2B.
- **Commercial license** for `packages/ee` (SSO/SAML, RBAC, audit logs), like
  Twenty/Infisical.

We explicitly do **not** launch on BSL / SSPL / "sustainable use" licenses —
those are trust-killers for an OSS-first launch and are typically relicensing
moves made later, under duress.

## Consequences

- Self-hosters get the whole product under AGPL.
- Integrators can embed the SDK freely.
- The paid tier has a clear home; contributors are directed away from `ee`
  unless engaged commercially.
- Each boundary carries its own `LICENSE` file and `package.json` `license`
  field.
