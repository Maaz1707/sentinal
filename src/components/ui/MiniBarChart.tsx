import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface MiniBarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  colorClass?: string;
  barClassName?: string;
}

/** Compact bar chart for discrete comparisons (per-zone load, per-hour counts). */
export function MiniBarChart({
  data,
  labels,
  height = 64,
  colorClass = "text-cyan-glow",
  barClassName,
}: MiniBarChartProps) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-stretch gap-1.5" style={{ height }}>
      {data.map((value, i) => {
        const pct = Math.max(4, (value / max) * 100);
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={cn("w-full rounded-t-sm bg-current opacity-80", colorClass, barClassName)}
              style={{ minHeight: 3 }}
            />
            {labels?.[i] && (
              <span className="font-mono text-[8.5px] uppercase tracking-wider text-ink-500">
                {labels[i]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
