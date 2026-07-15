export type Status = "success" | "warning" | "critical" | "radiation" | "info" | "neutral";

export type StatusMeta = {
  label: string;
  color: string;
  glow: string;
  bg: string;
  border: string;
  dot: string;
};

/**
 * Emergency / status color language shared by Badge, Button, Card accents and charts.
 * Distinct from `SEVERITY` (data/severity.ts), which grades incident severity rather
 * than describing a system/operational state.
 */
export const STATUS: Record<Status, StatusMeta> = {
  success: {
    label: "Success",
    color: "text-emerald-glow",
    glow: "text-glow-emerald",
    bg: "bg-emerald-glow/10",
    border: "border-emerald-glow/40",
    dot: "bg-emerald-glow",
  },
  warning: {
    label: "Warning",
    color: "text-amber-glow",
    glow: "text-glow-amber",
    bg: "bg-amber-glow/10",
    border: "border-amber-glow/40",
    dot: "bg-amber-glow",
  },
  critical: {
    label: "Critical",
    color: "text-crimson",
    glow: "text-glow-crimson",
    bg: "bg-crimson/10",
    border: "border-crimson/40",
    dot: "bg-crimson",
  },
  radiation: {
    label: "Radiation",
    color: "text-radiation-glow",
    glow: "text-glow-radiation",
    bg: "bg-radiation-glow/10",
    border: "border-radiation-glow/40",
    dot: "bg-radiation-glow",
  },
  info: {
    label: "Info",
    color: "text-cyan-glow",
    glow: "text-glow-cyan",
    bg: "bg-cyan-glow/10",
    border: "border-cyan-glow/40",
    dot: "bg-cyan-glow",
  },
  neutral: {
    label: "Neutral",
    color: "text-ink-300",
    glow: "",
    bg: "bg-white/5",
    border: "border-line-strong",
    dot: "bg-ink-500",
  },
};
