import { cn } from "@/lib/utils";
import type { Recommendation } from "../types";
import { PILLAR_LABELS } from "../types";

const priorityConfig: Record<string, { dot: string; label: string }> = {
  high: { dot: "bg-red-500", label: "High" },
  medium: { dot: "bg-amber-500", label: "Medium" },
  low: { dot: "bg-blue-400", label: "Low" },
};

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const priority = priorityConfig[recommendation.priority];

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <span
        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", priority.dot)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{recommendation.text}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{PILLAR_LABELS[recommendation.pillar]}</span>
          <span className="text-border">|</span>
          <span>{priority.label} priority</span>
        </div>
      </div>
    </div>
  );
}
