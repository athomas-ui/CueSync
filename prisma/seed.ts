// Demo seed for local development. Run with: npm run db:seed
//
// Ported from the seed() function in docs/prototype/cuesync.html.
// Rules (CLAUDE.md #7): every record is flagged isDemo, every email is
// @example.com, and keys/tempos are placeholders, not verified facts.
// Safe to re-run: it deletes the previous demo workspace first.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_NOTE = "Demo record: key and tempo are placeholders, not verified against a source.";

// Next occurrence of a weekday (0 = Sunday), as a UTC date with no time,
// matching the @db.Date column (no timezone math).
function nextWeekday(weekday: number): Date {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const ahead = (weekday - today.getUTCDay() + 7) % 7 || 7;
  today.setUTCDate(today.getUTCDate() + ahead);
  return today;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function main() {
  // 1. Remove the previous demo workspace. Setlist items go first because
  //    SetlistItem -> Song is onDelete: Restrict.
  const old = await prisma.workspace.findMany({ where: { isDemo: true }, select: { id: true } });
  const oldIds = old.map((w) => w.id);
  if (oldIds.length) {
    await prisma.setlistItem.deleteMany({ where: { workspaceId: { in: oldIds } } });
    await prisma.workspace.deleteMany({ where: { id: { in: oldIds } } }); // cascades to the rest
  }

  // 2. Demo leader account and workspace.
  const leader = await prisma.user.upsert({
    where: { email: "leader@example.com" },
    update: {},
    create: { email: "leader@example.com", name: "Demo Leader", isDemo: true },
  });

  const ws = await prisma.workspace.create({
    data: {
      name: "Demo workspace",
      isDemo: true,
      memberships: { create: { userId: leader.id, role: "owner" } },
    },
  });
  const workspaceId = ws.id;

  // 3. Contacts. One record per person, even if they sing in two groups.
  const contact = (name: string, email: string, phone: string | null, preferredChannel: "email" | "text") =>
    prisma.contact.create({ data: { workspaceId, name, email, phone, preferredChannel, isDemo: true } });

  const jordan = await contact("Jordan Ellis", "jordan@example.com", null, "email");
  const maya = await contact("Maya Brooks", "maya@example.com", "555-0101", "text");
  const darnell = await contact("Darnell Price", "darnell@example.com", null, "email");
  const grace = await contact("Grace Kim", "grace@example.com", null, "email");
  const andre = await contact("Andre Wallace", "andre@example.com", "555-0104", "email");
  const lena = await contact("Lena Ortiz", "lena@example.com", null, "email");

  // 4. Groups. Maya is in both, through two GroupMembership rows.
  const worship = await prisma.group.create({
    data: {
      workspaceId,
      name: "Worship Team",
      type: "Worship team",
      description: "Sunday band and lead vocals",
      messagePreferences: "Include keys, tempos and transitions.",
      isDemo: true,
    },
  });
  const choir = await prisma.group.create({
    data: {
      workspaceId,
      name: "Sanctuary Choir",
      type: "Choir",
      description: "SATB choir",
      messagePreferences: "Point singers to part-learning recordings.",
      isDemo: true,
    },
  });

  await prisma.groupMembership.createMany({
    data: [
      { workspaceId, groupId: worship.id, contactId: jordan.id, role: "Keys" },
      { workspaceId, groupId: worship.id, contactId: darnell.id, role: "Bass" },
      { workspaceId, groupId: worship.id, contactId: andre.id, role: "Drums" },
      { workspaceId, groupId: worship.id, contactId: maya.id, role: "Lead vocal" },
      { workspaceId, groupId: choir.id, contactId: maya.id, role: "Soprano" },
      { workspaceId, groupId: choir.id, contactId: grace.id, role: "Alto" },
      { workspaceId, groupId: choir.id, contactId: lena.id, role: "Tenor" },
    ],
  });

  // 5. Songs. Links stay empty: we never invent URLs (CLAUDE.md #7).
  const song = (title: string, artist: string, key: string, tempo: number, tags: string[], rights: string) =>
    prisma.song.create({
      data: { workspaceId, title, artist, key, tempo, tags, rights, notes: DEMO_NOTE, isDemo: true },
    });

  const amazingGrace = await song("Amazing Grace", "John Newton (text)", "G", 72, ["hymn"], "Text is public domain; check the arrangement you use");
  const beThou = await song("Be Thou My Vision", "Traditional Irish", "Eb", 84, ["hymn"], "Text is public domain; check the translation and arrangement");
  const liftEvery = await song("Lift Every Voice and Sing", "J. W. Johnson and J. R. Johnson", "Ab", 66, ["anthem"], "Original is public domain; check the edition");
  const greatIs = await song("Great Is Thy Faithfulness", "T. Chisholm and W. Runyan", "D", 76, ["hymn"], "Check the edition and arrangement rights");

  // 6. Events with ordered setlists.
  const sunday = nextWeekday(0);
  const thursday = nextWeekday(4);

  await prisma.event.create({
    data: {
      workspaceId,
      title: "Sunday Morning Service",
      type: "Church service",
      date: sunday,
      time: "10:00",
      location: "Main sanctuary",
      prepareBy: addDays(sunday, -1),
      instructions: "Sound check at 8:45. Dress: all black.",
      isDemo: true,
      // Nested rows inherit workspaceId from the event via the composite
      // foreign key, so they cannot point at another workspace.
      groups: {
        create: [
          { groupId: worship.id },
          { groupId: choir.id },
        ],
      },
      setlistItems: {
        create: [
          { songId: liftEvery.id, position: 1, notes: "Choir opens, band enters on verse 2" },
          { songId: amazingGrace.id, position: 2 },
          { songId: beThou.id, position: 3, notes: "Soft ending into prayer" },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      workspaceId,
      title: "Choir Rehearsal",
      type: "Rehearsal",
      date: thursday,
      time: "19:00",
      location: "Choir room",
      instructions: "Bring a pencil.",
      isDemo: true,
      groups: { create: [{ groupId: choir.id }] },
      setlistItems: {
        create: [{ songId: greatIs.id, position: 1, notes: "Altos, review the bridge" }],
      },
    },
  });

  // 7. Activity feed entry.
  await prisma.auditLog.create({
    data: {
      workspaceId,
      actorUserId: leader.id,
      action: "workspace.seeded",
      entityType: "Workspace",
      entityId: workspaceId,
      summary: "Demo workspace created",
    },
  });

  console.log("Seeded demo workspace: 6 contacts, 2 groups, 4 songs, 2 events.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
