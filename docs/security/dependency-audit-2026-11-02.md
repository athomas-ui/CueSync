# Dependency audit: 2026-11-02

**Scope:** all npm dependencies of CueSync (`package-lock.json`)
**Tool:** `npm audit` (GitHub Advisory Database)
**Auditor:** Andrew Thomas

## Result

| | Before | After |
|---|---|---|
| All dependencies | 22 (1 high, 19 moderate, 2 low) | 21 (0 high, 19 moderate, 2 low) |
| Production dependencies (`npm audit --omit=dev`) | 7 (1 high, 4 moderate, 2 low) | **0** |

Verified after changes: `npm run build` succeeds.

## Findings

The 22 alerts trace back to three root advisories. Most alerts are the same issue repeated through every package that depends on it.

| Advisory | Package | Severity | Path into CueSync | Reachable by an attacker? | Action |
|---|---|---|---|---|---|
| [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828): DoS via trailing bytes | `body-parser` 2.3.0 | High | `shadcn` CLI → `@modelcontextprotocol/sdk` → `express` → `body-parser` | No. Only runs if the shadcn MCP server is started locally. Never part of the app. | **Fixed** with `npm audit fix` (non-breaking update) |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249): DoS via glob pattern amplification | `minimatch` < 11.0.1 | Moderate (19 alerts) | ESLint toolchain; `shadcn` → `ts-morph` | No. Processes glob patterns written by developers in config files, not user input. | **Accepted**, dev-only |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4): prototype poisoning in `mergeObject()` | `deepmerge` ≥ 4.2.0 | Low (2 alerts) | `shadcn` CLI | No. Runs only when a developer adds UI components on their own machine. | **Accepted**, dev-only |

## Changes made

1. `npm audit fix` (without `--force`): upgraded `body-parser`, removing the only high-severity finding.
2. Moved `shadcn` from `dependencies` to `devDependencies`. It is a CLI and a build-time CSS file, not runtime code. The previous classification made dev-only issues appear as production risk.

## Rejected option

`npm audit fix --force` was evaluated and rejected. Its proposed "fix" installs **eslint 4.0.0 (2017)** and downgrades `eslint-config-next` to 12, which breaks linting and replaces maintained tools with years-old versions. Automated fix suggestions require human review.

## Why 21 findings were accepted

Superseded. These findings were not left in place: the [2026-11-06 audit](dependency-audit-2026-11-06.md) removed all of them.

## Follow-up

- Re-run `npm audit` and `npm audit --omit=dev` before each release and after dependency upgrades.
- Revisit when ESLint and shadcn ship releases with patched `minimatch` and `deepmerge`.
- Consider enabling GitHub Dependabot alerts on the repository.
