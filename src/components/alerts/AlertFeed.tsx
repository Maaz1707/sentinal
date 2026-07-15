import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { SeverityBadge } from "../ui/SeverityBadge";
import { ALERTS } from "../../data/mockData";
import { cn } from "../../lib/cn";
import type { Severity } from "../../types";
import type { AlertItem } from "../../types";
const FILTERS: { id: "all" | Severity; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "moderate", label: "Moderate" },
];

interface AlertFeedProps {
  alerts?: AlertItem[];
}

export function AlertFeed({ alerts = ALERTS }: AlertFeedProps) {
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [acked, setAcked] = useState<Record<string, boolean>>({});

  const items = alerts.filter((a) => filter === "all" || a.severity === filter);

  return (
    <GlassPanel
      title="Alert Feed"
      subtitle="Emergency Alert System · Live Dispatch Log"
      icon="Siren"
      accent="crimson"
      live
      className="h-full"
      bodyClassName="flex flex-col gap-3"
      actions={
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              type="button"
              aria-pressed={filter === f.id}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-[9.5px] uppercase tracking-wide transition-colors",
                filter === f.id ? "bg-crimson/15 text-crimson" : "text-ink-500 hover:text-ink-200",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {items.map((alert, i) => {
            const isAcked = acked[alert.id] ?? alert.acknowledged;
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  isAcked ? "border-line bg-white/1.5" : "border-crimson/30 bg-crimson/5",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} pulse={!isAcked} />
                    <span className="font-mono text-[9.5px] text-ink-500">{alert.time}</span>
                  </div>
                  {!isAcked && (
                    <button
                      onClick={() => setAcked((s) => ({ ...s, [alert.id]: true }))}
                      className="shrink-0 rounded-md border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-300 transition-colors hover:bg-white/5"
                    >
                      ACK
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] font-semibold leading-snug text-ink-100">{alert.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-500">{alert.message}</p>
                <div className="mt-2 flex items-center gap-3 font-mono text-[9.5px] text-ink-500">
                  <span className="flex items-center gap-1">
                    <Icon name="RadioTower" size={10} />
                    {alert.channel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={10} />
                    {alert.region}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
