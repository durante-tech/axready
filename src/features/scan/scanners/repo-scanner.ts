import type { Signal } from "@/features/report/types";
import { makeSignal } from "./signal-factory";
import { safeFetch, safeJson } from "./utils";

const GITHUB_API = "https://api.github.com";

const headers: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  const res = await safeFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  );
  if (!res?.ok) return null;
  const data = (await safeJson(res)) as {
    content?: string;
    encoding?: string;
  } | null;
  if (!data?.content) return null;
  return Buffer.from(data.content, "base64").toString("utf-8");
}

async function getRepoTree(
  owner: string,
  repo: string
): Promise<string[]> {
  const res = await safeFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers },
    10000
  );
  if (!res?.ok) return [];
  const data = (await safeJson(res)) as {
    tree?: Array<{ path: string }>;
  } | null;
  return data?.tree?.map((item) => item.path) ?? [];
}

export type RepoSignals = {
  context: Signal[];
  tools: Signal[];
  orchestration: Signal[];
};

export async function scanRepo(repoStr: string): Promise<RepoSignals> {
  const parts = repoStr.split("/");
  const owner = parts[0];
  const repo = parts[1];

  const [tree, readmeContent, packageJsonContent] = await Promise.all([
    getRepoTree(owner, repo),
    getFileContent(owner, repo, "README.md"),
    getFileContent(owner, repo, "package.json"),
  ]);

  let packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
    bin?: unknown;
  } | null = null;
  if (packageJsonContent) {
    try {
      packageJson = JSON.parse(packageJsonContent);
    } catch {
      packageJson = null;
    }
  }

  const fileSet = new Set(tree);
  const fileLower = new Set(tree.map((p) => p.toLowerCase()));

  const hasFile = (path: string) =>
    fileSet.has(path) || fileLower.has(path.toLowerCase());
  const hasDir = (dir: string) =>
    tree.some((p) => p.startsWith(dir));
  const filesInDir = (dir: string) =>
    tree.filter((p) => p.startsWith(dir)).length;

  // CONTEXT signals
  const agentsMd = hasFile("AGENTS.md");
  const claudeMd =
    hasFile("CLAUDE.md") || hasDir(".claude/");
  const cursorRules =
    hasFile(".cursorrules") || hasDir(".cursor/rules/");
  const llmsTxtRepo = hasFile("llms.txt");

  const readmeLines = readmeContent?.split("\n").length ?? 0;
  const readmeHasCode = readmeContent?.includes("```") ?? false;

  const docsFiles = filesInDir("docs/");
  const hasAdr = hasDir("docs/adr/") || hasDir("docs/decisions/");

  const contextSignals: Signal[] = [
    makeSignal(
      "AGENTS.md in repo",
      agentsMd ? "pass" : "fail",
      agentsMd ? 2 : 0,
      "high",
      agentsMd
        ? "AGENTS.md found in repository root"
        : "No AGENTS.md in repository"
    ),
    makeSignal(
      "CLAUDE.md / .claude/ in repo",
      claudeMd ? "pass" : "fail",
      claudeMd ? 2 : 0,
      "high",
      claudeMd
        ? "Claude Code configuration found"
        : "No CLAUDE.md or .claude/ directory"
    ),
    makeSignal(
      ".cursorrules / .cursor/rules/",
      cursorRules ? "pass" : "fail",
      cursorRules ? 2 : 0,
      "medium",
      cursorRules
        ? "Cursor AI configuration present"
        : "No Cursor AI configuration"
    ),
    makeSignal(
      "llms.txt in repo root",
      llmsTxtRepo ? "pass" : "fail",
      llmsTxtRepo ? 2 : 0,
      "medium",
      llmsTxtRepo
        ? "llms.txt found in repository root"
        : "No llms.txt in repository"
    ),
    makeSignal(
      "README quality",
      readmeLines > 50 && readmeHasCode
        ? "pass"
        : readmeLines > 50 || readmeHasCode
          ? "partial"
          : "fail",
      readmeLines > 50 && readmeHasCode ? 2 : readmeLines > 50 || readmeHasCode ? 1 : 0,
      "medium",
      readmeContent
        ? `${readmeLines} lines${readmeHasCode ? ", contains code blocks" : ""}`
        : "No README.md found"
    ),
    makeSignal(
      "Documentation directory",
      docsFiles > 2
        ? "pass"
        : docsFiles > 0
          ? "partial"
          : "fail",
      docsFiles > 2 ? 2 : docsFiles > 0 ? 1 : 0,
      "medium",
      docsFiles > 0
        ? `docs/ directory with ${docsFiles} files`
        : "No docs/ directory"
    ),
    makeSignal(
      "Architecture Decision Records",
      hasAdr ? "pass" : "fail",
      hasAdr ? 2 : 0,
      "low",
      hasAdr
        ? "ADR directory found"
        : "No docs/adr/ or docs/decisions/ directory"
    ),
  ];

  // TOOLS signals
  const allDeps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };
  const hasMcpSdk =
    "@modelcontextprotocol/sdk" in allDeps ||
    hasFile("mcp.json") ||
    hasFile("mcp-config.json");

  const mcpToolCount = hasMcpSdk ? estimateMcpTools(tree, readmeContent) : 0;

  const readmeLower = (readmeContent ?? "").toLowerCase();
  const hasAuth =
    readmeLower.includes("oauth") ||
    readmeLower.includes("api key") ||
    readmeLower.includes("authentication") ||
    readmeLower.includes("bearer");
  const hasCli =
    !!packageJson?.bin || readmeLower.includes("cli") || readmeLower.includes("command line");
  const hasJsonMode = readmeLower.includes("--json") || readmeLower.includes("json output");
  const hasMultiSdk =
    (readmeLower.includes("npm") ? 1 : 0) +
      (readmeLower.includes("pip") || readmeLower.includes("pypi") ? 1 : 0) +
      (readmeLower.includes("go get") ? 1 : 0) +
      (readmeLower.includes("gem") ? 1 : 0) >
    1;
  const hasSingleSdk =
    readmeLower.includes("npm") ||
    readmeLower.includes("pip") ||
    readmeLower.includes("go get");
  const hasWebhook =
    readmeLower.includes("webhook") || readmeLower.includes("callback");
  const hasArazzo = hasFile("arazzo.yaml") || hasFile("arazzo.yml");

  const toolsSignals: Signal[] = [
    makeSignal(
      "MCP server exists",
      hasMcpSdk ? "pass" : "fail",
      hasMcpSdk ? 2 : 0,
      "high",
      hasMcpSdk
        ? "MCP server or SDK dependency found"
        : "No MCP server detected"
    ),
    makeSignal(
      "MCP tools count",
      mcpToolCount > 10
        ? "pass"
        : mcpToolCount > 0
          ? "partial"
          : "fail",
      mcpToolCount > 10 ? 2 : mcpToolCount > 0 ? 1 : 0,
      "high",
      mcpToolCount > 0
        ? `Estimated ${mcpToolCount} tools exposed`
        : "No MCP tools detected"
    ),
    makeSignal(
      "OAuth/API key auth for agents",
      hasAuth ? "pass" : "fail",
      hasAuth ? 2 : 0,
      "medium",
      hasAuth
        ? "Authentication mechanism documented"
        : "No auth documentation found"
    ),
    makeSignal(
      "CLI with JSON output mode",
      hasCli && hasJsonMode
        ? "pass"
        : hasCli
          ? "partial"
          : "fail",
      hasCli && hasJsonMode ? 2 : hasCli ? 1 : 0,
      "medium",
      hasCli
        ? hasJsonMode
          ? "CLI with JSON output mode"
          : "CLI exists but no JSON output mode documented"
        : "No CLI tool detected"
    ),
    makeSignal(
      "SDK availability",
      hasMultiSdk ? "pass" : hasSingleSdk ? "partial" : "fail",
      hasMultiSdk ? 2 : hasSingleSdk ? 1 : 0,
      "medium",
      hasMultiSdk
        ? "SDKs available for multiple languages"
        : hasSingleSdk
          ? "SDK available for one language"
          : "No SDK packages detected"
    ),
    makeSignal(
      "Webhook/callback support",
      hasWebhook ? "pass" : "fail",
      hasWebhook ? 2 : 0,
      "low",
      hasWebhook
        ? "Webhook/callback support documented"
        : "No webhook support detected"
    ),
    makeSignal(
      "Arazzo workflow definitions",
      hasArazzo ? "pass" : "fail",
      hasArazzo ? 2 : 0,
      "low",
      hasArazzo
        ? "Arazzo workflow spec found"
        : "No Arazzo workflow definitions"
    ),
  ];

  // ORCHESTRATION signals
  const hasTestDirs =
    hasDir("test/") ||
    hasDir("__tests__/") ||
    hasDir("spec/") ||
    hasDir("tests/");
  const hasTestConfig = tree.some(
    (p) =>
      p.match(/^jest\.config/) ||
      p.match(/^vitest\.config/) ||
      p.match(/^pytest\.ini/) ||
      p.match(/^\.mocharc/)
  );
  const hasCi = hasDir(".github/workflows/");
  const scripts = packageJson?.scripts ?? {};
  const hasTestScript = "test" in scripts;
  const hasBuildScript = "build" in scripts;
  const hasLintScript = "lint" in scripts;
  const scriptCount = [hasTestScript, hasBuildScript, hasLintScript].filter(
    Boolean
  ).length;
  const hasEnvExample = hasFile(".env.example");
  const hasLockFile =
    hasFile("package-lock.json") ||
    hasFile("yarn.lock") ||
    hasFile("pnpm-lock.yaml") ||
    hasFile("bun.lockb");
  const hasTypes =
    tree.some((p) => p.endsWith(".d.ts")) || hasDir("types/");

  // Error response check — check if the repo has API routes
  const hasStructuredErrors =
    readmeLower.includes("json error") ||
    readmeLower.includes("error response") ||
    readmeLower.includes("error code");
  const hasRateLimit =
    readmeLower.includes("rate limit") || readmeLower.includes("retry-after");
  const hasIdempotency = readmeLower.includes("idempotency");
  const hasPagination =
    readmeLower.includes("pagination") ||
    readmeLower.includes("cursor") ||
    readmeLower.includes("offset");

  const orchestrationSignals: Signal[] = [
    makeSignal(
      "Machine-readable error responses",
      hasStructuredErrors ? "pass" : "fail",
      hasStructuredErrors ? 2 : 0,
      "high",
      hasStructuredErrors
        ? "Structured JSON error responses documented"
        : "No structured error response documentation"
    ),
    makeSignal(
      "Rate limit headers",
      hasRateLimit ? "pass" : "fail",
      hasRateLimit ? 2 : 0,
      "medium",
      hasRateLimit
        ? "Rate limiting documented"
        : "No rate limit documentation"
    ),
    makeSignal(
      "Idempotency support",
      hasIdempotency ? "pass" : "fail",
      hasIdempotency ? 2 : 0,
      "medium",
      hasIdempotency
        ? "Idempotency support documented"
        : "No idempotency documentation"
    ),
    makeSignal(
      "Standard pagination",
      hasPagination ? "pass" : "fail",
      hasPagination ? 2 : 0,
      "medium",
      hasPagination
        ? "Pagination support documented"
        : "No pagination documentation"
    ),
    makeSignal(
      "Test infrastructure in repo",
      hasTestDirs && hasTestConfig
        ? "pass"
        : hasTestDirs || hasTestConfig
          ? "partial"
          : "fail",
      hasTestDirs && hasTestConfig ? 2 : hasTestDirs || hasTestConfig ? 1 : 0,
      "high",
      hasTestDirs
        ? hasTestConfig
          ? "Test directories and configuration found"
          : "Test directories found but no test config"
        : "No test infrastructure"
    ),
    makeSignal(
      "CI/CD configuration",
      hasCi ? "pass" : "fail",
      hasCi ? 2 : 0,
      "medium",
      hasCi
        ? "GitHub Actions workflows found"
        : "No CI/CD configuration"
    ),
    makeSignal(
      "package.json scripts",
      scriptCount >= 3
        ? "pass"
        : scriptCount >= 2
          ? "partial"
          : "fail",
      scriptCount >= 3 ? 2 : scriptCount >= 2 ? 1 : 0,
      "medium",
      `${scriptCount}/3 standard scripts present (test, build, lint)`
    ),
    makeSignal(
      ".env.example present",
      hasEnvExample ? "pass" : "fail",
      hasEnvExample ? 2 : 0,
      "low",
      hasEnvExample
        ? ".env.example found for reproducible setup"
        : "No .env.example file"
    ),
    makeSignal(
      "Lock file present",
      hasLockFile ? "pass" : "fail",
      hasLockFile ? 2 : 0,
      "low",
      hasLockFile
        ? "Dependency lock file committed"
        : "No lock file found"
    ),
    makeSignal(
      "Type definitions",
      hasTypes ? "pass" : "fail",
      hasTypes ? 2 : 0,
      "low",
      hasTypes
        ? "TypeScript definitions present"
        : "No type definitions found"
    ),
  ];

  return {
    context: contextSignals,
    tools: toolsSignals,
    orchestration: orchestrationSignals,
  };
}

function estimateMcpTools(tree: string[], readme: string | null): number {
  // Try to count tool-like patterns in the tree
  const toolFiles = tree.filter(
    (p) =>
      (p.includes("tool") || p.includes("handler")) &&
      (p.endsWith(".ts") || p.endsWith(".js"))
  ).length;

  // Check README for tool count mentions
  if (readme) {
    const match = readme.match(/(\d+)\s*tools?/i);
    if (match) return parseInt(match[1], 10);
  }

  return toolFiles;
}
