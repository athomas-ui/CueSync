import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav, SideNav } from "@/components/app-nav";
import { getCurrentWorkspace } from "@/lib/workspace";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CueSync",
  description: "Music coordination for worship leaders, bands, choirs, and ensembles.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const workspace = await getCurrentWorkspace();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-dvh">
          <SideNav workspaceName={workspace?.name ?? "No workspace"} />
          <main className="min-w-0 flex-1 px-4 pt-6 pb-24 sm:px-6 md:px-10 md:pt-10 md:pb-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
