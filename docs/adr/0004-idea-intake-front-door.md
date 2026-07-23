# ADR 0004 — Idea intake is the front door (Company → Ideas → Work)

- **Status:** Accepted
- **Date:** 2026-07-23

## Context

The strategy docs framed the unit of work as a "project → repo → agent session."
But product management / idea intake is the true beginning of the workflow: a
team starts with a **company**, captures **ideas**, and only then builds
features affiliated with it. Modeling only "sessions over a repo" would skip the
step where teams actually decide *what* to build.

## Decision

Make **Company** the top-level entity (one company = one GitHub repo) and add an
**idea-intake backlog** as the front door. The hierarchy is:

```
Company → Idea (inbox → triaged → promoted → shipped) → Work item → Session → Events
```

A work item is a *promoted* idea; promoting an idea is what spins up an agent on
a branch. This adds `companies` and `ideas` tables above the original
`work_items → sessions → events` model.

## Consequences

- The web app's primary navigation is company → idea board → work → transcript,
  not "open a session."
- `work_items.idea_id` links built work back to the idea it came from, giving a
  full trace from intake to merge.
- `acting_role` is captured on ideas and work items (cosmetic now), the hook for
  real per-role routing later.
- State machines for both `ideas` and `work_items` live in `@ourai/shared`.
