import type { Metadata } from "next";
import Link from "next/link";
import { ScanForm } from "@/features/scan/components/scan-form";
import { axAboutPath, axReportPath } from "@/paths";

export const metadata: Metadata = {
  title: "AX Ready — The Sovereign Auditor Framework",
  description:
    "Measure how ready your product is for the agent era across Access, Context, Tools, and Orchestration.",
};

function ScoreGaugeHero() {
  const score = 84;
  const circumference = 2 * Math.PI * 120;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/5 p-12"
      style={{
        background: "rgba(58, 57, 57, 0.6)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="absolute inset-0 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-8 border-[#353534]">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128" cy="128" r="120"
              fill="none" stroke="rgba(5,176,70,0.2)" strokeWidth="8"
            />
            <circle
              cx="128" cy="128" r="120"
              fill="none" stroke="url(#ax-grad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <defs>
              <linearGradient id="ax-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#53e16f" />
                <stop offset="100%" stopColor="#05b046" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <span className="text-7xl font-extrabold text-[#e5e2e1]" style={{ fontFamily: "Manrope, sans-serif" }}>
              {score}
            </span>
            <p className="mt-1 text-xs uppercase tracking-widest text-emerald-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              AX Score
            </p>
          </div>
        </div>
        <div className="mt-12 w-full space-y-4">
          <div className="flex items-center justify-between text-xs" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            <span className="text-[#c1c6d7]">LATEST AUDIT</span>
            <span className="font-bold text-emerald-400">VERIFIED EXCELLENT</span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#8b90a0]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              Featured Report
            </p>
            <Link
              href={axReportPath("netlify")}
              className="mt-1 block truncate text-sm text-[#e5e2e1] hover:text-blue-400 transition-colors"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              netlify.com &middot; netlify/netlify-mcp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const pillars = [
  {
    name: "Access",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    color: "text-blue-400",
    hoverBorder: "hover:border-blue-400/30",
    hoverBg: "group-hover:bg-blue-400/10",
    description: "Discovery and reachability. Evaluates robots.txt, llms.txt, MCP discovery endpoints, SSR rendering, and content negotiation.",
    standards: "robots.txt, llms.txt, MCP, sitemap.xml",
  },
  {
    name: "Context",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: "text-emerald-400",
    hoverBorder: "hover:border-emerald-400/30",
    hoverBg: "group-hover:bg-emerald-400/10",
    description: "Semantic understanding. Audits for AGENTS.md, CLAUDE.md, JSON-LD structured data, OpenAPI specs, and documentation quality.",
    standards: "AGENTS.md, CLAUDE.md, JSON-LD, OpenAPI",
  },
  {
    name: "Tools",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-5.384a2.625 2.625 0 010-3.712 2.625 2.625 0 013.712 0l5.384 5.384m-3.712 3.712l5.384 5.384a2.625 2.625 0 003.712 0 2.625 2.625 0 000-3.712l-5.384-5.384m-3.712 3.712L6.7 17.888" />
      </svg>
    ),
    color: "text-amber-400",
    hoverBorder: "hover:border-amber-400/30",
    hoverBg: "group-hover:bg-amber-400/10",
    description: "Functional capability. Maps MCP server tools, CLI availability, SDK packages, authentication mechanisms, and workflow definitions.",
    standards: "MCP Tools, OpenAPI, CLI, SDKs",
  },
  {
    name: "Orchestration",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    color: "text-blue-300",
    hoverBorder: "hover:border-blue-300/30",
    hoverBg: "group-hover:bg-blue-300/10",
    description: "Complex agency. Validates error handling, rate limits, idempotency, pagination, test infrastructure, and CI/CD configuration.",
    standards: "MCP Servers, CI/CD, Tests",
  },
];

export default function AxHomePage() {
  return (
    <div className="bg-[#131313] text-[#e5e2e1]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Hero */}
      <section
        className="mx-auto max-w-7xl px-8 pb-32 pt-24"
        style={{
          backgroundImage:
            "radial-gradient(at 0% 0%, rgba(75,142,255,0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(83,225,111,0.1) 0, transparent 50%)",
        }}
      >
        <div className="grid items-center gap-16 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#353534] px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(83,225,111,0.5)]" />
              <span className="text-[10px] uppercase tracking-widest text-[#c1c6d7]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Framework v1.0 Live
              </span>
            </div>

            <h1
              className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              How ready is your product for the{" "}
              <span className="bg-gradient-to-r from-[#adc6ff] to-[#4b8eff] bg-clip-text text-transparent">
                agent era?
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-[#c1c6d7] md:text-xl">
              AX Score measures Agent Experience readiness across 4 pillars — Access, Context, Tools, and
              Orchestration — using real standards like MCP, AGENTS.md, llms.txt, and OpenAPI.
            </p>

            <ScanForm />
          </div>

          <div className="lg:col-span-5">
            <ScoreGaugeHero />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl border-t border-white/[0.03] px-8 py-32">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              The Four Pillars of Agent Experience
            </h2>
            <p className="text-[#c1c6d7]">
              Our auditing engine decomposes your digital footprint into four critical vectors that
              determine how effectively an AI agent can interpret, use, and coordinate with your platform.
            </p>
          </div>
          <div
            className="pb-2 text-[10px] uppercase tracking-[0.2em] text-[#8b90a0]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Technical Specification v1
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.name}
              className={`group rounded-xl border border-white/[0.06] bg-[#201f1f] p-8 transition-all ${pillar.hoverBorder}`}
            >
              <div
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#353534] transition-colors ${pillar.hoverBg}`}
              >
                <span className={pillar.color}>{pillar.icon}</span>
              </div>
              <h3 className="mb-3 text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
                {pillar.name}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-[#c1c6d7]">
                {pillar.description}
              </p>
              <div className="border-t border-white/[0.06] pt-6">
                <span
                  className="text-[10px] uppercase tracking-widest text-[#8b90a0]"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  Standards: {pillar.standards}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Standards Banner */}
      <section className="border-y border-white/[0.06] bg-[#1c1b1b] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 md:flex-row">
          <div className="flex items-center gap-4">
            <span
              className="text-xs uppercase tracking-[0.3em] text-[#c1c6d7]"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Built on real standards
            </span>
            <div className="h-px w-12 bg-white/10" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60">
            {["MCP Protocol", "AGENTS.md", "llms.txt", "OpenAPI 3.1", "JSON Schema"].map((s) => (
              <span
                key={s}
                className="text-sm font-bold tracking-tighter text-[#e5e2e1]"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-neutral-900 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-8 md:grid-cols-2">
          <div>
            <span className="mb-2 block text-lg font-bold text-neutral-100" style={{ fontFamily: "Manrope, sans-serif" }}>
              AX Ready
            </span>
            <p
              className="text-[10px] uppercase tracking-widest text-neutral-500"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              AX framework by{" "}
              <Link href="https://biilmann.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                Matt Biilmann
              </Link>
              . Built with{" "}
              <Link href="https://durante.tech" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                DOS
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-8 md:justify-end">
            {[
              { label: "Methodology", href: axAboutPath() },
              { label: "Reports", href: axReportPath("netlify") },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-blue-300"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
