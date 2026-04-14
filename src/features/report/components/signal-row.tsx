import { cn } from "@/lib/utils";
import type { Signal } from "../types";

const statusIcons: Record<string, { icon: string; color: string }> = {
  pass: { icon: "\u2713", color: "text-emerald-500 bg-emerald-500/10" },
  partial: { icon: "\u26A0", color: "text-amber-500 bg-amber-500/10" },
  fail: { icon: "\u2717", color: "text-red-500 bg-red-500/10" },
};

const weightBadgeColors: Record<string, string> = {
  high: "bg-foreground/10 text-foreground",
  medium: "bg-muted text-muted-foreground",
  low: "bg-muted/50 text-muted-foreground/70",
};

export function SignalRow({ signal }: { signal: Signal }) {
  const status = statusIcons[signal.status];

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold",
          status.color
        )}
      >
        {status.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{signal.name}</span>
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
              weightBadgeColors[signal.weight]
            )}
          >
            {signal.weight}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{signal.detail}</p>
      </div>
    </div>
  );
}
