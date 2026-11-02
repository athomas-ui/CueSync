import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DemoPill, EmptyState, PageHeader, Panel, Pill, SetupNeeded } from "@/components/page-parts";
import { formatDate } from "@/lib/format";
import { getGroup } from "@/lib/queries";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return <SetupNeeded />;

  // Scoped to this workspace: an id from another workspace returns null -> 404.
  const group = await getGroup(workspace.id, id);
  if (!group) notFound();

  return (
    <>
      <Link href="/groups" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All groups
      </Link>
      <div className="mb-2 flex flex-wrap gap-2">
        <Pill tone="accent">{group.type}</Pill>
        {group.isDemo && <DemoPill />}
      </div>
      <PageHeader title={group.name}>{group.description}</PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title={`Members (${group.memberships.length})`}>
          {group.memberships.length === 0 ? (
            <EmptyState message="No members yet." />
          ) : (
            <ul className="divide-y">
              {group.memberships.map(({ id: membershipId, role, contact }) => (
                <li key={membershipId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {contact.name}
                      {role && <span className="font-normal text-muted-foreground"> · {role}</span>}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {[contact.email, contact.phone].filter(Boolean).join(" · ") || "No contact details"}
                    </p>
                  </div>
                  <Pill>Prefers {contact.preferredChannel}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Message preferences">
            <p className="text-sm">{group.messagePreferences || "None set."}</p>
          </Panel>
          <Panel title="Events">
            {group.events.length === 0 ? (
              <EmptyState message="Not assigned to any events." />
            ) : (
              <ul className="flex flex-col gap-2">
                {group.events.map(({ event }) => (
                  <li key={event.id}>
                    <Link href={`/events/${event.id}`} className="flex min-h-11 flex-col justify-center rounded-lg px-2 hover:bg-muted">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(event.date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
