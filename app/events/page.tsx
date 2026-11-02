import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { DemoPill, EmptyState, PageHeader, Pill, SetupNeeded } from "@/components/page-parts";
import { formatDate, formatTime, plural } from "@/lib/format";
import { listEvents } from "@/lib/queries";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function EventsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return <SetupNeeded />;
  const events = await listEvents(workspace.id);

  return (
    <>
      <PageHeader eyebrow={workspace.name} title="Events & Setlists" />
      {events.length === 0 ? (
        <EmptyState message="No events yet." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/events/${e.id}`} className="block h-full rounded-xl border bg-card p-4 transition-colors hover:border-primary">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Pill tone="accent">{e.type}</Pill>
                  {e.isDemo && <DemoPill />}
                </div>
                <h2 className="font-semibold">{e.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden />
                  {formatDate(e.date)} {formatTime(e.time)}
                </p>
                {e.location && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-4" aria-hidden />
                    {e.location}
                  </p>
                )}
                <p className="mt-3 text-sm">
                  {plural(e._count.setlistItems, "song")} · {e.groups.map((g) => g.group.name).join(", ") || "No groups"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
