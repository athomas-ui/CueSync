// Read-only look at the demo data. Run with: npm run db:inspect
// Nothing here writes to the database.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // 1. Row counts per table.
  const counts = {
    workspaces: await prisma.workspace.count(),
    contacts: await prisma.contact.count(),
    groups: await prisma.group.count(),
    groupMemberships: await prisma.groupMembership.count(),
    songs: await prisma.song.count(),
    events: await prisma.event.count(),
    setlistItems: await prisma.setlistItem.count(),
  };
  console.table(counts);

  // 2. One contact, every group she belongs to. `include` follows the relation.
  const maya = await prisma.contact.findFirst({
    where: { email: "maya@example.com" },
    include: { groupMemberships: { include: { group: true } } },
  });
  console.log(`\n${maya?.name} (contact id ${maya?.id}) belongs to:`);
  for (const m of maya?.groupMemberships ?? []) {
    console.log(`  - ${m.group.name} as ${m.role}`);
  }

  // 3. Each event's setlist, in order.
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: { setlistItems: { orderBy: { position: "asc" }, include: { song: true } } },
  });
  for (const e of events) {
    console.log(`\n${e.title} on ${e.date?.toISOString().slice(0, 10)} at ${e.time}`);
    for (const item of e.setlistItems) {
      console.log(`  ${item.position}. ${item.song.title}${item.notes ? `  (${item.notes})` : ""}`);
    }
  }

  // 4. Isolation check: every setlist row must share its event's workspace.
  const mismatched = await prisma.setlistItem.findMany({ include: { event: true } });
  const bad = mismatched.filter((i) => i.workspaceId !== i.event.workspaceId);
  console.log(`\nSetlist rows in the wrong workspace: ${bad.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
