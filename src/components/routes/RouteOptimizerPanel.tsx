import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { ProgressBar } from "../ui/ProgressBar";
import { ROUTES } from "../../data/mockData";
import { cn } from "../../lib/cn";
import type { RouteDatum } from "../../types";

const STATUS_META: Record<RouteDatum["status"], { label: string; color: string; icon: string }> = {
  optimal: { label: "Optimal", color: "text-emerald-glow", icon: "CheckCircle2" },
  congested: { label: "Congested", color: "text-amber-glow", icon: "AlertTriangle" },
  blocked: { label: "Blocked", color: "text-crimson", icon: "XCircle" },
  rerouted: { label: "Rerouted", color: "text-cyan-glow", icon: "RefreshCcw" },
};

interface RouteOptimizerPanelProps {
  routes?: RouteDatum[];
}

export function RouteOptimizerPanel({ routes = ROUTES }: RouteOptimizerPanelProps) {
  return (
    <GlassPanel
      title="Route Optimizer"
      subtitle="Evacuation Corridor Simulation · 5 Active Routes"
      icon="Route"
      accent="cyan"
      live
      className="h-full"
      bodyClassName="flex flex-col gap-3 overflow-y-auto"
    >
      {routes.map((route, i) => {
        const meta = STATUS_META[route.status];
        return (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg border border-line bg-white/2 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Car" size={13} className="text-ink-300" />
                <span className="text-[12px] font-semibold text-ink-100">{route.name}</span>
              </div>
              <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase", meta.color, "bg-white/5")}>
                <Icon name={meta.icon} size={10} />
                {meta.label}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-ink-500">
              <span>{route.from}</span>
              <Icon name="ArrowRight" size={10} />
              <span>{route.to}</span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-500">ETA</p>
                <p className="mt-0.5 font-semibold text-ink-100">
                  {route.status === "blocked" ? "—" : `${route.etaMinutes}m`}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-500">Vehicles</p>
                <p className="mt-0.5 font-semibold text-ink-100">{route.vehicles}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-ink-500">Distance</p>
                <p className="mt-0.5 font-semibold text-ink-100">{route.distanceKm} km</p>
              </div>
            </div>

            <div className="mt-2.5">
              <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-ink-500">
                <span>Capacity Load</span>
                <span>{route.capacityUsed}%</span>
              </div>
              <ProgressBar
                value={route.capacityUsed}
                colorClass={
                  route.capacityUsed > 85 ? "bg-crimson" : route.capacityUsed > 65 ? "bg-amber-glow" : "bg-emerald-glow"
                }
                height={4}
              />
            </div>
          </motion.div>
        );
      })}
    </GlassPanel>
  );
}
