// Small building blocks shared by the read-only pages.

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {children && <div className="mt-2 text-muted-foreground">{children}</div>}
    </header>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4 sm:p-5", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
        tone === "warn" && "bg-warn-soft text-warn"
      )}
    >
      {children}
    </span>
  );
}

export function DemoPill() {
  return <Pill tone="warn">Demo</Pill>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{message}</p>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

// Shown when the database has no workspace yet.
export function SetupNeeded() {
  return (
    <Panel title="No workspace yet">
      <p className="text-sm text-muted-foreground">
        The database is empty. Load the demo workspace with{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">npm run db:seed</code>, then refresh.
      </p>
    </Panel>
  );
}

export function DemoBanner() {
  return (
    <p className="mb-6 rounded-lg bg-warn-soft px-4 py-3 text-sm text-warn">
      <strong>Demo data.</strong> Names use example.com emails, and keys and tempos are placeholders. Sign-in and editing arrive in upcoming sessions.
    </p>
  );
}
