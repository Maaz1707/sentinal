import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Status } from "../../data/status";
import { STATUS } from "../../data/status";
import { cn } from "../../lib/cn";

interface CardProps {
  children: ReactNode;
  status?: Status;
  interactive?: boolean;
  solid?: boolean;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

/**
 * Lightweight surface for arbitrary content blocks (list rows, tiles, menu items).
 * For a titled section with header/live-indicator, use GlassPanel instead.
 */
export function Card({
  children,
  status,
  interactive,
  solid,
  className,
  onClick,
  delay = 0,
}: CardProps) {
  const meta = status ? STATUS[status] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cn(
        "interactive-surface relative w-full overflow-hidden rounded-xl border p-4 text-left",
        solid ? "glass-panel-solid" : "glass-panel",
        meta ? meta.border : "border-line",
        (interactive || onClick) && "hover-lift cursor-pointer",
        onClick && "focus-ring",
        className,
      )}
    >
      {meta && <span className={cn("pointer-events-none absolute inset-x-0 top-0 h-0.5", meta.dot)} />}
      {children}
    </motion.div>
  );
}
