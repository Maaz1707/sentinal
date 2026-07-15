import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "../../lib/cn";

export type Accent = "cyan" | "amber" | "crimson" | "emerald" | "violet" | "ink";

const ACCENT_TEXT: Record<Accent, string> = {
  cyan: "text-cyan-glow",
  amber: "text-amber-glow",
  crimson: "text-crimson",
  emerald: "text-emerald-glow",
  violet: "text-violet-glow",
  ink: "text-ink-300",
};

const ACCENT_BG: Record<Accent, string> = {
  cyan: "bg-cyan-glow",
  amber: "bg-amber-glow",
  crimson: "bg-crimson",
  emerald: "bg-emerald-glow",
  violet: "bg-violet-glow",
  ink: "bg-ink-500",
};

const ACCENT_RING: Record<Accent, string> = {
  cyan: "shadow-[0_0_18px_-2px_theme(colors.cyan-glow)]",
  amber: "shadow-[0_0_18px_-2px_theme(colors.amber-glow)]",
  crimson: "shadow-[0_0_18px_-2px_theme(colors.crimson)]",
  emerald: "shadow-[0_0_18px_-2px_theme(colors.emerald-glow)]",
  violet: "shadow-[0_0_18px_-2px_theme(colors.violet-glow)]",
  ink: "",
};

interface GlassPanelProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  accent?: Accent;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  live?: boolean;
  noPadding?: boolean;
  corners?: boolean;
  delay?: number;
}

export function GlassPanel({
  title,
  subtitle,
  icon,
  accent = "cyan",
  actions,
  className,
  bodyClassName,
  children,
  live,
  noPadding,
  corners = true,
  delay = 0,
}: GlassPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-panel relative flex flex-col overflow-hidden rounded-xl",
        className,
      )}
    >
      {corners && (
        <>
          <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-line-strong" />
          <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-line-strong" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-line-strong" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-line-strong" />
        </>
      )}

      {title && (
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && (
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5",
                  ACCENT_TEXT[accent],
                )}
              >
                <Icon name={icon} size={15} strokeWidth={2.25} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-[13px] font-semibold uppercase tracking-wider text-ink-100">
                {title}
              </h2>
              {subtitle && (
                <p className="truncate font-mono text-[10.5px] text-ink-500">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {live && (
              <span className="flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-ink-300">
                <span className={cn("relative flex h-1.5 w-1.5 rounded-full", ACCENT_BG[accent])}>
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                      ACCENT_BG[accent],
                    )}
                  />
                </span>
                Live
              </span>
            )}
            {actions}
          </div>
        </header>
      )}

      <div className={cn("relative min-h-0 flex-1", !noPadding && "p-4", bodyClassName)}>{children}</div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px opacity-60",
          ACCENT_RING[accent],
        )}
      />
    </motion.section>
  );
}
