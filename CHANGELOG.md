# Changelog

All notable changes to this repository are documented here. Per-package versions
and release notes are managed with [changesets](https://github.com/changesets/changesets);
this top-level file captures repo-wide milestones.

## [Unreleased]

### Added

- Initial monorepo scaffold (Turborepo + pnpm): `apps/web`, `apps/orchestrator`,
  and the `@ourai/*` packages (`shared`, `persistence`, `model-gateway`,
  `agent-core`, `tools`, `sdk`, `ee`, shared configs).
- Idea-intake data model and SQL migrations (`companies → ideas → work_items →
  sessions → events`) with RLS policies.
- `PersistenceAdapter` and `ModelProvider` interfaces with default
  (Supabase / DeepSeek) implementations stubbed.
- Open-core license split: AGPL-3.0 core, Apache-2.0 SDK, commercial EE.
- Community health files, issue/PR templates, and CI workflows.
