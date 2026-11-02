"use client";

// Navigation: left sidebar on desktop (md and up), bottom bar on phones.
// Client component only because it reads the current URL to highlight the
// active page. It receives no data, so nothing private reaches the browser here.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, Music, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; short: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", short: "Home", icon: House },
  { href: "/events", label: "Events & Setlists", short: "Events", icon: CalendarDays },
  { href: "/library", label: "Music Library", short: "Music", icon: Music },
  { href: "/groups", label: "Groups", short: "Groups", icon: Users },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function SideNav({ workspaceName }: { workspaceName: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-card px-3 py-5 md:flex">
      <Link href="/" className="mb-1 flex items-center gap-2 px-3 text-lg font-semibold tracking-tight">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Music className="size-4" aria-hidden />
        </span>
        CueSync
      </Link>
      <p className="mb-6 truncate px-3 text-xs text-muted-foreground">{workspaceName}</p>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV.map(({ href, short, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
                {short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
