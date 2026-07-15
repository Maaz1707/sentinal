export type Severity = "critical" | "high" | "moderate" | "low" | "info";

export type SeverityMeta = {
  label: string;
  color: string;
  glow: string;
  bg: string;
  border: string;
};

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

export interface StatCardDatum {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta: number;
  deltaLabel: string;
  trend: number[];
  severity: Severity;
  icon: string;
  footnote: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  confidence: number;
  riskScore: number;
  impact: string;
  recommended?: boolean;
}

export interface ReasoningStep {
  id: string;
  text: string;
  weight: number;
}

export type TimelineCategory = "plant" | "classification" | "decision" | "alert" | "route" | "operator" | "scenario";

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  severity: Severity;
  icon: string;
  actor: string;
  category: TimelineCategory;
}

export interface TrustRegion {
  id: string;
  name: string;
  trust: number;
  sentiment: "positive" | "neutral" | "negative";
}

export interface AlertItem {
  id: string;
  time: string;
  title: string;
  message: string;
  severity: Severity;
  channel: string;
  region: string;
  acknowledged: boolean;
}

export interface RouteDatum {
  id: string;
  name: string;
  from: string;
  to: string;
  status: "optimal" | "congested" | "blocked" | "rerouted";
  etaMinutes: number;
  capacityUsed: number;
  vehicles: number;
  distanceKm: number;
  /** Fastest-route ETA for comparison against the safest (displayed) route, when it differs. */
  fastestEtaMinutes?: number;
  /** True when the safest path diverges from the shortest path to route around plume/blockage. */
  reroutedForPlume?: boolean;
}
