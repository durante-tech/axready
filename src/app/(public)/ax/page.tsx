import type { Metadata } from "next";
import Link from "next/link";
import { ScanForm } from "@/features/scan/components/scan-form";
import { axAboutPath,axReportPath, axReportsPath } from "@/paths";

export const metadata: Metadata = {
  title: "AX Score — Agent Experience Readiness",
  description:
    "Measure how ready your product is for the agent era across Access, Context, Tools, and Orchestration.",
};

export default function AxHomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center pt-12 space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-3xl">
          How ready is your product for the agent era?
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          AX Score measures Agent Experience readiness across 4 pillars —{" "}
          <strong className="text-foreground">Access</strong>,{" "}
          <strong className="text-foreground">Context</strong>,{" "}
          <strong className="text-foreground">Tools</strong>, and{" "}
          <strong className="text-foreground">Orchestration</strong> — using
          real standards like MCP, AGENTS.md, llms.txt, and OpenAPI.
        </p>
        <ScanForm />
        <div className="flex gap-3 pt-2">
          <Link
            href={axReportPath("netlify")}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            View Netlify Report
          </Link>
          <Link
            href={axReportsPath()}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            All Reports
          </Link>
        </div>
      </section>

      {/* Pillars Overview */}
      <section className="space-y-6">
        <h2 className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          The Four Pillars
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Access",
              weight: "25%",
              description:
                "Can agents find and reach you? Covers robots.txt, llms.txt, MCP discovery, SSR, and content negotiation.",
            },
            {
              name: "Context",
              weight: "30%",
              description:
                "Can agents understand you? Covers structured data, AGENTS.md, CLAUDE.md, OpenAPI specs, and documentation quality.",
            },
            {
              name: "Tools",
              weight: "25%",
              description:
                "Can agents take actions? Covers MCP servers, CLI tools, SDKs, auth mechanisms, and workflow definitions.",
            },
            {
              name: "Orchestration",
              weight: "20%",
              description:
                "Can agents compose workflows? Covers error handling, rate limits, idempotency, pagination, and CI infrastructure.",
            },
          ].map((pillar) => (
            <div
              key={pillar.name}
              className="rounded-lg border p-5 space-y-2"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{pillar.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {pillar.weight}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="space-y-4 text-center">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Built on Real Standards
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {[
            "MCP (Model Context Protocol)",
            "AGENTS.md",
            "llms.txt",
            "OpenAPI",
            "JSON-LD",
            "Schema.org",
            "CLAUDE.md",
            "Arazzo Workflows",
          ].map((standard) => (
            <span key={standard} className="whitespace-nowrap">
              {standard}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-3 pb-8">
        <Link
          href={axAboutPath()}
          className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
        >
          Learn about the methodology
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
        <p>
          AX framework by{" "}
          <Link
            href="https://biilmann.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Matt Biilmann
          </Link>
          . Built with{" "}
          <Link
            href="https://durante.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            DOS
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
