import type { PillarKey, Report } from "../types";
import { PILLAR_LABELS, PILLAR_ORDER } from "../types";

const DEEP_ANALYSIS_SIGNALS = new Set([
  "MCP tools count",
  "Machine-readable error responses",
  "Rate limit headers",
  "Idempotency support",
  "OAuth/API key auth for agents",
  "SDK availability",
  "Webhook/callback support",
  "Arazzo workflow definitions",
]);

function statusIcon(status: string): string {
  if (status === "pass") return "[PASS]";
  if (status === "partial") return "[WARN]";
  return "[FAIL]";
}

export function generateDosPrompt(report: Report): string {
  const pillarSummaries = PILLAR_ORDER.map((key) => {
    const pillar = report.pillars[key];
    const signalLines = pillar.signals
      .map((s) => `- ${statusIcon(s.status)} ${s.name} — ${s.detail}`)
      .join("\n");
    return `### ${PILLAR_LABELS[key]} — ${pillar.score}/100 (${pillar.grade})\n${signalLines}`;
  }).join("\n\n");

  const deepSignals: string[] = [];
  for (const key of PILLAR_ORDER) {
    for (const signal of report.pillars[key].signals) {
      if (
        DEEP_ANALYSIS_SIGNALS.has(signal.name) ||
        signal.status === "fail" ||
        signal.status === "partial"
      ) {
        deepSignals.push(
          `- **${signal.name}** (${PILLAR_LABELS[key as PillarKey]}) — currently ${signal.status}: ${signal.detail}`
        );
      }
    }
  }

  const repoLine = report.repo
    ? `- **Repo:** ${report.repo}`
    : "- **Repo:** Not provided";

  const cloneStep = report.repo
    ? `1. Clone ${report.repo} locally`
    : "1. No repo provided — skip repo-level checks";

  const outputFilename = report.repo
    ? `${report.repo.split("/").pop()}-ax-report.json`
    : `${report.slug}-ax-report.json`;

  return `Run a deep AX Score analysis to enrich the quick scan results below.

## Target
- **Name:** ${report.name}
- **URL:** ${report.url}
${repoLine}
- **Quick Scan Date:** ${report.scannedAt}

## Quick Scan Results

**Overall: ${report.overallScore}/100 (${report.grade})**

${pillarSummaries}

## Deep Analysis Required

The following signals need local/deep analysis that the web scanner couldn't perform. For each one, determine the status (pass/partial/fail), score (0=fail, 1=partial, 2=pass), and provide a detail explanation.

${deepSignals.join("\n")}

### Analysis Instructions

${cloneStep}
2. For MCP signals: check for @modelcontextprotocol/sdk in dependencies, parse any mcp.json or MCP server config, count exposed tools
3. For API signals: if the product has public API endpoints, make test requests and inspect response headers (rate limits, error format, idempotency)
4. For documentation quality: read the README and docs/ directory, assess completeness, example coverage, and accuracy of build/test commands
5. For SDK/webhook signals: check npm/pypi registries for published packages, check docs for webhook documentation

### Output Format

Output the enriched report as a JSON object matching this schema:

\`\`\`json
{
  "slug": "${report.slug}",
  "name": "${report.name}",
  "url": "${report.url}",
  ${report.repo ? `"repo": "${report.repo}",` : ""}
  "scannedAt": "${new Date().toISOString().split("T")[0]}",
  "overallScore": "<recalculated>",
  "grade": "<recalculated>",
  "pillars": {
    "access": { "score": "<0-100>", "grade": "<A-F>", "signals": ["..."] },
    "context": { "score": "<0-100>", "grade": "<A-F>", "signals": ["..."] },
    "tools": { "score": "<0-100>", "grade": "<A-F>", "signals": ["..."] },
    "orchestration": { "score": "<0-100>", "grade": "<A-F>", "signals": ["..."] }
  },
  "recommendations": ["..."]
}
\`\`\`

Each signal: \`{ "name": "...", "status": "pass|partial|fail", "score": 0|1|2, "weight": "high|medium|low", "detail": "..." }\`

Pillar weights: Access 25%, Context 30%, Tools 25%, Orchestration 20%
Grade thresholds: A (90+), B (75-89), C (60-74), D (40-59), F (<40)

Merge your deep analysis results with the quick scan signals above. Keep quick scan signals that are already "pass" — only update signals that were "fail" or "partial" if your deep analysis finds different results. Add any new signals the quick scan missed entirely.

Save the final JSON to \`${outputFilename}\` in the current directory.`;
}
