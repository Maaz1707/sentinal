import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-glow text-void border border-cyan-glow shadow-[0_0_20px_-6px_theme(colors.cyan-glow)] hover:bg-cyan-glow/90 hover:shadow-[0_0_26px_-4px_theme(colors.cyan-glow)]",
  secondary:
    "glass-panel-solid text-ink-100 border border-line-strong hover:border-cyan-glow/40 hover:text-cyan-glow",
  ghost: "border border-transparent text-ink-300 hover:bg-white/5 hover:text-ink-100",
  outline: "border border-line-strong text-ink-100 hover:bg-white/5",
  danger:
    "bg-crimson/15 text-crimson border border-crimson/40 hover:bg-crimson/25 hover:shadow-[0_0_20px_-6px_theme(colors.crimson)]",
  success:
    "bg-emerald-glow/15 text-emerald-glow border border-emerald-glow/40 hover:bg-emerald-glow/25 hover:shadow-[0_0_20px_-6px_theme(colors.emerald-glow)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 rounded-md px-2.5 text-[11px]",
  md: "h-9 gap-2 rounded-lg px-3.5 text-[12.5px]",
  lg: "h-11 gap-2.5 rounded-lg px-5 text-[13.5px]",
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 17 };

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "focus-ring interactive-surface inline-flex shrink-0 items-center justify-center font-medium uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={ICON_SIZE[size]} />
      ) : (
        icon && <Icon name={icon} size={ICON_SIZE[size]} strokeWidth={2.25} />
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <Icon name={iconRight} size={ICON_SIZE[size]} strokeWidth={2.25} />}
    </motion.button>
  );
}
