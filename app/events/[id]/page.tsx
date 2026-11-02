import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { DemoPill, EmptyState, PageHeader, Panel, Pill, SetupNeeded } from "@/components/page-parts";
import { formatDate, formatTime, plural } from "@/lib/format";
import { getEvent } from "@/lib/queries";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return <SetupNeeded />;

  // Scoped to this workspace: an id from another workspace returns null -> 404.
  const event = await getEvent(workspace.id, id);
  if (!event) notFound();

  return (
    <>
      <Link href="/events" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All events
      </Link>
      <div className="mb-2 flex flex-wrap gap-2">
        <Pill tone="accent">{event.type}</Pill>
        {event.isDemo && <DemoPill />}
      </div>
      <PageHeader title={event.title}>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4" aria-hidden />
            {formatDate(event.date, "long")}
          </span>
          {event.time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" aria-hidden />
              {formatTime(event.time)}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {event.location}
            </span>
          )}
        </p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title={`Setlist (${plural(event.setlistItems.length, "song")})`}>
          {event.setlistItems.length === 0 ? (
            <EmptyState message="No songs in this setlist yet." />
          ) : (
            <ol className="divide-y">
              {event.setlistItems.map((item) => {
                // Per-event key/tempo override the library values when set.
                const key = item.key ?? item.song.key;
                const tempo = item.tempo ?? item.song.tempo;
                return (
                  <li key={item.id} className="flex gap-3 py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {item.position}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.song.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {[item.song.artist, key && `Key ${key}`, tempo && `${tempo} BPM`].filter(Boolean).join(" · ")}
                      </p>
                      {item.notes && <p className="mt-1 text-sm">{item.notes}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Groups">
            {event.groups.length === 0 ? (
              <EmptyState message="No groups assigned." />
            ) : (
              <ul className="flex flex-col gap-2">
                {event.groups.map(({ group }) => (
                  <li key={group.id}>
                    <Link href={`/groups/${group.id}`} className="flex min-h-11 items-center justify-between rounded-lg px-2 hover:bg-muted">
                      <span className="font-medium">{group.name}</span>
                      <Pill>{plural(group._count.memberships, "member")}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Preparation">
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Prepare by</dt>
                <dd>{event.prepareBy ? formatDate(event.prepareBy, "long") : "No deadline"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Instructions</dt>
                <dd>{event.instructions || "None"}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
