import { cn } from "@/lib/utils";
import type { Grade } from "../types";

const gradeColors: Record<Grade, string> = {
  A: "text-emerald-500",
  B: "text-blue-500",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-500",
};

const gradeRingColors: Record<Grade, string> = {
  A: "stroke-emerald-500",
  B: "stroke-blue-500",
  C: "stroke-amber-500",
  D: "stroke-orange-500",
  F: "stroke-red-500",
};

const dimensions = {
  sm: { width: 80, stroke: 6, fontSize: "text-lg", gradeSize: "text-xs" },
  md: { width: 120, stroke: 8, fontSize: "text-3xl", gradeSize: "text-sm" },
  lg: { width: 160, stroke: 10, fontSize: "text-5xl", gradeSize: "text-lg" },
} as const;

export function ScoreGauge({
  score,
  grade,
  size = "lg",
}: {
  score: number;
  grade: Grade;
  size?: "sm" | "md" | "lg";
}) {
  const d = dimensions[size];
  const radius = (d.width - d.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={d.width}
        height={d.width}
        viewBox={`0 0 ${d.width} ${d.width}`}
        className="-rotate-90"
      >
        <circle
          cx={d.width / 2}
          cy={d.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={d.stroke}
          className="text-muted/40"
        />
        <circle
          cx={d.width / 2}
          cy={d.width / 2}
          r={radius}
          fill="none"
          strokeWidth={d.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={cn(gradeRingColors[grade], "transition-all duration-700")}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-bold tabular-nums", d.fontSize, gradeColors[grade])}>
          {score}
        </span>
        <span className={cn("font-medium text-muted-foreground", d.gradeSize)}>
          {grade}
        </span>
      </div>
    </div>
  );
}
