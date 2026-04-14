import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Grade, PillarKey } from "../types";
import { PILLAR_DESCRIPTIONS,PILLAR_LABELS } from "../types";

const gradeBarColors: Record<Grade, string> = {
  A: "bg-emerald-500",
  B: "bg-blue-500",
  C: "bg-amber-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

const gradeTextColors: Record<Grade, string> = {
  A: "text-emerald-500",
  B: "text-blue-500",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-500",
};

export function PillarCard({
  pillarKey,
  score,
  grade,
}: {
  pillarKey: PillarKey;
  score: number;
  grade: Grade;
}) {
  return (
    <Card className="flex-1 min-w-[140px]">
      <CardHeader className="pb-2 pt-4 px-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {PILLAR_LABELS[pillarKey]}
        </p>
        <CardTitle className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold tabular-nums", gradeTextColors[grade])}>
            {score}
          </span>
          <span className={cn("text-sm font-semibold", gradeTextColors[grade])}>
            / {grade}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", gradeBarColors[grade])}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {PILLAR_DESCRIPTIONS[pillarKey]}
        </p>
      </CardContent>
    </Card>
  );
}

export function PillarMiniBar({
  score,
  grade,
  label,
}: {
  score: number;
  grade: Grade;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", gradeBarColors[grade])}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn("w-6 text-right tabular-nums font-medium", gradeTextColors[grade])}>
        {score}
      </span>
    </div>
  );
}
