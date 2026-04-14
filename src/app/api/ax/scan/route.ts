import { NextResponse } from "next/server";
import { scanRepo } from "@/features/scan/scanners/repo-scanner";
import { scanWebsite } from "@/features/scan/scanners/website-scanner";
import { scanInputSchema } from "@/features/scan/schema/scan-schema";
import { calculateReport } from "@/features/scan/scoring/score-calculator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = scanInputSchema.parse(body);

    const repoStr = input.repo && input.repo.length > 0 ? input.repo : null;

    const [websiteSignals, repoSignals] = await Promise.all([
      scanWebsite(input.url),
      repoStr ? scanRepo(repoStr) : Promise.resolve(null),
    ]);

    const report = calculateReport({
      url: input.url,
      repo: repoStr ?? undefined,
      websiteSignals,
      repoSignals,
    });

    return NextResponse.json(report);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "issues" in error
    ) {
      return NextResponse.json(
        { error: "Invalid input", details: (error as { issues: unknown }).issues },
        { status: 400 }
      );
    }
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Scan failed" },
      { status: 500 }
    );
  }
}
