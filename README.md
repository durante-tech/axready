# AX Score

Measure Agent Experience (AX) readiness for websites and GitHub repositories. Scores products across four pillars — **Access**, **Context**, **Tools**, and **Orchestration** — using real standards like MCP, AGENTS.md, llms.txt, and OpenAPI.

AX framework by [Matt Biilmann](https://biilmann.com). Built with [DuranteOS](https://durante.tech).

## How It Works

AX Score checks 37 signals across two surfaces:

- **Website scanner** — 12 parallel HTTP fetches checking robots.txt AI crawler rules, llms.txt, MCP discovery, JSON-LD structured data, semantic HTML, OpenAPI specs, sitemap, and more
- **Repo scanner** — GitHub REST API checks for AGENTS.md, CLAUDE.md, MCP server dependencies, test infrastructure, CI/CD, documentation quality, and more

Signals are weighted (High/Medium/Low) and scored (Pass = 2, Partial = 1, Fail = 0). Pillar scores are normalized to 0-100 and combined using pillar weights into an overall score with a letter grade (A through F).

### The Four Pillars

| Pillar | Weight | Question |
|--------|--------|----------|
| **Access** | 25% | Can agents find and reach you? |
| **Context** | 30% | Can agents understand you? |
| **Tools** | 25% | Can agents take actions? |
| **Orchestration** | 20% | Can agents compose workflows? |

## Routes

| Path | Description |
|------|-------------|
| `/ax` | Landing page with scan form |
| `/ax/report/[slug]` | Static report viewer (Netlify, AX Score) |
| `/ax/reports` | Reports listing |
| `/ax/about` | Methodology and credits |
| `/ax/scan?url=...&repo=...` | Live scan results |
| `POST /api/ax/scan` | Scan API — accepts `{url, repo?}`, returns Report JSON |

## Getting Started

```sh
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000/ax](http://localhost:3000/ax).

### Environment Variables

```sh
# Optional — increases GitHub API rate limit from 60 to 5000 req/hr
GITHUB_TOKEN=ghp_...
```

No other env vars are needed for the AX Score features. The existing ticket/org features require additional configuration (Supabase, Stripe, Resend, S3, Inngest) but AX Score pages work without them.

## Deploy

Configured for Netlify via `netlify.toml`. Set `GITHUB_TOKEN` in Netlify environment variables for production GitHub scanning.

## Tech Stack

- Next.js 15 (App Router) + React 19 RC + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Static JSON reports + live scanning via serverless API route

## Standards Referenced

| Standard | Status |
|----------|--------|
| [MCP (Model Context Protocol)](https://modelcontextprotocol.io) | Linux Foundation / AAIF |
| [AGENTS.md](https://docs.agents-md.org) | Linux Foundation / AAIF |
| [llms.txt](https://llmstxt.org) | Community proposal |
| [OpenAPI](https://www.openapis.org) | OpenAPI Initiative |
| [JSON-LD / Schema.org](https://schema.org) | W3C |
| [Agent Experience (AX)](https://agentexperience.ax) | Matt Biilmann |
