export type SignalStatus = "pass" | "partial" | "fail";
export type SignalWeight = "high" | "medium" | "low";
export type Grade = "A" | "B" | "C" | "D" | "F";
export type PillarKey = "access" | "context" | "tools" | "orchestration";

export type Signal = {
  name: string;
  status: SignalStatus;
  score: 0 | 1 | 2;
  weight: SignalWeight;
  detail: string;
};

export type Pillar = {
  score: number;
  grade: Grade;
  signals: Signal[];
};

export type Recommendation = {
  pillar: PillarKey;
  priority: "high" | "medium" | "low";
  text: string;
};

export type Report = {
  slug: string;
  name: string;
  url: string;
  repo?: string;
  scannedAt: string;
  overallScore: number;
  grade: Grade;
  pillars: Record<PillarKey, Pillar>;
  recommendations: Recommendation[];
};

export const PILLAR_WEIGHTS: Record<PillarKey, number> = {
  access: 0.25,
  context: 0.3,
  tools: 0.25,
  orchestration: 0.2,
};

export const PILLAR_LABELS: Record<PillarKey, string> = {
  access: "Access",
  context: "Context",
  tools: "Tools",
  orchestration: "Orchestration",
};

export const PILLAR_DESCRIPTIONS: Record<PillarKey, string> = {
  access: "Can agents find and reach you?",
  context: "Can agents understand you?",
  tools: "Can agents take actions?",
  orchestration: "Can agents compose workflows?",
};

export const PILLAR_ORDER: PillarKey[] = [
  "access",
  "context",
  "tools",
  "orchestration",
];

export function getGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}
