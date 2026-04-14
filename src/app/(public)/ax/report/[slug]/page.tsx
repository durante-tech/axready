import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PillarCard } from "@/features/report/components/pillar-card";
import { RecommendationCard } from "@/features/report/components/recommendation-card";
import { ScoreGauge } from "@/features/report/components/score-gauge";
import { SignalRow } from "@/features/report/components/signal-row";
import { getAllReports,getReport } from "@/features/report/queries/get-report";
import { PILLAR_DESCRIPTIONS,PILLAR_LABELS, PILLAR_ORDER } from "@/features/report/types";

export async function generateStaticParams() {
  const reports = getAllReports();
  return reports.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report) return { title: "Report Not Found" };
  return {
    title: `${report.name} — ${report.overallScore}/${report.grade}`,
    description: `AX Score report for ${report.name}: ${report.overallScore}/100 (${report.grade})`,
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report) notFound();

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
