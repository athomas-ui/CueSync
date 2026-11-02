import { DemoPill, EmptyState, PageHeader, Pill, SetupNeeded } from "@/components/page-parts";
import { plural } from "@/lib/format";
import { listSongs } from "@/lib/queries";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function LibraryPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return <SetupNeeded />;
  const songs = await listSongs(workspace.id);

  return (
    <>
      <PageHeader eyebrow={workspace.name} title="Music Library">
        CueSync stores links to authorized lyrics sources, never copyrighted lyrics text.
      </PageHeader>
      {songs.length === 0 ? (
        <EmptyState message="Your library is empty." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {songs.map((s) => (
            <li key={s.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold">
                    {s.title}
                    {s.version && <span className="font-normal text-muted-foreground"> ({s.version})</span>}
                  </h2>
                  <p className="text-sm text-muted-foreground">{s.artist || "Unknown artist"}</p>
                </div>
                {s.isDemo && <DemoPill />}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.key && <Pill>Key {s.key}</Pill>}
                {s.tempo && <Pill>{s.tempo} BPM</Pill>}
                {s.tags.map((t) => (
                  <Pill key={t} tone="accent">
                    {t}
                  </Pill>
                ))}
                <Pill>Used in {plural(s._count.setlistItems, "event")}</Pill>
              </div>
              {s.rights && <p className="mt-3 text-sm text-muted-foreground">Rights: {s.rights}</p>}
              {s.notes && <p className="mt-1 text-sm text-warn">{s.notes}</p>}
              {!s.videoUrl && !s.lyricsUrl && !s.chartUrl && (
                <p className="mt-1 text-xs text-muted-foreground">No verified links saved yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
