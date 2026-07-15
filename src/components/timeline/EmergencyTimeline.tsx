import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { SEVERITY } from "../../data/severity";
import { TIMELINE_EVENTS } from "../../data/mockData";
import { cn } from "../../lib/cn";
import type { TimelineEvent } from "../../types";

interface EmergencyTimelineProps {
  events?: TimelineEvent[];
}

export function EmergencyTimeline({ events = TIMELINE_EVENTS }: EmergencyTimelineProps) {
  return (
    <GlassPanel
      title="Emergency Timeline"
      subtitle="Incident T+0 · Chronological Event Log"
      icon="History"
      accent="cyan"
      className="h-full"
      bodyClassName="overflow-y-auto"
    >
      <div className="relative pl-5">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-cyan-glow/60 via-line-strong to-transparent" />

        <div className="space-y-5">
          {events.map((event, i) => {
            const meta = SEVERITY[event.severity];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="relative"
              >
                <span
                  className={cn(
                    "absolute -left-5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-void",
                    meta.border,
                    meta.color,
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold tracking-wide text-ink-100">{event.time}</span>
                  <span className={cn("rounded-full border px-1.5 py-0.5 font-mono text-[8.5px] uppercase", meta.color, meta.border, meta.bg)}>
                    {meta.label}
                  </span>
                </div>

                <div className="mt-1 flex items-start gap-2">
                  <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/5", meta.color)}>
                    <Icon name={event.icon} size={11} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium leading-snug text-ink-100">{event.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">{event.description}</p>
                    <p className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-700">{event.actor}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
