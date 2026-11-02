// All reads for the read-only pages.
//
// Security pattern: every function takes workspaceId and filters by it.
// Single-record lookups use findFirst({ where: { id, workspaceId } }), never
// findUnique({ where: { id } }). If someone edits the URL to another
// workspace's id, the query finds nothing and the page returns 404.
// That is the IDOR defense, applied on the server.

import { db } from "./db";

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function getDashboard(workspaceId: string) {
  const [upcoming, groups, activity, songCount, contactCount] = await Promise.all([
    db.event.findMany({
      where: { workspaceId, date: { gte: todayUtc() } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 5,
      include: { groups: { include: { group: true } }, _count: { select: { setlistItems: true } } },
    }),
    db.group.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true } } },
    }),
    db.auditLog.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.song.count({ where: { workspaceId } }),
    db.contact.count({ where: { workspaceId } }),
  ]);
  return { upcoming, groups, activity, songCount, contactCount };
}

export function listEvents(workspaceId: string) {
  return db.event.findMany({
    where: { workspaceId },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: { groups: { include: { group: true } }, _count: { select: { setlistItems: true } } },
  });
}

export function getEvent(workspaceId: string, id: string) {
  return db.event.findFirst({
    where: { id, workspaceId },
    include: {
      groups: { include: { group: { include: { _count: { select: { memberships: true } } } } } },
      setlistItems: { orderBy: { position: "asc" }, include: { song: true } },
    },
  });
}

export function listSongs(workspaceId: string) {
  return db.song.findMany({
    where: { workspaceId },
    orderBy: { title: "asc" },
    include: { _count: { select: { setlistItems: true } } },
  });
}

export function listGroups(workspaceId: string) {
  return db.group.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true, events: true } } },
  });
}

export function getGroup(workspaceId: string, id: string) {
  return db.group.findFirst({
    where: { id, workspaceId },
    include: {
      memberships: { include: { contact: true }, orderBy: { contact: { name: "asc" } } },
      events: { include: { event: true }, orderBy: { event: { date: "asc" } } },
    },
  });
}
