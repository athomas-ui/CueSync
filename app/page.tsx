import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { DemoBanner, EmptyState, PageHeader, Panel, Pill, SetupNeeded, TextLink } from "@/components/page-parts";
import { formatDate, formatTime, plural } from "@/lib/format";
import { getDashboard } from "@/lib/queries";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return <SetupNeeded />;

  const { upcoming, groups, activity, songCount, contactCount } = await getDashboard(workspace.id);
  const stats = [
    { label: "Upcoming events", value: upcoming.length, href: "/events" },
    { label: "Songs", value: songCount, href: "/library" },
    { label: "Groups", value: groups.length, href: "/groups" },
    { label: "Musicians", value: contactCount, href: "/groups" },
  ];

  return (
    <>
      <PageHeader eyebrow={workspace.name} title="Welcome back" />
      {workspace.isDemo && <DemoBanner />}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border bg-card p-4 transition-colors hover:border-primary">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel title="Upcoming events" action={<TextLink href="/events">All events</TextLink>}>
          {upcoming.length === 0 ? (
            <EmptyState message="No upcoming events." />
          ) : (
            <ul className="divide-y">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <Link href={`/events/${e.id}`} className="flex min-h-11 items-center gap-3 py-3 hover:text-primary">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{e.title}</p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-4" aria-hidden />
                          {formatDate(e.date)} {formatTime(e.time)}
                        </span>
                        {e.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-4" aria-hidden />
                            {e.location}
                          </span>
                        )}
                        <span>{plural(e._count.setlistItems, "song")}</span>
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Groups" action={<TextLink href="/groups">All groups</TextLink>}>
            {groups.length === 0 ? (
              <EmptyState message="No groups yet." />
            ) : (
              <ul className="flex flex-col gap-2">
                {groups.map((g) => (
                  <li key={g.id}>
                    <Link href={`/groups/${g.id}`} className="flex min-h-11 items-center justify-between rounded-lg px-2 hover:bg-muted">
                      <span className="font-medium">{g.name}</span>
                      <Pill>{plural(g._count.memberships, "member")}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity">
            {activity.length === 0 ? (
              <EmptyState message="Nothing yet." />
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {activity.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2">
                    <span>{a.summary}</span>
                    <span className="shrink-0 text-muted-foreground">{formatDate(a.createdAt)}</span>
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
