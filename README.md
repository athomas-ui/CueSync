# CueSync

**Music coordination for worship leaders, band leaders, choir directors, and ensemble managers.**

Music leaders spend hours every week repeating the same work: finding the right version of a song, building the setlist, figuring out who needs which recording, and retyping the same details into texts and emails for each group. CueSync lets a leader enter that information once and reuse it everywhere.

**Core workflow:** Find music → Organize the event → Select groups → Generate communications → Review → Send.

> **Status:** Active development. The data model and project foundation are in place; the read-only app is being built now. See the [roadmap](#roadmap) and [session log](docs/session-log.md).

---

## Features (planned and in progress)

| Area | What it does | Status |
|---|---|---|
| Data model | Workspaces, groups, contacts, songs, events, setlists, messages, audit log | Done |
| Events & setlists | Create events, add songs in order with per-event key, tempo, and notes | In progress |
| Music library | Saved songs with links to recordings, charts, and authorized lyrics sources | In progress |
| Groups | Musicians in many groups (Worship Team, Choir, Live Band) without duplicate contacts | In progress |
| Sign-in & roles | Owner, leader, and musician roles per workspace | Planned |
| AI message composer | Drafts a tailored message per group; the leader reviews and approves before anything sends | Planned |
| Music research | Search for songs and recordings with source attribution | Planned |
| Sending | One real email integration with honest delivery status | Planned |

A clickable UI prototype lives in [`docs/prototype/cuesync.html`](docs/prototype/cuesync.html). Download it and open it in a browser to see the full intended workflow.

## Security by design

CueSync stores contact information for real people, so security is built into the foundation, not added later.

- **Workspace isolation.** Every workspace-owned table carries a required `workspaceId`. Join tables use composite foreign keys `(workspaceId, id)`, so the **database itself** refuses to link a group in one workspace to a contact in another. This blocks a whole class of cross-tenant bugs (IDOR) even if application code makes a mistake.
- **Server-side authorization.** Every read and write goes through one helper that checks the user's membership and role. Hiding a button is not authorization.
- **Input validation.** All input is validated with Zod on the server, even when the browser already validated it.
- **Secrets stay on the server.** API keys live in environment files that are never committed. [`.env.example`](.env.example) holds placeholders only.
- **Honest statuses.** A message is marked `sent` only after a provider confirms it. Copying text or opening an email app is never reported as sent.
- **Human approval.** AI drafts messages, but nothing is sent without explicit confirmation from the leader.
- **Audit trail.** Important actions are recorded in an `AuditLog` table.
- **Copyright-aware.** CueSync stores links to authorized lyrics sources, not copyrighted lyrics text.

The full rule set that guides development is in [`CLAUDE.md`](CLAUDE.md).

## Tech stack

- **Next.js** (App Router), **React**, **TypeScript** (strict mode)
- **Tailwind CSS** and **shadcn/ui**
- **PostgreSQL** with **Prisma ORM** (migrations committed to git)
- **Zod** for validation; **Vitest** and **Playwright** for testing (being added)

## Getting started

**Prerequisites:** Node.js 20+ and Git. No Docker needed; Prisma runs a local Postgres for development.

```bash
git clone https://github.com/<your-username>/cuesync.git
cd cuesync
npm install
cp .env.example .env          # then fill in the values from `npx prisma dev ls`
npx prisma dev --name cuesync --detach   # first time only: creates the local database
npm run db:migrate            # create the tables
npm run db:seed               # load clearly labeled demo data
npm run dev                   # open http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Lint the code |
| `npm run typecheck` | Type check without building |
| `npm run db:start` / `db:stop` | Start or stop the local database |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Roadmap

1. **Foundation:** data model, demo data, read-only pages *(current)*
2. **Sign-in and authorization:** roles, workspace isolation tests
3. **Create and edit:** events, setlists, groups, library
4. **AI message composer:** drafts, review, approval
5. **Music research:** search with source attribution
6. **Sending:** one real email provider with delivery status
7. **Testing, accessibility, and deployment**

## About

Built by **Andrew Thomas** as part of the i.c.stars program, while transitioning from program management into technology and cybersecurity. CueSync combines two things I know well: coordinating people and making music.
