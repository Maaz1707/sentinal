import { cn } from "../../lib/cn";

interface SpinnerProps {
  size?: number;
  className?: string;
  thickness?: number;
}

/** Ring spinner for buttons, inline loading states, and async panel headers. */
export function Spinner({ size = 16, className, thickness = 2 }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin-slow text-current", className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.18" strokeWidth={thickness} />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface RadarSpinnerProps {
  size?: number;
  colorClass?: string;
  label?: string;
}

/** Radar-sweep loading indicator for full-panel / full-page async states (map, satellite feeds). */
export function RadarSpinner({ size = 64, colorClass = "text-cyan-glow", label }: RadarSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn("relative rounded-full border border-line-strong", colorClass)}
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,currentColor_0%,transparent_70%)] opacity-10" />
        <div className="absolute inset-0 animate-radar overflow-hidden rounded-full">
          <div
            className="h-1/2 w-full origin-bottom bg-gradient-to-t from-current to-transparent opacity-40"
            style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
          />
        </div>
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </div>
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      )}
    </div>
  );
}
