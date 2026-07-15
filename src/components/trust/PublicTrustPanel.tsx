import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { RadialGauge } from "../ui/RadialGauge";
import { ProgressBar } from "../ui/ProgressBar";
import { TRUST_REGIONS } from "../../data/mockData";
import { cn } from "../../lib/cn";
import type { TrustState } from "../../sim/types";

const SENTIMENT_META = {
  positive: { icon: "ThumbsUp", color: "text-emerald-glow" },
  neutral: { icon: "MessageCircle", color: "text-ink-300" },
  negative: { icon: "ThumbsDown", color: "text-crimson" },
} as const;

interface PublicTrustPanelProps {
  trust?: TrustState;
}

export function PublicTrustPanel({ trust }: PublicTrustPanelProps) {
  const regions = trust?.regions ?? TRUST_REGIONS;
  const avgTrust = Math.round(
    regions.reduce((sum, r) => sum + r.trust, 0) / regions.length,
  );
  const counts = regions.reduce(
    (acc, r) => {
      acc[r.sentiment] += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 } as Record<string, number>,
  );
  const total = regions.length;

  return (
    <GlassPanel
      title="Public Trust Panel"
      subtitle="National Sentiment Aggregate · Social Listening"
      icon="Users"
      accent="emerald"
      live
      className="h-full"
      bodyClassName="flex flex-col gap-4"
    >
      <div className="flex items-center gap-4 rounded-lg border border-line bg-white/[0.02] p-3">
        <RadialGauge value={avgTrust} colorClass="text-emerald-glow" size={92} strokeWidth={7} label="Trust" />
        <div className="flex-1 space-y-2">
          {(["positive", "neutral", "negative"] as const).map((key) => {
            const meta = SENTIMENT_META[key];
            const pct = Math.round((counts[key] / total) * 100);
            return (
              <div key={key} className="flex items-center gap-2">
                <Icon name={meta.icon} size={12} className={meta.color} />
                <span className="w-14 shrink-0 font-mono text-[9.5px] capitalize text-ink-500">{key}</span>
                <ProgressBar
                  value={pct}
                  colorClass={meta.color.replace("text-", "bg-")}
                  height={4}
                />
                <span className="w-8 shrink-0 text-right font-mono text-[9.5px] text-ink-300">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-amber-glow/30 bg-amber-glow/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon name="AlertOctagon" size={14} className="text-amber-glow" />
          <span className="text-[11.5px] font-medium text-ink-200">Misinformation clusters flagged</span>
        </div>
        <span className="font-mono text-sm font-bold text-amber-glow">{trust?.misinformationClusters ?? 3}</span>
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Regional Breakdown</p>
        <div className="space-y-1.5">
          {regions.map((r, i) => {
            const meta = SENTIMENT_META[r.sentiment];
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5"
              >
                <span className="w-20 shrink-0 truncate text-[11px] text-ink-300">{r.name}</span>
                <ProgressBar value={r.trust} colorClass="bg-emerald-glow" height={4} />
                <span className="w-8 shrink-0 text-right font-mono text-[10px] text-ink-100">{r.trust}</span>
                <Icon name={meta.icon} size={11} className={cn("shrink-0", meta.color)} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
