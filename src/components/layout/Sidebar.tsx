import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { NAV_ITEMS } from "../../data/mockData";
import { cn } from "../../lib/cn";

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 232 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel-solid relative z-20 flex h-full shrink-0 flex-col border-r border-line py-4"
    >
      <div className={cn("flex items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-glow/20 to-cyan-dim/10 ring-1 ring-cyan-glow/30">
          <Icon name="Radiation" size={18} className="text-cyan-glow animate-pulse-slow" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-sm font-bold leading-none tracking-wide text-ink-100">
              SENTINEL<span className="text-cyan-glow">-BD</span>
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-500">
              Command Console
            </p>
          </div>
        )}
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto px-2.5">
        {NAV_ITEMS.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              type="button"
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                active ? "bg-cyan-glow/10 text-cyan-glow" : "text-ink-300 hover:bg-white/5 hover:text-ink-100",
                collapsed && "justify-center",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-cyan-glow shadow-[0_0_8px_theme(colors.cyan-glow)]"
                />
              )}
              <Icon name={item.icon} size={17} strokeWidth={2} className="shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate text-[12.5px] font-medium">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="rounded-full bg-crimson/15 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-crimson">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={cn("mt-3 space-y-2 px-2.5", collapsed && "px-2")}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-line px-2.5 py-2 text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-100"
        >
          <Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} size={15} />
          {!collapsed && <span className="text-[11px] font-medium">Collapse</span>}
        </button>

        {!collapsed && (
          <div className="rounded-lg border border-line bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-glow">
              <span className="h-1.5 w-1.5 animate-pulse-slow rounded-full bg-emerald-glow" />
              Systems Nominal
            </div>
            <p className="mt-1 font-mono text-[9px] text-ink-500">Uptime 118d 06h 42m</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
