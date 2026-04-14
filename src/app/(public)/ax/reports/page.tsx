import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PillarMiniBar } from "@/features/report/components/pillar-card";
import { ScoreGauge } from "@/features/report/components/score-gauge";
import { getAllReports } from "@/features/report/queries/get-report";
import { PILLAR_LABELS, PILLAR_ORDER } from "@/features/report/types";
import { axReportPath } from "@/paths";

export const metadata: Metadata = {
  title: "Reports",
  description: "AX Score reports for websites and repositories.",
};

export default function ReportsPage() {
  const reports = getAllReports();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-muted-foreground">
          Agent Experience readiness assessments across websites and
          repositories.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Link key={report.slug} href={axReportPath(report.slug)}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{report.url}</p>
                </div>
                <ScoreGauge
                  score={report.overallScore}
                  grade={report.grade}
                  size="sm"
                />
              </CardHeader>
              <CardContent className="space-y-1.5">
                {PILLAR_ORDER.map((key) => (
                  <PillarMiniBar
                    key={key}
                    score={report.pillars[key].score}
                    grade={report.pillars[key].grade}
                    label={PILLAR_LABELS[key].slice(0, 4).toUpperCase()}
                  />
                ))}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
