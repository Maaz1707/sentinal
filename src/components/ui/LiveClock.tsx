import { useEffect, useState } from "react";

export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className={className}>
      <div className="font-mono text-sm font-semibold tabular-nums text-ink-100">{time}</div>
      <div className="font-mono text-[9.5px] uppercase tracking-wider text-ink-500">{date} · BST</div>
    </div>
  );
}
