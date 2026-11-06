# Dependency audit: 2026-11-06

**Scope:** all npm dependencies of CueSync (`package-lock.json`)
**Tool:** `npm audit` (GitHub Advisory Database)
**Auditor:** Andrew Thomas
**Supersedes:** [2026-11-02 audit](dependency-audit-2026-11-02.md), which accepted dev-only findings. This audit removes them instead.

## Result

| | Before | After |
|---|---|---|
| All dependencies (`npm audit`) | 13 (11 moderate, 2 low) | **0** |
| Production dependencies (`npm audit --omit=dev`) | 0 | **0** |

Verified after changes: `npm run lint`, `npm run typecheck`, and `npm run build` all pass.

## Findings and fixes

| Advisory | Package | Severity | Path into CueSync | Fix |
|---|---|---|---|---|
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4): prototype poisoning in `mergeObject()` | `deepmerge` 4.3.1 | Low | `shadcn` CLI | **Removed the `shadcn` package.** |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): DoS via glob pattern amplification | `minimatch` 10.2.6 (vulnerable: 7.0.0 to 11.0.0) | Moderate | `shadcn` CLI → `ts-morph`; ESLint → `@typescript-eslint/typescript-estree` | `shadcn` path: removed with the package. ESLint path: **scoped npm override** to `minimatch ^11.0.5`. |

## Changes made

1. **Vendored one CSS file, removed the CLI.** The app used only `shadcn/tailwind.css` from the `shadcn` package. That file is now copied into `app/styles/shadcn-tailwind.css` with its MIT license credit, and `app/globals.css` imports the local copy. The `shadcn` package was uninstalled. New UI components are added with `npx shadcn@latest add <component>`, which runs the CLI temporarily without making it a project dependency.
2. **Scoped override.** `package.json` now contains:
   ```json
   "overrides": {
     "@typescript-eslint/typescript-estree": { "minimatch": "^11.0.5" }
   }
   ```
   It is scoped to the one package that pulled in the vulnerable version. ESLint's own `minimatch` 3.x is outside the vulnerable range and was left alone. `npm ls minimatch` confirms `minimatch@11.0.5 overridden`.

## Rejected option

`npm audit fix --force` was rejected again. It proposed downgrading `shadcn` to 1.0.0 and `eslint-config-next` to 15.5, both breaking changes that trade a moderate dev-only issue for older, unsupported tooling.

## Observations during the fix

- npm reported `tarball data ... seems to be corrupted. Trying again.` for several cached packages. This is npm's integrity check (sha512 hashes in `package-lock.json`) rejecting bad copies in the local cache and re-downloading them. No action needed beyond letting it finish; `npm cache verify` cleans the cache if it recurs.

## Follow-up

- **ESLint 9 is deprecated** (`npm warn deprecated eslint@9.39.5`). Not a vulnerability, but unsupported tooling stops receiving security fixes. Upgrade to a supported ESLint version once `eslint-config-next` supports it.
- **Remove the override** when `@typescript-eslint/typescript-estree` depends on `minimatch` 11.0.1 or later. Check with `npm view @typescript-eslint/typescript-estree dependencies.minimatch`.
- Re-run `npm audit` at the start of each coding session and before every deploy.
