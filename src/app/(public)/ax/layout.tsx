import type { Metadata } from "next";
import Link from "next/link";
import { axAboutPath, axHomePath, axReportsPath } from "@/paths";

export const metadata: Metadata = {
  title: {
    default: "AX Ready",
    template: "%s | AX Ready",
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
    <div className="ax-theme min-h-screen bg-[#131313]">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-neutral-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link
              href={axHomePath()}
              className="text-xl font-black tracking-tighter text-blue-400"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              AX Ready
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href={axReportsPath()}
                className="text-sm font-bold tracking-tight text-neutral-400 transition-colors hover:text-neutral-100"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Reports
              </Link>
              <Link
                href={axAboutPath()}
                className="text-sm font-bold tracking-tight text-neutral-400 transition-colors hover:text-neutral-100"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                About
              </Link>
            </div>
          </div>
          <Link
            href={axHomePath()}
            className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-bold text-white transition-all hover:opacity-80 active:scale-95"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Scan Product
          </Link>
        </div>
      </nav>
      <main className="pt-14">{children}</main>
    </div>
  );
}
