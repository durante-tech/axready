"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PillarCard } from "@/features/report/components/pillar-card";
import { RecommendationCard } from "@/features/report/components/recommendation-card";
import { ScoreGauge } from "@/features/report/components/score-gauge";
import { SignalRow } from "@/features/report/components/signal-row";
import type { Report } from "@/features/report/types";
import { PILLAR_DESCRIPTIONS, PILLAR_LABELS, PILLAR_ORDER } from "@/features/report/types";
import { axHomePath } from "@/paths";

function ScanResultInner() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const repo = searchParams.get("repo");

  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const runScan = useCallback(async () => {
    if (!url) {
      setError("No URL provided");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ax/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, repo: repo || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Scan failed");
        setLoading(false);
        return;
      }

      const data: Report = await res.json();
      setReport(data);
    } catch {
      setError("Network error — could not reach scan API");
    } finally {
      setLoading(false);
    }
  }, [url, repo]);

  useEffect(() => {
    runScan();
  }, [runScan]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        <p className="text-sm text-muted-foreground">
          Scanning {url}...
        </p>
        <p className="text-xs text-muted-foreground">
          Checking robots.txt, llms.txt, GitHub repo, MCP endpoints, and more
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <Link
          href={axHomePath()}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          Back to AX Score
        </Link>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{report.name}</h1>
          <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
            <Link
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {report.url}
            </Link>
            {report.repo && (
              <Link
                href={report.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {report.repo}
              </Link>
            )}
            <span>
              Scanned:{" "}
              {new Date(report.scannedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
        <ScoreGauge score={report.overallScore} grade={report.grade} />
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PILLAR_ORDER.map((key) => (
          <PillarCard
            key={key}
            pillarKey={key}
            score={report.pillars[key].score}
            grade={report.pillars[key].grade}
          />
        ))}
      </div>

      {/* Pillar Details */}
      {PILLAR_ORDER.map((key) => {
        const pillar = report.pillars[key];
        const passCount = pillar.signals.filter(
          (s) => s.status === "pass"
        ).length;
        const totalCount = pillar.signals.length;

        return (
          <section key={key} className="space-y-1">
            <div className="flex items-baseline gap-3 border-b pb-2">
              <h2 className="text-lg font-semibold uppercase tracking-wider">
                {PILLAR_LABELS[key]}
              </h2>
              <span className="text-sm text-muted-foreground">
                {pillar.score}/100
              </span>
              <span className="text-xs text-muted-foreground">
                {passCount}/{totalCount} signals passing
              </span>
            </div>
            <p className="text-xs text-muted-foreground pb-1">
              {PILLAR_DESCRIPTIONS[key]}
            </p>
            <div>
              {pillar.signals.map((signal) => (
                <SignalRow key={signal.name} signal={signal} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-wider border-b pb-2">
            Recommendations
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {report.recommendations.map((rec, i) => (
              <RecommendationCard key={i} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      {/* Share */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Copy Share Link
        </button>
        <Link
          href={axHomePath()}
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Scan Another
        </Link>
      </div>

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

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ScanResultInner />
    </Suspense>
  );
}
