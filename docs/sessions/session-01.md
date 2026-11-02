# Session 1: Foundation and data model

Read CLAUDE.md, then open docs/prototype/cuesync.html and study its data shape and screens. Do not write code until I approve your plan.

## Goal for this session

A running Next.js app with a Postgres database, a committed Prisma schema, demo seed data, and read-only pages that display that data. No authentication yet, but the schema must be ready for it.

## Scope

1. Scaffold the Next.js project with TypeScript strict mode, Tailwind, and shadcn/ui. Confirm current setup steps from official docs.
2. Set up Postgres for local development. Ask me whether I have Docker installed before choosing an approach.
3. Write the Prisma schema with these models: User, Workspace, WorkspaceMembership (with role: owner, leader, musician), Contact, Group, GroupMembership (with role text), Song, Event, SetlistItem (with position, key, tempo, notes), Message, AuditLog.
   - Every workspace-owned model has a required `workspaceId` and an index on it.
   - A Contact can belong to many Groups through GroupMembership, without duplicate contact records. Add a unique constraint on (workspaceId, email) for Contact where email exists.
   - SetlistItem has a unique (eventId, position).
   - Message status is an enum: draft, awaiting_approval, copied, handed_off, sent, failed.
4. Create the first migration and a seed script that loads the prototype's demo workspace. Mark seed records clearly as demo data, and use example.com emails only.
5. Build read-only pages: dashboard, events list, event detail with ordered setlist, music library, groups list, group detail with members. Use the prototype's layout: sidebar on desktop, bottom navigation on mobile.
6. Fill in the Commands section of CLAUDE.md.

## Out of scope this session

Sign-in, create/edit forms, AI, email, music search. Do not start them.

## Teaching checkpoints

- After the schema: walk me through each relation and why `workspaceId` is on every table. Then quiz me with two questions about it.
- After the seed: show me how to open the database and query it myself (Prisma Studio or psql).

## Definition of done

- `npm run dev` (or the actual command) shows the seeded data on every read-only page.
- Migration and seed run cleanly from an empty database.
- Lint and type check pass. Results shown, not assumed.
- docs/session-log.md has a Session 1 entry.
