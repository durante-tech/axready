import type { Signal } from "@/features/report/types";
import { makeSignal } from "./signal-factory";
import { safeFetch, safeText } from "./utils";

const BOT_UA =
  "Mozilla/5.0 (compatible; AXScoreBot/1.0; +https://axscore.dev)";

function checkRobotsTxt(text: string): Signal {
  if (!text) {
    return makeSignal(
      "robots.txt allows AI crawlers",
      "partial",
      1,
      "high",
      "No robots.txt found — AI crawlers allowed by default"
    );
  }

  const crawlers = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
  const lines = text.toLowerCase().split("\n");
  let currentAgent = "";
  const blocked: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("user-agent:")) {
      currentAgent = trimmed.replace("user-agent:", "").trim();
    }
    if (trimmed.startsWith("disallow:") && trimmed.includes("/")) {
      for (const crawler of crawlers) {
        if (
          currentAgent === crawler.toLowerCase() ||
          currentAgent === "*"
        ) {
          if (currentAgent !== "*") {
            blocked.push(crawler);
          }
        }
      }
    }
  }

  // Re-check: specific blocks targeting AI crawlers
  const specificBlocks = crawlers.filter((c) => {
    const agentSection = text
      .toLowerCase()
      .includes(`user-agent: ${c.toLowerCase()}`);
    if (!agentSection) return false;
    const regex = new RegExp(
      `user-agent:\\s*${c.toLowerCase()}[\\s\\S]*?disallow:\\s*/`,
      "i"
    );
    return regex.test(text);
  });

  if (specificBlocks.length === 0) {
    return makeSignal(
      "robots.txt allows AI crawlers",
      "pass",
      2,
      "high",
      `GPTBot, ClaudeBot, PerplexityBot, Google-Extended all permitted`
    );
  }
  if (specificBlocks.length < crawlers.length) {
    return makeSignal(
      "robots.txt allows AI crawlers",
      "partial",
      1,
      "high",
      `Blocked: ${specificBlocks.join(", ")}. Others permitted.`
    );
  }
  return makeSignal(
    "robots.txt allows AI crawlers",
    "fail",
    0,
    "high",
    "All AI crawlers blocked via robots.txt"
  );
}

function checkLlmsTxt(text: string, exists: boolean): Signal {
  if (!exists) {
    return makeSignal(
      "llms.txt exists and validates",
      "fail",
      0,
      "high",
      "No llms.txt found at /llms.txt"
    );
  }
  if (text.trim().startsWith("#")) {
    return makeSignal(
      "llms.txt exists and validates",
      "pass",
      2,
      "high",
      "Valid markdown with structured heading"
    );
  }
  return makeSignal(
    "llms.txt exists and validates",
    "partial",
    1,
    "high",
    "llms.txt exists but may not follow standard markdown format"
  );
}

function checkLlmsFullTxt(text: string, exists: boolean): Signal {
  if (!exists) {
    return makeSignal(
      "llms-full.txt exists",
      "fail",
      0,
      "medium",
      "No llms-full.txt found"
    );
  }
  if (text.length > 1000) {
    return makeSignal(
      "llms-full.txt exists",
      "pass",
      2,
      "medium",
      `Extended documentation file found (${Math.round(text.length / 1000)}KB)`
    );
  }
  return makeSignal(
    "llms-full.txt exists",
    "partial",
    1,
    "medium",
    "llms-full.txt exists but is short"
  );
}

function checkSSR(html: string): Signal {
  if (!html) {
    return makeSignal(
      "SSR/pre-rendered content",
      "fail",
      0,
      "medium",
      "Could not fetch homepage"
    );
  }
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();

  if (textContent.length > 500) {
    return makeSignal(
      "SSR/pre-rendered content",
      "pass",
      2,
      "medium",
      "Content-rich HTML served without JS execution"
    );
  }
  if (textContent.length > 100) {
    return makeSignal(
      "SSR/pre-rendered content",
      "partial",
      1,
      "medium",
      "Some content available without JS, but limited"
    );
  }
  return makeSignal(
    "SSR/pre-rendered content",
    "fail",
    0,
    "medium",
    "Minimal content without JS — likely client-rendered SPA"
  );
}

function checkCaptcha(response: Response | null, html: string): Signal {
  if (!response) {
    return makeSignal(
      "No agent-blocking CAPTCHAs",
      "fail",
      0,
      "medium",
      "Request failed — possible WAF blocking"
    );
  }
  if (response.status === 403 || response.status === 429) {
    return makeSignal(
      "No agent-blocking CAPTCHAs",
      "fail",
      0,
      "medium",
      `HTTP ${response.status} returned for bot user agent`
    );
  }
  const challengePatterns = [
    "cf-challenge",
    "captcha",
    "challenge-platform",
    "just a moment",
  ];
  const lower = html.toLowerCase();
  if (challengePatterns.some((p) => lower.includes(p))) {
    return makeSignal(
      "No agent-blocking CAPTCHAs",
      "partial",
      1,
      "medium",
      "Challenge page detected (Cloudflare or CAPTCHA)"
    );
  }
  return makeSignal(
    "No agent-blocking CAPTCHAs",
    "pass",
    2,
    "medium",
    "No CAPTCHA or WAF challenges for bot user agent"
  );
}

function checkMcpDiscovery(exists: boolean): Signal {
  if (exists) {
    return makeSignal(
      "/.well-known/mcp-server discovery",
      "pass",
      2,
      "high",
      "MCP server discovery endpoint configured and responding"
    );
  }
  return makeSignal(
    "/.well-known/mcp-server discovery",
    "fail",
    0,
    "high",
    "No MCP server discovery endpoint found"
  );
}

function checkAgentCard(exists: boolean): Signal {
  if (exists) {
    return makeSignal(
      "/.well-known/agent-card.json",
      "pass",
      2,
      "medium",
      "A2A protocol agent discovery endpoint present"
    );
  }
  return makeSignal(
    "/.well-known/agent-card.json",
    "fail",
    0,
    "medium",
    "No A2A agent card found"
  );
}

function checkSitemap(exists: boolean, text: string): Signal {
  if (!exists) {
    return makeSignal(
      "sitemap.xml exists",
      "fail",
      0,
      "low",
      "No sitemap.xml found"
    );
  }
  if (text.includes("<urlset") || text.includes("<sitemapindex")) {
    return makeSignal(
      "sitemap.xml exists",
      "pass",
      2,
      "low",
      "Valid XML sitemap detected"
    );
  }
  return makeSignal(
    "sitemap.xml exists",
    "partial",
    1,
    "low",
    "sitemap.xml exists but may not be valid XML"
  );
}

function checkContentNegotiation(
  response: Response | null,
  text: string
): Signal {
  if (!response?.ok) {
    return makeSignal(
      "Content negotiation (markdown)",
      "fail",
      0,
      "low",
      "No markdown content negotiation support"
    );
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/markdown") || text.trim().startsWith("#")) {
    return makeSignal(
      "Content negotiation (markdown)",
      "pass",
      2,
      "low",
      "Markdown response returned for content negotiation"
    );
  }
  return makeSignal(
    "Content negotiation (markdown)",
    "fail",
    0,
    "low",
    "No markdown content negotiation support"
  );
}

function checkJsonLd(html: string): Signal {
  const match = html.match(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) {
    return makeSignal(
      "JSON-LD / Schema.org structured data",
      "fail",
      0,
      "high",
      "No JSON-LD structured data found in HTML"
    );
  }
  try {
    JSON.parse(match[1]);
    return makeSignal(
      "JSON-LD / Schema.org structured data",
      "pass",
      2,
      "high",
      "Valid JSON-LD structured data present"
    );
  } catch {
    return makeSignal(
      "JSON-LD / Schema.org structured data",
      "partial",
      1,
      "high",
      "JSON-LD script tag found but content is malformed"
    );
  }
}

function checkSemanticHtml(html: string): Signal {
  const hasH1 = /<h1[\s>]/i.test(html);
  const hasMain = /<main[\s>]/i.test(html);
  const hasNav = /<nav[\s>]/i.test(html);
  const hasHeader = /<header[\s>]/i.test(html);
  const hasFooter = /<footer[\s>]/i.test(html);
  const landmarks = [hasMain, hasNav, hasHeader, hasFooter].filter(
    Boolean
  ).length;

  if (hasH1 && landmarks >= 3) {
    return makeSignal(
      "Semantic HTML structure",
      "pass",
      2,
      "medium",
      "Strong semantic structure with heading hierarchy and landmarks"
    );
  }
  if (hasH1 && landmarks >= 1) {
    return makeSignal(
      "Semantic HTML structure",
      "partial",
      1,
      "medium",
      "Partial semantic structure — has headings but limited landmarks"
    );
  }
  return makeSignal(
    "Semantic HTML structure",
    "fail",
    0,
    "medium",
    "Poor semantic structure — missing headings or landmarks"
  );
}

function checkOpenApi(found: boolean): Signal {
  if (found) {
    return makeSignal(
      "OpenAPI/Swagger spec accessible",
      "pass",
      2,
      "high",
      "OpenAPI specification found and accessible"
    );
  }
  return makeSignal(
    "OpenAPI/Swagger spec accessible",
    "fail",
    0,
    "high",
    "No OpenAPI/Swagger spec found at standard paths"
  );
}

function checkMachinePricing(found: boolean): Signal {
  if (found) {
    return makeSignal(
      "Machine-readable pricing",
      "pass",
      2,
      "medium",
      "Machine-readable pricing endpoint found"
    );
  }
  return makeSignal(
    "Machine-readable pricing",
    "fail",
    0,
    "medium",
    "No machine-readable pricing endpoint"
  );
}

export type WebsiteSignals = {
  access: Signal[];
  context: Signal[];
};

export async function scanWebsite(url: string): Promise<WebsiteSignals> {
  const base = url.replace(/\/$/, "");
  const fetchOpts = {
    headers: { "User-Agent": BOT_UA },
  };

  const [
    robotsRes,
    llmsRes,
    llmsFullRes,
    homepageRes,
    mcpRes,
    agentCardRes,
    sitemapRes,
    pricingMdRes,
    openapi1,
    openapi2,
    openapi3,
    pricingApiRes,
  ] = await Promise.all([
    safeFetch(`${base}/robots.txt`, fetchOpts),
    safeFetch(`${base}/llms.txt`, fetchOpts),
    safeFetch(`${base}/llms-full.txt`, fetchOpts),
    safeFetch(base, fetchOpts),
    safeFetch(`${base}/.well-known/mcp-server`, fetchOpts),
    safeFetch(`${base}/.well-known/agent-card.json`, fetchOpts),
    safeFetch(`${base}/sitemap.xml`, fetchOpts),
    safeFetch(`${base}/pricing`, {
      headers: { "User-Agent": BOT_UA, Accept: "text/markdown" },
    }),
    safeFetch(`${base}/openapi.json`, fetchOpts),
    safeFetch(`${base}/swagger.json`, fetchOpts),
    safeFetch(`${base}/api-docs`, fetchOpts),
    safeFetch(`${base}/api/pricing`, fetchOpts),
  ]);

  const [robotsTxt, llmsTxt, llmsFullTxt, homepageHtml, sitemapTxt, pricingMdTxt] =
    await Promise.all([
      safeText(robotsRes),
      safeText(llmsRes),
      safeText(llmsFullRes),
      safeText(homepageRes),
      safeText(sitemapRes),
      safeText(pricingMdRes),
    ]);

  const openApiFound =
    openapi1?.ok === true || openapi2?.ok === true || openapi3?.ok === true;
  const pricingApiFound = pricingApiRes?.ok === true;

  const access: Signal[] = [
    checkRobotsTxt(robotsTxt),
    checkLlmsTxt(llmsTxt, llmsRes?.ok === true),
    checkLlmsFullTxt(llmsFullTxt, llmsFullRes?.ok === true),
    checkSSR(homepageHtml),
    checkCaptcha(homepageRes, homepageHtml),
    checkMcpDiscovery(mcpRes?.ok === true),
    checkAgentCard(agentCardRes?.ok === true),
    checkSitemap(sitemapRes?.ok === true, sitemapTxt),
    checkContentNegotiation(pricingMdRes, pricingMdTxt),
  ];

  const context: Signal[] = [
    checkJsonLd(homepageHtml),
    checkSemanticHtml(homepageHtml),
    checkOpenApi(openApiFound),
    checkMachinePricing(pricingApiFound),
  ];

  return { access, context };
}
