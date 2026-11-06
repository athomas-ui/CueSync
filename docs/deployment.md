# Deployment runbook

**Live:** https://cue-sync.vercel.app
**Hosting:** Vercel (Hobby plan), connected to `athomas-ui/CueSync`, access limited to this one repository
**Database:** Prisma Postgres (Free plan, US East), created through Vercel's Storage tab

## How a deploy works

1. Push to `main`. Vercel builds and deploys automatically.
2. During `npm install`, the `postinstall` script runs `prisma generate`. The generated client lives in `generated/`, which is gitignored, so it must be rebuilt on every install.
3. The build does **not** run migrations. Migrations are applied by hand (below), so a failed build can never leave the production database half-migrated, and preview deploys can never change it.

## Environment variables (Vercel → cue-sync → Settings → Environment Variables)

Created by the Prisma Postgres integration. Never commit these values.

| Variable | Used by |
|---|---|
| `DATABASE_URL` | The app at runtime (`lib/db.ts`) |
| `POSTGRES_URL` | Direct connection. Use it for `prisma migrate deploy` and seeding from a terminal. |
| `DATABASE_URL_POOLED` | Pooled connection. Not used yet (see follow-ups). |
| `PRISMA_DATABASE_URL` | `prisma+postgres://` format. Not compatible with `@prisma/adapter-pg`; unused. |

## Applying a schema change to production

Run this after the migration is committed and before (or right after) the push that needs it. In PowerShell:

```powershell
# 1. Copy ONLY the POSTGRES_URL value from Vercel (Storage -> database -> Show secret). Copy nothing else after it.
$env:DATABASE_URL = (Get-Clipboard).Trim().Trim('"')
$env:DATABASE_URL.Substring(0,11)      # must print postgres://  If not, stop.
npx prisma migrate deploy              # output must name db.prisma.io, never localhost
Remove-Item Env:DATABASE_URL
Set-Clipboard -Value " "
```

Why this way: the secret never appears in a command, in PowerShell history, or on screen. Variables set with `$env:` win over `.env`, because dotenv does not override existing variables.

Do not use `Read-Host -AsSecureString` for this: Ctrl+V does not paste into a hidden prompt in Windows PowerShell and only one character is captured.

## Reseeding demo data in production

Same as above, replacing `npx prisma migrate deploy` with `npm run db:seed`. The seed is safe to re-run: it replaces only the demo workspace.

## Rotating the database credential

The default connection string created by the Vercel integration **cannot be revoked** from the Prisma console. If it leaks, delete the database in Vercel (Storage → database → Settings → Delete), create a new one, connect it to the project, then migrate and seed again. This was done on 2026-11-06 (see the session log).

## Follow-ups

- Switch the runtime to the pooled connection (`DATABASE_URL_POOLED`) before real traffic, so serverless functions share connections instead of opening one each.
- Turn on 2FA for the Vercel and Prisma accounts.
