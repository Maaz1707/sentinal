import { Icon } from "../ui/Icon";

const TICKER_ITEMS = [
  "REACTOR CORE · STABLE MONITORING",
  "EVACUATION ZONE A–C · 62.8% COMPLETE",
  "SHELTER NETWORK · 47/52 OPERATIONAL",
  "COMMS UPTIME · 99.2%",
  "AIR QUALITY INDEX · MODERATE",
  "IAEA ADVISORY · TRANSMITTED 03:02:19",
];

export function Footer() {
  return (
    <footer className="glass-panel-solid relative z-10 flex shrink-0 items-center justify-between gap-4 border-t border-line px-4 py-2 text-ink-500">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <Icon name="Activity" size={12} className="shrink-0 text-cyan-glow" />
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee font-mono text-[10px] uppercase tracking-wider">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="mx-6">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-4 border-l border-line pl-4 font-mono text-[9.5px] uppercase tracking-wider md:flex">
        <span className="flex items-center gap-1.5">
          <Icon name="Lock" size={11} />
          Classification: Restricted
        </span>
        <span>SENTINEL-BD v2.4.0</span>
        <span className="flex items-center gap-1.5 text-emerald-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-glow" />
          All Systems Nominal
        </span>
      </div>
    </footer>
  );
}
