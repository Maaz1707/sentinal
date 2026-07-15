import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface RadialGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  label?: string;
  sublabel?: string;
}

export function RadialGauge({
  value,
  max = 100,
  size = 128,
  strokeWidth = 9,
  colorClass = "text-cyan-glow",
  label,
  sublabel,
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const arcFraction = 0.75;
  const dashArray = circumference * arcFraction;
  const offset = dashArray * (1 - pct);
  const rotate = 135;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashArray} ${circumference}`}
          strokeLinecap="round"
          className="text-white/[0.07]"
          transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          initial={{ strokeDashoffset: dashArray }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className={colorClass}
          transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-2xl font-bold tabular-nums", colorClass)}>
          {value}
          <span className="text-xs text-ink-500">%</span>
        </span>
        {label && <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-300">{label}</span>}
        {sublabel && <span className="font-mono text-[9px] text-ink-500">{sublabel}</span>}
      </div>
    </div>
  );
}
