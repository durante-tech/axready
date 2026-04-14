"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { DeepScanButton } from "@/features/report/components/deep-scan-button";
import type { Grade, PillarKey, Report, Signal } from "@/features/report/types";
import { PILLAR_DESCRIPTIONS, PILLAR_LABELS, PILLAR_ORDER } from "@/features/report/types";
import { axHomePath } from "@/paths";

const gradeColors: Record<Grade, string> = {
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-red-400",
};

const gradeRings: Record<Grade, string> = {
  A: "#34d399",
  B: "#60a5fa",
  C: "#fbbf24",
  D: "#fb923c",
  F: "#f87171",
};

const gradeBars: Record<Grade, string> = {
  A: "bg-emerald-400",
  B: "bg-blue-400",
  C: "bg-amber-400",
  D: "bg-orange-400",
  F: "bg-red-400",
};

const statusConfig: Record<string, { icon: string; color: string }> = {
  pass: { icon: "\u2713", color: "text-emerald-400 bg-emerald-400/10" },
  partial: { icon: "\u26A0", color: "text-amber-400 bg-amber-400/10" },
  fail: { icon: "\u2717", color: "text-red-400 bg-red-400/10" },
};

const weightColors: Record<string, string> = {
  high: "bg-white/10 text-[#e5e2e1]",
  medium: "bg-white/5 text-[#8b90a0]",
  low: "bg-white/[0.03] text-[#8b90a0]/70",
};

const priorityDots: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-blue-400",
};

function DarkScoreGauge({ score, grade }: { score: number; grade: Grade }) {
  const r = 120;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={160} height={160} viewBox="0 0 256 256" className="-rotate-90">
        <circle cx={128} cy={128} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle
          cx={128} cy={128} r={r} fill="none"
          stroke={gradeRings[grade]} strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-extrabold tabular-nums ${gradeColors[grade]}`} style={{ fontFamily: "Manrope, sans-serif" }}>
          {score}
        </span>
        <span className="text-sm font-medium text-[#8b90a0]">{grade}</span>
      </div>
    </div>
  );
}

function DarkPillarCard({ pillarKey, score, grade }: { pillarKey: PillarKey; score: number; grade: Grade }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#201f1f] p-5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#8b90a0]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
        {PILLAR_LABELS[pillarKey]}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${gradeColors[grade]}`} style={{ fontFamily: "Manrope, sans-serif" }}>
          {score}
        </span>
        <span className={`text-sm font-semibold ${gradeColors[grade]}`}>/ {grade}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${gradeBars[grade]}`} style={{ width: `${score}%`, transition: "width 0.7s" }} />
      </div>
      <p className="mt-2 text-[11px] text-[#8b90a0]">{PILLAR_DESCRIPTIONS[pillarKey]}</p>
    </div>
  );
}

function DarkSignalRow({ signal }: { signal: Signal }) {
  const s = statusConfig[signal.status];
  return (
    <div className="flex items-start gap-3 border-b border-white/[0.04] py-2.5 last:border-0">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${s.color}`}>
        {s.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#e5e2e1]">{signal.name}</span>
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${weightColors[signal.weight]}`}>
            {signal.weight}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[#8b90a0]">{signal.detail}</p>
      </div>
    </div>
  );
}

function ScanResultInner() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const repo = searchParams.get("repo");

  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cacheKey = url ? `ax-scan:${url}:${repo || ""}` : null;

  const fetchScan = useCallback(async () => {
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
      if (cacheKey) {
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* quota */ }
      }
    } catch {
      setError("Network error — could not reach scan API");
    } finally {
      setLoading(false);
    }
  }, [url, repo, cacheKey]);

  useEffect(() => {
    if (!url) { setError("No URL provided"); setLoading(false); return; }
    // Check localStorage cache first
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setReport(JSON.parse(cached) as Report);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }
    fetchScan();
  }, [url, cacheKey, fetchScan]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-400" />
        <p className="text-sm text-[#c1c6d7]">Scanning {url}...</p>
        <p className="text-xs text-[#8b90a0]">Checking robots.txt, llms.txt, GitHub repo, MCP endpoints, and more</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <p className="font-medium text-red-400">{error}</p>
        <Link href={axHomePath()} className="text-sm text-[#8b90a0] underline transition-colors hover:text-[#e5e2e1]">
          Back to AX Ready
        </Link>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-8 py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e1]" style={{ fontFamily: "Manrope, sans-serif" }}>
            {report.name}
          </h1>
          <div className="flex flex-col gap-0.5 text-sm text-[#8b90a0]">
            <Link href={report.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">
              {report.url}
            </Link>
            {report.repo && (
              <Link href={report.repo} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">
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
        <div className="flex flex-col items-end gap-3">
          <DarkScoreGauge score={report.overallScore} grade={report.grade} />
          <DeepScanButton report={report} />
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PILLAR_ORDER.map((key) => (
          <DarkPillarCard key={key} pillarKey={key} score={report.pillars[key].score} grade={report.pillars[key].grade} />
        ))}
      </div>

      {/* Pillar Details */}
      {PILLAR_ORDER.map((key) => {
        const pillar = report.pillars[key];
        const passCount = pillar.signals.filter((s) => s.status === "pass").length;
        const totalCount = pillar.signals.length;
        return (
          <section key={key} className="space-y-1">
            <div className="flex items-baseline gap-3 border-b border-white/[0.06] pb-2">
              <h2 className="text-lg font-semibold uppercase tracking-wider text-[#e5e2e1]" style={{ fontFamily: "Manrope, sans-serif" }}>
                {PILLAR_LABELS[key]}
              </h2>
              <span className="text-sm text-[#8b90a0]">{pillar.score}/100</span>
              <span className="text-xs text-[#8b90a0]">{passCount}/{totalCount} signals passing</span>
            </div>
            <p className="pb-1 text-xs text-[#8b90a0]">{PILLAR_DESCRIPTIONS[key]}</p>
            <div>
              {pillar.signals.map((signal) => (
                <DarkSignalRow key={signal.name} signal={signal} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-b border-white/[0.06] pb-2 text-lg font-semibold uppercase tracking-wider text-[#e5e2e1]" style={{ fontFamily: "Manrope, sans-serif" }}>
            Recommendations
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#201f1f] p-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDots[rec.priority]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#e5e2e1]">{rec.text}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8b90a0]">
                    <span>{PILLAR_LABELS[rec.pillar]}</span>
                    <span className="text-white/10">|</span>
                    <span className="capitalize">{rec.priority} priority</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${report.slug}-ax-report.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#201f1f] px-5 py-2.5 text-sm font-medium text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download JSON
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="inline-flex items-center justify-center rounded-xl border border-white/[0.06] bg-[#201f1f] px-5 py-2.5 text-sm font-medium text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]"
        >
          Copy Share Link
        </button>
        <button
          onClick={() => {
            if (cacheKey) localStorage.removeItem(cacheKey);
            setReport(null);
            setError(null);
            setLoading(true);
            fetchScan();
          }}
          className="inline-flex items-center justify-center rounded-xl border border-white/[0.06] bg-[#201f1f] px-5 py-2.5 text-sm font-medium text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]"
        >
          Re-scan
        </button>
        <Link
          href={axHomePath()}
          className="inline-flex items-center justify-center rounded-xl border border-white/[0.06] bg-[#201f1f] px-5 py-2.5 text-sm font-medium text-[#e5e2e1] transition-colors hover:bg-[#2a2a2a]"
        >
          Scan Another
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] pt-6 text-center text-xs text-[#8b90a0]">
        <p>
          AX framework by{" "}
          <Link href="https://biilmann.com" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-blue-300">
            Matt Biilmann
          </Link>
          . Built with{" "}
          <Link href="https://durante.tech" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-blue-300">
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
    <div className="min-h-screen bg-[#131313]" style={{ fontFamily: "Inter, sans-serif" }}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-400" />
            <p className="text-sm text-[#c1c6d7]">Loading...</p>
          </div>
        }
      >
        <ScanResultInner />
      </Suspense>
    </div>
  );
}
