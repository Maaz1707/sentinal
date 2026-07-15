import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { LiveClock } from "../ui/LiveClock";
import { Button } from "../ui/Button";
import { OPERATOR } from "../../data/mockData";
import { cn } from "../../lib/cn";

const THREAT_LEVEL = {
  label: "SEVERE",
  index: 4,
  total: 5,
  colorClass: "bg-crimson",
  textClass: "text-crimson",
};

function ThreatLevelMeter() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-crimson/30 bg-crimson/[0.07] px-3 py-1.5">
      <Icon name="ShieldAlert" size={15} className="text-crimson" />
      <div className="flex flex-col leading-none">
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-ink-500">National Threat Level</span>
        <span className="mt-0.5 font-display text-[12.5px] font-bold tracking-wide text-crimson text-glow-crimson">
          {THREAT_LEVEL.label}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: THREAT_LEVEL.total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-4 w-1.5 rounded-sm",
              i < THREAT_LEVEL.index ? THREAT_LEVEL.colorClass : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ConnectionStatus() {
  const items = [
    { label: "SCADA Link", icon: "Signal", ok: true },
    { label: "Satellite", icon: "Satellite", ok: true },
    { label: "EAS Network", icon: "RadioTower", ok: true },
  ];
  return (
    <div className="hidden items-center gap-3 border-l border-line pl-4 lg:flex">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5" title={item.label}>
          <Icon name={item.icon} size={13} className="text-emerald-glow" />
          <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-emerald-glow" />
        </div>
      ))}
    </div>
  );
}

interface TopStatusBarProps {
  phaseLabel: string;
  simTime: string;
  running: boolean;
  paused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function TopStatusBar({ phaseLabel, simTime, running, paused, onStart, onPause, onResume, onRestart }: TopStatusBarProps) {
  return (
    <div className="relative z-10 flex shrink-0 flex-col border-b border-line">
      <div className="flex items-center justify-between overflow-hidden bg-amber-glow/10 px-4 py-1">
        <div className="flex flex-1 items-center gap-2 overflow-hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-amber-glow">
          <Icon name="AlertTriangle" size={11} className="shrink-0" />
          <motion.span
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="inline-block shrink-0"
          >
            SIMULATION / TRAINING MODE — ALL TELEMETRY SYNTHETIC — NO LIVE REACTOR DATA IS CONNECTED — FOR DEMONSTRATION PURPOSES ONLY&nbsp;&nbsp;&nbsp;&nbsp;
            SIMULATION / TRAINING MODE — ALL TELEMETRY SYNTHETIC — NO LIVE REACTOR DATA IS CONNECTED — FOR DEMONSTRATION PURPOSES ONLY&nbsp;&nbsp;&nbsp;&nbsp;
          </motion.span>
        </div>
      </div>

      <div className="glass-panel-solid flex items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <ThreatLevelMeter />
          <ConnectionStatus />
          <div className="hidden items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 lg:flex">
            <Icon name="Clock" size={13} className="text-cyan-glow" />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-500">Demo phase</p>
              <p className="font-display text-[12px] font-semibold text-ink-100">{phaseLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!running ? (
            <Button variant="primary" size="sm" icon="Play" onClick={onStart} type="button" aria-label="Start demo">
              Start Demo
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={paused ? "Play" : "PauseCircle"}
                onClick={paused ? onResume : onPause}
                type="button"
                aria-label={paused ? "Resume demo" : "Pause demo"}
              >
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button variant="outline" size="sm" icon="RefreshCcw" onClick={onRestart} type="button" aria-label="Restart demo">
                Restart
              </Button>
            </>
          )}

          <div className="h-8 w-px bg-line" />

          <div className="hidden sm:block text-right">
            <div className="font-mono text-sm font-semibold tabular-nums text-ink-100">{simTime}</div>
            <div className="font-mono text-[9.5px] uppercase tracking-wider text-ink-500">Demo clock</div>
          </div>

          <div className="h-8 w-px bg-line" />

          <LiveClock className="hidden sm:block" />

          <div className="h-8 w-px bg-line" />

          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-semibold leading-none text-ink-100">{OPERATOR.name}</p>
              <p className="mt-1 font-mono text-[9.5px] leading-none text-ink-500">{OPERATOR.role}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-cyan-glow/30 to-violet-glow/20 ring-1 ring-line-strong">
              <Icon name="Fingerprint" size={15} className="text-cyan-glow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
