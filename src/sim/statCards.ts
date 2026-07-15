import type { StatCardDatum } from "../types";
import type { Severity } from "../types";

export interface StatHistories {
  [statId: string]: number[];
}

export interface StatCardInput {
  coreTempC: number;
  radiationSvH: number;
  populationAtRiskCount: number;
  sheltersOperational: number;
  sheltersTotal: number;
  responseUnitsDeployed: number;
  evacuationProgressPct: number;
  trustIndex: number;
  commsUptimePct: number;
}

const HISTORY_LENGTH = 7;

function pushHistory(prev: number[] | undefined, value: number): number[] {
  const next = [...(prev ?? Array(HISTORY_LENGTH).fill(value)), value];
  return next.slice(-HISTORY_LENGTH);
}

function delta(history: number[], current: number): number {
  const baseline = history[0] ?? current;
  return baseline === 0 ? 0 : ((current - baseline) / Math.abs(baseline)) * 100;
}

function severityForCoreTemp(c: number): Severity {
  if (c > 500) return "critical";
  if (c > 350) return "high";
  if (c > 320) return "moderate";
  return "low";
}
function severityForRadiation(v: number): Severity {
  if (v >= 100) return "critical";
  if (v >= 10) return "high";
  if (v >= 1) return "moderate";
  return "low";
}
function severityForEvac(pct: number): Severity {
  if (pct >= 90) return "low";
  if (pct >= 50) return "moderate";
  return "high";
}
function severityForTrust(pct: number): Severity {
  if (pct >= 75) return "low";
  if (pct >= 55) return "moderate";
  return "high";
}

/**
 * Formats the eight overview stat tiles from live simulation values. Pure
 * formatter — all the actual physics/dose/route/trust computation happens
 * upstream; this only shapes numbers into `StatCardDatum` + rolling trends.
 */
export function deriveStatCards(
  input: StatCardInput,
  prevHistories: StatHistories,
): { cards: StatCardDatum[]; histories: StatHistories } {
  const histories: StatHistories = {
    "core-temp": pushHistory(prevHistories["core-temp"], input.coreTempC),
    radiation: pushHistory(prevHistories.radiation, input.radiationSvH),
    population: pushHistory(prevHistories.population, input.populationAtRiskCount),
    shelters: pushHistory(prevHistories.shelters, input.sheltersOperational),
    units: pushHistory(prevHistories.units, input.responseUnitsDeployed),
    evac: pushHistory(prevHistories.evac, input.evacuationProgressPct),
    trust: pushHistory(prevHistories.trust, input.trustIndex),
    comms: pushHistory(prevHistories.comms, input.commsUptimePct),
  };

  const cards: StatCardDatum[] = [
    {
      id: "core-temp",
      label: "Reactor Core Temp",
      value: input.coreTempC.toFixed(1),
      unit: "°C",
      delta: Math.round(delta(histories["core-temp"], input.coreTempC) * 10) / 10,
      deltaLabel: "vs 10s avg",
      trend: histories["core-temp"],
      severity: severityForCoreTemp(input.coreTempC),
      icon: "Thermometer",
      footnote: "Unit 1 · Rooppur NPP",
    },
    {
      id: "radiation",
      label: "Ambient Radiation",
      value: input.radiationSvH < 10 ? input.radiationSvH.toFixed(2) : input.radiationSvH.toFixed(0),
      unit: "µSv/h",
      delta: Math.round(delta(histories.radiation, input.radiationSvH) * 10) / 10,
      deltaLabel: "vs baseline",
      trend: histories.radiation,
      severity: severityForRadiation(input.radiationSvH),
      icon: "Radiation",
      footnote: "Perimeter sensor grid · 24 nodes",
    },
    {
      id: "population",
      label: "Population at Risk",
      value: input.populationAtRiskCount.toLocaleString(),
      delta: Math.round(delta(histories.population, input.populationAtRiskCount) * 10) / 10,
      deltaLabel: "dose-zone residents",
      trend: histories.population,
      severity: input.populationAtRiskCount > 0 ? "critical" : "info",
      icon: "Users",
      footnote: "Centers with projected dose ≥ monitor",
    },
    {
      id: "shelters",
      label: "Shelters Operational",
      value: String(input.sheltersOperational),
      unit: `/ ${input.sheltersTotal}`,
      delta: Math.round(delta(histories.shelters, input.sheltersOperational) * 10) / 10,
      deltaLabel: "reachable now",
      trend: histories.shelters,
      severity: input.sheltersOperational === input.sheltersTotal ? "low" : "moderate",
      icon: "Home",
      footnote: "Reachability from live route graph",
    },
    {
      id: "units",
      label: "Response Units Deployed",
      value: String(input.responseUnitsDeployed),
      delta: Math.round(delta(histories.units, input.responseUnitsDeployed) * 10) / 10,
      deltaLabel: "since T+0",
      trend: histories.units,
      severity: "info",
      icon: "Truck",
      footnote: "Vehicles in transit across all corridors",
    },
    {
      id: "evac",
      label: "Evacuation Progress",
      value: input.evacuationProgressPct.toFixed(1),
      unit: "%",
      delta: Math.round(delta(histories.evac, input.evacuationProgressPct) * 10) / 10,
      deltaLabel: "last tick",
      trend: histories.evac,
      severity: severityForEvac(input.evacuationProgressPct),
      icon: "Route",
      footnote: "Approved-evacuation zones only",
    },
    {
      id: "trust",
      label: "Public Trust Index",
      value: String(input.trustIndex),
      unit: "/ 100",
      delta: Math.round(delta(histories.trust, input.trustIndex) * 10) / 10,
      deltaLabel: "national aggregate",
      trend: histories.trust,
      severity: severityForTrust(input.trustIndex),
      icon: "ShieldCheck",
      footnote: "National sentiment aggregate",
    },
    {
      id: "comms",
      label: "Comms Network Uptime",
      value: input.commsUptimePct.toFixed(1),
      unit: "%",
      delta: Math.round(delta(histories.comms, input.commsUptimePct) * 100) / 100,
      deltaLabel: "stable",
      trend: histories.comms,
      severity: input.commsUptimePct > 97 ? "low" : "moderate",
      icon: "RadioTower",
      footnote: "SIM + satellite fallback active",
    },
  ];

  return { cards, histories };
}
