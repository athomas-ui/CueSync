# CueSync

CueSync helps music leaders (worship leaders, band leaders, choir and orchestra directors) organize events and setlists, manage groups of musicians, and send each group a tailored message about the music.

Core workflow: find music, organize the event, select groups, generate communications, review, send.

## Source of truth

- `docs/prototype/cuesync.html` is the working UI prototype. Treat its screens, flows, validation rules, and status labels as the product spec. Port the behavior, not the code.
- `docs/master-build-prompt.md` is the full long-term requirements backlog. Do not try to build all of it at once.
- `docs/sessions/` holds one prompt per coding session. Work only on the current session's scope.
- `docs/session-log.md` is the running record of what was built.

## Stack

- Next.js (App Router), React, TypeScript in strict mode
- Tailwind CSS and shadcn/ui
- PostgreSQL with Prisma (migrations committed to git)
- Zod for every input boundary
- Vitest for unit and integration tests, Playwright for end-to-end tests
- Verify current versions and APIs in official docs before installing anything. Do not rely on memory for package versions.

## Commands

Keep these accurate:

- Dev server: `npm run dev` (http://localhost:3000)
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Production build: `npm run build`
- Local database: first time `npx prisma dev --name cuesync --detach`, then `npm run db:start` / `npm run db:stop`
- Database migrate: `npm run db:migrate -- --name <change>`
- Seed demo data: `npm run db:seed` (safe to re-run)
- Inspect demo data: `npm run db:inspect` (read-only; Prisma Studio currently fails to introspect the local db)
- Tests: `TBD` (Vitest and Playwright not installed yet)
- Deploy: push to `main` (Vercel auto-deploys). Production migrations are manual: see `docs/deployment.md`.
- Live site: https://cue-sync.vercel.app

## Non-negotiable rules

1. **Authorization on the server, every time.** Every query that reads or writes workspace data goes through one helper that checks the signed-in user's membership and role in that workspace. Never trust an ID from the browser without that check. Hiding a button is not authorization.
2. **Workspace isolation.** Every workspace-owned table has a `workspaceId`. A user in Workspace A must never read or change Workspace B's data, even by editing a URL or request. Write a test that proves this for each new data type.
3. **Secrets stay on the server.** API keys live in `.env.local`, never in client code or git. Keep `.env.example` updated with placeholder values only.
4. **Validate all input with Zod** on the server, even if the form already validates in the browser.
5. **Honest statuses.** A message is "sent" only when a provider confirms it. Saving, copying, or opening an email app is never "sent". Never fake a success response from an integration that is not configured.
6. **AI is a controlled service.** All AI calls go through `server/ai/`. Send the model only the data the task needs (never contact lists). Validate structured output. Flag any URL in AI output that is not already stored on a song.
7. **No invented sources.** Never fabricate song URLs, keys, tempos, or attributions. Demo data must be labeled as demo data.
8. **Lyrics are copyrighted by default.** Store links to authorized lyrics pages. Do not store or display lyrics unless the user supplies them and has the rights.
9. **Never send a message without explicit user confirmation** in the UI.
10. **No new dependency without a one-line reason** in your summary.

## How to work with me (teaching mode)

I am a developer moving into cybersecurity. I need to understand and be able to explain everything in this repo.

- Start every non-trivial task in plan mode: show me the plan and the files you will touch before writing code.
- Work in small steps. After each step, stop and explain in plain language what you changed and why.
- When you make a security decision, name it (for example "this prevents an IDOR") and explain the attack it blocks.
- Before writing a piece of logic I should learn (authorization checks, Zod schemas, Prisma queries), ask if I want to try it first.
- Never claim tests pass unless you ran them. Show the command and the result.
- If something I ask for conflicts with the rules above, tell me before doing it.

## End of every session

1. Run lint, type check, and tests. Report actual results.
2. Append an entry to `docs/session-log.md`: date, what was built, files changed, tests run and results, known issues, next step.
3. Remind me to review the diff and commit with a clear message.
