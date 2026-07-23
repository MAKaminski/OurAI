# Changesets

This folder holds [changesets](https://github.com/changesets/changesets) — one
markdown file per pending change describing which packages bump and why.

Add one with:

```bash
pnpm changeset
```

On merge to `main`, the release workflow opens/updates a "Version Packages" PR;
merging that publishes the affected `@ourai/*` packages. The `web` and
`orchestrator` apps are ignored (not published to npm).
