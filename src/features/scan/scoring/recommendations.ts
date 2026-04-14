import type { Pillar, PillarKey, Recommendation } from "@/features/report/types";

const RECOMMENDATION_TEXT: Record<string, string> = {
  "robots.txt allows AI crawlers":
    "Configure robots.txt to explicitly allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot)",
  "llms.txt exists and validates":
    "Add an llms.txt file to your website root — the emerging standard for providing LLM-friendly documentation",
  "llms-full.txt exists":
    "Create llms-full.txt with comprehensive documentation for complete LLM context",
  "/.well-known/mcp-server discovery":
    "Add a /.well-known/mcp-server discovery endpoint for MCP-compatible agents",
  "/.well-known/agent-card.json":
    "Implement /.well-known/agent-card.json for A2A protocol agent discovery",
  "JSON-LD / Schema.org structured data":
    "Add JSON-LD structured data to help agents understand your content semantically",
  "OpenAPI/Swagger spec accessible":
    "Publish an OpenAPI spec at a standard path (/openapi.json) for automated API discovery",
  "AGENTS.md in repo":
    "Add an AGENTS.md file — the cross-agent standard (60K+ repos) that helps AI coding assistants understand your project",
  "CLAUDE.md / .claude/ in repo":
    "Add CLAUDE.md to improve agent context for Claude Code and similar AI coding tools",
  ".cursorrules / .cursor/rules/":
    "Add .cursorrules for Cursor IDE agent integration",
  "MCP server exists":
    "Build an MCP server to expose your product's capabilities to AI agents",
  "MCP tools count":
    "Expand your MCP server with more tools for comprehensive agent interaction",
  "Test infrastructure in repo":
    "Add test infrastructure — agents use tests to validate their changes",
  "Machine-readable error responses":
    "Document structured JSON error responses for reliable agent error handling",
};

export function generateRecommendations(
  pillars: Record<PillarKey, Pillar>
): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const [pillarKey, pillar] of Object.entries(pillars)) {
    for (const signal of pillar.signals) {
      if (signal.status === "pass") continue;
      if (signal.weight !== "high") continue;

      const text =
        RECOMMENDATION_TEXT[signal.name] ??
        `Improve: ${signal.name} (currently ${signal.status})`;

      recs.push({
        pillar: pillarKey as PillarKey,
        priority: signal.status === "fail" ? "high" : "medium",
        text,
      });
    }
  }

  // Add medium-weight fails if we have room
  if (recs.length < 8) {
    for (const [pillarKey, pillar] of Object.entries(pillars)) {
      for (const signal of pillar.signals) {
        if (signal.status === "pass") continue;
        if (signal.weight !== "medium") continue;
        if (recs.length >= 8) break;

        const text =
          RECOMMENDATION_TEXT[signal.name] ??
          `Improve: ${signal.name} (currently ${signal.status})`;

        recs.push({
          pillar: pillarKey as PillarKey,
          priority: "medium",
          text,
        });
      }
      if (recs.length >= 8) break;
    }
  }

  return recs.slice(0, 8);
}
