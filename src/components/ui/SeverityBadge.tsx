import type { Severity } from "../../types";
import { SEVERITY } from "../../data/severity";
import { cn } from "../../lib/cn";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  pulse?: boolean;
}

export function SeverityBadge({ severity, className, pulse }: SeverityBadgeProps) {
  const meta = SEVERITY[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-wider",
        meta.color,
        meta.bg,
        meta.border,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", pulse && "animate-pulse-slow")} />
      {meta.label}
    </span>
  );
}
