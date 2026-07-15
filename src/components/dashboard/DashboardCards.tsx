import { StatCard } from "./StatCard";
import { STAT_CARDS } from "../../data/mockData";
import type { StatCardDatum } from "../../types";

interface DashboardCardsProps {
  cards?: StatCardDatum[];
}

export function DashboardCards({ cards = STAT_CARDS }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard key={card.id} data={card} delay={i * 0.04} />
      ))}
    </div>
  );
}
