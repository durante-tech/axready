import type { Metadata } from "next";
import Link from "next/link";
import { axAboutPath,axHomePath, axReportsPath } from "@/paths";

export const metadata: Metadata = {
  title: {
    default: "AX Score",
    template: "%s | AX Score",
  },
  description:
    "Measure Agent Experience readiness across Access, Context, Tools, and Orchestration.",
};

export default function AxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href={axHomePath()}
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="text-lg">AX</span>
            <span className="text-sm text-muted-foreground font-normal">
              Score
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href={axReportsPath()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Reports
            </Link>
            <Link
              href={axAboutPath()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-16">{children}</main>
    </div>
  );
}
