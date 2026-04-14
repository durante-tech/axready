import type {
  Pillar,
  PillarKey,
  Report,
  Signal,
} from "@/features/report/types";
import { getGrade, PILLAR_WEIGHTS } from "@/features/report/types";
import type { RepoSignals } from "../scanners/repo-scanner";
import type { WebsiteSignals } from "../scanners/website-scanner";
import { generateRecommendations } from "./recommendations";

function calculatePillarScore(signals: Signal[]): number {
  const weights = { high: 3, medium: 2, low: 1 };
  let totalWeight = 0;
  let weightedSum = 0;

  for (const signal of signals) {
    const w = weights[signal.weight];
    totalWeight += w;
    weightedSum += (signal.score / 2) * w;
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
}

function makePillar(signals: Signal[]): Pillar {
  const score = calculatePillarScore(signals);
  return { score, grade: getGrade(score), signals };
}

function calculateOverallScore(
  pillars: Record<PillarKey, Pillar>
): number {
  return Math.round(
    Object.entries(PILLAR_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + pillars[key as PillarKey].score * weight,
      0
    )
  );
}

function extractName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.replace(/^www\./, "").split(".");
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return url;
  }
}

function makeSlug(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").replace(/\./g, "-");
  } catch {
    return "scan-result";
  }
}

export function calculateReport({
  url,
  repo,
  websiteSignals,
  repoSignals,
}: {
  url: string;
  repo?: string;
  websiteSignals: WebsiteSignals;
  repoSignals: RepoSignals | null;
}): Report {
  // Merge context signals from website + repo
  const contextSignals = [
    ...websiteSignals.context,
    ...(repoSignals?.context ?? []),
  ];

  // Tools and orchestration come from repo only
  // If no repo, create empty/fail signals for repo-dependent checks
  const toolsSignals = repoSignals?.tools ?? makeNoRepoToolsSignals();
  const orchestrationSignals =
    repoSignals?.orchestration ?? makeNoRepoOrchestrationSignals();

  const pillars: Record<PillarKey, Pillar> = {
    access: makePillar(websiteSignals.access),
    context: makePillar(contextSignals),
    tools: makePillar(toolsSignals),
    orchestration: makePillar(orchestrationSignals),
  };

  const overallScore = calculateOverallScore(pillars);

  const recommendations = generateRecommendations(pillars);

  return {
    slug: makeSlug(url),
    name: extractName(url),
    url,
    repo: repo ? `https://github.com/${repo}` : undefined,
    scannedAt: new Date().toISOString().split("T")[0],
    overallScore,
    grade: getGrade(overallScore),
    pillars,
    recommendations,
  };
}

function makeSignalFail(
  name: string,
  weight: "high" | "medium" | "low"
): Signal {
  return {
    name,
    status: "fail",
    score: 0,
    weight,
    detail: "No repository provided for scanning",
  };
}

function makeNoRepoToolsSignals(): Signal[] {
  return [
    makeSignalFail("MCP server exists", "high"),
    makeSignalFail("MCP tools count", "high"),
    makeSignalFail("OAuth/API key auth for agents", "medium"),
    makeSignalFail("CLI with JSON output mode", "medium"),
    makeSignalFail("SDK availability", "medium"),
    makeSignalFail("Webhook/callback support", "low"),
    makeSignalFail("Arazzo workflow definitions", "low"),
  ];
}

function makeNoRepoOrchestrationSignals(): Signal[] {
  return [
    makeSignalFail("Machine-readable error responses", "high"),
    makeSignalFail("Rate limit headers", "medium"),
    makeSignalFail("Idempotency support", "medium"),
    makeSignalFail("Standard pagination", "medium"),
    makeSignalFail("Test infrastructure in repo", "high"),
    makeSignalFail("CI/CD configuration", "medium"),
    makeSignalFail("package.json scripts", "medium"),
    makeSignalFail(".env.example present", "low"),
    makeSignalFail("Lock file present", "low"),
    makeSignalFail("Type definitions", "low"),
  ];
}
