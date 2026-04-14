import type { Metadata } from "next";
import Link from "next/link";
import { getAllReports } from "@/features/report/queries/get-report";
import type { Grade } from "@/features/report/types";
import { PILLAR_LABELS, PILLAR_ORDER } from "@/features/report/types";
import { axReportPath } from "@/paths";

const gradeColors: Record<Grade, string> = {
  A: "text-emerald-400", B: "text-blue-400", C: "text-amber-400", D: "text-orange-400", F: "text-red-400",
};
const gradeBars: Record<Grade, string> = {
  A: "bg-emerald-400", B: "bg-blue-400", C: "bg-amber-400", D: "bg-orange-400", F: "bg-red-400",
};
const gradeRings: Record<Grade, string> = {
  A: "#34d399", B: "#60a5fa", C: "#fbbf24", D: "#fb923c", F: "#f87171",
};

export const metadata: Metadata = {
  title: "Reports",
  description: "AX Score reports for websites and repositories.",
};

export default function ReportsPage() {
  const reports = getAllReports();

  return (
    <div className="mx-auto max-w-7xl space-y-8 bg-[#131313] px-8 py-12 text-[#e5e2e1]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Reports</h1>
        <p className="mt-1 text-[#c1c6d7]">Agent Experience readiness assessments across websites and repositories.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => {
          const r = 50, circ = 2 * Math.PI * r, off = circ * (1 - report.overallScore / 100);
          return (
            <Link key={report.slug} href={axReportPath(report.slug)}>
              <div className="rounded-xl border border-white/[0.06] bg-[#201f1f] p-6 transition-colors hover:border-white/[0.12]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{report.name}</h2>
                    <p className="text-xs text-[#8b90a0]">{report.url}</p>
                  </div>
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg width={80} height={80} viewBox="0 0 120 120" className="-rotate-90">
                      <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
                      <circle cx={60} cy={60} r={r} fill="none" stroke={gradeRings[report.grade]} strokeWidth={6} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-lg font-extrabold tabular-nums ${gradeColors[report.grade]}`} style={{ fontFamily: "Manrope, sans-serif" }}>{report.overallScore}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {PILLAR_ORDER.map((key) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-[#8b90a0]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{PILLAR_LABELS[key].slice(0, 4).toUpperCase()}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={`h-full rounded-full ${gradeBars[report.pillars[key].grade]}`} style={{ width: `${report.pillars[key].score}%` }} />
                      </div>
                      <span className={`w-6 text-right tabular-nums font-medium ${gradeColors[report.pillars[key].grade]}`}>{report.pillars[key].score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
