import type { Severity, SeverityMeta } from "../types";

export const SEVERITY: Record<Severity, SeverityMeta> = {
  critical: {
    label: "Critical",
    color: "text-crimson",
    glow: "text-glow-crimson",
    bg: "bg-crimson/10",
    border: "border-crimson/40",
  },
  high: {
    label: "High",
    color: "text-amber-glow",
    glow: "text-glow-amber",
    bg: "bg-amber-glow/10",
    border: "border-amber-glow/40",
  },
  moderate: {
    label: "Moderate",
    color: "text-violet-glow",
    glow: "",
    bg: "bg-violet-glow/10",
    border: "border-violet-glow/40",
  },
  low: {
    label: "Low",
    color: "text-emerald-glow",
    glow: "text-glow-emerald",
    bg: "bg-emerald-glow/10",
    border: "border-emerald-glow/40",
  },
  info: {
    label: "Info",
    color: "text-cyan-glow",
    glow: "text-glow-cyan",
    bg: "bg-cyan-glow/10",
    border: "border-cyan-glow/40",
  },
};
