import type { Signal, SignalStatus, SignalWeight } from "@/features/report/types";

export function makeSignal(
  name: string,
  status: SignalStatus,
  score: 0 | 1 | 2,
  weight: SignalWeight,
  detail: string
): Signal {
  return { name, status, score, weight, detail };
}
