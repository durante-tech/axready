import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllReports, getReport } from "@/features/report/queries/get-report";
import type { Grade, PillarKey, Signal } from "@/features/report/types";
import { PILLAR_DESCRIPTIONS, PILLAR_LABELS, PILLAR_ORDER } from "@/features/report/types";

const gradeColors: Record<Grade, string> = {
  A: "text-emerald-400", B: "text-blue-400", C: "text-amber-400", D: "text-orange-400", F: "text-red-400",
};
const gradeRings: Record<Grade, string> = {
  A: "#34d399", B: "#60a5fa", C: "#fbbf24", D: "#fb923c", F: "#f87171",
};
const gradeBars: Record<Grade, string> = {
  A: "bg-emerald-400", B: "bg-blue-400", C: "bg-amber-400", D: "bg-orange-400", F: "bg-red-400",
};
const statusCfg: Record<string, { icon: string; color: string }> = {
  pass: { icon: "\u2713", color: "text-emerald-400 bg-emerald-400/10" },
  partial: { icon: "\u26A0", color: "text-amber-400 bg-amber-400/10" },
  fail: { icon: "\u2717", color: "text-red-400 bg-red-400/10" },
};
const weightCfg: Record<string, string> = {
  high: "bg-white/10 text-[#e5e2e1]", medium: "bg-white/5 text-[#8b90a0]", low: "bg-white/[0.03] text-[#8b90a0]/70",
};
const priorityDots: Record<string, string> = {
  high: "bg-red-400", medium: "bg-amber-400", low: "bg-blue-400",
};

function Gauge({ score, grade }: { score: number; grade: Grade }) {
  const r = 120, circ = 2 * Math.PI * r, off = circ * (1 - score / 100);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={160} height={160} viewBox="0 0 256 256" className="-rotate-90">
        <circle cx={128} cy={128} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={128} cy={128} r={r} fill="none" stroke={gradeRings[grade]} strokeWidth={10} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-extrabold tabular-nums ${gradeColors[grade]}`} style={{ fontFamily: "Manrope, sans-serif" }}>{score}</span>
        <span className="text-sm font-medium text-[#8b90a0]">{grade}</span>
      </div>
    </div>
  );
}

function Pillar({ pillarKey, score, grade }: { pillarKey: PillarKey; score: number; grade: Grade }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#201f1f] p-5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#8b90a0]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{PILLAR_LABELS[pillarKey]}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${gradeColors[grade]}`} style={{ fontFamily: "Manrope, sans-serif" }}>{score}</span>
        <span className={`text-sm font-semibold ${gradeColors[grade]}`}>/ {grade}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${gradeBars[grade]}`} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-[#8b90a0]">{PILLAR_DESCRIPTIONS[pillarKey]}</p>
    </div>
  );
}

function SignalRow({ signal }: { signal: Signal }) {
  const s = statusCfg[signal.status];
  return (
    <div className="flex items-start gap-3 border-b border-white/[0.04] py-2.5 last:border-0">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${s.color}`}>{s.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#e5e2e1]">{signal.name}</span>
          <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${weightCfg[signal.weight]}`}>{signal.weight}</span>
        </div>
        <p className="mt-0.5 text-xs text-[#8b90a0]">{signal.detail}</p>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getAllReports().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report) return { title: "Report Not Found" };
  return {
    title: `${report.name} — ${report.overallScore}/${report.grade}`,
    description: `AX Score report for ${report.name}: ${report.overallScore}/100 (${report.grade})`,
  };
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-8 bg-[#131313] px-8 py-12 text-[#e5e2e1]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>{report.name}</h1>
          <div className="flex flex-col gap-0.5 text-sm text-[#8b90a0]">
            <Link href={report.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">{report.url}</Link>
            {report.repo && <Link href={report.repo} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">{report.repo}</Link>}
            <span>Scanned: {new Date(report.scannedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
        <Gauge score={report.overallScore} grade={report.grade} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PILLAR_ORDER.map((key) => (
          <Pillar key={key} pillarKey={key} score={report.pillars[key].score} grade={report.pillars[key].grade} />
        ))}
      </div>

      {PILLAR_ORDER.map((key) => {
        const pillar = report.pillars[key];
        const passCount = pillar.signals.filter((s) => s.status === "pass").length;
        return (
          <section key={key} className="space-y-1">
            <div className="flex items-baseline gap-3 border-b border-white/[0.06] pb-2">
              <h2 className="text-lg font-semibold uppercase tracking-wider" style={{ fontFamily: "Manrope, sans-serif" }}>{PILLAR_LABELS[key]}</h2>
              <span className="text-sm text-[#8b90a0]">{pillar.score}/100</span>
              <span className="text-xs text-[#8b90a0]">{passCount}/{pillar.signals.length} signals passing</span>
            </div>
            <p className="pb-1 text-xs text-[#8b90a0]">{PILLAR_DESCRIPTIONS[key]}</p>
            <div>{pillar.signals.map((signal) => <SignalRow key={signal.name} signal={signal} />)}</div>
          </section>
        );
      })}

      {report.recommendations.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-b border-white/[0.06] pb-2 text-lg font-semibold uppercase tracking-wider" style={{ fontFamily: "Manrope, sans-serif" }}>Recommendations</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#201f1f] p-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDots[rec.priority]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{rec.text}</p>
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

      <footer className="border-t border-white/[0.06] pt-6 text-center text-xs text-[#8b90a0]">
        <p>
          AX framework by <Link href="https://biilmann.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Matt Biilmann</Link>.
          Built with <Link href="https://durante.tech" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">DOS</Link>.
        </p>
      </footer>
    </div>
  );
}
