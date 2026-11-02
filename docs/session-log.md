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
