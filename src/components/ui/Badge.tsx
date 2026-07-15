import type { ReactNode } from "react";
import type { Status } from "../../data/status";
import { STATUS } from "../../data/status";
import { Icon } from "./Icon";
import { cn } from "../../lib/cn";

interface BadgeProps {
  status?: Status;
  children: ReactNode;
  icon?: string;
  pulse?: boolean;
  dot?: boolean;
  className?: string;
}

/**
 * Generic status pill for anything that isn't graded incident severity
 * (system state, connection state, feature flags). For incident severity,
 * use SeverityBadge, which reads from the Severity enum instead of Status.
 */
export function Badge({ status = "neutral", children, icon, pulse, dot = true, className }: BadgeProps) {
  const meta = STATUS[status];
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
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full bg-current", pulse && "animate-pulse-slow")} />}
      {icon && <Icon name={icon} size={11} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
