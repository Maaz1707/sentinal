import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { Sparkline } from "../ui/Sparkline";
import { SEVERITY } from "../../data/severity";
import type { StatCardDatum } from "../../types";
import { cn } from "../../lib/cn";

export function StatCard({ data, delay = 0 }: { data: StatCardDatum; delay?: number }) {
  const meta = SEVERITY[data.severity];
  const positive = data.delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="glass-panel group relative flex flex-col gap-3 overflow-hidden rounded-xl p-4"
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70",
          meta.color.replace("text-", "bg-"),
        )}
      />

      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg bg-white/5",
            meta.color,
          )}
        >
          <Icon name={data.icon} size={16} strokeWidth={2.25} />
        </div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
            positive ? "text-emerald-glow bg-emerald-glow/10" : "text-crimson bg-crimson/10",
          )}
        >
          <Icon name={positive ? "TrendingUp" : "TrendingDown"} size={11} />
          {Math.abs(data.delta)}%
        </span>
      </div>

      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-500">{data.label}</p>
        <p className="mt-1 flex items-baseline gap-1 font-display text-2xl font-bold tabular-nums text-ink-100">
          {data.value}
          {data.unit && <span className="text-xs font-medium text-ink-500">{data.unit}</span>}
        </p>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="font-mono text-[9.5px] leading-snug text-ink-500">{data.footnote}</p>
        <Sparkline data={data.trend} colorClass={meta.color} width={72} height={24} />
      </div>
    </motion.div>
  );
}
