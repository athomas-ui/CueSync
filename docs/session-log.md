# Session log

One entry per coding session: what was built, files changed, checks run, known issues, next step.

## 2026-10-21: Session 1, part 1 (scaffold and schema)

- Scaffolded Next.js (App Router, TypeScript strict), Tailwind, shadcn/ui.
- Wrote the Prisma schema with workspace isolation (composite foreign keys on join tables).
- Created CLAUDE.md (project rules) and the session 1 plan.
- Not yet done: migration, seed, read-only pages.

## 2026-11-02: Session 1, part 2 (GitHub, database, read-only app)

**Built**
- Published the repo publicly on GitHub with a showcase README. Secret scan before first push: clean.
- Recreated the local Prisma Postgres instance and ran the first migration (`init`, 11 tables).
- `prisma/seed.ts`: demo workspace ported from the prototype (6 contacts, 2 groups, 4 songs, 2 events). Every record `isDemo`, example.com emails only, idempotent.
- `scripts/inspect-demo.ts`: read-only data check (`npm run db:inspect`).
- Read-only pages: dashboard, events, event detail, music library, groups, group detail. Sidebar on desktop, bottom nav on mobile. Prototype palette with dark mode.
- `lib/queries.ts`: every query filtered by `workspaceId`; detail pages use `findFirst({ where: { id, workspaceId } })` so a foreign id returns 404 (IDOR defense).

**Checks**
- `tsc --noEmit`: 0 errors. ESLint: clean.
- Manual QA by Andrew: dashboard counts, setlist order, group members, URL tampering returns Not found, mobile bottom nav. All passed.

**Known issues**
- Prisma Studio fails to introspect the local database ("introspect operation failed"). Workaround: `npm run db:inspect`.
- `npm install` reports 22 vulnerabilities (1 high). Not yet triaged. Do not run `npm audit fix --force`.
- `getCurrentWorkspace()` returns the demo workspace for everyone. It is a stand-in, not authorization.
- No automated tests yet.

**Next step**
- Session 2: sign-in, real `getCurrentWorkspace()` with membership and role checks, and a test proving Workspace A cannot read Workspace B.
- Triage the npm audit findings.

## 2026-11-06: Session 2 (clean dependencies, product direction, first deploy)

**Built**
- **Dependency cleanup: 13 audit findings to 0.** Vendored the one CSS file used from `shadcn` into `app/styles/shadcn-tailwind.css` and removed the CLI package (removes `deepmerge` and the `ts-morph` minimatch path). Scoped npm `overrides` forces `minimatch ^11.0.5` for `@typescript-eslint/typescript-estree` only. Report: `docs/security/dependency-audit-2026-11-06.md`.
- **Product direction decided:** CueSync drafts messages and the leader sends them through the platform they choose (email, text, WhatsApp, GroupMe, Slack). No sending integration. New feature planned: a per-event show checklist from assembling the band to show day.
- **Deployed:** Vercel + Prisma Postgres (free plans). Live at https://cue-sync.vercel.app with demo data. `postinstall: prisma generate`; shadow database URL made optional in `prisma.config.ts` so production config loads. Runbook: `docs/deployment.md`.
- README: live link, screenshot, updated features and roadmap, correct clone URL.

**Security incident (resolved)**
- While setting up the first production database, its connection string was pasted inside a terminal command, which saved it to PowerShell history and showed it in a screenshot.
- Contained: removed the line from the PSReadLine history file.
- Rotated: the Vercel-created default credential cannot be revoked in the Prisma console, so the database (empty apart from schema) was deleted and replaced. The leaked credential no longer works.
- Process fix: production commands now read the secret from the clipboard (`Get-Clipboard`) with a prefix check, so it never appears in a command, history, or on screen. Documented in the runbook.

**Checks**
- `npm audit`: 0 vulnerabilities (all and `--omit=dev`). `npm run lint`, `npm run typecheck`, `npm run build`: pass (run by Andrew).
- Live site verified by Andrew: dashboard loads with demo data.

**Known issues**
- Still no sign-in: `getCurrentWorkspace()` returns the demo workspace for everyone. Safe only because the app is read-only. Sign-in must ship before any editing feature.
- Runtime uses the direct connection, not the pooled one.
- ESLint 9 is deprecated; upgrade when `eslint-config-next` supports a newer version.
- No automated tests yet.

**Next step**
- Milestone: sign-in, a private workspace per user, "Try the demo," `requireWorkspace()` with role checks, and a test proving Workspace A cannot read Workspace B.
