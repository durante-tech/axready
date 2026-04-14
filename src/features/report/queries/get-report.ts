import axscoreData from "../data/axscore.json";
import netlifyData from "../data/netlify.json";
import type { Report } from "../types";

const reports: Record<string, Report> = {
  netlify: netlifyData as Report,
  axscore: axscoreData as Report,
};

export function getReport(slug: string): Report | null {
  return reports[slug] ?? null;
}

export function getAllReports(): Report[] {
  return Object.values(reports);
}
