import type { Metadata } from "next";
import Link from "next/link";
import { axReportsPath } from "@/paths";

export const metadata: Metadata = {
  title: "About",
  description: "How AX Score measures Agent Experience readiness.",
};

const signals = {
  access: [
    "robots.txt allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot)",
    "llms.txt exists and validates as structured markdown",
    "llms-full.txt provides extended documentation",
    "SSR/pre-rendered content accessible without JS",
    "No agent-blocking CAPTCHAs or aggressive WAF",
    "/.well-known/mcp-server discovery endpoint",
    "/.well-known/agent-card.json (A2A protocol)",
    "sitemap.xml for crawlability",
    "Content negotiation for text/markdown",
  ],
  context: [
    "JSON-LD / Schema.org structured data in HTML",
    "Semantic HTML with proper heading hierarchy",
    "OpenAPI/Swagger spec accessible",
    "Machine-readable pricing endpoint",
    "AGENTS.md in repository root",
    "CLAUDE.md or .claude/ directory for Claude Code",
    ".cursorrules or .cursor/rules/ for Cursor IDE",
    "llms.txt in repository root",
    "README quality (>50 lines, code blocks, commands)",
    "Documentation directory with substantive content",
    "Architecture Decision Records",
  ],
  tools: [
    "MCP server exists and is published",
    "MCP tools count and coverage",
    "OAuth/API key auth documented for agents",
    "CLI with JSON output mode",
    "SDK availability across major languages",
    "Webhook/callback support for async operations",
    "Arazzo workflow definitions",
  ],
  orchestration: [
    "Machine-readable JSON error responses",
    "Rate limit headers (X-RateLimit-*, Retry-After)",
    "Idempotency-Key header support",
    "Standard cursor or offset pagination",
    "Test infrastructure in repository",
    "CI/CD configuration",
    "package.json scripts (test, build, lint)",
    ".env.example for reproducible setup",
    "Lock file for deterministic dependencies",
    "Type definitions (.d.ts or types/)",
  ],
};

const pillarMeta: Record<
  string,
  { name: string; weight: string; question: string }
> = {
  access: {
    name: "Access",
    weight: "25%",
    question: "Can agents find and reach you?",
  },
  context: {
    name: "Context",
    weight: "30%",
    question: "Can agents understand you?",
  },
  tools: {
    name: "Tools",
    weight: "25%",
    question: "Can agents take actions?",
  },
  orchestration: {
    name: "Orchestration",
    weight: "20%",
    question: "Can agents compose workflows?",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          AX Score measures Agent Experience (AX) readiness — how well a product
          enables AI agents to discover, understand, and interact with it. The
          framework is based on{" "}
          <Link
            href="https://www.netlify.com/blog/the-rise-of-agent-experience-ax/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Matt Biilmann&apos;s AX concept
          </Link>
          , which identifies the shift from human-first to agent-first product
          design.
        </p>
      </div>

      {/* Scoring */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Scoring</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each signal is checked and scored: <strong>Pass</strong> (2 points),{" "}
          <strong>Partial</strong> (1 point), or <strong>Fail</strong> (0
          points). Signals are weighted by importance (High, Medium, Low).
          Pillar scores are normalized to 0-100 and combined using pillar
          weights into an overall score.
        </p>
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <p className="font-medium">Grade Thresholds</p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { grade: "A", range: "90-100", color: "text-emerald-500" },
              { grade: "B", range: "75-89", color: "text-blue-500" },
              { grade: "C", range: "60-74", color: "text-amber-500" },
              { grade: "D", range: "40-59", color: "text-orange-500" },
              { grade: "F", range: "0-39", color: "text-red-500" },
            ].map((g) => (
              <div key={g.grade}>
                <span className={`text-lg font-bold ${g.color}`}>
                  {g.grade}
                </span>
                <p className="text-xs text-muted-foreground">{g.range}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      {(Object.keys(pillarMeta) as Array<keyof typeof signals>).map((key) => (
        <section key={key} className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-semibold">
              {pillarMeta[key].name}
            </h2>
            <span className="text-sm text-muted-foreground">
              {pillarMeta[key].weight}
            </span>
          </div>
          <p className="text-sm text-muted-foreground italic">
            {pillarMeta[key].question}
          </p>
          <ul className="space-y-1">
            {signals[key].map((signal) => (
              <li
                key={signal}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                {signal}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Standards */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Standards Referenced</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          {[
            {
              name: "MCP (Model Context Protocol)",
              url: "https://modelcontextprotocol.io",
              note: "Linux Foundation / AAIF, 8M+ downloads",
            },
            {
              name: "AGENTS.md",
              url: "https://docs.agents-md.org",
              note: "Linux Foundation / AAIF, 60,000+ repos",
            },
            {
              name: "llms.txt",
              url: "https://llmstxt.org",
              note: "Community proposal, ~951 domains",
            },
            {
              name: "OpenAPI",
              url: "https://www.openapis.org",
              note: "OpenAPI Initiative, industry standard",
            },
            {
              name: "JSON-LD / Schema.org",
              url: "https://schema.org",
              note: "W3C, Google-recommended",
            },
            {
              name: "Agent Experience (AX)",
              url: "https://agentexperience.ax",
              note: "Framework by Matt Biilmann",
            },
          ].map((standard) => (
            <div key={standard.name} className="flex items-baseline gap-2">
              <Link
                href={standard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground shrink-0"
              >
                {standard.name}
              </Link>
              <span className="text-xs">— {standard.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Credit */}
      <section className="border-t pt-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          AX Score is built on Matt Biilmann&apos;s Agent Experience framework.
          Matt coined the term AX to describe the emerging need for products to
          be designed not just for human users, but for AI agents that act on
          their behalf.
        </p>
        <p className="text-sm text-muted-foreground">
          This tool was built with{" "}
          <Link
            href="https://durante.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            DuranteOS (DOS)
          </Link>{" "}
          — a personal AI operating system.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center pb-4">
        <Link
          href={axReportsPath()}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          View Reports
        </Link>
      </div>
    </div>
  );
}
