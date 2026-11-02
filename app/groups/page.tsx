import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DemoPill, EmptyState, PageHeader, Pill, SetupNeeded } from "@/components/page-parts";
import { plural } from "@/lib/format";
import { listGroups } from "@/lib/queries";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return <SetupNeeded />;
  const groups = await listGroups(workspace.id);

  return (
    <>
      <PageHeader eyebrow={workspace.name} title="Groups" />
      {groups.length === 0 ? (
        <EmptyState message="No groups yet." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link href={`/groups/${g.id}`} className="flex h-full items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Pill tone="accent">{g.type}</Pill>
                    {g.isDemo && <DemoPill />}
                  </div>
                  <h2 className="font-semibold">{g.name}</h2>
                  {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
                  <p className="mt-3 text-sm">
                    {plural(g._count.memberships, "member")} · {plural(g._count.events, "event")}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
