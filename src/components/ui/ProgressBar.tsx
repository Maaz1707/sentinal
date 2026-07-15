import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface ProgressBarProps {
  value: number;
  colorClass?: string;
  trackClassName?: string;
  height?: number;
  delay?: number;
  striped?: boolean;
}

export function ProgressBar({
  value,
  colorClass = "bg-cyan-glow",
  trackClassName,
  height = 6,
  delay = 0,
  striped = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-full bg-white/[0.06]", trackClassName)}
      style={{ height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className={cn("relative h-full rounded-full", colorClass)}
      >
        {striped && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0, rgba(255,255,255,0.4) 4px, transparent 4px, transparent 8px)",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
