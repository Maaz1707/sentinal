import { cn } from "../../lib/cn";

interface SkeletonProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  rounded?: string;
}

/** Shimmering placeholder block for content that is still loading. */
export function Skeleton({ className, height = 14, width = "100%", rounded = "rounded-md" }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer", rounded, className)}
      style={{ height, width }}
    />
  );
}

/** Preset skeleton matching the StatCard layout, for dashboard-grid loading states. */
export function SkeletonCard() {
  return (
    <div className="glass-panel flex flex-col gap-3 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <Skeleton height={32} width={32} rounded="rounded-lg" />
        <Skeleton height={18} width={44} rounded="rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton height={9} width="60%" />
        <Skeleton height={22} width="45%" />
      </div>
      <div className="flex items-end justify-between gap-2">
        <Skeleton height={9} width="50%" />
        <Skeleton height={24} width={72} rounded="rounded-md" />
      </div>
    </div>
  );
}
