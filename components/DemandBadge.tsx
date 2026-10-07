import type { DemandLevel } from "@/lib/types";

const styles: Record<DemandLevel, string> = {
  LOW: "bg-emerald-400/15 text-emerald-300",
  MEDIUM: "bg-amber-400/15 text-amber-300",
  HIGH: "bg-orange-400/20 text-orange-300",
  "OVER CAPACITY": "bg-rose-400/20 text-rose-300",
};

export function DemandBadge({ level }: { level: DemandLevel }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[level]}`}>
      {level}
    </span>
  );
}
